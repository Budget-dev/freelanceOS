"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRight, FileSearch, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useUserPreferences, formatCurrency } from "@/contexts/UserPreferencesContext";
import { AnalysesStorage } from "@/lib/storage";

/**
 * AnalysisMetadata matches the system design §42 analysis metadata model.
 * In production, this comes from Firestore or local storage.
 */
export interface AnalysisMetadata {
  id: string;
  accountId: string;
  status: "completed" | "running" | "failed";
  inputType: "text" | "image" | "url";
  title: string;
  recommendation: "apply" | "maybe" | "dont_apply";
  matchScore: number;
  budgetMin?: number;
  budgetMax?: number;
  currency: string;
  clientName?: string;
  createdAt: string;
  completedAt?: string;
}

function formatBudget(min?: number, max?: number, currencyPref: "USD" | "INR" = "USD"): string {
  if (!min && !max) return "—";
  if (min && max) return `${formatCurrency(min, currencyPref)} – ${formatCurrency(max, currencyPref)}`;
  if (min) return `${formatCurrency(min, currencyPref)}+`;
  return `Up to ${formatCurrency(max!, currencyPref)}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const recommendationLabels: Record<string, string> = {
  apply: "Apply",
  maybe: "Maybe",
  dont_apply: "Don't Apply",
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.25, ease: "easeOut" },
  }),
};

interface RecentAnalysesProps {
  analyses?: AnalysisMetadata[];
  isLoading?: boolean;
}

export function RecentAnalyses({ analyses, isLoading }: RecentAnalysesProps) {
  const { currency } = useUserPreferences();
  const [storedAnalyses, setStoredAnalyses] = useState<AnalysisMetadata[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (analyses) {
      setStoredAnalyses(analyses);
      setIsLoaded(true);
    } else {
      const all = AnalysesStorage.getAll().map((a) => ({
        id: a.id,
        accountId: a.accountId || "local",
        status: a.status,
        inputType: a.inputType,
        title: a.title,
        recommendation: a.recommendation,
        matchScore: a.matchScore,
        budgetMin: a.budgetMin,
        budgetMax: a.budgetMax,
        currency: a.currency,
        clientName: a.clientName,
        createdAt: a.createdAt,
        completedAt: a.completedAt,
      }));
      setStoredAnalyses(all);
      setIsLoaded(true);
    }
  }, [analyses]);

  const data = analyses ?? storedAnalyses;
  const loading = isLoading ?? !isLoaded;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <FileSearch className="h-4 w-4 text-muted-foreground" />
          <CardTitle>Recent Analyses</CardTitle>
        </div>
        <Link
          href="/history"
          className="flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          View All
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {loading ? (
          <div className="px-5 pb-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-4 flex-1 rounded bg-muted" />
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="h-4 w-16 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
            <FileSearch className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground">
              No project analyses yet
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground max-w-xs">
              Start by analyzing your first freelance project to see insights here.
            </p>
            <Link href="/analyze" className="mt-4">
              <Button size="sm" className="rounded-lg gap-1.5 font-medium">
                Analyze New Project
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-[180px]">Project</TableHead>
                  <TableHead className="hidden sm:table-cell">Client</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="hidden md:table-cell">Est. Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="text-right w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((analysis, index) => (
                  <motion.tr
                    key={analysis.id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={rowVariants}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate max-w-[200px] lg:max-w-[260px]">
                          {analysis.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {analysis.clientName ?? "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {analysis.status === "running" ? (
                        <span className="text-[12px] text-blue-600 font-medium">
                          Running…
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            analysis.matchScore >= 80
                              ? "text-emerald-600"
                              : analysis.matchScore >= 60
                                ? "text-amber-600"
                                : "text-red-500"
                          )}
                        >
                          {analysis.matchScore}%
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-[13px]">
                      {formatBudget(
                        analysis.budgetMin,
                        analysis.budgetMax,
                        currency
                      )}
                    </TableCell>
                    <TableCell>
                      {analysis.status === "running" ? (
                        <Badge variant="running">Analyzing</Badge>
                      ) : analysis.status === "failed" ? (
                        <Badge variant="failed">Failed</Badge>
                      ) : (
                        <Badge variant={analysis.recommendation}>
                          {recommendationLabels[analysis.recommendation]}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-[13px]">
                      {formatDate(analysis.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/history/${analysis.id}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="View analysis"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
