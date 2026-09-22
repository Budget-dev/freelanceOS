"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center max-w-lg mx-auto">
      <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
        <Sparkles className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Free Early Access Active
      </h1>
      <p className="text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
        FreelanceOS is currently in free public preview. All forensic client intelligence, research tools, and project auditing features are completely unlocked without any subscription or payment.
      </p>
      <Link href="/dashboard">
        <Button className="rounded-xl font-bold text-xs gap-2">
          <span>Go to Dashboard</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
