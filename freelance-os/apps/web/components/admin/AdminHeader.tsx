/**
 * @file apps/web/components/admin/AdminHeader.tsx
 * @description Administrative Top Bar with Real-Time Presence Indicator
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, ExternalLink, ShieldCheck, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { adminFetch } from "@/lib/api/admin-client";

interface AdminHeaderProps {
  onMobileMenuToggle: () => void;
  title?: string;
}

export function AdminHeader({ onMobileMenuToggle, title }: AdminHeaderProps) {
  const { permissions } = useAdminAuth();
  const [active5mCount, setActive5mCount] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadActivityPing() {
      try {
        const res = await adminFetch("/api/admin/activity");
        if (isMounted && res?.summary?.activeLast5m !== undefined) {
          setActive5mCount(res.summary.activeLast5m);
        }
      } catch {
        // graceful ignore
      }
    }

    loadActivityPing();
    const interval = setInterval(loadActivityPing, 45000); // refresh every 45s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const role = permissions?.role || "admin";
  const roleLabel = role.replace("_", " ").toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/60 bg-[#FDFCFB]/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:bg-muted lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-sm font-semibold text-foreground tracking-tight sm:text-base">
            {title || "FreelanceOS Control Center"}
          </h1>
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            Administrative monitoring & operational governance
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Real-Time Heartbeat Pulse */}
        <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card px-2.5 py-1 text-xs text-muted-foreground shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-medium hidden md:inline">
            {active5mCount !== null ? `${active5mCount} active (5m)` : "System active"}
          </span>
        </div>

        {/* Role Pill */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-2.5 py-1 text-xs font-medium text-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-semibold">{roleLabel}</span>
        </div>

        {/* Quick App Link */}
        <Link
          href="/dashboard"
          target="_blank"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 text-xs font-medium flex items-center gap-1.5")}
        >
          <span>App</span>
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </Link>
      </div>
    </header>
  );
}
