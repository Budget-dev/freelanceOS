/**
 * @file apps/web/app/admin/settings/page.tsx
 * @description Administrative Access Control & Staff Management Page
 *
 * Implements complete Super Admin authority:
 * - Shows full staff directory with status, assignment date, last login/active, and assigned by
 * - Super Admin actions: Add Admin, Remove Admin, Add Support, Remove Support, Change Admin ↔ Support, Disable/Restore staff
 * - Enforces single bootstrap owner: venkateshchop14@gmail.com cannot be demoted
 * - Forbids creation of additional Super Admins via the UI
 */

"use client";

import React, { useEffect, useState } from "react";
import { adminFetch } from "@/lib/api/admin-client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  UserPlus,
  RefreshCw,
  AlertCircle,
  Lock,
  Crown,
  UserMinus,
  Ban,
  CheckCircle2,
} from "lucide-react";

const BOOTSTRAP_SUPER_ADMIN = "venkateshchop14@gmail.com";

export default function AdminSettingsPage() {
  const { permissions, user } = useAdminAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Elevation form state
  const [targetUid, setTargetUid] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "support">("support");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/api/admin/roles");
      setAdmins(res.admins || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load staff roster");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (permissions?.isSuperAdmin) {
      fetchAdmins();
    } else {
      setLoading(false);
    }
  }, [permissions]);

  const handleUpdateRole = async (uid: string, newRole: string, notes?: string) => {
    if (!permissions?.canManageRoles) {
      alert("Only the Super Admin can manage administrative privileges.");
      return;
    }

    const confirmMsg =
      newRole === "user"
        ? "Revoke administrative privileges for this staff member?"
        : `Update staff member's role to '${newRole}'?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setSubmitting(true);
      await adminFetch("/api/admin/roles", {
        method: "POST",
        body: JSON.stringify({
          targetUid: uid,
          role: newRole,
          notes: notes || `Role changed via Admin Settings`,
        }),
      });

      setTargetUid("");
      setAssignmentNotes("");
      fetchAdmins();
    } catch (err: any) {
      alert(err.message || "Failed to update role");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStaffStatus = async (uid: string, currentStatus: string) => {
    if (!permissions?.canManageRoles) return;
    const isDisable = currentStatus !== "disabled";
    const promptText = isDisable
      ? "Disable this staff member's administrative privileges?"
      : "Restore this staff member's administrative access?";

    if (!window.confirm(promptText)) return;

    try {
      setSubmitting(true);
      await adminFetch("/api/admin/roles", {
        method: "POST",
        body: JSON.stringify({
          targetUid: uid,
          action: isDisable ? "disable_staff" : "restore_staff",
          notes: `Staff access ${isDisable ? "disabled" : "restored"} by Super Admin`,
        }),
      });

      fetchAdmins();
    } catch (err: any) {
      alert(err.message || "Failed to update staff status");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
            <span>Admin Settings & Staff Management</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Role-based privilege control, staff authorization, and permission enforcement
          </p>
        </div>

        {permissions?.isSuperAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdmins}
            disabled={loading}
            className="h-8 gap-1 text-xs self-start sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Roster
          </Button>
        )}
      </div>

      {/* Super Admin Ownership Banner */}
      <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4 text-xs text-purple-900 shadow-2xs">
        <div className="flex items-start gap-3">
          <Crown className="h-5 w-5 text-purple-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <strong className="font-bold text-sm text-purple-950">Primary Super Admin Controller:</strong>
              <span className="font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-semibold text-xs border border-purple-300">
                {BOOTSTRAP_SUPER_ADMIN}
              </span>
            </div>
            <p className="text-[11px] text-purple-800/90 leading-relaxed">
              This account holds root platform authority. Only this account may appoint Admins, appoint Support members, or configure system plans. Creation of additional Super Admin accounts is restricted to server configuration.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Permissions Matrix */}
      <div className="rounded-xl border border-border/70 bg-card p-5 shadow-2xs space-y-3">
        <div className="border-b border-border/50 pb-2.5">
          <h3 className="text-sm font-bold text-foreground">Operational Permissions Matrix</h3>
          <p className="text-xs text-muted-foreground">
            Strict capability enforcement verified server-side on every API request
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/50">
              <tr>
                <th className="py-2.5 px-3">Permission / Capability</th>
                <th className="py-2.5 px-3 text-center">Super Admin</th>
                <th className="py-2.5 px-3 text-center">Admin</th>
                <th className="py-2.5 px-3 text-center">Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-xs">
              <tr>
                <td className="py-2 px-3 font-medium text-foreground">View Platform Overview & Analytics</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Read-Only</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-foreground">Inspect Users & Project Pipelines</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Read-Only</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-foreground">Suspend & Restore User Accounts</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2 px-3 text-center text-muted-foreground">— Restricted</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-foreground">Manage User Subscriptions (Manual)</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2 px-3 text-center text-muted-foreground">— Restricted</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-foreground">Configure System Subscription Plans</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="py-2 px-3 text-center text-muted-foreground">— Restricted</td>
                <td className="py-2 px-3 text-center text-muted-foreground">— Restricted</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-foreground">Appoint / Remove Staff (Admin & Support)</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Exclusive</td>
                <td className="py-2 px-3 text-center text-muted-foreground">— Restricted</td>
                <td className="py-2 px-3 text-center text-muted-foreground">— Restricted</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-foreground">Access User Raw AI Keys</td>
                <td className="py-2 px-3 text-center text-rose-600 font-bold">FORBIDDEN</td>
                <td className="py-2 px-3 text-center text-rose-600 font-bold">FORBIDDEN</td>
                <td className="py-2 px-3 text-center text-rose-600 font-bold">FORBIDDEN</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Super Admin: Staff Management */}
      {permissions?.isSuperAdmin ? (
        <div className="space-y-4">
          {/* Appoint Staff Form */}
          <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs space-y-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Appoint Staff Member</h3>
              <p className="text-xs text-muted-foreground">
                Grant Admin or Support privileges to an existing registered freelancer by UID
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateRole(targetUid.trim(), selectedRole, assignmentNotes);
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-foreground block mb-1">User UID</label>
                  <input
                    type="text"
                    required
                    placeholder="Copy UID from User Directory..."
                    value={targetUid}
                    onChange={(e) => setTargetUid(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-foreground block mb-1">Select Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
                  >
                    <option value="support">Support Member (Read-Only access)</option>
                    <option value="admin">Administrator (User & Subscription Management)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-foreground block mb-1">Administrative Reason / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Appointed as Operations Lead / Customer Support"
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground"
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button type="submit" size="sm" disabled={submitting} className="h-8 text-xs font-semibold px-4">
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Appoint Staff Member
                </Button>
              </div>
            </form>
          </div>

          {/* Complete Staff Directory Table */}
          <div className="rounded-xl border border-border/70 bg-card shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h3 className="text-sm font-bold text-foreground">Staff Directory & Active Personnel</h3>
              <p className="text-xs text-muted-foreground">Authorized personnel with elevated administrative credentials</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/50">
                  <tr>
                    <th className="py-2.5 px-4">Staff Member</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Assigned Date</th>
                    <th className="py-2.5 px-3">Assigned By</th>
                    <th className="py-2.5 px-3">Last Active</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {admins.map((adm) => {
                    const isBootstrap = adm.isBootstrapOwner || (adm.email || "").toLowerCase() === BOOTSTRAP_SUPER_ADMIN;
                    const isDisabled = adm.status === "disabled";

                    const roleBadgeColor =
                      adm.role === "super_admin"
                        ? "bg-purple-100 text-purple-700 border-purple-200"
                        : adm.role === "admin"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-amber-100 text-amber-700 border-amber-200";

                    return (
                      <tr key={adm.uid} className="hover:bg-muted/30 transition-colors">
                        {/* Name & Email */}
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground">{adm.name}</span>
                            {isBootstrap && (
                              <span className="flex items-center gap-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 px-1.5 py-0.2 text-[9px] font-bold">
                                <Crown className="h-2.5 w-2.5" /> Owner
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground block">{adm.email}</span>
                          <span className="text-[9px] font-mono text-muted-foreground/70 block truncate max-w-[150px]">{adm.uid}</span>
                        </td>

                        {/* Role */}
                        <td className="py-2.5 px-3">
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold border uppercase ${roleBadgeColor}`}>
                            {adm.role.replace("_", " ")}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3">
                          {isDisabled ? (
                            <span className="rounded bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 text-[10px] font-semibold">
                              Disabled
                            </span>
                          ) : (
                            <span className="rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-semibold">
                              Active
                            </span>
                          )}
                        </td>

                        {/* Assigned Date */}
                        <td className="py-2.5 px-3 text-[11px] text-muted-foreground">
                          {adm.assignedAt ? new Date(adm.assignedAt).toLocaleDateString() : "System Init"}
                        </td>

                        {/* Assigned By */}
                        <td className="py-2.5 px-3 text-[11px] text-muted-foreground truncate max-w-[120px]">
                          {adm.assignedBy || "Super Admin"}
                        </td>

                        {/* Last Active */}
                        <td className="py-2.5 px-3 text-[11px] text-muted-foreground">
                          {adm.lastActive ? new Date(adm.lastActive).toLocaleDateString() : "—"}
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-4 text-right">
                          {isBootstrap ? (
                            <span className="text-[10px] text-purple-700 font-semibold italic">Permanent Owner</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Change Role Admin ↔ Support */}
                              {adm.role === "admin" ? (
                                <button
                                  type="button"
                                  disabled={submitting}
                                  onClick={() => handleUpdateRole(adm.uid, "support")}
                                  className="rounded px-2 py-1 text-[11px] font-medium text-amber-700 hover:bg-amber-50 border border-amber-200"
                                >
                                  Make Support
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={submitting}
                                  onClick={() => handleUpdateRole(adm.uid, "admin")}
                                  className="rounded px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-50 border border-blue-200"
                                >
                                  Make Admin
                                </button>
                              )}

                              {/* Disable / Restore Staff Access */}
                              <button
                                type="button"
                                disabled={submitting}
                                onClick={() => handleToggleStaffStatus(adm.uid, adm.status)}
                                className={`rounded px-2 py-1 text-[11px] font-medium border ${
                                  isDisabled
                                    ? "text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                    : "text-amber-700 border-amber-200 hover:bg-amber-50"
                                }`}
                              >
                                {isDisabled ? "Restore" : "Disable"}
                              </button>

                              {/* Revoke Role completely */}
                              <button
                                type="button"
                                disabled={submitting}
                                onClick={() => handleUpdateRole(adm.uid, "user")}
                                className="rounded px-2 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-50 border border-rose-200"
                              >
                                Revoke
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border/70 bg-card p-5 text-xs text-muted-foreground flex items-center gap-3">
          <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <strong className="text-foreground block font-semibold">Staff Management Restricted</strong>
            <span>Only the primary Super Admin ({BOOTSTRAP_SUPER_ADMIN}) can appoint or modify administrative personnel.</span>
          </div>
        </div>
      )}
    </div>
  );
}
