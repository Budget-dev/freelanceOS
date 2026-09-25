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
import { adminAuth, adminDb, hasAdminCredentials } from "@/lib/firebase/admin";
import { getCachedUsers } from "@/lib/firebase/user-cache";
import { isValidKeyFormat } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse, adminUser } = await verifyAdminRequest(req, "support");
    if (errorResponse) return errorResponse;

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "10", 10), 100);
    const search = (url.searchParams.get("search") || "").trim().toLowerCase();
    const statusFilter = url.searchParams.get("status") || "all";
    const planFilter = url.searchParams.get("plan") || "all";
    const hasAiKeyFilter = url.searchParams.get("hasAiKey") || "all";
    const sortBy = url.searchParams.get("sortBy") || "newest";

    const firestoreUsers = await getCollectionDocs("users", adminUser?.token);
    const userMap = new Map<string, any>();

    for (const data of firestoreUsers) {
      const uid = data.id || data.uid;
      if (uid) userMap.set(uid, { id: uid, ...data });
    }

    // Merge in persistent local cache (ensures zero dropped users)
    const cachedUsers = getCachedUsers();
    for (const cUser of cachedUsers) {
      if (cUser.uid && !userMap.has(cUser.uid)) {
        userMap.set(cUser.uid, { id: cUser.uid, ...cUser });
      }
    }

    // Direct Firebase Authentication sync when Admin SDK has credentials
    if (hasAdminCredentials()) {
      try {
        const authUserList = await adminAuth.listUsers(1000);
        for (const authUser of authUserList.users) {
          const existing = userMap.get(authUser.uid);
          if (existing) {
            existing.email = existing.email || authUser.email;
            existing.displayName = existing.displayName || authUser.displayName;
            existing.photoURL = existing.photoURL || authUser.photoURL;
            existing.createdAt = existing.createdAt || authUser.metadata.creationTime;
            existing.lastLoginAt = existing.lastLoginAt || authUser.metadata.lastSignInTime;
            if (authUser.disabled) existing.status = "suspended";
          } else {
            const newUserData = {
              id: authUser.uid,
              uid: authUser.uid,
              email: authUser.email || "",
              displayName: authUser.displayName || authUser.email?.split("@")[0] || "Freelancer",
              photoURL: authUser.photoURL || null,
              createdAt: authUser.metadata.creationTime || new Date().toISOString(),
              lastLoginAt: authUser.metadata.lastSignInTime || null,
              lastSeenAt: authUser.metadata.lastSignInTime || null,
              lastActiveTimestamp: authUser.metadata.lastSignInTime ? new Date(authUser.metadata.lastSignInTime).getTime() : 0,
              status: authUser.disabled ? "suspended" : "active",
              role: (authUser.customClaims as any)?.role || "user",
            };
            userMap.set(authUser.uid, newUserData);

            // Auto-backfill to Firestore asynchronously
            try {
              adminDb.collection("users").doc(authUser.uid).set(
                {
                  uid: authUser.uid,
                  email: authUser.email || "",
                  displayName: newUserData.displayName,
                  photoURL: authUser.photoURL || null,
                  createdAt: newUserData.createdAt,
                  lastLoginAt: newUserData.lastLoginAt,
                  status: newUserData.status,
                  role: newUserData.role,
                  subscription: {
                    planId: "starter",
                    planName: "Starter Plan",
                    status: "active",
                    expiresAt: null,
                  },
                },
                { merge: true }
              ).catch(() => {});
            } catch {
              // non-blocking
            }
          }
        }
      } catch (authErr) {
        console.warn("[AdminUsers] Could not list auth users directly:", authErr);
      }
    }

    let userList: any[] = [];

    for (const data of Array.from(userMap.values())) {
      const uid = data.id || data.uid;

      // Check root document for AI keys without exposing keys
      const geminiConnected = isValidKeyFormat(data.geminiApiKey, "gemini");
      const openaiConnected = isValidKeyFormat(data.openaiApiKey, "openai");
      const anthropicConnected = isValidKeyFormat(data.anthropicApiKey, "anthropic");

      // Safe subscription
      const sub = data.subscription || {
        planId: "starter",
        planName: "Starter Plan",
        status: "active",
        expiresAt: null,
      };

      const hasAnyAiKey = geminiConnected || openaiConnected || anthropicConnected;

      userList.push({
        uid,
        name: data.displayName || data.email?.split("@")[0] || "Freelancer",
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
          totalProjects: 0,
          hiredProjects: 0,
          conversionRate: 0,
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

    // Fetch project stats ONLY when Admin credentials exist to prevent REST timeouts
    if (hasAdminCredentials()) {
      try {
        await Promise.race([
          Promise.allSettled(
            paginatedUsers.map(async (u) => {
              try {
                const appData = await getDocumentByPath(`users/${u.uid}/applications/data`, adminUser?.token);
                if (appData && Array.isArray(appData.items)) {
                  u.stats.totalProjects = appData.items.length;
                  u.stats.hiredProjects = appData.items.filter((i: any) => i.stage === "hired").length;
                  u.stats.conversionRate =
                    u.stats.totalProjects > 0
                      ? Math.round((u.stats.hiredProjects / u.stats.totalProjects) * 1000) / 10
                      : 0;
                }
              } catch {
                // ignore individual failure
              }
            })
          ),
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]);
      } catch {
        // Non-blocking
      }
    }

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
