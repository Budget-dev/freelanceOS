/**
 * @file apps/web/app/admin/page.tsx
 * @description Central Operational Dashboard for FreelanceOS
 *
 * Displays platform-wide metrics, presence pulses, conversion funnels,
 * subscription statuses, and AI telemetry from actual database records.
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/api/admin-client";
import { StatCard } from "@/components/admin/StatCard";
import { Button } from "@/components/ui/button";
import {
  Users,
  FolderKanban,
  CheckCircle2,
  Percent,
  CreditCard,
  Sparkles,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [range, setRange] = useState<"today" | "7d" | "30d" | "90d">("30d");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await adminFetch(`/api/admin/stats?range=${range}`);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const summary = data?.summary || {};
  const stageDist = data?.stageDistribution || {};
  const subDist = data?.subscriptionDist || {};
  const aiDist = data?.aiProviderDist || {};

  return (
    <div className="space-y-6">
      {/* Header with Title and Range Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Platform Command Center
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Operational intelligence, user presence, project pipelines, and AI telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date range filter */}
          <div className="inline-flex rounded-lg border border-border/70 bg-card p-1 text-xs">
            {(["today", "7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  range === r
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "today" ? "Today" : r.toUpperCase()}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={refreshing}
            className="h-8 gap-1 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        <StatCard
          title="Total Registered Users"
          value={loading ? "..." : (summary.totalUsers ?? 0)}
          subtext={`+${summary.newUsersMonth ?? 0} new this month`}
          icon={Users}
          badge="Live DB"
        />

        <StatCard
          title="Active Recently (5m)"
          value={loading ? "..." : (summary.activeLast5m ?? 0)}
          subtext={`${summary.activeLast15m ?? 0} active in last 15 min`}
          icon={Activity}
          badge="Heartbeat"
          badgeColor="bg-emerald-100 text-emerald-700 border-emerald-200"
        />

        <StatCard
          title="Total Client Projects"
          value={loading ? "..." : (summary.totalProjects ?? 0)}
          subtext={`$${(summary.totalPipelineValue || 0).toLocaleString()} pipeline`}
          icon={FolderKanban}
        />

        <StatCard
          title="Overall Win / Hire Rate"
          value={loading ? "..." : `${summary.conversionRate ?? 0}%`}
          subtext={`${summary.hiredProjects ?? 0} client projects converted`}
          icon={Percent}
          badge="Win Ratio"
          badgeColor="bg-blue-100 text-blue-700 border-blue-200"
        />
      </div>

      {/* Secondary Row: Subscription & AI Telemetry */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        <StatCard
          title="Active Subscriptions"
          value={loading ? "..." : (summary.activeSubscriptions ?? 0)}
          subtext="Administrative manual tiering"
          icon={CreditCard}
        />

        <StatCard
          title="New Users Today"
          value={loading ? "..." : (summary.newUsersToday ?? 0)}
          subtext={`+${summary.newUsersWeek ?? 0} in last 7 days`}
          icon={Clock}
        />

        <StatCard
          title="AI Telemetry Events"
          value={loading ? "..." : (summary.aiTotalAnalyses ?? 0)}
          subtext="Analyses run by users"
          icon={Sparkles}
        />

        <StatCard
          title="Suspended Users"
          value={loading ? "..." : (summary.suspendedUsers ?? 0)}
          subtext="Enforced via Firebase Auth"
          icon={ShieldCheck}
          badgeColor={summary.suspendedUsers > 0 ? "bg-rose-100 text-rose-700 border-rose-200" : undefined}
        />
      </div>

      {/* Distribution Grids */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Project Pipeline Funnel */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Project Pipeline Stages</h3>
              <p className="text-[11px] text-muted-foreground">Aggregated across all freelancer workspaces</p>
            </div>
            <Link
              href="/admin/projects"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {[
              { stage: "New Lead", count: stageDist.new || 0, color: "bg-slate-400" },
              { stage: "Proposal Applied", count: stageDist.applied || 0, color: "bg-blue-500" },
              { stage: "Client Replied", count: stageDist.client_replied || 0, color: "bg-amber-500" },
              { stage: "Hired / Won", count: stageDist.hired || 0, color: "bg-emerald-500" },
              { stage: "Rejected / Closed", count: stageDist.rejected || 0, color: "bg-rose-400" },
            ].map((item) => {
              const total = summary.totalProjects || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{item.stage}</span>
                    <span className="text-muted-foreground">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subscription Plan Distribution */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Subscription Distribution</h3>
              <p className="text-[11px] text-muted-foreground">Administrative plan assignments</p>
            </div>
            <Link
              href="/admin/subscriptions"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5"
            >
              Manage <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {[
              { name: "Starter (Free)", key: "starter", badge: "Default" },
              { name: "Professional ($29)", key: "pro", badge: "Pro" },
              { name: "Agency ($79)", key: "agency", badge: "Team" },
              { name: "Lifetime Access", key: "lifetime", badge: "Founder" },
            ].map((plan) => {
              const count = subDist[plan.key] || 0;
              const total = summary.totalUsers || 1;
              const pct = Math.round((count / total) * 100);

              return (
                <div key={plan.key} className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-2.5">
                  <div>
                    <p className="text-xs font-medium text-foreground">{plan.name}</p>
                    <p className="text-[10px] text-muted-foreground">{count} users assigned</p>
                  </div>
                  <span className="text-xs font-bold text-foreground">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI BYOK Provider Usage */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">AI Provider Telemetry</h3>
              <p className="text-[11px] text-muted-foreground">BYOK provider share (zero key leakage)</p>
            </div>
            <Link
              href="/admin/analytics"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5"
            >
              Details <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Google Gemini</span>
                <span className="text-muted-foreground">{aiDist.gemini || 0} runs</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Native default provider</p>
            </div>

            <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">OpenAI GPT-4o</span>
                <span className="text-muted-foreground">{aiDist.openai || 0} runs</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">BYOK direct connection</p>
            </div>

            <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Anthropic Claude</span>
                <span className="text-muted-foreground">{aiDist.anthropic || 0} runs</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Claude 3.5 Sonnet BYOK</p>
            </div>
          </div>
        </div>
      </div>

      {/* Honest Operational Notice */}
      <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            Operating in <strong>Administrative Tiering Mode</strong>. All metrics reflect genuine Firebase Auth and Firestore records.
          </span>
        </div>
        <span className="text-[11px] opacity-75">No simulated or mocked revenue</span>
      </div>
    </div>
  );
}
