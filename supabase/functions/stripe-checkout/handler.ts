// Stripe checkout request handling, separated from the Deno entrypoint so it
// can be unit-tested (vitest) with fake env + fetch. index.ts wires this to
// Deno.serve with the real environment.

import { handleOptions, jsonResponse, errorResponse } from "../_shared/cors.ts";
import {
  evaluateStripeReadiness,
  STRIPE_PRICE_ENVS,
  type StripeReadiness,
} from "../_shared/stripe-mode.ts";

export type Kind =
  | "featured_listing" | "boost_listing"
  | "dealer_starter" | "dealer_pro" | "dealer_premier"
  | "service_pro" | "concierge";

export interface CheckoutBody {
  kind: Kind;
  listingId?: string;
  dealerId?: string;
  serviceProviderId?: string;
  conciergeRequestId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export const PRICE_ENV: Record<Kind, string> = {
  featured_listing: "STRIPE_PRICE_FEATURED_LISTING",
  boost_listing:    "STRIPE_PRICE_BOOST_LISTING",
  dealer_starter:   "STRIPE_PRICE_DEALER_STARTER",
  dealer_pro:       "STRIPE_PRICE_DEALER_PRO",
  dealer_premier:   "STRIPE_PRICE_DEALER_PREMIER",
  service_pro:      "STRIPE_PRICE_SERVICE_PROVIDER",
  concierge:        "STRIPE_PRICE_CONCIERGE",
};

const SUBSCRIPTION_KINDS: Set<Kind> = new Set([
  "dealer_starter", "dealer_pro", "dealer_premier", "service_pro",
]);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const URL_RE = /^https?:\/\/[^\s]+$/;

export interface CheckoutDeps {
  env: (name: string) => string | undefined;
  fetchImpl: typeof fetch;
}

function form(obj: Record<string, string>): string {
  return new URLSearchParams(obj).toString();
}

interface AuthUser { id: string; email?: string }

export function readinessFromEnv(env: CheckoutDeps["env"]): StripeReadiness {
  const priceIds: Record<string, string | undefined> = {};
  for (const name of STRIPE_PRICE_ENVS) priceIds[name] = env(name);
  return evaluateStripeReadiness({
    mode: env("STRIPE_MODE"),
    secretKey: env("STRIPE_SECRET_KEY"),
    priceIds,
  });
}

async function getCallingUser(req: Request, deps: CheckoutDeps): Promise<AuthUser | null> {
  const supabaseUrl = deps.env("SUPABASE_URL") ?? "";
  const serviceKey = deps.env("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.toLowerCase().startsWith("bearer ")) return null;
  const token = auth.slice(7).trim();
  if (!token || !supabaseUrl) return null;
  const r = await deps.fetchImpl(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: serviceKey },
  });
  if (!r.ok) return null;
  const data = await r.json() as { id?: string; email?: string };
  return data.id ? { id: data.id, email: data.email } : null;
}

