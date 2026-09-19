"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3 } from "lucide-react";

const TIME_RANGES = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "3M", value: "3m" },
  { label: "6M", value: "6m" },
  { label: "1Y", value: "1y" },
] as const;

interface PerformanceDataPoint {
  label: string;
  analyzed: number;
  matched: number;
}

/**
 * Demo data structured to match system design §45 metrics.
 * In production this would come from Firebase aggregation queries.
 */
const DEMO_DATA: Record<string, PerformanceDataPoint[]> = {
  "7d": [
    { label: "Mon", analyzed: 3, matched: 1 },
    { label: "Tue", analyzed: 5, matched: 3 },
    { label: "Wed", analyzed: 2, matched: 1 },
    { label: "Thu", analyzed: 7, matched: 4 },
    { label: "Fri", analyzed: 4, matched: 2 },
    { label: "Sat", analyzed: 1, matched: 1 },
    { label: "Sun", analyzed: 0, matched: 0 },
  ],
  "30d": [
    { label: "Week 1", analyzed: 12, matched: 5 },
    { label: "Week 2", analyzed: 18, matched: 8 },
    { label: "Week 3", analyzed: 9, matched: 4 },
    { label: "Week 4", analyzed: 15, matched: 7 },
  ],
  "3m": [
    { label: "Jan", analyzed: 32, matched: 14 },
    { label: "Feb", analyzed: 28, matched: 12 },
    { label: "Mar", analyzed: 41, matched: 19 },
  ],
  "6m": [
    { label: "Oct", analyzed: 20, matched: 8 },
    { label: "Nov", analyzed: 25, matched: 11 },
    { label: "Dec", analyzed: 18, matched: 7 },
    { label: "Jan", analyzed: 32, matched: 14 },
    { label: "Feb", analyzed: 28, matched: 12 },
    { label: "Mar", analyzed: 41, matched: 19 },
  ],
  "1y": [
    { label: "Apr", analyzed: 15, matched: 6 },
    { label: "May", analyzed: 19, matched: 8 },
    { label: "Jun", analyzed: 22, matched: 9 },
    { label: "Jul", analyzed: 17, matched: 7 },
    { label: "Aug", analyzed: 24, matched: 10 },
    { label: "Sep", analyzed: 21, matched: 9 },
    { label: "Oct", analyzed: 20, matched: 8 },
    { label: "Nov", analyzed: 25, matched: 11 },
    { label: "Dec", analyzed: 18, matched: 7 },
    { label: "Jan", analyzed: 32, matched: 14 },
    { label: "Feb", analyzed: 28, matched: 12 },
    { label: "Mar", analyzed: 41, matched: 19 },
  ],
};

function BarChart({ data }: { data: PerformanceDataPoint[] }) {
  const maxValue = Math.max(...data.map((d) => Math.max(d.analyzed, d.matched)), 1);

  return (
    <div className="flex items-end gap-2 sm:gap-3 h-48 sm:h-56 pt-4">
      {data.map((point, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
          <div className="flex items-end gap-[3px] w-full h-full justify-center">
            {/* Analyzed bar */}
            <div
              className="w-full max-w-[18px] rounded-t bg-primary/15 transition-all duration-300"
              style={{ height: `${(point.analyzed / maxValue) * 100}%` }}
              title={`${point.analyzed} analyzed`}
            />
            {/* Matched bar */}
            <div
              className="w-full max-w-[18px] rounded-t bg-emerald-500/70 transition-all duration-300"
              style={{ height: `${(point.matched / maxValue) * 100}%` }}
              title={`${point.matched} matched`}
            />
          </div>
          <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium truncate w-full text-center">
            {point.label}
          </span>
        </div>
      ))}
    </div>
  );
}

interface PerformanceChartProps {
  isLoading?: boolean;
}

export function PerformanceChart({ isLoading }: PerformanceChartProps) {
  const [activeRange, setActiveRange] = useState("30d");

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-5 w-40 rounded bg-muted animate-pulse" />
          <div className="h-8 w-56 rounded-lg bg-muted animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-56 rounded bg-muted/50 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const currentData = DEMO_DATA[activeRange] ?? DEMO_DATA["30d"];
  const totalAnalyzed = currentData.reduce((sum, d) => sum + d.analyzed, 0);
  const totalMatched = currentData.reduce((sum, d) => sum + d.matched, 0);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <CardTitle>Performance Overview</CardTitle>
        </div>
        <Tabs defaultValue={activeRange} onValueChange={setActiveRange}>
          <TabsList>
            {TIME_RANGES.map((range) => (
              <TabsTrigger key={range.value} value={range.value}>
                {range.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {/* Legend + summary */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mb-2 text-[12px]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary/15" />
            <span className="text-muted-foreground">Analyzed</span>
            <span className="font-semibold text-foreground">{totalAnalyzed}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500/70" />
            <span className="text-muted-foreground">Good Matches</span>
            <span className="font-semibold text-foreground">{totalMatched}</span>
          </span>
        </div>

        <BarChart data={currentData} />
      </CardContent>
    </Card>
  );
}
