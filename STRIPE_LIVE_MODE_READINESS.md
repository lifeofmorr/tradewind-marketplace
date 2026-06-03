# Stripe Live-Mode Readiness

**Status:** Gate implemented. Live charges are **OFF** until `STRIPE_MODE=live` is
set on both the frontend and the edge functions *and* the live-readiness page is
all-green.

This doc is the go/no-go runbook for turning on real Stripe charges.

---

## How the gate works

There are two independent layers, both fail-closed:

### 1. Server gate (authoritative) — `supabase/functions/_shared/stripe-mode.ts`
Every Stripe-touching edge function evaluates the environment before doing any
Stripe work. `stripe-checkout` calls `stripeReadinessFromEnv()` and returns
`503` (no Stripe API call made) when:

- `STRIPE_MODE=live` but `STRIPE_SECRET_KEY` is not `sk_live_…` / `rk_live_…`
- `STRIPE_MODE=live` but any of the 7 `STRIPE_PRICE_*` secrets is missing
- the secret-key prefix doesn't match the mode (a test key in live mode, or a
  live key in test mode — **no test/live mixing**)
- `STRIPE_SECRET_KEY` is unset

`STRIPE_MODE` defaults to `test`. **Live mode is opt-in and never a fallback.**

The response only ever includes env-var **names** (`missing[]`), never secret
values.

### 2. Client mirror — `src/lib/stripeMode.ts`
The browser only sees public values (publishable key + price IDs). The mirror
runs the same checks on those so the UI can show the mode, block "Pay" when live
is half-configured, and drive the readiness dashboard. It cannot see the secret
key, so the server gate remains authoritative.

### 3. Admin surfaces
- **Stripe-mode banner** (`src/components/admin/StripeModeBanner.tsx`) — shown on
  `/admin/payments`. Red if config is broken, amber for healthy live, slate for test.
- **`/admin/payments/live-readiness`** — full checklist for both the browser
  config (public) and the server secrets (via the admin-only `stripe-readiness`
  edge function). Shows a single go/no-go verdict.

---

## Required configuration

### Frontend (Vercel → Production)
| Var | Test value | Live value |
|-----|-----------|-----------|
| `VITE_STRIPE_MODE` | `test` | `live` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` | `pk_live_…` |
| `VITE_STRIPE_PRICE_FEATURED_LISTING` | test price | live price |
| `VITE_STRIPE_PRICE_BOOST_LISTING` | test price | live price |
| `VITE_STRIPE_PRICE_DEALER_STARTER` | test price | live price |
| `VITE_STRIPE_PRICE_DEALER_PRO` | test price | live price |
| `VITE_STRIPE_PRICE_DEALER_PREMIER` | test price | live price |
| `VITE_STRIPE_PRICE_SERVICE_PROVIDER` | test price | live price |
| `VITE_STRIPE_PRICE_CONCIERGE` | test price | live price |

### Edge functions (Supabase Function Secrets)
| Secret | Notes |
|--------|-------|
| `STRIPE_MODE` | `test` or `live` — must match `VITE_STRIPE_MODE` |
| `STRIPE_SECRET_KEY` | `sk_live_…` in live mode |
| `STRIPE_WEBHOOK_SECRET` | from the **Live** mode webhook endpoint |
| `STRIPE_PRICE_*` (×7) | the live `price_…` IDs |

---

## Go-live procedure

1. **Recreate SKUs in Live mode.** In the Stripe Dashboard (Live), recreate the
   7 products/prices. Copy each `price_…` ID.
2. **Set frontend vars** in Vercel Production: the `pk_live_…` key, the 7 live
   price IDs, and `VITE_STRIPE_MODE=live`.
3. **Set edge secrets** in Supabase:
   ```
   supabase secrets set --project-ref qwaotydaazymgnvnfuuj \
     STRIPE_MODE=live STRIPE_SECRET_KEY=sk_live_... STRIPE_WEBHOOK_SECRET=whsec_live_... \
     STRIPE_PRICE_FEATURED_LISTING=price_... STRIPE_PRICE_BOOST_LISTING=price_... \
     STRIPE_PRICE_DEALER_STARTER=price_... STRIPE_PRICE_DEALER_PRO=price_... \
     STRIPE_PRICE_DEALER_PREMIER=price_... STRIPE_PRICE_SERVICE_PROVIDER=price_... \
     STRIPE_PRICE_CONCIERGE=price_...
   ```
4. **Register the Live webhook** in Stripe → Developers → Webhooks, pointing at
   the `stripe-webhook` function URL, and copy its signing secret into
   `STRIPE_WEBHOOK_SECRET`.
5. **Re-deploy** the frontend and edge functions.
6. **Verify** `/admin/payments/live-readiness` is all-green (both panels) and the
   verdict reads "Ready for live charges."
7. **Smoke test** one real low-value purchase end-to-end, confirm the webhook
   recorded the payment, then refund it.

## Rollback

Set `STRIPE_MODE=test` (Supabase) and `VITE_STRIPE_MODE=test` (Vercel) and
re-deploy. Checkout immediately stops taking live charges. No code change needed.

## What is intentionally NOT automated

- This change does **not** enable live charges. It only adds the gate + the
  visibility to do so safely.
- Switching to live is a deliberate human step (set the two `*_MODE` vars).
