"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  ArrowRight,
  FileSearch,
  User,
  Key,
  Clock,
  CheckCircle2,
} from "lucide-react";

export interface AttentionItem {
  id: string;
  type: "analysis_review" | "profile_incomplete" | "ai_key_missing" | "follow_up" | "proposal_needed";
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  priority: "high" | "medium" | "low";
}

/**
 * Demo attention items based on system design capabilities.
 * In production these are derived from:
 * - Profile completeness check
 * - AI key connection status (§25)
 * - Analysis status (§11)
 * - Application follow-up state (§44)
 */
const DEMO_ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: "att_1",
    type: "ai_key_missing",
    title: "Connect your OpenAI API key",
    description: "Required to analyze projects. Your key is never stored.",
    actionLabel: "Connect Key",
    actionHref: "/settings",
    icon: Key,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    priority: "high",
  },
  {
    id: "att_2",
    type: "profile_incomplete",
    title: "Complete your freelancer profile",
    description: "Your profile powers matching, pricing, and proposal accuracy.",
    actionLabel: "Complete Profile",
    actionHref: "/profile",
    icon: User,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    priority: "high",
  },
  {
    id: "att_3",
    type: "analysis_review",
    title: "Review: AI Chatbot Integration",
    description: "Analysis completed — review results and decide next steps.",
    actionLabel: "Review Analysis",
    actionHref: "/history/an_005",
    icon: FileSearch,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
    priority: "medium",
  },
  {
    id: "att_4",
    type: "follow_up",
    title: "Follow up: E-commerce Platform Redesign",
    description: "Client replied 3 days ago. Consider sending a follow-up.",
    actionLabel: "View Application",
    actionHref: "/app/applications",
    icon: Clock,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-50",
    priority: "medium",
  },
];

interface NeedsAttentionProps {
  items?: AttentionItem[];
  isLoading?: boolean;
}

export function NeedsAttention({ items, isLoading }: NeedsAttentionProps) {
  const data = items ?? DEMO_ATTENTION_ITEMS;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-5 w-40 rounded bg-muted animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-9 w-9 rounded-lg bg-muted" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-48 rounded bg-muted" />
                  <div className="h-3 w-64 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <CardTitle>Needs Your Attention</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center gap-3 py-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500/50 mx-auto" />
            <div>
              <p className="text-sm font-medium text-foreground">
                You&apos;re all caught up
              </p>
              <p className="text-[13px] text-muted-foreground">
                No pending actions right now.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {data.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.actionHref}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 -mx-3 transition-colors hover:bg-muted/50 group"
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      item.iconBg
                    )}
                  >
                    <Icon className={cn("h-[18px] w-[18px]", item.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">
                      {item.title}
                    </p>
                    <p className="text-[12px] text-muted-foreground truncate">
                      {item.description}
                    </p>
                  </div>
                  <span className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                    {item.actionLabel}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
