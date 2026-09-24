/**
 * @file apps/web/app/admin/users/page.tsx
 * @description Admin User Directory & Management Page
 *
 * Implements searchable, filterable, sortable, and paginated user roster.
 * Strictly enforces zero raw key leakage: displays safe connectivity pills only.
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/api/admin-client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function AdminUsersPage() {
  const { permissions } = useAdminAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [hasAiKeyFilter, setHasAiKeyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search,
        status: statusFilter,
        plan: planFilter,
        hasAiKey: hasAiKeyFilter,
        sortBy,
      });

      const res = await adminFetch(`/api/admin/users?${query.toString()}`);
      setUsers(res.users || []);
      setPagination(res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, planFilter, hasAiKeyFilter, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleSuspendToggle = async (uid: string, currentStatus: string) => {
    if (!permissions?.canSuspendUsers) return;
    const isSuspended = currentStatus === "suspended";
    const action = isSuspended ? "restore" : "suspend";
    const confirmPrompt = isSuspended
      ? "Are you sure you want to restore this user account?"
      : "Are you sure you want to suspend this user? They will be blocked from logging in.";

    if (!window.confirm(confirmPrompt)) return;

    try {
      setActionLoading(uid);
      await adminFetch(`/api/admin/users/${uid}/${action}`, {
        method: "POST",
        body: JSON.stringify({ reason: `Administrative ${action} from user table` }),
      });
      // Refresh local table
      fetchUsers(pagination.page);
    } catch (err: any) {
      alert(err.message || `Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            User Directory
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Total {pagination.total} registered freelancers & platform accounts
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchUsers(pagination.page)}
          disabled={loading}
          className="h-8 gap-1 text-xs self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or UID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border/80 bg-background pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button type="submit" size="sm" className="h-8 text-xs px-3">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-border/80 bg-background px-2 py-1 text-xs text-foreground"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>

          {/* Plan filter */}
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

          {/* AI Key filter */}
          <select
            value={hasAiKeyFilter}
            onChange={(e) => setHasAiKeyFilter(e.target.value)}
            className="rounded-md border border-border/80 bg-background px-2 py-1 text-xs text-foreground"
          >
            <option value="all">All AI Key States</option>
            <option value="yes">Has Configured Key</option>
            <option value="no">No Key Configured</option>
          </select>

          {/* Sorting */}
          <div className="ml-auto flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border border-border/80 bg-background px-2 py-1 text-xs text-foreground"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="lastLogin">Last Login</option>
              <option value="lastActive">Last Active</option>
              <option value="projects">Most Projects</option>
              <option value="conversionRate">Highest Win Rate</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="rounded-xl border border-border/70 bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Subscription</th>
                <th className="py-3 px-3">Projects</th>
                <th className="py-3 px-3">Win Rate</th>
                <th className="py-3 px-3">AI BYOK Status</th>
                <th className="py-3 px-3">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No users matching criteria found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSuspended = u.status === "suspended";
                  const subPlan = u.subscription?.planName || "Starter Plan";

                  return (
                    <tr key={u.uid} className="hover:bg-muted/30 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{u.name}</span>
                          <span className="text-[11px] text-muted-foreground">{u.email}</span>
                          <span className="text-[9px] text-muted-foreground/70 font-mono truncate max-w-[150px]">
                            {u.uid}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Subscription */}
                      <td className="py-3 px-3">
                        <span className="font-medium text-foreground">{subPlan}</span>
                        {u.subscription?.status === "lifetime" && (
                          <span className="block text-[9px] text-purple-600 font-semibold">Lifetime</span>
                        )}
                      </td>

                      {/* Total Projects */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-foreground">{u.stats?.totalProjects ?? 0}</span>
                        <span className="text-[11px] text-muted-foreground block">
                          {u.stats?.hiredProjects ?? 0} won
                        </span>
                      </td>

                      {/* Win Rate */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-foreground">{u.stats?.conversionRate ?? 0}%</span>
                      </td>

                      {/* AI Key Status (NO RAW KEYS) */}
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-semibold border ${
                              u.aiKeyStatus?.gemini
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-muted text-muted-foreground border-border/50"
                            }`}
                          >
                            Gemini: {u.aiKeyStatus?.gemini ? "✓" : "—"}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-semibold border ${
                              u.aiKeyStatus?.openai
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-muted text-muted-foreground border-border/50"
                            }`}
                          >
                            OpenAI: {u.aiKeyStatus?.openai ? "✓" : "—"}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-semibold border ${
                              u.aiKeyStatus?.anthropic
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-muted text-muted-foreground border-border/50"
                            }`}
                          >
                            Claude: {u.aiKeyStatus?.anthropic ? "✓" : "—"}
                          </span>
                        </div>
                      </td>

                      {/* Last Active */}
                      <td className="py-3 px-3 text-muted-foreground text-[11px]">
                        {u.lastSeenAt
                          ? new Date(u.lastSeenAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "Never"}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/users/${u.uid}`}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" /> Inspect
                          </Link>

                          {permissions?.canSuspendUsers && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={actionLoading === u.uid}
                              onClick={() => handleSuspendToggle(u.uid, u.status)}
                              className={`h-7 px-2 text-xs ${
                                isSuspended
                                  ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  : "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              }`}
                            >
                              {isSuspended ? "Restore" : "Suspend"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || loading}
              onClick={() => fetchUsers(pagination.page - 1)}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => fetchUsers(pagination.page + 1)}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
