# Payment Live Mode Checklist

> Transition from Stripe test mode to live payment processing.

---

## Current State

**Stripe test mode is active.** The publishable key in `.env.local` is `pk_test_51TRE7i...`. All 7 price IDs are test-mode prices (`price_1TRPT...`).

### Payment Types (7 products)

| Kind                | Type         | Description                        |
| ------------------- | ------------ | ---------------------------------- |
| `featured_listing`  | One-time     | Feature a listing for 30 days      |
| `boost_listing`     | One-time     | Boost a listing for 7 days         |
| `dealer_starter`    | Subscription | Dealer Starter tier                |
| `dealer_pro`        | Subscription | Dealer Pro tier                    |
| `dealer_premier`    | Subscription | Dealer Premier tier                |
| `service_pro`       | Subscription | Service Provider Pro tier          |
| `concierge`         | One-time     | Concierge buying service           |

### Checkout Flow

```
Client: startCheckout({ kind, listingId?, ... })
  → src/lib/stripe.ts calls supabase.functions.invoke("stripe-checkout")
    → Edge Function: validates JWT, checks ownership, looks up price ID from env
      → Stripe API: creates Checkout Session
    ← Returns { url, id }
  → Client redirects to Stripe hosted checkout
    → Success: /checkout/success?session_id={CHECKOUT_SESSION_ID}
    → Cancel: /checkout/cancel
  → Stripe webhook → stripe-webhook edge function
    → Upserts payment record, updates subscription/featured status
```

### Edge Functions

