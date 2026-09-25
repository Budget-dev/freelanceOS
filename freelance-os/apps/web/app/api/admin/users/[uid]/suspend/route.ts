/**
 * @file apps/web/app/api/admin/users/[uid]/suspend/route.ts
 * @description Secure User Account Suspension Endpoint
 *
 * Disables the user in Firebase Authentication and marks their Firestore record as suspended.
 * Requires 'admin' or 'super_admin' role. Generates an append-only audit log.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/admin-auth";
import { adminAuth, hasAdminCredentials } from "@/lib/firebase/admin";
import { getDocumentByPath, setDocumentByPath } from "@/lib/firebase/firestore-rest";
import { createAuditLog } from "@/lib/services/audit-service";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const { errorResponse, adminUser } = await verifyAdminRequest(req, "admin");
    if (errorResponse) return errorResponse;

    const { uid } = params;
    if (!uid) return NextResponse.json({ error: "Missing UID" }, { status: 400 });

    if (uid === adminUser!.uid) {
      return NextResponse.json({ error: "Administrators cannot suspend their own account." }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const reason = typeof body.reason === "string" ? body.reason : "Administrative suspension";

    // 1. Fetch user to check current state
    const userDoc = await getDocumentByPath(`users/${uid}`, adminUser?.token);
    const previousState = userDoc ? userDoc.status || "active" : "unknown";
    const targetEmail = userDoc ? userDoc.email : undefined;

    // 2. Disable in Firebase Auth if Admin SDK has credentials
    if (hasAdminCredentials()) {
      try {
        await Promise.race([
          adminAuth.updateUser(uid, { disabled: true }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000)),
        ]);
      } catch (authErr) {
        console.warn("[Suspend] Firebase Auth updateUser warning:", authErr);
      }
    }

    // 3. Update Firestore status
    const nowIso = new Date().toISOString();
    await setDocumentByPath(
      `users/${uid}`,
      {
        status: "suspended",
        disabled: true,
        suspendedAt: nowIso,
        suspendedBy: adminUser!.email || adminUser!.uid,
        suspensionReason: reason,
        updatedAt: nowIso,
      },
      adminUser?.token,
      true
    );

    // 4. Create Audit Log
    await createAuditLog({
      adminUid: adminUser!.uid,
      adminEmail: adminUser!.email,
      action: "user.suspend",
      targetUid: uid,
      targetEmail,
      previousState: { status: previousState, disabled: false },
      newState: { status: "suspended", disabled: true, reason },
      details: `Suspended account: ${reason}`,
    }, adminUser?.token);

    return NextResponse.json({
      success: true,
      message: "User successfully suspended.",
      status: "suspended",
    });
  } catch (error: any) {
    console.error("[AdminSuspend] Error suspending user:", error);
    return NextResponse.json({ error: "Failed to suspend user" }, { status: 400 });
  }
}
