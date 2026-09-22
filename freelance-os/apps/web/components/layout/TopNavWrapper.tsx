/**
 * @file apps/web/components/layout/TopNavWrapper.tsx
 * @description Intelligent Navigation Header Wrapper with Route-Based Visibility Filtering
 *
 * WHY THIS FILE WAS CREATED:
 * In Next.js App Router, the top-level layout (`app/layout.tsx`) wraps the entire application.
 * However, public freelancer portfolio pages (such as `/p/[slug]` or `/portfolio/[slug]`)
 * are intended to be shared directly with external clients as standalone professional showcases.
 * Showing the platform's SaaS navigation bar (with links to dashboard, settings, analyze, etc.)
 * would distract clients and violate the standalone portfolio experience.
 *
 * WHY AND HOW IT IS USED:
 * 1. Dynamic Route Inspection:
 *    - Uses the Next.js `usePathname()` hook on the client.
 * 2. Conditional Suppression:
 *    - Returns `null` if the route begins with `/p/` or `/portfolio/`.
 * 3. Default Display:
 *    - Renders the global `<Header />` component on all other platform routes.
 */

"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";

/* =========================================================================
   TopNavWrapper Component
   ========================================================================= */
export function TopNavWrapper() {
  const pathname = usePathname();

  // 1. Hide the global platform navigation on public, client-facing portfolio showcases
  if (pathname?.startsWith("/p/") || pathname?.startsWith("/portfolio/")) {
    return null;
  }

  // 2. Render the universal top navigation bar for all marketing and app workspace pages
  return <Header />;
}

