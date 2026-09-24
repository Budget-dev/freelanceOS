/**
 * @file apps/web/app/admin/layout.tsx
 * @description Master Layout Shell for Administrative Routes (/admin/**)
 *
 * Enforces admin authorization, mounts persistent sidebar rail, and applies
 * workspace styling conforming to FreelanceOS tokens.
 */

"use client";

import React, { useState } from "react";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-[#FDFCFB] text-foreground antialiased">
        {/* Navigation Sidebar */}
        <AdminSidebar
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setIsMobileOpen(false)}
        />

        {/* Content Shell with Left Offset for Desktop Sidebar */}
        <div className="flex flex-col lg:pl-60 min-h-screen">
          <AdminHeader onMobileMenuToggle={() => setIsMobileOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
