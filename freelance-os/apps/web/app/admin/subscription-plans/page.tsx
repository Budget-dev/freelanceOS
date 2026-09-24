/**
 * @file apps/web/app/admin/subscription-plans/page.tsx
 * @description System Subscription Plans Definition & Management
 *
 * Allows Super Administrators to configure subscription tiers:
 * - Starter, Pro, Agency, Lifetime
 * - Pricing, duration, feature limits, and status
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/api/admin-client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import {
  Layers,
  Plus,
  CheckCircle,
  XCircle,
  Edit2,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export default function AdminSubscriptionPlansPage() {
  const { permissions } = useAdminAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [planId, setPlanId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [durationDays, setDurationDays] = useState(30);
  const [active, setActive] = useState(true);
  const [analysesPerMonth, setAnalysesPerMonth] = useState(10);
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/api/admin/plans");
      setPlans(res.plans || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setPlanId("");
    setName("");
    setDescription("");
    setPrice(29);
    setDurationDays(30);
    setActive(true);
    setAnalysesPerMonth(100);
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingPlan(p);
    setPlanId(p.id);
    setName(p.name);
    setDescription(p.description || "");
    setPrice(p.price || 0);
    setDurationDays(p.durationDays ?? 30);
    setActive(p.active !== false);
    setAnalysesPerMonth(p.featureLimits?.analysesPerMonth ?? 10);
    setIsModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions?.canManagePlans) {
      alert("Only Super Administrators can create or modify subscription plans.");
      return;
    }

    try {
      setSaving(true);
      await adminFetch("/api/admin/plans", {
        method: "POST",
        body: JSON.stringify({
          id: planId,
          name,
          description,
          price,
          durationDays,
          active,
          featureLimits: {
            analysesPerMonth,
          },
        }),
      });

      setIsModalOpen(false);
      fetchPlans();
    } catch (err: any) {
      alert(err.message || "Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/subscriptions"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Subscriptions
            </Link>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Subscription Plans
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure system subscription tiers, duration limits, and quotas
          </p>
        </div>

        <div className="flex items-center gap-2">
          {permissions?.canManagePlans && (
            <Button size="sm" onClick={openCreateModal} className="h-8 gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Create Plan
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPlans}
            disabled={loading}
            className="h-8 gap-1 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => {
          const isLifetime = p.id === "lifetime" || p.durationDays === null;

          return (
            <div
              key={p.id}
              className="flex flex-col justify-between rounded-xl border border-border/70 bg-card p-5 shadow-2xs transition-all hover:border-border"
            >
              <div>
                <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">{p.id}</span>
                  {p.active !== false ? (
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  ) : (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground border border-border/60">
                      Disabled
                    </span>
                  )}
                </div>

                <h3 className="mt-3 text-base font-bold text-foreground">{p.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.description}</p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-foreground">${p.price}</span>
                  <span className="text-xs text-muted-foreground">
                    {isLifetime ? "one-time grant" : `/ ${p.durationDays ?? 30} days`}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 border-t border-border/40 pt-3 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Analyses / Mo</span>
                    <strong className="text-foreground">
                      {p.featureLimits?.analysesPerMonth ? p.featureLimits.analysesPerMonth.toLocaleString() : "Unlimited"}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Duration</span>
                    <strong className="text-foreground">
                      {isLifetime ? "Lifetime" : `${p.durationDays} Days`}
                    </strong>
                  </div>
                </div>
              </div>

              {permissions?.canManagePlans && (
                <div className="mt-5 border-t border-border/40 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(p)}
                    className="w-full h-8 text-xs font-medium gap-1.5"
                  >
                    <Edit2 className="h-3 w-3" /> Edit Tier
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Plan Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground">
                {editingPlan ? "Edit Subscription Plan" : "Create Subscription Plan"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-foreground block mb-1">Plan Identifier (ID)</label>
                <input
                  type="text"
                  required
                  disabled={!!editingPlan}
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  placeholder="e.g. enterprise"
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground disabled:opacity-60 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Plan Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Enterprise Team"
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Plan features and limits summary"
                  className="w-full rounded-md border border-border bg-background p-2 text-xs text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-foreground block mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground"
                  />
                </div>

                <div>
                  <label className="font-medium text-foreground block mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Analyses Quota / Month</label>
                <input
                  type="number"
                  value={analysesPerMonth}
                  onChange={(e) => setAnalysesPerMonth(parseInt(e.target.value, 10) || 10)}
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded border-border text-primary"
                />
                <label htmlFor="activeCheck" className="text-xs text-foreground font-medium">
                  Plan is active for administrative assignment
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="flex-1 text-xs font-semibold"
                >
                  {saving ? "Saving..." : "Save Plan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
