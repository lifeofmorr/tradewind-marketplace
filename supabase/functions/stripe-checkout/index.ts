// POST /functions/v1/stripe-checkout
// Body: {
//   kind: "featured_listing"|"boost_listing"|"dealer_starter"|"dealer_pro"|
//         "dealer_premier"|"service_pro"|"concierge",
//   listingId?, dealerId?, serviceProviderId?, conciergeRequestId?,
//   successUrl?, cancelUrl?
// }
// Returns: { url: string }
//
// Looks up the price ID from env, creates a one-shot Checkout Session for
// one-off charges or a subscription for tiered SKUs.
//
// Authentication: Required. The caller must be a signed-in user; the JWT
// is verified via Supabase Auth. The function then verifies that any
// supplied listingId / dealerId / serviceProviderId is owned by the caller
// before passing it as Stripe metadata.
//
// Required secrets:
//   STRIPE_SECRET_KEY
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   STRIPE_PRICE_FEATURED_LISTING
//   STRIPE_PRICE_BOOST_LISTING
//   STRIPE_PRICE_DEALER_STARTER
//   STRIPE_PRICE_DEALER_PRO
//   STRIPE_PRICE_DEALER_PREMIER
//   STRIPE_PRICE_SERVICE_PROVIDER
//   STRIPE_PRICE_CONCIERGE
//   APP_URL  (e.g. https://gotradewind.com)

import { handleOptions, jsonResponse, errorResponse } from "../_shared/cors.ts";

type Kind =
  | "featured_listing" | "boost_listing"
  | "dealer_starter" | "dealer_pro" | "dealer_premier"
  | "service_pro" | "concierge";

interface Body {
  kind: Kind;
  listingId?: string;
  dealerId?: string;
  serviceProviderId?: string;
  conciergeRequestId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

const PRICE_ENV: Record<Kind, string> = {
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

const STRIPE_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const APP_URL = Deno.env.get("APP_URL") ?? "https://gotradewind.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const URL_RE = /^https?:\/\/[^\s]+$/;

function form(obj: Record<string, string>): string {
  return new URLSearchParams(obj).toString();
}

interface AuthUser { id: string; email?: string }

async function getCallingUser(req: Request): Promise<AuthUser | null> {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.toLowerCase().startsWith("bearer ")) return null;
  const token = auth.slice(7).trim();
  if (!token || !SUPABASE_URL) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: SERVICE_KEY },
  });
  if (!r.ok) return null;
  const data = await r.json() as { id?: string; email?: string };
  return data.id ? { id: data.id, email: data.email } : null;
}

async function adminGet<T>(path: string): Promise<T[] | null> {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!r.ok) return null;
  return await r.json() as T[];
}

async function userOwnsListing(userId: string, listingId: string): Promise<boolean> {
  const rows = await adminGet<{ seller_id: string }>(`listings?id=eq.${listingId}&select=seller_id`);
  return !!rows && rows.length > 0 && rows[0].seller_id === userId;
}

async function userOwnsDealer(userId: string, dealerId: string): Promise<boolean> {
  const rows = await adminGet<{ owner_id: string }>(`dealers?id=eq.${dealerId}&select=owner_id`);
  return !!rows && rows.length > 0 && rows[0].owner_id === userId;
}

async function userOwnsServiceProvider(userId: string, spId: string): Promise<boolean> {
  const rows = await adminGet<{ owner_id: string }>(`service_providers?id=eq.${spId}&select=owner_id`);
  return !!rows && rows.length > 0 && rows[0].owner_id === userId;
}

async function userOwnsConciergeRequest(userId: string, reqId: string): Promise<boolean> {
  const rows = await adminGet<{ user_id: string }>(`concierge_requests?id=eq.${reqId}&select=user_id`);
  return !!rows && rows.length > 0 && rows[0].user_id === userId;
}

Deno.serve(async (req: Request) => {
  const pre = handleOptions(req); if (pre) return pre;
  if (req.method !== "POST") return errorResponse("POST only", 405, req);
  if (!STRIPE_KEY) return errorResponse("STRIPE_SECRET_KEY not configured", 500, req);

  const user = await getCallingUser(req);
  if (!user) return errorResponse("authentication required", 401, req);

  let body: Body;
  try { body = await req.json() as Body; } catch { return errorResponse("Invalid JSON", 400, req); }
  if (!body.kind) return errorResponse("kind required", 400, req);

  const priceEnv = PRICE_ENV[body.kind];
  if (!priceEnv) return errorResponse(`Unknown kind ${body.kind}`, 400, req);
  const priceId = Deno.env.get(priceEnv);
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
  if (body.listingId && !(await userOwnsListing(user.id, body.listingId))) {
    return errorResponse("not authorized for listing", 403, req);
  }
  if (body.dealerId && !(await userOwnsDealer(user.id, body.dealerId))) {
    return errorResponse("not authorized for dealer", 403, req);
  }
  if (body.serviceProviderId && !(await userOwnsServiceProvider(user.id, body.serviceProviderId))) {
    return errorResponse("not authorized for service provider", 403, req);
  }
  if (body.conciergeRequestId && !(await userOwnsConciergeRequest(user.id, body.conciergeRequestId))) {
    return errorResponse("not authorized for concierge request", 403, req);
  }

  const successUrl = body.successUrl ?? `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = body.cancelUrl ?? `${APP_URL}/checkout/cancel`;

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
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form(params),
    });
    if (!r.ok) {
      const text = await r.text();
      return errorResponse(`stripe ${r.status}: ${text}`, 502, req);
    }
    const data = await r.json() as { id: string; url: string };
    return jsonResponse({ url: data.url, id: data.id }, 200, req);
  } catch (e) {
    return errorResponse((e as Error).message, 500, req);
  }
});
