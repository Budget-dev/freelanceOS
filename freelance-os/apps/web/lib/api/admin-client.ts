/**
 * @file apps/web/lib/api/admin-client.ts
 * @description Authenticated Fetch Client for Admin API Endpoints
 *
 * Automatically fetches the current Firebase ID token and injects the
 * Authorization header for all /api/admin/* requests.
 */

import { auth } from "@/lib/firebase/config";

export async function adminFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  retries: number = 1
): Promise<T> {
  const currentUser = auth?.currentUser;
  if (!currentUser) {
    throw new Error("User session required. Please sign in.");
  }

  const idToken = await currentUser.getIdToken();

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${idToken}`);
  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 600));
      return adminFetch<T>(endpoint, options, retries - 1);
    }
    throw new Error(netErr.message || "Network request failed");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if ((response.status === 500 || response.status === 504 || response.status === 502) && retries > 0) {
      await new Promise((r) => setTimeout(r, 600));
      return adminFetch<T>(endpoint, options, retries - 1);
    }
    const errorMsg = data.error || `Admin request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}
