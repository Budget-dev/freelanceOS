/**
 * @file apps/web/app/(app)/history/page.tsx
 * @description Project Analysis History & Audit Archive View
 *
 * WHY THIS FILE WAS CREATED:
 * Freelancers analyze dozens of project opportunities over time. This page provides a
 * searchable, filterable repository where users can revisit previous project audits,
 * compare risk ratings, review generated proposals, and reopen chat sessions.
 *
 * WHY AND HOW IT IS USED:
 * 1. Historical Audit Log:
 *    - Renders `<RecentAnalyses />` populated with saved project records, match scores,
 *      platform origins (Upwork, LinkedIn, direct client), and status tags.
 * 2. Quick Action Bridge:
 *    - Provides a prominent "Analyze New Project" action button linking directly into `/analyze`.
 * 3. Learning & Improvement:
 *    - Allows freelancers to review what made past proposals successful or examine
 *      why specific red-flagged opportunities were declined.
 */

"use client";

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

// UI Components
import { RecentAnalyses } from "@/components/dashboard/RecentAnalyses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* =========================================================================
   HistoryPage Component
   ========================================================================= */
export default function HistoryPage() {
  return (
    <div className="space-y-8 pb-12 w-full max-w-screen-xl mx-auto">

      {/* ── Page Header & Action Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Analysis History
            </h1>

            <Badge variant="outline" className="text-xs bg-slate-50 font-medium px-2.5 py-0.5">
              Saved Audits
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Review past project breakdowns, client intelligence scores, risk warnings,
            and generated proposals.
          </p>
        </div>

        {/* Action: Trigger New Project Audit */}
        <Link href="/analyze">
          <Button size="sm" className="h-10 px-5 text-xs font-semibold gap-2 rounded-lg shadow-sm">
            <Plus className="h-4 w-4" />
            <span>Analyze New Project</span>
          </Button>
        </Link>
      </div>


      {/* ── Full Interactive Analysis Records Table ── */}
      <section aria-label="Historical Analysis Records">
        <RecentAnalyses />
      </section>

    </div>
  );
}
