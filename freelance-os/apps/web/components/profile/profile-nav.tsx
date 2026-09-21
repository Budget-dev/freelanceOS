"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Briefcase, ExternalLink, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProfileNavProps {
  activeTab: "personal" | "portfolio";
}

export function ProfileNav({ activeTab }: ProfileNavProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-4 mb-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Freelancer Profile
            </h1>
            <Badge variant="completed" className="text-[11px] h-5 gap-1 font-normal">
              <CheckCircle2 className="h-3 w-3" />
              Verified Freelancer
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your personal identity, contact channels, and portfolio showcase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs py-1 px-2.5 font-normal bg-slate-50 text-slate-700">
            Profile Strength: <span className="font-semibold text-emerald-600 ml-1">96%</span>
          </Badge>
        </div>
      </div>

      {/* ── 2 Main Submenus (Personal Information & Portfolio) ── */}
      <div className="flex items-center gap-2 border-b border-border/50 pb-px">
        <Link
          href="/profile/personal"
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 -mb-px",
            activeTab === "personal"
              ? "border-primary text-foreground bg-white shadow-2xs font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-slate-50"
          )}
        >
          <User className="h-3.5 w-3.5" />
          <span>Personal Information</span>
        </Link>

        <Link
          href="/profile/portfolio"
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 -mb-px",
            activeTab === "portfolio"
              ? "border-primary text-foreground bg-white shadow-2xs font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-slate-50"
          )}
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>Portfolio</span>
        </Link>
      </div>
    </div>
  );
}
