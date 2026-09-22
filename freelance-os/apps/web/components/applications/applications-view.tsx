"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Search,
  Plus,
  ArrowRight,
  ExternalLink,
  Trash2,
  Edit2,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  MessageSquare,
  Award,
  XCircle,
  MoreVertical,
  ChevronDown,
  FileText,
  Building2,
  User,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  ApplicationsStorage,
  type ApplicationItem,
  type ApplicationStage,
} from "@/lib/storage";

export { type ApplicationItem, type ApplicationStage };
export const APPLICATIONS_STORAGE_KEY = "freelance_os_applications_v1";
export const INITIAL_APPLICATIONS: ApplicationItem[] = [];

interface ApplicationsViewProps {
  initialStage?: "all" | ApplicationStage;
}

export function ApplicationsView({ initialStage = "all" }: ApplicationsViewProps) {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | ApplicationStage>(initialStage);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Load applications from localStorage or Firestore
  useEffect(() => {
    try {
      const saved = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
      if (saved) {
        setApplications(JSON.parse(saved));
      }
    } catch {
      // fallback
    }

    if (user) {
      const loadFromFirestore = async () => {
        try {
          const docRef = doc(db, "users", user.uid, "applications", "data");
          const snap = await getDoc(docRef);
          if (snap.exists() && snap.data()?.items) {
            setApplications(snap.data().items);
            localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(snap.data().items));
          }
        } catch (err) {
          console.error("Error loading applications from Firestore", err);
        }
      };
      loadFromFirestore();
    }
    setIsLoaded(true);
  }, [user]);

  // Sync state helper
  const persistApplications = (updated: ApplicationItem[]) => {
    setApplications(updated);
    try {
      localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    if (user) {
      const docRef = doc(db, "users", user.uid, "applications", "data");
      setDoc(docRef, { items: updated, updatedAt: new Date().toISOString() }).catch(() => {});
    }
  };

  // Sync activeTab when initialStage prop changes
  useEffect(() => {
    setActiveTab(initialStage);
  }, [initialStage]);

  // Stage change handler
  const handleStageChange = (id: string, newStage: ApplicationStage, note?: string) => {
    ApplicationsStorage.transitionStage(id, newStage, note);
    const updated = ApplicationsStorage.getAll();
    persistApplications(updated);
  };

  // Delete handler
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this application record?")) {
      const updated = applications.filter((app) => app.id !== id);
      persistApplications(updated);
    }
  };

  // Add new application handler
  const handleAddApplication = (newApp: ApplicationItem) => {
    const updated = [newApp, ...applications];
    persistApplications(updated);
    setIsAddModalOpen(false);
  };

  // Counts
  const counts = useMemo(() => {
    return {
      all: applications.length,
      new: applications.filter((a) => a.stage === "new").length,
      applied: applications.filter((a) => a.stage === "applied").length,
      client_replied: applications.filter((a) => a.stage === "client_replied").length,
      hired: applications.filter((a) => a.stage === "hired").length,
      rejected: applications.filter((a) => a.stage === "rejected").length,
    };
  }, [applications]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesTab = activeTab === "all" || app.stage === activeTab;
      const matchesSearch =
        searchQuery.trim() === "" ||
        app.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.notes && app.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTab && matchesSearch;
    });
  }, [applications, activeTab, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Application Tracker
            </h1>
            <Badge variant="outline" className="text-xs bg-slate-50 font-normal">
              {counts.all} Total Tracked
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Track proposals, monitor client interview responses, and manage contract outcomes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="h-9 px-4 text-xs font-semibold gap-1.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Log Application
          </Button>
        </div>
      </div>

      {/* ── Metric KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          label="All Tracked"
          count={counts.all}
          icon={<ClipboardList className="h-4 w-4 text-slate-700" />}
          active={activeTab === "all"}
          onClick={() => {
            setActiveTab("all");
            router.push("/applications");
          }}
        />
        <MetricCard
          label="New / Analyzed"
          count={counts.new}
          icon={<Zap className="h-4 w-4 text-purple-600 fill-purple-600/20" />}
          active={activeTab === "new"}
          onClick={() => {
            setActiveTab("new");
            router.push("/applications/new");
          }}
        />
        <MetricCard
          label="Applied"
          count={counts.applied}
          icon={<Clock className="h-4 w-4 text-blue-600" />}
          active={activeTab === "applied"}
          onClick={() => {
            setActiveTab("applied");
            router.push("/applications/applied");
          }}
        />
        <MetricCard
          label="Client Replied"
          count={counts.client_replied}
          icon={<MessageSquare className="h-4 w-4 text-amber-600" />}
          active={activeTab === "client_replied"}
          onClick={() => {
            setActiveTab("client_replied");
            router.push("/applications/replied");
          }}
        />
        <MetricCard
          label="Hired"
          count={counts.hired}
          icon={<Award className="h-4 w-4 text-emerald-600" />}
          active={activeTab === "hired"}
          onClick={() => {
            setActiveTab("hired");
            router.push("/applications/hired");
          }}
        />
        <MetricCard
          label="Rejected"
          count={counts.rejected}
          icon={<XCircle className="h-4 w-4 text-rose-500" />}
          active={activeTab === "rejected"}
          onClick={() => {
            setActiveTab("rejected");
            router.push("/applications/rejected");
          }}
        />
      </div>

      {/* ── Filter Tabs & Search Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <TabButton
            label="All"
            count={counts.all}
            active={activeTab === "all"}
            onClick={() => {
              setActiveTab("all");
              router.push("/applications");
            }}
          />
          <TabButton
            label="New / Analyzed"
            count={counts.new}
            active={activeTab === "new"}
            onClick={() => {
              setActiveTab("new");
              router.push("/applications/new");
            }}
          />
          <TabButton
            label="Applied"
            count={counts.applied}
            active={activeTab === "applied"}
            onClick={() => {
              setActiveTab("applied");
              router.push("/applications/applied");
            }}
          />
          <TabButton
            label="Client Replied"
            count={counts.client_replied}
            active={activeTab === "client_replied"}
            onClick={() => {
              setActiveTab("client_replied");
              router.push("/applications/replied");
            }}
          />
          <TabButton
            label="Hired"
            count={counts.hired}
            active={activeTab === "hired"}
            onClick={() => {
              setActiveTab("hired");
              router.push("/applications/hired");
            }}
          />
          <TabButton
            label="Rejected"
            count={counts.rejected}
            active={activeTab === "rejected"}
            onClick={() => {
              setActiveTab("rejected");
              router.push("/applications/rejected");
            }}
          />
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search project or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8.5 rounded-lg border border-border/70 bg-white pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* ── Table Card ── */}
      <Card className="border-border/60 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/75">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-[220px] text-xs font-semibold">Project & Client</TableHead>
                  <TableHead className="min-w-[130px] text-xs font-semibold">Stage</TableHead>
                  <TableHead className="text-center text-xs font-semibold">Match Score</TableHead>
                  <TableHead className="text-xs font-semibold hidden md:table-cell">Value</TableHead>
                  <TableHead className="text-xs font-semibold hidden lg:table-cell">Applied Date</TableHead>
                  <TableHead className="min-w-[200px] text-xs font-semibold hidden sm:table-cell">Latest Activity & Notes</TableHead>
                  <TableHead className="text-right text-xs font-semibold w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-44 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <ClipboardList className="h-8 w-8 text-muted-foreground/40 mb-2" />
                        <p className="text-sm font-medium text-foreground">No applications found</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {searchQuery
                            ? `No results match "${searchQuery}". Try clearing your search.`
                            : `You have no applications recorded under "${formatStageLabel(activeTab)}".`}
                        </p>
                        {searchQuery && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchQuery("")}
                            className="mt-3 h-8 text-xs font-medium"
                          >
                            Clear search
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => (
                    <TableRow key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Project & Client */}
                      <TableCell className="py-3">
                        <div className="flex flex-col min-w-0">
                          <Link
                            href={`/applications/${app.id}`}
                            className="font-semibold text-xs text-foreground hover:text-blue-600 truncate transition-colors"
                          >
                            {app.projectTitle}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                            <Building2 className="h-3 w-3 shrink-0" />
                            <span className="truncate">{app.clientName}</span>
                            {app.platform && (
                              <span className="rounded bg-slate-100 px-1 py-0.2 text-[10px] text-slate-600">
                                {app.platform}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Stage Pill + Quick Change Dropdown */}
                      <TableCell className="py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-1 outline-none group">
                              <StageBadge stage={app.stage} />
                              <ChevronDown className="h-3 w-3 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-44 text-xs">
                            <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                              Change Stage
                            </div>
                            <DropdownMenuItem onClick={() => handleStageChange(app.id, "new")}>
                              <Zap className="h-3.5 w-3.5 mr-2 text-purple-600" /> New / Analyzed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStageChange(app.id, "applied")}>
                              <Clock className="h-3.5 w-3.5 mr-2 text-blue-600" /> Applied
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStageChange(app.id, "client_replied")}>
                              <MessageSquare className="h-3.5 w-3.5 mr-2 text-amber-600" /> Client Replied
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStageChange(app.id, "hired")}>
                              <Award className="h-3.5 w-3.5 mr-2 text-emerald-600" /> Hired
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStageChange(app.id, "rejected")}>
                              <XCircle className="h-3.5 w-3.5 mr-2 text-rose-500" /> Rejected
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Quick action button for new projects */}
                        {app.stage === "new" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStageChange(app.id, "applied", "1-click moved to Applied");
                            }}
                            className="mt-1 text-[10.5px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Zap className="h-2.5 w-2.5" />
                            <span>Add to Applied</span>
                          </button>
                        )}
                      </TableCell>

                      {/* Match Score */}
                      <TableCell className="text-center py-3">
                        <span
                          className={cn(
                            "text-xs font-bold",
                            app.matchScore >= 80
                              ? "text-emerald-600"
                              : app.matchScore >= 60
                                ? "text-amber-600"
                                : "text-rose-500"
                          )}
                        >
                          {app.matchScore}%
                        </span>
                      </TableCell>

                      {/* Value */}
                      <TableCell className="py-3 text-xs font-medium text-foreground hidden md:table-cell">
                        {app.value}
                      </TableCell>

                      {/* Applied Date */}
                      <TableCell className="py-3 text-[11px] text-muted-foreground hidden lg:table-cell">
                        {app.appliedDate}
                      </TableCell>

                      {/* Notes / Last Activity */}
                      <TableCell className="py-3 hidden sm:table-cell">
                        <div className="text-[11px] text-foreground truncate max-w-[280px]">
                          {app.lastActivity}
                        </div>
                        {app.notes && (
                          <div className="text-[10px] text-muted-foreground truncate max-w-[280px] mt-0.5">
                            {app.notes}
                          </div>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/applications/${app.id}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors"
                            title="View Application Details"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors"
                                aria-label="More options"
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36 text-xs">
                              <DropdownMenuItem asChild>
                                <Link href={`/applications/${app.id}`} className="cursor-pointer">
                                  <FileText className="h-3.5 w-3.5 mr-2" /> View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(app.id)}
                                className="text-destructive focus:text-destructive cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Log Application Modal ── */}
      {isAddModalOpen && (
        <AddApplicationModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddApplication}
        />
      )}
    </div>
  );
}

