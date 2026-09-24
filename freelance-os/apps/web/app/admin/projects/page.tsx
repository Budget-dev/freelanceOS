/**
 * @file apps/web/app/admin/projects/page.tsx
 * @description Platform-Wide Project & Application Tracking Page
 *
 * Monitors freelancer client bids, stage pipelines, budget values, and win ratios.
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/api/admin-client";
import { StatCard } from "@/components/admin/StatCard";
import { Button } from "@/components/ui/button";
import {
  FolderKanban,
  Send,
  MessageSquare,
  Trophy,
  XOctagon,
  Percent,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function AdminProjectsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async (targetPage = 1) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: targetPage.toString(),
        limit: "15",
        stage: stageFilter,
        user: userSearch,
      });

      const res = await adminFetch(`/api/admin/projects?${query.toString()}`);
      setData(res);
      setPage(targetPage);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects(1);
  };

  const metrics = data?.metrics || {};
  const projects = data?.projects || [];
  const pagination = data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Client Projects & Pipeline
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Aggregated opportunity tracking across all freelancer workspaces
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchProjects(page)}
          disabled={loading}
          className="h-8 gap-1 text-xs self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
        <StatCard
          title="Total Projects"
          value={loading ? "..." : (metrics.totalProjects ?? 0)}
          icon={FolderKanban}
        />
        <StatCard
          title="Applied"
          value={loading ? "..." : (metrics.stages?.applied ?? 0)}
          icon={Send}
        />
        <StatCard
          title="Client Replied"
          value={loading ? "..." : (metrics.stages?.client_replied ?? 0)}
          icon={MessageSquare}
        />
        <StatCard
          title="Won / Hired"
          value={loading ? "..." : (metrics.hired ?? 0)}
          icon={Trophy}
          badgeColor="bg-emerald-100 text-emerald-700 border-emerald-200"
        />
        <StatCard
          title="Win Rate"
          value={loading ? "..." : `${metrics.conversionRate ?? 0}%`}
          icon={Percent}
        />
        <StatCard
          title="Total Pipeline"
          value={loading ? "..." : `$${(metrics.totalPipelineValue || 0).toLocaleString()}`}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by project, client, or user email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
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
            <span>Stage Filter:</span>
          </div>

          {[
            { key: "all", label: "All Stages" },
            { key: "new", label: "New Leads" },
            { key: "applied", label: "Applied" },
            { key: "client_replied", label: "Client Replied" },
            { key: "hired", label: "Hired / Won" },
            { key: "rejected", label: "Rejected" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setStageFilter(item.key)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                stageFilter === item.key
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-xl border border-border/70 bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">Project & Client</th>
                <th className="py-3 px-3">Freelancer</th>
                <th className="py-3 px-3">Stage</th>
                <th className="py-3 px-3">Value</th>
                <th className="py-3 px-3">Match Score</th>
                <th className="py-3 px-3">Platform</th>
                <th className="py-3 px-3">Last Activity</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading && projects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    Loading platform projects...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No projects found for current filters.
                  </td>
                </tr>
              ) : (
                projects.map((p: any) => {
                  const stageStyles: Record<string, string> = {
                    new: "bg-slate-100 text-slate-700 border-slate-200",
                    applied: "bg-blue-50 text-blue-700 border-blue-200",
                    client_replied: "bg-amber-50 text-amber-700 border-amber-200",
                    hired: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold",
                    rejected: "bg-rose-50 text-rose-700 border-rose-200",
                  };

                  return (
                    <tr key={`${p.userId}_${p.id}`} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{p.projectTitle}</span>
                          <span className="text-[11px] text-muted-foreground">Client: {p.clientName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <Link
                          href={`/admin/users/${p.userId}`}
                          className="font-medium text-primary hover:underline block"
                        >
                          {p.userName}
                        </Link>
                        <span className="text-[10px] text-muted-foreground block truncate max-w-[130px]">
                          {p.userEmail}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] border capitalize ${
                          stageStyles[p.stage] || "bg-muted text-muted-foreground"
                        }`}>
                          {p.stage.replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-semibold text-foreground">{p.value}</td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-foreground">{p.matchScore}%</span>
                      </td>

                      <td className="py-3 px-3 text-muted-foreground text-[11px]">{p.platform}</td>

                      <td className="py-3 px-3 text-[11px] text-muted-foreground truncate max-w-[140px]">
                        {p.lastActivity}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/users/${p.userId}`}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          View User
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total items)
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || loading}
              onClick={() => fetchProjects(pagination.page - 1)}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => fetchProjects(pagination.page + 1)}
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
