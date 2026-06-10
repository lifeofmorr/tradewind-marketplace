// POST /functions/v1/stripe-portal
// Body: { dealerId? , serviceProviderId?, returnUrl? }  (exactly one id)
// Returns: { url: string } — a Stripe Billing Portal session URL.
//
// Authentication: Required. The caller must own the dealer / service
// provider record, and the record must have a stripe_customer_id (set by
// stripe-webhook when the subscription was first created).
//
// All request handling lives in handler.ts so it can be unit-tested; this
// file only wires the Deno runtime.
//
// Required secrets:
//   STRIPE_SECRET_KEY
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   APP_URL  (e.g. https://gotradewind.com)

import { createPortalHandler } from "./handler.ts";

Deno.serve(createPortalHandler({
  env: (name) => Deno.env.get(name),
  fetchImpl: fetch,
}));
