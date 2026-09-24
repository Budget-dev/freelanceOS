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
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { AISettingsStorage, type AISettings, isValidKeyFormat } from "@/lib/storage";

type ValidationState = "idle" | "validating" | "valid" | "invalid";

interface KeyValidationResult {
  state: ValidationState;
  message?: string;
}

export default function SettingsAIPage() {
  const [settings, setSettings] = useState<AISettings>(AISettingsStorage.get());
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Key validation states
  const [geminiValidation, setGeminiValidation] = useState<KeyValidationResult>({ state: "idle" });
  const [openaiValidation, setOpenaiValidation] = useState<KeyValidationResult>({ state: "idle" });
  const [anthropicValidation, setAnthropicValidation] = useState<KeyValidationResult>({ state: "idle" });

  useEffect(() => {
    setSettings(AISettingsStorage.get());
  }, []);

  // Determine which key is active for the selected model
  const getActiveKey = (): {
    key: string | undefined;
    provider: "gemini" | "anthropic" | "openai";
    providerLabel: string;
  } => {
    if (settings.defaultModel === "gemini-1-5-pro") {
      return { key: settings.geminiApiKey, provider: "gemini", providerLabel: "Google Gemini" };
    }
    if (settings.defaultModel === "claude-3-5-sonnet") {
      return { key: settings.anthropicApiKey, provider: "anthropic", providerLabel: "Anthropic Claude" };
    }
    return { key: settings.openaiApiKey, provider: "openai", providerLabel: "OpenAI" };
  };

  const activeKeyInfo = getActiveKey();
  const hasActiveKey = isValidKeyFormat(activeKeyInfo.key, activeKeyInfo.provider);

  const validateKey = async (
    apiKey: string | undefined,
    provider: string,
    setValidation: React.Dispatch<React.SetStateAction<KeyValidationResult>>
  ) => {
    if (!apiKey || !isValidKeyFormat(apiKey, provider as any)) {
      setValidation({
        state: "invalid",
        message: `Please enter a valid ${provider === "gemini" ? "Gemini (AIza...)" : provider === "anthropic" ? "Anthropic (sk-ant-...)" : "OpenAI (sk-...)"} API key.`,
      });
      return;
    }

    setValidation({ state: "validating" });

    try {
      const res = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, provider }),
      });

      const data = await res.json();

      if (data.valid) {
        setValidation({ state: "valid", message: data.message || "Key verified successfully." });
        setTimeout(() => setValidation({ state: "idle" }), 5000);
      } else {
        setValidation({ state: "invalid", message: data.error || "Key validation failed." });
      }
    } catch (err) {
      setValidation({ state: "invalid", message: "Network error during validation." });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    AISettingsStorage.save(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const renderValidationBadge = (validation: KeyValidationResult) => {
    if (validation.state === "validating") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium">
          <Loader2 className="h-3 w-3 animate-spin" /> Validating...
        </span>
      );
    }
    if (validation.state === "valid") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
          <CheckCircle2 className="h-3 w-3" /> {validation.message}
        </span>
      );
    }
    if (validation.state === "invalid") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-red-600 font-medium">
          <XCircle className="h-3 w-3" /> {validation.message}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-xl font-bold tracking-tight text-slate-900">
          AI & Model Intelligence Settings
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Connect your own LLM provider API key to enable AI-powered project analysis. Each analysis uses your key directly.
        </p>
      </div>

      {/* Key Status Banner */}
      {!hasActiveKey && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50/60">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              API Key Required for AI Analysis
            </p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              FreelanceOS uses your own API key to run project analyses. Add your{" "}
              <strong>{activeKeyInfo.providerLabel}</strong> key below to enable AI-powered brief extraction,
              risk detection, and proposal generation. Without a key, analyses use basic heuristic parsing only.
            </p>
          </div>
        </div>
      )}

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
                  { id: "gpt-4o", label: "OpenAI GPT-4o", desc: "Fast multimodal reasoning, ideal for Upwork & direct briefs.", keyField: "openaiApiKey", provider: "openai" as const },
                  { id: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet", desc: "Highest coding accuracy and nuanced proposal voice.", keyField: "anthropicApiKey", provider: "anthropic" as const },
                  { id: "gemini-1-5-pro", label: "Google Gemini 1.5 Pro", desc: "Massive context window for long specification PDFs.", keyField: "geminiApiKey", provider: "gemini" as const },
                ].map((m) => {
                  const keyConfigured = isValidKeyFormat((settings as any)[m.keyField], m.provider);
                  return (
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
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-900">{m.label}</div>
                        {keyConfigured ? (
                          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Valid key configured" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-slate-300 shrink-0" title="No key" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 leading-snug">{m.desc}</div>
                    </button>
                  );
                })}
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
                  Your API Keys (Required for AI Analysis)
                </h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                FreelanceOS runs AI analysis using your own API key. Your key is sent directly from your browser to the provider — it is stored locally and never logged on our servers. Add the key for your selected model above.
              </p>
            </div>

            <div className="space-y-4">
              {/* OpenAI Key */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    OpenAI API Key
                    {settings.defaultModel === "gpt-4o" && (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0 text-[10px] font-bold px-1.5 py-0">
                        Active Model
                      </Badge>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">sk-...</span>
                </label>
                <div className="relative">
                  <input
                    type={showOpenAIKey ? "text" : "password"}
                    value={settings.openaiApiKey || ""}
                    onChange={(e) => {
                      setSettings((prev) => ({ ...prev, openaiApiKey: e.target.value }));
                      setOpenaiValidation({ state: "idle" });
                    }}
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
                <div className="flex items-center justify-between">
                  {renderValidationBadge(openaiValidation)}
                  {settings.openaiApiKey && settings.openaiApiKey.length > 8 && openaiValidation.state !== "validating" && (
                    <button
                      type="button"
                      onClick={() => validateKey(settings.openaiApiKey, "openai", setOpenaiValidation)}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-medium hover:underline"
                    >
                      Verify Key
                    </button>
                  )}
                </div>
              </div>

              {/* Anthropic Key */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    Anthropic API Key
                    {settings.defaultModel === "claude-3-5-sonnet" && (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0 text-[10px] font-bold px-1.5 py-0">
                        Active Model
                      </Badge>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">sk-ant-...</span>
                </label>
                <div className="relative">
                  <input
                    type={showAnthropicKey ? "text" : "password"}
                    value={settings.anthropicApiKey || ""}
                    onChange={(e) => {
                      setSettings((prev) => ({ ...prev, anthropicApiKey: e.target.value }));
                      setAnthropicValidation({ state: "idle" });
                    }}
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
                <div className="flex items-center justify-between">
                  {renderValidationBadge(anthropicValidation)}
                  {settings.anthropicApiKey && settings.anthropicApiKey.length > 8 && anthropicValidation.state !== "validating" && (
                    <button
                      type="button"
                      onClick={() => validateKey(settings.anthropicApiKey, "anthropic", setAnthropicValidation)}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-medium hover:underline"
                    >
                      Verify Key
                    </button>
                  )}
                </div>
              </div>

              {/* Google Gemini Key */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    Google Gemini API Key
                    {settings.defaultModel === "gemini-1-5-pro" && (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0 text-[10px] font-bold px-1.5 py-0">
                        Active Model
                      </Badge>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">AIza...</span>
                </label>
                <div className="relative">
                  <input
                    type={showGeminiKey ? "text" : "password"}
                    value={settings.geminiApiKey || ""}
                    onChange={(e) => {
                      setSettings((prev) => ({ ...prev, geminiApiKey: e.target.value }));
                      setGeminiValidation({ state: "idle" });
                    }}
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
                <div className="flex items-center justify-between">
                  {renderValidationBadge(geminiValidation)}
                  {settings.geminiApiKey && settings.geminiApiKey.length > 8 && geminiValidation.state !== "validating" && (
                    <button
                      type="button"
                      onClick={() => validateKey(settings.geminiApiKey, "gemini", setGeminiValidation)}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-medium hover:underline"
                    >
                      Verify Key
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <ShieldCheck className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Your API keys are stored in your browser&apos;s local storage and synced to your private Firestore profile.
                They are sent directly to the provider&apos;s API during analysis — FreelanceOS never logs, stores,
                or proxies your keys on any shared server.
              </p>
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
                  Add your API key for the selected model to enable AI-powered analysis.
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
