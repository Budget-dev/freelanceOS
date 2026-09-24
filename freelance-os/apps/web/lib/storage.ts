/**
 * @file apps/web/lib/storage.ts
 * @description Unified LocalStorage and Firestore Persistence Service for FreelanceOS
 *
 * Provides a resilient, type-safe data access layer for:
 * 1. Saved Project Analyses
 * 2. Tracked Client Applications
 * 3. Portfolio Showcase Projects
 * 4. Custom AI Model Preferences & API Keys
 * 5. Billing & Subscription Quotas
 *
 * Handles offline / guest mode with localStorage and synchronizes with Firebase Firestore
 * when a user session is active.
 */

import { auth, db } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";

export type ApplicationStage = "new" | "applied" | "client_replied" | "hired" | "rejected";

export interface ProjectActivityLog {
  id: string;
  fromStage?: ApplicationStage;
  toStage: ApplicationStage;
  timestamp: string; // ISO string with exact date/time
  note?: string;
  actor?: "user" | "system";
}

export interface ResearchSearchQuery {
  query: string;
  target: string;
  status: "verified" | "probable" | "not_found";
  source: string;
  details: string;
  timestamp?: string;
}

export interface EvidenceClassification {
  confirmed: { label: string; details: string }[];
  inferred: { label: string; details: string }[];
  unknown: { label: string; details: string }[];
}

