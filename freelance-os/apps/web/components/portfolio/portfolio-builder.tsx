"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Sparkles, User, Briefcase, GraduationCap, Layers,
  Globe, Mail, Check, ArrowRight, ArrowLeft, Plus,
  Trash2, Copy, ExternalLink, Eye, Share2, CheckCircle2,
  AlertCircle, Smartphone, Tablet, Laptop, Star, RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PortfolioPreview, type PortfolioData } from "@/components/portfolio/portfolio-preview";
import { cn } from "@/lib/utils";

export const PORTFOLIO_STORAGE_KEY = "freelance_os_portfolio_published_v1";

const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  slug: "alex-rivera",
  isPublished: true,
  publishedAt: "2026-09-21",
  personal: {
    fullName: "Alex Rivera",
    title: "Senior Full-Stack & AI Systems Engineer",
    avatarInitials: "AR",
    location: "London, United Kingdom",
    availability: "Available (30+ hrs/week)",
    hourlyRate: "95",
  },
  about: {
    bio: "Senior Software Engineer with 7+ years of experience architecting AI-powered SaaS platforms, full-stack web applications, and real-time data pipelines.\n\nI specialize in helping international startups turn complex technical requirements into high-conversion digital products with clean architectures and 99.9% uptime.",
    yearsOfExperience: "7+",
    highlights: [
      "7+ Years Full-Stack Experience",
      "Specialized in Next.js & Python AI",
      "99.9% Uptime Production Track Record",
    ],
  },
  experience: [
    {
      id: "exp-1",
      company: "HealthSphere AI",
      role: "Lead Full-Stack AI Engineer",
      period: "2023 – Present",
      description: "Architected real-time diagnostic triage assistant using Next.js, Python FastAPI, and OpenAI. Scaled platform to 50k+ monthly consultations with sub-second response times.",
    },
    {
      id: "exp-2",
      company: "FinFlow Technologies (London, UK)",
      role: "Senior Frontend Engineer",
      period: "2021 – 2023",
      description: "Designed core financial ledger interface and multi-currency exchange dashboard. Reduced page load times by 45% using Next.js server components and optimized caching.",
    },
    {
      id: "exp-3",
      company: "Nova Labs Digital",
      role: "Full-Stack Developer",
      period: "2019 – 2021",
      description: "Delivered 12+ client web applications from scratch using React, Node.js, and PostgreSQL for seed and Series-A European startups.",
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.S. in Computer Science",
      school: "University College London (UCL)",
      year: "2019",
    },
    {
      id: "edu-2",
      degree: "AWS Certified Solutions Architect",
      school: "Amazon Web Services",
      year: "2022",
    },
  ],
  skills: [
    {
      category: "Frontend & Web",
      items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "shadcn/ui"],
    },
    {
      category: "Backend & Systems",
      items: ["Python", "FastAPI", "Node.js", "PostgreSQL", "Redis", "GraphQL"],
    },
    {
      category: "AI & Cloud",
      items: ["OpenAI API", "LangChain", "Docker", "AWS", "Vercel", "Git CI/CD"],
    },
  ],
  projects: [
    {
      id: "p-1",
      title: "HealthSphere AI Diagnostic Assistant",
      category: "AI & Machine Learning",
      description: "Automated medical diagnostic triage platform built with Next.js, Python FastAPI, OpenAI API, and HIPAA-compliant data pipelines.",
      technologies: ["Next.js", "Python", "OpenAI", "PostgreSQL"],
      liveUrl: "https://healthsphere-demo.dev",
      repoUrl: "https://github.com/example/healthsphere-ai",
      featured: true,
    },
    {
      id: "p-2",
      title: "FinFlow Treasury & Currency Exchange",
      category: "Web Applications",
      description: "High-throughput financial ledger for cross-border freelancing agencies supporting instant multi-currency payouts.",
      technologies: ["React", "TypeScript", "Node.js", "Stripe API"],
      liveUrl: "https://finflow-ledger.dev",
      repoUrl: "https://github.com/example/finflow-treasury",
      featured: true,
    },
    {
      id: "p-3",
      title: "OmniSync Real-Time Logistics Tracker",
      category: "Full-Stack Architecture",
      description: "End-to-end telemetry system monitoring container shipments globally with instant geofence webhooks.",
      technologies: ["Next.js", "Go", "Redis", "AWS ECS"],
      liveUrl: "https://omnisync-demo.dev",
      featured: false,
    },
  ],
  contact: {
    email: "alex.rivera@example.com",
    phone: "+44 7911 123456",
    whatsapp: "+44 7911 123456",
    linkedin: "https://linkedin.com/in/alex-rivera-dev",
    github: "https://github.com/alexrivera",
    website: "https://alexrivera.dev",
    twitter: "https://x.com/alexrivera_dev",
  },
};

