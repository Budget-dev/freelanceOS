"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Plus, Briefcase, FileSearch, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/providers/AuthContext";

// Dashboard Feature Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { RecentAnalyses } from "@/components/dashboard/RecentAnalyses";
import { ProjectPipeline } from "@/components/dashboard/ProjectPipeline";
import { NeedsAttention } from "@/components/dashboard/NeedsAttention";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";

// Storage & Types
import { AnalysesStorage, ApplicationsStorage } from "@/lib/storage";
import type { DashboardSummary } from "@/components/dashboard/StatsOverview";
import type { PipelineStage } from "@/components/dashboard/ProjectPipeline";
import type { AttentionItem } from "@/components/dashboard/NeedsAttention";
import type { Insight } from "@/components/dashboard/InsightsPanel";
import { Key, User, Clock, TrendingUp, Target, Zap } from "lucide-react";

/* =========================================================================
   DashboardPage Component
   ========================================================================= */
export default function DashboardPage() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState(AnalysesStorage.getAll());
  const [applications, setApplications] = useState(ApplicationsStorage.getAll());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setAnalyses(AnalysesStorage.getAll());
    setApplications(ApplicationsStorage.getAll());
    setIsLoaded(true);
  }, []);

  // Compute dynamic summary metrics from real user data
  const summary: DashboardSummary = {
    projectsAnalyzed: analyses.length,
    goodMatches: analyses.filter((a) => a.matchScore >= 70 || a.recommendation === "apply").length,
    applications: applications.length,
    clientReplies: applications.filter((a) => a.stage === "client_replied").length,
    hired: applications.filter((a) => a.stage === "hired").length,
    rejected: applications.filter((a) => a.stage === "rejected").length,
  };

  // Compute dynamic pipeline stages
  const pipelineStages: PipelineStage[] = [
    { key: "analyzed", label: "Analyzed", count: analyses.length, color: "text-blue-600", bgColor: "bg-blue-50" },
    { key: "good_match", label: "Good Match", count: summary.goodMatches, color: "text-emerald-600", bgColor: "bg-emerald-50" },
    { key: "applied", label: "Applied", count: applications.filter((a) => a.stage === "applied").length, color: "text-violet-600", bgColor: "bg-violet-50" },
    { key: "client_replied", label: "Replied", count: summary.clientReplies, color: "text-amber-600", bgColor: "bg-amber-50" },
    { key: "hired", label: "Won", count: summary.hired, color: "text-emerald-700", bgColor: "bg-emerald-100" },
  ];

  // Dynamic attention items
  const attentionItems: AttentionItem[] = [];
  if (analyses.length === 0) {
    attentionItems.push({
      id: "att_analyze",
      type: "analysis_review",
      title: "Analyze your first freelance project",
      description: "Paste a client brief or project URL to uncover hidden red flags and generate proposals.",
      actionLabel: "Analyze Brief",
      actionHref: "/analyze",
      icon: FileSearch,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      priority: "high",
    });
  }
  if (applications.filter((a) => a.stage === "client_replied").length > 0) {
    attentionItems.push({
      id: "att_replied",
      type: "follow_up",
      title: `${summary.clientReplies} Client Response${summary.clientReplies > 1 ? "s" : ""} Waiting`,
      description: "Clients have replied to your proposals. Follow up promptly to secure the interview.",
      actionLabel: "View Replies",
      actionHref: "/applications/replied",
      icon: Clock,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      priority: "high",
    });
  }
  if (!user?.displayName) {
    attentionItems.push({
      id: "att_profile",
      type: "profile_incomplete",
      title: "Set up your freelancer profile",
      description: "Your verified skills and target rate power custom match scores and proposal generation.",
      actionLabel: "Complete Profile",
      actionHref: "/profile/personal",
      icon: User,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      priority: "medium",
    });
  }

  // Dynamic insights
  const insights: Insight[] = [
    {
      id: "ins_1",
      icon: TrendingUp,
      iconColor: "text-emerald-600",
      title: analyses.length > 0 ? `${analyses.length} Total Audits Completed` : "Ready for your first analysis",
      description: analyses.length > 0
        ? `You have audited ${analyses.length} project opportunities with verified client intelligence.`
        : "Paste any freelance brief to generate instant scope risk audits and pricing guidance.",
    },
    {
      id: "ins_2",
      icon: Target,
      iconColor: "text-blue-600",
      title: summary.goodMatches > 0 ? `${summary.goodMatches} High-Fit Opportunities` : "Opportunity Intelligence",
      description: summary.goodMatches > 0
        ? `${Math.round((summary.goodMatches / (analyses.length || 1)) * 100)}% of your audited projects match your core skillset.`
        : "FreelanceOS analyzes client requirements against your verified skills to maximize win rates.",
    },
    {
      id: "ins_3",
      icon: Zap,
      iconColor: "text-amber-600",
      title: applications.length > 0 ? `${applications.length} Active Application Records` : "Pipeline Tracking",
      description: applications.length > 0
        ? `Track your proposals from Applied to Client Replied and Hired directly from the dashboard.`
        : "Organize client proposals across 4 pipeline stages to maintain a predictable freelance income.",
    },
  ];

  const userName = user?.displayName || user?.email?.split("@")[0] || "Freelancer";

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-8">

      {/* ── 1. Welcome / Quick Actions Command Header ── */}
      <section aria-label="Dashboard Overview Header">
        <DashboardHeader userName={userName} />
      </section>

      {/* ── Guided Getting Started Banner for Brand New Users ── */}
      {analyses.length === 0 && applications.length === 0 && (
        <Card className="border-border/70 bg-gradient-to-r from-slate-50 via-white to-slate-50/80 shadow-xs">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-semibold">
                  <Sparkles className="w-3 h-3" />
                  <span>Welcome to FreelanceOS</span>
                </div>
                <h3 className="text-lg font-bold text-foreground tracking-tight pt-1">
                  Ready to audit your first client project?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                  Start by pasting a raw project brief. FreelanceOS will extract deliverables, research the client, spot hidden scope risks, and generate a truth-checked proposal.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link href="/analyze">
                  <Button size="sm" className="h-9 px-4 text-xs font-semibold gap-1.5 shadow-sm">
                    <Plus className="h-3.5 w-3.5" />
                    Analyze Project
                  </Button>
                </Link>
                <Link href="/profile/portfolio">
                  <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-semibold gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    Set Up Portfolio
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── 2. Top-Level Metric Cards (KPIs) ── */}
      <section aria-label="Key Performance Indicators">
        <StatsOverview summary={summary} />
      </section>

      {/* ── 3. Recent Opportunity Analyses ── */}
      <section aria-label="Recent Opportunity Analyses">
        <RecentAnalyses />
      </section>

      {/* ── 4. Analytics & Pipeline Breakdown Row ── */}
      <section aria-label="Performance and Pipeline Analytics">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* 60% Column: Historical Proposal Performance Chart */}
          <div className="lg:col-span-3">
            <PerformanceChart />
          </div>

          {/* 40% Column: Active Applications Pipeline Kanban */}
          <div className="lg:col-span-2">
            <ProjectPipeline stages={pipelineStages} />
          </div>
        </div>
      </section>

      {/* ── 5. Action Items & Market Recommendations Row ── */}
      <section aria-label="Critical Alerts and Market Insights">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Urgent items requiring immediate freelancer response */}
          <NeedsAttention items={attentionItems} />

          {/* Platform AI market trends, pricing tips, and portfolio advice */}
          <InsightsPanel insights={insights} />
        </div>
      </section>

    </div>
  );
}
