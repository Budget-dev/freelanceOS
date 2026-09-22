"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  TrendingUp,
  Target,
  Zap,
} from "lucide-react";

export interface Insight {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
}

/**
 * Insights derived from system design §9.1 performance metrics:
 * Match Rate, Application Rate, Reply Rate, Hire Rate.
 * In production these are computed from the dashboard summary.
 */
const DEMO_INSIGHTS: Insight[] = [
  {
    id: "ins_1",
    icon: TrendingUp,
    iconColor: "text-emerald-600",
    title: "Analysis activity increased",
    description:
      "You analyzed 41 projects this month, up from 28 last month. Higher volume improves your pipeline.",
  },
  {
    id: "ins_2",
    icon: Target,
    iconColor: "text-blue-600",
    title: "Strong match rate",
    description:
      "46% of your analyzed projects are Good Matches. Focus applications on these high-score opportunities.",
  },
  {
    id: "ins_3",
    icon: Zap,
    iconColor: "text-amber-600",
    title: "Reply rate opportunity",
    description:
      "Your client reply rate is 39%. Projects with match scores above 80% have 2× higher reply rates.",
  },
];

interface InsightsPanelProps {
  insights?: Insight[];
  isLoading?: boolean;
}

export function InsightsPanel({ insights, isLoading }: InsightsPanelProps) {
  const data = insights ?? DEMO_INSIGHTS;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-5 w-40 rounded bg-muted animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-lg bg-muted shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-44 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <CardTitle>Performance Insights</CardTitle>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          View All
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="py-6 text-center">
            <Zap className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">
              Not enough data yet
            </p>
            <p className="text-[13px] text-muted-foreground mt-1 max-w-xs mx-auto">
              Complete more analyses to unlock performance insights.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {data.map((insight) => {
              const Icon = insight.icon;
              return (
                <div
                  key={insight.id}
                  className="flex items-start gap-3 rounded-lg px-3 py-3 -mx-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 mt-0.5">
                    <Icon className={cn("h-4 w-4", insight.iconColor)} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground">
                      {insight.title}
                    </p>
                    <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">
                      {insight.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
