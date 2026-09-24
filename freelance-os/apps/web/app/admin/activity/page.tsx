/**
 * @file apps/web/app/admin/activity/page.tsx
 * @description Real-Time & Recent Activity Presence Monitoring
 *
 * Inspects heartbeat intervals to provide transparent presence reporting:
 * - Active in last 5 minutes
 * - Active in last 15 minutes
 * - Current routes being navigated
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/api/admin-client";
import { StatCard } from "@/components/admin/StatCard";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Radio,
  Clock,
  Navigation,
  RefreshCw,
  AlertCircle,
  Eye,
  Info,
} from "lucide-react";

export default function AdminActivityPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/api/admin/activity");
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load activity metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const summary = data?.summary || {};
  const active5m = data?.activeUsers5m || [];
  const active15m = data?.activeUsers15m || [];
  const routeDist = data?.routeDistribution || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
            <span>Live Presence & Activity</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Transparent presence monitoring powered by periodic workspace heartbeats (auto-refreshed every 30s)
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchActivity}
          disabled={loading}
          className="h-8 gap-1 text-xs self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Now
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard
          title="Active Last 5 Min"
          value={loading ? "..." : (summary.activeLast5m ?? 0)}
          subtext="Immediate live presence"
          icon={Radio}
          badge="Live (5m)"
          badgeColor="bg-emerald-100 text-emerald-700 border-emerald-200"
        />

        <StatCard
          title="Active Last 15 Min"
          value={loading ? "..." : (summary.activeLast15m ?? 0)}
          subtext="Recent workspace sessions"
          icon={Activity}
        />

        <StatCard
          title="Active Today"
          value={loading ? "..." : (summary.activeToday ?? 0)}
          subtext="Logged in or active since midnight"
          icon={Clock}
        />

        <StatCard
          title="Total Registered Accounts"
          value={loading ? "..." : (summary.totalTracked ?? 0)}
          subtext="Under monitoring"
        />
      </div>

      {/* Architecture Disclaimer Alert */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Heartbeat Presence Model:</strong> FreelanceOS records client heartbeats every 2 minutes while a freelancer is active. This avoids excessive Firestore database read/write costs while delivering high-accuracy &quot;Active Recently&quot; tracking.
        </div>
      </div>

      {/* Active Users Table (Last 15 Minutes) */}
      <div className="rounded-xl border border-border/70 bg-card shadow-2xs overflow-hidden space-y-3">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Recently Active Freelancers (Last 15 Minutes)</h3>
            <p className="text-xs text-muted-foreground">Accounts currently in workspace sessions</p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {active15m.length} active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold">
              <tr>
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-3">Current Route</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Last Heartbeat</th>
                <th className="py-2.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading && active15m.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    Querying active heartbeats...
                  </td>
                </tr>
              ) : active15m.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No users active in the last 15 minutes.
                  </td>
                </tr>
              ) : (
                active15m.map((u: any) => (
                  <tr key={u.uid} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{u.name}</span>
                        <span className="text-[11px] text-muted-foreground">{u.email}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-foreground border border-border/60">
                        {u.currentRoute || "/dashboard"}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-semibold">
                        Online
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-[11px] text-muted-foreground">
                      {u.lastSeenAt ? new Date(u.lastSeenAt).toLocaleTimeString() : "Just now"}
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <Link
                        href={`/admin/users/${u.uid}`}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
