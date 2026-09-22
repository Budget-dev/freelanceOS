/**
 * @file apps/web/components/ui/how-it-works.tsx
 * @description Interactive 5-Step Process Visualizer with Dynamic Bezier Connecting Paths
 *
 * WHY THIS FILE WAS CREATED:
 * Understanding how an AI system analyzes freelance jobs is essential to build user trust.
 * Rather than a generic text list, this component provides a kinetic, skeuomorphic "bulletin board"
 * journey with pins, tilted index cards, and an animated dashed conduit that visually guides
 * the visitor's eye down the 5 stages of FreelanceOS opportunity analysis.
 *
 * WHY AND HOW IT IS USED:
 * 1. 5-Stage Intelligence Funnel:
 *    - Step 1: Paste the Opportunity (Raw input from Upwork, LinkedIn, email, or brief)
 *    - Step 2: Understand the Project (Extraction of real deliverables, timeline & scope)
 *    - Step 3: Discover Client Intelligence (Company discovery & background check)
 *    - Step 4: Find the Risks & Your Fit (Red-flag audit & freelancer profile matching)
 *    - Step 5: Price, Position & Apply (Calibrated pricing guidance & verified proposal)
 * 2. Performance & Bundle Optimization:
 *    - Uses `LazyMotion` and `domAnimation` from Framer Motion to avoid bundling unnecessary
 *      features like layout animations or 3D transforms, keeping bundle size minimal.
 * 3. Responsive Layout:
 *    - Desktop: Displays cards staggered in an alternating zigzag pattern connected by
 *      an animated SVG cubic bezier wave (`m.path` with `strokeDashoffset`).
 *    - Mobile: Gracefully collapses into a clean vertical card sequence with touch-friendly spacing.
 */

"use client";

import React from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";

/* =========================================================================
   Type Definitions & Interfaces
   ========================================================================= */

