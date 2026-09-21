"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Globe, DollarSign, Clock,
  Linkedin, Github, Check, Save, RotateCcw, Sparkles,
  Camera, Plus, X, ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "freelance_os_profile_personal_v1";

export interface PersonalProfileData {
  fullName: string;
  displayName: string;
  title: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  timezone: string;
  hourlyRate: string;
  availability: string;
  bio: string;
  skills: string[];
  linkedin: string;
  github: string;
  website: string;
}

const DEFAULT_PROFILE: PersonalProfileData = {
  fullName: "Alex Rivera",
  displayName: "@arivera",
  title: "Senior Full-Stack & AI Systems Engineer",
  email: "alex.rivera@example.com",
  phone: "+1 (555) 234-5678",
  country: "United States",
  city: "San Francisco, CA",
  timezone: "PST / PDT (UTC-8 / UTC-7)",
  hourlyRate: "95",
  availability: "Available (30+ hrs/week)",
  bio: "Senior Software Engineer with 7+ years of experience architecting AI-powered SaaS platforms, full-stack web applications, and real-time APIs. Specialized in Next.js, Python, OpenAI, and scalable cloud deployments. Passionate about rapid product delivery and clean code.",
  skills: [
    "Next.js",
    "React",
    "TypeScript",
    "Python",
    "OpenAI API",
    "Node.js",
    "PostgreSQL",
    "Tailwind CSS",
    "Docker",
    "AWS",
    "GraphQL",
    "FastAPI"
  ],
  linkedin: "https://linkedin.com/in/alex-rivera-dev",
  github: "https://github.com/alexrivera",
  website: "https://alexrivera.dev",
};

export function PersonalInfoForm() {
  const [profile, setProfile] = useState<PersonalProfileData>(DEFAULT_PROFILE);
  const [newSkill, setNewSkill] = useState("");
  const [savedNotice, setSavedNotice] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  const handleChange = (field: keyof PersonalProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    const trimmed = newSkill.trim();
    if (!profile.skills.includes(trimmed)) {
      setProfile((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    if (confirm("Reset profile fields to initial demo defaults?")) {
      setProfile(DEFAULT_PROFILE);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  if (!isLoaded) return null;

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {/* ── Saved Toast / Alert ── */}
      <AnimatePresence>
        {savedNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 shadow-sm"
          >
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Personal information updated and saved successfully!</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">Auto-saved to session</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero Profile Header Card ── */}
      <Card className="border-border/60 shadow-2xs overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 px-6 pt-4 flex justify-end">
          <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-[10px] h-6 backdrop-blur">
            <span className="size-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
            Active Profile
          </Badge>
        </div>
        <CardContent className="pt-0 pb-6 px-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 mb-4">
            <div className="flex items-end gap-3.5">
              <div className="relative group">
                <Avatar className="size-20 border-4 border-white shadow-md bg-slate-100 text-slate-800">
                  <AvatarFallback className="text-xl font-bold bg-slate-900 text-white">
                    {profile.fullName.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                  <Camera className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-0.5">
                <h2 className="text-lg font-bold text-foreground tracking-tight">
                  {profile.fullName || "Your Name"}
                </h2>
                <p className="text-xs text-muted-foreground font-mono">
                  {profile.displayName} • {profile.city}, {profile.country}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs gap-1.5 shadow-sm">
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 1: Basic Information ── */}
      <Card className="border-border/60 shadow-2xs">
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-slate-700" />
            Basic Identity & Headline
          </CardTitle>
          <CardDescription className="text-xs">
            Your name and primary professional headline shown on proposals and AI analysis outputs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Username / Handle</label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => handleChange("displayName", e.target.value)}
                placeholder="@username"
                className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Professional Title / Headline</label>
            <input
              type="text"
              value={profile.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. Senior Full-Stack & AI Systems Engineer"
              className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Professional Summary & Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              rows={4}
              placeholder="Describe your technical background, industry experience, and strengths..."
              className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs leading-relaxed text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20 resize-y"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Contact & Location ── */}
      <Card className="border-border/60 shadow-2xs">
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-700" />
            Contact Channels & Location
          </CardTitle>
          <CardDescription className="text-xs">
            Coordinates used by the AI to compute timezone overlap with international clients.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-muted-foreground" />
                Primary Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Phone className="h-3 w-3 text-muted-foreground" />
                Phone / WhatsApp Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Country</label>
              <input
                type="text"
                value={profile.country}
                onChange={(e) => handleChange("country", e.target.value)}
                placeholder="e.g. United States"
                className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">City / State</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                Timezone
              </label>
              <input
                type="text"
                value={profile.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
                placeholder="e.g. PST (UTC-8)"
                className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 3: Rates & Availability ── */}
      <Card className="border-border/60 shadow-2xs">
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-700" />
            Hourly Rate & Work Capacity
          </CardTitle>
          <CardDescription className="text-xs">
            Define your pricing structure to automatically flag below-market projects in the AI Analysis Studio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Hourly Target Rate ($ USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold">$</span>
                <input
                  type="number"
                  value={profile.hourlyRate}
                  onChange={(e) => handleChange("hourlyRate", e.target.value)}
                  placeholder="95"
                  className="w-full rounded-lg border border-border/70 bg-slate-50/50 pl-7 pr-3 py-2 text-xs text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Current Availability Status</label>
              <input
                type="text"
                value={profile.availability}
                onChange={(e) => handleChange("availability", e.target.value)}
                placeholder="e.g. Available (30+ hrs/week)"
                className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 4: Skills & Technologies ── */}
      <Card className="border-border/60 shadow-2xs">
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-slate-700" />
            Core Skills & Specializations
          </CardTitle>
          <CardDescription className="text-xs">
            Add your primary frameworks, languages, and tools.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5">
          {/* Add skill row */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Add skill (e.g. Next.js, Python, Tailwind)..."
              className="flex-1 rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSkill}
              className="h-9 px-3 text-xs gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>

          {/* Skill tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {profile.skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="gap-1.5 py-1 px-2.5 text-xs font-medium bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-destructive transition-colors ml-0.5"
                  title={`Remove ${skill}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Section 5: Social & Portfolio Links ── */}
      <Card className="border-border/60 shadow-2xs">
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4 text-slate-700" />
            Social & Public Links
          </CardTitle>
          <CardDescription className="text-xs">
            Links included in your proposals and outreach templates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Linkedin className="h-3 w-3 text-blue-600" />
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={profile.linkedin}
                onChange={(e) => handleChange("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Github className="h-3 w-3 text-slate-800" />
                GitHub Profile URL
              </label>
              <input
                type="url"
                value={profile.github}
                onChange={(e) => handleChange("github", e.target.value)}
                placeholder="https://github.com/username"
                className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Globe className="h-3 w-3 text-emerald-600" />
                Personal Website
              </label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://mywebsite.dev"
                className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-xs text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Bottom Save Action Bar ── */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Data is stored safely and loaded into your AI outreach drafts
        </p>
        <Button type="submit" className="h-9 px-5 text-xs font-semibold gap-1.5 shadow-sm">
          <Save className="h-3.5 w-3.5" />
          Save Personal Information
        </Button>
      </div>
    </form>
  );
}
