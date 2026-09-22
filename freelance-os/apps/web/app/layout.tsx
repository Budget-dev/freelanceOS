/**
 * @file apps/web/app/layout.tsx
 * @description Platform Root Layout Component for FreelanceOS
 *
 * WHY THIS FILE WAS CREATED:
 * Next.js App Router requires a top-level root layout (`app/layout.tsx`) that wraps
 * every page and nested sub-layout in the application. It establishes the global HTML document
 * structure (`<html>`, `<body>`), injects platform-wide styling tokens (`globals.css`),
 * and mounts core context providers needed across all user journeys.
 *
 * WHY AND HOW IT IS USED:
 * 1. Global Stylesheet: Loads `globals.css` which includes Tailwind base styles,
 *    color design tokens, CSS variables, and the modern Inter font family.
 * 2. AuthProvider: Manages user authentication state (Firebase Auth / session persistence)
 *    so child components can access `useAuth()` anywhere in the component tree.
 * 3. UserPreferencesProvider: Supplies user settings such as country, regional currency,
 *    and platform display preferences.
 * 4. TopNavWrapper: Renders the universal application top navigation bar, while intelligently
 *    hiding it on public freelancer portfolio pages (`/p/*`, `/portfolio/*`).
 * 5. Children Slot: Renders route-specific pages and nested layouts inside a flex column container.
 */

import type { Metadata } from "next";

// Global CSS & Typography tokens
import "./globals.css";

// Global State & Context Providers
import { AuthProvider } from "@/components/providers/AuthContext";
import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext";

// Navigation & Layout Components
import { TopNavWrapper } from "@/components/layout/TopNavWrapper";

/* =========================================================================
   Global Platform SEO Metadata
   Provides default title and description for search engines and social previews.
   ========================================================================= */
export const metadata: Metadata = {
  title: "FreelanceOS — Freelance Opportunity Intelligence Platform",
  description:
    "Analyze freelance opportunities, spot red flags, match your profile, and generate truth-checked proposals you can trust.",
};

/* =========================================================================
   Root Layout Component
   ========================================================================= */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background flex flex-col font-sans antialiased text-foreground">

        {/* Core Authentication Provider - enables login/session across all routes */}
        <AuthProvider>

          {/* User Preferences Provider - provides currency, locale, and workspace configs */}
          <UserPreferencesProvider>

            {/* Smart Navigation Wrapper - conditionally shows header based on route */}
            <TopNavWrapper />

            {/* Main Content Area - dynamically populated by route segments */}
            <div className="flex-1 flex flex-col w-full">
              {children}
            </div>

          </UserPreferencesProvider>

        </AuthProvider>

      </body>
    </html>
  );
}

