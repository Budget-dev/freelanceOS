/**
 * @file apps/web/app/api/telemetry/event/route.ts
 * @description Safe Client Telemetry Event Ingestion
 *
 * Allows authenticated client apps to register operational milestones
 * without capturing any credentials, prompts, or sensitive client data.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth/admin-auth";
import { recordTelemetryEvent, TelemetryEventType } from "@/lib/services/telemetry-service";

const ALLOWED_EVENT_TYPES: TelemetryEventType[] = [
  "user_login",
  "analysis_started",
  "analysis_completed",
  "analysis_failed",
  "project_created",
  "project_stage_changed",
  "subscription_changed",
  "feature_used",
];

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

    const body = await req.json().catch(() => ({}));
    const { eventType, metadata } = body;

    if (!eventType || !ALLOWED_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    await recordTelemetryEvent({
      userId: decoded.uid,
      eventType,
      metadata: metadata || {},
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TelemetryAPI] Error ingesting event:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
