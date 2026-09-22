"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Briefcase, Plus, ExternalLink, Github, Trash2, Edit3,
  Check, Star, Layers, Globe, Eye, ArrowRight,
  ArrowLeft, Laptop, Smartphone, Tablet, X, RefreshCw,
  Link2, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/components/providers/AuthContext";
import { PortfolioStorage } from "@/lib/storage";

const PORTFOLIO_STORAGE_KEY = "freelance_os_portfolio_projects_v1";

export interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  description: string;
  metrics: string;
  technologies: string[];
  liveUrl?: string;
  repoUrl?: string;
  featured?: boolean;
}

const INITIAL_PROJECTS: PortfolioProject[] = [];

const CATEGORIES = [
  "All",
  "AI & Machine Learning",
  "Web Applications",
  "Full-Stack Architecture",
  "Mobile",
];

const SUGGESTED_TECHS = [
  "Next.js", "React", "TypeScript", "Python", "OpenAI", "FastAPI",
  "Tailwind CSS", "Node.js", "PostgreSQL", "MongoDB", "AWS", "Docker"
];

export function sanitizeUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return trimmed;
    }
  } catch {
    if (!trimmed.includes(":") && !trimmed.startsWith("//") && trimmed.includes(".")) {
      return `https://${trimmed}`;
    }
  }
  return undefined;
}

// ── In-App Live Preview Modal ──────────────────────────────────────────

