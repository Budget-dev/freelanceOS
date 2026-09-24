"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { AISettingsStorage } from "@/lib/storage";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isSuspended: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isSuspended: false,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuspended, setIsSuspended] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Ensure authentication email and user root record are stored in Firestore
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          const isNewUser = !userDocSnap.exists();
          const existingData = userDocSnap.exists() ? userDocSnap.data() : null;

          // Check if user is suspended
          if (existingData?.status === "suspended" || existingData?.disabled === true) {
            setIsSuspended(true);
            return;
          }
          setIsSuspended(false);

          const nowIso = new Date().toISOString();
          const userPayload: Record<string, any> = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || "",
            photoURL: currentUser.photoURL || "",
            lastLoginAt: nowIso,
            lastSeenAt: nowIso,
            lastActiveTimestamp: Date.now(),
          };

          if (isNewUser) {
            userPayload.createdAt = currentUser.metadata.creationTime || nowIso;
          }

          await setDoc(userDocRef, userPayload, { merge: true });

          // Restore saved profile, Gemini API key, and AI settings from Firestore on login
          if (existingData?.geminiApiKey) {
            AISettingsStorage.save({
              geminiApiKey: existingData.geminiApiKey,
              defaultModel: "gemini-1-5-pro",
            });
          }

          // Restore AI settings subcollection if present
          const aiDocRef = doc(db, "users", currentUser.uid, "settings", "ai");
          const aiDocSnap = await getDoc(aiDocRef);
          if (aiDocSnap.exists()) {
            const aiData = aiDocSnap.data();
            AISettingsStorage.save(aiData as any);
          }

          // Restore Portfolio projects from Firestore
          const portfolioDocRef = doc(db, "users", currentUser.uid, "profile", "portfolio");
          const portfolioDocSnap = await getDoc(portfolioDocRef);
          if (portfolioDocSnap.exists()) {
            const pData = portfolioDocSnap.data();
            if (pData?.projects && Array.isArray(pData.projects)) {
              localStorage.setItem("freelance_os_portfolio_projects_v1", JSON.stringify(pData.projects));
            }
          }
        } catch (syncErr) {
          console.error("Firestore user data sync error on login:", syncErr);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      if (typeof window !== "undefined") {
        // Purge user's local AI keys and portfolio cache to prevent session contamination on shared browsers
        AISettingsStorage.clear();
        localStorage.removeItem("freelance_os_ai_settings_v1");
        localStorage.removeItem("freelance_os_portfolio_projects_v1");
      }
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isSuspended, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
