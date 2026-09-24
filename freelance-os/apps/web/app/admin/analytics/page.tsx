/**
 * @file apps/web/app/admin/analytics/page.tsx
 * @description Safe Operational Platform Analytics & Conversion Funnel Dashboard
 *
 * Visualizes DAU/WAU/MAU, stage-to-stage proposal conversions, AI telemetry,
 * and feature engagement. Built solely from actual operational records.
 */

"use client";

import React, { useEffect, useState } from "react";
import { adminFetch } from "@/lib/api/admin-client";
import { StatCard } from "@/components/admin/StatCard";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Users,
  TrendingUp,
  Percent,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/api/admin/analytics");
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const activity = data?.activity || {};
  const funnel = data?.funnel || {};
  const aiTelemetry = data?.aiTelemetry || {};
  const featureUsage = data?.featureUsage || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Operational Analytics
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Stage conversion funnels, engagement velocity, and non-sensitive AI provider telemetry
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchAnalytics}
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

      {/* Engagement Activity Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard
          title="Daily Active (DAU)"
          value={loading ? "..." : (activity.dau ?? 0)}
          subtext="Users active in last 24h"
          icon={Users}
          badge="Live Heartbeat"
          badgeColor="bg-emerald-100 text-emerald-700 border-emerald-200"
        />

        <StatCard
          title="Weekly Active (WAU)"
          value={loading ? "..." : (activity.wau ?? 0)}
          subtext="Active in last 7 days"
          icon={TrendingUp}
        />

        <StatCard
          title="Monthly Active (MAU)"
          value={loading ? "..." : (activity.mau ?? 0)}
          subtext="Active in last 30 days"
          icon={LineChart}
        />

        <StatCard
          title="DAU / MAU Ratio"
          value={loading ? "..." : `${activity.mau > 0 ? Math.round((activity.dau / activity.mau) * 100) : 0}%`}
          subtext="Platform stickiness"
          icon={Percent}
        />
      </div>

      {/* Stage-to-Stage Proposal Conversion Funnel */}
      <div className="rounded-xl border border-border/70 bg-card p-5 shadow-2xs space-y-4">
        <div className="border-b border-border/50 pb-3">
          <h3 className="text-sm font-bold text-foreground">Client Proposal Conversion Funnel</h3>
          <p className="text-xs text-muted-foreground">
            Measures drop-off and conversion rates across each milestone of client bids
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          {/* Step 1: Opportunities Ingested */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">1. Ingested Leads</span>
            <p className="text-xl font-bold text-foreground">{funnel.total ?? 0}</p>
            <p className="text-[11px] text-muted-foreground">100% Top of Funnel</p>
          </div>

          {/* Step 2: Proposals Applied */}
          <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-blue-700 uppercase">2. Applied Bids</span>
            <p className="text-xl font-bold text-blue-900">{funnel.applied ?? 0}</p>
            <p className="text-[11px] text-blue-700 font-semibold">{funnel.appliedRate ?? 0}% applied rate</p>
          </div>

          {/* Step 3: Client Replied */}
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-amber-700 uppercase">3. Client Replies</span>
            <p className="text-xl font-bold text-amber-900">{funnel.replied ?? 0}</p>
            <p className="text-[11px] text-amber-700 font-semibold">{funnel.repliedRate ?? 0}% reply rate</p>
          </div>

          {/* Step 4: Hired / Won */}
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">4. Hired / Won</span>
            <p className="text-xl font-bold text-emerald-900">{funnel.hired ?? 0}</p>
            <p className="text-[11px] text-emerald-700 font-bold">{funnel.overallWinRate ?? 0}% overall win rate</p>
          </div>
        </div>

        {/* Visual Flow Indicator */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <span>Lead Sourced</span>
          <ArrowRight className="h-3.5 w-3.5 text-border" />
          <span>Outreach Applied</span>
          <ArrowRight className="h-3.5 w-3.5 text-border" />
          <span>Client Engagement</span>
          <ArrowRight className="h-3.5 w-3.5 text-border" />
          <span className="font-semibold text-emerald-600">Contract Closed</span>
        </div>
      </div>

      {/* Grid: AI Provider Telemetry & Feature Engagement */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* AI Provider Telemetry */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">AI BYOK Provider Share</h3>
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">Zero Key Storage</span>
          </div>

          <div className="space-y-3 pt-1">
            {[
              { name: "Google Gemini 1.5", count: aiTelemetry.gemini || 0, color: "bg-blue-600" },
              { name: "OpenAI GPT-4o", count: aiTelemetry.openai || 0, color: "bg-emerald-600" },
              { name: "Anthropic Claude 3.5", count: aiTelemetry.anthropic || 0, color: "bg-purple-600" },
            ].map((p) => {
              const totalAI = (aiTelemetry.gemini || 0) + (aiTelemetry.openai || 0) + (aiTelemetry.anthropic || 0) || 1;
              const pct = Math.round((p.count / totalAI) * 100);

              return (
                <div key={p.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{p.name}</span>
                    <span className="text-muted-foreground">
                      {p.count} runs ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                    <div className={`h-full rounded-full ${p.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Usage Overview */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Workspace Feature Usage</h3>
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">Engagement Pulse</span>
          </div>

          <div className="space-y-2.5 text-xs pt-1">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/40">
              <span className="font-semibold text-foreground">Project Analysis Studio</span>
              <strong className="text-foreground">{featureUsage.analysis_studio ?? 0} runs</strong>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/40">
              <span className="font-semibold text-foreground">Applications & Proposal Pipeline</span>
              <strong className="text-foreground">{featureUsage.applications_tracker ?? 0} items</strong>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/40">
              <span className="font-semibold text-foreground">Portfolio Showcase</span>
              <strong className="text-foreground">{featureUsage.portfolio ?? 0} active</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