function MetricCard({
  label,
  count,
  icon,
  active,
  onClick,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-xl border p-4 transition-all duration-150 flex flex-col justify-between",
        active
          ? "border-primary bg-white shadow-xs ring-1 ring-primary/20"
          : "border-border/60 bg-white/70 hover:bg-white hover:border-border"
      )}
    >
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-semibold">{label}</span>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
        {count}
      </div>
    </div>
  );
}

function TabButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
        active
          ? "bg-slate-900 text-white shadow-2xs"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 py-0.2 text-[10px]",
          active ? "bg-white/20 text-white" : "bg-white text-slate-600"
        )}
      >
        {count}
      </span>
    </button>
  );
}

export function StageBadge({ stage }: { stage: ApplicationStage }) {
  switch (stage) {
    case "new":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 border border-purple-200/60">
          <Zap className="h-3 w-3 text-purple-600 fill-purple-600" />
          New / Analyzed
        </span>
      );
    case "applied":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200/60">
          <Clock className="h-3 w-3" />
          Applied
        </span>
      );
    case "client_replied":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200/60">
          <MessageSquare className="h-3 w-3" />
          Client Replied
        </span>
      );
    case "hired":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
          <Award className="h-3 w-3" />
          Hired
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200/60">
          <XCircle className="h-3 w-3" />
          Rejected
        </span>
      );
    default:
      return <Badge variant="outline">{stage}</Badge>;
  }
}

