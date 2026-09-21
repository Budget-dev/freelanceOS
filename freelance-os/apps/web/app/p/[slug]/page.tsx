"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PortfolioPreview, type PortfolioData } from "@/components/portfolio/portfolio-preview";
import { PORTFOLIO_STORAGE_KEY } from "@/components/portfolio/portfolio-builder";

const FALLBACK_PORTFOLIO: PortfolioData = {
  slug: "alex-rivera",
  isPublished: true,
  publishedAt: "2026-09-21",
  personal: {
    fullName: "Alex Rivera",
    title: "Senior Full-Stack & AI Systems Engineer",
    avatarInitials: "AR",
    location: "London, United Kingdom",
    availability: "Available for Projects",
    hourlyRate: "95",
  },
  about: {
    bio: "Senior Software Engineer with 7+ years of experience architecting AI-powered SaaS platforms, full-stack web applications, and real-time data pipelines.\n\nI specialize in helping international startups turn complex technical requirements into high-conversion digital products with clean architectures and 99.9% uptime.",
    yearsOfExperience: "7+",
    highlights: [
      "7+ Years Full-Stack Experience",
      "Specialized in Next.js & Python AI",
      "99.9% Uptime Production Track Record",
    ],
  },
  experience: [
    {
      id: "exp-1",
      company: "HealthSphere AI",
      role: "Lead Full-Stack AI Engineer",
      period: "2023 – Present",
      description: "Architected real-time diagnostic triage assistant using Next.js, Python FastAPI, and OpenAI. Scaled platform to 50k+ monthly consultations with sub-second response times.",
    },
    {
      id: "exp-2",
      company: "FinFlow Technologies (London, UK)",
      role: "Senior Frontend Engineer",
      period: "2021 – 2023",
      description: "Designed core financial ledger interface and multi-currency exchange dashboard. Reduced page load times by 45% using Next.js server components.",
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.S. in Computer Science",
      school: "University College London (UCL)",
      year: "2019",
    },
  ],
  skills: [
    {
      category: "Frontend & Web",
      items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"],
    },
    {
      category: "Backend & Systems",
      items: ["Python", "FastAPI", "Node.js", "PostgreSQL", "Redis"],
    },
  ],
  projects: [
    {
      id: "p-1",
      title: "HealthSphere AI Diagnostic Assistant",
      category: "AI & Machine Learning",
      description: "Automated medical diagnostic triage platform built with Next.js, Python FastAPI, OpenAI API, and HIPAA-compliant data pipelines.",
      technologies: ["Next.js", "Python", "OpenAI", "PostgreSQL"],
      liveUrl: "https://healthsphere-demo.dev",
      repoUrl: "https://github.com/example/healthsphere-ai",
      featured: true,
    },
    {
      id: "p-2",
      title: "FinFlow Treasury & Currency Exchange",
      category: "Web Applications",
      description: "High-throughput financial ledger for cross-border freelancing agencies supporting instant multi-currency payouts.",
      technologies: ["React", "TypeScript", "Node.js", "Stripe API"],
      liveUrl: "https://finflow-ledger.dev",
      repoUrl: "https://github.com/example/finflow-treasury",
      featured: true,
    },
  ],
  contact: {
    email: "alex.rivera@example.com",
    phone: "+44 7911 123456",
    whatsapp: "+44 7911 123456",
    linkedin: "https://linkedin.com/in/alex-rivera-dev",
    github: "https://github.com/alexrivera",
    website: "https://alexrivera.dev",
    twitter: "https://x.com/alexrivera_dev",
  },
};

export default function PublicPortfolioPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [data, setData] = useState<PortfolioData>(FALLBACK_PORTFOLIO);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
      if (saved) {
        const parsed: PortfolioData = JSON.parse(saved);
        setData(parsed);
      } else if (slug) {
        setData((prev) => ({ ...prev, slug }));
      }
    } catch {
      // fallback
    }
    setIsLoaded(true);
  }, [slug]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="size-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
      </div>
    );
  }

  return <PortfolioPreview data={data} standalone={true} />;
}
