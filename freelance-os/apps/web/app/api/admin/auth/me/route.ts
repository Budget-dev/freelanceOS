/**
 * @file apps/web/app/api/admin/auth/me/route.ts
 * @description Admin Session Identity & Permissions Verification
 *
 * Confirms that the caller has an active, authenticated admin role and
 * returns their granted permissions matrix.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, hasRole } from "@/lib/auth/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse, adminUser } = await verifyAdminRequest(req, "support");
    if (errorResponse) return errorResponse;

    const role = adminUser!.role;

    return NextResponse.json({
      authenticated: true,
      user: {
        uid: adminUser!.uid,
        email: adminUser!.email,
        role,
      },
      permissions: {
        role,
        isSuperAdmin: role === "super_admin",
        isAdmin: hasRole(role, "admin"),
        isSupport: true,
        canManageUsers: hasRole(role, "admin"),
        canSuspendUsers: hasRole(role, "admin"),
        canManageSubscriptions: hasRole(role, "admin"),
        canManagePlans: role === "super_admin",
        canManageRoles: role === "super_admin",
        canViewAnalytics: true,
        canViewAuditLogs: true,
      },
    });
  } catch (err: any) {
    console.error("[AdminAuthMe] Error verifying admin:", err);
    return NextResponse.json(
      { error: "Admin verification failed: " + (err?.message || "Internal error") },
      { status: 401 }
    );
  }
}
