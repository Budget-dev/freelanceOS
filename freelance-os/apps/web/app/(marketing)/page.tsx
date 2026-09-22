/**
 * @file apps/web/app/(marketing)/page.tsx
 * @description Main Marketing Landing Page for FreelanceOS
 *
 * WHY THIS FILE WAS CREATED:
 * This is the public landing page (root route `/`) of FreelanceOS. Its purpose
 * is to communicate the core value proposition of the opportunity intelligence platform:
 * transforming vague, intimidating client briefs into verified intelligence, structured
 * risk audits, and winning proposals.
 *
 * WHY AND HOW IT IS USED:
 * This page serves as the entry point for prospective users and search traffic.
 * It is structured into 3 distinct, high-impact sections arranged in logical conversion order:
 *
 * 1. `<Hero5 />` (Hero & Live Preview):
 *    - Captures immediate user interest with rotating kinetic typography ("Apply to freelance work smarter, faster, safer...").
 *    - Displays primary conversion CTAs ("Start analyzing free", "See a live analysis").
 *    - Renders an interactive card preview showing an AI audit with score badges, deliverables, and warning alerts.
 *
 * 2. `<HowItWorks />` (5-Stage Intelligence Pipeline):
 *    - Guides the visitor through the 5-step workflow:
 *      (1) Paste Opportunity -> (2) Understand Brief -> (3) Client Intelligence ->
 *      (4) Fit & Risks -> (5) Price, Position & Apply.
 *    - Uses an animated dashed SVG path connecting pins to visually guide the eye.
 *
 * 3. `<JobSlider />` (Marketplace Roles & High-Demand Opportunities):
 *    - Proves the practical utility of FreelanceOS across dozens of real-world freelance roles
 *      (Frontend, Full Stack, Tech Lead, Rust, Security, Cloud, UI/UX, etc.).
 *    - Shows real-time job counts to create excitement and urgency before the footer.
 */

"use client";

import { Hero5 } from "@/components/layout/Hero5";
import HowItWorks from "@/components/ui/how-it-works";
import JobSlider from "@/components/ui/job-slider";

/* =========================================================================
   Landing Page Component
   ========================================================================= */
export default function Home() {
  return (
    <main className="w-full flex flex-col items-center overflow-x-hidden">

      {/* ── Section 1: Hero & Interactive Analysis Mockup ── */}
      <section className="w-full">
        <Hero5 />
      </section>

      {/* ── Section 2: Interactive 5-Step Process Breakdown ── */}
      <section className="w-full border-t border-border/40 bg-slate-50/50">
        <HowItWorks />
      </section>

      {/* ── Section 3: Popular Freelance Roles & Marketplace Demand Slider ── */}
      <section className="w-full border-t border-border/40 py-8 md:py-12">
        <JobSlider />
      </section>

    </main>
  );
}

