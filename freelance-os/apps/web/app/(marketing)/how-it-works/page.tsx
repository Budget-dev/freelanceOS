"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  AlertTriangle,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0);

  const STAGES = [
    {
      step: 1,
      name: "Ingest Brief",
      headline: "Paste text, drop a specification PDF, or provide a job URL",
      description:
        "FreelanceOS accepts unstructured requirements from Upwork, LinkedIn, email threads, Slack messages, or client PDFs. Our parsing engine sanitizes and extracts every key parameter.",
      details: [
        "Handles raw copy-pasted job descriptions",
        "Supports client PDF specification documents and design links",
        "Parses project timeline, stated budget, and required deliverables",
      ],
      tag: "Stage 1: Ingestion",
    },
    {
      step: 2,
      name: "Scope Extraction",
      headline: "Deconstruct requirements into explicit deliverables and tech stacks",
      description:
        "AI categorizes the true technical scope. It isolates mandatory must-haves from ambiguous nice-to-haves and flags unstated technical dependencies.",
      details: [
        "Explicit deliverable list with estimated effort breakdowns",
        "Identifies core technologies, frameworks, and architecture prerequisites",
        "Detects unmentioned needs (e.g. CI/CD, database migration, automated testing)",
      ],
      tag: "Stage 2: Architecture",
    },
    {
      step: 3,
      name: "Client Intelligence",
      headline: "Investigate client background, public reputation, and credibility",
      description:
        "We scan commercial registers, verified domains, and historical hiring signals to provide a forensic overview of who is actually behind the project.",
      details: [
        "Verification of company domain, location, and operating timezone",
        "Reputation score based on historical contract completion rates",
        "Discovered public contacts and verified stakeholder profiles",
      ],
      tag: "Stage 3: Due Diligence",
    },
    {
      step: 4,
      name: "Risk & Match Audit",
      headline: "Cross-reference brief against your actual verified skills and past wins",
      description:
        "Every requirement is compared against your portfolio. Red flags (unrealistic deadlines, scope creep traps, vague acceptance criteria) are highlighted with actionable mitigation tactics.",
      details: [
        "Calculates fit score based on your actual demonstrated skills",
        "Flags red-alert clauses and missing specification traps",
        "Generates targeted clarifying questions to ask before bidding",
      ],
      tag: "Stage 4: Risk Audit",
    },
    {
      step: 5,
      name: "Calibrate & Formulate",
      headline: "Generate a truth-checked, competitive proposal ready to submit",
      description:
        "Rather than generic boilerplate, FreelanceOS drafts a focused proposal that quotes your real portfolio metrics, answers the client's latent fears, and anchors the right price.",
      details: [
        "Calibrated rate recommendation matching the client's geography and budget",
        "Cites your real projects as verifiable social proof",
        "Generates customized email, LinkedIn, and marketplace cover notes",
      ],
      tag: "Stage 5: Winning Proposal",
    },
  ];

  const FAQS = [
    {
      q: "Does FreelanceOS automatically submit proposals for me?",
      a: "No. We believe automated mass-bidding harms your reputation and delivers low-quality engagements. FreelanceOS gives you deep research, risk audits, and truth-checked proposal drafts so you maintain full control over every application you submit.",
    },
    {
      q: "How does the client background check work?",
      a: "Our intelligence engine searches public company registries, verified corporate domains, LinkedIn profiles, and platform reputation signals to discover company size, country, local market rates, and credibility indicators.",
    },
    {
      q: "What makes FreelanceOS proposals different from ChatGPT?",
      a: "Generic AI hallucinates experience you don't have, uses repetitive buzzwords ('delighted to submit my proposal'), and ignores contract risks. FreelanceOS references your actual portfolio data and verified skills, producing authentic, credible proposals that sound like a senior consultant.",
    },
    {
      q: "What file formats can I upload for analysis?",
      a: "You can paste plain text, project URLs (Upwork, Freelancer, direct links), or upload PDFs, Word docs, and image screenshots of briefs.",
    },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* ── 1. Hero Section ── */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-6">
        <Badge variant="outline" className="px-3.5 py-1 text-xs font-semibold rounded-full border-border/80 bg-slate-50 gap-1.5 shadow-2xs">
          <Cpu className="w-3.5 h-3.5 text-blue-600" />
          <span>The 5-Stage Intelligence Engine</span>
        </Badge>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          From raw client brief to <span className="text-blue-600">verified decision</span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          See how our multi-stage intelligence pipeline transforms messy project descriptions into structured risk audits, calibrated pricing, and winning proposals.
        </p>

        <div className="pt-2">
          <Link href="/analyze">
            <Button size="lg" className="rounded-xl px-7 font-bold gap-2 shadow-md">
              Try a Live Brief Analysis
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── 2. Interactive Stage Walkthrough ── */}
      <section className="w-full border-y border-stone-200/60 bg-[#F9F8F6]/70 py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Stage Step Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {STAGES.map((s, idx) => (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={cn(
                  "p-3.5 rounded-xl border text-left transition-all",
                  activeStep === idx
                    ? "bg-white border-blue-500 shadow-sm ring-1 ring-blue-500/20"
                    : "bg-white/60 border-slate-200/70 hover:bg-white text-slate-600"
                )}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Step {s.step}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-0.5">
                  {s.name}
                </div>
              </button>
            ))}
          </div>

          {/* Active Stage Card Preview */}
          <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-8 sm:p-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Badge variant="outline" className="w-fit text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border-blue-200">
                  {STAGES[activeStep].tag}
                </Badge>
                <span className="text-xs text-slate-400 font-medium">Stage {activeStep + 1} of 5</span>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {STAGES[activeStep].headline}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
                  {STAGES[activeStep].description}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Key Capabilities in this Phase:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {STAGES[activeStep].details.map((detail) => (
                    <div key={detail} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs sm:text-[13px] text-slate-700 leading-snug">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── 3. Before vs After Comparison ── */}
      <section className="w-full py-16 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Before & After FreelanceOS
          </h2>
          <p className="text-sm text-slate-600">
            Compare the traditional manual process with our opportunity intelligence workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-rose-200/80 bg-rose-50/30 space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <h3 className="font-bold text-rose-900 text-sm">The Traditional Guesswork</h3>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span>Submitting blind proposals without knowing client payment reliability</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span>Missing hidden scope creep clauses that double project hours for free</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span>Using robotic ChatGPT templates that get flagged and ignored</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span>Underbidding projects by 40% due to lack of market benchmarks</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl border border-emerald-200/80 bg-emerald-50/30 space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <h3 className="font-bold text-emerald-900 text-sm">With FreelanceOS Intelligence</h3>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Verified client reputation, operating country, and timezone verified in seconds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Forensic scope risk audit identifies missing specs before you bid</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Truth-checked proposals citing your actual past project deliverables</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Calibrated market rate anchors ensure you charge your full worth</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 4. FAQs ── */}
      <section className="w-full border-t border-slate-200/80 bg-white py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600">
              Common questions about our analysis pipeline and data accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {FAQS.map((faq) => (
              <div key={faq.q} className="p-6 rounded-2xl border border-slate-200/70 bg-slate-50/50 space-y-2.5">
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  {faq.q}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Bottom CTA ── */}
      <section className="w-full py-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-b from-[#faf8f5] to-white p-8 sm:p-12 space-y-6 shadow-sm">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            See the pipeline in action
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
            Paste a project brief right now and test our 5-stage opportunity intelligence engine for free.
          </p>
          <div className="pt-2">
            <Link href="/analyze">
              <Button size="lg" className="rounded-xl px-8 font-bold gap-2 shadow-md">
                Launch Analysis Studio
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
