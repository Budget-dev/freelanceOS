/**
 * @file apps/web/app/(app)/layout.tsx
 * @description Application Workspace Shell Layout for Authenticated Routes
 *
 * WHY THIS FILE WAS CREATED:
 * Internal application pages (`/dashboard`, `/analyze`, `/history`, `/applications`,
 * `/profile`, `/settings`) require a distinct workspace environment compared to public
 * marketing pages. This layout enforces route security (`ProtectedRoute`), mounts the
 * collapsible desktop navigation rail (`Sidebar`), provides a mobile sliding navigation drawer,
 * and maintains strict viewport padding and grid alignments.
 *
 * WHY AND HOW IT IS USED:
 * 1. Route Security (`ProtectedRoute`):
 *    - Automatically redirects unauthorized visitors to `/login` if no active session exists.
 * 2. Onboarding Modal (`CountrySelectModal`):
 *    - Prompts first-time freelancers to specify their primary country/currency for accurate pricing guidance.
 * 3. Collapsible Workspace Navigation (`Sidebar`):
 *    - Desktop: Slim 3.5rem icon rail that smoothly expands to a 15rem drawer on hover.
 *    - Mobile: Full drawer triggered by a top-bar hamburger icon.
 * 4. Content Area Layout & Spacing:
 *    - Applies `md:pl-[3.5rem]` to account for the fixed rail.
 *    - Uses responsive padding (`p-4 sm:p-6 lg:p-8`) and max-width containers (`max-w-screen-xl`)
 *      to ensure high readability across both laptops and ultra-wide displays.
 */

"use client";

import React, { useState } from "react";
import { Menu } from "lucide-react";

// Workspace Components
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import { CountrySelectModal } from "@/components/onboarding/CountrySelectModal";
import { Sidebar } from "@/components/layout/Sidebar";
import { AppFooter } from "@/components/layout/AppFooter";

/* =========================================================================
   AppLayout Component
   ========================================================================= */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  /* ── 1. STATE & MOBILE SIDEBAR DRAWER ─────────────────────────────────── */
  // Controls open/close state of the slide-out navigation on small viewports
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);


  /* ── 2. RENDER ────────────────────────────────────────────────────────── */
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex flex-col md:flex-row text-foreground antialiased">

        {/* ── First-Time User Country & Currency Modal ── */}
        <CountrySelectModal />


        {/* ── Workspace Sidebar Navigation (Desktop Rail + Mobile Drawer) ── */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />


        {/* ── Main Content Area (Offset by Desktop Sidebar Rail) ── */}
        <div className="flex-1 md:pl-[3.5rem] w-full transition-all flex flex-col">

          {/* ── Mobile Top Bar (Visible only on small viewports < 768px) ── */}
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/40 bg-white/95 px-4 backdrop-blur md:hidden">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Open mobile navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <span className="text-sm font-bold tracking-tight text-foreground">
                FreelanceOS Workspace
              </span>
            </div>
          </header>


          {/* ── Page Content Container ── */}
          <main className="flex flex-col min-h-[calc(100vh-3.5rem)] w-full overflow-x-hidden md:min-h-screen p-4 sm:p-6 lg:p-8">

            {/* Dynamic Child Page (e.g. /dashboard, /analyze, /history) */}
            <div className="mx-auto w-full max-w-screen-xl flex-1 pb-12">
              {children}
            </div>

            {/* Workspace Minimal Footer */}
            <div className="mx-auto w-full max-w-screen-xl pt-4">
              <AppFooter />
            </div>

          </main>

        </div>

      </div>
    </ProtectedRoute>
  );
}
