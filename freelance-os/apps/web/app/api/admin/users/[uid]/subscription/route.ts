/**
 * @file apps/web/app/api/admin/users/[uid]/subscription/route.ts
 * @description Manual Subscription Management Endpoint
 *
 * Provides administrative controls:
 * - Assign plan
 * - Extend expiration date
 * - Cancel subscription
 * - Restore active status
 * - Grant lifetime access
 * - Update admin notes
 *
 * Enforces audit logging for every mutation.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/admin-auth";
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

    const body = await req.json();
    const action = body.action as "assign" | "extend" | "cancel" | "restore" | "lifetime" | "update_notes";

    if (!action) {
      return NextResponse.json({ error: "Missing action parameter" }, { status: 400 });
    }

    // 1. Get user and current subscription
    const userData = (await getDocumentByPath(`users/${uid}`, adminUser?.token)) || {};
    const previousSub = userData.subscription || {
      planId: "starter",
      planName: "Starter Plan",
      status: "active",
      expiresAt: null,
    };

    const now = new Date();
    const nowIso = now.toISOString();
    let updatedSub = { ...previousSub };

    switch (action) {
      case "assign": {
        const { planId, planName, durationDays, notes } = body;
        if (!planId) return NextResponse.json({ error: "Missing planId" }, { status: 400 });

        let expiresAt: string | null = null;
        if (durationDays && durationDays > 0) {
          const expDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
          expiresAt = expDate.toISOString();
        }

        updatedSub = {
          planId: planId.toLowerCase(),
          planName: planName || (planId.charAt(0).toUpperCase() + planId.slice(1)),
          status: "active",
          startedAt: nowIso,
          expiresAt,
          assignedAt: nowIso,
          assignedBy: adminUser!.email || adminUser!.uid,
          billingType: "manual",
          notes: notes || `Assigned by ${adminUser!.email || "admin"}`,
          updatedAt: nowIso,
        };
        break;
      }

      case "extend": {
        const days = parseInt(body.days || "30", 10);
        let baseDate = now;
        if (previousSub.expiresAt) {
          const currentExp = new Date(previousSub.expiresAt);
          if (currentExp.getTime() > now.getTime()) {
            baseDate = currentExp;
          }
        }
        const newExpDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

        updatedSub = {
          ...previousSub,
          status: "active",
          expiresAt: newExpDate.toISOString(),
          updatedAt: nowIso,
          notes: `${previousSub.notes || ""}; Extended +${days}d by ${adminUser!.email || "admin"}`.trim(),
        };
        break;
      }

      case "cancel": {
        updatedSub = {
          ...previousSub,
          status: "cancelled",
          cancelledAt: nowIso,
          cancelledBy: adminUser!.email || adminUser!.uid,
          updatedAt: nowIso,
        };
        break;
      }

      case "restore": {
        updatedSub = {
          ...previousSub,
          status: "active",
          restoredAt: nowIso,
          restoredBy: adminUser!.email || adminUser!.uid,
          updatedAt: nowIso,
        };
        break;
      }

      case "lifetime": {
        updatedSub = {
          ...previousSub,
          planId: "lifetime",
          planName: "Founder Lifetime Access",
          status: "lifetime",
          expiresAt: null,
          assignedAt: nowIso,
          assignedBy: adminUser!.email || adminUser!.uid,
          billingType: "manual",
          notes: body.notes || `Lifetime granted by ${adminUser!.email || "admin"}`,
          updatedAt: nowIso,
        };
        break;
      }

      case "update_notes": {
        updatedSub = {
          ...previousSub,
          notes: body.notes || "",
          updatedAt: nowIso,
        };
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // 2. Persist to Firestore
    await setDocumentByPath(
      `users/${uid}`,
      {
        subscription: updatedSub,
        updatedAt: nowIso,
      },
      adminUser?.token,
      true
    );

    await setDocumentByPath(
      `users/${uid}/subscription/current`,
      updatedSub,
      adminUser?.token,
      true
    );

    // 3. Create Audit Log
    await createAuditLog({
      adminUid: adminUser!.uid,
      adminEmail: adminUser!.email,
      action: `subscription.${action}` as any,
      targetUid: uid,
      targetEmail: userData.email,
      previousState: previousSub,
      newState: updatedSub,
      details: `Subscription action: ${action} on user ${uid}`,
    }, adminUser?.token);

    return NextResponse.json({
      success: true,
      subscription: updatedSub,
    });
  } catch (error: any) {
    console.error("[AdminSubscription] Error modifying subscription:", error);
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 400 });
  }
}
