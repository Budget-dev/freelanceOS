/**
 * @file apps/web/app/(marketing)/layout.tsx
 * @description Layout Component for Marketing & Public Pages
 *
 * WHY THIS FILE WAS CREATED:
 * This layout defines the presentation shell for all public marketing pages
 * (Landing page, About, Contact, Pricing, Privacy Policy, Terms of Service, etc.).
 *
 * WHY AND HOW IT IS USED:
 * 1. Consistent Shell: Guarantees that public pages render with their appropriate
 *    marketing footer and structured visual flow without polluting authenticated app routes.
 * 2. Footer Placement: Appends the platform's multi-column footer (`Footer`) at the bottom
 *    of the viewport on all public visitor screens.
 * 3. SEO Metadata: Provides metadata defaults tailored for public marketing and discovery.
 */

import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";

/* =========================================================================
   Marketing SEO Metadata
   ========================================================================= */
export const metadata: Metadata = {
  title: "FreelanceOS — Freelance Opportunity Intelligence Platform",
  description:
    "Analyze freelance opportunities, spot red flags, match your profile, and generate truth-checked proposals you can trust.",
};

/* =========================================================================
   Marketing Layout Component
   ========================================================================= */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen w-full">

      {/* Main page content container (e.g. Hero, Features, Sliders) */}
      <div className="flex-1 w-full">
        {children}
      </div>

      {/* Global Marketing Footer */}
      <Footer />

    </div>
  );
}

