"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
} from "lucide-react";
import { BillingStorage, type BillingInfo } from "@/lib/storage";

export default function SettingsBillingPage() {
  const [billing, setBilling] = useState<BillingInfo>(BillingStorage.get());

  useEffect(() => {
    setBilling(BillingStorage.get());
  }, []);

  const analysesPct = Math.min(
    100,
    Math.round((billing.analysesUsed / (billing.analysesLimit || 1)) * 100)
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-xl font-bold tracking-tight text-slate-900">
          Billing & Subscription Quotas
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor your opportunity audit usage, review plan allowances, and manage invoices.
        </p>
      </div>

      {/* ── 1. Current Plan & Usage Quota Card ── */}
      <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900">
                  Early Access Plan
                </span>
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 text-[11px] font-bold">
                  All Features Included
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Full client intelligence, forensic project auditing, and unlimited brief analyses are active on your account during this preview period.
              </p>
            </div>
          </div>

          {/* Usage Progress Meters */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Monthly Usage Telemetry
            </h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700">Project Brief Analyses</span>
                <span className="text-slate-900">
                  {billing.analysesUsed} audits completed
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `100%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Unlimited project analyses and client background checks enabled.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Payment Method Card ── */}
      <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl">
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-slate-700" />
            <h4 className="text-sm font-bold text-slate-900">Payment Details</h4>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-12 rounded-md bg-white border border-slate-200 flex items-center justify-center font-black text-slate-800 text-[11px]">
                FREE
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  No Payment Method Required
                </p>
                <p className="text-slate-500 text-[11px]">
                  All intelligence features are enabled with no subscription fees or payment cards required.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Billing & Invoices Log ── */}
      <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl">
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-700" />
            <h4 className="text-sm font-bold text-slate-900">Billing History</h4>
          </div>

          <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
            <div className="p-4 text-center text-slate-500">
              <Clock className="h-6 w-6 text-slate-300 mx-auto mb-1" />
              <p className="font-medium text-slate-700">No past charges recorded</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Invoices and receipt PDFs will be generated here when your paid subscription activates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