async function adminGet<T>(path: string, deps: CheckoutDeps): Promise<T[] | null> {
  const supabaseUrl = deps.env("SUPABASE_URL") ?? "";
  const serviceKey = deps.env("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) return null;
  const r = await deps.fetchImpl(`${supabaseUrl}/rest/v1/${path}`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!r.ok) return null;
  return await r.json() as T[];
}

async function userOwnsListing(userId: string, listingId: string, deps: CheckoutDeps): Promise<boolean> {
  const rows = await adminGet<{ seller_id: string }>(`listings?id=eq.${listingId}&select=seller_id`, deps);
  return !!rows && rows.length > 0 && rows[0].seller_id === userId;
}

async function userOwnsDealer(userId: string, dealerId: string, deps: CheckoutDeps): Promise<boolean> {
  const rows = await adminGet<{ owner_id: string }>(`dealers?id=eq.${dealerId}&select=owner_id`, deps);
  return !!rows && rows.length > 0 && rows[0].owner_id === userId;
}

async function userOwnsServiceProvider(userId: string, spId: string, deps: CheckoutDeps): Promise<boolean> {
  const rows = await adminGet<{ owner_id: string }>(`service_providers?id=eq.${spId}&select=owner_id`, deps);
  return !!rows && rows.length > 0 && rows[0].owner_id === userId;
}

async function userOwnsConciergeRequest(userId: string, reqId: string, deps: CheckoutDeps): Promise<boolean> {
  const rows = await adminGet<{ user_id: string }>(`concierge_requests?id=eq.${reqId}&select=user_id`, deps);
  return !!rows && rows.length > 0 && rows[0].user_id === userId;
}

export function createCheckoutHandler(deps: CheckoutDeps): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    const pre = handleOptions(req); if (pre) return pre;
    if (req.method !== "POST") return errorResponse("POST only", 405, req);

    // Fail-closed Stripe environment gate. Refuses to proceed if live mode is
    // enabled but live keys/price IDs are missing, or if the secret-key prefix
    // does not match STRIPE_MODE (no test/live mixing). Returns a safe message —
    // never leaks which secret is wrong beyond its env-var name.
    const readiness = readinessFromEnv(deps.env);
    if (!readiness.ok) {
      return jsonResponse(
        {
          error: readiness.mode === "live"
            ? "Payments are not available: live mode is enabled but not fully configured."
            : "Payments are temporarily unavailable.",
          stripe_mode: readiness.mode,
          // missing[] is just env-var NAMES, never values — safe to surface to admins.
          missing: readiness.missing,
        },
        503,
        req,
      );
    }

    const user = await getCallingUser(req, deps);
    if (!user) return errorResponse("authentication required", 401, req);

    let body: CheckoutBody;
    try { body = await req.json() as CheckoutBody; } catch { return errorResponse("Invalid JSON", 400, req); }
    if (!body.kind) return errorResponse("kind required", 400, req);

    const priceEnv = PRICE_ENV[body.kind];
    if (!priceEnv) return errorResponse(`Unknown kind ${body.kind}`, 400, req);
    const priceId = deps.env(priceEnv);
    if (!priceId) return errorResponse(`Missing price env ${priceEnv}`, 500, req);

    // Validate optional ids look like UUIDs
    for (const id of [body.listingId, body.dealerId, body.serviceProviderId, body.conciergeRequestId]) {
      if (id != null && !UUID_RE.test(id)) return errorResponse("invalid id format", 400, req);
    }

    // Validate optional urls
    for (const u of [body.successUrl, body.cancelUrl]) {
      if (u != null && !URL_RE.test(u)) return errorResponse("invalid url", 400, req);
    }

    // Ownership checks — caller must own any resource passed as metadata
    if (body.listingId && !(await userOwnsListing(user.id, body.listingId, deps))) {
      return errorResponse("not authorized for listing", 403, req);
    }
    if (body.dealerId && !(await userOwnsDealer(user.id, body.dealerId, deps))) {
      return errorResponse("not authorized for dealer", 403, req);
    }
    if (body.serviceProviderId && !(await userOwnsServiceProvider(user.id, body.serviceProviderId, deps))) {
      return errorResponse("not authorized for service provider", 403, req);
    }
    if (body.conciergeRequestId && !(await userOwnsConciergeRequest(user.id, body.conciergeRequestId, deps))) {
      return errorResponse("not authorized for concierge request", 403, req);
    }

    const appUrl = deps.env("APP_URL") ?? "https://gotradewind.com";
    const successUrl = body.successUrl ?? `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = body.cancelUrl ?? `${appUrl}/checkout/cancel`;

    const isSubscription = SUBSCRIPTION_KINDS.has(body.kind);

    const params: Record<string, string> = {
      mode: isSubscription ? "subscription" : "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      "metadata[kind]": body.kind,
      "metadata[user_id]": user.id,
    };
    if (user.email) params["customer_email"] = user.email;
    if (body.listingId) params["metadata[listing_id]"] = body.listingId;
    if (body.dealerId) params["metadata[dealer_id]"] = body.dealerId;
    if (body.serviceProviderId) params["metadata[service_provider_id]"] = body.serviceProviderId;
    if (body.conciergeRequestId) params["metadata[concierge_request_id]"] = body.conciergeRequestId;

    if (isSubscription) params["allow_promotion_codes"] = "true";

    try {
      const r = await deps.fetchImpl("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${deps.env("STRIPE_SECRET_KEY") ?? ""}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form(params),
      });
      if (!r.ok) {
        // Log details server-side only; Stripe error bodies can describe internal config.
        console.error("[stripe-checkout] stripe error", r.status, await r.text());
        return errorResponse("Payment service error — please try again.", 502, req);
      }
      const data = await r.json() as { id: string; url: string };
      return jsonResponse({ url: data.url, id: data.id }, 200, req);
    } catch (e) {
      return errorResponse((e as Error).message, 500, req);
    }
  };
}
