/**
 * @file apps/web/lib/firebase/user-cache.ts
 * @description Local persistent cache for registered users
 *
 * Ensures all known/synced users remain visible in the Admin User Directory
 * even when Firebase Admin SDK credentials are not yet configured or when
 * client-side Firestore security rules restrict multi-user writes.
 */

import fs from "fs";
import path from "path";

const CACHE_FILE_PATH = path.resolve(process.cwd(), ".synced-users.json");

export function getCachedUsers(): any[] {
  try {
    if (!fs.existsSync(CACHE_FILE_PATH)) {
      return [];
    }
    const content = fs.readFileSync(CACHE_FILE_PATH, "utf8");
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("[UserCache] Failed to read cached users:", err);
    return [];
  }
}

export function saveCachedUsers(newUsers: any[]): any[] {
  try {
    const existing = getCachedUsers();
    const map = new Map<string, any>();

    for (const u of existing) {
      if (u.uid) map.set(u.uid, u);
    }

    for (const u of newUsers) {
      if (!u.uid) continue;
      const prev = map.get(u.uid) || {};
      map.set(u.uid, {
        ...prev,
        ...u,
        uid: u.uid,
        id: u.uid,
        lastUpdated: new Date().toISOString(),
      });
    }

    const merged = Array.from(map.values());
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(merged, null, 2), "utf8");
    return merged;
  } catch (err) {
    console.warn("[UserCache] Failed to save cached users:", err);
    return [];
  }
}
