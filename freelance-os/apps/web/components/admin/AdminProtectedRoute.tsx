/**
 * @file apps/web/components/admin/AdminProtectedRoute.tsx
 * @description Route Guard for Administrative Sub-Application
 *
 * Verifies that the signed-in user has an active administrative role
 * before rendering admin workspace views. Blocks ordinary users and
 * redirects unauthenticated users to the dedicated /admin/login portal.
 */

"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Loader2, ShieldAlert, ArrowLeft, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, isAdminUser, error } = useAdminAuth();

  // Redirect to admin login portal if no user session is present
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/admin/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFCFB]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-stone-900" />
          <p className="text-sm font-medium text-stone-600 animate-pulse">
            Verifying administrative access...
          </p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFCFB]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-stone-900" />
          <p className="text-sm font-medium text-stone-600">
            Redirecting to Admin Portal...
          </p>
        </div>
      </div>
    );
  }

  // Signed in, but lacks administrative privileges
  if (!isAdminUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFCFB] p-4">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-900">
            <ShieldAlert className="h-7 w-7 text-amber-700" />
          </div>
          <h1 className="text-xl font-bold text-stone-900">Access Restricted</h1>
          <p className="mt-2 text-xs text-stone-600 leading-relaxed">
            Signed in as <span className="font-mono font-medium text-stone-900">{user.email || "current account"}</span>.
            This account does not have administrative privileges.
          </p>
          {error && !error.includes("500") && (
            <p className="mt-2 text-xs text-red-600">{error}</p>
          )}

          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href="/admin/login"
              className={cn(
                buttonVariants({ variant: "default" }),
                "w-full h-11 rounded-xl bg-stone-900 text-white font-semibold flex items-center justify-center gap-2"
              )}
            >
              <LogIn className="h-4 w-4" /> Sign In with Admin Account
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full h-11 rounded-xl border-stone-300 text-stone-700 flex items-center justify-center gap-2"
              )}
            >
              <ArrowLeft className="h-4 w-4" /> Return to Workspace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
