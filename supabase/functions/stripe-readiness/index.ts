// GET /functions/v1/stripe-readiness
//
// Admin-only. Returns the live/test readiness of the server-side Stripe
// configuration so the /admin/payments/live-readiness dashboard can show
// the current mode and any missing config — WITHOUT ever exposing secret
// values. Only env-var NAMES (never values) are returned.
//
// Auth: requires an authenticated caller whose profiles.role = 'admin'.
//
// All request handling lives in handler.ts so it can be unit-tested; this
// file only wires the Deno runtime.
//
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (for the role
// check), plus the Stripe secrets being evaluated.

import { createReadinessHandler } from "./handler.ts";

Deno.serve(createReadinessHandler({
  env: (name) => Deno.env.get(name),
  fetchImpl: fetch,
}));
