# Payment Production Audit — TradeWind (Phase 5)

**Date:** 2026-06-03

## Verdict: Code is PRODUCTION-GRADE. Configuration is STRIPE TEST MODE ONLY. Cannot take real money until live keys + QA. This is the single biggest blocker to "live business."

## Checkout (`supabase/functions/stripe-checkout/index.ts`)
- JWT-verified via `/auth/v1/user` (`:76-87`); returns 401 if absent (`:124`).
- **Ownership enforced** before checkout: caller must own the listing/dealer/provider (`:145-157`) — prevents paying against someone else's resource.
- Prices read from env price IDs via `PRICE_ENV` map (`:48-56`) — **not hardcoded**, so live migration is config-only.

## Webhook (`supabase/functions/stripe-webhook/index.ts`)
- **Signature verification:** HMAC-SHA256, timing-safe (`:45-71`). ✅
- **Idempotency:** `webhook_events(id PK)` dedupe; duplicate event → 200 `deduped:true` (`:247-262`, table `20260429_completion.sql:17-21`). ✅
- Handles `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `charge.refunded` (`:81-227`). Note: `charge.refunded` and `subscription.deleted` ARE implemented despite older docs calling them TODO.
- Writes via service-role (correct for unauthenticated webhook). Stores only Stripe IDs + metadata; **no raw card data** (Stripe Checkout handles PCI scope).

## Pricing (`PRICING.md`, `.env.local`)
| Kind | Type | Price |
|---|---|---|
| featured_listing | one-off | $79 |
| boost_listing | one-off | $29 |
| dealer_starter / pro / premier | sub | $149 / $499 / $1,499 mo |
| service_pro | sub | $89/mo |
| concierge | one-off | $499 |

All current keys/prices are **test mode**: publishable key `pk_test_…`, price IDs `price_1TRPT…`. The success page even renders a "Test mode" banner for `pk_test_*` (`src/pages/CheckoutPages.tsx:8-21`).

## What MUST change to go live (vendor-dependent)
1. Stripe business verification complete; create 7 live products/prices.
2. Set Vercel `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_…` + 7 `VITE_STRIPE_PRICE_*=price_live_…`.
3. Set Supabase function secrets `STRIPE_SECRET_KEY=sk_live_…`, `STRIPE_WEBHOOK_SECRET=whsec_…`, 7 live `STRIPE_PRICE_*`.
4. Register live webhook endpoint → `…/functions/v1/stripe-webhook`.
5. Run pre-flight QA on all 7 checkouts + subscription lifecycle on live prices.
6. Wire Customer Portal ("Manage billing") in dealer profile — currently not wired (gap, medium).

## Blocker summary
| Item | Status |
|---|---|
| Webhook signature + idempotency + ownership | ✅ PASS (production-grade) |
| Live Stripe keys/prices | ⛔ TEST MODE — blocks real revenue |
| Live-mode QA | ⛔ not done |
| Customer Portal UI | ⚠ not wired |

**No code changes needed to go live — it is a pure configuration + QA migration.**