function LivePreviewModal({
  project,
  onClose,
}: {
  project: PortfolioProject;
  onClose: () => void;
}) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [iframeError, setIframeError] = useState(false);

  const safeLiveUrl = sanitizeUrl(project.liveUrl);
  const url = safeLiveUrl || "https://example.com";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-border/70 bg-slate-900 shadow-2xl overflow-hidden">
        {/* ── Simulated Browser Chrome Bar ── */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-950 px-4 py-2.5 text-xs text-slate-300 shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-blue-500/80 inline-block" />
            <span className="ml-2 font-semibold text-slate-200 hidden sm:inline">
              Live Preview: {project.title}
            </span>
          </div>

          {/* URL address bar */}
          <div className="flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1 text-[11px] font-mono text-slate-300 max-w-xs truncate">
            <Globe className="h-3 w-3 text-blue-400 shrink-0" />
            <span className="truncate">{url}</span>
          </div>

          {/* Device toggle & Actions */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center rounded-lg bg-white/10 p-0.5 mr-2">
              <button
                type="button"
                onClick={() => setDevice("desktop")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  device === "desktop" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"
                )}
                title="Desktop View"
              >
                <Laptop className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("tablet")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  device === "tablet" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"
                )}
                title="Tablet View"
              >
                <Tablet className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("mobile")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  device === "mobile" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"
                )}
                title="Mobile View"
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="hidden sm:inline">Open URL</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
              title="Close Preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Viewport Area ── */}
        <div className="flex flex-1 items-center justify-center bg-slate-950/60 p-3 sm:p-6 overflow-auto">
          <div
            className={cn(
              "h-full rounded-xl bg-white shadow-2xl transition-all duration-300 overflow-hidden flex flex-col border border-border/50",
              device === "desktop" && "w-full",
              device === "tablet" && "w-[768px]",
              device === "mobile" && "w-[390px]"
            )}
          >
            {/* Live Interactive Frame */}
            {!iframeError ? (
              <iframe
                src={url}
                title={project.title}
                className="w-full h-full border-0"
                onError={() => setIframeError(true)}
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            ) : null}

            {/* Fallback card if external host disallows iframe embedding */}
            {iframeError && (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-slate-50">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-border/50">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  {project.title}
                </h3>
                <p className="mt-1 max-w-md text-xs text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {project.technologies.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Launch Live Site
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Portfolio Manager ─────────────────────────────────────────────

export function PortfolioManager() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();

  // Live preview modal target
  const [previewProject, setPreviewProject] = useState<PortfolioProject | null>(null);

  // Stepper state (Step 1, Step 2, Step 3)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Web Applications");
  const [description, setDescription] = useState("");
  const [metrics, setMetrics] = useState("");
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [customTechInput, setCustomTechInput] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [featured, setFeatured] = useState(false);

  // Load from local storage and Firestore
  useEffect(() => {
    try {
      const local = PortfolioStorage.getAll();
      if (local && local.length > 0) {
        setProjects(local);
      }
    } catch {}

    if (!user) {
      setIsLoaded(true);
      return;
    }
    const loadProjects = async () => {
      try {
        const docRef = doc(db, "users", user.uid, "profile", "portfolio");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.projects) {
            setProjects(data.projects);
            localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(data.projects));
          }
        }
      } catch (err) {
        console.error("Error loading portfolio", err);
      }
      setIsLoaded(true);
    };
    loadProjects();
  }, [user]);

  const saveToStorage = async (updated: PortfolioProject[]) => {
    setProjects(updated);
    try {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid, "profile", "portfolio");
      await setDoc(docRef, { projects: updated });
    } catch (err) {
      console.error("Error saving portfolio", err);
    }
  };

  const handleStartAdd = () => {
    setEditingId(null);
    setTitle("");
    setCategory("Web Applications");
    setDescription("");
    setMetrics("");
    setSelectedTechs(["Next.js", "React", "TypeScript"]);
    setCustomTechInput("");
    setLiveUrl("");
    setRepoUrl("");
    setFeatured(false);
    setCurrentStep(1);
    setIsAdding(true);
  };

  const handleStartEdit = (proj: PortfolioProject) => {
    setEditingId(proj.id);
    setTitle(proj.title);
    setCategory(proj.category);
    setDescription(proj.description);
    setMetrics(proj.metrics);
    setSelectedTechs(proj.technologies);
    setCustomTechInput("");
    setLiveUrl(proj.liveUrl || "");
    setRepoUrl(proj.repoUrl || "");
    setFeatured(Boolean(proj.featured));
    setCurrentStep(1);
    setIsAdding(true);
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setCurrentStep(1);
  };

  const handleToggleTech = (t: string) => {
    if (selectedTechs.includes(t)) {
      setSelectedTechs(selectedTechs.filter((item) => item !== t));
    } else {
      setSelectedTechs([...selectedTechs, t]);
    }
  };

  const handleAddCustomTech = () => {
    if (!customTechInput.trim()) return;
    const trimmed = customTechInput.trim();
    if (!selectedTechs.includes(trimmed)) {
      setSelectedTechs([...selectedTechs, trimmed]);
    }
    setCustomTechInput("");
  };

  const handleSaveProject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setCurrentStep(1);
      return;
    }

    const finalTechs = selectedTechs.length > 0 ? selectedTechs : ["Full-Stack", "Web Frameworks"];

    if (editingId) {
      const updated = projects.map((p) =>
        p.id === editingId
          ? {
              ...p,
              title,
              category,
              description,
              metrics: metrics || "Verified Client Project",
              technologies: finalTechs,
              liveUrl: liveUrl || undefined,
              repoUrl: repoUrl || undefined,
              featured,
            }
          : p
      );
      saveToStorage(updated);
      setSaveToast(`Updated "${title}" successfully!`);
    } else {
      const newProj: PortfolioProject = {
        id: `proj-${Date.now()}`,
        title,
        category,
        description,
        metrics: metrics || "Verified Client Project",
        technologies: finalTechs,
        liveUrl: liveUrl || undefined,
        repoUrl: repoUrl || undefined,
        featured,
      };
      saveToStorage([newProj, ...projects]);
      setSaveToast(`Added "${title}" to portfolio!`);
    }

    setIsAdding(false);
    setEditingId(null);
    setCurrentStep(1);
    setTimeout(() => setSaveToast(""), 3000);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from your portfolio?`)) {
      const updated = projects.filter((p) => p.id !== id);
      saveToStorage(updated);
      setSaveToast(`Deleted "${name}"`);
      setTimeout(() => setSaveToast(""), 3000);
    }
  };

  const toggleFeatured = (id: string) => {
    const updated = projects.map((p) =>
      p.id === id ? { ...p, featured: !p.featured } : p
    );
    saveToStorage(updated);
  };

  const filteredProjects = projects.filter(
    (p) => selectedCategory === "All" || p.category === selectedCategory
  );

  if (!isLoaded) return null;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ── In-App Live Preview Modal ── */}
      {previewProject && (
        <LivePreviewModal
          project={previewProject}
          onClose={() => setPreviewProject(null)}
        />
      )}

      {/* ── Saved Toast Notification ── */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-800 shadow-sm"
          >
            <Check className="h-4 w-4 text-blue-600" />
            <span>{saveToast}</span>
          </motion.div>
        )}
      </AnimatePresence>



      {isAdding ? (
        <div className="w-full space-y-8 pb-16">
          {/* Top Navigation Tabs */}
          <div className="flex flex-wrap items-center border-b border-border/60 gap-8 px-2 sticky top-0 bg-slate-50/80 backdrop-blur-md z-40 pt-4 -mx-2">
            {[
              { num: 1, label: "Basics & Category" },
              { num: 2, label: "Tech Stack & Metrics" },
              { num: 3, label: "Links & Preview" },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurrentStep(s.num as 1 | 2 | 3)}
                className={cn(
                  "pb-4 text-sm font-semibold transition-colors border-b-2",
                  currentStep === s.num
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {s.label}
              </button>
            ))}
            {/* Right side buttons */}
            <div className="ml-auto pb-4 flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleCancelForm} className="h-9 px-4 text-xs font-semibold">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveProject} className="h-9 px-6 text-xs font-bold gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                <CheckCircle2 className="h-4 w-4" /> {editingId ? "Update Project" : "Save Project"}
              </Button>
            </div>
          </div>

          {/* Form Content Area */}
          <div className="bg-white border border-border/40 rounded-xl shadow-sm px-8 py-2">
            
            {/* ── STEP 1: Basics ── */}
            {currentStep === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b border-border/50 first:pt-8 last:border-0 last:pb-8">
                  <div className="md:col-span-1 space-y-2">
                    <h4 className="text-sm font-bold text-foreground">Project Details</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Give your project a clear title and assign it to the most relevant category.
                    </p>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Project Title <span className="text-destructive">*</span></label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. HealthSphere AI Diagnostic Assistant"
                        className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                        autoFocus
                        required
                      />
                    </div>
                    <div className="space-y-1.5 max-w-sm">
                      <label className="text-xs font-semibold text-foreground">Project Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                      >
                        <option value="AI & Machine Learning">AI & Machine Learning</option>
                        <option value="Web Applications">Web Applications</option>
                        <option value="Full-Stack Architecture">Full-Stack Architecture</option>
                        <option value="Mobile">Mobile</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b border-border/50 first:pt-8 last:border-0 last:pb-8">
                  <div className="md:col-span-1 space-y-2">
                    <h4 className="text-sm font-bold text-foreground">Scope & Case Study</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Describe the client&apos;s goal, the technical architecture you designed, and the impact achieved.
                    </p>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      placeholder="Describe the client's goal, the technical architecture you designed, and the impact achieved..."
                      className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20 resize-y"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Tech Stack & Metrics ── */}
            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b border-border/50 first:pt-8 last:border-0 last:pb-8">
                  <div className="md:col-span-1 space-y-2">
                    <h4 className="text-sm font-bold text-foreground">Technologies Used</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Select or add the frameworks, languages, and tools used to build this project.
                    </p>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_TECHS.map((t) => {
                        const isSelected = selectedTechs.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => handleToggleTech(t)}
                            className={cn(
                              "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5",
                              isSelected
                                ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                                : "bg-white border-border/60 text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3 text-blue-600" />}
                            {t}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 max-w-sm pt-2">
                      <input
                        type="text"
                        value={customTechInput}
                        onChange={(e) => setCustomTechInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomTech();
                          }
                        }}
                        placeholder="Add other tech..."
                        className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                      />
                      <Button type="button" onClick={handleAddCustomTech} variant="secondary" className="px-3">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b border-border/50 first:pt-8 last:border-0 last:pb-8">
                  <div className="md:col-span-1 space-y-2">
                    <h4 className="text-sm font-bold text-foreground">Impact & Metrics</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Optional: Highlight key achievements, contract value, or turnaround time to impress potential clients.
                    </p>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <input
                      type="text"
                      value={metrics}
                      onChange={(e) => setMetrics(e.target.value)}
                      placeholder="e.g. $12,500 Contract • 99.9% Uptime SLA"
                      className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Links & Preview ── */}
            {currentStep === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b border-border/50 first:pt-8 last:border-0 last:pb-8">
                  <div className="md:col-span-1 space-y-2">
                    <h4 className="text-sm font-bold text-foreground">External Links</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Provide a live demo URL and a repository link if open-source.
                    </p>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-1.5 max-w-lg">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-blue-600" /> Live Previewable Demo URL
                      </label>
                      <input
                        type="url"
                        value={liveUrl}
                        onChange={(e) => setLiveUrl(e.target.value)}
                        placeholder="https://my-live-demo.dev"
                        className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                      />
                    </div>
                    <div className="space-y-1.5 max-w-lg">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Github className="h-3.5 w-3.5 text-slate-800" /> GitHub Repo / Case Study URL
                      </label>
                      <input
                        type="url"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/my-org/project"
                        className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b border-border/50 first:pt-8 last:border-0 last:pb-8">
                  <div className="md:col-span-1 space-y-2">
                    <h4 className="text-sm font-bold text-foreground">Visibility</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Pin this project to highlight it prominently on your public portfolio.
                    </p>
                  </div>
                  <div className="md:col-span-2 flex items-center h-full">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground select-none">
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="rounded border-border size-4 text-primary focus:ring-primary"
                      />
                      <span>Pin as Featured Project</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
            
          </div>
        </div>
      ) : (
        <>
          {/* ── Header & Add Button ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                <Briefcase className="h-4.5 w-4.5 text-slate-700" />
                Portfolio Projects ({projects.length})
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add case studies and live previewable links to showcase your best work to clients.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/p/alex-rivera" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="h-8.5 text-xs font-semibold gap-1.5 shadow-2xs">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Live Preview
                </Button>
              </Link>
              <Link href="/profile/portfolio/builder">
                <Button variant="outline" size="sm" className="h-8.5 text-xs font-semibold gap-1.5 shadow-2xs">
                  <Edit3 className="h-3.5 w-3.5" />
                  Portfolio Builder
                </Button>
              </Link>
              <Button onClick={handleStartAdd} size="sm" className="h-8.5 text-xs font-semibold gap-1.5 shadow-sm">
                <Plus className="h-3.5 w-3.5" />
                Add Project
              </Button>
            </div>
          </div>

          {/* ── Category Filter Pills ── */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ── Projects Grid ── */}
          {filteredProjects.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-14 text-center">
                <p className="text-sm font-medium text-foreground">No projects in this category</p>
                <p className="text-xs text-muted-foreground mt-1">Try selecting a different filter or add a new project.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((proj) => (
                <Card
                  key={proj.id}
                  className={cn(
                    "border-border/60 transition-all duration-200 hover:shadow-sm flex flex-col justify-between group",
                    proj.featured ? "border-slate-300 bg-gradient-to-b from-slate-50/40 to-white" : "bg-white"
                  )}
                >
                  <CardHeader className="pb-2.5 pt-4 px-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] h-4.5 px-1.5 font-normal bg-slate-50">
                            {proj.category}
                          </Badge>
                          {proj.featured && (
                            <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] h-4.5 px-1.5 font-normal gap-0.5">
                              <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-foreground leading-snug tracking-tight truncate">
                          {proj.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => toggleFeatured(proj.id)}
                          className={cn(
                            "p-1 rounded hover:bg-slate-100 transition-colors",
                            proj.featured ? "text-amber-500" : "text-slate-300 hover:text-slate-500"
                          )}
                          title={proj.featured ? "Remove featured" : "Set as featured"}
                        >
                          <Star className={cn("h-3.5 w-3.5", proj.featured && "fill-amber-500")} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(proj)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Edit project"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(proj.id, proj.title)}
                          className="p-1 rounded text-slate-400 hover:text-destructive hover:bg-red-50 transition-colors"
                          title="Delete project"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-5 pb-4 space-y-3 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {proj.description}
                    </p>

                    <div className="space-y-2.5 pt-1">
                      {/* Metrics */}
                      {proj.metrics && (
                        <div className="rounded-md bg-slate-50 border border-border/40 px-2.5 py-1.5 text-[11px] font-medium text-slate-700">
                          {proj.metrics}
                        </div>
                      )}

                      {/* Tech stack */}
                      <div className="flex flex-wrap gap-1">
                        {proj.technologies.map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="text-[10px] h-4.5 font-normal bg-slate-100 text-slate-700"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>

                      {/* Links & In-App Live Preview Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/40">
                        <div className="flex items-center gap-2">
                          {proj.liveUrl ? (
                            <button
                              type="button"
                              onClick={() => setPreviewProject(proj)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-md transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Live Preview
                            </button>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">No demo link</span>
                          )}

                          {proj.liveUrl && (
                            <a
                              href={proj.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-slate-700 p-1"
                              title="Open URL in new tab"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>

                        {proj.repoUrl && (
                          <a
                            href={proj.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900"
                          >
                            <Github className="h-3 w-3" />
                            Repo
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
}