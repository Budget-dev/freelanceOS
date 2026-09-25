/**
 * @file apps/web/app/api/admin/stats/route.ts
 * @description Platform-Wide Admin Overview Metrics & Trends
 *
 * Aggregates actual operational data from Firestore:
 * - User counts & registration rates
 * - Recent presence (5m / 15m)
 * - Project pipeline counts & conversion rate
 * - Subscription distribution
 * - AI usage telemetry
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/admin-auth";
import { getCollectionDocs, getDocumentByPath } from "@/lib/firebase/firestore-rest";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse, adminUser } = await verifyAdminRequest(req, "support");
    if (errorResponse) return errorResponse;

    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "30d";

    const now = new Date();
    const fiveMinAgo = now.getTime() - 5 * 60 * 1000;
    const fifteenMinAgo = now.getTime() - 15 * 60 * 1000;
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

    // 1. Fetch Users
    const users = await getCollectionDocs("users", adminUser?.token);

    let totalUsers = users.length;
    let newUsersToday = 0;
    let newUsersWeek = 0;
    let newUsersMonth = 0;
    let activeUsers = 0;
    let activeLast5m = 0;
    let activeLast15m = 0;
    let suspendedUsers = 0;

    const subscriptionDist: Record<string, number> = {
      starter: 0,
      pro: 0,
      agency: 0,
      lifetime: 0,
      other: 0,
    };

    let activeSubscriptions = 0;
    let expiredSubscriptions = 0;

    for (const u of users as any[]) {
      const createdTime = u.createdAt ? new Date(u.createdAt).getTime() : 0;
      const lastLoginTime = u.lastLoginAt ? new Date(u.lastLoginAt).getTime() : 0;
      const lastActiveTime = u.lastActiveTimestamp || (u.lastSeenAt ? new Date(u.lastSeenAt).getTime() : 0);

      if (createdTime >= todayStart) newUsersToday++;
      if (createdTime >= sevenDaysAgo) newUsersWeek++;
      if (createdTime >= thirtyDaysAgo) newUsersMonth++;

      if (lastActiveTime >= thirtyDaysAgo || lastLoginTime >= thirtyDaysAgo) {
        activeUsers++;
      }

      if (lastActiveTime >= fiveMinAgo) {
        activeLast5m++;
      }
      if (lastActiveTime >= fifteenMinAgo) {
        activeLast15m++;
      }

      if (u.status === "suspended") {
        suspendedUsers++;
      }

      // Check user subscription info
      const sub = u.subscription;
      const plan = (sub?.planId || "starter").toLowerCase();
      if (subscriptionDist[plan] !== undefined) {
        subscriptionDist[plan]++;
      } else {
        subscriptionDist.other++;
      }

      if (sub?.status === "active" || sub?.status === "lifetime") {
        activeSubscriptions++;
      } else if (sub?.status === "expired") {
        expiredSubscriptions++;
      }
    }

    // 2. Aggregate Projects / Applications across users
    let totalProjects = 0;
    let hiredProjects = 0;
    let totalPipelineValue = 0;
    const stageDistribution: Record<string, number> = {
      new: 0,
      applied: 0,
      client_replied: 0,
      hired: 0,
      rejected: 0,
    };

    for (const u of users.slice(0, 50)) {
      try {
        const appData = await getDocumentByPath(`users/${u.id}/applications/data`, adminUser?.token);
        if (appData && Array.isArray(appData.items)) {
          for (const item of appData.items) {
            totalProjects++;
            const stage = item.stage || "new";
            stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;
            if (stage === "hired") hiredProjects++;

            if (item.value) {
              const numeric = parseFloat(String(item.value).replace(/[^0-9.]/g, ""));
              if (!isNaN(numeric)) totalPipelineValue += numeric;
            }
          }
        }
      } catch {
        // subcollection query fallback
      }
    }

    const conversionRate = totalProjects > 0 ? Math.round((hiredProjects / totalProjects) * 1000) / 10 : 0;

    // 3. AI Telemetry Usage
    let aiTotalAnalyses = 0;
    const aiProviderDist: Record<string, number> = { gemini: 0, openai: 0, anthropic: 0 };
    try {
      const events = await getCollectionDocs("telemetry_events", adminUser?.token);
      for (const ev of events) {
        if (ev.eventType === "analysis_completed" || ev.provider) {
          aiTotalAnalyses++;
          const prov = ev.metadata?.provider || ev.provider;
          if (prov && aiProviderDist[prov] !== undefined) {
            aiProviderDist[prov]++;
          }
        }
      }
    } catch {
      // Telemetry non-blocking
    }

    // 4. Time series growth trend
    const daysCount = range === "7d" ? 7 : range === "90d" ? 90 : range === "today" ? 1 : 30;
    const trends: { date: string; users: number; projects: number }[] = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().slice(0, 10);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      const usersOnDay = users.filter((u: any) => {
        const t = u.createdAt ? new Date(u.createdAt).getTime() : 0;
        return t >= dayStart && t < dayEnd;
      }).length;

      trends.push({
        date: dateStr,
        users: usersOnDay,
        projects: 0,
      });
    }

    return NextResponse.json({
      summary: {
        totalUsers,
        newUsersToday,
        newUsersWeek,
        newUsersMonth,
        activeUsers,
        activeLast5m,
        activeLast15m,
        suspendedUsers,
        totalProjects,
        hiredProjects,
        conversionRate,
        totalPipelineValue,
        activeSubscriptions,
        expiredSubscriptions,
        aiTotalAnalyses,
      },
      subscriptionDist,
      stageDistribution,
      aiProviderDist,
      trends,
      paymentDataAvailable: false,
      notice: "Subscription management is administrative. No payment gateway integrated yet.",
    });
  } catch (error: any) {
    console.error("[AdminStats] Error generating stats:", error);
    return NextResponse.json({
      summary: {
        totalUsers: 0,
        newUsersToday: 0,
        newUsersWeek: 0,
        newUsersMonth: 0,
        activeUsers: 0,
        activeLast5m: 0,
        activeLast15m: 0,
        suspendedUsers: 0,
        totalProjects: 0,
        hiredProjects: 0,
        conversionRate: 0,
        totalPipelineValue: 0,
        activeSubscriptions: 0,
        expiredSubscriptions: 0,
        aiTotalAnalyses: 0,
      },
      subscriptionDist: { starter: 0, pro: 0, agency: 0, lifetime: 0, other: 0 },
      stageDistribution: { new: 0, applied: 0, client_replied: 0, hired: 0, rejected: 0 },
      aiProviderDist: { gemini: 0, openai: 0, anthropic: 0 },
      trends: [],
      paymentDataAvailable: false,
      notice: "Database statistics unavailable or initializing.",
    });
  }
}
