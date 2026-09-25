/**
 * @file apps/web/app/api/admin/subscriptions/route.ts
 * @description Administrative Subscription Portfolio Overview API
 *
 * Aggregates all user subscriptions across the platform:
 * - Active, expiring soon, expired, cancelled, lifetime
 * - Plan distribution
 * - Filterable subscription roster
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/admin-auth";
import { getCollectionDocs } from "@/lib/firebase/firestore-rest";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse, adminUser } = await verifyAdminRequest(req, "support");
    if (errorResponse) return errorResponse;

    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status") || "all";
    const planFilter = url.searchParams.get("plan") || "all";

    const users = await getCollectionDocs("users", adminUser?.token);
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).getTime();

    let activeCount = 0;
    let expiringSoonCount = 0;
    let expiredCount = 0;
    let cancelledCount = 0;
    let lifetimeCount = 0;

    const planCounts: Record<string, number> = {
      starter: 0,
      pro: 0,
      agency: 0,
      lifetime: 0,
      other: 0,
    };

    const subscriptions: any[] = [];

    for (const data of users) {
      const sub = data.subscription || {
        planId: "starter",
        planName: "Starter Plan",
        status: "active",
        expiresAt: null,
        startedAt: data.createdAt || new Date().toISOString(),
        assignedBy: "system",
      };

      const planKey = (sub.planId || "starter").toLowerCase();
      if (planCounts[planKey] !== undefined) {
        planCounts[planKey]++;
      } else {
        planCounts.other++;
      }

      const expTime = sub.expiresAt ? new Date(sub.expiresAt).getTime() : null;
      let effectiveStatus = sub.status || "active";

      if (effectiveStatus === "lifetime") {
        lifetimeCount++;
      } else if (effectiveStatus === "cancelled") {
        cancelledCount++;
      } else if (expTime && expTime < now.getTime()) {
        effectiveStatus = "expired";
        expiredCount++;
      } else {
        activeCount++;
        if (expTime && expTime <= in7Days && expTime > now.getTime()) {
          expiringSoonCount++;
        }
      }

      subscriptions.push({
        uid: data.id,
        userName: data.displayName || "Freelancer",
        userEmail: data.email || "",
        planId: sub.planId || "starter",
        planName: sub.planName || "Starter Plan",
        status: effectiveStatus,
        startedAt: sub.startedAt || data.createdAt,
        expiresAt: sub.expiresAt || null,
        assignedBy: sub.assignedBy || "system",
        assignedAt: sub.assignedAt || null,
        notes: sub.notes || "",
      });
    }

    let filtered = subscriptions;
    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }
    if (planFilter !== "all") {
      filtered = filtered.filter((s) => s.planId.toLowerCase() === planFilter.toLowerCase());
    }

    return NextResponse.json({
      summary: {
        active: activeCount,
        expiringSoon: expiringSoonCount,
        expired: expiredCount,
        cancelled: cancelledCount,
        lifetime: lifetimeCount,
        totalTracked: subscriptions.length,
      },
      planCounts,
      subscriptions: filtered,
    });
  } catch (error: any) {
    console.error("[AdminSubscriptions] Error fetching subscriptions:", error);
    return NextResponse.json({
      summary: {
        active: 0,
        expiringSoon: 0,
        expired: 0,
        cancelled: 0,
        lifetime: 0,
        totalTracked: 0,
      },
      planCounts: { starter: 0, pro: 0, agency: 0, lifetime: 0, other: 0 },
      subscriptions: [],
    });
  }
}
