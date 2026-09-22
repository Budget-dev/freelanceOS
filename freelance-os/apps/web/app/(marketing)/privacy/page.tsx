"use client";

import React from "react";
import Link from "next/link";
import { Shield, Lock, FileText, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  const lastUpdated = "September 22, 2026";

  return (
    <div className="w-full py-16 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="space-y-4 border-b border-slate-200/80 pb-8">
        <Badge variant="outline" className="px-3 py-0.5 text-xs font-semibold rounded-full border-border/80 bg-slate-50 gap-1.5 shadow-2xs">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Security & Privacy Protocol</span>
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Last Updated: {lastUpdated} • Effective Date: January 1, 2026
        </p>
      </div>

      <div className="pt-8 space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
        {/* Core Guarantee Highlight */}
        <div className="p-6 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm sm:text-base">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Our Core AI Privacy Commitment</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-950/80 leading-relaxed">
            FreelanceOS treats all client project briefs, specification documents, and proposal drafts as strictly confidential. We do not sell your data, and we never use your proprietary client materials to train public AI foundation models.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            When using FreelanceOS, we collect information necessary to deliver opportunity audits, client intelligence, and proposal formulation:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
            <li>
              <strong className="text-slate-800">Account Credentials:</strong> Your name, email address, password hash (managed securely via Firebase Auth), and regional country settings.
            </li>
            <li>
              <strong className="text-slate-800">Brief Inputs & Uploads:</strong> Text briefs, job URLs, specification documents (PDFs), and screenshot images uploaded for opportunity evaluation.
            </li>
            <li>
              <strong className="text-slate-800">Freelancer Profile & Portfolio:</strong> Verified skills, past project summaries, portfolio case studies, and target hourly rate metrics used to calculate fit scores.
            </li>
            <li>
              <strong className="text-slate-800">Application Pipeline Records:</strong> Tracked proposal stages, client interview notes, and contract values recorded in your workspace.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">2. How We Use Your Information</h2>
          <p>We process your data exclusively for the following operational purposes:</p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
            <li>Extracting structured deliverables, milestone timelines, and technical requirements from briefs.</li>
            <li>Cross-referencing client company domains against public commercial directories to verify reputation.</li>
            <li>Formulating personalized, truth-checked proposal drafts matched against your real skillset.</li>
            <li>Maintaining your private dashboard analytics, win rates, and pipeline status logs.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">3. Third-Party Infrastructure & AI Sub-Processors</h2>
          <p>
            FreelanceOS works with enterprise-grade cloud providers to operate the platform securely:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
            <li><strong className="text-slate-800">Google Cloud / Firebase:</strong> Encrypted database hosting (Firestore) and identity management.</li>
            <li><strong className="text-slate-800">Enterprise AI Inference APIs:</strong> Zero-data retention API endpoints from OpenAI, Anthropic, or Google used solely to process brief requests without storage for training.</li>
            <li><strong className="text-slate-800">Stripe:</strong> PCI-compliant subscription payment processing. We never store raw credit card numbers.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">4. Data Retention & Your Rights (GDPR & CCPA)</h2>
          <p>
            You retain complete ownership over your data. Under global privacy laws including the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA), you have the right to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
            <li>Access and export your saved analyses, portfolio projects, and application logs at any time.</li>
            <li>Request permanent erasure of your account and all associated records.</li>
            <li>Opt out of any marketing or non-essential communication.</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-slate-200/80 pt-6">
          <h2 className="text-xl font-bold text-slate-900">5. Contact Our Privacy Officer</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            For inquiries regarding your personal data or to request account deletion, please email our security desk at:
          </p>
          <p className="font-semibold text-slate-900 text-sm">
            privacy@freelanceos.dev
          </p>
        </section>
      </div>
    </div>
  );
}
