"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthContext";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Save, User, Mail, DollarSign, Globe, Shield, RefreshCw } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

const ACCOUNT_SETTINGS_KEY = "freelance_os_account_settings_v1";

export default function SettingsAccountPage() {
  const { user } = useAuth();
  const { country, setCountry, currency } = useUserPreferences();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("Full Stack Engineer");
  const [hourlyRate, setHourlyRate] = useState("85");
  const [timezone, setTimezone] = useState("EST (UTC-5)");
  const [bio, setBio] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Check localStorage
    try {
      const stored = localStorage.getItem(ACCOUNT_SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFullName(parsed.fullName || "");
        setEmail(parsed.email || "");
        setTitle(parsed.title || "Full Stack Engineer");
        setHourlyRate(parsed.hourlyRate || "85");
        setTimezone(parsed.timezone || "EST (UTC-5)");
        setBio(parsed.bio || "");
      } else if (user) {
        setFullName(user.displayName || "");
        setEmail(user.email || "");
      }
    } catch {}

    if (user) {
      const loadRemote = async () => {
        try {
          const docRef = doc(db, "users", user.uid, "profile", "personal");
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.fullName) setFullName(data.fullName);
            if (data.email) setEmail(data.email);
            if (data.title) setTitle(data.title);
            if (data.hourlyRate) setHourlyRate(data.hourlyRate);
            if (data.bio) setBio(data.bio);
          }
        } catch (e) {
          console.error("Failed to load user profile", e);
        }
      };
      loadRemote();
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      fullName,
      email,
      title,
      hourlyRate,
      timezone,
      bio,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(ACCOUNT_SETTINGS_KEY, JSON.stringify(payload));
      if (user) {
        const docRef = doc(db, "users", user.uid, "profile", "personal");
        await setDoc(docRef, payload, { merge: true });
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-xl font-bold tracking-tight text-slate-900">
          Account Settings
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal information, rate targets, and localization preferences.
        </p>
      </div>

      <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Identity Group */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Personal Identity
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs sm:text-sm text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs sm:text-sm text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Professional Title & Discipline
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer & AI Systems Architect"
                  className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs sm:text-sm text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Rates & Localization */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Rate & Localization Calibration
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Target Rate ({currency}/hr)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="85"
                      className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 pl-8 pr-3 text-xs sm:text-sm text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Currency Preference
                  </label>
                  <select
                    value={country || "US"}
                    onChange={(e) => setCountry(e.target.value as "US" | "IN")}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs sm:text-sm text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                  >
                    <option value="US">USD ($) — United States</option>
                    <option value="IN">INR (₹) — India</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="EST (UTC-5)"
                    className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs sm:text-sm text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Professional Summary */}
            <div className="border-t border-slate-100 pt-6 space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">
                Professional Bio & Value Proposition
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly describe your core technical specializations and types of projects you deliver..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs sm:text-sm text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Actions & Feedback */}
            <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
              {isSaved ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                  <Check className="h-4 w-4" />
                  <span>Changes saved successfully</span>
                </div>
              ) : (
                <div className="text-xs text-slate-400">
                  Settings are stored securely to calibrate your proposal generation.
                </div>
              )}

              <Button
                type="submit"
                disabled={isSaving}
                className="h-10 px-6 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs gap-1.5"
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
