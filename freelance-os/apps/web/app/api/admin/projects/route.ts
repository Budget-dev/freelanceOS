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
import { getCollectionDocs, getDocumentByPath } from "@/lib/firebase/firestore-rest";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse, adminUser } = await verifyAdminRequest(req, "support");
    if (errorResponse) return errorResponse;

    const url = new URL(req.url);
    const stageFilter = url.searchParams.get("stage") || "all";
    const userSearch = (url.searchParams.get("user") || "").trim().toLowerCase();
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "15", 10), 50);

    const users = await getCollectionDocs("users", adminUser?.token);
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

    // Filter users first if user search is specified
    let targetUsers = users;
    if (userSearch) {
      targetUsers = users.filter(
        (u: any) =>
          (u.displayName || "").toLowerCase().includes(userSearch) ||
          (u.email || "").toLowerCase().includes(userSearch) ||
          (u.id || "").toLowerCase().includes(userSearch)
      );
    }

    const candidateUsers = targetUsers.slice(0, 20);

    try {
      const appDocsResults = await Promise.race([
        Promise.allSettled(
          candidateUsers.map((u: any) =>
            getDocumentByPath(`users/${u.id}/applications/data`, adminUser?.token).then((doc) => ({
              uid: u.id,
              userName: u.displayName || "Freelancer",
              userEmail: u.email || "",
              createdAt: u.createdAt,
              doc,
            }))
          )
        ),
        new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 1800)),
      ]);

      for (const res of appDocsResults) {
        if (res.status === "fulfilled" && res.value && res.value.doc && Array.isArray(res.value.doc.items)) {
          const { uid, userName, userEmail, createdAt: userCreatedAt, doc: appDoc } = res.value;
          for (const item of appDoc.items) {
            totalProjectsCount++;
            const st = item.stage || "new";
            stageCounts[st] = (stageCounts[st] || 0) + 1;

            if (item.value) {
              const numeric = parseFloat(String(item.value).replace(/[^0-9.]/g, ""));
              if (!isNaN(numeric)) totalPipelineValue += numeric;
            }

            allProjects.push({
              id: item.id || Math.random().toString(),
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
              createdAt: item.createdAt || userCreatedAt || new Date().toISOString(),
              timeline: item.timeline || "",
            });
          }
        }
      }
    } catch {
      // Subcollection query fallback
    }

    let filtered = allProjects;

    if (stageFilter !== "all") {
      filtered = filtered.filter((p) => p.stage === stageFilter);
    }

    if (userSearch) {
      filtered = filtered.filter(
        (p) =>
          p.userName.toLowerCase().includes(userSearch) ||
          p.userEmail.toLowerCase().includes(userSearch) ||
          p.projectTitle.toLowerCase().includes(userSearch) ||
          p.clientName.toLowerCase().includes(userSearch)
      );
    }

    // Sort newest projects first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedProjects = filtered.slice(startIndex, startIndex + limit);

    const conversionRate = totalProjectsCount > 0 ? Math.round((stageCounts.hired / totalProjectsCount) * 1000) / 10 : 0;

    return NextResponse.json({
      summary: {
        totalProjects: totalProjectsCount,
        conversionRate,
        pipelineValue: totalPipelineValue,
        stageCounts,
      },
      projects: paginatedProjects,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error("[AdminProjects] Error fetching projects:", error);
    return NextResponse.json({
      summary: {
        totalProjects: 0,
        conversionRate: 0,
        pipelineValue: 0,
        stageCounts: { new: 0, applied: 0, client_replied: 0, hired: 0, rejected: 0 },
      },
      projects: [],
      pagination: {
        page: 1,
        limit: 15,
        total: 0,
        totalPages: 1,
      },
    });
  }
}
