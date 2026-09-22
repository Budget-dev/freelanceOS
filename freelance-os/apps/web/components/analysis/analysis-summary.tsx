"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, User, Globe, MapPin, Search, Mail, MessageSquare,
  Linkedin, Copy, Check, ExternalLink, ShieldCheck, AlertTriangle,
  TrendingUp, Zap, Clock, DollarSign, CheckCircle2,
  ChevronDown, ChevronUp, FileText, Layers, Award, Hash, BarChart3,
  Loader2, Radio, CheckSquare, Eye, HelpCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ContactCard, NoContactsCard } from "@/components/analysis/contact-card";
import type { AnalysisResult, AnalysisState } from "@/hooks/use-mock-analysis";
import { ApplicationsStorage } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface AnalysisSummaryProps {
  result: AnalysisResult | null;
  state: AnalysisState;
}

// ── Confidence Meter ───────────────────────────────────────────────────

function ConfidenceMeter({ value }: { value: number }) {
  const color =
    value >= 80
      ? "bg-emerald-500"
      : value >= 60
      ? "bg-amber-500"
      : "bg-red-500";
  const textColor =
    value >= 80
      ? "text-emerald-600"
      : value >= 60
      ? "text-amber-600"
      : "text-red-600";

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className={cn("text-xs font-bold tabular-nums", textColor)}>
        {value}%
      </span>
    </div>
  );
}

// ── Loading Skeleton ───────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-1">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );
}

// ── Copy Button Helper ─────────────────────────────────────────────────

function CopyAction({
  text,
  label = "Copy",
  size = "sm",
  variant = "outline",
  className = "",
}: {
  text: string;
  label?: string;
  size?: "sm" | "default" | "icon";
  variant?: "outline" | "ghost" | "secondary" | "default";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn("transition-all gap-1.5", className)}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-500" />
          {size !== "icon" && <span className="text-emerald-600 font-medium">Copied!</span>}
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {size !== "icon" && <span>{label}</span>}
        </>
      )}
    </Button>
  );
}

// ── Main Analysis Summary ──────────────────────────────────────────────

