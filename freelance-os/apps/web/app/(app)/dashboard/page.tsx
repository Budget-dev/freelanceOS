"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { RecentAnalyses } from "@/components/dashboard/RecentAnalyses";
import { ProjectPipeline } from "@/components/dashboard/ProjectPipeline";
import { NeedsAttention } from "@/components/dashboard/NeedsAttention";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import type { DashboardSummary } from "@/components/dashboard/StatsOverview";

/**
 * Demo dashboard summary matching §45.
 * In production, this is fetched from:
 *   /accounts/{accountId}/dashboard/summary
 */
const DEMO_SUMMARY: DashboardSummary = {
  projectsAnalyzed: 125,
  goodMatches: 47,
  applications: 31,
  clientReplies: 12,
  hired: 3,
  rejected: 14,
};

export default function DashboardPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-screen-xl mx-auto space-y-6">
      {/* 1. Welcome / Command Header */}
      <DashboardHeader userName="Freelancer" />

      {/* 2. KPI Overview */}
      <StatsOverview summary={DEMO_SUMMARY} />

      {/* 3. Recent Analyses */}
      <RecentAnalyses />

      {/* 4. Performance Chart + Pipeline row */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PerformanceChart />
        </div>
        <div className="lg:col-span-2">
          <ProjectPipeline />
        </div>
      </div>

      {/* 5. Attention + Insights row */}
      <div className="grid gap-6 md:grid-cols-2">
        <NeedsAttention />
        <InsightsPanel />
      </div>
    </div>
  );
}
