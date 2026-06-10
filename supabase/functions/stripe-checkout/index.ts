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
// All request handling lives in handler.ts so it can be unit-tested; this
// file only wires the Deno runtime.
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

import { createCheckoutHandler } from "./handler.ts";

Deno.serve(createCheckoutHandler({
  env: (name) => Deno.env.get(name),
  fetchImpl: fetch,
}));