const STEPS = [
  { id: 1, title: "Personal Info", desc: "Name, title, location & rate" },
  { id: 2, title: "About Me", desc: "Bio & value proposition" },
  { id: 3, title: "Experience", desc: "Work history & roles" },
  { id: 4, title: "Education", desc: "Degrees & certifications" },
  { id: 5, title: "Skills", desc: "Frameworks & tech stack" },
  { id: 6, title: "Projects", desc: "Case studies & live demos" },
  { id: 7, title: "Contact", desc: "Channels & social links" },
  { id: 8, title: "Review & Publish", desc: "Publish shareable live URL" },
];

export function PortfolioBuilder() {
  const [portfolio, setPortfolio] = useState<PortfolioData>(DEFAULT_PORTFOLIO_DATA);
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 = Welcome screen, 1-8 = Steps, 9 = Published success
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Skill input temp state
  const [skillCategory, setSkillCategory] = useState("Frontend & Web");
  const [newSkillItem, setNewSkillItem] = useState("");

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
      if (saved) {
        setPortfolio(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  const saveToStorage = (updated: PortfolioData) => {
    setPortfolio(updated);
    try {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Field change helpers
  const updatePersonal = (field: keyof PortfolioData["personal"], val: string) => {
    const updated = {
      ...portfolio,
      personal: { ...portfolio.personal, [field]: val },
    };
    // Auto-update slug if name changes and not manually customized
    if (field === "fullName") {
      const slugCandidate = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      if (slugCandidate) updated.slug = slugCandidate;
    }
    saveToStorage(updated);
  };

  const updateAbout = (field: keyof PortfolioData["about"], val: any) => {
    const updated = {
      ...portfolio,
      about: { ...portfolio.about, [field]: val },
    };
    saveToStorage(updated);
  };

  const updateContact = (field: keyof PortfolioData["contact"], val: string) => {
    const updated = {
      ...portfolio,
      contact: { ...portfolio.contact, [field]: val },
    };
    saveToStorage(updated);
  };

  // Experience Repeaters
  const addExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      company: "New Company",
      role: "Software Engineer",
      period: "2024 – Present",
      description: "Brief summary of responsibilities and achievements...",
    };
    saveToStorage({
      ...portfolio,
      experience: [newExp, ...portfolio.experience],
    });
  };

  const removeExperience = (id: string) => {
    saveToStorage({
      ...portfolio,
      experience: portfolio.experience.filter((e) => e.id !== id),
    });
  };

  const updateExperienceItem = (id: string, field: string, val: string) => {
    saveToStorage({
      ...portfolio,
      experience: portfolio.experience.map((e) =>
        e.id === id ? { ...e, [field]: val } : e
      ),
    });
  };

  // Education Repeaters
  const addEducation = () => {
    const newEdu = {
      id: `edu-${Date.now()}`,
      degree: "Degree / Certification",
      school: "Institution / Organization",
      year: new Date().getFullYear().toString(),
    };
    saveToStorage({
      ...portfolio,
      education: [...portfolio.education, newEdu],
    });
  };

  const removeEducation = (id: string) => {
    saveToStorage({
      ...portfolio,
      education: portfolio.education.filter((e) => e.id !== id),
    });
  };

  const updateEducationItem = (id: string, field: string, val: string) => {
    saveToStorage({
      ...portfolio,
      education: portfolio.education.map((e) =>
        e.id === id ? { ...e, [field]: val } : e
      ),
    });
  };

  // Project Repeaters
  const addProject = () => {
    const newProj = {
      id: `proj-${Date.now()}`,
      title: "New Project",
      category: "Web Applications",
      description: "Describe the client challenge, deliverables, and outcome...",
      technologies: ["Next.js", "TypeScript"],
      liveUrl: "https://demo.dev",
      featured: false,
    };
    saveToStorage({
      ...portfolio,
      projects: [newProj, ...portfolio.projects],
    });
  };

  const removeProject = (id: string) => {
    saveToStorage({
      ...portfolio,
      projects: portfolio.projects.filter((p) => p.id !== id),
    });
  };

  const updateProjectItem = (id: string, field: string, val: any) => {
    saveToStorage({
      ...portfolio,
      projects: portfolio.projects.map((p) =>
        p.id === id ? { ...p, [field]: val } : p
      ),
    });
  };

  // Skills
  const addSkillToCategory = () => {
    if (!newSkillItem.trim()) return;
    const cat = portfolio.skills.find((s) => s.category === skillCategory);
    let updatedSkills = [...portfolio.skills];
    if (cat) {
      if (!cat.items.includes(newSkillItem.trim())) {
        cat.items.push(newSkillItem.trim());
      }
    } else {
      updatedSkills.push({
        category: skillCategory,
        items: [newSkillItem.trim()],
      });
    }
    saveToStorage({ ...portfolio, skills: updatedSkills });
    setNewSkillItem("");
  };

  const removeSkillFromCategory = (catName: string, item: string) => {
    const updatedSkills = portfolio.skills.map((s) => {
      if (s.category === catName) {
        return { ...s, items: s.items.filter((i) => i !== item) };
      }
      return s;
    });
    saveToStorage({ ...portfolio, skills: updatedSkills });
  };

  // Publish Action
  const handlePublish = () => {
    const updated: PortfolioData = {
      ...portfolio,
      isPublished: true,
      publishedAt: new Date().toISOString().split("T")[0],
    };
    saveToStorage(updated);
    setCurrentStep(9); // Show success screen
  };

  const shareableUrl = typeof window !== "undefined"
    ? `${window.location.origin}/p/${portfolio.slug}`
    : `http://localhost:3000/p/${portfolio.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!isLoaded) return null;

  return (
    <div className="flex h-[calc(100vh-7.5rem)] md:h-[calc(100vh-5.5rem)] flex-col gap-3">
      {/* ── Top Bar with Status & Navigation ── */}
      <div className="flex items-center justify-between border-b border-border/60 bg-white px-4 py-2.5 rounded-xl shadow-2xs shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold text-foreground tracking-tight">
                Guided Portfolio Builder
              </h1>
              {portfolio.isPublished && (
                <Badge variant="completed" className="text-[10px] h-4.5 gap-1 font-normal">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Live Published
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Build your professional portfolio step-by-step with real-time live preview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Editor / Preview Switcher */}
          <div className="flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileView("editor")}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                mobileView === "editor" ? "bg-white text-foreground shadow-2xs" : "text-muted-foreground"
              )}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => setMobileView("preview")}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                mobileView === "preview" ? "bg-white text-foreground shadow-2xs" : "text-muted-foreground"
              )}
            >
              Preview
            </button>
          </div>

          {/* Quick link to live page if published */}
          {portfolio.isPublished && (
            <Link
              href={`/p/${portfolio.slug}`}
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              <ExternalLink className="h-3 w-3" />
              <span>View Live Site</span>
            </Link>
          )}

          <Link
            href="/profile/portfolio"
            className="text-xs text-muted-foreground hover:text-foreground font-medium px-2 py-1"
          >
            Exit to Portfolio
          </Link>
        </div>
      </div>

      {/* ── Main Split-Screen Layout ── */}
      <div className="flex flex-1 min-h-0 gap-4 overflow-hidden">
        {/* ── Left Column: Guided Step Editor ── */}
        <div
          className={cn(
            "flex flex-1 flex-col h-full min-h-0 overflow-hidden rounded-xl border border-border/60 bg-white shadow-2xs",
            mobileView === "preview" ? "hidden lg:flex" : "flex"
          )}
        >
          {/* Step Progress Header */}
          {currentStep >= 1 && currentStep <= 8 && (
            <div className="border-b border-border/60 bg-slate-50/70 px-4 py-3 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Step {currentStep} of 8
                  </span>
                  <h3 className="text-xs font-bold text-foreground">
                    {STEPS[currentStep - 1].title} — <span className="font-normal text-muted-foreground">{STEPS[currentStep - 1].desc}</span>
                  </h3>
                </div>
                <span className="text-xs font-bold font-mono text-emerald-600">
                  {Math.round((currentStep / 8) * 100)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  animate={{ width: `${(currentStep / 8) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Clickable Step Pills */}
              <div className="mt-2.5 flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                {STEPS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentStep(s.id)}
                    className={cn(
                      "px-2 py-0.5 text-[10px] rounded font-medium whitespace-nowrap transition-colors",
                      currentStep === s.id
                        ? "bg-slate-900 text-white font-bold"
                        : s.id < currentStep
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "text-muted-foreground hover:bg-slate-200"
                    )}
                  >
                    {s.id}. {s.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Content Area (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 no-scrollbar space-y-5">
            {/* ── 0. ONBOARDING WELCOME SCREEN ── */}
            {currentStep === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4 space-y-6 max-w-md mx-auto">
                <div className="size-16 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white flex items-center justify-center shadow-lg">
                  <Sparkles className="h-8 w-8 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                    Create Your Professional Portfolio
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Build an impressive, shareable live portfolio website in 8 simple steps.
                    Preview updates in real-time as you type, and publish a custom live link to share with clients.
                  </p>
                </div>

                <div className="w-full rounded-xl border border-border/60 bg-slate-50/60 p-4 text-left space-y-2 text-xs">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    What you&apos;ll configure:
                  </p>
                  <ul className="space-y-1 text-muted-foreground pl-5 list-disc text-[11.5px]">
                    <li>Personal identity, title & rates</li>
                    <li>Compelling bio & core highlights</li>
                    <li>Experience & education timeline</li>
                    <li>Project case studies with live previewable links</li>
                    <li>Direct contact vectors (Email, WhatsApp, LinkedIn)</li>
                  </ul>
                </div>

                <Button
                  size="lg"
                  onClick={() => setCurrentStep(1)}
                  className="w-full gap-2 text-xs font-bold shadow-md h-10"
                >
                  <span>Start Building My Portfolio</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* ── STEP 1: Personal Information ── */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Full Name</label>
                    <input
                      type="text"
                      value={portfolio.personal.fullName}
                      onChange={(e) => updatePersonal("fullName", e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Avatar Initials</label>
                    <input
                      type="text"
                      value={portfolio.personal.avatarInitials}
                      onChange={(e) => updatePersonal("avatarInitials", e.target.value)}
                      placeholder="e.g. AR"
                      maxLength={3}
                      className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20 uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Professional Title / Headline</label>
                  <input
                    type="text"
                    value={portfolio.personal.title}
                    onChange={(e) => updatePersonal("title", e.target.value)}
                    placeholder="e.g. Senior Full-Stack & AI Systems Engineer"
                    className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Location</label>
                    <input
                      type="text"
                      value={portfolio.personal.location}
                      onChange={(e) => updatePersonal("location", e.target.value)}
                      placeholder="e.g. London, United Kingdom"
                      className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Hourly Target Rate ($ USD)</label>
                    <input
                      type="number"
                      value={portfolio.personal.hourlyRate}
                      onChange={(e) => updatePersonal("hourlyRate", e.target.value)}
                      placeholder="95"
                      className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Availability Status</label>
                    <input
                      type="text"
                      value={portfolio.personal.availability}
                      onChange={(e) => updatePersonal("availability", e.target.value)}
                      placeholder="e.g. Available (30+ hrs/week)"
                      className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: About Me ── */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Bio & Pitch to Clients
                  </label>
                  <textarea
                    value={portfolio.about.bio}
                    onChange={(e) => updateAbout("bio", e.target.value)}
                    rows={5}
                    placeholder="Tell clients what you specialize in, your background, and how you solve their problems..."
                    className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs leading-relaxed focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20 resize-y"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-border/40">
                  <label className="text-xs font-semibold text-foreground">Key Highlights (3 bullet points)</label>
                  {portfolio.about.highlights.map((h, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="size-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0 mt-1">
                        {i + 1}
                      </span>
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => {
                          const updated = [...portfolio.about.highlights];
                          updated[i] = e.target.value;
                          updateAbout("highlights", updated);
                        }}
                        placeholder="e.g. 7+ Years Experience in SaaS"
                        className="flex-1 rounded-lg border border-border/70 bg-slate-50/50 px-3 py-1.5 text-xs focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 3: Experience ── */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Work History ({portfolio.experience.length} roles)
                  </span>
                  <Button type="button" variant="outline" size="sm" onClick={addExperience} className="h-7 text-xs gap-1">
                    <Plus className="h-3 w-3" />
                    Add Role
                  </Button>
                </div>

                {portfolio.experience.map((exp, idx) => (
                  <div key={exp.id} className="rounded-xl border border-border/60 bg-slate-50/50 p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Role #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExperience(exp.id)}
                        className="text-slate-400 hover:text-destructive transition-colors p-1"
                        title="Remove role"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => updateExperienceItem(exp.id, "role", e.target.value)}
                        placeholder="Job Title (e.g. Lead Engineer)"
                        className="rounded-lg border border-border/70 bg-white px-3 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperienceItem(exp.id, "company", e.target.value)}
                        placeholder="Company / Client Name"
                        className="rounded-lg border border-border/70 bg-white px-3 py-1.5 text-xs"
                      />
                    </div>

                    <input
                      type="text"
                      value={exp.period}
                      onChange={(e) => updateExperienceItem(exp.id, "period", e.target.value)}
                      placeholder="Duration (e.g. 2023 – Present)"
                      className="w-full rounded-lg border border-border/70 bg-white px-3 py-1.5 text-xs"
                    />

                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperienceItem(exp.id, "description", e.target.value)}
                      rows={2}
                      placeholder="Key achievements and technical responsibilities..."
                      className="w-full rounded-lg border border-border/70 bg-white px-3 py-1.5 text-xs leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ── STEP 4: Education & Certifications ── */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Education & Certifications ({portfolio.education.length})
                  </span>
                  <Button type="button" variant="outline" size="sm" onClick={addEducation} className="h-7 text-xs gap-1">
                    <Plus className="h-3 w-3" />
                    Add Another
                  </Button>
                </div>

                {portfolio.education.map((edu, idx) => (
                  <div key={edu.id} className="rounded-xl border border-border/60 bg-slate-50/50 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Item #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeEducation(edu.id)}
                        className="text-slate-400 hover:text-destructive transition-colors p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducationItem(edu.id, "degree", e.target.value)}
                        placeholder="Degree or Certification Title"
                        className="rounded-lg border border-border/70 bg-white px-3 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => updateEducationItem(edu.id, "school", e.target.value)}
                        placeholder="Institution / Issuing Body"
                        className="rounded-lg border border-border/70 bg-white px-3 py-1.5 text-xs"
                      />
                    </div>

                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => updateEducationItem(edu.id, "year", e.target.value)}
                      placeholder="Year (e.g. 2022)"
                      className="w-full rounded-lg border border-border/70 bg-white px-3 py-1.5 text-xs"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ── STEP 5: Skills ── */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Add Skill Tag</label>
                  <div className="flex gap-2">
                    <select
                      value={skillCategory}
                      onChange={(e) => setSkillCategory(e.target.value)}
                      className="rounded-lg border border-border/70 bg-white px-3 py-1.5 text-xs max-w-[160px]"
                    >
                      <option value="Frontend & Web">Frontend & Web</option>
                      <option value="Backend & Systems">Backend & Systems</option>
                      <option value="AI & Cloud">AI & Cloud</option>
                      <option value="Tools & Architecture">Tools & Architecture</option>
                    </select>
                    <input
                      type="text"
                      value={newSkillItem}
                      onChange={(e) => setNewSkillItem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkillToCategory();
                        }
                      }}
                      placeholder="e.g. GraphQL, Tailwind, PyTorch..."
                      className="flex-1 rounded-lg border border-border/70 bg-white px-3 py-1.5 text-xs"
                    />
                    <Button type="button" size="sm" onClick={addSkillToCategory} className="h-8 px-3 text-xs gap-1">
                      <Plus className="h-3 w-3" />
                      Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {portfolio.skills.map((cat) => (
                    <div key={cat.category} className="rounded-xl border border-border/60 bg-slate-50/50 p-3 space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        {cat.category}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.items.map((item) => (
                          <Badge key={item} variant="secondary" className="gap-1 py-1 px-2.5 text-xs bg-white">
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => removeSkillFromCategory(cat.category, item)}
                              className="text-slate-400 hover:text-destructive"
                            >
                              &times;
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 6: Projects ── */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Projects ({portfolio.projects.length})
                  </span>
                  <Button type="button" variant="outline" size="sm" onClick={addProject} className="h-7 text-xs gap-1">
                    <Plus className="h-3 w-3" />
                    Add Project
                  </Button>
                </div>

                {portfolio.projects.map((proj, idx) => (
                  <div key={proj.id} className="rounded-xl border border-border/60 bg-slate-50/50 p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Project #{idx + 1}
                        </span>
                        {proj.featured && (
                          <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[9.5px]">
                            ★ Featured
                          </Badge>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProject(proj.id)}
                        className="text-slate-400 hover:text-destructive transition-colors p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => updateProjectItem(proj.id, "title", e.target.value)}
                        placeholder="Project Title"
                        className="rounded-lg border border-border/70 bg-white px-3 py-1.5 text-xs font-semibold"
                      />
                      <select
                        value={proj.category}
                        onChange={(e) => updateProjectItem(proj.id, "category", e.target.value)}
                        className="rounded-lg border border-border/70 bg-white px-3 py-1.5 text-xs"
                      >
                        <option value="AI & Machine Learning">AI & Machine Learning</option>
                        <option value="Web Applications">Web Applications</option>
                        <option value="Full-Stack Architecture">Full-Stack Architecture</option>
                        <option value="Mobile">Mobile</option>
                      </select>
                    </div>

                    <textarea
                      value={proj.description}
                      onChange={(e) => updateProjectItem(proj.id, "description", e.target.value)}
                      rows={2}
                      placeholder="Project deliverables and technical highlights..."
                      className="w-full rounded-lg border border-border/70 bg-white px-3 py-1.5 text-xs leading-relaxed"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="url"
                        value={proj.liveUrl || ""}
                        onChange={(e) => updateProjectItem(proj.id, "liveUrl", e.target.value)}
                        placeholder="Live Demo URL (https://...)"
                        className="rounded-lg border border-border/70 bg-white px-3 py-1.5 text-xs"
                      />
                      <input
                        type="url"
                        value={proj.repoUrl || ""}
                        onChange={(e) => updateProjectItem(proj.id, "repoUrl", e.target.value)}
                        placeholder="GitHub / Repo URL"
                        className="rounded-lg border border-border/70 bg-white px-3 py-1.5 text-xs"
                      />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={proj.featured || false}
                        onChange={(e) => updateProjectItem(proj.id, "featured", e.target.checked)}
                        className="rounded border-border size-3.5"
                      />
                      <span>Pin as Featured Project</span>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* ── STEP 7: Contact Channels ── */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Email Address</label>
                    <input
                      type="email"
                      value={portfolio.contact.email}
                      onChange={(e) => updateContact("email", e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      value={portfolio.contact.phone}
                      onChange={(e) => updateContact("phone", e.target.value)}
                      placeholder="+44 7911 123456"
                      className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">LinkedIn URL</label>
                    <input
                      type="url"
                      value={portfolio.contact.linkedin}
                      onChange={(e) => updateContact("linkedin", e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">GitHub URL</label>
                    <input
                      type="url"
                      value={portfolio.contact.github}
                      onChange={(e) => updateContact("github", e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Personal Website URL</label>
                  <input
                    type="url"
                    value={portfolio.contact.website}
                    onChange={(e) => updateContact("website", e.target.value)}
                    placeholder="https://mywebsite.dev"
                    className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs"
                  />
                </div>
              </div>
            )}

            {/* ── STEP 8: Review & Publish ── */}
            {currentStep === 8 && (
              <div className="space-y-5">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Portfolio is Ready for Publishing!</span>
                  </div>
                  <p className="text-[11.5px] text-emerald-700 leading-relaxed">
                    All core sections (Hero, About, Experience, Projects, and Contact) are configured. Review the live preview on the right, customize your shareable link slug, and publish.
                  </p>
                </div>

                {/* Custom URL Slug */}
                <div className="rounded-xl border border-border/60 bg-slate-50/50 p-4 space-y-2">
                  <label className="text-xs font-semibold text-foreground">
                    Custom Shareable Portfolio URL Slug
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground bg-white border border-border/60 px-3 py-2 rounded-lg select-none">
                      /p/
                    </span>
                    <input
                      type="text"
                      value={portfolio.slug}
                      onChange={(e) => {
                        const clean = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "");
                        saveToStorage({ ...portfolio, slug: clean });
                      }}
                      placeholder="your-name"
                      className="flex-1 rounded-lg border border-border/70 bg-white px-3 py-2 text-xs font-mono font-semibold"
                    />
                  </div>
                  <p className="text-[10.5px] text-muted-foreground">
                    Your public link: <span className="font-mono text-slate-800">{shareableUrl}</span>
                  </p>
                </div>

                {/* Readiness Checklist */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-foreground">Readiness Checklist</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-border/40 p-2.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{portfolio.personal.fullName || "Name configured"}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-border/40 p-2.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{portfolio.projects.length} Projects ready</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-border/40 p-2.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{portfolio.experience.length} Work roles</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-border/40 p-2.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Contact vectors synced</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    size="lg"
                    onClick={handlePublish}
                    className="w-full gap-2 text-xs font-bold shadow-md h-10 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Publish Portfolio to Live Link</span>
                  </Button>
                </div>
              </div>
            )}

            {/* ── 9. PUBLISHED SUCCESS SCREEN ── */}
            {currentStep === 9 && (
              <div className="flex flex-col items-center justify-center text-center py-10 px-4 space-y-6 max-w-md mx-auto">
                <div className="size-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg animate-bounce">
                  <Check className="h-8 w-8" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                    Your Portfolio is Live!
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Your public portfolio website is now online and accessible to clients worldwide.
                  </p>
                </div>

                {/* Live URL Box with 1-Click Copy */}
                <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3 text-left">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    Shareable Public Live Link
                  </span>
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-white border border-emerald-200/80 p-2 text-xs font-mono text-slate-800 select-all">
                    <span className="truncate">{shareableUrl}</span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 shrink-0 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition-colors"
                    >
                      {copiedLink ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedLink ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Link
                    href={`/p/${portfolio.slug}`}
                    target="_blank"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open Live Portfolio</span>
                  </Link>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 text-xs gap-1.5"
                  >
                    <span>Return to Edit</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* ── Fixed Bottom Step Navigation Action Bar ── */}
          {currentStep >= 1 && currentStep <= 8 && (
            <div className="border-t border-border/60 bg-white p-3.5 px-5 flex items-center justify-between shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep((s) => s - 1)}
                className="h-8 text-xs gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{currentStep === 1 ? "Welcome" : "Back"}</span>
              </Button>

              <div className="flex items-center gap-2">
                {currentStep < 8 ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setCurrentStep((s) => s + 1)}
                    className="h-8 text-xs font-semibold gap-1.5 shadow-sm"
                  >
                    <span>Next: {STEPS[currentStep].title}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handlePublish}
                    className="h-8 px-4 text-xs font-bold gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>Publish Portfolio</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column: Real-Time Live Preview (Desktop & Toggle) ── */}
        <div
          className={cn(
            "flex flex-col h-full min-h-0 overflow-hidden rounded-xl border border-border/60 bg-slate-900 shadow-2xs transition-all duration-200",
            mobileView === "editor" ? "hidden lg:flex" : "flex",
            "lg:w-[480px] xl:w-[560px] shrink-0"
          )}
        >
          {/* Preview Window Header Bar */}
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-950 px-4 py-2.5 text-xs text-slate-300 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-red-500/80 inline-block" />
              <span className="size-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="size-2.5 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-mono text-[11px] text-slate-400">
                Live Preview
              </span>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center rounded-lg bg-white/10 p-0.5">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={cn(
                  "p-1 rounded transition-colors",
                  previewDevice === "desktop" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"
                )}
                title="Desktop Preview"
              >
                <Laptop className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("tablet")}
                className={cn(
                  "p-1 rounded transition-colors",
                  previewDevice === "tablet" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"
                )}
                title="Tablet Preview"
              >
                <Tablet className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={cn(
                  "p-1 rounded transition-colors",
                  previewDevice === "mobile" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"
                )}
                title="Mobile Preview"
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Viewport Frame */}
          <div className="flex-1 min-h-0 bg-slate-950/80 p-2 sm:p-3 overflow-hidden flex items-center justify-center">
            <div
              className={cn(
                "h-full rounded-lg bg-white overflow-hidden shadow-xl transition-all duration-300 flex flex-col",
                previewDevice === "desktop" && "w-full",
                previewDevice === "tablet" && "w-[90%] max-w-[440px]",
                previewDevice === "mobile" && "w-[75%] max-w-[340px]"
              )}
            >
              <PortfolioPreview data={portfolio} device={previewDevice} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
