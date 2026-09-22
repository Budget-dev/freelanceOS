/**
 * @file apps/web/components/layout/Header.tsx
 * @description Universal Top Navigation Header Component for FreelanceOS
 *
 * WHY THIS FILE WAS CREATED:
 * A cohesive SaaS application requires a consistent, highly accessible primary navigation bar.
 * This component provides brand identity, high-level route switching across the 6 major
 * platform hubs (Dashboard, Analyze, Applications, History, Profile, Settings), user session
 * indicators, and a responsive mobile drawer.
 *
 * WHY AND HOW IT IS USED:
 * 1. Global Platform Navigation:
 *    - Rendered via `TopNavWrapper` on all marketing, authentication, and workspace pages.
 * 2. Layout Compensation (`isDashboardLayout`):
 *    - When the user navigates into an authenticated app page (e.g. `/dashboard`, `/analyze`),
 *      the left sidebar occupies 3.5rem to 15rem. The header adds `lg:pl-[5.5rem]` so that the
 *      logo and links align harmoniously with the dashboard content grid.
 * 3. Multi-Tier Menu System:
 *    - Desktop: Clean pill links with smooth CSS hover cards for secondary sub-routes.
 *    - Mobile: Fullscreen slide-down drawer with collapsible category trees and auth controls.
 * 4. Auth State Awareness:
 *    - Inspects `useAuth()` to switch dynamically between [Log in / Sign up] and [Dashboard / User Badge / Sign out].
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, User } from "lucide-react";

// UI Components & Utilities
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthContext";

/* =========================================================================
   Navigation Schema & Hierarchy
   Defines top-level navigation hubs and their respective sub-page links.
   ========================================================================= */
const NAVIGATION = [
  {
    title: "Dashboard",
    href: "/dashboard",
    items: [
      { title: "Overview", href: "/dashboard" },
      { title: "Performance Insights", href: "/dashboard" },
    ],
  },
  {
    title: "Analyze Project",
    href: "/analyze",
    items: [
      { title: "New Analysis", href: "/analyze" },
      { title: "Recent Analyses", href: "/history" },
    ],
  },
  {
    title: "Applications",
    href: "/applications",
    items: [
      { title: "All Applications", href: "/applications", separator: true },
      { title: "New / Analyzed", href: "/applications/new" },
      { title: "Applied", href: "/applications/applied" },
      { title: "Client Replied", href: "/applications/replied" },
      { title: "Hired", href: "/applications/hired" },
      { title: "Rejected", href: "/applications/rejected" },
    ],
  },
  {
    title: "History",
    href: "/history",
    items: [
      { title: "All Analyses", href: "/history", separator: true },
      { title: "Recent", href: "/history" },
    ],
  },
  {
    title: "Profile",
    href: "/profile/personal",
    items: [
      { title: "Personal Information", href: "/profile/personal" },
      { title: "Portfolio", href: "/profile/portfolio" },
      { title: "Portfolio Builder", href: "/profile/portfolio/builder" },
    ],
  },
  {
    title: "Settings",
    href: "/settings/account",
    items: [
      { title: "Account", href: "/settings/account" },
      { title: "AI & Models", href: "/settings/ai" },
      { title: "Billing", href: "/settings/billing" },
    ],
  },
];


/* =========================================================================
   Header Component
   ========================================================================= */
