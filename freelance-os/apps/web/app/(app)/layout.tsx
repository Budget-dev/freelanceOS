"use client";

import { useState } from "react";
import { CountrySelectModal } from "@/components/onboarding/CountrySelectModal";
import { Sidebar } from "@/components/layout/Sidebar";
import { Menu } from "lucide-react";

import { AppFooter } from "@/components/layout/AppFooter";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <CountrySelectModal />
      
      {/* Sidebar handles both desktop and mobile states */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main content area — offset by collapsed sidebar width (3.5rem) on desktop */}
      <div className="flex-1 md:pl-[3.5rem] w-full transition-all">
        {/* Mobile top bar - only visible on small screens */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/40 bg-white/95 px-4 backdrop-blur md:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-base font-bold tracking-tight text-foreground">
              FreelanceOS
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex flex-col min-h-[calc(100vh-3.5rem)] w-full overflow-x-hidden md:min-h-screen p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-screen-xl flex-1 pb-12">
            {children}
          </div>
          <div className="mx-auto w-full max-w-screen-xl">
            <AppFooter />
          </div>
        </main>
      </div>
    </div>
  );
}
