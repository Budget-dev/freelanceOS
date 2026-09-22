/**
 * @file apps/web/components/analysis/analysis-layout.tsx
 * @description Master Workspace Layout for the Opportunity Analysis Studio
 *
 * WHY THIS FILE WAS CREATED:
 * Analyzing a freelance project is a dual-focus activity:
 * 1) Conversing with the AI assistant (uploading briefs, clarifying deliverables, asking questions)
 * 2) Viewing the live structured output (confidence scores, scope flags, client dossier, pricing guidance)
 * This component provides a synchronized, split-screen studio that balances these two experiences.
 *
 * WHY AND HOW IT IS USED:
 * 1. AI Analysis Orchestration (`useMockAnalysis`):
 *    - Connects to the simulated or live AI pipeline, receiving streamed responses,
 *      audit phase transitions (Extracting -> Investigating -> Matching -> Formulating), and files.
 * 2. Responsive Multi-Viewport Strategy:
 *    - Desktop (> 1024px): Split-pane layout where the chat takes the flexible left region
 *      and the analysis card is pinned to the right (410px–460px width) with independent scrolling.
 *    - Mobile (< 1024px): A segment tab switcher allows the freelancer to alternate between
 *      [Chat] and [Card] without cramped scrolling.
 * 3. Collapsible Workspace:
 *    - Desktop users can toggle the card sidebar via "Hide Card" / "Show Card" to maximize chat focus.
 */

"use client";

import React, { useState, useMemo } from "react";
import { Zap, PanelRight, PanelRightClose, BarChart3, MessageSquare } from "lucide-react";

// Subcomponents & UI Controls
import { ChatInterface } from "@/components/analysis/chat-interface";
import { AnalysisSummary } from "@/components/analysis/analysis-summary";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Hooks & Types
import { useMockAnalysis } from "@/hooks/use-mock-analysis";
import type { AnalysisResult } from "@/hooks/use-mock-analysis";

/* =========================================================================
   AnalysisLayout Component
   ========================================================================= */
export function AnalysisLayout() {

  /* ── 1. ANALYSIS PIPELINE STATE ───────────────────────────────────────── */
  const {
    messages,
    state,
    uploadedFiles,
    addFiles,
    removeFile,
    submitMessage,
    reset,
  } = useMockAnalysis();


  /* ── 2. UI VIEWPORT CONTROLS ──────────────────────────────────────────── */
  // Controls visibility of the right-side analysis summary card on desktop
  const [showCard, setShowCard] = useState<boolean>(true);

  // Controls active view tab on mobile screens ("chat" vs "card")
  const [mobileTab, setMobileTab] = useState<"chat" | "card">("chat");


  /* ── 3. COMPUTED ANALYSIS DATA ────────────────────────────────────────── */
  // Scan backwards through messages to find the most recently generated analysis result
  const latestResult: AnalysisResult | null = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].analysisResult) {
        return messages[i].analysisResult!;
      }
    }
    return null;
  }, [messages]);


  /* ── 4. RENDER ────────────────────────────────────────────────────────── */
  return (
    <div className="flex h-[calc(100vh-8.5rem)] md:h-[calc(100vh-9.5rem)] max-h-[900px] min-h-[580px] flex-col gap-3.5">

      {/* ── Top Control & View Bar ── */}
      <div className="flex items-center justify-between shrink-0 px-1">

        {/* Studio Branding & Live Confidence Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
            <Zap className="h-4 w-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground tracking-tight">
                AI Analysis Studio
              </h2>

              {latestResult && (
                <Badge variant="secondary" className="h-5 text-[10.5px] font-normal gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Score {latestResult.confidence}%
                </Badge>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Paste project content or upload assets for multi-phase AI analysis
            </p>
          </div>
        </div>


        {/* Viewport Toggles (Mobile Tabs & Desktop Panel Trigger) */}
        <div className="flex items-center gap-2">

          {/* Mobile Tab Switcher (Visible only on screens < lg) */}
          <div className="flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileTab("chat")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                mobileTab === "chat"
                  ? "bg-white text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageSquare className="size-3.5" />
              <span>Chat</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab("card")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                mobileTab === "card"
                  ? "bg-white text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BarChart3 className="size-3.5" />
              <span>Card</span>
              {latestResult && (
                <span className="size-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>


          {/* Desktop Toggle Card Button (Visible only on screens >= lg) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCard((v) => !v)}
            className="hidden lg:flex items-center gap-1.5 text-xs h-8 rounded-lg shadow-2xs font-medium hover:bg-muted/50"
            title={showCard ? "Hide Analysis Card panel" : "Show Analysis Card panel"}
          >
            {showCard ? (
              <>
                <PanelRightClose className="size-3.5" />
                <span>Hide Card</span>
              </>
            ) : (
              <>
                <PanelRight className="size-3.5" />
                <span>Show Card</span>
              </>
            )}
          </Button>

        </div>

      </div>


      {/* ── Main Dual-Pane Responsive Layout ── */}
      <div className="flex flex-1 min-h-0 gap-5 overflow-hidden">

        {/* ── Pane 1: Conversational Chat Interface (Anchored & Streamed) ── */}
        <div
          className={cn(
            "flex flex-1 flex-col h-full min-h-0 overflow-hidden rounded-xl border border-border/60 bg-white shadow-2xs transition-all duration-200",
            mobileTab === "card" ? "hidden lg:flex" : "flex"
          )}
        >
          <ChatInterface
            messages={messages}
            state={state}
            uploadedFiles={uploadedFiles}
            onSubmit={(text) => {
              submitMessage(text);
              // On mobile, keep the user on the chat tab while typing and streaming
              setMobileTab("chat");
            }}
            onAddFiles={addFiles}
            onRemoveFile={removeFile}
            onReset={reset}
          />
        </div>


        {/* ── Pane 2: Live Analysis Summary Card (Independent Vertical Scroll) ── */}
        <div
          className={cn(
            "h-full min-h-0 overflow-y-auto no-scrollbar transition-all duration-200 pr-0.5",
            mobileTab === "chat" ? "hidden lg:block" : "w-full block",
            showCard ? "lg:w-[410px] xl:w-[460px] shrink-0" : "lg:hidden"
          )}
        >
          <AnalysisSummary result={latestResult} state={state} />
        </div>

      </div>

    </div>
  );
}
