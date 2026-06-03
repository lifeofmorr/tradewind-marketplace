// Rate-limit middleware for edge functions.
//
// Protects the AI + outreach functions from abuse and runaway LLM cost. Backed
// by the public.edge_rate_limits table + edge_rate_limit_hit() RPC
// (see supabase/migrations/20260603_edge_rate_limits.sql).
//
// Limits (per the production blocker spec):
//   public   — 5  / 10 min / IP        (unauthenticated callers)
//   auth     — 20 / hour  / user       (authenticated callers)
//   admin    — 100 / hour / user       (admin callers)
//   outreach — 25 / day   / user       (cold-outreach generation/scaling)
//
// Fail-open contract: if the limiter backend is unreachable or unconfigured
// (no SUPABASE_URL / SERVICE_ROLE_KEY, RPC error), the request is ALLOWED and a
// warning is logged. Rationale: a limiter outage must not take down every AI
// feature. The limiter is a cost/abuse guard, not an auth control — auth is
// enforced separately. This is called out in AI_RATE_LIMITING.md.

import { getAuthedUser } from "./auth.ts";
import { buildCorsHeaders } from "./cors.ts";

export type RateScope = "public" | "auth" | "admin" | "outreach";

export interface RateRule {
  limit: number;
  windowSeconds: number;
}

export const RATE_LIMITS: Record<RateScope, RateRule> = {
  public: { limit: 5, windowSeconds: 10 * 60 },
  auth: { limit: 20, windowSeconds: 60 * 60 },
  admin: { limit: 100, windowSeconds: 60 * 60 },
  outreach: { limit: 25, windowSeconds: 24 * 60 * 60 },
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

/** Best-effort client IP from common proxy headers. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

export interface RateResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
  scope: RateScope;
  /** True when the limiter backend could not be consulted (fail-open). */
  degraded: boolean;
}

/**
 * Consult the limiter for an explicit bucket. Pure-ish wrapper around the RPC;
 * fails open (allowed=true, degraded=true) on any backend problem.
 */
export async function checkRateLimit(
  bucketKey: string,
  scope: RateScope,
): Promise<RateResult> {
  const rule = RATE_LIMITS[scope];
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.warn("[rate-limit] SUPABASE_URL/SERVICE_ROLE_KEY unset — failing open");
    return { allowed: true, remaining: rule.limit, retryAfter: 0, scope, degraded: true };
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/edge_rate_limit_hit`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_key: bucketKey,
        p_limit: rule.limit,
        p_window_seconds: rule.windowSeconds,
      }),
    });
    if (!res.ok) {
      console.warn(`[rate-limit] RPC ${res.status} — failing open`);
      return { allowed: true, remaining: rule.limit, retryAfter: 0, scope, degraded: true };
    }
    // The RPC returns a single-row table → PostgREST yields an array of one row.
    const rows = (await res.json()) as Array<{ allowed: boolean; remaining: number; retry_after: number }>;
    const row = Array.isArray(rows) ? rows[0] : (rows as unknown as { allowed: boolean; remaining: number; retry_after: number });
    if (!row) return { allowed: true, remaining: rule.limit, retryAfter: 0, scope, degraded: true };
    return {
      allowed: row.allowed,
      remaining: row.remaining ?? 0,
      retryAfter: row.retry_after ?? rule.windowSeconds,
      scope,
      degraded: false,
    };
  } catch (e) {
    console.warn(`[rate-limit] backend error — failing open: ${(e as Error).message}`);
    return { allowed: true, remaining: rule.limit, retryAfter: 0, scope, degraded: true };
  }
}

/** 429 response with Retry-After + standard rate-limit headers. */
export function tooManyRequests(req: Request, r: RateResult): Response {
  const headers = buildCorsHeaders(req);
  headers["Content-Type"] = "application/json";
  headers["Retry-After"] = String(r.retryAfter);
  headers["X-RateLimit-Limit"] = String(RATE_LIMITS[r.scope].limit);
  headers["X-RateLimit-Remaining"] = String(r.remaining);
  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded. Please slow down and try again shortly.",
      scope: r.scope,
      retry_after_seconds: r.retryAfter,
    }),
    { status: 429, headers },
  );
}

/**
 * Enforce a rate limit for an AI endpoint. Identity is derived automatically:
 * an authenticated caller is limited per-user (auth scope, or admin scope when
 * `adminScope` is true and the caller is authenticated); anonymous callers are
 * limited per-IP (public scope).
 *
 * Returns a 429 Response when the caller is over the limit, or null when the
 * request may proceed. Call this right after the method check, before any LLM
 * work.
 */
export async function enforceAiRateLimit(
  req: Request,
  functionName: string,
  opts: { adminScope?: boolean } = {},
): Promise<Response | null> {
  const user = await getAuthedUser(req);
  let scope: RateScope;
  let identifier: string;
  if (user) {
    scope = opts.adminScope ? "admin" : "auth";
    identifier = user.id;
  } else {
    scope = "public";
    identifier = clientIp(req);
  }
  const result = await checkRateLimit(`${functionName}:${scope}:${identifier}`, scope);
  return result.allowed ? null : tooManyRequests(req, result);
}

/**
 * Enforce the outreach budget (25/day). Keyed per authenticated user, falling
 * back to IP for service-role/unauthenticated callers (still bounded as one
 * global-ish bucket per source). Use on cold-outreach generation + scaling.
 */
export async function enforceOutreachRateLimit(
  req: Request,
  functionName: string,
): Promise<Response | null> {
  const user = await getAuthedUser(req);
  const identifier = user ? user.id : clientIp(req);
  const result = await checkRateLimit(`${functionName}:outreach:${identifier}`, "outreach");
  return result.allowed ? null : tooManyRequests(req, result);
}
