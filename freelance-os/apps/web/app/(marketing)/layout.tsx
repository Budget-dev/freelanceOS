import type { Metadata } from "next";
import "../globals.css";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "FreelanceOS — Freelance Opportunity Intelligence Platform",
  description:
    "Analyze freelance opportunities, spot red flags, match your profile, and generate truth-checked proposals you can trust.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
