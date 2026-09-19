"use client";

import { cn } from "@/lib/utils";
import {
  FileSearch,
  CheckCircle2,
  Send,
  MessageSquare,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

/**
 * DashboardSummary matches the system design §45 dashboard summary document.
 * Fields map directly to /accounts/{accountId}/dashboard/summary
 */
export interface DashboardSummary {
  projectsAnalyzed: number;
  goodMatches: number;
  applications: number;
  clientReplies: number;
  hired: number;
  rejected: number;
}

interface StatCardData {
  label: string;
  value: number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

function mapSummaryToCards(summary: DashboardSummary): StatCardData[] {
  const winRate =
    summary.applications > 0
      ? Math.round((summary.hired / summary.applications) * 100)
      : 0;

  return [
    {
      label: "Projects Analyzed",
      value: summary.projectsAnalyzed,
      icon: FileSearch,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      label: "Good Matches",
      value: summary.goodMatches,
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      label: "Applications Sent",
      value: summary.applications,
      icon: Send,
      iconColor: "text-violet-600",
      iconBg: "bg-violet-50",
    },
    {
      label: "Client Replies",
      value: summary.clientReplies,
      icon: MessageSquare,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
    },
    {
      label: "Projects Won",
      value: summary.hired,
      icon: Trophy,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      trend: summary.hired > 0 ? "up" : "neutral",
      trendValue: `${winRate}% win rate`,
    },
  ];
}

function TrendIndicator({
  trend,
  value,
}: {
  trend?: "up" | "down" | "neutral";
  value?: string;
}) {
  if (!trend || !value) return null;

  const Icon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const color =
    trend === "up"
      ? "text-emerald-600"
      : trend === "down"
        ? "text-red-500"
        : "text-muted-foreground";

  return (
    <span className={cn("flex items-center gap-1 text-[11px] font-medium", color)}>
      <Icon className="h-3 w-3" />
      {value}
    </span>
  );
}

interface StatsOverviewProps {
  summary: DashboardSummary;
  isLoading?: boolean;
}

export function StatsOverview({ summary, isLoading }: StatsOverviewProps) {
  const cards = mapSummaryToCards(summary);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border bg-card p-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-5 w-10 rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/30"
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  card.iconBg
                )}
              >
                <Icon className={cn("h-[18px] w-[18px]", card.iconColor)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-muted-foreground leading-tight">
                  {card.label}
                </p>
                <p className="mt-1 text-lg font-bold tracking-tight text-foreground leading-none">
                  {card.value}
                </p>
                {card.trend && (
                  <div className="mt-1.5">
                    <TrendIndicator trend={card.trend} value={card.trendValue} />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
