"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, GitBranch } from "lucide-react";

/**
 * Pipeline stages from the system design §44 application lifecycle.
 * Stage counts come from /accounts/{accountId}/dashboard/summary
 */
export interface PipelineStage {
  key: string;
  label: string;
  count: number;
  color: string;
  bgColor: string;
}

const DEMO_PIPELINE: PipelineStage[] = [
  { key: "new", label: "New", count: 8, color: "text-slate-600", bgColor: "bg-slate-100" },
  { key: "analyzed", label: "Analyzed", count: 12, color: "text-blue-600", bgColor: "bg-blue-50" },
  { key: "good_match", label: "Good Match", count: 5, color: "text-emerald-600", bgColor: "bg-emerald-50" },
  { key: "applied", label: "Applied", count: 4, color: "text-violet-600", bgColor: "bg-violet-50" },
  { key: "client_replied", label: "Replied", count: 2, color: "text-amber-600", bgColor: "bg-amber-50" },
  { key: "hired", label: "Won", count: 1, color: "text-emerald-700", bgColor: "bg-emerald-100" },
];

interface ProjectPipelineProps {
  stages?: PipelineStage[];
  isLoading?: boolean;
}

export function ProjectPipeline({ stages, isLoading }: ProjectPipelineProps) {
  const data = stages ?? DEMO_PIPELINE;
  const total = data.reduce((sum, s) => sum + s.count, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-5 w-36 rounded bg-muted animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-1 h-20 rounded-lg bg-muted animate-pulse min-w-[80px]" />
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
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <CardTitle>Project Pipeline</CardTitle>
        </div>
        <Link
          href="/app/applications"
          className="flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          View All
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {/* Pipeline progress bar */}
        {total > 0 && (
          <div className="flex h-2 rounded-full overflow-hidden bg-muted mb-5">
            {data.map((stage) => {
              const pct = total > 0 ? (stage.count / total) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={stage.key}
                  className={cn("transition-all duration-300", stage.bgColor)}
                  style={{ width: `${pct}%` }}
                  title={`${stage.label}: ${stage.count}`}
                />
              );
            })}
          </div>
        )}

        {/* Stage cards */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
          {data.map((stage, i) => (
            <Link
              key={stage.key}
              href={`/applications?stage=${stage.key}`}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border px-3 py-3 min-w-[80px] flex-1 transition-colors hover:bg-muted/50 group",
                stage.count > 0 ? "border-border/60" : "border-border/30 opacity-60"
              )}
            >
              <span
                className={cn(
                  "text-lg font-bold leading-none",
                  stage.count > 0 ? stage.color : "text-muted-foreground"
                )}
              >
                {stage.count}
              </span>
              <span className="mt-1.5 text-[10px] sm:text-[11px] font-medium text-muted-foreground text-center leading-tight whitespace-nowrap">
                {stage.label}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
