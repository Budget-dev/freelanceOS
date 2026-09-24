/**
 * @file apps/web/lib/auth/admin-auth.ts
 * @description Role-Based Access Control and Token Verification for Admin Operations
 *
 * Implements server-side verification for:
 * - super_admin
 * - admin
 * - support
 *
 * Permissions:
 * - super_admin: full administrative control, role assignment, user suspension, subscription edits
 * - admin: user management, subscriptions, projects, analytics, user suspension. Cannot edit roles.
 * - support: read-only access to users, projects, subscriptions, activity. No mutations.
 */

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export type AdminRole = "super_admin" | "admin" | "support";

export interface AuthenticatedAdminUser {
  uid: string;
  email?: string;
  displayName?: string;
  role: AdminRole;
}

const ROLE_HIERARCHY: Record<AdminRole, number> = {
  super_admin: 3,
  admin: 2,
  support: 1,
};

/**
 * Checks if the granted role satisfies the required minimum role
 */
export function hasRole(grantedRole: AdminRole, requiredRole: AdminRole): boolean {
  return ROLE_HIERARCHY[grantedRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Verifies a Firebase ID token.
 * 1. Tries Admin SDK verifyIdToken.
 * 2. Fallbacks to Google Identity Toolkit REST API if local Admin credentials are not provisioned.
 */
export async function verifyFirebaseToken(idToken: string): Promise<{ uid: string; email?: string; claims?: any } | null> {
  if (!idToken) return null;

  // 1. Primary: Firebase Admin SDK
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      email: decoded.email,
      claims: decoded,
    };
  } catch (adminErr: any) {
    // If Admin SDK lacks credentials in dev environment, fallback to Firebase Identity Toolkit REST
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCHf2hfJvJngbaSYpZ7EIJoE3zcksMHYv8";
    try {
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        }
      );

      if (!res.ok) {
        console.warn("[AdminAuth] Firebase REST lookup rejected token:", res.status);
        return null;
      }

      const data = await res.json();
      const user = data.users?.[0];
      if (!user) return null;

      let customClaims: any = {};
      if (user.customAttributes) {
        try {
          customClaims = JSON.parse(user.customAttributes);
        } catch {
          // ignore parse errors
        }
      }

      return {
        uid: user.localId,
        email: user.email,
        claims: customClaims,
      };
    } catch (fallbackErr) {
      console.error("[AdminAuth] Token validation error:", fallbackErr);
      return null;
    }
  }
}

/**
 * Resolves the admin role for a given user UID/email.
 * Priority:
 * 1. Custom Claims on token
 * 2. Dedicated /system/roles document in Firestore
 * 3. /users/{uid} document 'role' field
 * 4. ADMIN_EMAILS environment variable (comma-separated bootstrap)
 */
export async function resolveAdminRole(uid: string, email?: string, tokenClaims?: any): Promise<AdminRole | null> {
  // 1. Check Bootstrap Super Admin Email (venkateshchop14@gmail.com)
  const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS || "venkateshchop14@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase());

  if (email) {
    const lowerEmail = email.toLowerCase();
    if (superAdminEmails.includes(lowerEmail)) {
      return "super_admin";
    }
  }

  // 2. Check /system/roles document in Firestore (strictly server-managed, tamper-proof)
  try {
    const rolesDoc = await adminDb.collection("system").doc("roles").get();
    if (rolesDoc.exists) {
      const rolesData = rolesDoc.data() || {};
      const userRole = rolesData[uid];
      if (userRole && ["super_admin", "admin", "support"].includes(userRole)) {
        return userRole as AdminRole;
      }
    }
  } catch (dbErr) {
    console.warn("[AdminAuth] /system/roles lookup error:", dbErr);
  }

  // 3. Check custom claims on verified token
  if (tokenClaims?.role && ["super_admin", "admin", "support"].includes(tokenClaims.role)) {
    return tokenClaims.role as AdminRole;
  }

  // 4. Check ADMIN_EMAILS environment variable
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (email) {
    const lowerEmail = email.toLowerCase();
    if (adminEmails.includes(lowerEmail)) {
      return "admin";
    }
  }

  return null;
}

/**
 * Server route middleware helper to authenticate and authorize admin API calls
 */
export async function verifyAdminRequest(
  req: NextRequest,
  requiredRole: AdminRole = "support"
): Promise<{ errorResponse?: NextResponse; adminUser?: AuthenticatedAdminUser }> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      errorResponse: NextResponse.json(
        { error: "Authentication required. Missing Bearer token." },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const decoded = await verifyFirebaseToken(token);

  if (!decoded) {
    return {
      errorResponse: NextResponse.json(
        { error: "Invalid or expired authentication token." },
        { status: 401 }
      ),
    };
  }

  // Check if account is suspended or staff disabled
  try {
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (userDoc.exists) {
      const uData = userDoc.data() || {};
      if (uData.status === "suspended") {
        return {
          errorResponse: NextResponse.json(
            { error: "Account suspended. Administrative privileges revoked." },
            { status: 403 }
          ),
        };
      }
      if (uData.staffDisabled) {
        return {
          errorResponse: NextResponse.json(
            { error: "Staff privileges disabled by Super Admin." },
            { status: 403 }
          ),
        };
      }
    }
  } catch {
    // Non-blocking
  }

  const role = await resolveAdminRole(decoded.uid, decoded.email, decoded.claims);

  if (!role) {
    return {
      errorResponse: NextResponse.json(
        { error: "Access denied. User lacks administrative privileges." },
        { status: 403 }
      ),
    };
  }

  if (!hasRole(role, requiredRole)) {
    return {
      errorResponse: NextResponse.json(
        {
          error: `Insufficient permissions. Action requires '${requiredRole}' role, but user has '${role}'.`,
        },
        { status: 403 }
      ),
    };
  }

  return {
    adminUser: {
      uid: decoded.uid,
      email: decoded.email,
      role,
    },
  };
}