export function formatStageLabel(stage: string): string {
  switch (stage) {
    case "all":
      return "All Applications";
    case "new":
      return "New / Analyzed";
    case "applied":
      return "Applied";
    case "client_replied":
      return "Client Replied";
    case "hired":
      return "Hired";
    case "rejected":
      return "Rejected";
    default:
      return stage;
  }
}

function AddApplicationModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (app: ApplicationItem) => void;
}) {
  const [projectTitle, setProjectTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [stage, setStage] = useState<ApplicationStage>("applied");
  const [value, setValue] = useState("");
  const [matchScore, setMatchScore] = useState("85");
  const [platform, setPlatform] = useState("Upwork");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim() || !clientName.trim()) return;

    const newApp: ApplicationItem = {
      id: `app-${Date.now()}`,
      projectTitle: projectTitle.trim(),
      clientName: clientName.trim(),
      stage,
      value: value.trim() ? (value.startsWith("$") ? value.trim() : `$${value.trim()}`) : "$1,000",
      matchScore: parseInt(matchScore, 10) || 80,
      appliedDate: new Date().toISOString().split("T")[0],
      lastActivity: `Logged application on ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      notes: notes.trim(),
      platform,
    };

    onAdd(newApp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl border border-border/70 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <h2 className="text-lg font-bold text-foreground">Log New Application</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Record a submitted freelance application to track its client response lifecycle.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Next.js SaaS MVP Development"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Client / Company *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Corp"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring bg-white"
              >
                <option value="Upwork">Upwork</option>
                <option value="Direct Client">Direct Client</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Fiverr Pro">Fiverr Pro</option>
                <option value="X / Twitter">X / Twitter</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as ApplicationStage)}
                className="w-full rounded-lg border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring bg-white"
              >
                <option value="new">New / Analyzed</option>
                <option value="applied">Applied</option>
                <option value="client_replied">Client Replied</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Value ($)
              </label>
              <input
                type="text"
                placeholder="1,500"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Match Score %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={matchScore}
                onChange={(e) => setMatchScore(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Notes / Strategy
            </label>
            <textarea
              rows={2}
              placeholder="Key deliverables pitched, follow-up timeline..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8.5 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-8.5 text-xs font-semibold">
              Save Application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
