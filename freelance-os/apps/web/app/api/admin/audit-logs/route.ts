/**
 * @file apps/web/app/api/admin/audit-logs/route.ts
 * @description Administrative Audit Log Trail API
 *
 * Exposes immutable records of administrative interventions:
 * - User suspensions/restorations
 * - Subscription assignments and extensions
 * - Plan modifications
 * - Role elevations
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/admin-auth";
import { getAuditLogs } from "@/lib/services/audit-service";

export async function GET(req: NextRequest) {
  try {
    const { errorResponse, adminUser } = await verifyAdminRequest(req, "support");
    if (errorResponse) return errorResponse;

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || undefined;
    const targetUid = url.searchParams.get("targetUid") || undefined;
    const adminUid = url.searchParams.get("adminUid") || undefined;
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);

    const logs = await getAuditLogs({
      action,
      targetUid,
      adminUid,
      limit,
      idToken: adminUser?.token,
    });

    return NextResponse.json({
      logs,
      total: logs.length,
    });
  } catch (error: any) {
    console.error("[AdminAuditLogs] Error fetching audit logs:", error);
    return NextResponse.json({ logs: [], total: 0 });
  }
}
