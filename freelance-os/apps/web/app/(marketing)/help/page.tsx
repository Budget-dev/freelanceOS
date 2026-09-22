"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Sparkles,
  HelpCircle,
  FileSearch,
  ShieldAlert,
  FileCheck,
  CreditCard,
  ChevronDown,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>("help_1");

  const CATEGORIES = [
    { id: "all", label: "All Topics" },
    { id: "analysis", label: "Opportunity Analysis", icon: FileSearch },
    { id: "client_intel", label: "Client Intelligence", icon: ShieldAlert },
    { id: "proposals", label: "Proposals & Tracking", icon: FileCheck },
    { id: "billing", label: "Billing & Plans", icon: CreditCard },
  ];

  const FAQS: FAQItem[] = [
    {
      id: "help_1",
      category: "analysis",
      question: "How do I audit a project brief in FreelanceOS?",
      answer:
        "Navigate to the 'Analyze Project' studio (/analyze). You can paste raw brief text directly into the chat, attach PDF specification documents or screenshots, or paste a public project link. The AI engine will immediately start extracting deliverables, scope dependencies, and budget parameters.",
    },
    {
      id: "help_2",
      category: "analysis",
      question: "What does the match score percentage indicate?",
      answer:
        "The match score (0–100%) measures how closely the client's stated technical requirements and deliverable complexity align with your verified portfolio projects and profile skills. Scores above 75% are labeled 'High Fit' and typically yield 2.5× higher proposal acceptance rates.",
    },
    {
      id: "help_3",
      category: "client_intel",
      question: "How are client background and red flags uncovered?",
      answer:
        "FreelanceOS cross-checks public commercial registries, domain footprints, and hiring history. The engine flags red alerts such as contradictory milestone timelines, demands for unpaid test work, aggressive refund clauses, or underfunded scope traps.",
    },
    {
      id: "help_4",
      category: "client_intel",
      question: "What should I do if a project shows red flags?",
      answer:
        "Red flags don't always mean you shouldn't apply—they highlight where you need protective boundaries. FreelanceOS provides specific clarifying questions to ask the client before signing, and suggests contract clauses to prevent scope creep.",
    },
    {
      id: "help_5",
      category: "proposals",
      question: "Can I customize the AI proposal tone and model?",
      answer:
        "Yes! Under Settings -> AI & Models (/settings/ai), you can select your preferred tone (Consultative, Direct, Technical, or Value-driven) and connect your own OpenAI, Anthropic, or Gemini API keys for custom generation.",
    },
    {
      id: "help_6",
      category: "proposals",
      question: "How do I track my active client applications?",
      answer:
        "Go to Applications (/applications). You can organize your proposals across 4 canonical stages: Applied, Client Replied, Hired, and Rejected. You can also add notes, record interview dates, and log contract values.",
    },
    {
      id: "help_7",
      category: "billing",
      question: "How does the Starter Free plan work?",
      answer:
        "The Starter plan is free forever and includes 10 full project brief analyses every month, basic client intelligence checks, and application tracking for up to 5 opportunities. No credit card is required to sign up.",
    },
    {
      id: "help_8",
      category: "billing",
      question: "Can I cancel or upgrade my subscription at any time?",
      answer:
        "Yes, you can upgrade, downgrade, or cancel your subscription at any time under Settings -> Billing (/settings/billing). Upgrades take effect immediately, and cancellations remain active until the end of your billing cycle.",
    },
  ];

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full flex flex-col items-center">
      {/* ── 1. Hero & Search Bar ── */}
      <section className="w-full py-16 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto text-center space-y-6">
        <Badge variant="outline" className="px-3.5 py-1 text-xs font-semibold rounded-full border-border/80 bg-slate-50 gap-1.5 shadow-2xs">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>Knowledge Base & Support</span>
        </Badge>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          How can we help you today?
        </h1>

        {/* Search Input Box */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions (e.g. red flags, pricing, proposals)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-13 rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      </section>

      {/* ── 2. Category Filter Pills ── */}
      <section className="w-full px-4 sm:px-6 max-w-4xl mx-auto pb-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all",
                activeCategory === cat.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── 3. Accordion FAQ List ── */}
      <section className="w-full px-4 sm:px-6 max-w-3xl mx-auto pb-16 space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <HelpCircle className="h-8 w-8 mx-auto text-slate-400" />
            <p className="text-sm font-medium">No help articles match your search.</p>
            <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="text-xs">
              Clear search query
            </Button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isOpen ? null : faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:bg-slate-50/50 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={cn("h-4 w-4 text-slate-500 shrink-0 transition-transform duration-200", isOpen && "rotate-180")}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* ── 4. Can't find what you need CTA ── */}
      <section className="w-full border-t border-stone-200/60 bg-[#F9F8F6]/70 py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
            <MessageSquare className="h-5 w-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Still have questions?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Can&apos;t find the answer you&apos;re looking for? Reach out directly to our engineering support team.
          </p>
          <div className="pt-2">
            <Link href="/contact">
              <Button size="sm" className="rounded-xl px-5 font-bold gap-1.5 shadow-sm">
                Contact Support
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
