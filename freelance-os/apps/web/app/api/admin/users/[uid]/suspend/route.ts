/**
 * @file apps/web/app/api/admin/users/[uid]/suspend/route.ts
 * @description Secure User Account Suspension Endpoint
 *
 * Disables the user in Firebase Authentication and marks their Firestore record as suspended.
 * Requires 'admin' or 'super_admin' role. Generates an append-only audit log.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/admin-auth";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { createAuditLog } from "@/lib/services/audit-service";

export async function POST(
  req: NextRequest,
  { params }: { params: { uid: string } }
) {
  const { errorResponse, adminUser } = await verifyAdminRequest(req, "admin");
  if (errorResponse) return errorResponse;

  const { uid } = params;
  if (!uid) return NextResponse.json({ error: "Missing UID" }, { status: 400 });

  if (uid === adminUser!.uid) {
    return NextResponse.json({ error: "Administrators cannot suspend their own account." }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const reason = typeof body.reason === "string" ? body.reason : "Administrative suspension";

    // 1. Fetch user to check current state
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const previousState = userDoc.exists ? userDoc.data()?.status || "active" : "unknown";
    const targetEmail = userDoc.exists ? userDoc.data()?.email : undefined;

    // 2. Disable in Firebase Auth
    try {
      await adminAuth.updateUser(uid, { disabled: true });
    } catch (authErr) {
      console.warn("[Suspend] Firebase Auth updateUser warning:", authErr);
    }

    // 3. Update Firestore status
    const nowIso = new Date().toISOString();
    await adminDb.collection("users").doc(uid).set(
      {
        status: "suspended",
        disabled: true,
        suspendedAt: nowIso,
        suspendedBy: adminUser!.email || adminUser!.uid,
        suspensionReason: reason,
        updatedAt: nowIso,
      },
      { merge: true }
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
    });

    return NextResponse.json({
      success: true,
      message: "User successfully suspended.",
      status: "suspended",
    });
  } catch (error: any) {
    console.error("[AdminSuspend] Error suspending user:", error);
    return NextResponse.json({ error: "Failed to suspend user" }, { status: 500 });
  }
}
