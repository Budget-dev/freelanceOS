"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink, Sparkles, Building2, CheckCircle2, Clock, DollarSign, ShieldAlert, Share2, FileSearch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnalysesStorage, ApplicationsStorage, type SavedAnalysis, type ApplicationItem } from "@/lib/storage";
import { StageBadge } from "@/components/applications/applications-view";

export default function AnalysisDetailPage() {
  const params = useParams();
  const analysisId = (params?.analysisId as string) || "";

  const [analysis, setAnalysis] = useState<SavedAnalysis | null>(null);
  const [application, setApplication] = useState<ApplicationItem | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (analysisId) {
      const item = AnalysesStorage.getById(analysisId);
      if (item) setAnalysis(item);

      const appItem = ApplicationsStorage.getById(analysisId);
      if (appItem) setApplication(appItem);
    }
    setIsLoaded(true);
  }, [analysisId]);

  if (!isLoaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
        <FileSearch className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <h2 className="text-lg font-bold text-foreground">Analysis Record Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          This project audit could not be found. Start a new brief analysis to evaluate opportunities.
        </p>
        <Link href="/analyze">
          <Button size="sm" className="rounded-lg">
            Start New Analysis
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* ── Breadcrumb & Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/history"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-white hover:bg-slate-50 transition-colors text-slate-700 shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Analysis History</span>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-medium text-foreground">{analysis.title}</span>
              {application && (
                <div className="ml-1.5">
                  <StageBadge stage={application.stage} />
                </div>
              )}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground mt-0.5">
              {analysis.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/applications/${analysis.id}`}>
            <Button size="sm" className="h-8.5 text-xs font-semibold gap-1.5 bg-primary text-white shadow-sm">
              <ExternalLink className="h-3.5 w-3.5" />
              Open Application Dossier
            </Button>
          </Link>
          <Link href="/analyze">
            <Button variant="outline" size="sm" className="h-8.5 text-xs font-semibold shadow-2xs">
              New Project Audit
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Overview Card ── */}
      <Card className="border-border/60 shadow-xs">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Recommendation
              </span>
              <div className="mt-1.5">
                <Badge className={analysis.recommendation === "apply" ? "bg-emerald-100 text-emerald-800 border-0" : "bg-amber-100 text-amber-800 border-0"}>
                  {analysis.recommendation === "apply" ? "High Fit — Apply" : "Review Closely — Maybe"}
                </Badge>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Match Score
              </span>
              <div className="mt-1 font-bold text-xl text-emerald-600">
                {analysis.matchScore}% Match
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Evaluated against your verified skills
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Client / Platform
              </span>
              <div className="mt-1 font-bold text-base text-foreground">
                {analysis.clientName || "Direct Opportunity"}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {analysis.currency} Fixed / Hourly Scope
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Risk Signals
              </span>
              <div className="mt-1 font-bold text-sm text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{analysis.riskFlags?.length ? `${analysis.riskFlags.length} Flags Detected` : "Standard Scope"}</span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Audited by FreelanceOS
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Key Findings & Intelligence ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Key Project Findings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-600">
            {analysis.keyFindings && analysis.keyFindings.length > 0 ? (
              <ul className="list-disc pl-4 space-y-1.5">
                {analysis.keyFindings.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            ) : (
              <p>{analysis.summary || "Complete deliverables and scope extracted successfully."}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Analysis Summary & Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <p>
              {analysis.summary || "Review the requirements, cross-reference against your availability, and formulate your tailored proposal."}
            </p>
            <div className="pt-3 flex flex-wrap items-center gap-2">
              <Link href={`/applications/${analysis.id}`}>
                <Button size="sm" className="text-xs font-semibold gap-1.5 shadow-2xs">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Full Application Dossier
                </Button>
              </Link>
              <Link href="/analyze">
                <Button size="sm" variant="outline" className="text-xs font-semibold shadow-2xs">
                  Open in Analysis Studio
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
