/**
 * @file apps/web/components/layout/ActivityHeartbeat.tsx
 * @description Silent, Throttled Client Activity Heartbeat Component
 *
 * Sends a lightweight heartbeat ping every 2 minutes while the user has an active tab,
 * recording lastSeenAt and currentRoute without generating excessive Firestore writes.
 */

"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthContext";

export function ActivityHeartbeat() {
  const { user } = useAuth();
  const pathname = usePathname();
  const lastPingRef = useRef<number>(0);
  const routeRef = useRef<string>(pathname || "/dashboard");
  routeRef.current = pathname || "/dashboard";

  useEffect(() => {
    if (!user) return;

    let isSuspendedOrStopped = false;

    async function sendHeartbeat() {
      if (isSuspendedOrStopped) return;
      const now = Date.now();
      // Throttle: minimum 60 seconds between pings
      if (now - lastPingRef.current < 60000) return;

      try {
        const token = await user?.getIdToken();
        if (!token) return;

        lastPingRef.current = now;

        const res = await fetch("/api/activity/heartbeat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            route: routeRef.current,
          }),
        });

        if (res.status === 403) {
          // Account suspended, cease heartbeat
          isSuspendedOrStopped = true;
        }
      } catch {
        // silent fail on offline/network errors
      }
    }

    // Ping on mount if enough time has passed
    sendHeartbeat();

    // Throttled interval: ping every 2 minutes (120,000ms)
    const interval = setInterval(() => {
      sendHeartbeat();
    }, 120000);

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  // Route change ping (throttled)
  useEffect(() => {
    if (!user) return;
    const now = Date.now();
    // Only ping on route change if at least 60 seconds have elapsed since last ping
    if (now - lastPingRef.current >= 60000) {
      user.getIdToken().then((token) => {
        if (!token) return;
        lastPingRef.current = now;
        fetch("/api/activity/heartbeat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ route: pathname || "/dashboard" }),
        }).catch(() => {});
      }).catch(() => {});
    }
  }, [pathname, user]);

  return null;
}
