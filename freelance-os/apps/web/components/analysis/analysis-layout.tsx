"use client";

import { useState, useMemo } from "react";
import { ChatInterface } from "@/components/analysis/chat-interface";
import { AnalysisSummary } from "@/components/analysis/analysis-summary";
import { useMockAnalysis } from "@/hooks/use-mock-analysis";
import type { AnalysisResult } from "@/hooks/use-mock-analysis";
import { Sparkles, PanelRight, PanelRightClose, BarChart3, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function AnalysisLayout() {
  const {
    messages,
    state,
    uploadedFiles,
    addFiles,
    removeFile,
    submitMessage,
    reset,
  } = useMockAnalysis();

  const [showCard, setShowCard] = useState(true);
  const [mobileTab, setMobileTab] = useState<"chat" | "card">("chat");

  // Derive latest analysis result from the most recent assistant message
  const latestResult: AnalysisResult | null = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].analysisResult) {
        return messages[i].analysisResult!;
      }
    }
    return null;
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-8.5rem)] md:h-[calc(100vh-9.5rem)] max-h-[880px] min-h-[580px] flex-col gap-3">
      {/* ── Top Control & View Bar ── */}
      <div className="flex items-center justify-between shrink-0 px-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
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

        <div className="flex items-center gap-2">
          {/* Mobile Tab Switcher */}
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

          {/* Desktop Toggle Card Button */}
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

      {/* ── Main Responsive Layout ── */}
      <div className="flex flex-1 min-h-0 gap-5 overflow-hidden">
        {/* ── Chat Panel (Strictly Anchored & Non-Jumping) ── */}
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
              // On mobile, if user sends message, keep them in chat
              setMobileTab("chat");
            }}
            onAddFiles={addFiles}
            onRemoveFile={removeFile}
            onReset={reset}
          />
        </div>

        {/* ── Summary Card Panel (Smooth Independent Vertical Scrolling) ── */}
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

