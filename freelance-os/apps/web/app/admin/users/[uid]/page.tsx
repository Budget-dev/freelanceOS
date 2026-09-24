/**
 * @file apps/web/app/admin/users/[uid]/page.tsx
 * @description Comprehensive Operational User Details & Administrative Actions Inspector
 *
 * Exposes account data, freelance pipeline metrics, BYOK connectivity, and
 * allows administrative subscription modifications and account suspensions.
 * Strictly guarantees ZERO raw AI key exposure.
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { adminFetch } from "@/lib/api/admin-client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Shield,
  CreditCard,
  FolderKanban,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  Check,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uid = params.uid as string;
  const { permissions } = useAdminAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Subscription editor state
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [durationDays, setDurationDays] = useState(30);
  const [subNotes, setSubNotes] = useState("");

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const res = await adminFetch(`/api/admin/users/${uid}`);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uid) fetchUserDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const handleAccountAction = async (action: "suspend" | "restore") => {
    if (!permissions?.canSuspendUsers) return;
    const confirmPrompt =
      action === "suspend"
        ? "Suspend this user? They will immediately lose access to the application."
        : "Restore this user account to active status?";

    if (!window.confirm(confirmPrompt)) return;

    try {
      setActionLoading(true);
      await adminFetch(`/api/admin/users/${uid}/${action}`, {
        method: "POST",
        body: JSON.stringify({ reason: `Administrative ${action} from user detail inspector` }),
      });
      fetchUserDetails();
    } catch (err: any) {
      alert(err.message || `Failed to ${action} user`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubscriptionAction = async (
    action: "assign" | "extend" | "cancel" | "restore" | "lifetime",
    payload?: any
  ) => {
    if (!permissions?.canManageSubscriptions) return;

    try {
      setActionLoading(true);
      await adminFetch(`/api/admin/users/${uid}/subscription`, {
        method: "POST",
        body: JSON.stringify({
          action,
          ...payload,
        }),
      });
      setIsSubModalOpen(false);
      fetchUserDetails();
    } catch (err: any) {
      alert(err.message || "Failed to update subscription");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center">
        <p className="text-sm font-semibold text-destructive">{error || "User not found"}</p>
        <Link
          href="/admin/users"
          className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors mt-4"
        >
          Return to User Directory
        </Link>
      </div>
    );
  }

  const { account, profile, subscription, performance, aiTelemetry, activityTimeline } = data;
  const isSuspended = account.status === "suspended";

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors h-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Users
          </Link>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl flex items-center gap-2">
              <span>{account.name}</span>
              {isSuspended ? (
                <span className="rounded bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 text-[10px] font-bold">
                  Suspended
                </span>
              ) : (
                <span className="rounded bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                  Active Account
                </span>
              )}
            </h2>
            <p className="text-xs text-muted-foreground font-mono">{account.email} • UID: {account.uid}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {permissions?.canSuspendUsers && (
            <Button
              variant="outline"
              size="sm"
              disabled={actionLoading}
              onClick={() => handleAccountAction(isSuspended ? "restore" : "suspend")}
              className={`h-8 text-xs font-semibold ${
                isSuspended
                  ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  : "border-rose-300 text-rose-700 hover:bg-rose-50"
              }`}
            >
              {isSuspended ? "Restore Account" : "Suspend Account"}
            </Button>
          )}

          {permissions?.canManageSubscriptions && (
            <Button
              size="sm"
              onClick={() => setIsSubModalOpen(true)}
              className="h-8 text-xs font-medium"
            >
              <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Manage Subscription
            </Button>
          )}
        </div>
      </div>

      {/* Grid: Account & Profile Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Account Details */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2.5">
            <User className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Account Information</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground text-[11px]">Display Name</p>
              <p className="font-semibold text-foreground">{account.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px]">Email Address</p>
              <p className="font-semibold text-foreground truncate">{account.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px]">Registered</p>
              <p className="font-semibold text-foreground">
                {account.createdAt ? new Date(account.createdAt).toLocaleDateString() : "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px]">Last Login</p>
              <p className="font-semibold text-foreground">
                {account.lastLoginAt ? new Date(account.lastLoginAt).toLocaleString() : "Never"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px]">Last Active Heartbeat</p>
              <p className="font-semibold text-foreground">
                {account.lastSeenAt ? new Date(account.lastSeenAt).toLocaleString() : "Never"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px]">System Role</p>
              <p className="font-semibold text-foreground uppercase">{account.role || "User"}</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2.5">
            <Shield className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Freelance Profile</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground text-[11px]">Job Title</p>
              <p className="font-semibold text-foreground">{profile.jobTitle || "Not specified"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px]">Hourly Rate</p>
              <p className="font-semibold text-foreground">{profile.hourlyRate ? `$${profile.hourlyRate}/hr` : "Not set"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px]">Location</p>
              <p className="font-semibold text-foreground">
                {profile.city ? `${profile.city}, ` : ""}{profile.country || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px]">Skills Configured</p>
              <p className="font-semibold text-foreground">
                {profile.skills?.length ? `${profile.skills.length} skills listed` : "None"}
              </p>
            </div>
          </div>

          {profile.skills?.length > 0 && (
            <div className="pt-1">
              <p className="text-[11px] text-muted-foreground mb-1.5">Top Skills</p>
              <div className="flex flex-wrap gap-1">
                {profile.skills.slice(0, 8).map((s: string, idx: number) => (
                  <span key={idx} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-foreground border border-border/60">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Subscription & AI Telemetry */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Subscription Card */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Current Subscription</h3>
            </div>
            <span className="rounded bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold uppercase">
              {subscription.status || "active"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground text-[11px]">Plan</p>
              <p className="text-sm font-bold text-foreground">{subscription.planName || "Starter Plan"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px]">Billing Mode</p>
              <p className="font-semibold text-foreground capitalize">{subscription.billingType || "Manual"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px]">Assigned Date</p>
              <p className="font-semibold text-foreground">
                {subscription.assignedAt ? new Date(subscription.assignedAt).toLocaleDateString() : "System Default"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px]">Expiration Date</p>
              <p className="font-semibold text-foreground">
                {subscription.status === "lifetime"
                  ? "Lifetime (Never Expires)"
                  : subscription.expiresAt
                  ? new Date(subscription.expiresAt).toLocaleDateString()
                  : "No Expiration (Free)"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground text-[11px]">Admin Notes</p>
              <p className="text-xs text-foreground bg-muted/30 rounded p-1.5 border border-border/40 mt-0.5">
                {subscription.notes || "No administrative notes recorded."}
              </p>
            </div>
          </div>
        </div>

        {/* AI / BYOK Telemetry (NO RAW KEYS) */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">AI / BYOK Telemetry</h3>
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground">Keys Encrypted / Hidden</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/40">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Google Gemini API</span>
                <span className="text-[10px] text-muted-foreground">Default Engine</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                aiTelemetry.geminiConfigured
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-muted text-muted-foreground border-border/60"
              }`}>
                {aiTelemetry.geminiConfigured ? "Connected (BYOK)" : "Not Configured"}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/40">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">OpenAI GPT-4o</span>
                <span className="text-[10px] text-muted-foreground">BYOK Key</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                aiTelemetry.openaiConfigured
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-muted text-muted-foreground border-border/60"
              }`}>
                {aiTelemetry.openaiConfigured ? "Connected (BYOK)" : "Not Configured"}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/40">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Anthropic Claude</span>
                <span className="text-[10px] text-muted-foreground">Claude 3.5</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                aiTelemetry.anthropicConfigured
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-muted text-muted-foreground border-border/60"
              }`}>
                {aiTelemetry.anthropicConfigured ? "Connected (BYOK)" : "Not Configured"}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
              <span>Selected Model: <strong className="text-foreground">{aiTelemetry.selectedModel}</strong></span>
              <span>Telemetry Count: <strong className="text-foreground">{aiTelemetry.aiUsageCount} completed</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Performance Pipeline */}
      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Project Performance ({performance.totalProjects} tracked)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">
              Pipeline: <strong className="text-foreground">${performance.totalPipelineValue.toLocaleString()}</strong>
            </span>
            <span className="text-muted-foreground">
              Win Rate: <strong className="text-emerald-600">{performance.conversionRate}%</strong>
            </span>
          </div>
        </div>

        {/* Stage Pills */}
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          <div className="rounded-lg bg-muted/40 p-2 border border-border/40">
            <p className="text-[10px] text-muted-foreground">New</p>
            <p className="text-sm font-bold text-foreground">{performance.stages?.new || 0}</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-2 border border-blue-200 text-blue-700">
            <p className="text-[10px]">Applied</p>
            <p className="text-sm font-bold">{performance.stages?.applied || 0}</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-2 border border-amber-200 text-amber-700">
            <p className="text-[10px]">Replied</p>
            <p className="text-sm font-bold">{performance.stages?.client_replied || 0}</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-2 border border-emerald-200 text-emerald-700">
            <p className="text-[10px]">Hired</p>
            <p className="text-sm font-bold">{performance.stages?.hired || 0}</p>
          </div>
          <div className="rounded-lg bg-rose-50 p-2 border border-rose-200 text-rose-700">
            <p className="text-[10px]">Rejected</p>
            <p className="text-sm font-bold">{performance.stages?.rejected || 0}</p>
          </div>
        </div>

        {/* Recent Projects Table */}
        {performance.recentProjects?.length > 0 && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/30 text-muted-foreground font-semibold border-b border-border/40">
                <tr>
                  <th className="py-2 px-3">Project Title</th>
                  <th className="py-2 px-3">Client</th>
                  <th className="py-2 px-3">Stage</th>
                  <th className="py-2 px-3">Value</th>
                  <th className="py-2 px-3">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {performance.recentProjects.map((p: any) => (
                  <tr key={p.id}>
                    <td className="py-2 px-3 font-medium text-foreground">{p.projectTitle}</td>
                    <td className="py-2 px-3 text-muted-foreground">{p.clientName}</td>
                    <td className="py-2 px-3">
                      <span className="capitalize px-1.5 py-0.5 rounded text-[10px] font-semibold bg-muted">
                        {p.stage.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-semibold text-foreground">{p.value || "$0"}</td>
                    <td className="py-2 px-3 text-muted-foreground">{p.matchScore || 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 border-b border-border/50 pb-2.5">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Recent Activity Logs</h3>
        </div>

        {activityTimeline?.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No recent project activity logged.</p>
        ) : (
          <div className="space-y-2 text-xs">
            {activityTimeline.map((act: any) => (
              <div key={act.id} className="flex items-start gap-3 rounded-lg border border-border/30 p-2.5 bg-muted/10">
                <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{act.projectTitle}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {act.timestamp ? new Date(act.timestamp).toLocaleString() : ""}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px] mt-0.5">{act.note}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscription Edit Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground">Manage User Subscription</h3>
              <button
                onClick={() => setIsSubModalOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-foreground block mb-1">Select Plan</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground"
                >
                  <option value="starter">Starter Plan (Free)</option>
                  <option value="pro">Professional Plan ($29/mo)</option>
                  <option value="agency">Agency / Team Plan ($79/mo)</option>
                  <option value="lifetime">Founder Lifetime Access</option>
                </select>
              </div>

              {selectedPlan !== "lifetime" && (
                <div>
                  <label className="font-medium text-foreground block mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value, 10) || 30)}
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground"
                  />
                </div>
              )}

              <div>
                <label className="font-medium text-foreground block mb-1">Admin Note / Reason</label>
                <textarea
                  rows={2}
                  value={subNotes}
                  onChange={(e) => setSubNotes(e.target.value)}
                  placeholder="e.g. Granted trial extension or VIP upgrade"
                  className="w-full rounded-md border border-border bg-background p-2 text-xs text-foreground"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-border/60">
                <Button
                  size="sm"
                  disabled={actionLoading}
                  onClick={() =>
                    handleSubscriptionAction(
                      selectedPlan === "lifetime" ? "lifetime" : "assign",
                      {
                        planId: selectedPlan,
                        durationDays: selectedPlan === "lifetime" ? null : durationDays,
                        notes: subNotes,
                      }
                    )
                  }
                  className="w-full text-xs font-semibold"
                >
                  Save Plan Assignment
                </Button>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleSubscriptionAction("extend", { days: 30, notes: subNotes })}
                    className="text-xs"
                  >
                    +30 Days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleSubscriptionAction("extend", { days: 90, notes: subNotes })}
                    className="text-xs"
                  >
                    +90 Days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleSubscriptionAction("extend", { days: 365, notes: subNotes })}
                    className="text-xs"
                  >
                    +365 Days
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleSubscriptionAction("extend", { days: -30, notes: subNotes || "Reduced duration -30d" })}
                    className="text-xs text-amber-700 hover:bg-amber-50"
                  >
                    -30 Days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleSubscriptionAction("restore", { notes: subNotes })}
                    className="text-xs text-emerald-700 hover:bg-emerald-50"
                  >
                    Restore
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleSubscriptionAction("lifetime", { notes: subNotes || "Granted Founder Lifetime" })}
                    className="text-xs text-purple-700 hover:bg-purple-50"
                  >
                    Lifetime
                  </Button>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  disabled={actionLoading}
                  onClick={() => handleSubscriptionAction("cancel")}
                  className="w-full text-xs"
                >
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