- **`stripe-checkout`** (`supabase/functions/stripe-checkout/index.ts`) — Creates Checkout Sessions. Requires auth. Validates caller owns any listing/dealer/provider passed as metadata. Uses `STRIPE_SECRET_KEY` (server-side only).
- **`stripe-webhook`** (`supabase/functions/stripe-webhook/index.ts`) — Receives Stripe events. Deployed with `--no-verify-jwt`. Verifies Stripe signature via HMAC-SHA256 with timing-safe comparison. Handles: `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `charge.refunded`. Deduplicates via `webhook_events` table (unique constraint on event ID).

---

## Test Mode Verification Checklist

Complete these before even considering live mode:

- [ ] All 7 price IDs resolve in Stripe test dashboard
  - `STRIPE_PRICE_FEATURED_LISTING`
  - `STRIPE_PRICE_BOOST_LISTING`
  - `STRIPE_PRICE_DEALER_STARTER`
  - `STRIPE_PRICE_DEALER_PRO`
  - `STRIPE_PRICE_DEALER_PREMIER`
  - `STRIPE_PRICE_SERVICE_PROVIDER`
  - `STRIPE_PRICE_CONCIERGE`
- [ ] Checkout flow completes for each product type (use Stripe test card `4242 4242 4242 4242`)
- [ ] Success page (`/checkout/success`) displays correct confirmation with session ID
- [ ] Cancel page (`/checkout/cancel`) allows retry without losing context
- [ ] Webhook processes `checkout.session.completed` events correctly
- [ ] Webhook processes `customer.subscription.created` and `customer.subscription.updated` correctly
- [ ] Webhook processes `charge.refunded` correctly
- [ ] Payment records created in `payments` table with correct `amount_cents`, `status`, `stripe_session_id`
- [ ] Subscription records upserted in `subscriptions` table with correct tier and status
- [ ] Featured/boost listings updated — `is_featured`, `featured_until`, `boost_until` set correctly
- [ ] Concierge requests marked `paid = true` on payment
- [ ] Dealer/provider `subscription_tier` and `subscription_status` mirrored on entity tables
- [ ] Admin payment dashboard shows transactions
- [ ] Webhook deduplication works (re-sending an event ID returns `{ received: true, deduped: true }`)
- [ ] Ownership validation blocks checkout for resources the caller does not own (returns 403)
- [ ] Email notifications fire on featured listing purchase and concierge payment

---

## Live Mode Activation Checklist

### Stripe Account Setup
- [ ] Stripe account fully verified (identity verification, business details)
- [ ] Bank account connected for payouts
- [ ] Tax information submitted (W-9 / W-8BEN)
- [ ] Business name and support info configured in Stripe dashboard

### Live Products and Prices
- [ ] Create all 7 products in Stripe **live mode** matching test products
- [ ] Record live price IDs for each:
  - `STRIPE_PRICE_FEATURED_LISTING` = `price_live_...`
  - `STRIPE_PRICE_BOOST_LISTING` = `price_live_...`
  - `STRIPE_PRICE_DEALER_STARTER` = `price_live_...`
  - `STRIPE_PRICE_DEALER_PRO` = `price_live_...`
  - `STRIPE_PRICE_DEALER_PREMIER` = `price_live_...`
  - `STRIPE_PRICE_SERVICE_PROVIDER` = `price_live_...`
  - `STRIPE_PRICE_CONCIERGE` = `price_live_...`
- [ ] Verify product names, descriptions, and amounts match the pricing page (`PRICING.md`)

### Environment Variables (Vercel)
- [ ] Set `VITE_STRIPE_PUBLISHABLE_KEY` to `pk_live_*` in Vercel production env vars
- [ ] Set all 7 `VITE_STRIPE_PRICE_*` vars to live price IDs in Vercel production env vars
- [ ] Set `STRIPE_SECRET_KEY` to `sk_live_*` in Supabase Edge Function secrets
- [ ] Set `STRIPE_WEBHOOK_SECRET` to the live webhook signing secret in Supabase Edge Function secrets
- [ ] Set all 7 `STRIPE_PRICE_*` vars (server-side, used by stripe-checkout edge function) to live price IDs
- [ ] Keep test-mode values in staging/development environments (see `.env.staging.example`)

### Webhook Configuration
- [ ] Create a new webhook endpoint in Stripe **live mode** dashboard
- [ ] Endpoint URL: `https://<SUPABASE_PROJECT_REF>.supabase.co/functions/v1/stripe-webhook`
- [ ] Subscribe to events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`
- [ ] Copy the live webhook signing secret to `STRIPE_WEBHOOK_SECRET`
- [ ] Webhook signature verification is IMPLEMENTED — the `stripe-webhook` edge function performs HMAC-SHA256 verification with timing-safe comparison before processing any event

### URLs and Redirects
- [ ] `APP_URL` env var in edge functions set to production domain (currently defaults to `https://gotradewind.com`)
- [ ] Success URL resolves: `{APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
- [ ] Cancel URL resolves: `{APP_URL}/checkout/cancel`
- [ ] Client-side `successUrl` / `cancelUrl` overrides in `startCheckout()` use `window.location.origin`, which will be the production domain on Vercel

### Subscription Lifecycle
- [ ] Test subscription creation (trial start)
- [ ] Test subscription activation (trial end, card charged)
- [ ] Test subscription cancellation (`cancel_at_period_end` flow)
- [ ] Test subscription reactivation
- [ ] Test past-due and failed payment handling
- [ ] Verify `subscriptions` table status mirrors Stripe state
- [ ] Verify dealer/provider entity tables mirror subscription status

### Tax and Compliance
- [ ] Tax collection configured per jurisdiction requirements (Stripe Tax or manual setup)
- [ ] Receipt emails configured in Stripe dashboard settings
- [ ] PCI compliance confirmed — Stripe Checkout handles all card data; TradeWind frontend never sees raw card numbers; `payments` table stores only Stripe payment intent IDs and session IDs

### Policies
- [ ] Refund policy documented and linked from checkout flow
- [ ] Dispute/chargeback handling process documented
- [ ] Subscription cancellation policy documented

---

## Things NOT to Claim Until Live

These are things the marketing site, beta materials, and UI copy must NOT promise until the corresponding capability is verified in production:

1. **Do not promise live payment processing** until Stripe live mode keys are deployed and a real transaction completes end-to-end.

2. **Do not claim escrow services.** TradeWind does not currently operate an escrow service. The `aircraft_escrow` service category exists for third-party escrow provider listings, not a platform-operated escrow. Payments go directly to TradeWind (for features/subscriptions), not into escrow between buyer and seller.

3. **Do not claim instant refunds.** Refunds are a manual process via the Stripe dashboard. The webhook handles `charge.refunded` events and updates the `payments` table status to `refunded`, but refund initiation is manual.

4. **Do not claim automatic subscription downgrades.** The `customer.subscription.deleted` handler sets status to `canceled`, but does not automatically downgrade features or remove access — that cleanup is not yet implemented.

5. **Do not claim real-time payment notifications to sellers.** Email notifications fire for featured listing purchases and concierge payments, but there is no real-time in-app payment notification to sellers when a buyer pays for something.

---

## Environment File Reference

| File                       | Purpose                          | Stripe key prefix |
| -------------------------- | -------------------------------- | ----------------- |
| `.env.local`               | Local development                | `pk_test_*`       |
| `.env.local.example`       | Template for local dev           | `pk_test_xxx`     |
| `.env.staging.example`     | Template for staging deployment  | `pk_test_xxx`     |
| `.env.production.example`  | Template for production          | `pk_live_xxx`     |

Server-side secrets (never in VITE_* vars):
- `STRIPE_SECRET_KEY` — Supabase Edge Function secret
- `STRIPE_WEBHOOK_SECRET` — Supabase Edge Function secret
- `STRIPE_PRICE_*` (7 vars) — Supabase Edge Function secrets (duplicated from VITE_ for server-side use)
