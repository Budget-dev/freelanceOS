"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { AISettingsStorage } from "@/lib/storage";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Ensure authentication email and user root record are stored in Firestore
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          await setDoc(
            userDocRef,
            {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || "",
              photoURL: currentUser.photoURL || "",
              lastLoginAt: new Date().toISOString(),
            },
            { merge: true }
          );

          // Restore saved profile, Gemini API key, and AI settings from Firestore on login
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.geminiApiKey) {
              AISettingsStorage.save({
                geminiApiKey: userData.geminiApiKey,
                defaultModel: "gemini-1-5-pro",
              });
            }
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
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
