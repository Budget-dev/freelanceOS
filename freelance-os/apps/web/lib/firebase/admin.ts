/**
 * @file apps/web/lib/firebase/admin.ts
 * @description Secure Server-Side Firebase Admin SDK Initialization
 *
 * Uses official modern modular Firebase Admin SDK imports:
 * - firebase-admin/app
 * - firebase-admin/auth
 * - firebase-admin/firestore
 */

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

export const projectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-3617949397-6cc07";

export function hasAdminCredentials(): boolean {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  );
}

function initializeFirebaseAdmin(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  // 1. Check for complete service account JSON in environment variable
  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (rawServiceAccount) {
    try {
      let parsedKey: any;
      if (rawServiceAccount.trim().startsWith("{")) {
        parsedKey = JSON.parse(rawServiceAccount);
      } else {
        const decoded = Buffer.from(rawServiceAccount, "base64").toString("utf8");
        parsedKey = JSON.parse(decoded);
      }
      return initializeApp({
        credential: cert(parsedKey),
        projectId: parsedKey.project_id || projectId,
      });
    } catch (parseErr) {
      console.error("[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", parseErr);
    }
  }

  // 2. Check for discrete private key and client email
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  if (privateKey && clientEmail) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    });
  }

  // 3. Fallback: Initialize with projectId only (avoids blocking metadata lookup in serverless)
  return initializeApp({
    projectId,
  });
}

const adminApp: App = initializeFirebaseAdmin();
export const adminAuth: Auth = getAuth(adminApp);
export const adminDb: Firestore = getFirestore(adminApp);
export default adminApp;
