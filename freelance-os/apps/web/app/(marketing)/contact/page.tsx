"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  MessageSquare,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Support");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    // Simulate real dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setCategory("Support");
    setSubject("");
    setMessage("");
    setIsSubmitted(false);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* ── 1. Hero Section ── */}
      <section className="w-full py-14 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto text-center space-y-4">
        <Badge variant="outline" className="px-3.5 py-1 text-xs font-semibold rounded-full border-border/80 bg-slate-50 gap-1.5 shadow-2xs">
          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
          <span>We&apos;re Here to Help</span>
        </Badge>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          Get in touch with the <span className="text-blue-600">FreelanceOS team</span>
        </h1>

        <p className="text-sm sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
          Have questions about opportunity analysis, need enterprise onboarding, or found a bug? We respond to every inquiry within 24 hours.
        </p>
      </section>

      {/* ── 2. Content Grid: Direct Channels + Contact Form ── */}
      <section className="w-full px-4 sm:px-6 max-w-5xl mx-auto pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left Column: Direct Support Channels */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-slate-200/80 bg-white shadow-xs rounded-2xl">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Direct Email</h3>
                    <p className="text-xs text-slate-500">support@freelanceos.dev</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Response SLA</h3>
                    <p className="text-xs text-slate-500">&lt; 24 hours (Monday – Friday)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Privacy First</h3>
                    <p className="text-xs text-slate-500">Your brief and email are never shared</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Link to Knowledge Base */}
            <div className="p-6 rounded-2xl border border-stone-200/70 bg-white shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                <span>Looking for quick answers?</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Check our Help Center for instant answers on parsing briefs, customizing proposal models, and managing billing.
              </p>
              <Link href="/help">
                <Button variant="outline" size="sm" className="rounded-lg text-xs font-semibold gap-1.5 w-full mt-1">
                  Visit Help Center
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Working Contact Form */}
          <div className="lg:col-span-3">
            <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-7 sm:p-9">
                {isSubmitted ? (
                  <div className="py-12 flex flex-col items-center text-center space-y-4">
                    <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Message Received</h3>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-sm leading-relaxed">
                      Thank you for reaching out, <span className="font-semibold text-slate-800">{name}</span>. Our team will review your inquiry and reply to <span className="font-semibold text-slate-800">{email}</span> within 24 hours.
                    </p>
                    <Button onClick={handleReset} variant="outline" size="sm" className="mt-4 rounded-lg text-xs font-semibold">
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-800">
                          Your Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Alex Morgan"
                          className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs sm:text-sm text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-800">
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alex@example.com"
                          className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs sm:text-sm text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-800">
                          Inquiry Category
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs sm:text-sm text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                        >
                          <option value="Support">Product Support & Help</option>
                          <option value="Enterprise">Studio & Agency Plan</option>
                          <option value="Bug">Report a Bug / Issue</option>
                          <option value="Feedback">Feature Request</option>
                          <option value="Billing">Billing & Subscription</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-800">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="e.g. Question about client reputation audits"
                          className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs sm:text-sm text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-800">
                        Message <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us what you need help with..."
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs sm:text-sm text-slate-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2"
                    >
                      {isSubmitting ? (
                        <span>Sending message...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
