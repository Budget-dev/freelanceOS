/**
 * @file apps/web/hooks/useAdminAuth.ts
 * @description Hook to verify and track current user's Admin role and capabilities
 */

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthContext";
import { adminFetch } from "@/lib/api/admin-client";

export interface AdminPermissions {
  role: "super_admin" | "admin" | "support";
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isSupport: boolean;
  canManageUsers: boolean;
  canSuspendUsers: boolean;
  canManageSubscriptions: boolean;
  canManagePlans: boolean;
  canManageRoles: boolean;
  canViewAnalytics: boolean;
  canViewAuditLogs: boolean;
}

const BOOTSTRAP_SUPER_ADMIN = "venkateshchop14@gmail.com";

export function useAdminAuth() {
  const { user, loading: authLoading } = useAuth();
  const [adminLoading, setAdminLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAdminStatus() {
      if (authLoading) return;

      if (!user) {
        if (isMounted) {
          setIsAdminUser(false);
          setPermissions(null);
          setAdminLoading(false);
        }
        return;
      }

      // Optimistic authorization for bootstrap super admin
      const isRootAdmin = (user.email || "").toLowerCase() === BOOTSTRAP_SUPER_ADMIN;
      if (isRootAdmin && isMounted) {
        setIsAdminUser(true);
        setPermissions({
          role: "super_admin",
          isSuperAdmin: true,
          isAdmin: true,
          isSupport: true,
          canManageUsers: true,
          canSuspendUsers: true,
          canManageSubscriptions: true,
          canManagePlans: true,
          canManageRoles: true,
          canViewAnalytics: true,
          canViewAuditLogs: true,
        });
        setError(null);
      }

      try {
        const data = await adminFetch("/api/admin/auth/me");
        if (isMounted) {
          if (data.authenticated && data.permissions) {
            setIsAdminUser(true);
            setPermissions(data.permissions);
            setError(null);
          } else if (!isRootAdmin) {
            setIsAdminUser(false);
            setPermissions(null);
          }
        }
      } catch (err: any) {
        if (isMounted && !isRootAdmin) {
          setIsAdminUser(false);
          setPermissions(null);
          setError(err.message || "Admin authorization failed");
        }
      } finally {
        if (isMounted) {
          setAdminLoading(false);
        }
      }
    }

    checkAdminStatus();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  return {
    user,
    loading: authLoading || adminLoading,
    isAdminUser,
    permissions,
    error,
  };
}
