/**
 * @file apps/web/app/api/admin/users/[uid]/route.ts
 * @description Operational User Details Profile API
 *
 * Provides a comprehensive view of an individual user:
 * - Account identity and status
 * - Profile details (job title, location, skills, rate)
 * - Subscription details & history
 * - Project performance and pipeline metrics
 * - AI telemetry (configured status only, zero raw keys)
 * - Activity logs
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/admin-auth";
import { adminDb } from "@/lib/firebase/admin";
import { isValidKeyFormat } from "@/lib/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: { uid: string } }
) {
  const { errorResponse } = await verifyAdminRequest(req, "support");
  if (errorResponse) return errorResponse;

  const { uid } = params;
  if (!uid) {
    return NextResponse.json({ error: "Missing UID" }, { status: 400 });
  }

  try {
    // 1. Account info
    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userData = userDoc.data() || {};

    // 2. Personal profile info
    let profileData: any = {};
    try {
      const pDoc = await adminDb.collection("users").doc(uid).collection("profile").doc("personal").get();
      if (pDoc.exists) {
        profileData = pDoc.data() || {};
      }
    } catch {
      // fallback
    }

    // 3. Subscription
    let subscription = userData.subscription || {
      planId: "starter",
      planName: "Starter Plan",
      status: "active",
      startedAt: userData.createdAt || new Date().toISOString(),
      expiresAt: null,
      assignedBy: "system",
      assignedAt: userData.createdAt || new Date().toISOString(),
      notes: "Default starter tier",
    };

    try {
      const subDoc = await adminDb.collection("users").doc(uid).collection("subscription").doc("current").get();
      if (subDoc.exists) {
        subscription = { ...subscription, ...subDoc.data() };
      }
    } catch {
      // fallback
    }

    // 4. Projects / Applications Pipeline
    let applications: any[] = [];
    try {
      const appsDoc = await adminDb.collection("users").doc(uid).collection("applications").doc("data").get();
      if (appsDoc.exists) {
        applications = appsDoc.data()?.items || [];
      }
    } catch {
      // fallback
    }

    const stagesCount: Record<string, number> = {
      new: 0,
      applied: 0,
      client_replied: 0,
      hired: 0,
      rejected: 0,
    };

    let totalPipelineValue = 0;
    for (const app of applications) {
      const st = app.stage || "new";
      stagesCount[st] = (stagesCount[st] || 0) + 1;
      if (app.value) {
        const num = parseFloat(app.value.replace(/[^0-9.]/g, ""));
        if (!isNaN(num)) totalPipelineValue += num;
      }
    }

    const totalProjects = applications.length;
    const hiredCount = stagesCount.hired || 0;
    const conversionRate = totalProjects > 0 ? Math.round((hiredCount / totalProjects) * 1000) / 10 : 0;
    const averageProjectValue = totalProjects > 0 ? Math.round(totalPipelineValue / totalProjects) : 0;

    // 5. AI / BYOK Telemetry (NO RAW KEYS RETURNED)
    let selectedModel = "gemini-1-5-pro";
    let geminiConfigured = isValidKeyFormat(userData.geminiApiKey, "gemini");
    let openaiConfigured = false;
    let anthropicConfigured = false;

    try {
      const aiDoc = await adminDb.collection("users").doc(uid).collection("settings").doc("ai").get();
      if (aiDoc.exists) {
        const aiData = aiDoc.data() || {};
        if (aiData.defaultModel) selectedModel = aiData.defaultModel;
        if (isValidKeyFormat(aiData.geminiApiKey, "gemini")) geminiConfigured = true;
        if (isValidKeyFormat(aiData.openaiApiKey, "openai")) openaiConfigured = true;
        if (isValidKeyFormat(aiData.anthropicApiKey, "anthropic")) anthropicConfigured = true;
      }
    } catch {
      // fallback
    }

    // Query analysis event count
    let aiUsageCount = 0;
    try {
      const aiEvents = await adminDb.collection("telemetry_events")
        .where("userId", "==", uid)
        .where("eventType", "==", "analysis_completed")
        .get();
      aiUsageCount = aiEvents.size;
    } catch {
      // fallback
    }

    // 6. Recent activity timeline
    const recentActivity: any[] = [];
    for (const app of applications.slice(0, 10)) {
      if (app.history && Array.isArray(app.history)) {
        for (const h of app.history) {
          recentActivity.push({
            id: h.id || Math.random().toString(),
            projectTitle: app.projectTitle,
            toStage: h.toStage,
            fromStage: h.fromStage,
            timestamp: h.timestamp || app.updatedAt,
            note: h.note,
          });
        }
      }
    }
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      account: {
        uid,
        name: userData.displayName || "Freelancer",
        email: userData.email || "",
        photoURL: userData.photoURL || null,
        createdAt: userData.createdAt || userData.lastLoginAt || new Date().toISOString(),
        lastLoginAt: userData.lastLoginAt || null,
        lastSeenAt: userData.lastSeenAt || null,
        status: userData.status || "active",
        role: userData.role || "user",
        disabled: !!userData.disabled,
      },
      profile: {
        jobTitle: profileData.jobTitle || "Freelancer",
        country: profileData.country || "Not specified",
        city: profileData.city || "",
        skills: profileData.skills || [],
        hourlyRate: profileData.hourlyRate || "",
        bio: profileData.bio || "",
      },
      subscription,
      performance: {
        totalProjects,
        stages: stagesCount,
        hiredCount,
        conversionRate,
        totalPipelineValue,
        averageProjectValue,
        recentProjects: applications.slice(0, 5),
      },
      aiTelemetry: {
        selectedModel,
        geminiConfigured,
        openaiConfigured,
        anthropicConfigured,
        aiUsageCount,
      },
      activityTimeline: recentActivity.slice(0, 15),
    });
  } catch (error: any) {
    console.error("[AdminUserDetail] Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 });
  }
}
