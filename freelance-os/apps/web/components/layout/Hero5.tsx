/**
 * @file apps/web/components/layout/Hero5.tsx
 * @description Hero Component with Kinetic Word Rotation & Live Analysis Card Preview
 *
 * WHY THIS FILE WAS CREATED:
 * First impressions are critical for SaaS conversion. This component was crafted to
 * immediately communicate FreelanceOS's edge: helping freelancers apply to jobs
 * "smarter", "faster", "safer", "sharper", and "verified".
 *
 * WHY AND HOW IT IS USED:
 * 1. Visual Hook: Uses a spring-physics-driven Framer Motion text cycler that automatically
 *    rotates through value propositions every 2 seconds without layout shifts.
 * 2. High-Intent Actions: Provides direct entry points for users:
 *    - "Start analyzing free" -> Links to `/analyze` (primary action)
 *    - "See a live analysis" -> Links to `/history` (social proof / sample report)
 * 3. Tangible Preview: Renders `<AnalysisCardMockup />` immediately below the headline,
 *    giving visitors instant visual proof of the platform's depth (risk flags, fit scores,
 *    key deliverables) without requiring an account upfront.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MoveRight, Sparkles } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { AnalysisCardMockup } from "@/components/ui/analysis-card-mockup";

/* =========================================================================
   Hero Component
   ========================================================================= */
export const Hero5 = () => {

  /* ── 1. STATE & ROTATION LOGIC ────────────────────────────────────────── */
  // titleNumber tracks the current active index of the rotating keyword array
  const [titleNumber, setTitleNumber] = useState<number>(0);

  // Memoized list of rotating adjectives highlighting core value propositions
  const titles = useMemo(
    () => ["smarter", "faster", "safer", "sharper", "verified"],
    []
  );

  // Timer effect: advances the rotating word every 2000 milliseconds
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);

    // Cleanup timer on unmount or when titleNumber changes
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);


  /* ── 2. RENDER ────────────────────────────────────────────────────────── */
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-start justify-center pt-8 md:pt-14 pb-20 px-4 sm:px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="flex gap-6 md:gap-8 items-center justify-center flex-col text-center">

          {/* ── Sub-Badge: Value Signal ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 rounded-full px-5 py-2 text-xs md:text-sm font-medium shadow-sm hover:bg-secondary/80 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>See how FreelanceOS works</span>
              <MoveRight className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />
            </Button>
          </motion.div>


          {/* ── Main Headline with Animated Keyword Ticker ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex gap-4 flex-col max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.15]">
              <span>Apply to freelance work</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center h-[1.35em] md:pb-2 md:pt-1 text-blue-600">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-bold"
                    initial={{ opacity: 0, y: "-100%" }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -120 : 120,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            {/* Subtitle / Explainer copy */}
            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto pt-1 font-normal">
              Reading a project brief, spotting red flags, and writing a proposal
              that doesn&apos;t oversell you shouldn&apos;t take hours. FreelanceOS
              analyzes the opportunity, checks it against your real profile, and
              hands you a truth-checked proposal you can trust.
            </p>
          </motion.div>


          {/* ── Call to Action Buttons ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3.5 mt-2 w-full sm:w-auto px-4 sm:px-0 justify-center items-center"
          >
            {/* Secondary CTA: Preview Historical Project */}
            <Link href="/history" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-7 py-6 text-sm font-medium w-full sm:w-auto border-border/80 hover:bg-muted/60 transition-colors shadow-sm"
              >
                See a live analysis
              </Button>
            </Link>

            {/* Primary CTA: Jump into AI Analysis Engine */}
            <Link href="/analyze" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="gap-2.5 rounded-full px-7 py-6 text-sm font-semibold w-full sm:w-auto shadow-md hover:shadow-lg transition-all"
              >
                <span>Start analyzing free</span>
                <MoveRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>


          {/* ── Interactive Live Analysis Card Mockup ── */}
          {/* Visual proof showcasing project score, red flags, and scope analysis */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="w-full transform scale-90 sm:scale-95 md:scale-100 origin-top mt-4 mb-4"
          >
            <AnalysisCardMockup />
          </motion.div>

        </div>
      </div>
    </div>
  );
};

