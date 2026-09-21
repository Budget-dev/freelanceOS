"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";

export function TopNavWrapper() {
  const pathname = usePathname();

  // Hide the global platform header on standalone public portfolio pages
  if (pathname?.startsWith("/p/") || pathname?.startsWith("/portfolio/")) {
    return null;
  }

  return <Header />;
}
