/**
 * @file apps/web/app/api/admin/activity/route.ts
 * @description Real-Time & Recent User Activity Monitoring API
 *
 * Inspects heartbeat intervals to provide transparent activity reporting:
 * - Active in last 5 minutes
 * - Active in last 15 minutes
 * - Active today
 * - Current active sessions & routes
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/admin-auth";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
  const { errorResponse } = await verifyAdminRequest(req, "support");
  if (errorResponse) return errorResponse;

  const now = new Date();
  const fiveMinAgo = now.getTime() - 5 * 60 * 1000;
  const fifteenMinAgo = now.getTime() - 15 * 60 * 1000;
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  try {
    const usersSnap = await adminDb.collection("users").get();
    const active5m: any[] = [];
    const active15m: any[] = [];
    const activeToday: any[] = [];

    const routeDistribution: Record<string, number> = {};

    for (const doc of usersSnap.docs) {
      const u = doc.data();
      const lastActiveTime = u.lastActiveTimestamp || (u.lastSeenAt ? new Date(u.lastSeenAt).getTime() : 0);
      const lastLoginTime = u.lastLoginAt ? new Date(u.lastLoginAt).getTime() : 0;
      const latestTime = Math.max(lastActiveTime, lastLoginTime);

      const userSummary = {
        uid: doc.id,
        name: u.displayName || "Freelancer",
        email: u.email || "",
        lastSeenAt: u.lastSeenAt || u.lastLoginAt,
        currentRoute: u.currentRoute || "/dashboard",
        status: u.status || "active",
      };

      if (latestTime >= fiveMinAgo) {
        active5m.push(userSummary);
      }
      if (latestTime >= fifteenMinAgo) {
        active15m.push(userSummary);
      }
      if (latestTime >= todayStart) {
        activeToday.push(userSummary);
      }

      if (u.currentRoute && latestTime >= fifteenMinAgo) {
        routeDistribution[u.currentRoute] = (routeDistribution[u.currentRoute] || 0) + 1;
      }
    }

    return NextResponse.json({
      summary: {
        activeLast5m: active5m.length,
        activeLast15m: active15m.length,
        activeToday: activeToday.length,
        totalTracked: usersSnap.size,
      },
      activeUsers5m: active5m,
      activeUsers15m: active15m,
      routeDistribution,
      presenceType: "heartbeat_polling",
      note: "Metrics are computed from periodic workspace heartbeats (throttled every 2m). Not a raw TCP connection count.",
    });
  } catch (error: any) {
    console.error("[AdminActivity] Error fetching activity:", error);
    return NextResponse.json({ error: "Failed to fetch activity metrics" }, { status: 500 });
  }
}
