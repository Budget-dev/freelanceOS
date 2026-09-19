"use client";

import { useEffect, useState } from "react";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Button } from "@/components/ui/button";

export function CountrySelectModal() {
  const { country, setCountry, isLoaded } = useUserPreferences();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isLoaded && country === null) {
      setIsOpen(true);
    }
  }, [isLoaded, country]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Welcome to FreelanceOS
        </h2>
        <p className="mt-2 text-[14px] text-muted-foreground">
          To provide you with accurate pricing insights and budget tracking, please select your primary operating country.
        </p>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => {
              setCountry("US");
              setIsOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-xl border border-border/50 p-4 transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">🇺🇸</span>
              <span className="font-medium text-foreground">United States</span>
            </div>
            <span className="text-sm font-semibold text-muted-foreground">USD ($)</span>
          </button>

          <button
            onClick={() => {
              setCountry("IN");
              setIsOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-xl border border-border/50 p-4 transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">🇮🇳</span>
              <span className="font-medium text-foreground">India</span>
            </div>
            <span className="text-sm font-semibold text-muted-foreground">INR (₹)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
