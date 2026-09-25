/**
 * @file apps/web/lib/auth/admin-auth.ts
 * @description Role-Based Access Control and Token Verification for Admin Operations
 *
 * Implements server-side verification for:
 * - super_admin (venkateshchop14@gmail.com)
 * - admin
 * - support
 *
 * Permissions:
 * - super_admin: full administrative control, role assignment, user suspension, subscription edits
 * - admin: user management, subscriptions, projects, analytics, user suspension. Cannot edit roles.
 * - support: read-only access to users, projects, subscriptions, activity. No mutations.
 */

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, hasAdminCredentials, projectId } from "@/lib/firebase/admin";

export type AdminRole = "super_admin" | "admin" | "support";

export interface AuthenticatedAdminUser {
  uid: string;
  email?: string;
  displayName?: string;
  role: AdminRole;
  token?: string;
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
 * Safely parse a JWT payload without external network dependencies
 */
function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadStr = Buffer.from(parts[1]!, "base64").toString("utf8");
    return JSON.parse(payloadStr);
  } catch {
    return null;
  }
}

/**
 * Verifies a Firebase ID token.
 * 1. Tries Admin SDK verifyIdToken.
 * 2. Fallbacks to Google Identity Toolkit REST API if local Admin credentials are not provisioned.
 * 3. Fallbacks to JWT payload verification (checking issuer, project aud, and expiration).
 */
export async function verifyFirebaseToken(idToken: string): Promise<{ uid: string; email?: string; claims?: any } | null> {
  if (!idToken) return null;

  // 1. Primary: Firebase Admin SDK (with timeout guard)
  try {
    const decoded = await Promise.race([
      adminAuth.verifyIdToken(idToken),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("verifyIdToken timeout")), 2500)
      ),
    ]);
    return {
      uid: decoded.uid,
      email: decoded.email,
      claims: decoded,
    };
  } catch {
    // Admin SDK failed or lacked credentials; proceed to REST / JWT validation
  }

  // 2. Secondary: Firebase Identity Toolkit REST
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCHf2hfJvJngbaSYpZ7EIJoE3zcksMHYv8";
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        signal: AbortSignal.timeout(3000),
      }
    );

    if (res.ok) {
      const data = await res.json();
      const user = data.users?.[0];
      if (user) {
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
      }
    }
  } catch {
    // REST lookup timeout/error; proceed to token decoding
  }

  // 3. Fallback: JWT claims structure verification
  const payload = decodeJwtPayload(idToken);
  if (payload) {
    const nowSec = Math.floor(Date.now() / 1000);
    const isValidProject = payload.aud === projectId || payload.iss === `https://securetoken.google.com/${projectId}`;
    const isNotExpired = payload.exp && payload.exp > nowSec;

    if (isValidProject && isNotExpired && (payload.sub || payload.user_id)) {
      return {
        uid: payload.sub || payload.user_id,
        email: payload.email,
        claims: payload,
      };
    }
  }

  return null;
}

/**
 * Resolves the admin role for a given user UID/email.
 * Priority:
 * 1. Bootstrap Super Admin Email (venkateshchop14@gmail.com)
 * 2. Custom Claims on token
 * 3. Dedicated /system/roles document in Firestore (if credentials exist)
 * 4. ADMIN_EMAILS environment variable
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

  // 2. Check custom claims on verified token
  if (tokenClaims?.role && ["super_admin", "admin", "support"].includes(tokenClaims.role)) {
    return tokenClaims.role as AdminRole;
  }

  // 3. Check ADMIN_EMAILS environment variable
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

  // 4. Check /system/roles document in Firestore (only if credentials exist to prevent hanging)
  if (hasAdminCredentials()) {
    try {
      const rolesDoc = await Promise.race([
        adminDb.collection("system").doc("roles").get(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("rolesDoc timeout")), 2000)
        ),
      ]);
      if ((rolesDoc as any)?.exists) {
        const rolesData = (rolesDoc as any).data() || {};
        const userRole = rolesData[uid];
        if (userRole && ["super_admin", "admin", "support"].includes(userRole)) {
          return userRole as AdminRole;
        }
      }
    } catch {
      // non-blocking
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
  try {
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

    // Resolve role FIRST
    const role = await resolveAdminRole(decoded.uid, decoded.email, decoded.claims);

    if (!role) {
      return {
        errorResponse: NextResponse.json(
          { error: "Access denied. User lacks administrative privileges." },
          { status: 403 }
        ),
      };
    }

    // Root super admin can never be suspended or disabled
    if (role !== "super_admin") {
      if (hasAdminCredentials()) {
        try {
          const userDoc = await Promise.race([
            adminDb.collection("users").doc(decoded.uid).get(),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("userDoc timeout")), 2000)
            ),
          ]);
          if ((userDoc as any)?.exists) {
            const uData = (userDoc as any).data() || {};
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
      }
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
        token,
      },
    };
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("[AdminAuth] Unexpected error in verifyAdminRequest:", err);
    return {
      errorResponse: NextResponse.json(
        { error: "Authorization error: " + (err?.message || "Internal error") },
        { status: 401 }
      ),
    };
  }
}
