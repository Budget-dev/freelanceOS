"use client";

import { useState } from "react";
import {
  Globe, Mail, Phone, MapPin, Clock, DollarSign,
  Linkedin, Github, ExternalLink, Briefcase, GraduationCap,
  Sparkles, CheckCircle2, ArrowUpRight, Share2, Layers,
  Laptop, Tablet, Smartphone
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface PortfolioData {
  slug: string;
  isPublished: boolean;
  publishedAt?: string;
  personal: {
    fullName: string;
    title: string;
    avatarInitials: string;
    location: string;
    availability: string;
    hourlyRate: string;
  };
  about: {
    bio: string;
    yearsOfExperience: string;
    highlights: string[];
  };
  experience: {
    id: string;
    company: string;
    role: string;
    period: string;
    description: string;
  }[];
  education: {
    id: string;
    degree: string;
    school: string;
    year: string;
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  projects: {
    id: string;
    title: string;
    category: string;
    description: string;
    technologies: string[];
    liveUrl?: string;
    repoUrl?: string;
    featured?: boolean;
  }[];
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    linkedin: string;
    github: string;
    website: string;
    twitter: string;
  };
}

export function PortfolioPreview({
  data,
  standalone = false,
  device = "desktop",
  onOpenLivePreview,
}: {
  data: PortfolioData;
  standalone?: boolean;
  device?: "desktop" | "tablet" | "mobile";
  onOpenLivePreview?: (url: string) => void;
}) {
  const { personal, about, experience, education, skills, projects, contact } = data;

  const initials =
    personal.avatarInitials ||
    personal.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    "ME";

  return (
    <div
      className={cn(
        "bg-white text-slate-900 selection:bg-slate-900 selection:text-white transition-all",
        standalone ? "min-h-screen" : "h-full overflow-y-auto no-scrollbar"
      )}
    >
      {/* ── Public Website Navigation ── */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-white/90 backdrop-blur px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            {initials}
          </div>
          <span className="font-bold text-sm tracking-tight text-foreground">
            {personal.fullName || "Portfolio Preview"}
          </span>
        </div>

        <nav className="hidden sm:flex items-center gap-5 text-xs font-medium text-slate-600">
          <a href="#about" className="hover:text-foreground transition-colors">About</a>
          <a href="#projects" className="hover:text-foreground transition-colors">Projects</a>
          <a href="#experience" className="hover:text-foreground transition-colors">Experience</a>
          <a href="#skills" className="hover:text-foreground transition-colors">Skills</a>
          <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
        </nav>

        <div className="flex items-center gap-2">
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-2xs hover:bg-slate-800 transition-colors"
            >
              <Mail className="h-3 w-3" />
              <span>Get in Touch</span>
            </a>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10 space-y-16">
        {/* ── 1. Hero Section ── */}
        <section className="space-y-5 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-20 sm:size-24 border-2 border-slate-200 shadow-md">
                <AvatarFallback className="bg-slate-900 text-white font-bold text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    {personal.fullName || "Your Name"}
                  </h1>
                  {personal.availability && (
                    <Badge variant="completed" className="text-[10px] h-5 gap-1 font-normal">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {personal.availability}
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  {personal.title || "Your Professional Title"}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
                  {personal.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {personal.location}
                    </span>
                  )}
                  {personal.hourlyRate && (
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <DollarSign className="h-3 w-3" />
                      ${personal.hourlyRate}/hr
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick social links */}
            <div className="flex items-center gap-1.5 sm:self-start pt-1">
              {contact.linkedin && (
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-border/60 hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {contact.github && (
                <a
                  href={contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-border/60 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
                  title="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {contact.website && (
                <a
                  href={contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-border/60 hover:bg-slate-50 text-slate-600 hover:text-emerald-600 transition-colors"
                  title="Website"
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ── 2. About Me Section ── */}
        <section id="about" className="space-y-3.5 scroll-mt-20">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            About & Value Proposition
          </h2>
          <div className="rounded-2xl border border-border/60 bg-slate-50/50 p-6 space-y-4 shadow-2xs">
            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {about.bio || "Write a compelling summary of your experience and what you help clients achieve."}
            </p>

            {about.highlights && about.highlights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/40">
                {about.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs font-medium text-slate-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── 3. Featured Projects Showcase ── */}
        <section id="projects" className="space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 text-slate-700" />
              Featured Projects ({projects.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className={cn(
                  "group flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 hover:shadow-md",
                  proj.featured
                    ? "border-slate-300 bg-gradient-to-br from-slate-50/70 via-white to-white"
                    : "border-border/60 bg-white"
                )}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] h-4.5 bg-slate-50">
                      {proj.category}
                    </Badge>
                    {proj.featured && (
                      <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] h-4.5 font-normal">
                        ★ Featured
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-foreground leading-snug tracking-tight">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {proj.description}
                  </p>
                </div>

                <div className="space-y-3 pt-4 mt-2 border-t border-border/40">
                  {/* Tech stack tags */}
                  <div className="flex flex-wrap gap-1">
                    {proj.technologies.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="text-[10px] h-4.5 font-normal bg-slate-100 text-slate-700"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Live Site</span>
                        </a>
                      )}

                      {proj.repoUrl && (
                        <a
                          href={proj.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                        >
                          <Github className="h-3 w-3" />
                          <span>Code</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. Work Experience Timeline ── */}
        {experience && experience.length > 0 && (
          <section id="experience" className="space-y-4 scroll-mt-20">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-slate-700" />
              Work Experience
            </h2>

            <div className="relative border-l-2 border-slate-200 pl-4 sm:pl-6 space-y-6 ml-2">
              {experience.map((exp) => (
                <div key={exp.id} className="relative space-y-1.5">
                  {/* Dot */}
                  <div className="absolute -left-[23px] sm:-left-[31px] top-1.5 size-3 rounded-full border-2 border-white bg-slate-900 shadow-xs" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="text-sm font-bold text-foreground">
                      {exp.role} <span className="font-normal text-muted-foreground">at</span> {exp.company}
                    </h3>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 5. Skills Matrix ── */}
        {skills && skills.length > 0 && (
          <section id="skills" className="space-y-4 scroll-mt-20">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Skills & Core Technologies
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {skills.map((cat, idx) => (
                <div key={idx} className="rounded-xl border border-border/60 bg-slate-50/50 p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    {cat.category}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map((item) => (
                      <Badge
                        key={item}
                        variant="secondary"
                        className="text-xs font-medium py-1 px-2.5 bg-white border border-border/40 text-slate-800"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 6. Education & Certifications ── */}
        {education && education.length > 0 && (
          <section id="education" className="space-y-4 scroll-mt-20">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <GraduationCap className="h-3.5 w-3.5 text-slate-700" />
              Education & Certifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {education.map((edu) => (
                <div key={edu.id} className="rounded-xl border border-border/60 bg-white p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground">{edu.degree}</h4>
                    <span className="text-[10.5px] text-muted-foreground font-mono">{edu.year}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{edu.school}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 7. Contact / Hire Section ── */}
        <section id="contact" className="space-y-4 scroll-mt-20 pt-4 border-t border-border/60">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 sm:p-8 space-y-5 shadow-lg">
            <div className="space-y-1.5 max-w-xl">
              <h2 className="text-xl font-bold tracking-tight">
                Let&apos;s build something exceptional together.
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Available for contract projects, architecture consulting, and full-stack execution. Direct inquiries typically answered within 2 hours.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 hover:bg-slate-100 transition-colors shadow-sm"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email: {contact.email}</span>
                </a>
              )}

              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>{contact.phone}</span>
                </a>
              )}

              {contact.linkedin && (
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
                >
                  <Linkedin className="h-3.5 w-3.5" />
                  <span>LinkedIn Profile</span>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="pt-6 pb-8 border-t border-border/40 text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {personal.fullName}. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground/70">
            <span>Published with</span>
            <span className="font-semibold text-foreground">FreelanceOS Portfolio Studio</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
