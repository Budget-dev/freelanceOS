/**
 * @file apps/web/app/admin/audit-logs/page.tsx
 * @description Append-Only Administrative Action Audit Trail
 *
 * Implements immutable records of administrative interventions:
 * - User suspensions/restorations
 * - Subscription assignments and tier changes
 * - Plan modifications
 * - Role elevations and revocations
 */

"use client";

import React, { useEffect, useState } from "react";
import { adminFetch } from "@/lib/api/admin-client";
import { Button } from "@/components/ui/button";
import {
  ScrollText,
  ShieldCheck,
  Filter,
  RefreshCw,
  AlertCircle,
  Clock,
  User,
  Shield,
  CreditCard,
  Layers,
} from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (actionFilter !== "all") query.set("action", actionFilter);
      query.set("limit", "100");

      const res = await adminFetch(`/api/admin/audit-logs?${query.toString()}`);
      setLogs(res.logs || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionFilter]);

  const getActionBadge = (action: string) => {
    if (action.includes("suspend")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (action.includes("restore")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (action.includes("subscription")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (action.includes("role")) {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    return "bg-muted text-muted-foreground border-border/60";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Administrative Audit Trail
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Append-only compliance log recording all administrative modifications and privilege escalations
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          disabled={loading}
          className="h-8 gap-1 text-xs self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Chips */}
      <div className="rounded-xl border border-border/70 bg-card p-3 shadow-2xs flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-muted-foreground mr-1">Filter Action:</span>

        {[
          { key: "all", label: "All Actions" },
          { key: "user.suspend", label: "Suspensions" },
          { key: "user.restore", label: "Restorations" },
          { key: "subscription.assign", label: "Subscription Grants" },
          { key: "subscription.extend", label: "Extensions" },
          { key: "plan.create", label: "Plan Creates" },
          { key: "plan.update", label: "Plan Updates" },
          { key: "admin.role.update", label: "Role Changes" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setActionFilter(item.key)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              actionFilter === item.key
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-border/70 bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Admin</th>
                <th className="py-3 px-3">Target Account</th>
                <th className="py-3 px-3">Details</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No audit records matching criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-foreground">{log.adminEmail || "Admin"}</span>
                      <span className="block text-[9px] font-mono text-muted-foreground">{log.adminUid?.slice(0, 10)}...</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-foreground">{log.targetEmail || log.targetUid || "System Plan"}</span>
                    </td>

                    <td className="py-3 px-3 text-muted-foreground max-w-xs truncate">
                      {log.details || "Administrative modification"}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        className="h-7 px-2 text-xs"
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground">Audit Record Inspection</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-muted/20 p-2.5 rounded-lg border border-border/40">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Action</span>
                  <strong className="text-foreground">{selectedLog.action}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Timestamp</span>
                  <span className="text-foreground font-mono">{selectedLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Actor (Admin)</span>
                  <span className="text-foreground">{selectedLog.adminEmail}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Target</span>
                  <span className="text-foreground">{selectedLog.targetEmail || selectedLog.targetUid}</span>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block text-[10px] mb-1">Details</span>
                <p className="p-2 rounded bg-muted/30 border border-border/40 text-foreground">
                  {selectedLog.details || "No details provided"}
                </p>
              </div>

              {selectedLog.previousState && (
                <div>
                  <span className="text-muted-foreground block text-[10px] mb-1">Previous State</span>
                  <pre className="p-2 rounded bg-muted/40 font-mono text-[10px] overflow-x-auto max-h-32 border border-border/40">
                    {JSON.stringify(selectedLog.previousState, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newState && (
                <div>
                  <span className="text-muted-foreground block text-[10px] mb-1">New State</span>
                  <pre className="p-2 rounded bg-muted/40 font-mono text-[10px] overflow-x-auto max-h-32 border border-border/40">
                    {JSON.stringify(selectedLog.newState, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-border/60">
              <Button size="sm" onClick={() => setSelectedLog(null)} className="text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
