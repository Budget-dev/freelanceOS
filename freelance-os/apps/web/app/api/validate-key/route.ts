import { NextRequest, NextResponse } from "next/server";

/**
 * @file apps/web/app/api/validate-key/route.ts
 * @description API Key Validation Endpoint for FreelanceOS BYOK
 *
 * Tests the user's own API key (OpenAI, Gemini, or Anthropic)
 * using lightweight, non-generation metadata endpoints.
 * Never logs keys, never constructs arbitrary upstream URLs, and sanitizes all errors.
 */

// Rate limiting: In-memory sliding window (max 15 attempts/minute per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  record.count += 1;
  return record.count > 15;
}

const ALLOWED_PROVIDERS = ["gemini", "openai", "anthropic"] as const;
type AllowedProvider = (typeof ALLOWED_PROVIDERS)[number];

export async function POST(req: NextRequest) {
  try {
    // 1. Abuse Protection / Rate Limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { valid: false, error: "Too many validation attempts. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { apiKey, provider } = body;

    // 2. Strict Input Validation
    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { valid: false, error: "API key is required." },
        { status: 400 }
      );
    }

    const trimmedKey = apiKey.trim();
    if (trimmedKey.length < 8) {
      return NextResponse.json(
        { valid: false, error: "API key is too short to be valid." },
        { status: 400 }
      );
    }

    // 3. Provider Resolution: explicit allowlist is source of truth, fallback to strict prefix check
    let selectedProvider: AllowedProvider | null = null;
    if (typeof provider === "string" && ALLOWED_PROVIDERS.includes(provider as AllowedProvider)) {
      selectedProvider = provider as AllowedProvider;
    } else {
      if (trimmedKey.startsWith("sk-ant-")) {
        selectedProvider = "anthropic";
      } else if (trimmedKey.startsWith("AIza")) {
        selectedProvider = "gemini";
      } else if (trimmedKey.startsWith("sk-")) {
        selectedProvider = "openai";
      }
    }

    if (!selectedProvider) {
      return NextResponse.json(
        {
          valid: false,
          error: "Unrecognized API key format. Expected OpenAI (sk-...), Gemini (AIza...), or Anthropic (sk-ant-...) key.",
        },
        { status: 400 }
      );
    }

    // 4. Provider-Specific Validation with 6s Timeout
    // ── Gemini ─────────────────────────────────────────────────────────────
    if (selectedProvider === "gemini") {
      try {
        const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
          method: "GET",
          headers: {
            "x-goog-api-key": trimmedKey,
          },
          signal: AbortSignal.timeout(6000),
        });

        if (res.ok) {
          return NextResponse.json({
            valid: true,
            provider: "gemini",
            message: "Gemini API key verified successfully.",
          });
        }

        if (res.status === 400 || res.status === 401 || res.status === 403) {
          return NextResponse.json({
            valid: false,
            provider: "gemini",
            error: "Invalid Gemini API key or unauthorized access.",
          });
        }

        if (res.status === 429) {
          return NextResponse.json({
            valid: false,
            provider: "gemini",
            error: "Gemini API rate limit or quota exceeded.",
          });
        }

        return NextResponse.json({
          valid: false,
          provider: "gemini",
          error: "Gemini API key validation failed.",
        });
      } catch {
        return NextResponse.json({
          valid: false,
          provider: "gemini",
          error: "Failed to connect to Gemini API. Please check your network or try again.",
        });
      }
    }

    // ── Anthropic ──────────────────────────────────────────────────────────
    // Checked BEFORE OpenAI to prevent sk-ant-* keys from matching sk-*
    if (selectedProvider === "anthropic") {
      try {
        // Use non-generation models metadata endpoint to avoid spending user credits
        const res = await fetch("https://api.anthropic.com/v1/models", {
          method: "GET",
          headers: {
            "x-api-key": trimmedKey,
            "anthropic-version": "2023-06-01",
          },
          signal: AbortSignal.timeout(6000),
        });

        if (res.ok) {
          return NextResponse.json({
            valid: true,
            provider: "anthropic",
            message: "Anthropic API key verified successfully.",
          });
        }

        if (res.status === 401) {
          return NextResponse.json({
            valid: false,
            provider: "anthropic",
            error: "Invalid Anthropic API key.",
          });
        }

        if (res.status === 402) {
          return NextResponse.json({
            valid: false,
            provider: "anthropic",
            error: "Anthropic account has insufficient credits.",
          });
        }

        if (res.status === 403) {
          return NextResponse.json({
            valid: false,
            provider: "anthropic",
            error: "Anthropic access forbidden or restricted.",
          });
        }

        if (res.status === 429) {
          return NextResponse.json({
            valid: false,
            provider: "anthropic",
            error: "Anthropic API rate limit or quota exceeded.",
          });
        }

        return NextResponse.json({
          valid: false,
          provider: "anthropic",
          error: "Anthropic API key validation failed.",
        });
      } catch {
        return NextResponse.json({
          valid: false,
          provider: "anthropic",
          error: "Failed to connect to Anthropic API. Please check your network or try again.",
        });
      }
    }

    // ── OpenAI ─────────────────────────────────────────────────────────────
    if (selectedProvider === "openai") {
      try {
        const res = await fetch("https://api.openai.com/v1/models", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${trimmedKey}`,
          },
          signal: AbortSignal.timeout(6000),
        });

        if (res.ok) {
          return NextResponse.json({
            valid: true,
            provider: "openai",
            message: "OpenAI API key verified successfully.",
          });
        }

        if (res.status === 401) {
          return NextResponse.json({
            valid: false,
            provider: "openai",
            error: "Invalid OpenAI API key.",
          });
        }

        if (res.status === 429) {
          return NextResponse.json({
            valid: false,
            provider: "openai",
            error: "OpenAI API quota exceeded or rate limit reached.",
          });
        }

        return NextResponse.json({
          valid: false,
          provider: "openai",
          error: "OpenAI API key validation failed.",
        });
      } catch {
        return NextResponse.json({
          valid: false,
          provider: "openai",
          error: "Failed to connect to OpenAI API. Please check your network or try again.",
        });
      }
    }

    return NextResponse.json(
      { valid: false, error: "Unsupported provider." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { valid: false, error: "Validation service error. Please try again." },
      { status: 500 }
    );
  }
}