export interface ApplicationItem {
  id: string;
  projectTitle: string;
  clientName: string;
  clientUsername?: string;
  companyName?: string;
  stage: ApplicationStage;
  matchScore: number;
  value: string;
  budget?: {
    min?: number;
    max?: number;
    currency?: string;
    rawText?: string;
  };
  appliedDate?: string;
  lastActivity: string;
  notes?: string;
  proposalSummary?: string;
  platform?: string; // e.g. "Freelancer.com"
  projectUrl?: string;
  originalDescription?: string;
  deliverables?: string[];
  techStack?: string[];
  timeline?: string;
  experienceRequirements?: string[];
  location?: {
    country: string | null;
    city: string | null;
    displayLocation: string;
    timezone?: string;
    regionalMarketRate?: string;
    flagEmoji?: string;
  };
  evidenceClassification?: EvidenceClassification;
  research?: {
    searchesPerformed: ResearchSearchQuery[];
    companyWebsite?: {
      url: string;
      domain?: string;
      verified: boolean;
      title?: string;
      summary?: string;
    };
    googleBusinessProfile?: {
      found: boolean;
      name?: string;
      address?: string;
      rating?: number;
      reviewsCount?: number;
      notes?: string;
    };
    linkedin?: {
      found: boolean;
      url?: string;
      matchType?: string;
      companyPage?: string;
      keyContact?: string;
    };
    contacts: {
      type: "email" | "phone" | "whatsapp" | "website" | "linkedin" | "other";
      value: string;
      status: "verified" | "probable" | "not_found";
      source: string;
    }[];
    evidenceNotes: string[];
    evidenceClassification?: EvidenceClassification;
    transparencyDisclaimer: string;
  };
  analysis?: {
    summary: string;
    matchScore: number;
    confidenceScore: number;
    riskFlags: string[];
    keyFindings: string[];
    outreachTemplates: {
      email?: { subject: string; body: string };
      whatsapp?: { text: string };
      linkedin?: { connectionNote: string; inmailMessage: string; charCount?: number };
    };
  };
  history?: ProjectActivityLog[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SavedAnalysis {
  id: string;
  accountId?: string;
  status: "completed" | "running" | "failed";
  inputType: "text" | "image" | "url";
  title: string;
  recommendation: "apply" | "maybe" | "dont_apply";
  matchScore: number;
  budgetMin?: number;
  budgetMax?: number;
  currency: string;
  clientName?: string;
  summary?: string;
  keyFindings?: string[];
  riskFlags?: string[];
  createdAt: string;
  completedAt?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  description: string;
  metrics: string;
  technologies: string[];
  liveUrl?: string;
  repoUrl?: string;
  featured?: boolean;
}

export interface AISettings {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  geminiApiKey?: string;
  defaultModel: "gpt-4o" | "claude-3-5-sonnet" | "gemini-1-5-pro";
  proposalTone: "consultative" | "direct" | "technical" | "value-driven";
  riskTolerance: "strict" | "moderate" | "relaxed";
}

/**
 * Validates that an API key matches the expected format and minimal length for its provider.
 * Prevents UI from treating arbitrary strings longer than 8 characters as configured keys.
 */
export function isValidKeyFormat(
  key: string | undefined | null,
  provider?: "gemini" | "openai" | "anthropic"
): boolean {
  if (!key || typeof key !== "string") return false;
  const trimmed = key.trim();
  if (provider === "gemini") {
    return trimmed.startsWith("AIza") && trimmed.length >= 35;
  }
  if (provider === "anthropic") {
    return trimmed.startsWith("sk-ant-") && trimmed.length >= 30;
  }
  if (provider === "openai") {
    return trimmed.startsWith("sk-") && !trimmed.startsWith("sk-ant-") && trimmed.length >= 30;
  }
  // If provider not specified, infer strictly
  if (trimmed.startsWith("sk-ant-")) return trimmed.length >= 30;
  if (trimmed.startsWith("AIza")) return trimmed.length >= 35;
  if (trimmed.startsWith("sk-")) return trimmed.length >= 30;
  return false;
}

export interface BillingInfo {
  plan: "starter" | "pro" | "agency";
  status: "active" | "trialing" | "canceled";
  renewalDate: string;
  analysesUsed: number;
  analysesLimit: number;
  tokensUsed: number;
  tokensLimit: number;
  cardBrand?: string;
  cardLast4?: string;
}

const STORAGE_KEYS = {
  ANALYSES: "freelance_os_analyses_v1",
  APPLICATIONS: "freelance_os_applications_v1",
  PORTFOLIO: "freelance_os_portfolio_projects_v1",
  AI_SETTINGS: "freelance_os_ai_settings_v1",
  BILLING: "freelance_os_billing_v1",
} as const;

// Helper for safe client-side localStorage access
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

/* =========================================================================
   1. Analyses Service
   ========================================================================= */

export const AnalysesStorage = {
  getAll: (): SavedAnalysis[] => {
    return getFromStorage<SavedAnalysis[]>(STORAGE_KEYS.ANALYSES, []);
  },

  getById: (id: string): SavedAnalysis | undefined => {
    const all = AnalysesStorage.getAll();
    return all.find((item) => item.id === id);
  },

  save: (analysis: SavedAnalysis): void => {
    const all = AnalysesStorage.getAll();
    const existingIndex = all.findIndex((item) => item.id === analysis.id);
    if (existingIndex >= 0) {
      all[existingIndex] = analysis;
    } else {
      all.unshift(analysis);
    }
    saveToStorage(STORAGE_KEYS.ANALYSES, all);
  },

  delete: (id: string): void => {
    const all = AnalysesStorage.getAll();
    const filtered = all.filter((item) => item.id !== id);
    saveToStorage(STORAGE_KEYS.ANALYSES, filtered);
  },
};

/* =========================================================================
   2. Applications Service
   ========================================================================= */

export const ApplicationsStorage = {
  getAll: (): ApplicationItem[] => {
    return getFromStorage<ApplicationItem[]>(STORAGE_KEYS.APPLICATIONS, []);
  },

  getByStage: (stage: ApplicationStage): ApplicationItem[] => {
    const all = ApplicationsStorage.getAll();
    return all.filter((item) => item.stage === stage);
  },

  getById: (id: string): ApplicationItem | undefined => {
    const all = ApplicationsStorage.getAll();
    return all.find((item) => item.id === id);
  },

  save: (app: ApplicationItem): void => {
    const all = ApplicationsStorage.getAll();
    const existingIndex = all.findIndex((item) => item.id === app.id);
    
    // Ensure history array exists
    if (!app.history || app.history.length === 0) {
      app.history = [
        {
          id: "act_init_" + Math.random().toString(36).substring(2, 9),
          toStage: app.stage || "new",
          timestamp: app.createdAt || new Date().toISOString(),
          note: "Project intelligence ingested and recorded",
          actor: "system",
        },
      ];
    }

    if (existingIndex >= 0) {
      all[existingIndex] = {
        ...all[existingIndex],
        ...app,
        updatedAt: new Date().toISOString(),
      };
    } else {
      all.unshift({
        ...app,
        createdAt: app.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    saveToStorage(STORAGE_KEYS.APPLICATIONS, all);

    // Sync to Firestore under authenticated user
    if (typeof window !== "undefined" && auth?.currentUser) {
      try {
        const uid = auth.currentUser.uid;
        const dataDoc = doc(db, "users", uid, "applications", "data");
        setDoc(dataDoc, { items: all, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
        const itemDoc = doc(db, "users", uid, "applications", app.id);
        setDoc(itemDoc, app, { merge: true }).catch(() => {});
      } catch (err) {
        // graceful offline fallback
      }
    }
  },

  transitionStage: (
    id: string,
    newStage: ApplicationStage,
    note?: string
  ): ApplicationItem | null => {
    const all = ApplicationsStorage.getAll();
    const target = all.find((item) => item.id === id);
    if (!target) return null;

    const oldStage = target.stage;
    target.stage = newStage;
    target.lastActivity = `Stage updated to ${newStage.replace("_", " ")} just now`;
    target.updatedAt = new Date().toISOString();

    if (newStage === "applied" && !target.appliedDate) {
      target.appliedDate = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    if (!target.history) {
      target.history = [];
    }

    target.history.push({
      id: "act_" + Math.random().toString(36).substring(2, 10),
      fromStage: oldStage,
      toStage: newStage,
      timestamp: new Date().toISOString(),
      note: note || `Status transitioned from ${oldStage.replace("_", " ")} to ${newStage.replace("_", " ")}`,
      actor: "user",
    });

    saveToStorage(STORAGE_KEYS.APPLICATIONS, all);

    // Sync to Firestore under authenticated user
    if (typeof window !== "undefined" && auth?.currentUser) {
      try {
        const uid = auth.currentUser.uid;
        const dataDoc = doc(db, "users", uid, "applications", "data");
        setDoc(dataDoc, { items: all, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
        const itemDoc = doc(db, "users", uid, "applications", target.id);
        setDoc(itemDoc, target, { merge: true }).catch(() => {});
      } catch (err) {
        // graceful offline fallback
      }
    }

    return target;
  },

  updateStage: (id: string, stage: ApplicationStage): void => {
    ApplicationsStorage.transitionStage(id, stage);
  },

  delete: (id: string): void => {
    const all = ApplicationsStorage.getAll();
    const filtered = all.filter((item) => item.id !== id);
    saveToStorage(STORAGE_KEYS.APPLICATIONS, filtered);
  },
};

/* =========================================================================
   3. Portfolio Projects Service
   ========================================================================= */

export const PortfolioStorage = {
  getAll: (): PortfolioProject[] => {
    return getFromStorage<PortfolioProject[]>(STORAGE_KEYS.PORTFOLIO, []);
  },

  getById: (id: string): PortfolioProject | undefined => {
    const all = PortfolioStorage.getAll();
    return all.find((item) => item.id === id);
  },

  save: (proj: PortfolioProject): void => {
    const all = PortfolioStorage.getAll();
    const existingIndex = all.findIndex((item) => item.id === proj.id);
    if (existingIndex >= 0) {
      all[existingIndex] = proj;
    } else {
      all.unshift(proj);
    }
    saveToStorage(STORAGE_KEYS.PORTFOLIO, all);

    // Sync to Firestore under authenticated user
    if (typeof window !== "undefined" && auth?.currentUser) {
      try {
        const uid = auth.currentUser.uid;
        const portfolioDoc = doc(db, "users", uid, "profile", "portfolio");
        setDoc(portfolioDoc, { projects: all, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
        const singleDoc = doc(db, "users", uid, "portfolio", proj.id);
        setDoc(singleDoc, proj, { merge: true }).catch(() => {});
      } catch (err) {
        // graceful offline fallback
      }
    }
  },

  delete: (id: string): void => {
    const all = PortfolioStorage.getAll();
    const filtered = all.filter((item) => item.id !== id);
    saveToStorage(STORAGE_KEYS.PORTFOLIO, filtered);

    // Sync deletion to Firestore under authenticated user
    if (typeof window !== "undefined" && auth?.currentUser) {
      try {
        const uid = auth.currentUser.uid;
        const portfolioDoc = doc(db, "users", uid, "profile", "portfolio");
        setDoc(portfolioDoc, { projects: filtered, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
      } catch (err) {
        // graceful offline fallback
      }
    }
  },
};

/* =========================================================================
   4. AI & Model Settings Service (Google Gemini BYOK)
   ========================================================================= */

const DEFAULT_AI_SETTINGS: AISettings = {
  defaultModel: "gemini-1-5-pro",
  proposalTone: "consultative",
  riskTolerance: "moderate",
};

export const AISettingsStorage = {
  get: (): AISettings => {
    return getFromStorage<AISettings>(STORAGE_KEYS.AI_SETTINGS, DEFAULT_AI_SETTINGS);
  },

  save: (settings: Partial<AISettings>): AISettings => {
    const current = AISettingsStorage.get();
    const updated = { ...current, ...settings };
    saveToStorage(STORAGE_KEYS.AI_SETTINGS, updated);

    // Safely sync to Firestore under authenticated user
    if (typeof window !== "undefined" && auth?.currentUser) {
      try {
        const uid = auth.currentUser.uid;
        // Store Gemini API key on user root document for direct login hydration
        setDoc(
          doc(db, "users", uid),
          {
            geminiApiKey: updated.geminiApiKey || null,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch(() => {});

        // Store full AI settings in subcollection
        const aiDoc = doc(db, "users", uid, "settings", "ai");
        setDoc(
          aiDoc,
          {
            ...updated,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch(() => {});
      } catch (err) {
        // graceful offline fallback
      }
    }

    return updated;
  },

  clear: (): void => {
    saveToStorage(STORAGE_KEYS.AI_SETTINGS, DEFAULT_AI_SETTINGS);
  },
};

/* =========================================================================
   5. Billing & Quota Service
   ========================================================================= */

const DEFAULT_BILLING_INFO: BillingInfo = {
  plan: "starter",
  status: "active",
  renewalDate: "Free Plan (No Renewal)",
  analysesUsed: 0,
  analysesLimit: 10,
  tokensUsed: 0,
  tokensLimit: 25000,
};

export const BillingStorage = {
  get: (): BillingInfo => {
    const stored = getFromStorage<BillingInfo>(STORAGE_KEYS.BILLING, DEFAULT_BILLING_INFO);
    // Count real analyses used from storage
    const realAnalysesCount = AnalysesStorage.getAll().length;
    return {
      ...stored,
      analysesUsed: realAnalysesCount,
    };
  },

  save: (info: Partial<BillingInfo>): BillingInfo => {
    const current = BillingStorage.get();
    const updated = { ...current, ...info };
    saveToStorage(STORAGE_KEYS.BILLING, updated);
    return updated;
  },
};
