/**
 * @file apps/web/components/layout/Footer.tsx
 * @description Multi-Column Marketing Footer for FreelanceOS
 *
 * WHY THIS FILE WAS CREATED:
 * A production SaaS marketing website requires a professional, multi-tier footer
 * providing transparent navigation to legal terms, privacy policies, customer support,
 * product documentation, and account portals.
 *
 * WHY AND HOW IT IS USED:
 * 1. Global Marketing Layout:
 *    - Mounted at the bottom of `MarketingLayout` (`app/(marketing)/layout.tsx`)
 *      so it is consistently available across all public-facing pages.
 * 2. Categorized Sitemaps:
 *    - Organized into 4 logical clusters: Product, Support, Legal, and Account.
 * 3. Trust & Credibility:
 *    - Features system badges ("AI-powered", "Secure", "Built for freelancers")
 *      and dynamic copyright date attribution.
 */

import React from "react";
import Link from "next/link";

/* =========================================================================
   Footer Navigation Hierarchy
   ========================================================================= */
const NAVIGATION_SECTIONS = [
  {
    name: "Product",
    items: [
      { name: "About", href: "/about" },
      { name: "How It Works", href: "/how-it-works" },
    ],
  },
  {
    name: "Support",
    items: [
      { name: "Contact & Support", href: "/contact" },
      { name: "Help Center", href: "/help" },
    ],
  },
  {
    name: "Legal",
    items: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  },
  {
    name: "Account",
    items: [
      { name: "AI Settings", href: "/settings/ai" },
      { name: "Billing", href: "/settings/billing" },
      { name: "Account Settings", href: "/settings/account" },
    ],
  },
];

/* =========================================================================
   Footer Component
   ========================================================================= */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      aria-label="Site Footer"
      className="border-t border-slate-200/60 bg-[#FDFCFB] transition-colors"
    >
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">

        {/* ── Main Multi-Column Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* ── Column 1: Brand & Tagline ── */}
          <div className="col-span-2 lg:col-span-1 flex flex-col gap-4">
            <Link
              href="/"
              className="font-bold text-xl tracking-tight text-slate-900 hover:opacity-90 transition-opacity"
            >
              FreelanceOS
            </Link>

            <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
              AI-powered opportunity intelligence platform helping freelancers analyze
              briefs, detect red flags, and win profitable projects.
            </p>
          </div>


          {/* ── Columns 2-5: Navigation Links ── */}
          {NAVIGATION_SECTIONS.map((section) => (
            <div key={section.name} className="flex flex-col gap-4 lg:ml-auto">
              <h3 className="font-semibold text-slate-900 text-sm tracking-tight">
                {section.name}
              </h3>

              <ul className="flex flex-col gap-2.5">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-[13px] text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>


        {/* ── Bottom Bar: Copyright & Trust Badges ── */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-6 text-[13px] text-slate-500">

          {/* Copyright notice */}
          <div className="flex flex-col md:flex-row items-center gap-2 text-center md:text-left">
            <span>© {currentYear} FreelanceOS. All rights reserved.</span>
          </div>

          {/* Platform Trust Highlights */}
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 font-medium text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-slate-400" />
              AI-powered
            </span>

            <span className="hidden sm:inline text-slate-300">•</span>

            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-slate-400" />
              Secure & Private
            </span>

            <span className="hidden sm:inline text-slate-300">•</span>

            <span>Built for Independent Freelancers</span>
          </div>

        </div>

      </div>
    </footer>
  );
}