/** Props passed to an individual Step Card */
export interface CardProps {
  number: string;
  title: string;
  description: string;
  colorTheme?: "orange" | "blue" | "purple";
  className?: string;
  rotate?: string;
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

/** Step configuration schema for each pipeline phase */
export interface Step {
  title: string;
  description: string;
  colorTheme?: "orange" | "blue" | "purple";
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

/** Layout positioning and tilt angle for responsive placement */
export interface StepPosition {
  className?: string;
  rotate?: string;
}

/** Overall component configuration props */
export interface HowItWorksProps {
  features?: Step[];
  className?: string;
  stepPositions?: StepPosition[];
}


/* =========================================================================
   Skeuomorphic Pin Graphic
   Renders a tactile pin graphic at the top of each bulletin card.
   ========================================================================= */
const Pin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
  </svg>
);


/* =========================================================================
   Step Card Component
   Renders an individual step with number badge, title, and copy.
   ========================================================================= */
const Card = ({
  number,
  title,
  description,
  colorTheme = "blue",
  className = "",
  rotate = "",
  colors: customColors,
}: CardProps) => {

  // Default color palette presets matching FreelanceOS's clean design system
  const defaultBgColors = {
    orange: "bg-orange-50/80",
    blue: "bg-blue-50/80",
    purple: "bg-purple-50/80",
  };

  const defaultTextColors = {
    orange: "text-orange-500",
    blue: "text-blue-600",
    purple: "text-purple-600",
  };

  const defaultBorderColors = {
    orange: "border-orange-100",
    blue: "border-blue-100",
    purple: "border-purple-100",
  };

  // Resolve active theme colors (custom overrides take priority)
  const bgColor = customColors?.bg || defaultBgColors[colorTheme];
  const textColor = customColors?.text || defaultTextColors[colorTheme];
  const borderColor = customColors?.border || defaultBorderColors[colorTheme];

  return (
    <div
      className={`relative w-full md:w-[290px] transition-transform duration-300 hover:z-30 hover:scale-105 ${rotate} ${className}`}
    >
      <div className="bg-white p-2.5 rounded-[24px] shadow-[0px_10px_25px_-5px_rgba(0,0,0,0.08)] border border-neutral-100/90 hover:shadow-xl transition-shadow">

        {/* Pin Accent */}
        <Pin className={`w-7 h-7 ${textColor} z-20 mb-4 mx-auto`} />

        {/* Card Body */}
        <div
          className={`${bgColor} border ${borderColor} rounded-[16px] p-5 h-full flex flex-col relative overflow-hidden`}
        >
          {/* Step Index Number */}
          <span
            className={`${textColor} text-3xl font-bold tracking-tight mb-3`}
            style={{
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            {number}
          </span>

          {/* Step Headline */}
          <h3 className="text-lg font-semibold text-neutral-800 leading-snug mb-2">
            {title}
          </h3>

          {/* Step Explainer Copy */}
          <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed tracking-normal">
            {description}
          </p>
        </div>

      </div>
    </div>
  );
};


/* =========================================================================
   Default Desktop Coordinates & Rotation Matrix
   Positions 5 cards in a zigzag pattern across the desktop viewport.
   ========================================================================= */
const DEFAULT_CARD_POSITIONS: StepPosition[] = [
  { className: "md:absolute md:top-0 md:left-[15%]", rotate: "rotate-3" },
  { className: "md:absolute md:top-[130px] md:right-[15%]", rotate: "-rotate-3" },
  { className: "md:absolute md:top-[460px] md:left-[15%]", rotate: "rotate-3" },
  { className: "md:absolute md:top-[590px] md:right-[12%]", rotate: "-rotate-3" },
  { className: "md:absolute md:top-[880px] md:left-[15%]", rotate: "rotate-3" },
];


/* =========================================================================
   Main HowItWorks Component
   ========================================================================= */
export default function HowItWorks({
  features,
  className = "",
  stepPositions,
}: HowItWorksProps) {

  // 5 Canonical Stages of the FreelanceOS Intelligence Pipeline
  const defaultFeatures: Step[] = [
    {
      title: "Paste the Opportunity",
      description:
        "Copy a freelance project description, paste a project URL, or upload a screenshot. FreelanceOS turns raw requirements into structured data ready for analysis.",
      colorTheme: "blue",
    },
    {
      title: "Understand the Project",
      description:
        "AI parses the deliverables, core technologies, timeline, budget range, urgency, and true scope so you know exactly what the client is demanding.",
      colorTheme: "purple",
    },
    {
      title: "Discover Client Intelligence",
      description:
        "Surface verified client history, company websites, public social profiles, and credibility signals to verify who you are dealing with before submitting.",
      colorTheme: "orange",
    },
    {
      title: "Find the Risks & Your Fit",
      description:
        "Uncover hidden scope traps, ambiguous clauses, and missing specifications, then cross-reference the project against your verified skills and portfolio.",
      colorTheme: "blue",
    },
    {
      title: "Price, Position & Apply",
      description:
        "Receive calibrated pricing benchmarks, custom value positioning, and an authentic, truth-checked proposal tailored to your actual background.",
      colorTheme: "purple",
    },
  ];

  const data = features && features.length > 0 ? features : defaultFeatures;
  const positions = stepPositions || DEFAULT_CARD_POSITIONS;

  // Compute dynamic container height based on total steps
  let height = 1180;
  if (data.length === 1) height = 400;
  else if (data.length === 2) height = 500;
  else if (data.length === 3) height = 820;
  else if (data.length === 4) height = 980;
  else height = 1180;


  return (
    <section className={`w-full py-16 md:py-24 ${className}`}>

      {/* ── Section Header ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-12 md:mb-16 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          How FreelanceOS Works
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          From a raw freelance project description to a clear, winning decision — understand
          the opportunity, research the client, uncover hidden risks, and apply with confidence.
        </p>
      </div>

      {/* ── Interactive Process Board ── */}
      <LazyMotion features={domAnimation}>
        <div className="bg-white/80 max-md:pt-6 max-md:pb-16 md:py-16 px-4 sm:px-8 relative rounded-3xl max-w-7xl mx-auto shadow-sm border border-neutral-100">

          {/* Background Grid Pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06] rounded-3xl"
            style={{
              backgroundImage: "linear-gradient(#000 1px, transparent 1px)",
              backgroundSize: "100% 32px",
              marginTop: "4px",
            }}
          />

          {/* Left/Right Vignette Fades */}
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r" />
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l" />

          {/* Responsive Card & Path Matrix */}
          <div className="max-w-6xl mx-auto relative z-10">
            <div
              className="relative w-full max-w-[1000px] mx-auto flex flex-col space-y-8 md:space-y-0 md:block h-auto md:h-[var(--md-height)]"
              style={{ "--md-height": `${height}px` } as React.CSSProperties}
            >

              {/* ── Animated SVG Zigzag Bezier Conduit (Desktop only) ── */}
              {data.length > 1 && (
                <svg
                  className="absolute top-0 left-0 w-full h-full pointer-events-none hidden md:block z-0"
                  viewBox={`0 0 1000 ${height}`}
                  preserveAspectRatio="none"
                >
                  {(() => {
                    const pathD = data.reduce((acc, _, index) => {
                      if (index >= data.length - 1) return acc;
                      if (index === 0) return "M 290 150 C 500 150, 550 270, 710 270";
                      if (index === 1) return acc + " C 850 270, 500 360, 290 460";
                      if (index === 2) return acc + " C 290 610, 550 720, 750 720";
                      if (index === 3) return acc + " C 950 720, 500 820, 290 880";
                      return acc;
                    }, "");

                    return (
                      <m.path
                        d={pathD}
                        stroke="currentColor"
                        className="text-neutral-300/80"
                        strokeWidth="2.5"
                        strokeDasharray="8 6"
                        fill="none"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        initial={{ strokeDashoffset: 0 }}
                        animate={{ strokeDashoffset: -140 }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    );
                  })()}
                </svg>
              )}

              {/* ── Step Cards ── */}
              {data.map((step, index) => {
                const position = positions[index % positions.length];

                return (
                  <Card
                    key={step.title}
                    number={`0${index + 1}`}
                    title={step.title}
                    description={step.description}
                    colorTheme={step.colorTheme || "blue"}
                    colors={step.colors}
                    rotate={position.rotate}
                    className={position.className}
                  />
                );
              })}

            </div>
          </div>

        </div>
      </LazyMotion>

    </section>
  );
}
