/**
 * @file apps/web/app/api/admin/plans/route.ts
 * @description System Subscription Plans Management API
 *
 * Allows Super Admins to define and manage available subscription tiers:
 * - Starter, Pro, Agency, Lifetime
 * - Pricing, duration, feature limits
 * - Active / inactive status
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth/admin-auth";
import { getCollectionDocs, setDocumentByPath } from "@/lib/firebase/firestore-rest";
import { createAuditLog } from "@/lib/services/audit-service";

const DEFAULT_SYSTEM_PLANS = [
  {
    id: "starter",
    name: "Starter Plan",
    description: "Free tier for early stage freelancers with 10 monthly project analyses.",
    price: 0,
    currency: "USD",
    durationDays: 0,
    active: true,
    featureLimits: {
      analysesPerMonth: 10,
      portfolioLimit: 3,
      aiTuning: false,
    },
  },
  {
    id: "pro",
    name: "Professional Plan",
    description: "Full workspace power for active freelancers. Unlimited AI analyses and high-priority matching.",
    price: 29,
    currency: "USD",
    durationDays: 30,
    active: true,
    featureLimits: {
      analysesPerMonth: 9999,
      portfolioLimit: 20,
      aiTuning: true,
    },
  },
  {
    id: "agency",
    name: "Agency / Team Plan",
    description: "Advanced team pipeline tracking and multi-client outreach analytics.",
    price: 79,
    currency: "USD",
    durationDays: 30,
    active: true,
    featureLimits: {
      analysesPerMonth: 99999,
      portfolioLimit: 100,
      aiTuning: true,
    },
  },
  {
    id: "lifetime",
    name: "Founder Lifetime Access",
    description: "Exclusive lifetime access to all current and future FreelanceOS intelligence modules.",
    price: 199,
    currency: "USD",
    durationDays: null,
    active: true,
    featureLimits: {
      analysesPerMonth: 99999,
      portfolioLimit: 100,
      aiTuning: true,
    },
  },
];

export async function GET(req: NextRequest) {
  try {
    const { errorResponse, adminUser } = await verifyAdminRequest(req, "support");
    if (errorResponse) return errorResponse;

    const plans = await getCollectionDocs("system/plans/items", adminUser?.token);
    if (!plans || plans.length === 0) {
      return NextResponse.json({ plans: DEFAULT_SYSTEM_PLANS });
    }

    return NextResponse.json({ plans });
  } catch (error: any) {
    console.error("[AdminPlans] Error fetching plans:", error);
    return NextResponse.json({ plans: DEFAULT_SYSTEM_PLANS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse, adminUser } = await verifyAdminRequest(req, "super_admin");
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { id, name, description, price, durationDays, active, featureLimits } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "Missing required fields (id, name)" }, { status: 400 });
    }

    const planId = id.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");
    const nowIso = new Date().toISOString();

    const planData = {
      id: planId,
      name,
      description: description || "",
      price: typeof price === "number" ? price : parseFloat(price || "0"),
      durationDays: durationDays !== undefined ? durationDays : 30,
      active: active !== undefined ? !!active : true,
      featureLimits: featureLimits || {},
      updatedAt: nowIso,
    };

    await setDocumentByPath(`system/plans/items/${planId}`, planData, adminUser?.token, true);

    // Audit Log
    await createAuditLog({
      adminUid: adminUser!.uid,
      adminEmail: adminUser!.email,
      action: "plan.update",
      details: `Updated subscription plan: ${name} (${planId})`,
      newState: planData,
    }, adminUser?.token);

    return NextResponse.json({ success: true, plan: planData });
  } catch (error: any) {
    console.error("[AdminPlans] Error saving plan:", error);
    return NextResponse.json({ error: "Failed to save plan" }, { status: 400 });
  }
}
