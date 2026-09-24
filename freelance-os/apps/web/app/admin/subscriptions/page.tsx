/**
 * @file apps/web/app/admin/subscriptions/page.tsx
 * @description Platform Subscriptions Management & Portfolio Tracking Page
 *
 * Provides full administrative oversight of user tiers, expirations, and lifetime grants.
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/api/admin-client";
import { StatCard } from "@/components/admin/StatCard";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  Layers,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function AdminSubscriptionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        status: statusFilter,
        plan: planFilter,
      });

      const res = await adminFetch(`/api/admin/subscriptions?${query.toString()}`);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, planFilter]);

  const summary = data?.summary || {};
  const planCounts = data?.planCounts || {};
  let subscriptions: any[] = data?.subscriptions || [];

  if (search) {
    subscriptions = subscriptions.filter(
      (s) =>
        s.userName.toLowerCase().includes(search.toLowerCase()) ||
        s.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        s.uid.toLowerCase().includes(search.toLowerCase())
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Subscription Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Administrative plan tiering, lifetime accounts, and expiration tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/subscription-plans"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors h-8"
          >
            <Layers className="h-3.5 w-3.5" /> Manage System Plans
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSubscriptions}
            disabled={loading}
            className="h-8 gap-1 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
        <StatCard
          title="Active Subscriptions"
          value={loading ? "..." : (summary.active ?? 0)}
          icon={CheckCircle}
          badgeColor="bg-emerald-100 text-emerald-700 border-emerald-200"
        />
        <StatCard
          title="Expiring Soon (7d)"
          value={loading ? "..." : (summary.expiringSoon ?? 0)}
          icon={AlertTriangle}
          badgeColor={summary.expiringSoon > 0 ? "bg-amber-100 text-amber-700 border-amber-200" : undefined}
        />
        <StatCard
          title="Lifetime Grants"
          value={loading ? "..." : (summary.lifetime ?? 0)}
          icon={Sparkles}
          badgeColor="bg-purple-100 text-purple-700 border-purple-200"
        />
        <StatCard
          title="Expired Tiers"
          value={loading ? "..." : (summary.expired ?? 0)}
          icon={XCircle}
        />
        <StatCard
          title="Total Accounts"
          value={loading ? "..." : (summary.total ?? 0)}
          icon={CreditCard}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border/80 bg-background pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter Status:</span>
          </div>

          {["all", "active", "lifetime", "expired", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                statusFilter === st
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {st}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-muted-foreground">Plan:</span>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="rounded-md border border-border/80 bg-background px-2 py-1 text-xs text-foreground"
            >
              <option value="all">All Plans</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="agency">Agency</option>
              <option value="lifetime">Lifetime</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-xl border border-border/70 bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-3">Plan</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Assigned Date</th>
                <th className="py-3 px-3">Expiration</th>
                <th className="py-3 px-3">Assigned By</th>
                <th className="py-3 px-3">Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading && subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    Loading subscription roster...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No subscriptions matching criteria found.
                  </td>
                </tr>
              ) : (
                subscriptions.map((s: any) => {
                  const statusColors: Record<string, string> = {
                    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    lifetime: "bg-purple-50 text-purple-700 border-purple-200 font-bold",
                    expired: "bg-rose-50 text-rose-700 border-rose-200",
                    cancelled: "bg-slate-100 text-slate-700 border-slate-200",
                  };

                  return (
                    <tr key={s.uid} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/users/${s.uid}`}
                          className="font-semibold text-primary hover:underline block"
                        >
                          {s.userName}
                        </Link>
                        <span className="text-[11px] text-muted-foreground block truncate max-w-[150px]">
                          {s.userEmail}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-semibold text-foreground">{s.planName}</td>

                      <td className="py-3 px-3">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] border capitalize ${
                          statusColors[s.status] || "bg-muted text-muted-foreground"
                        }`}>
                          {s.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-muted-foreground text-[11px]">
                        {s.startedAt ? new Date(s.startedAt).toLocaleDateString() : "—"}
                      </td>

                      <td className="py-3 px-3 font-medium text-foreground text-[11px]">
                        {s.status === "lifetime"
                          ? "Never (Lifetime)"
                          : s.expiresAt
                          ? new Date(s.expiresAt).toLocaleDateString()
                          : "Free Plan"}
                      </td>

                      <td className="py-3 px-3 text-muted-foreground text-[11px] truncate max-w-[120px]">
                        {s.assignedBy}
                      </td>

                      <td className="py-3 px-3 text-muted-foreground text-[11px] truncate max-w-[160px]">
                        {s.notes || "—"}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/users/${s.uid}`}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
