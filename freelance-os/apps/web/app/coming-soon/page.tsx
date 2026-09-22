"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function ComingSoonPage() {
  const targetDate = new Date("2026-10-10T00:00:00Z").getTime();

  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date().getTime();
    const difference = targetDate - now;
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const padZero = (num: number) => {
    if (isNaN(num)) return "00";
    return num.toString().padStart(2, "0");
  };

  // To avoid hydration mismatch visually, we can wait until mounted or suppress warning.
  // Using suppressHydrationWarning on a wrapper is best.
  
  return (
    <div className="flex min-h-screen flex-col bg-[#FDFCFB] font-sans selection:bg-black/10">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center sm:py-12">
        
        <div className="mb-6 rounded-full border border-border/80 bg-white px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground shadow-sm">
          Coming Soon
        </div>

        <h1 className="mx-auto mb-5 max-w-4xl text-[36px] font-extrabold leading-[1.1] tracking-tight text-[#0F172A] sm:text-5xl md:text-6xl">
          Stop Chasing Every Project. Start Choosing the Right Ones.
        </h1>

        <div className="mx-auto mb-10 max-w-3xl space-y-3 text-sm text-[#475569] sm:text-base">
          <p>
            AI-powered opportunity intelligence for freelancers — understand the project,
            spot the risks, know your fit, price with confidence, and apply with a proposal
            built around your real experience.
          </p>
          <p className="font-medium text-[#64748B]">
            Built for freelancers who want better projects, not more projects.
          </p>
        </div>

        {/* Countdown Timer */}
        <div suppressHydrationWarning className="mb-10 flex items-center justify-center gap-3 sm:gap-6">
          <TimeUnit value={isMounted ? padZero(timeLeft.days) : "00"} label="DAYS" />
          <Colon />
          <TimeUnit value={isMounted ? padZero(timeLeft.hours) : "00"} label="HOURS" />
          <Colon />
          <TimeUnit value={isMounted ? padZero(timeLeft.minutes) : "00"} label="MINUTES" />
          <Colon />
          <TimeUnit value={isMounted ? padZero(timeLeft.seconds) : "00"} label="SECONDS" />
        </div>

        {/* Email Notify Form */}
        <div className="w-full max-w-[500px]">
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email for early access"
              required
              className="flex-1 rounded-lg border border-border/70 bg-white px-5 py-3 text-[15px] outline-none transition-colors focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] placeholder:text-[#94A3B8]"
            />
            <Button size="lg" className="h-[50px] rounded-lg bg-[#111827] px-8 text-[15px] font-medium text-white transition-colors hover:bg-[#111827]/90 shadow-md">
              Get Early Access
            </Button>
          </form>
          <p className="mt-4 text-xs text-[#64748B]">
            Be first to know when we open the doors.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto w-full border-t border-border/50 bg-white/50 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 md:flex-row text-sm text-[#475569]">
          
          <div className="flex flex-col items-center gap-1 md:items-start">
            <span className="font-bold text-base text-[#0F172A] tracking-tight">FreelanceOS</span>
            <span className="text-xs">AI-powered opportunity intelligence for freelancers.</span>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-medium">
            <a href="/privacy" className="hover:text-[#0F172A] transition-colors">Privacy</a>
            <span>&middot;</span>
            <a href="/terms" className="hover:text-[#0F172A] transition-colors">Terms</a>
            <span>&middot;</span>
            <a href="/contact" className="hover:text-[#0F172A] transition-colors">Contact</a>
          </div>
          
          <div className="text-xs">
            &copy; {new Date().getFullYear()} FreelanceOS. All rights reserved.
          </div>
          
        </div>
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex w-24 flex-col overflow-hidden rounded-[10px] border border-border/60 bg-[#FAFAFA] shadow-sm sm:w-[110px]">
      <div className="flex h-20 items-center justify-center bg-white text-[40px] font-bold tracking-tight text-[#0F172A] sm:h-24 sm:text-[46px]">
        {value}
      </div>
      <div className="flex h-10 items-center justify-center border-t border-border/40 text-[10px] font-semibold uppercase tracking-widest text-[#64748B] sm:h-11 sm:text-[11px]">
        {label}
      </div>
    </div>
  );
}

function Colon() {
  return (
    <div className="flex flex-col gap-2.5 pb-11 sm:gap-3">
      <div className="h-1.5 w-1.5 rounded-full bg-[#CBD5E1]"></div>
      <div className="h-1.5 w-1.5 rounded-full bg-[#CBD5E1]"></div>
    </div>
  );
}
