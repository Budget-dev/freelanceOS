/**
 * @file apps/web/app/api/admin/auth/me/route.ts
 * @description Admin Session Identity & Permissions Verification
 *
 * Confirms that the caller has an active, authenticated admin role and
 * returns their granted permissions matrix.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, hasRole } from "@/lib/auth/admin-auth";

export async function GET(req: NextRequest) {
  const { errorResponse, adminUser } = await verifyAdminRequest(req, "support");
  if (errorResponse) return errorResponse;

  const role = adminUser!.role;

  return NextResponse.json({
    authenticated: true,
    user: adminUser,
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
}
