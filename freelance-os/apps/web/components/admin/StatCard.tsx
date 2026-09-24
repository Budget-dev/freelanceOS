/**
 * @file apps/web/components/admin/StatCard.tsx
 * @description Operational Metric Card Component
 */

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeColor?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  badge,
  badgeColor = "bg-muted text-muted-foreground",
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-card p-4 shadow-xs transition-all hover:border-border",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
        {badge && (
          <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold border", badgeColor)}>
            {badge}
          </span>
        )}
      </div>

      {(subtext || trend) && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          {trend && (
            <span
              className={cn(
                "font-semibold",
                trend.isPositive ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {trend.value}
            </span>
          )}
          {subtext && <span className="truncate">{subtext}</span>}
        </div>
      )}
    </div>
  );
}
