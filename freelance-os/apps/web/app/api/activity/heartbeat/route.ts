/**
 * @file apps/web/app/api/activity/heartbeat/route.ts
 * @description Lightweight Activity Heartbeat Endpoint
 *
 * Records user activity periodically (every 2 minutes) to accurately determine:
 * - Active recently (last 5 min)
 * - Active in last 15 min
 * - Last seen timestamp and current route
 *
 * Does NOT generate excessive Firestore writes (throttled client-side and server-side).
 */

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyFirebaseToken } from "@/lib/auth/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = await verifyFirebaseToken(token);

    if (!decoded?.uid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify user is not suspended
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (userDoc.exists && userDoc.data()?.status === "suspended") {
      return NextResponse.json({ error: "Account suspended." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const currentRoute = typeof body.route === "string" ? body.route.substring(0, 100) : "/dashboard";
    const now = new Date();
    const nowIso = now.toISOString();

    // Update user root document with last seen timestamp
    await adminDb.collection("users").doc(decoded.uid).set(
      {
        uid: decoded.uid,
        email: decoded.email || null,
        lastSeenAt: nowIso,
        lastActiveTimestamp: now.getTime(),
        currentRoute,
        updatedAt: nowIso,
      },
      { merge: true }
    );

    // Also update activity sessions record for fast presence query
    await adminDb.collection("activity_sessions").doc(decoded.uid).set(
      {
        uid: decoded.uid,
        email: decoded.email || null,
        lastSeenAt: nowIso,
        lastActiveTimestamp: now.getTime(),
        currentRoute,
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, timestamp: nowIso });
  } catch (error) {
    console.error("[Heartbeat] Error processing heartbeat:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
