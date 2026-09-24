/**
 * @file apps/web/lib/services/telemetry-service.ts
 * @description Safe Operational Telemetry & Analytics Service
 *
 * Records platform events without ever capturing sensitive data:
 * - NEVER captures AI API keys, prompts, or credentials
 * - Captures metadata: provider, model, latency, success/failure, feature usage, stage transitions
 */

import { adminDb } from "@/lib/firebase/admin";

export type TelemetryEventType =
  | "user_login"
  | "analysis_started"
  | "analysis_completed"
  | "analysis_failed"
  | "project_created"
  | "project_stage_changed"
  | "subscription_changed"
  | "feature_used";

export interface TelemetryEvent {
  id?: string;
  userId: string;
  eventType: TelemetryEventType;
  metadata?: {
    provider?: "gemini" | "openai" | "anthropic";
    model?: string;
    success?: boolean;
    feature?: string;
    stageFrom?: string;
    stageTo?: string;
    latencyMs?: number;
    platform?: string;
  };
  timestamp: string;
}

export async function recordTelemetryEvent(
  event: Omit<TelemetryEvent, "timestamp">
): Promise<void> {
  const timestamp = new Date().toISOString();

  // Strip any accidental sensitive keys from metadata
  const sanitizedMeta: Record<string, any> = {};
  if (event.metadata) {
    for (const [key, val] of Object.entries(event.metadata)) {
      if (
        !key.toLowerCase().includes("key") &&
        !key.toLowerCase().includes("secret") &&
        !key.toLowerCase().includes("token") &&
        !key.toLowerCase().includes("password") &&
        !key.toLowerCase().includes("prompt")
      ) {
        sanitizedMeta[key] = val;
      }
    }
  }

  const payload: TelemetryEvent = {
    userId: event.userId,
    eventType: event.eventType,
    metadata: sanitizedMeta,
    timestamp,
  };

  try {
    await adminDb.collection("telemetry_events").add(payload);
  } catch (err) {
    console.error("[TelemetryService] Error logging event:", err);
  }
}
