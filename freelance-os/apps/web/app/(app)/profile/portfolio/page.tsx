"use client";

import { ProfileNav } from "@/components/profile/profile-nav";
import { PortfolioManager } from "@/components/profile/portfolio-manager";

export default function ProfilePortfolioPage() {
  return (
    <div className="w-full">
      <ProfileNav activeTab="portfolio" />
      <PortfolioManager />
    </div>
  );
}
