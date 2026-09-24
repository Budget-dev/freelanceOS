"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Globe, DollarSign, Clock,
  Linkedin, Github, Check, Save, RotateCcw,
  Camera, Plus, X, ShieldCheck, Key, Eye, EyeOff, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/components/providers/AuthContext";
import { AISettingsStorage } from "@/lib/storage";

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
  fullName: "",
  displayName: "",
  title: "",
  email: "",
  phone: "",
  country: "United States",
  city: "",
  timezone: "UTC",
  hourlyRate: "75",
  availability: "Available (30+ hrs/week)",
  bio: "",
  skills: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
  linkedin: "",
  github: "",
  website: "",
};

export function PersonalInfoForm() {
  const [profile, setProfile] = useState<PersonalProfileData>(DEFAULT_PROFILE);
  const [geminiApiKey, setGeminiApiKey] = useState(() => AISettingsStorage.get().geminiApiKey || "");
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [savedNotice, setSavedNotice] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const { user } = useAuth();

  // Load from LocalStorage or Firestore on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProfile(JSON.parse(stored));
      } else if (user) {
        setProfile((prev) => ({
          ...prev,
          fullName: user.displayName || prev.fullName,
          email: user.email || prev.email,
          displayName: user.displayName ? `@${user.displayName.toLowerCase().replace(/\s+/g, "")}` : prev.displayName,
        }));
      }
      const existingKey = AISettingsStorage.get().geminiApiKey;
      if (existingKey) setGeminiApiKey(existingKey);
    } catch {}

    if (!user) {
      setIsLoaded(true);
      return;
    }
    const loadProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid, "profile", "personal");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as PersonalProfileData;
          setProfile(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }

        // Also check root user record for stored Gemini API key
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const uData = userDocSnap.data();
          if (uData.geminiApiKey) {
            setGeminiApiKey(uData.geminiApiKey);
            AISettingsStorage.save({ geminiApiKey: uData.geminiApiKey });
          }
        }
      } catch (err) {
        console.error("Error loading profile", err);
      }
      setIsLoaded(true);
    };
    loadProfile();
  }, [user]);

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

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      if (geminiApiKey.trim()) {
        AISettingsStorage.save({ geminiApiKey: geminiApiKey.trim() });
      }
      if (user) {
        // 1. Store detailed personal profile subdocument
        const docRef = doc(db, "users", user.uid, "profile", "personal");
        await setDoc(docRef, profile);

        // 2. Store user root document with email, name, and Gemini API key
        await setDoc(
          doc(db, "users", user.uid),
          {
            uid: user.uid,
            email: user.email || profile.email,
            displayName: profile.fullName || profile.displayName,
            headline: profile.title,
            hourlyRate: profile.hourlyRate,
            currency: "USD",
            timezone: profile.timezone,
            country: profile.country,
            city: profile.city,
            geminiApiKey: geminiApiKey.trim() || undefined,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    if (confirm("Reset profile fields to initial demo defaults?")) {
      setProfile(DEFAULT_PROFILE);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="w-full max-w-5xl space-y-8 pb-16">
      {/* ── Saved Toast / Alert ── */}
      <AnimatePresence>
        {savedNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800 shadow-sm"
          >
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Check className="h-4 w-4 text-blue-600" />
              Changes saved successfully.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Tabs */}
      <div className="flex flex-wrap items-center border-b border-border/60 gap-8 px-2 sticky top-0 bg-slate-50/80 backdrop-blur-md z-40 pt-4 -mx-2">
        {[
          { num: 1, label: "Overview" },
          { num: 2, label: "Contact Info" },
          { num: 3, label: "Rates & Availability" },
          { num: 4, label: "Core Skills" },
          { num: 5, label: "Social Links" },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setCurrentStep(s.num as 1 | 2 | 3 | 4 | 5)}
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
          <Button variant="outline" size="sm" onClick={handleReset} className="h-9 px-4 text-xs font-semibold">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="h-9 px-6 text-xs font-bold gap-1.5">
            <Save className="h-3.5 w-3.5" /> Save changes
          </Button>
        </div>
      </div>

      {/* Form Content Area */}
      <div className="bg-white border border-border/40 rounded-xl shadow-sm px-8 py-2">
        
        {/* ── STEP 1: Overview ── */}
        {currentStep === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0">
            {/* Field Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b border-border/50 first:pt-8 last:border-0 last:pb-8">
              <div className="md:col-span-1 space-y-2">
                <h4 className="text-sm font-bold text-foreground">Gig Title & Name</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  As your storefront, your title is the most important place to include keywords that buyers would likely use to search for a service like yours.
                </p>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Full Name</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
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
                    className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>
            </div>

            {/* Field Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b border-border/50 first:pt-8 last:border-0 last:pb-8">
              <div className="md:col-span-1 space-y-2">
                <h4 className="text-sm font-bold text-foreground">Professional Headline</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A short, catchy title summarizing what you do. This appears right below your name on your profile.
                </p>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="e.g. Senior Full-Stack Developer"
                  className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                  required
                />
              </div>
            </div>

            {/* Field Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b border-border/50 first:pt-8 last:border-0 last:pb-8">
              <div className="md:col-span-1 space-y-2">
                <h4 className="text-sm font-bold text-foreground">Professional Bio</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Briefly explain who you are, what you specialize in, and what value you bring to clients. Keep it concise and professional.
                </p>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <textarea
                  value={profile.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  rows={5}
                  placeholder="Briefly explain who you are and what you specialize in..."
                  className="w-full resize-none rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
            </div>

            {/* Field Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b border-border/50 first:pt-8 last:border-0 last:pb-8">
              <div className="md:col-span-1 space-y-2">
                <h4 className="text-sm font-bold text-foreground">Profile Photo</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Upload a clear, professional portrait. This helps build trust with potential clients.
                </p>
              </div>
              <div className="md:col-span-2 flex items-center gap-6">
                <Avatar className="h-20 w-20 border border-border/50 shadow-sm">
                  <AvatarFallback className="bg-primary/5 text-primary text-xl font-semibold">
                    {profile.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button type="button" variant="outline" size="sm" className="h-8 px-4 text-xs">
                    <Camera className="mr-2 h-3.5 w-3.5" />
                    Upload Photo
                  </Button>
                  <p className="text-[10px] text-muted-foreground">JPG, GIF or PNG. Max size of 2MB.</p>
                </div>
              </div>
            </div>

            {/* Field Row: Google Gemini API Key (BYOK) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b border-border/50 first:pt-8 last:border-0 last:pb-8">
              <div className="md:col-span-1 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Key className="h-4 w-4 text-amber-600" />
                  <h4 className="text-sm font-bold text-foreground">Google Gemini API Key</h4>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-[10px] font-mono bg-blue-50 text-blue-700 border-blue-200">
                    Primary BYOK Provider
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Connect your Google Gemini API key. Stored safely in your private Firestore record and used directly for all project brief audits.
                </p>
              </div>
              <div className="md:col-span-2 space-y-2">
                <div className="relative">
                  <input
                    type={showGeminiKey ? "text" : "password"}
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 pr-10 py-2 text-sm font-mono text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Get your free Gemini API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Google AI Studio</a>.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Contact Info ── */}
        {currentStep === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b border-border/50 first:pt-8 last:border-0 last:pb-8">
              <div className="md:col-span-1 space-y-2">
                <h4 className="text-sm font-bold text-foreground">Direct Contact</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Provide your primary email and phone number for client communications and contract details.
                </p>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Phone Number</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b border-border/50 first:pt-8 last:border-0 last:pb-8">
              <div className="md:col-span-1 space-y-2">
                <h4 className="text-sm font-bold text-foreground">Location & Timezone</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Clients often look for freelancers in specific timezones or locations for better collaboration.
                </p>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Country</label>
                    <input
                      type="text"
                      value={profile.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      placeholder="e.g. United States"
                      className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">City</label>
                    <input
                      type="text"
                      value={profile.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Timezone</label>
                  <input
                    type="text"
                    value={profile.timezone}
                    onChange={(e) => handleChange("timezone", e.target.value)}
                    placeholder="e.g. PST (UTC-8)"
                    className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Pricing & Availability ── */}
        {currentStep === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b border-border/50 first:pt-8 last:border-0 last:pb-8">
              <div className="md:col-span-1 space-y-2">
                <h4 className="text-sm font-bold text-foreground">Hourly Rate</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Set your standard hourly rate. This helps set client expectations before negotiations.
                </p>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <div className="relative max-w-sm">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    value={profile.hourlyRate}
                    onChange={(e) => handleChange("hourlyRate", e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-border/70 bg-slate-50/50 pl-9 pr-12 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                  <span className="absolute right-4 top-2.5 text-sm font-medium text-muted-foreground">/hr</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b border-border/50 first:pt-8 last:border-0 last:pb-8">
              <div className="md:col-span-1 space-y-2">
                <h4 className="text-sm font-bold text-foreground">Weekly Capacity</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Let clients know how much time you can dedicate to new projects.
                </p>
              </div>
              <div className="md:col-span-2 space-y-1.5 max-w-sm">
                <select
                  value={profile.availability}
                  onChange={(e) => handleChange("availability", e.target.value)}
                  className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="Available (30+ hrs/week)">Available (30+ hrs/week)</option>
                  <option value="Part-time (10-30 hrs/week)">Part-time (10-30 hrs/week)</option>
                  <option value="Limited (<10 hrs/week)">Limited (&lt;10 hrs/week)</option>
                  <option value="Unavailable">Currently Unavailable</option>
                </select>
              </div>
            </div>

            {/* ── Gemini API Key (BYOK) ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b border-border/50 first:pt-8 last:border-0 last:pb-8">
              <div className="md:col-span-1 space-y-2">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  AI Engine Key
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Provide your own Gemini API key to power AI project analysis, client research, and proposal generation.
                </p>
              </div>
              <div className="md:col-span-2 space-y-1.5 max-w-lg">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5" /> Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showGeminiKey ? "text" : "password"}
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIza..."
                    autoComplete="off"
                    className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 pr-10 text-sm text-foreground font-mono transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey((v) => !v)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Your key is stored securely in your browser and synced to your Firestore profile. It never leaves your account.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: Core Skills ── */}
        {currentStep === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b border-border/50 first:pt-8 last:border-0 last:pb-8">
              <div className="md:col-span-1 space-y-2">
                <h4 className="text-sm font-bold text-foreground">Skills & Expertise</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  List the tools, frameworks, and skills you excel at. These act as tags for your profile.
                </p>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="flex gap-2 max-w-md">
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
                    placeholder="e.g. Next.js, Figma, Copywriting..."
                    className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                  <Button type="button" onClick={handleAddSkill} variant="secondary" className="px-4">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <AnimatePresence>
                      {profile.skills.map((skill) => (
                        <motion.div
                          key={skill}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                        >
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="rounded-full p-0.5 hover:bg-slate-300 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
                {profile.skills.length === 0 && (
                  <p className="text-xs text-muted-foreground">No skills added yet.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 5: Social Links ── */}
        {currentStep === 5 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b border-border/50 first:pt-8 last:border-0 last:pb-8">
              <div className="md:col-span-1 space-y-2">
                <h4 className="text-sm font-bold text-foreground">External Portfolios & Links</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Add links to your professional networks and personal website so clients can view your full body of work.
                </p>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-1.5 max-w-lg">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                  </label>
                  <input
                    type="url"
                    value={profile.linkedin}
                    onChange={(e) => handleChange("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                <div className="space-y-1.5 max-w-lg">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Github className="h-3.5 w-3.5" /> GitHub
                  </label>
                  <input
                    type="url"
                    value={profile.github}
                    onChange={(e) => handleChange("github", e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                <div className="space-y-1.5 max-w-lg">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> Personal Website
                  </label>
                  <input
                    type="url"
                    value={profile.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full rounded-lg border border-border/70 bg-slate-50/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
      </div>
    </div>
  );
}
