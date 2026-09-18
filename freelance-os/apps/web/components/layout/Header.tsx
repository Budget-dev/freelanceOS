"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAVIGATION = [
  {
    title: "Dashboard",
    href: "/dashboard",
    items: [
      { title: "Overview", href: "/dashboard" },
      { title: "Performance Insights", href: "/dashboard/performance" },
    ],
  },
  {
    title: "Analyze Project",
    href: "/analyze",
    items: [
      { title: "New Analysis", href: "/analyze/new" },
      { title: "Recent Analyses", href: "/analyze/recent" },
    ],
  },
  {
    title: "Opportunities",
    href: "/opportunities",
    items: [
      { title: "All Opportunities", href: "/opportunities", separator: true },
      { title: "New", href: "/opportunities/new" },
      { title: "Analyzed", href: "/opportunities/analyzed" },
      { title: "Good Match", href: "/opportunities/good-match" },
      { title: "Saved / Maybe", href: "/opportunities/saved" },
    ],
  },
  {
    title: "Applications",
    href: "/applications",
    items: [
      { title: "All Applications", href: "/applications", separator: true },
      { title: "Applied", href: "/applications/applied" },
      { title: "Client Replied", href: "/applications/replied" },
      { title: "Interview", href: "/applications/interview" },
      { title: "Hired", href: "/applications/hired" },
      { title: "Rejected", href: "/applications/rejected" },
    ],
  },
  {
    title: "History",
    href: "/history",
    items: [
      { title: "All Analyses", href: "/history", separator: true },
      { title: "Recent", href: "/history/recent" },
    ],
  },
  {
    title: "Profile",
    href: "/profile",
    items: [
      { title: "Personal Information", href: "/profile/personal" },
      { title: "Skills & Technologies", href: "/profile/skills" },
      { title: "Experience", href: "/profile/experience" },
      { title: "Qualifications & Certifications", href: "/profile/qualifications" },
      { title: "Portfolio", href: "/profile/portfolio" },
      { title: "Previous Projects", href: "/profile/projects" },
      { title: "Preferences", href: "/profile/preferences" },
    ],
  },
  {
    title: "AI & Usage",
    href: "/ai",
    items: [
      { title: "OpenAI Connection", href: "/ai/connection" },
      { title: "Usage", href: "/ai/usage" },
    ],
  },
  {
    title: "Billing",
    href: "/billing",
    items: [
      { title: "Current Plan", href: "/billing" },
      { title: "Upgrade to Pro", href: "/billing/upgrade" },
      { title: "Billing History", href: "/billing/history" },
    ],
  },
  {
    title: "Settings",
    href: "/settings",
    items: [
      { title: "Account", href: "/settings/account" },
      { title: "Security", href: "/settings/security" },
      { title: "Privacy", href: "/settings/privacy" },
    ],
  },
];

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8 mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-4 md:mr-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-foreground">
            FreelanceOS
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center flex-1 space-x-1 lg:space-x-1 justify-center">
          {NAVIGATION.map((nav) => (
            <div key={nav.title} className="group relative">
              <Link
                href={nav.href}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium text-foreground transition-all duration-200 hover:bg-black/[0.04]"
              >
                {nav.title}
              </Link>

              {nav.items && nav.items.length > 0 && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 ease-out z-50">
                  <div className="w-56 rounded-xl border border-border/50 bg-white p-1.5 shadow-lg outline-none">
                    <div className="px-3 py-2 text-xs font-semibold text-foreground/70 border-b border-border/50 mb-1.5 flex items-center justify-between">
                      {nav.title}
                    </div>
                    {nav.items.map((item, idx) => (
                      <div key={item.title}>
                        <Link
                          href={item.href}
                          className="block rounded-md px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-black/[0.03]"
                        >
                          {item.title}
                        </Link>
                        {item.separator && (
                          <div className="my-1.5 h-px bg-border/40" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-3 ml-auto xl:ml-8">
          <Button variant="ghost" size="sm" className="hidden md:flex font-medium text-sm rounded-full text-muted-foreground hover:text-foreground">
            Log in
          </Button>
          <Button size="sm" className="rounded-full font-medium px-4 md:px-5">
            Sign up
          </Button>
          
          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="xl:hidden ml-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-border/50 bg-white px-4 py-4 absolute w-full max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="flex flex-col gap-2">
            {NAVIGATION.map((nav) => (
              <div key={nav.title} className="flex flex-col">
                <Link
                  href={nav.href}
                  className="font-semibold text-foreground py-2 text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {nav.title}
                </Link>
                {nav.items && (
                  <div className="flex flex-col pl-3 border-l border-border/50 ml-1 mb-2">
                    {nav.items.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="py-1.5 text-[13px] text-muted-foreground hover:text-foreground"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 mt-2 border-t border-border/50 flex flex-col gap-3 md:hidden">
              <Button variant="outline" className="w-full rounded-full justify-center">
                Log in
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
