/**
 * @file apps/web/app/api/admin/projects/route.ts
 * @description Platform-Wide Projects & Application Pipeline Tracking API
 *
 * Aggregates client proposals across all users and delivers pipeline analytics:
 * - Conversion metrics
 * - Stage counts
 * - Budget totals
 * - Filterable project directory
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/admin-auth";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
  const { errorResponse } = await verifyAdminRequest(req, "support");
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const stageFilter = url.searchParams.get("stage") || "all";
  const userSearch = (url.searchParams.get("user") || "").trim().toLowerCase();
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "15", 10), 50);

  try {
    const usersSnap = await adminDb.collection("users").get();
    const allProjects: any[] = [];

    let totalProjectsCount = 0;
    let totalPipelineValue = 0;
    const stageCounts: Record<string, number> = {
      new: 0,
      applied: 0,
      client_replied: 0,
      hired: 0,
      rejected: 0,
    };

    for (const uDoc of usersSnap.docs) {
      const uData = uDoc.data();
      const uid = uDoc.id;
      const userName = uData.displayName || "Freelancer";
      const userEmail = uData.email || "";

      try {
        const appDoc = await adminDb.collection("users").doc(uid).collection("applications").doc("data").get();
        if (appDoc.exists) {
          const items = appDoc.data()?.items || [];
          for (const item of items) {
            totalProjectsCount++;
            const st = item.stage || "new";
            stageCounts[st] = (stageCounts[st] || 0) + 1;

            if (item.value) {
              const numeric = parseFloat(item.value.replace(/[^0-9.]/g, ""));
              if (!isNaN(numeric)) totalPipelineValue += numeric;
            }

            allProjects.push({
              id: item.id,
              userId: uid,
              userName,
              userEmail,
              projectTitle: item.projectTitle || "Untitled Project",
              clientName: item.clientName || "Direct Client",
              companyName: item.companyName || "",
              stage: st,
              matchScore: item.matchScore || 0,
              value: item.value || "$0",
              appliedDate: item.appliedDate || null,
              lastActivity: item.lastActivity || "Recorded in workspace",
              platform: item.platform || "Direct",
              createdAt: item.createdAt || uData.createdAt || new Date().toISOString(),
              timeline: item.timeline || "",
            });
          }
        }
      } catch {
        // fallback
      }
    }

    // Filter by stage
    let filtered = allProjects;
    if (stageFilter !== "all") {
      filtered = filtered.filter((p) => p.stage === stageFilter);
    }

    // Filter by user
    if (userSearch) {
      filtered = filtered.filter(
        (p) =>
          p.userName.toLowerCase().includes(userSearch) ||
          p.userEmail.toLowerCase().includes(userSearch) ||
          p.projectTitle.toLowerCase().includes(userSearch) ||
          p.clientName.toLowerCase().includes(userSearch)
      );
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    const hiredCount = stageCounts.hired || 0;
    const conversionRate = totalProjectsCount > 0 ? Math.round((hiredCount / totalProjectsCount) * 1000) / 10 : 0;
    const averageProjectValue = totalProjectsCount > 0 ? Math.round(totalPipelineValue / totalProjectsCount) : 0;

    return NextResponse.json({
      metrics: {
        totalProjects: totalProjectsCount,
        stages: stageCounts,
        hired: hiredCount,
        conversionRate,
        totalPipelineValue,
        averageProjectValue,
      },
      projects: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error("[AdminProjects] Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch platform projects" }, { status: 500 });
  }
}
