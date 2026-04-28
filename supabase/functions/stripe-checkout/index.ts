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
// Required secrets:
//   STRIPE_SECRET_KEY
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

function form(obj: Record<string, string>): string {
  return new URLSearchParams(obj).toString();
}

Deno.serve(async (req: Request) => {
  const pre = handleOptions(req); if (pre) return pre;
  if (req.method !== "POST") return errorResponse("POST only", 405);
  if (!STRIPE_KEY) return errorResponse("STRIPE_SECRET_KEY not configured", 500);

  let body: Body;
  try { body = await req.json() as Body; } catch { return errorResponse("Invalid JSON"); }
  if (!body.kind) return errorResponse("kind required");

  const priceEnv = PRICE_ENV[body.kind];
  if (!priceEnv) return errorResponse(`Unknown kind ${body.kind}`);
  const priceId = Deno.env.get(priceEnv);
  if (!priceId) return errorResponse(`Missing price env ${priceEnv}`, 500);

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
  };
  if (body.listingId) params["metadata[listing_id]"] = body.listingId;
  if (body.dealerId) params["metadata[dealer_id]"] = body.dealerId;
  if (body.serviceProviderId) params["metadata[service_provider_id]"] = body.serviceProviderId;
  if (body.conciergeRequestId) params["metadata[concierge_request_id]"] = body.conciergeRequestId;

  // Per-mode required fields
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
      return errorResponse(`stripe ${r.status}: ${text}`, 502);
    }
    const data = await r.json() as { id: string; url: string };
    return jsonResponse({ url: data.url, id: data.id });
  } catch (e) {
    return errorResponse((e as Error).message, 500);
  }
});
