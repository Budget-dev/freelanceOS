/**
 * @file apps/web/app/api/admin/users/[uid]/restore/route.ts
 * @description Secure User Account Restoration Endpoint
 *
 * Re-enables the user in Firebase Authentication and restores active status in Firestore.
 * Requires 'admin' or 'super_admin' role. Generates an append-only audit log.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/admin-auth";
import { adminAuth, hasAdminCredentials } from "@/lib/firebase/admin";
import { getDocumentByPath, setDocumentByPath } from "@/lib/firebase/firestore-rest";
import { createAuditLog } from "@/lib/services/audit-service";

export async function POST(
  req: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const { errorResponse, adminUser } = await verifyAdminRequest(req, "admin");
    if (errorResponse) return errorResponse;

    const { uid } = params;
    if (!uid) return NextResponse.json({ error: "Missing UID" }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const reason = typeof body.reason === "string" ? body.reason : "Administrative restoration";

    // 1. Fetch user to check current state
    const userDoc = await getDocumentByPath(`users/${uid}`, adminUser?.token);
    const previousState = userDoc ? userDoc.status || "suspended" : "unknown";
    const targetEmail = userDoc ? userDoc.email : undefined;

    // 2. Re-enable in Firebase Auth if Admin SDK configured
    if (hasAdminCredentials()) {
      try {
        await Promise.race([
          adminAuth.updateUser(uid, { disabled: false }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000)),
        ]);
      } catch (authErr) {
        console.warn("[Restore] Firebase Auth updateUser warning:", authErr);
      }
    }

    // 3. Update Firestore status
    const nowIso = new Date().toISOString();
    await setDocumentByPath(
      `users/${uid}`,
      {
        status: "active",
        disabled: false,
        restoredAt: nowIso,
        restoredBy: adminUser!.email || adminUser!.uid,
        restorationReason: reason,
        updatedAt: nowIso,
      },
      adminUser?.token,
      true
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
    }, adminUser?.token);

    return NextResponse.json({
      success: true,
      message: "User successfully restored.",
      status: "active",
    });
  } catch (error: any) {
    console.error("[AdminRestore] Error restoring user:", error);
    return NextResponse.json({ error: "Failed to restore user" }, { status: 400 });
  }
}
