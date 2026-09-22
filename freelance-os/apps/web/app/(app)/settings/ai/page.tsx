"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  Eye,
  EyeOff,
  Check,
  Save,
  Cpu,
  Sliders,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { AISettingsStorage, type AISettings } from "@/lib/storage";

export default function SettingsAIPage() {
  const [settings, setSettings] = useState<AISettings>(AISettingsStorage.get());
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setSettings(AISettingsStorage.get());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    AISettingsStorage.save(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-xl font-bold tracking-tight text-slate-900">
          AI & Model Intelligence Settings
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Connect your custom LLM provider API keys, select your preferred models, and tune proposal tone.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Model Selection & Tone Card */}
        <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Primary Inference Model
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "gpt-4o", label: "OpenAI GPT-4o", desc: "Fast multimodal reasoning, ideal for Upwork & direct briefs." },
                  { id: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet", desc: "Highest coding accuracy and nuanced proposal voice." },
                  { id: "gemini-1-5-pro", label: "Google Gemini 1.5 Pro", desc: "Massive context window for long specification PDFs." },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, defaultModel: m.id as any }))}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      settings.defaultModel === m.id
                        ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/20"
                        : "border-slate-200 bg-white hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">{m.label}</div>
                    <div className="text-[11px] text-slate-500 mt-1 leading-snug">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Proposal Voice & Tone */}
            <div className="border-t border-slate-100 pt-6 space-y-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-purple-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Proposal Drafting Tone
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "consultative", label: "Consultative", desc: "Senior advisory partner" },
                  { id: "direct", label: "Direct & Concise", desc: "Immediate execution focus" },
                  { id: "technical", label: "Technical Deep-Dive", desc: "Architecture & tech stack" },
                  { id: "value-driven", label: "Value & ROI", desc: "Commercial outcome driven" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, proposalTone: t.id as any }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settings.proposalTone === t.id
                        ? "border-purple-500 bg-purple-50/40 ring-1 ring-purple-500/20"
                        : "border-slate-200 bg-white hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">{t.label}</div>
                    <div className="text-[10.5px] text-slate-500 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bring Your Own Keys (BYOK) Card */}
        <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-amber-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Custom Provider API Keys (Optional)
                </h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                By default, FreelanceOS provides built-in quota for all analyses. You can optionally connect your personal keys for unlimited zero-margin execution. Keys are stored locally in your browser and never logged.
              </p>
            </div>

            <div className="space-y-4">
              {/* OpenAI Key */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span>OpenAI API Key</span>
                  <span className="text-[11px] text-slate-400 font-normal">sk-...</span>
                </label>
                <div className="relative">
                  <input
                    type={showOpenAIKey ? "text" : "password"}
                    value={settings.openaiApiKey || ""}
                    onChange={(e) => setSettings((prev) => ({ ...prev, openaiApiKey: e.target.value }))}
                    placeholder="sk-proj-..."
                    className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3 pr-10 text-xs sm:text-sm font-mono text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showOpenAIKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Anthropic Key */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span>Anthropic API Key</span>
                  <span className="text-[11px] text-slate-400 font-normal">sk-ant-...</span>
                </label>
                <div className="relative">
                  <input
                    type={showAnthropicKey ? "text" : "password"}
                    value={settings.anthropicApiKey || ""}
                    onChange={(e) => setSettings((prev) => ({ ...prev, anthropicApiKey: e.target.value }))}
                    placeholder="sk-ant-api03-..."
                    className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3 pr-10 text-xs sm:text-sm font-mono text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showAnthropicKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Google Gemini Key */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span>Google Gemini API Key</span>
                  <span className="text-[11px] text-slate-400 font-normal">AIza...</span>
                </label>
                <div className="relative">
                  <input
                    type={showGeminiKey ? "text" : "password"}
                    value={settings.geminiApiKey || ""}
                    onChange={(e) => setSettings((prev) => ({ ...prev, geminiApiKey: e.target.value }))}
                    placeholder="AIzaSy..."
                    className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3 pr-10 text-xs sm:text-sm font-mono text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions & Feedback */}
            <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
              {isSaved ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                  <Check className="h-4 w-4" />
                  <span>AI configuration saved</span>
                </div>
              ) : (
                <div className="text-xs text-slate-400">
                  Custom keys take precedence over default platform quotas.
                </div>
              )}

              <Button
                type="submit"
                className="h-10 px-6 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs gap-1.5"
              >
                <Save className="h-4 w-4" />
                <span>Save AI Preferences</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
