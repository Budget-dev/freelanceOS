/**
 * @file apps/web/app/api/admin/analytics/route.ts
 * @description Safe Operational Platform Analytics API
 *
 * Computes engagement, conversion funnels, AI provider distributions,
 * and feature usage from actual database and telemetry records.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/admin-auth";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
  const { errorResponse } = await verifyAdminRequest(req, "support");
  if (errorResponse) return errorResponse;

  const now = new Date();
  const oneDayAgo = now.getTime() - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

  try {
    const usersSnap = await adminDb.collection("users").get();
    let dau = 0;
    let wau = 0;
    let mau = 0;

    let funnelTotal = 0;
    let funnelApplied = 0;
    let funnelReplied = 0;
    let funnelHired = 0;
    let funnelRejected = 0;

    for (const doc of usersSnap.docs) {
      const u = doc.data();
      const lastActive = u.lastActiveTimestamp || (u.lastSeenAt ? new Date(u.lastSeenAt).getTime() : 0);
      const lastLogin = u.lastLoginAt ? new Date(u.lastLoginAt).getTime() : 0;
      const latestTime = Math.max(lastActive, lastLogin);

      if (latestTime >= oneDayAgo) dau++;
      if (latestTime >= sevenDaysAgo) wau++;
      if (latestTime >= thirtyDaysAgo) mau++;

      // Aggregate application funnel
      try {
        const appDoc = await adminDb.collection("users").doc(doc.id).collection("applications").doc("data").get();
        if (appDoc.exists) {
          const items = appDoc.data()?.items || [];
          for (const item of items) {
            funnelTotal++;
            const st = item.stage;
            if (st === "applied" || st === "client_replied" || st === "hired") {
              funnelApplied++;
            }
            if (st === "client_replied" || st === "hired") {
              funnelReplied++;
            }
            if (st === "hired") {
              funnelHired++;
            }
            if (st === "rejected") {
              funnelRejected++;
            }
          }
        }
      } catch {
        // fallback
      }
    }

    // AI telemetry breakdown
    const aiProviders: Record<string, number> = { gemini: 0, openai: 0, anthropic: 0 };
    const featureUsage: Record<string, number> = {
      analysis_studio: 0,
      applications_tracker: funnelTotal,
      portfolio: 0,
      profile: 0,
    };

    try {
      const eventsSnap = await adminDb.collection("telemetry_events").limit(300).get();
      for (const e of eventsSnap.docs) {
        const data = e.data();
        if (data.metadata?.provider && aiProviders[data.metadata.provider] !== undefined) {
          aiProviders[data.metadata.provider]++;
        }
        if (data.metadata?.feature && featureUsage[data.metadata.feature] !== undefined) {
          featureUsage[data.metadata.feature]++;
        }
        if (data.eventType === "analysis_completed") {
          featureUsage.analysis_studio++;
        }
      }
    } catch {
      // fallback
    }

    // Funnel conversion percentages
    const appliedRate = funnelTotal > 0 ? Math.round((funnelApplied / funnelTotal) * 100) : 0;
    const repliedRate = funnelApplied > 0 ? Math.round((funnelReplied / funnelApplied) * 100) : 0;
    const hiredRate = funnelReplied > 0 ? Math.round((funnelHired / funnelReplied) * 100) : 0;
    const overallWinRate = funnelTotal > 0 ? Math.round((funnelHired / funnelTotal) * 1000) / 10 : 0;

    return NextResponse.json({
      activity: {
        dau,
        wau,
        mau,
        totalUsers: usersSnap.size,
      },
      funnel: {
        total: funnelTotal,
        applied: funnelApplied,
        replied: funnelReplied,
        hired: funnelHired,
        rejected: funnelRejected,
        appliedRate,
        repliedRate,
        hiredRate,
        overallWinRate,
      },
      aiTelemetry: aiProviders,
      featureUsage,
      notes: "Telemetry reflects real user events. Historical DAU before telemetry deployment is approximated from lastLoginAt.",
    });
  } catch (error: any) {
    console.error("[AdminAnalytics] Error generating analytics:", error);
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 });
  }
}
