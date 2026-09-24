/**
 * @file apps/web/components/admin/AdminProtectedRoute.tsx
 * @description Route Guard for Administrative Sub-Application
 *
 * Verifies that the signed-in user has an active administrative role
 * before rendering admin workspace views. Blocks ordinary users.
 */

"use client";

import React from "react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Loader2, ShieldAlert, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdminUser, error } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Verifying administrative access...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !isAdminUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-bold text-foreground">Access Restricted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error || "This section is restricted to authorized FreelanceOS administrators only."}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "default" }), "w-full flex items-center justify-center gap-2")}
            >
              <ArrowLeft className="h-4 w-4" /> Return to Workspace
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline" }), "w-full text-center")}
            >
              Sign In with Another Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
