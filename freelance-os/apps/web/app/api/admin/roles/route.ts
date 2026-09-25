/**
 * @file apps/web/app/api/admin/roles/route.ts
 * @description Super Admin Role & Staff Management API
 *
 * Exclusively accessible to the Super Admin (venkateshchop14@gmail.com).
 * Manages staff roles (Admin, Support), status, and staff directory.
 * Disallows creating additional Super Admins via the UI.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, AdminRole } from "@/lib/auth/admin-auth";
import { adminAuth, hasAdminCredentials } from "@/lib/firebase/admin";
import { getDocumentByPath, getCollectionDocs, setDocumentByPath } from "@/lib/firebase/firestore-rest";
import { createAuditLog } from "@/lib/services/audit-service";

const BOOTSTRAP_SUPER_ADMIN = "venkateshchop14@gmail.com";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse, adminUser } = await verifyAdminRequest(req, "super_admin");
    if (errorResponse) return errorResponse;

    const rolesDoc = await getDocumentByPath("system/roles", adminUser?.token);
    const rolesData = rolesDoc || {};

    const users = await getCollectionDocs("users", adminUser?.token);

    let bootstrapUser = users.find(
      (u) => (u.email || "").toLowerCase() === BOOTSTRAP_SUPER_ADMIN
    );

    const allAdminUids = new Set<string>([
      ...Object.keys(rolesData).filter((k) => k !== "id"),
      ...users
        .filter((u) => ["super_admin", "admin", "support"].includes(u.role))
        .map((u) => u.id),
    ]);

    if (bootstrapUser) {
      allAdminUids.add(bootstrapUser.id);
    } else if (adminUser?.uid) {
      allAdminUids.add(adminUser.uid);
    }

    const staffRoster: any[] = [];

    for (const uid of Array.from(allAdminUids)) {
      const uData = users.find((u) => u.id === uid) || {};

      const isBootstrapSuperAdmin =
        (uData.email || "").toLowerCase() === BOOTSTRAP_SUPER_ADMIN ||
        uid === adminUser?.uid;
      const assignedRole = isBootstrapSuperAdmin
        ? "super_admin"
        : rolesData[uid] || uData.role || "support";

      staffRoster.push({
        uid,
        name: uData.displayName || (isBootstrapSuperAdmin ? "Super Admin" : "Staff Member"),
        email: uData.email || (isBootstrapSuperAdmin ? BOOTSTRAP_SUPER_ADMIN : ""),
        role: assignedRole,
        status: uData.status === "suspended" || uData.staffDisabled ? "disabled" : "active",
        assignedAt: uData.roleUpdatedAt || uData.createdAt || new Date().toISOString(),
        assignedBy: uData.roleUpdatedBy || (isBootstrapSuperAdmin ? "System Bootstrap" : "Super Admin"),
        lastLogin: uData.lastLoginAt || null,
        lastActive: uData.lastSeenAt || uData.lastLoginAt || null,
        isBootstrapOwner: isBootstrapSuperAdmin,
      });
    }

    return NextResponse.json({ admins: staffRoster });
  } catch (error: any) {
    console.error("[AdminRoles] Error fetching admin roster:", error);
    return NextResponse.json({ admins: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse, adminUser } = await verifyAdminRequest(req, "super_admin");
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { targetUid, role, action: explicitAction, notes } = body;

    if (!targetUid) {
      return NextResponse.json({ error: "Missing required parameter: targetUid" }, { status: 400 });
    }

    // Fetch target user record
    const targetDoc = await getDocumentByPath(`users/${targetUid}`, adminUser?.token);
    if (!targetDoc) {
      return NextResponse.json({ error: "User not found in database." }, { status: 404 });
    }

    const targetData = targetDoc || {};
    const targetEmail = (targetData.email || "").toLowerCase();

    // Prevent modifying the primary bootstrap super admin owner
    if (targetEmail === BOOTSTRAP_SUPER_ADMIN && targetUid !== adminUser!.uid) {
      return NextResponse.json(
        { error: "The primary Super Admin owner cannot be modified or demoted." },
        { status: 403 }
      );
    }

    const previousRole = targetData.role || "user";
    const nowIso = new Date().toISOString();

    // Handle staff disabling/restoring
    if (explicitAction === "disable_staff" || explicitAction === "restore_staff") {
      const isDisable = explicitAction === "disable_staff";
      await setDocumentByPath(
        `users/${targetUid}`,
        {
          staffDisabled: isDisable,
          updatedAt: nowIso,
        },
        adminUser?.token,
        true
      );

      // Audit log
      await createAuditLog({
        adminUid: adminUser!.uid,
        adminEmail: adminUser!.email,
        action: isDisable ? ("user.suspend" as any) : ("user.restore" as any),
        targetUid,
        targetEmail,
        previousState: { staffDisabled: !isDisable },
        newState: { staffDisabled: isDisable },
        details: `${isDisable ? "Disabled" : "Restored"} staff permissions for ${targetEmail}. Notes: ${notes || "None"}`,
      });

      return NextResponse.json({
        success: true,
        message: `Staff access successfully ${isDisable ? "disabled" : "restored"}.`,
      });
    }

    // Role assignment logic
    if (!role) {
      return NextResponse.json({ error: "Missing required field: role" }, { status: 400 });
    }

    // STRICT INVARIANT: Do NOT allow creation of another Super Admin through the normal UI
    if (role === "super_admin") {
      return NextResponse.json(
        { error: "Creation of additional Super Admin accounts through the UI is restricted to server bootstrap." },
        { status: 400 }
      );
    }

    const validRoles = ["admin", "support", "user"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // Prevent demoting self
    if (targetUid === adminUser!.uid) {
      return NextResponse.json({ error: "Super Admin cannot demote their own account." }, { status: 400 });
    }

    // 1. Update Firestore /system/roles registry
    const currentRoles = (await getDocumentByPath("system/roles", adminUser?.token)) || {};
    if (role === "user") {
      delete currentRoles[targetUid];
    } else {
      currentRoles[targetUid] = role;
    }
    delete currentRoles.id;
    await setDocumentByPath("system/roles", currentRoles, adminUser?.token, false);

    // 2. Update user document
    await setDocumentByPath(
      `users/${targetUid}`,
      {
        role: role === "user" ? "user" : (role as AdminRole),
        roleUpdatedAt: nowIso,
        roleUpdatedBy: adminUser!.email || adminUser!.uid,
        staffDisabled: false,
      },
      adminUser?.token,
      true
    );

    // 3. Update Firebase Custom Claims if Admin SDK is configured
    if (hasAdminCredentials()) {
      try {
        await adminAuth.setCustomUserClaims(targetUid, { role: role === "user" ? null : role });
      } catch (claimErr) {
        console.warn("[AdminRoles] Custom claim assignment notice:", claimErr);
      }
    }

    // 4. Create Audit Log
    const auditAction = role === "user" ? "staff.remove" : previousRole === "user" ? "staff.add" : "staff.role.change";
    await createAuditLog({
      adminUid: adminUser!.uid,
      adminEmail: adminUser!.email,
      action: auditAction as any,
      targetUid,
      targetEmail,
      previousState: { role: previousRole },
      newState: { role },
      details: `Role changed from '${previousRole}' to '${role}' for ${targetEmail}. Notes: ${notes || "None"}`,
    });

    return NextResponse.json({
      success: true,
      message: `Staff role successfully updated to ${role}.`,
    });
  } catch (error: any) {
    console.error("[AdminRoles] Error updating staff role:", error);
    return NextResponse.json({ error: "Failed to update staff role" }, { status: 400 });
  }
}
