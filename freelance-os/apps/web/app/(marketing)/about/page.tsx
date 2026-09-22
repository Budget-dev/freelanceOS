"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  DollarSign,
  FileCheck,
  Sparkles,
  ArrowRight,
  Target,
  Users,
  Lock,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  const PILLARS = [
    {
      icon: Search,
      title: "Client Dossier & Reputation Intelligence",
      description:
        "Surface verified client history, public footprints, commercial registries, and payment credibility signals before you invest hours drafting custom proposals.",
      badge: "Deep Research",
      color: "text-blue-600 bg-blue-50 border-blue-200/60",
    },
    {
      icon: ShieldCheck,
      title: "Scope Trap & Red Flag Detection",
      description:
        "Spot hidden scope creep, contradictory milestones, unpaid sample demands, and ambiguous technical clauses that lead to project disputes.",
      badge: "Risk Defense",
      color: "text-rose-600 bg-rose-50 border-rose-200/60",
    },
    {
      icon: DollarSign,
      title: "Calibrated Market Rate Pricing",
      description:
        "Receive realistic budget distributions calibrated against client country, market rate benchmarks, project urgency, and technical complexity.",
      badge: "Value Capture",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200/60",
    },
    {
      icon: FileCheck,
      title: "Truth-Checked Proposal Formulation",
      description:
        "Generate proposals cross-referenced strictly against your actual portfolio and verified skillset. No hallucinated claims, no robotic AI buzzwords.",
      badge: "Authentic Win",
      color: "text-purple-600 bg-purple-50 border-purple-200/60",
    },
  ];

  const PRINCIPLES = [
    {
      icon: Lock,
      title: "Absolute Client & Brief Privacy",
      description:
        "Your uploaded project specifications, client documents, and proposal drafts are private. We never share, sell, or use your proprietary briefs to train public models.",
    },
    {
      icon: Target,
      title: "Anti-Spam, High-Signal Applications",
      description:
        "Mass AI spray-and-pray is ruining freelancing. We believe in crafting fewer, deeply researched proposals that actually win profitable contracts.",
    },
    {
      icon: Users,
      title: "Built Solely for Contractors",
      description:
        "Unlike marketplace platforms that prioritize client margins and take heavy platform cuts, FreelanceOS exists exclusively in the freelancer's corner.",
    },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* ── 1. Hero Section ── */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-6">
        <Badge variant="outline" className="px-3.5 py-1 text-xs font-semibold rounded-full border-border/80 bg-slate-50 gap-1.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-slate-700" />
          <span>The Freelance Opportunity Intelligence Platform</span>
        </Badge>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          Leveling the playing field for <span className="text-blue-600">independent talent</span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Every day, skilled freelancers waste hours decoding vague briefs, underpricing complex contracts, or dealing with dishonest clients. FreelanceOS gives you the intelligence to apply smarter, safer, and win on your terms.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link href="/analyze">
            <Button size="lg" className="rounded-xl px-7 font-bold gap-2 shadow-md">
              Start Free Analysis
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/how-it-works">
            <Button variant="outline" size="lg" className="rounded-xl px-7 font-semibold">
              Explore Our Workflow
            </Button>
          </Link>
        </div>
      </section>

      {/* ── 2. The Mission Story Section ── */}
      <section className="w-full border-y border-stone-200/60 bg-[#F9F8F6]/70 py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Why FreelanceOS Was Created
          </h2>
          <div className="space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base">
            <p>
              Freelancing offers unprecedented freedom, but it places the entire operational burden on the individual. Independent engineers, designers, and consultants are expected to be expert investigators, forensic contract auditors, pricing strategists, and persuasive copywriters—all before ever getting paid.
            </p>
            <p>
              Traditional marketplaces profit from high bid volumes, encouraging spam and driving rates down to the bottom. Meanwhile, generic generative AI tools produce generic, easily spotted boilerplate that burns client trust.
            </p>
            <p className="font-semibold text-slate-900">
              FreelanceOS replaces guesswork with verifiable opportunity intelligence. We extract the true scope, verify client credibility, highlight risks, and ensure every proposal you submit represents your authentic technical strengths.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. Four Intelligence Pillars ── */}
      <section className="w-full py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
            The Four Pillars of Opportunity Intelligence
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Everything you need to turn an ambiguous project posting into a confident, profitable business decision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card key={pillar.title} className="border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all rounded-2xl bg-white">
                <CardContent className="p-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${pillar.color}`}>
                      {pillar.badge}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── 4. Guiding Principles ── */}
      <section className="w-full border-t border-slate-200/80 bg-white py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Our Core Principles
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              How we design our platform to safeguard your time, reputation, and income.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRINCIPLES.map((principle) => {
              const Icon = principle.icon;
              return (
                <div key={principle.title} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3 text-left">
                  <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {principle.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. Bottom CTA ── */}
      <section className="w-full py-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-b from-[#faf8f5] to-white p-8 sm:p-12 space-y-6 shadow-sm">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Stop guessing. Start knowing.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
            Try your first project audit in 60 seconds. Paste any client description or project link to see the intelligence engine at work.
          </p>
          <div className="pt-2">
            <Link href="/analyze">
              <Button size="lg" className="rounded-xl px-8 font-bold gap-2 shadow-md">
                Audit an Opportunity Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