export const Header = () => {

  /* ── 1. STATE & ROUTING HOOKS ─────────────────────────────────────────── */
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Detect whether current screen is within the internal authenticated app routes
  const isDashboardLayout =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/analyze") ||
    pathname?.startsWith("/history") ||
    pathname?.startsWith("/applications") ||
    pathname?.startsWith("/settings") ||
    pathname?.startsWith("/profile");

  /* ── 2. ACTION HANDLERS ───────────────────────────────────────────────── */
  // Gracefully terminates Firebase user session and redirects to login
  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Signout error:", err);
    }
  };


  /* ── 3. RENDER ────────────────────────────────────────────────────────── */
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-[#FDFCFB]/95 backdrop-blur supports-[backdrop-filter]:bg-[#FDFCFB]/80 transition-all">
      <div
        className={cn(
          "flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 md:px-8 mx-auto",
          isDashboardLayout && "lg:pl-[5.5rem]"
        )}
      >

        {/* ── Brand Logo ── */}
        <div className="flex items-center gap-2 mr-4 md:mr-8">
          <Link
            href="/"
            className="font-bold text-lg tracking-tight text-foreground hover:opacity-90 transition-opacity"
          >
            FreelanceOS
          </Link>
        </div>


        {/* ── Desktop Primary Navigation Bar ── */}
        <nav
          aria-label="Main Navigation"
          className="hidden xl:flex items-center flex-1 space-x-1 justify-center"
        >
          {NAVIGATION.map((nav) => (
            <div key={nav.title} className="group relative">
              <Link
                href={nav.href}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium text-foreground/80 hover:text-foreground transition-all duration-200 hover:bg-black/[0.04]"
              >
                {nav.title}
              </Link>

              {/* Dropdown Hover Flyout */}
              {nav.items && nav.items.length > 0 && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1.5 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 ease-out z-50">
                  <div className="w-56 rounded-xl border border-border/60 bg-white p-1.5 shadow-xl outline-none">
                    <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50 mb-1 flex items-center justify-between">
                      {nav.title}
                    </div>

                    {nav.items.map((item) => (
                      <div key={item.title}>
                        <Link
                          href={item.href}
                          className="block rounded-lg px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-black/[0.04]"
                        >
                          {item.title}
                        </Link>

                        {item.separator && (
                          <div className="my-1 h-px bg-border/40" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>


        {/* ── Right Action Buttons: Contact sales & Log in (No Sign up) ── */}
        <div className="flex items-center gap-2.5 sm:gap-3 ml-auto xl:ml-8">
          {user ? (
            /* Authenticated State */
            <div className="flex items-center gap-2.5">
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border border-stone-300/80 bg-white/90 hover:bg-stone-100 text-stone-900 text-xs sm:text-[13px] font-medium px-4 h-9 shadow-2xs transition-colors"
                >
                  Contact sales
                </Button>
              </Link>

              <Link href="/dashboard">
                <Button
                  size="sm"
                  className="rounded-full bg-black text-white hover:bg-black/85 text-xs sm:text-[13px] font-medium px-4 h-9 shadow-xs transition-colors"
                >
                  Dashboard
                </Button>
              </Link>

              {/* Sign Out Trigger */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="rounded-full text-xs font-medium h-9 px-3 text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          ) : (
            /* Guest / Visitor State */
            <div className="flex items-center gap-2.5">
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border border-stone-300/80 bg-white/90 hover:bg-stone-100 text-stone-900 text-xs sm:text-[13px] font-medium px-4 h-9 shadow-2xs transition-colors"
                >
                  Contact sales
                </Button>
              </Link>

              <Link href="/login">
                <Button
                  size="sm"
                  className="rounded-full bg-black text-white hover:bg-black/85 text-xs sm:text-[13px] font-medium px-4 sm:px-5 h-9 shadow-xs transition-colors"
                >
                  Log in
                </Button>
              </Link>
            </div>
          )}

          {/* ── Mobile Hamburger Drawer Button ── */}
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden ml-1 h-9 w-9 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

        </div>

      </div>


      {/* ── Mobile Navigation Drawer ── */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-border/50 bg-[#FDFCFB] px-5 py-5 absolute w-full max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-3">
            {NAVIGATION.map((nav) => (
              <div key={nav.title} className="flex flex-col">
                <Link
                  href={nav.href}
                  className="font-semibold text-foreground py-2 text-sm hover:text-black transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {nav.title}
                </Link>

                {nav.items && (
                  <div className="flex flex-col pl-3 border-l-2 border-border/60 ml-1 mb-2 gap-1">
                    {nav.items.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="py-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Mobile Auth Actions */}
            <div className="pt-4 mt-2 border-t border-border/50 flex flex-col gap-3">
              {user ? (
                <div className="flex flex-col gap-2.5">
                  <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full justify-center border-stone-300">
                      Contact sales
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full rounded-full justify-center text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full justify-center border-stone-300">
                      Contact sales
                    </Button>
                  </Link>

                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full rounded-full justify-center font-semibold bg-black text-white hover:bg-black/90">
                      Log in
                    </Button>
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </header>
  );
};
