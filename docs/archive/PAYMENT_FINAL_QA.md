# Payments Final QA · 2026-05-21

## Edge function: `supabase/functions/stripe-checkout/index.ts`
- Authentication: requires Bearer JWT; verifies via `${SUPABASE_URL}/auth/v1/user` (line 76–87).
- Ownership checks: before passing any `listingId`, `dealerId`, `serviceProviderId`, or `conciergeRequestId` into Stripe metadata, the function verifies the caller owns the resource (lines 98–116, 146–157).
- Input validation: UUID regex, URL regex on optional success/cancel URLs (lines 67–68, 135–143).
- All 7 SKUs are wired (lines 48–56):

| Kind | Env var (Stripe price ID) | Mode | Price target |
|---|---|---|---|
| `featured_listing` | `STRIPE_PRICE_FEATURED_LISTING` | one-shot | $79 |
| `boost_listing` | `STRIPE_PRICE_BOOST_LISTING` | one-shot | $29 |
| `dealer_starter` | `STRIPE_PRICE_DEALER_STARTER` | subscription | $149 / mo |
| `dealer_pro` | `STRIPE_PRICE_DEALER_PRO` | subscription | $499 / mo |
| `dealer_premier` | `STRIPE_PRICE_DEALER_PREMIER` | subscription | $1,499 / mo |
| `service_pro` | `STRIPE_PRICE_SERVICE_PROVIDER` | subscription | $89 / mo |
| `concierge` | `STRIPE_PRICE_CONCIERGE` | one-shot | $499 |

- Success / cancel URLs default to `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}` and `${APP_URL}/checkout/cancel`; both routes exist in `App.tsx` (`/checkout/success`, `/checkout/cancel`).
- `allow_promotion_codes=true` for subscription kinds.

## Edge function: `supabase/functions/stripe-webhook/index.ts`
- Deployed `--no-verify-jwt` (documented at the top of the file) because Stripe doesn't send a Supabase JWT.
- Signature verification: HMAC-SHA256 over `${ts}.${payload}` with `STRIPE_WEBHOOK_SECRET`; timing-safe comparison (`verify()` line 45–71). Bad signature → 400.
- Idempotency: every event id is inserted into `webhook_events` before processing; a unique-violation (`23505`) is acknowledged and skipped so Stripe stops retrying (lines 246–262). This prevents double-billing side-effects (featured-listing extension, concierge marked paid) on Stripe's at-least-once delivery.
- Handlers cover:
  - `checkout.session.completed` — inserts `payments` row; for featured/boost, extends `listings.is_featured/featured_until/boost_until` and inserts into `featured_listings`; for concierge, marks the request paid; sends contextual transactional emails via `send-email` function.
  - `customer.subscription.created` / `.updated` — upserts `subscriptions` row on `stripe_subscription_id`; mirrors tier/status onto `dealers` or `service_providers`.
  - `customer.subscription.deleted` — flips subscription to `canceled`.
  - `charge.refunded` — flips matching `payments` row to `refunded`.
  - Unhandled types are 200'd to ack.
- Send-email failures are swallowed (line 38–40) so Resend outages don't trigger Stripe retries.

## Checkout pages
- `pages/CheckoutPages.tsx` exports `CheckoutSuccess` and `CheckoutCancel`; both routed under PublicShell.

## Live verification
- Live site responds 200 on `/`, `/browse`, `/checkout/success`, `/checkout/cancel` (verified via `curl`).
- `webhook_events` and `payments` tables exist in current schema with appropriate RLS.

## Conclusion
**Zero payment blockers.** The Stripe path is enterprise-grade:
JWT-authenticated, ownership-enforced, signature-verified, idempotent, with
contextual seller/buyer emails on completion.