export function AnalysisSummary({ result, state }: AnalysisSummaryProps) {
  const [findingsOpen, setFindingsOpen] = useState(true);
  const [geoNotesOpen, setGeoNotesOpen] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    if (!result) {
      setIsApplied(false);
      return;
    }
    const targetId = result.client.projectId || result.id;
    const existing = ApplicationsStorage.getById(targetId);
    setIsApplied(
      existing?.stage === "applied" ||
      existing?.stage === "client_replied" ||
      existing?.stage === "hired"
    );
  }, [result]);

  if (state === "idle") {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
            <BarChart3 className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Analysis results will appear here
          </p>
          <p className="mt-1 max-w-[260px] text-xs text-muted-foreground">
            Paste a project description or client profile to extract location, run web scraping, and generate outreach drafts.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (state === "processing") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Analyzing Client & Scraping Web Intelligence...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (state === "error" && !result) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Analysis failed
          </p>
          <p className="mt-1 max-w-[240px] text-xs text-muted-foreground">
            An unexpected error occurred. Please try submitting your content again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  const { client, keyFindings, riskFlags, confidence, analyzedInputs } = result;
  const { location, webIntelligence, outreach } = client;
  const hasContacts = client.contacts.length > 0;
  const verifiedCount = client.contacts.filter((c) => c.status === "verified").length;
  const potentialCount = client.contacts.filter((c) => c.status === "potential").length;

  const handleAddToApplied = () => {
    const targetId = client.projectId || result.id;
    ApplicationsStorage.transitionStage(
      targetId,
      "applied",
      "Moved directly to Applied from Analysis Studio"
    );
    setIsApplied(true);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={result.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-3.5"
      >
        {/* ── Top Lifecycle Action Bar ── */}
        <div className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/70 rounded-xl border border-blue-200/60 shadow-2xs">
          {isApplied ? (
            <Button
              size="sm"
              disabled
              className="bg-emerald-600 text-white font-semibold text-xs h-8.5 gap-1.5 flex-1 cursor-default opacity-100 shadow-2xs"
            >
              <CheckCircle2 className="h-4 w-4" />
              In Applied Pipeline
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleAddToApplied}
              className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-8.5 gap-1.5 flex-1 shadow-sm transition-all"
            >
              <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
              Add to Applied
            </Button>
          )}

          <Link href={`/applications/${client.projectId || result.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="h-8.5 text-xs font-semibold gap-1.5 bg-white hover:bg-slate-50 border-border/80 shadow-2xs text-slate-800"
            >
              <Eye className="h-3.5 w-3.5 text-slate-500" />
              <span>Full Dossier</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </Button>
          </Link>
        </div>

        {/* ── Confidence & Quick Signals Bar ── */}
        <Card className="border-border/60 shadow-2xs">
          <CardHeader className="pb-2 pt-3.5 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <TrendingUp className="h-3.5 w-3.5 text-slate-600" />
                Intelligence Confidence
              </CardTitle>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-[10px] h-5 font-mono gap-1">
                  <Hash className="h-2.5 w-2.5" />
                  {client.projectId}
                </Badge>
                <CopyAction text={client.projectId} label="ID" size="icon" variant="ghost" className="h-6 w-6" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3.5 px-4">
            <ConfidenceMeter value={confidence} />
          </CardContent>
        </Card>

        {/* ── Card 1: Client Profile & Location Intelligence ── */}
        <Card className="border-border/60 shadow-2xs">
          <CardHeader className="pb-2.5 pt-3.5 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Building2 className="h-4 w-4 text-slate-700" />
                Client Profile & Location
              </CardTitle>
              {location.isGeoScraped && (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/70 text-[10px] h-5 gap-1 font-normal">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Geo-Scraped
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            {/* Identity Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-50 border border-border/40 p-2.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Client Name</p>
                <p className="text-xs font-semibold text-foreground truncate mt-0.5">
                  {client.name || "Inferred from scope"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-border/40 p-2.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Organization / Brand</p>
                <p className="text-xs font-semibold text-foreground truncate mt-0.5">
                  {client.company || "Independent Client"}
                </p>
              </div>
            </div>

            {/* Location & Geo Scraping Banner */}
            <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{location.flagEmoji}</span>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      {location.displayLocation}
                    </p>
                    <p className="text-[10.5px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {location.timezone}
                    </p>
                  </div>
                </div>

                <Badge variant="secondary" className="text-[10px] font-normal h-5">
                  {location.regionalMarketRate.split("(")[0].trim()}
                </Badge>
              </div>

              {/* Scraped Registry & Compliance */}
              <div className="pt-1 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setGeoNotesOpen(!geoNotesOpen)}
                  className="flex items-center justify-between w-full text-[11px] text-slate-600 font-medium hover:text-foreground transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    Registry & Regional Signals ({location.geoScrapingNotes.length})
                  </span>
                  {geoNotesOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>

                <AnimatePresence>
                  {geoNotesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 space-y-1 overflow-hidden"
                    >
                      {location.geoScrapingNotes.map((note, idx) => (
                        <p key={idx} className="text-[11px] text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{note}</span>
                        </p>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Direct Contacts Sub-section */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Discovered Channels
                </span>
                {hasContacts && (
                  <div className="flex items-center gap-1">
                    {verifiedCount > 0 && (
                      <Badge variant="completed" className="text-[9.5px] h-4.5 px-1.5">
                        {verifiedCount} verified
                      </Badge>
                    )}
                    {potentialCount > 0 && (
                      <Badge variant="maybe" className="text-[9.5px] h-4.5 px-1.5">
                        {potentialCount} unverified
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {hasContacts ? (
                client.contacts.map((contact, i) => (
                  <ContactCard key={`${contact.type}-${i}`} contact={contact} />
                ))
              ) : (
                <NoContactsCard />
              )}

              {verifiedCount === 0 && (
                <div className="mt-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] text-slate-700 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-slate-800">
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                    No Verified Direct Contact Information Found
                  </div>
                  <p className="text-[10.5px] text-muted-foreground leading-snug">
                    Checked domain DNS, Google Business listings, LinkedIn directory, and project brief text. No direct WhatsApp, phone number, or corporate email is publicly published. Outreach recommended via Freelancer.com chat and LinkedIn proposal.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Evidence Tri-Classification: CONFIRMED • INFERRED • UNKNOWN ── */}
        <Card className="border-border/60 shadow-2xs">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Evidence Verification Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-3.5 text-xs">
            {/* Confirmed */}
            <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/40 p-2.5 space-y-0.5">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>CONFIRMED FACTS</span>
              </div>
              <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                • Scope deliverables & requirements directly specified by client in brief.
                <br />
                • Employer reputation telemetry: 4.9★ with verified payment history.
                {verifiedCount > 0 ? `\n• ${verifiedCount} verified direct contact channel(s) confirmed.` : ""}
              </p>
            </div>

            {/* Inferred */}
            <div className="rounded-lg border border-amber-200/80 bg-amber-50/40 p-2.5 space-y-0.5">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[11px]">
                <Zap className="h-3.5 w-3.5 text-amber-600" />
                <span>INFERRED INTELLIGENCE</span>
              </div>
              <p className="text-[11px] text-amber-900/80 leading-relaxed">
                • Organization identity: Probable match for &quot;{client.company || client.name}&quot; (cross-referenced against same-name entities).
                <br />
                • Regional market standard: {location.regionalMarketRate}.
              </p>
            </div>

            {/* Unknown */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 space-y-0.5">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
                <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                <span>UNKNOWN / UNLISTED</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {verifiedCount === 0
                  ? "• Direct phone / WhatsApp: None found in public indices."
                  : "• Exact postal registration office unverified."}
                <br />
                • Unbounded revision clauses: Not explicitly capped by client.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Card 2: Live Web & Google Search Scraping ── */}
        <Card className="border-border/60 shadow-2xs">
          <CardHeader className="pb-2 pt-3.5 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Globe className="h-4 w-4 text-blue-600" />
                Live Web & LinkedIn Scraping
              </CardTitle>
              <Badge variant="secondary" className="text-[10px] font-normal h-5 gap-1">
                <Search className="h-2.5 w-2.5 text-muted-foreground" />
                Google & Registry
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            {/* Search & Crawl Pipeline with Research Transparency */}
            <div className="rounded-lg bg-slate-900 text-slate-300 p-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1.5">
                <span className="font-mono flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  REAL-TIME RESEARCH AUDIT TRAIL
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-mono text-[9.5px]">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Audited Live
                </span>
              </div>
              <div className="space-y-1.5 font-mono text-[10.5px]">
                {webIntelligence.searchQueries.map((q, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-slate-300 leading-snug">
                    <span className="text-emerald-400 select-none font-bold">✓</span>
                    <span className="text-slate-300 break-all">{q}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-800 pt-1.5 text-[9.5px] text-slate-400 flex items-start gap-1 leading-normal font-sans">
                <HelpCircle className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Strict Transparency: No contact details are fabricated. If public phone/WhatsApp is unavailable, it is marked unlisted.
                </span>
              </div>
            </div>

            {/* Scraped Company Profile */}
            <div className="rounded-lg border border-border/60 bg-slate-50/50 p-2.5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {webIntelligence.scrapedCompany.headline}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {webIntelligence.scrapedCompany.industry} • {webIntelligence.scrapedCompany.teamSize}
                  </p>
                </div>
                <Badge variant="outline" className="text-[9.5px] h-4.5 bg-white">
                  {webIntelligence.linkedinProfile.status}
                </Badge>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                {webIntelligence.scrapedCompany.summary}
              </p>

              {/* Detected Tech Stack */}
              <div className="flex flex-wrap gap-1 pt-1">
                {webIntelligence.scrapedCompany.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-[10px] font-normal h-5 bg-white text-slate-700">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Client Reputation Matrix */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="rounded-lg bg-slate-50 border border-border/40 p-2">
                <p className="text-[10px] text-muted-foreground">Rating</p>
                <p className="text-xs font-bold text-foreground">★ {webIntelligence.clientReputation.rating}</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-border/40 p-2">
                <p className="text-[10px] text-muted-foreground">Payment</p>
                <p className="text-xs font-bold text-emerald-600">Verified</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-border/40 p-2">
                <p className="text-[10px] text-muted-foreground">Award Rate</p>
                <p className="text-xs font-bold text-foreground">{webIntelligence.clientReputation.hireRate.split(" ")[0]}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Card 3: Outreach Generation (Email, WhatsApp, LinkedIn) ── */}
        <Card className="border-border/60 shadow-2xs">
          <CardHeader className="pb-2 pt-3.5 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Zap className="h-4 w-4 text-primary" />
                Personalized Outreach Studio
              </CardTitle>
              <Badge variant="outline" className="text-[10px] h-5 font-normal">
                1-Click Ready
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Drafts personalized to {client.name || "the client"} with {location.displayLocation} timezone alignment.
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid grid-cols-3 w-full h-8 p-0.5 bg-muted/60">
                <TabsTrigger value="email" className="text-[11px] gap-1 py-1">
                  <Mail className="h-3 w-3" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="whatsapp" className="text-[11px] gap-1 py-1">
                  <MessageSquare className="h-3 w-3 text-emerald-600" />
                  WhatsApp
                </TabsTrigger>
                <TabsTrigger value="linkedin" className="text-[11px] gap-1 py-1">
                  <Linkedin className="h-3 w-3 text-blue-600" />
                  LinkedIn
                </TabsTrigger>
              </TabsList>

              {/* ── Tab 1: Email Draft ── */}
              <TabsContent value="email" className="mt-2.5 space-y-2">
                <div className="rounded-lg border border-border/60 bg-slate-50/70 p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">Subject Line</span>
                    <CopyAction text={outreach.email.subject} label="Copy Subject" size="sm" variant="ghost" className="h-6 text-[11px]" />
                  </div>
                  <p className="text-xs font-medium text-foreground bg-white p-1.5 rounded border border-border/40 select-all">
                    {outreach.email.subject}
                  </p>
                </div>

                <div className="rounded-lg border border-border/60 bg-white p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">Body</span>
                    <CopyAction text={outreach.email.body} label="Copy Full Email" size="sm" variant="outline" className="h-7 text-xs" />
                  </div>
                  <div className="max-h-60 overflow-y-auto pr-1 text-[12px] text-slate-700 whitespace-pre-wrap font-sans leading-relaxed border-t border-border/40 pt-2 select-text">
                    {outreach.email.body}
                  </div>
                </div>
              </TabsContent>

              {/* ── Tab 2: WhatsApp Message ── */}
              <TabsContent value="whatsapp" className="mt-2.5 space-y-2">
                <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/30 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-medium">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                      Instant WhatsApp Template
                    </div>
                    <CopyAction text={outreach.whatsapp.text} label="Copy WhatsApp" size="sm" variant="outline" className="h-7 text-xs bg-white" />
                  </div>

                  <div className="rounded-lg bg-white border border-emerald-100 p-2.5 text-[12px] text-slate-800 whitespace-pre-wrap leading-relaxed shadow-2xs select-text">
                    {outreach.whatsapp.text}
                  </div>
                </div>
              </TabsContent>

              {/* ── Tab 3: LinkedIn Outreach ── */}
              <TabsContent value="linkedin" className="mt-2.5 space-y-2.5">
                {/* Connection Note */}
                <div className="rounded-lg border border-border/60 bg-slate-50/50 p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                      Connection Note ({outreach.linkedin.charCount}/300)
                    </span>
                    <CopyAction text={outreach.linkedin.connectionNote} label="Copy Note" size="sm" variant="ghost" className="h-6 text-[11px]" />
                  </div>
                  <p className="text-[12px] text-slate-700 bg-white p-2 rounded border border-border/40 leading-relaxed select-text">
                    {outreach.linkedin.connectionNote}
                  </p>
                </div>

                {/* InMail */}
                <div className="rounded-lg border border-border/60 bg-white p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">InMail Message</span>
                    <CopyAction text={outreach.linkedin.inmailMessage} label="Copy InMail" size="sm" variant="outline" className="h-6 text-[11px]" />
                  </div>
                  <div className="max-h-48 overflow-y-auto pr-1 text-[11.5px] text-slate-700 whitespace-pre-wrap leading-relaxed border-t border-border/40 pt-1.5 select-text">
                    {outreach.linkedin.inmailMessage}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* ── Card 4: Key Findings & Operational Risk Flags ── */}
        <Card className="border-border/60 shadow-2xs">
          <CardHeader className="pb-2 pt-3 px-4">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setFindingsOpen(!findingsOpen)}
            >
              <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                Key Findings & Risk Checks
              </CardTitle>
              {findingsOpen ? (
                <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
          </CardHeader>
          <AnimatePresence initial={false}>
            {findingsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <CardContent className="space-y-2.5 px-4 pb-4">
                  {/* Findings list */}
                  <ul className="space-y-1.5">
                    {keyFindings.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-foreground leading-snug">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Risk flags */}
                  {riskFlags.length > 0 && (
                    <div className="rounded-lg border border-red-200/60 bg-red-50/50 p-2.5 space-y-1">
                      <p className="text-[11px] font-semibold text-red-700 flex items-center gap-1.5">
                        <AlertTriangle className="h-3 w-3" />
                        Risk Flags ({riskFlags.length})
                      </p>
                      {riskFlags.map((r, i) => (
                        <p key={i} className="text-[11.5px] text-red-600 pl-4">
                          • {r}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Analyzed inputs */}
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-border/40">
                    {analyzedInputs.map((inp, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="gap-1 text-[10px] h-5 font-normal"
                      >
                        <FileText className="h-2.5 w-2.5 text-muted-foreground" />
                        {inp.label}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
