/**
 * @file apps/web/components/admin/AdminSidebar.tsx
 * @description Dedicated Administrative Navigation Sidebar
 *
 * Implements the exact FreelanceOS design system tokens:
 * - Dashboard (/admin)
 * - Users (/admin/users)
 * - Projects (/admin/projects)
 * - Subscriptions (/admin/subscriptions)
 * - Plans (/admin/subscription-plans)
 * - Analytics (/admin/analytics)
 * - Activity (/admin/activity)
 * - Audit Logs (/admin/audit-logs)
 * - Admin Settings (/admin/settings)
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthContext";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CreditCard,
  Layers,
  LineChart,
  Activity,
  ScrollText,
  Settings,
  ArrowLeft,
  Shield,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AdminSidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const ADMIN_NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    exact: false,
  },
  {
    name: "Projects",
    href: "/admin/projects",
    icon: FolderKanban,
    exact: false,
  },
  {
    name: "Subscriptions",
    href: "/admin/subscriptions",
    icon: CreditCard,
    exact: false,
  },
  {
    name: "Plans",
    href: "/admin/subscription-plans",
    icon: Layers,
    exact: false,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: LineChart,
    exact: false,
  },
  {
    name: "Activity",
    href: "/admin/activity",
    icon: Activity,
    exact: false,
  },
  {
    name: "Audit Logs",
    href: "/admin/audit-logs",
    icon: ScrollText,
    exact: false,
  },
  {
    name: "Admin Settings",
    href: "/admin/settings",
    icon: Settings,
    exact: false,
  },
];

export function AdminSidebar({ isMobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { permissions } = useAdminAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Signout error", err);
    }
  };

  const role = permissions?.role || "admin";
  const roleLabel = role.replace("_", " ").toUpperCase();
  const roleBadgeColor =
    role === "super_admin"
      ? "bg-purple-100 text-purple-700 border-purple-200"
      : role === "admin"
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : "bg-amber-100 text-amber-700 border-amber-200";

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Administrator";
  const initials = (user?.displayName
    ? user.displayName.slice(0, 2)
    : user?.email
    ? user.email.slice(0, 2)
    : "AD"
  ).toUpperCase();

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#FDFCFB] text-foreground">
      {/* Top Header */}
      <div>
        <div className="flex h-16 items-center justify-between border-b border-border/60 px-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-sm">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-bold text-foreground tracking-tight">FreelanceOS</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Admin</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-none">Operations & Control</p>
            </div>
          </Link>

          {isMobileOpen && (
            <button
              onClick={onMobileClose}
              className="p-1 rounded-md text-muted-foreground hover:bg-muted lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Role & Back Link */}
        <div className="p-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-between rounded-lg border border-border/70 bg-card/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to App Workspace
            </span>
            <ChevronRight className="h-3 w-3 opacity-60" />
          </Link>
        </div>

        <div className="px-3 pb-2">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Management
            </span>
            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border tracking-wide", roleBadgeColor)}>
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 px-3">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobileOpen && onMobileClose()}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-black/[0.04] hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Sign Out */}
      <div className="border-t border-border/60 p-3">
        <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card/40 p-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-medium text-foreground">{displayName}</p>
              <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Desktop Fixed Sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-60 border-r border-border/60 bg-[#FDFCFB] lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-border/60 bg-[#FDFCFB] shadow-xl transition-transform duration-200 ease-in-out lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
