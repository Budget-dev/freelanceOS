/**
 * @file apps/web/app/api/admin/users/[uid]/restore/route.ts
 * @description Secure User Account Restoration Endpoint
 *
 * Re-enables the user in Firebase Authentication and restores active status in Firestore.
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

  try {
    const body = await req.json().catch(() => ({}));
    const reason = typeof body.reason === "string" ? body.reason : "Administrative restoration";

    // 1. Fetch user to check current state
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const previousState = userDoc.exists ? userDoc.data()?.status || "suspended" : "unknown";
    const targetEmail = userDoc.exists ? userDoc.data()?.email : undefined;

    // 2. Re-enable in Firebase Auth
    try {
      await adminAuth.updateUser(uid, { disabled: false });
    } catch (authErr) {
      console.warn("[Restore] Firebase Auth updateUser warning:", authErr);
    }

    // 3. Update Firestore status
    const nowIso = new Date().toISOString();
    await adminDb.collection("users").doc(uid).set(
      {
        status: "active",
        disabled: false,
        restoredAt: nowIso,
        restoredBy: adminUser!.email || adminUser!.uid,
        restorationReason: reason,
        updatedAt: nowIso,
      },
      { merge: true }
    );

    // 4. Create Audit Log
    await createAuditLog({
      adminUid: adminUser!.uid,
      adminEmail: adminUser!.email,
      action: "user.restore",
      targetUid: uid,
      targetEmail,
      previousState: { status: previousState, disabled: true },
      newState: { status: "active", disabled: false, reason },
      details: `Restored account: ${reason}`,
    });

    return NextResponse.json({
      success: true,
      message: "User successfully restored.",
      status: "active",
    });
  } catch (error: any) {
    console.error("[AdminRestore] Error restoring user:", error);
    return NextResponse.json({ error: "Failed to restore user" }, { status: 500 });
  }
}
