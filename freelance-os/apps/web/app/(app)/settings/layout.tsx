import Link from "next/link";
import { ReactNode } from "react";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      <div className="w-full md:w-64 shrink-0">
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        <nav className="flex flex-col gap-2">
          <Link href="/settings/account" className="px-3 py-2 hover:bg-gray-100 rounded-md text-sm font-medium">Account</Link>
          <Link href="/settings/ai" className="px-3 py-2 hover:bg-gray-100 rounded-md text-sm font-medium">AI & Models</Link>
          <Link href="/settings/billing" className="px-3 py-2 hover:bg-gray-100 rounded-md text-sm font-medium">Billing</Link>
        </nav>
      </div>
      <div className="flex-1 bg-white p-6 rounded-lg border shadow-sm">
        {children}
      </div>
    </div>
  );
}
