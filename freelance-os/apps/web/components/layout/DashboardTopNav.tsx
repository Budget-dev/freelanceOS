"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  History,
  ClipboardList,
  User,
  Settings,
  Menu,
  X,
  Bell,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analyze", href: "/analyze", icon: Search },
  { label: "History", href: "/history", icon: History },
  { label: "Applications", href: "/applications", icon: ClipboardList },
];

export function DashboardTopNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex h-16 items-center px-4 md:px-6 lg:px-8 mx-auto max-w-screen-xl justify-between">
          <div className="flex items-center gap-6 md:gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg tracking-tight text-foreground"
            >
              FreelanceOS
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-black/[0.04] text-foreground"
                        : "text-muted-foreground hover:bg-black/[0.04] hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/analyze" className="hidden sm:block">
              <Button size="sm" className="rounded-lg gap-1.5 font-medium h-9">
                <Plus className="h-4 w-4" />
                Analyze New
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-lg text-muted-foreground hover:text-foreground hidden sm:flex"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500" />
            </Button>

            <Link href="/profile" className="hidden sm:block">
              <Button variant="ghost" size="icon" className="rounded-lg text-muted-foreground hover:text-foreground">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/settings" className="hidden sm:block">
              <Button variant="ghost" size="icon" className="rounded-lg text-muted-foreground hover:text-foreground">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>

            <button
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:bg-muted"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-white">
            <nav className="flex flex-col p-4 space-y-1">
              {[...NAV_ITEMS, { label: "Profile", href: "/profile", icon: User }, { label: "Settings", href: "/settings", icon: Settings }].map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-black/[0.04] text-foreground"
                        : "text-muted-foreground hover:bg-black/[0.04] hover:text-foreground"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
