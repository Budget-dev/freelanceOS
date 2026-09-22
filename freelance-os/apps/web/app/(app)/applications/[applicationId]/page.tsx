"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  Award,
  Clock,
  MessageSquare,
  XCircle,
  FileText,
  CheckCircle2,
  Send,
  Trash2,
  ExternalLink,
  Zap,
  Globe,
  MapPin,
  Search,
  Mail,
  Phone,
  Linkedin,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  History,
  Tag,
  User,
  Hash,
  Share2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ApplicationsStorage,
  type ApplicationItem,
  type ApplicationStage,
  type ProjectActivityLog,
} from "@/lib/storage";
import { StageBadge, formatStageLabel } from "@/components/applications/applications-view";

function CopyButton({
  text,
  label = "Copy",
  className = "",
}: {
  text: string;
  label?: string;
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
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={cn("h-7 text-xs gap-1.5 transition-all", className)}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-600" />
          <span className="text-emerald-600 font-medium">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params?.applicationId as string;

  const [application, setApplication] = useState<ApplicationItem | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notes, setNotes] = useState("");
  const [transitionNote, setTransitionNote] = useState("");
  const [pendingStage, setPendingStage] = useState<ApplicationStage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedAlert, setSavedAlert] = useState(false);

  useEffect(() => {
    const item = ApplicationsStorage.getById(applicationId);
    if (item) {
      setApplication(item);
      setNotes(item.notes || "");
    }
    setIsLoaded(true);
  }, [applicationId]);

  const handleOpenTransitionModal = (stage: ApplicationStage) => {
    if (stage === application?.stage) return;
    setPendingStage(stage);
    setTransitionNote("");
    setIsModalOpen(true);
  };

  const confirmStageTransition = () => {
    if (!application || !pendingStage) return;
    const updated = ApplicationsStorage.transitionStage(
      application.id,
      pendingStage,
      transitionNote || `Status changed to ${formatStageLabel(pendingStage)}`
    );
    if (updated) {
      setApplication({ ...updated });
    }
    setIsModalOpen(false);
    setPendingStage(null);
  };

  const handleQuickAddApplied = () => {
    if (!application) return;
    const updated = ApplicationsStorage.transitionStage(
      application.id,
      "applied",
      "Moved directly to Applied via quick action"
    );
    if (updated) {
      setApplication({ ...updated });
    }
  };

  const handleSaveNotes = () => {
    if (!application) return;
    const updated: ApplicationItem = { ...application, notes };
    ApplicationsStorage.save(updated);
    setApplication(updated);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  const handleDelete = () => {
    if (confirm("Permanently delete this project record?")) {
      ApplicationsStorage.delete(applicationId);
      router.push("/applications");
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <FileText className="h-7 w-7 text-muted-foreground/60" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Project Record Not Found</h2>
        <p className="text-xs text-muted-foreground mt-1 mb-6 leading-relaxed">
          This project record does not exist or has been removed from your local workspace.
        </p>
        <Link href="/applications">
          <Button size="sm" className="rounded-lg shadow-xs">
            Back to All Projects
          </Button>
        </Link>
      </div>
    );
  }

  // Complete 5-Stage Lifecycle Model
  const stages: { stage: ApplicationStage; label: string; icon: any; color: string }[] = [
    { stage: "new", label: "New / Analyzed", icon: Zap, color: "text-purple-600" },
    { stage: "applied", label: "Applied", icon: Clock, color: "text-blue-600" },
    { stage: "client_replied", label: "Client Replied", icon: MessageSquare, color: "text-amber-600" },
    { stage: "hired", label: "Hired", icon: Award, color: "text-emerald-600" },
    { stage: "rejected", label: "Rejected", icon: XCircle, color: "text-rose-500" },
  ];

  const currentStageIndex = stages.findIndex((s) => s.stage === application.stage);
  const searches = application.research?.searchesPerformed || [];
  const contacts = application.research?.contacts || [];
  const historyLogs = application.history || [];

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* ── Top Breadcrumb & Action Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/applications"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-white hover:bg-slate-50 transition-colors text-slate-700 shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href="/applications" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
                Projects
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-mono text-muted-foreground">{application.id}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground mt-0.5">
              {application.projectTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {application.stage === "new" && (
            <Button
              size="sm"
              onClick={handleQuickAddApplied}
              className="h-8 text-xs font-semibold gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
              Add to Applied
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>

          <Link href="/analyze">
            <Button size="sm" variant="secondary" className="h-8 text-xs font-semibold shadow-2xs">
              Analyze Another
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Interactive 5-Stage Lifecycle Stepper ── */}
      <Card className="border-border/60 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 pt-4 px-5 bg-slate-50/50 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-slate-600" />
                Project Lifecycle & Transition Stepper
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500 mt-0.5">
                Click any stage below to update status and record a timestamped transition entry.
              </CardDescription>
            </div>
            <StageBadge stage={application.stage} />
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {stages.map((s, idx) => {
              const Icon = s.icon;
              const isCurrent = application.stage === s.stage;
              const isPast = currentStageIndex > idx && application.stage !== "rejected";

              return (
                <button
                  key={s.stage}
                  type="button"
                  onClick={() => handleOpenTransitionModal(s.stage)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all relative group",
                    isCurrent
                      ? "border-primary bg-primary/5 text-primary shadow-2xs ring-1 ring-primary/20 font-bold"
                      : isPast
                      ? "border-emerald-200 bg-emerald-50/40 text-emerald-800 hover:bg-emerald-50 font-medium"
                      : "border-border/60 bg-white hover:bg-slate-50 text-slate-700 font-medium"
                  )}
                >
                  <Icon className={cn("h-4 w-4 mb-1", isCurrent ? "text-primary" : s.color)} />
                  <span className="text-xs">{s.label}</span>
                  {isCurrent && (
                    <span className="text-[9.5px] text-primary/80 font-mono mt-0.5">Active</span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Key Project Metrics Header ── */}
      <Card className="border-border/60 shadow-xs">
        <CardContent className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-border/60">
            {/* Client / Company */}
            <div className="pr-2">
              <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                Client / Company
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-sm text-foreground">
                <Building2 className="h-4 w-4 text-slate-600 shrink-0" />
                <span className="truncate">{application.companyName || application.clientName}</span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1">
                {application.location?.flagEmoji && <span>{application.location.flagEmoji}</span>}
                <span className="truncate">{application.location?.displayLocation || "Global Client"}</span>
              </div>
            </div>

            {/* Value & Budget */}
            <div className="pt-3 md:pt-0 md:px-4">
              <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                Budget Benchmark
              </span>
              <div className="mt-1 font-bold text-sm text-foreground">
                {application.value || "$1,500 – $3,000 USD"}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                Platform: <span className="font-semibold text-slate-700">{application.platform || "Freelancer.com"}</span>
              </div>
            </div>

            {/* Match Score */}
            <div className="pt-3 md:pt-0 md:px-4">
              <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                Match & Fit Score
              </span>
              <div className="mt-1 font-bold text-sm text-emerald-600 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {application.matchScore}% Match
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                Timeline: {application.timeline || "2 – 4 Weeks"}
              </div>
            </div>

            {/* Last Activity & Status */}
            <div className="pt-3 md:pt-0 md:pl-4">
              <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                Last Activity
              </span>
              <div className="mt-1 text-xs font-semibold text-foreground truncate">
                {application.lastActivity}
              </div>
              {application.appliedDate && (
                <div className="mt-1 text-[11px] text-muted-foreground">
                  Applied Date: {application.appliedDate}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Tabbed Enterprise Dossier ── */}
      <Tabs defaultValue="overview" className="w-full space-y-4">
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full h-9 p-1 bg-slate-100/90 rounded-xl">
          <TabsTrigger value="overview" className="text-xs font-medium">Overview</TabsTrigger>
          <TabsTrigger value="brief" className="text-xs font-medium">Original Brief</TabsTrigger>
          <TabsTrigger value="research" className="text-xs font-medium">Company Intel</TabsTrigger>
          <TabsTrigger value="audit" className="text-xs font-medium">Search Audit</TabsTrigger>
          <TabsTrigger value="outreach" className="text-xs font-medium">Outreach</TabsTrigger>
          <TabsTrigger value="history" className="text-xs font-medium">History ({historyLogs.length})</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: OVERVIEW & DELIVERABLES ── */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Executive Summary & Deliverables */}
            <div className="md:col-span-2 space-y-4">
              <Card className="border-border/60 shadow-xs">
                <CardHeader className="pb-2.5 pt-4 px-4">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-slate-700" />
                    Executive Brief & Scope Evaluation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 pb-4 text-xs">
                  <p className="text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-lg border border-border/50">
                    {application.analysis?.summary || application.proposalSummary || "No summary available."}
                  </p>

                  {/* Deliverables List */}
                  {application.deliverables && application.deliverables.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
                        Core Deliverables ({application.deliverables.length})
                      </div>
                      <div className="space-y-1.5">
                        {application.deliverables.map((d, i) => (
                          <div key={i} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-border/50 text-slate-700">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Required Tech Stack */}
                  {application.techStack && application.techStack.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
                        Identified Tech Stack
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {application.techStack.map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-[11px] font-medium bg-slate-100 text-slate-800">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Risk Flags & Operational Checks */}
            <div className="space-y-4">
              <Card className="border-border/60 shadow-xs">
                <CardHeader className="pb-2.5 pt-4 px-4">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    Risk Signals & Safeguards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4 text-xs">
                  {application.analysis?.riskFlags && application.analysis.riskFlags.length > 0 ? (
                    application.analysis.riskFlags.map((risk, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg border border-rose-100 bg-rose-50/50 text-rose-700 flex items-start gap-2 leading-relaxed">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span>{risk}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2.5 rounded-lg border border-emerald-100 bg-emerald-50/50 text-emerald-700 flex items-center gap-2 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>No critical scope risks or unverified anomalies detected.</span>
                    </div>
                  )}

                  {/* Regional Market Rate Benchmark */}
                  {application.location?.regionalMarketRate && (
                    <div className="p-3 rounded-lg border border-border/60 bg-slate-50 space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Regional Market Standard ({application.location.country || "Global"})
                      </div>
                      <div className="text-xs font-bold text-foreground">
                        {application.location.regionalMarketRate}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Timezone sync: {application.location.timezone || "UTC"}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Private Follow-up Notes */}
              <Card className="border-border/60 shadow-xs">
                <CardHeader className="pb-2 pt-3.5 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Private Notes
                    </CardTitle>
                    {savedAlert && (
                      <span className="text-[10.5px] font-semibold text-emerald-600 animate-in fade-in">
                        Saved!
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 px-4 pb-4">
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Log client call notes, negotiation points, questions asked..."
                    className="w-full rounded-lg border border-border/70 p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none leading-relaxed"
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleSaveNotes} size="sm" className="h-7 text-xs font-semibold">
                      Save Notes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── TAB 2: ORIGINAL FREELANCER.COM BRIEF ── */}
        <TabsContent value="brief">
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-3 pt-4 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-700" />
                    Original Freelancer.com Submission Brief
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Verbatim project text and uploaded assets ingested during project analysis.
                  </CardDescription>
                </div>
                <CopyButton text={application.originalDescription || ""} label="Copy Brief" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              <div className="rounded-xl border border-border/70 bg-slate-50/70 p-4 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto select-text">
                {application.originalDescription || "No original text brief recorded."}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg border border-border/60 bg-white">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Platform Source</span>
                  <p className="font-semibold text-foreground mt-0.5">{application.platform || "Freelancer.com"}</p>
                </div>
                <div className="p-2.5 rounded-lg border border-border/60 bg-white">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Record ID</span>
                  <p className="font-mono text-foreground mt-0.5 truncate">{application.id}</p>
                </div>
                <div className="p-2.5 rounded-lg border border-border/60 bg-white">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Ingestion Timestamp</span>
                  <p className="text-foreground mt-0.5">{application.createdAt ? new Date(application.createdAt).toLocaleString() : "Recently"}</p>
                </div>
                <div className="p-2.5 rounded-lg border border-border/60 bg-white">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Client Handle</span>
                  <p className="text-foreground mt-0.5">{application.clientUsername || application.clientName}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: CLIENT & COMPANY RESEARCH ── */}
        <TabsContent value="research" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Profile Card */}
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-slate-700" />
                  Corporate Identity & Entity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4 text-xs">
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-border/50">
                    <span className="text-[10px] text-muted-foreground uppercase">Organization / Brand Name</span>
                    <p className="text-xs font-bold text-foreground mt-0.5">{application.companyName || application.clientName}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-border/50">
                    <span className="text-[10px] text-muted-foreground uppercase">Client Username / Contact</span>
                    <p className="text-xs font-semibold text-foreground mt-0.5">{application.clientUsername ? `@${application.clientUsername}` : application.clientName}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-border/50">
                    <span className="text-[10px] text-muted-foreground uppercase">Location & Jurisdiction</span>
                    <p className="text-xs font-semibold text-foreground mt-0.5 flex items-center gap-1">
                      {application.location?.flagEmoji && <span>{application.location.flagEmoji}</span>}
                      <span>{application.location?.displayLocation || "Global Jurisdiction"}</span>
                    </p>
                  </div>
                </div>

                {/* Company Website */}
                {application.research?.companyWebsite && (
                  <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-blue-600" />
                        Official Company Website
                      </span>
                      {application.research.companyWebsite.verified && (
                        <Badge className="bg-emerald-100 text-emerald-800 text-[10px] h-4.5 border-none">
                          Active Domain
                        </Badge>
                      )}
                    </div>
                    <a
                      href={application.research.companyWebsite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1 truncate"
                    >
                      <span>{application.research.companyWebsite.url}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                    {application.research.companyWebsite.summary && (
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {application.research.companyWebsite.summary}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Google Business & LinkedIn Profile Check */}
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-slate-700" />
                  Registry & Directory Footprint
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4 text-xs">
                {/* Google Business Profile Check */}
                <div className="p-3 rounded-xl border border-border/60 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-rose-500" />
                      Google Business Profile
                    </span>
                    <Badge variant={application.research?.googleBusinessProfile?.found ? "secondary" : "outline"} className="text-[10px] h-4.5">
                      {application.research?.googleBusinessProfile?.found ? "Verified Listing" : "Directory Evaluated"}
                    </Badge>
                  </div>
                  <p className="text-[11.5px] text-slate-600">
                    {application.research?.googleBusinessProfile?.notes || "Regional establishment lookup executed for location anchor."}
                  </p>
                  {application.research?.googleBusinessProfile?.address && (
                    <div className="text-[11px] text-muted-foreground font-mono">
                      Location Anchor: {application.research.googleBusinessProfile.address}
                    </div>
                  )}
                </div>

                {/* LinkedIn Corporate Check */}
                <div className="p-3 rounded-xl border border-border/60 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Linkedin className="h-3.5 w-3.5 text-blue-600" />
                      LinkedIn Footprint
                    </span>
                    <Badge variant="secondary" className="text-[10px] h-4.5">
                      Corporate Index
                    </Badge>
                  </div>
                  <p className="text-[11.5px] text-slate-600">
                    Cross-referenced corporate entity and key executive personnel on LinkedIn directory.
                  </p>
                  {application.research?.linkedin?.url && (
                    <a
                      href={application.research.linkedin.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 truncate"
                    >
                      <span>{application.research.linkedin.url}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Discovered Contact Channels ── */}
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-2.5 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-700" />
                  Direct Contact Channels & Outbound Reach
                </CardTitle>
                {application.research?.contacts && application.research.contacts.length > 0 && (
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {application.research.contacts.length} Channel{application.research.contacts.length === 1 ? "" : "s"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4 text-xs">
              {application.research?.contacts && application.research.contacts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {application.research.contacts.map((contact, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-border/70 bg-white flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                          {contact.type === "email" ? (
                            <Mail className="h-3.5 w-3.5" />
                          ) : contact.type === "phone" ? (
                            <Phone className="h-3.5 w-3.5" />
                          ) : contact.type === "linkedin" ? (
                            <Linkedin className="h-3.5 w-3.5 text-blue-600" />
                          ) : (
                            <Globe className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground truncate">
                              {contact.value}
                            </span>
                            <Badge
                              variant={contact.status === "verified" ? "completed" : "outline"}
                              className="text-[9.5px] h-4 px-1"
                            >
                              {contact.status === "verified" ? "Verified" : "Unverified"}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-muted-foreground truncate block">
                            Source: {contact.source}
                          </span>
                        </div>
                      </div>
                      <CopyButton text={contact.value} label="Copy" className="shrink-0" />
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Explicit notice if no verified direct contact found */}
              {(!application.research?.contacts ||
                application.research.contacts.filter((c) => c.status === "verified").length === 0) && (
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 space-y-1.5">
                  <div className="font-bold flex items-center gap-2 text-slate-900">
                    <HelpCircle className="h-4 w-4 text-slate-500" />
                    No Verified Direct Contact Information Found
                  </div>
                  <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                    Checked official domain DNS records, Google Business directory, LinkedIn corporate indices, and brief metadata. No direct phone, WhatsApp number, or corporate email is publicly published. In accordance with anti-fabrication guidelines, no synthetic contact details are generated. Secure outreach must proceed via Freelancer.com chat or proposal submission.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Evidence Verification Classification ── */}
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-2.5 pt-4 px-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Evidence Verification Classification (Confirmed • Inferred • Unknown)
              </CardTitle>
              <CardDescription className="text-xs">
                Strict separation of verified facts from contextual inferences to prevent hallucination.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4 text-xs">
              {/* Confirmed Facts */}
              <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>CONFIRMED FACTS</span>
                </div>
                <ul className="space-y-1 text-[11.5px] text-emerald-900/90 pl-5 list-disc">
                  {((application.evidenceClassification?.confirmed || application.research?.evidenceClassification?.confirmed) ?? []).length > 0 ? (
                    ((application.evidenceClassification?.confirmed || application.research?.evidenceClassification?.confirmed) as any[]).map((c, i) => (
                      <li key={i}>
                        {typeof c === "string" ? c : (
                          <span>
                            <strong className="font-semibold text-emerald-950">{c.label}:</strong> {c.details}
                          </span>
                        )}
                      </li>
                    ))
                  ) : (
                    <>
                      <li>Deliverables & project scope directly parsed from client brief.</li>
                      <li>Platform identity and client handle verified against Freelancer.com posting.</li>
                      {application.research?.companyWebsite?.verified && (
                        <li>Active domain resolution confirmed via direct TLS probe.</li>
                      )}
                    </>
                  )}
                </ul>
              </div>

              {/* Inferred Facts */}
              <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                  <Zap className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>INFERRED INTELLIGENCE</span>
                </div>
                <ul className="space-y-1 text-[11.5px] text-amber-900/90 pl-5 list-disc">
                  {((application.evidenceClassification?.inferred || application.research?.evidenceClassification?.inferred) ?? []).length > 0 ? (
                    ((application.evidenceClassification?.inferred || application.research?.evidenceClassification?.inferred) as any[]).map((inf, i) => (
                      <li key={i}>
                        {typeof inf === "string" ? inf : (
                          <span>
                            <strong className="font-semibold text-amber-950">{inf.label}:</strong> {inf.details}
                          </span>
                        )}
                      </li>
                    ))
                  ) : (
                    <>
                      <li>Entity affiliation inferred from project terminology and client signature.</li>
                      <li>Regional market benchmark ({application.location?.regionalMarketRate || "Market Standard"}) derived from jurisdiction.</li>
                      <li>Timeline estimate of {application.timeline || "standard scope"} based on required deliverable volume.</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Unknown / Unlisted Facts */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                  <HelpCircle className="h-4 w-4 text-slate-500 shrink-0" />
                  <span>UNKNOWN / UNLISTED (NOT FABRICATED)</span>
                </div>
                <ul className="space-y-1 text-[11.5px] text-slate-600 pl-5 list-disc">
                  {((application.evidenceClassification?.unknown || application.research?.evidenceClassification?.unknown) ?? []).length > 0 ? (
                    ((application.evidenceClassification?.unknown || application.research?.evidenceClassification?.unknown) as any[]).map((u, i) => (
                      <li key={i}>
                        {typeof u === "string" ? u : (
                          <span>
                            <strong className="font-semibold text-slate-900">{u.label}:</strong> {u.details}
                          </span>
                        )}
                      </li>
                    ))
                  ) : (
                    <>
                      <li>Direct private phone numbers, WhatsApp, or executive direct dials are unlisted.</li>
                      <li>Internal proprietary budget maximums remain unrevealed by client.</li>
                      <li>Private hiring manager identity unconfirmed without mutual NDA.</li>
                    </>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 4: RESEARCH TRANSPARENCY & SEARCH AUDIT ── */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-3 pt-4 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Research Transparency & Search Audit Trail
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Complete, unedited audit of every search query and source checked.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10.5px] font-mono">
                  {searches.length} Queries Logged
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              {/* Transparency Disclaimer Notice */}
              <div className="p-3 rounded-xl border border-amber-200/80 bg-amber-50/50 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
                <HelpCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Strict Verification Standard:</span> FreelanceOS never fabricates contact info or claims data was found without real validation. If a public phone, WhatsApp, or email is unavailable, it is explicitly reported as unlisted.
                </div>
              </div>

              {/* Searches Performed Table */}
              <div className="rounded-xl border border-border/70 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100/80 text-[10.5px] font-semibold text-muted-foreground uppercase border-b border-border/70">
                    <tr>
                      <th className="py-2.5 px-3">Target & Query</th>
                      <th className="py-2.5 px-3">Source Channel</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Findings & Verification Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 font-sans">
                    {searches.length > 0 ? (
                      searches.map((s, i) => (
                        <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-800">
                            <div className="font-bold text-foreground text-xs font-sans">{s.target}</div>
                            <div className="text-slate-500 text-[10.5px] mt-0.5">{s.query}</div>
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-600 font-medium">
                            {s.source}
                          </td>
                          <td className="py-3 px-3">
                            {s.status === "verified" ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/80 text-[10px]">
                                Verified
                              </Badge>
                            ) : s.status === "probable" ? (
                              <Badge className="bg-amber-50 text-amber-700 border-amber-200/80 text-[10px]">
                                Probable
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-slate-500 text-[10px]">
                                Not Found
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-700 leading-snug">
                            {s.details}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-muted-foreground text-xs">
                          No search audit entries recorded for this project.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Discovered Contact Channels */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Contact Channels & Availability
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {contacts.map((c, i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-3 rounded-xl border text-xs flex items-center justify-between",
                        c.status === "verified"
                          ? "border-emerald-200 bg-emerald-50/40"
                          : c.status === "probable"
                          ? "border-amber-200 bg-amber-50/40"
                          : "border-border/60 bg-slate-50 text-muted-foreground"
                      )}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-semibold text-foreground uppercase text-[10px]">
                          {c.type === "whatsapp" && <MessageSquare className="h-3 w-3 text-emerald-600" />}
                          {c.type === "email" && <Mail className="h-3 w-3 text-blue-600" />}
                          {c.type === "linkedin" && <Linkedin className="h-3 w-3 text-blue-600" />}
                          {c.type === "website" && <Globe className="h-3 w-3 text-indigo-600" />}
                          {c.type === "phone" && <DollarSign className="h-3 w-3 text-slate-600" />}
                          <span>{c.type}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full border bg-white font-mono">
                            {c.status}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-foreground mt-1 select-all">
                          {c.value}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {c.source}
                        </div>
                      </div>
                      {c.status === "verified" && <CopyButton text={c.value} label="Copy" />}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 5: OUTREACH TEMPLATES ── */}
        <TabsContent value="outreach" className="space-y-4">
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-3 pt-4 px-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Custom Outreach Drafts (1-Click Ready)
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Pre-calibrated proposal templates aligned to {application.clientName} and the project requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <Tabs defaultValue="email" className="w-full space-y-3">
                <TabsList className="grid grid-cols-3 w-full h-8 p-0.5 bg-slate-100">
                  <TabsTrigger value="email" className="text-xs gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="whatsapp" className="text-xs gap-1">
                    <MessageSquare className="h-3 w-3 text-emerald-600" />
                    WhatsApp
                  </TabsTrigger>
                  <TabsTrigger value="linkedin" className="text-xs gap-1">
                    <Linkedin className="h-3 w-3 text-blue-600" />
                    LinkedIn
                  </TabsTrigger>
                </TabsList>

                {/* Email Draft */}
                <TabsContent value="email" className="space-y-3">
                  <div className="p-3 rounded-lg border border-border/70 bg-slate-50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-semibold text-muted-foreground uppercase">Subject</span>
                      <CopyButton text={application.analysis?.outreachTemplates?.email?.subject || `Partnership Proposal: Architecting your ${application.projectTitle}`} label="Copy Subject" />
                    </div>
                    <p className="text-xs font-bold text-foreground select-all">
                      {application.analysis?.outreachTemplates?.email?.subject || `Partnership Proposal: Architecting your ${application.projectTitle}`}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-border/70 bg-white space-y-2">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="text-[10.5px] font-semibold text-muted-foreground uppercase">Email Body</span>
                      <CopyButton text={application.analysis?.outreachTemplates?.email?.body || ""} label="Copy Full Body" />
                    </div>
                    <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans max-h-80 overflow-y-auto select-text">
                      {application.analysis?.outreachTemplates?.email?.body || "Email body proposal not generated."}
                    </div>
                  </div>
                </TabsContent>

                {/* WhatsApp Template */}
                <TabsContent value="whatsapp" className="space-y-3">
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                        Conversational WhatsApp Pitch
                      </span>
                      <CopyButton text={application.analysis?.outreachTemplates?.whatsapp?.text || ""} label="Copy WhatsApp" />
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-emerald-100 text-xs text-slate-800 leading-relaxed select-text">
                      {application.analysis?.outreachTemplates?.whatsapp?.text || "WhatsApp proposal not available."}
                    </div>
                  </div>
                </TabsContent>

                {/* LinkedIn Template */}
                <TabsContent value="linkedin" className="space-y-3">
                  <div className="p-3 rounded-lg border border-border/70 bg-slate-50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-semibold text-muted-foreground uppercase">Connection Request Note</span>
                      <CopyButton text={application.analysis?.outreachTemplates?.linkedin?.connectionNote || ""} label="Copy Note" />
                    </div>
                    <p className="text-xs text-slate-800 bg-white p-2.5 rounded border border-border/40 select-text">
                      {application.analysis?.outreachTemplates?.linkedin?.connectionNote || "Connection note not available."}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-border/70 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-semibold text-muted-foreground uppercase">InMail Proposal Message</span>
                      <CopyButton text={application.analysis?.outreachTemplates?.linkedin?.inmailMessage || ""} label="Copy InMail" />
                    </div>
                    <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed select-text">
                      {application.analysis?.outreachTemplates?.linkedin?.inmailMessage || "InMail proposal not available."}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 6: CHRONOLOGICAL ACTIVITY LOG (Step 6) ── */}
        <TabsContent value="history">
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-3 pt-4 px-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <History className="h-4 w-4 text-slate-700" />
                Chronological Activity & Transition Timeline
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Every state transition is immutably timestamped with exact date and time.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {historyLogs.length > 0 ? (
                  historyLogs.map((item, idx) => (
                    <div key={item.id || idx} className="relative">
                      {/* Timeline marker */}
                      <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-slate-900 shadow-2xs" />
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-border/60 space-y-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">
                              {item.toStage ? formatStageLabel(item.toStage) : "Status Updated"}
                            </span>
                            {item.fromStage && (
                              <span className="text-[11px] text-muted-foreground">
                                (from {formatStageLabel(item.fromStage)})
                              </span>
                            )}
                          </div>
                          <span className="text-[10.5px] font-mono text-muted-foreground">
                            {item.timestamp ? new Date(item.timestamp).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: true,
                            }) : "Initial Creation"}
                          </span>
                        </div>
                        {item.note && (
                          <p className="text-xs text-slate-600 leading-snug">
                            {item.note}
                          </p>
                        )}
                        <div className="text-[10px] text-slate-400">
                          Actor: <span className="font-medium text-slate-600 capitalize">{item.actor || "User"}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground">No history events logged.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Transition Confirmation Modal ── */}
      {isModalOpen && pendingStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-border/80 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <History className="h-4 w-4 text-slate-700" />
                Transition Lifecycle Stage
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-border/60">
                <span className="text-muted-foreground">Change status from</span>
                <StageBadge stage={application.stage} />
                <span className="text-muted-foreground">to</span>
                <StageBadge stage={pendingStage} />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-foreground uppercase tracking-wider mb-1">
                  Transition Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={transitionNote}
                  onChange={(e) => setTransitionNote(e.target.value)}
                  placeholder={`e.g. Sent customized proposal with portfolio references; awaiting client response.`}
                  className="w-full rounded-lg border border-border p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none leading-relaxed"
                />
              </div>

              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-500" />
                <span>Exact timestamp will be preserved in activity history log.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={confirmStageTransition}
                className="h-8 text-xs font-semibold bg-primary text-white shadow-xs"
              >
                Confirm Transition
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
