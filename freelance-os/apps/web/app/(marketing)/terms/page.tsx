"use client";

import React from "react";
import Link from "next/link";
import { Scale, FileText, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TermsPage() {
  const lastUpdated = "September 22, 2026";

  return (
    <div className="w-full py-16 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="space-y-4 border-b border-slate-200/80 pb-8">
        <Badge variant="outline" className="px-3 py-0.5 text-xs font-semibold rounded-full border-border/80 bg-slate-50 gap-1.5 shadow-2xs">
          <Scale className="w-3.5 h-3.5 text-blue-600" />
          <span>Legal Agreement</span>
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Last Updated: {lastUpdated} • Effective Date: January 1, 2026
        </p>
      </div>

      <div className="pt-8 space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
        {/* Core Disclaimer Callout */}
        <div className="p-6 rounded-2xl border border-blue-200/80 bg-blue-50/50 space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-900 text-sm sm:text-base">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <span>AI Verification Notice</span>
          </div>
          <p className="text-xs sm:text-sm text-blue-950/80 leading-relaxed">
            FreelanceOS provides analytical assistance, risk detection, and draft formulation. You remain the author of your proposals and are responsible for reviewing, fact-checking, and verifying all final deliverables before submitting them to third-party clients.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using FreelanceOS (&quot;the Platform&quot;), provided by FreelanceOS Inc. (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue using the platform immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">2. Description of Service</h2>
          <p>
            FreelanceOS provides an opportunity intelligence suite designed for independent contractors, freelancers, and agencies. Features include brief ingestion, deliverable extraction, client reputation analysis, contract risk flagging, rate calibration benchmarks, and tailored proposal generation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">3. User Intellectual Property Ownership</h2>
          <p>
            You retain 100% full, exclusive ownership of all content you submit to the Platform (including client briefs, notes, and portfolio work), as well as all proposal drafts generated for you through the platform. We claim zero ownership or royalty rights over your proposals or project outcomes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">4. Prohibited Uses</h2>
          <p>When using FreelanceOS, you agree not to:</p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
            <li>Attempt to reverse engineer, decompile, or extract the underlying model weights or prompt architectures.</li>
            <li>Use automated crawlers or scrapers to overwhelm or extract proprietary database indices.</li>
            <li>Submit briefs containing malicious code, pirated software, or unlawful materials.</li>
            <li>Circumvent account quota limits or share login seats outside of authorized plan tiers.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">5. Subscriptions, Renewals & Refunds</h2>
          <p>
            Paid subscriptions (Pro Freelancer, Agency Studio) are billed in advance on a recurring monthly or annual basis. You may cancel your subscription at any time via your Account Settings. All paid plans include a 14-day full refund guarantee upon initial purchase if requested via support@freelanceos.dev.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">6. Limitation of Liability</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            FreelanceOS is provided &quot;as is&quot; without warranties of any kind. In no event shall FreelanceOS Inc. be liable for any indirect, incidental, special, or consequential damages resulting from lost contracts, client disputes, or reliance on analytical estimates.
          </p>
        </section>

        <section className="space-y-3 border-t border-slate-200/80 pt-6">
          <h2 className="text-xl font-bold text-slate-900">7. Questions Regarding Terms</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            If you have questions regarding these terms, please contact our legal team at:
          </p>
          <p className="font-semibold text-slate-900 text-sm">
            legal@freelanceos.dev
          </p>
        </section>
      </div>
    </div>
  );
}
