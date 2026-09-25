/**
 * @file apps/web/app/api/admin/users/route.ts
 * @description Paginated Admin User Directory API
 *
 * Implements server-side filtering, searching, and sorting across all users.
 * Enforces strict BYOK privacy: NEVER returns raw AI API keys.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/admin-auth";
import { getCollectionDocs, getDocumentByPath } from "@/lib/firebase/firestore-rest";
import { isValidKeyFormat } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse, adminUser } = await verifyAdminRequest(req, "support");
    if (errorResponse) return errorResponse;

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "10", 10), 50);
    const search = (url.searchParams.get("search") || "").trim().toLowerCase();
    const statusFilter = url.searchParams.get("status") || "all";
    const planFilter = url.searchParams.get("plan") || "all";
    const hasAiKeyFilter = url.searchParams.get("hasAiKey") || "all";
    const sortBy = url.searchParams.get("sortBy") || "newest";

    const users = await getCollectionDocs("users", adminUser?.token);
    let userList: any[] = [];

    for (const data of users) {
      const uid = data.id;

      // Check subcollection for AI settings without ever exposing keys
      let geminiConnected = isValidKeyFormat(data.geminiApiKey, "gemini");
      let openaiConnected = false;
      let anthropicConnected = false;

      try {
        const aiData = await getDocumentByPath(`users/${uid}/settings/ai`, adminUser?.token);
        if (aiData) {
          if (isValidKeyFormat(aiData.geminiApiKey, "gemini")) geminiConnected = true;
          if (isValidKeyFormat(aiData.openaiApiKey, "openai")) openaiConnected = true;
          if (isValidKeyFormat(aiData.anthropicApiKey, "anthropic")) anthropicConnected = true;
        }
      } catch {
        // graceful ignore
      }

      // Read project count and conversions
      let totalProjects = 0;
      let hiredProjects = 0;
      try {
        const appData = await getDocumentByPath(`users/${uid}/applications/data`, adminUser?.token);
        if (appData && Array.isArray(appData.items)) {
          totalProjects = appData.items.length;
          hiredProjects = appData.items.filter((i: any) => i.stage === "hired").length;
        }
      } catch {
        // graceful ignore
      }

      const conversionRate = totalProjects > 0 ? Math.round((hiredProjects / totalProjects) * 1000) / 10 : 0;

      // Extract safe subscription
      const sub = data.subscription || {
        planId: "starter",
        planName: "Starter Plan",
        status: "active",
        expiresAt: null,
      };

      const hasAnyAiKey = geminiConnected || openaiConnected || anthropicConnected;

      userList.push({
        uid,
        name: data.displayName || "Freelancer",
        email: data.email || "",
        photoURL: data.photoURL || null,
        createdAt: data.createdAt || data.lastLoginAt || new Date().toISOString(),
        lastLoginAt: data.lastLoginAt || null,
        lastSeenAt: data.lastSeenAt || null,
        lastActiveTimestamp: data.lastActiveTimestamp || 0,
        status: data.status || "active",
        role: data.role || "user",
        subscription: sub,
        stats: {
          totalProjects,
          hiredProjects,
          conversionRate,
        },
        aiKeyStatus: {
          gemini: geminiConnected,
          openai: openaiConnected,
          anthropic: anthropicConnected,
          hasAny: hasAnyAiKey,
        },
      });
    }

    // Apply Search Filter
    if (search) {
      userList = userList.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.uid.toLowerCase().includes(search)
      );
    }

    // Apply Status Filter
    if (statusFilter !== "all") {
      userList = userList.filter((u) => u.status === statusFilter);
    }

    // Apply Plan Filter
    if (planFilter !== "all") {
      userList = userList.filter((u) => u.subscription?.planId?.toLowerCase() === planFilter.toLowerCase());
    }

    // Apply AI Key Filter
    if (hasAiKeyFilter === "yes") {
      userList = userList.filter((u) => u.aiKeyStatus.hasAny);
    } else if (hasAiKeyFilter === "no") {
      userList = userList.filter((u) => !u.aiKeyStatus.hasAny);
    }

    // Sorting
    userList.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "lastLogin":
          return (new Date(b.lastLoginAt || 0).getTime()) - (new Date(a.lastLoginAt || 0).getTime());
        case "lastActive":
          return (b.lastActiveTimestamp || 0) - (a.lastActiveTimestamp || 0);
        case "projects":
          return b.stats.totalProjects - a.stats.totalProjects;
        case "conversionRate":
          return b.stats.conversionRate - a.stats.conversionRate;
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    const total = userList.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedUsers = userList.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error("[AdminUsers] Error listing users:", error);
    return NextResponse.json({
      users: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      },
    });
  }
}
