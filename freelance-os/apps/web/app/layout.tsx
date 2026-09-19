import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FreelanceOS — Freelance Opportunity Intelligence Platform",
  description:
    "Analyze freelance opportunities, spot red flags, match your profile, and generate truth-checked proposals you can trust.",
};

import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext";
import { TopNavWrapper } from "@/components/layout/TopNavWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background flex flex-col">
        <UserPreferencesProvider>
          <TopNavWrapper />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </UserPreferencesProvider>
      </body>
    </html>
  );
}
