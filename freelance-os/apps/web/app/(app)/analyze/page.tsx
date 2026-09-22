/**
 * @file apps/web/app/(app)/analyze/page.tsx
 * @description Opportunity Analysis Studio Page for FreelanceOS
 *
 * WHY THIS FILE WAS CREATED:
 * This is the flagship interaction workspace of FreelanceOS (`/analyze`). Here, freelancers
 * paste client briefs, drop project specification PDFs or screenshots, or paste job URLs
 * to trigger a comprehensive multi-phase AI evaluation.
 *
 * WHY AND HOW IT IS USED:
 * 1. Entry Point to AI Engine:
 *    - Renders `<AnalysisLayout />`, which coordinates the conversational AI chat interface,
 *      multi-file asset uploader, real-time stage progress trackers, and dynamic project audit card.
 * 2. Multi-Phase Analysis Workflow:
 *    - Stage 1: Brief Extraction & Entity Parsing
 *    - Stage 2: Client Intelligence & Public Footprint Research
 *    - Stage 3: Scope Risk & Ambiguity Detection
 *    - Stage 4: Profile Match & Skill Gap Cross-Reference
 *    - Stage 5: Pricing Guidance & Proposal Generation
 */

"use client";

import React from "react";
import { AnalysisLayout } from "@/components/analysis/analysis-layout";

/* =========================================================================
   AnalyzePage Component
   ========================================================================= */
export default function AnalyzePage() {
  return (
    <div className="w-full h-full">
      <AnalysisLayout />
    </div>
  );
}

