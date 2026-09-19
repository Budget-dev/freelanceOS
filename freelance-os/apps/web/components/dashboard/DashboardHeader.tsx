"use client";

import Link from "next/link";
import { Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {getGreeting()}, {userName}
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground sm:text-sm">
          Here&apos;s what&apos;s happening across your freelance projects.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-lg text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500" />
        </Button>
      </div>
    </div>
  );
}
