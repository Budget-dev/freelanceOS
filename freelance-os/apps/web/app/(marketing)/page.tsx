"use client";

import { Hero5 } from "@/components/layout/Hero5";
import HowItWorks from "@/components/ui/how-it-works";
import JobSlider from "@/components/ui/job-slider";

export default function Home() {
  return (
    <main className="h-full w-full">
      <Hero5 />
      <HowItWorks />
      <JobSlider />
    </main>
  );
}
