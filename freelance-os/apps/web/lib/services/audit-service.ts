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

import { adminDb, hasAdminCredentials } from "@/lib/firebase/admin";
import { getCollectionDocs, setDocumentByPath } from "@/lib/firebase/firestore-rest";

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

export async function createAuditLog(
  entry: Omit<AuditLogEntry, "timestamp">,
  idToken?: string
): Promise<string> {
  const timestamp = new Date().toISOString();
  const logData: AuditLogEntry = {
    ...entry,
    timestamp,
  };

  if (hasAdminCredentials()) {
    try {
      const docRef = await Promise.race([
        adminDb.collection("admin_audit_logs").add(logData),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 2000)
        ),
      ]);
      return (docRef as any).id;
    } catch (err) {
      console.warn("[AuditService] adminDb audit write notice:", err);
    }
  }

  if (idToken) {
    const docId = `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await setDocumentByPath(`admin_audit_logs/${docId}`, logData, idToken, false);
    return docId;
  }

  return `local_${Date.now()}`;
}

export async function getAuditLogs(options?: {
  limit?: number;
  action?: string;
  targetUid?: string;
  adminUid?: string;
  idToken?: string;
}): Promise<AuditLogEntry[]> {
  try {
    const limit = Math.min(options?.limit || 50, 100);
    let logs: AuditLogEntry[] = await getCollectionDocs("admin_audit_logs", options?.idToken);

    // Sort descending by timestamp
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

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
