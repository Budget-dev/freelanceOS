/**
 * @file apps/web/lib/services/audit-service.ts
 * @description Append-only Administrative Action Audit Logging Service
 *
 * Records all critical administrative changes into `/admin_audit_logs/{logId}`:
 * - User suspension and restoration
 * - Subscription assignments, extensions, cancellations
 * - Plan creations and updates
 * - Role elevations and revocations
 */

import { adminDb } from "@/lib/firebase/admin";

export type AuditAction =
  | "user.suspend"
  | "user.restore"
  | "subscription.assign"
  | "subscription.update"
  | "subscription.extend"
  | "subscription.cancel"
  | "subscription.restore"
  | "subscription.lifetime"
  | "subscription.update_notes"
  | "plan.create"
  | "plan.update"
  | "staff.add"
  | "staff.remove"
  | "staff.role.change"
  | "admin.role.update"
  | "user.profile.update";

export interface AuditLogEntry {
  id?: string;
  adminUid: string;
  adminEmail?: string;
  action: AuditAction;
  targetUid?: string;
  targetEmail?: string;
  timestamp: string;
  previousState?: any;
  newState?: any;
  details?: string;
  ipAddress?: string;
}

export async function createAuditLog(entry: Omit<AuditLogEntry, "timestamp">): Promise<string> {
  const timestamp = new Date().toISOString();
  const logData: AuditLogEntry = {
    ...entry,
    timestamp,
  };

  try {
    const docRef = await adminDb.collection("admin_audit_logs").add(logData);
    return docRef.id;
  } catch (err) {
    console.error("[AuditService] Error writing audit log:", err);
    // Non-blocking in dev if Firestore offline, but returns fallback ID
    return `local_${Date.now()}`;
  }
}

export async function getAuditLogs(options?: {
  limit?: number;
  action?: string;
  targetUid?: string;
  adminUid?: string;
}): Promise<AuditLogEntry[]> {
  try {
    const limit = Math.min(options?.limit || 50, 100);
    const snapshot = await adminDb
      .collection("admin_audit_logs")
      .orderBy("timestamp", "desc")
      .limit(200)
      .get();

    let logs = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as AuditLogEntry[];

    if (options?.action) {
      logs = logs.filter((l) => l.action === options.action);
    }
    if (options?.targetUid) {
      logs = logs.filter((l) => l.targetUid === options.targetUid);
    }
    if (options?.adminUid) {
      logs = logs.filter((l) => l.adminUid === options.adminUid);
    }

    return logs.slice(0, limit);
  } catch (err) {
    console.error("[AuditService] Error reading audit logs:", err);
    return [];
  }
}
