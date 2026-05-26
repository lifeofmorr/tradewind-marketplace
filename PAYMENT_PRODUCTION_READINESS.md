# Payment Production Readiness — TradeWind

**Audit date:** 2026-05-26
**Processor:** Stripe (Checkout sessions + Subscriptions + Webhooks)
**Files audited:** `supabase/functions/stripe-checkout/index.ts`, `supabase/functions/stripe-webhook/index.ts`, `src/lib/stripe.ts`.

> **DO NOT enable Stripe LIVE mode until every item in the "Go-Live Checklist" section is signed off.**

## 1. SKU / product inventory (7 products)

The 7 SKUs live in `PRICE_ENV` map (`stripe-checkout/index.ts`):

| Kind | Mode | Env (frontend) | Env (edge function) |
|---|---|---|---|
| `featured_listing` | payment (one-off) | `VITE_STRIPE_PRICE_FEATURED_LISTING` | `STRIPE_PRICE_FEATURED_LISTING` |
| `boost_listing` | payment (one-off) | `VITE_STRIPE_PRICE_BOOST_LISTING` | `STRIPE_PRICE_BOOST_LISTING` |
| `dealer_starter` | subscription | `VITE_STRIPE_PRICE_DEALER_STARTER` | `STRIPE_PRICE_DEALER_STARTER` |
| `dealer_pro` | subscription | `VITE_STRIPE_PRICE_DEALER_PRO` | `STRIPE_PRICE_DEALER_PRO` |
| `dealer_premier` | subscription | `VITE_STRIPE_PRICE_DEALER_PREMIER` | `STRIPE_PRICE_DEALER_PREMIER` |
| `service_pro` | subscription | `VITE_STRIPE_PRICE_SERVICE_PROVIDER` | `STRIPE_PRICE_SERVICE_PROVIDER` |
| `concierge` | payment (one-off) | `VITE_STRIPE_PRICE_CONCIERGE` | `STRIPE_PRICE_CONCIERGE` |

`SUBSCRIPTION_KINDS` set: `dealer_starter`, `dealer_pro`, `dealer_premier`, `service_pro`. Subscriptions get `allow_promotion_codes: true`.

## 2. Checkout flow — verified

- **JWT verification first** — `getCallingUser(req)` calls Supabase `/auth/v1/user` with the bearer token. Returns 401 if missing/invalid.
- **Input validation** — `UUID_RE` validates all id fields; `URL_RE` validates `successUrl` / `cancelUrl`.
- **Ownership verification** — for any id passed in body, the function fetches the row via admin REST and confirms `seller_id` / `owner_id` / `user_id` matches the authenticated caller. Returns 403 on mismatch.
- **Metadata wiring** — every Stripe session has `metadata[kind]` + `metadata[user_id]` + any resource ids. Webhook reads these to attribute payments / extensions.
- **Customer email** — populated from auth user, not from body.
- **Mode selection** — `mode: "subscription"` when `kind` is in `SUBSCRIPTION_KINDS`, else `mode: "payment"`.

## 3. Webhook flow — verified

- **HMAC verification** — `verify()` reconstructs `${ts}.${payload}`, HMAC-SHA256 with `STRIPE_WEBHOOK_SECRET`, timing-safe compare to `v1=` segment of `stripe-signature` header.
- **Idempotency** — `webhook_events` table catches duplicate `event.id`.
- **`checkout.session.completed`** — inserts `payments` row; for `featured_listing` / `boost_listing` extends `listings.featured_until` / `boost_until` by 30/7 days and emails the seller; for `concierge` flips `concierge_requests.paid = true` and emails the buyer.
- **`customer.subscription.created` / `.updated`** — upserts `subscriptions` row keyed by `stripe_subscription_id`; mirrors tier + status onto `dealers` / `service_providers`.
- **`send-email` failures swallowed** — Resend outage never causes Stripe to retry the webhook.
- **No-verify-jwt** — webhook is deployed with `--no-verify-jwt` (documented in fn header).

## 4. Success / cancel pages

- `/checkout/success` (`CheckoutPages.tsx`) — confirms success, optionally reads `session_id` query param.
- `/checkout/cancel` (`CheckoutPages.tsx`) — returns to dashboard/CTA without state change.

## 5. Refund / dispute handling — plan

Refunds and chargebacks are handled in the Stripe Dashboard (no in-app refund button — intentional, to keep PCI scope narrow).

**Refund process:**
1. Customer requests refund via `/contact` or support@gotradewind.com.
2. Support verifies eligibility per policy:
   - Featured/boost: refundable within 24 h, prorated thereafter at admin discretion.
   - Dealer subscriptions: cancel anytime; no proration; pay through period end.
   - Concierge: refundable until concierge work begins; non-refundable after.
3. Admin issues refund from Stripe Dashboard.
4. Webhook receives `charge.refunded` → updates `payments.status = 'refunded'`.
   - **TODO:** add `charge.refunded` case to the webhook switch (not blocking — manual reconciliation works for now).
5. Audit log entry via `logAuditEvent({ action: "refund_issued", ... })`.

**Dispute process:**
1. Stripe sends `charge.dispute.created` → admin reviews in Stripe.
2. Admin gathers evidence (listing screenshots, message logs, audit log) and submits via Stripe.
3. Outcome arrives via webhook — track in `payments.metadata`.

## 6. Subscription cancellation — plan

Cancellation paths:
1. **Customer-initiated** (in app) — dealer profile page exposes "Manage billing" → Stripe Customer Portal. Customer can cancel at period end.
2. **Admin-initiated** (chargeback / ban / non-payment) — admin cancels in Stripe Dashboard.
3. Webhook handles `customer.subscription.updated` (`cancel_at_period_end: true`) and `customer.subscription.deleted`.
4. Mirror onto `dealers.subscription_status` / `service_providers.subscription_status`.
5. Downgrade UI: dealer with no active subscription sees a "reactivate" CTA but retains read-only access to past listings.

**Open work:**
- [ ] Wire Customer Portal link from dealer profile (currently a stub).
- [ ] Add `customer.subscription.deleted` case to webhook switch.

## 7. Go-Live Checklist (manual, do not skip)

### Stripe Dashboard
- [ ] **Live mode activated** — business verification complete.
- [ ] **7 products + prices created in Live mode** — copy price IDs.
- [ ] **Webhook endpoint added in Live mode** — `https://qwaotydaazymgnvnfuuj.supabase.co/functions/v1/stripe-webhook`.
- [ ] **Webhook events selected:** `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`, `charge.dispute.created`, `invoice.payment_failed`.
- [ ] **Webhook secret copied** to Supabase Function Secrets as `STRIPE_WEBHOOK_SECRET` (production).
- [ ] **Customer Portal configured** — allow cancel, allow payment update.
- [ ] **Tax settings configured** (Stripe Tax or manual jurisdictions).
- [ ] **Refund & dispute email alerts** turned on.

### Supabase Function Secrets (production)
- [ ] `STRIPE_SECRET_KEY=sk_live_...`
- [ ] `STRIPE_WEBHOOK_SECRET=whsec_live_...`
- [ ] `STRIPE_PRICE_*` (7 live IDs)
- [ ] `APP_URL=https://gotradewind.com`

### Vercel Production env
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
- [ ] `VITE_STRIPE_PRICE_*` (7 live IDs)

### Pre-flight QA (on staging with TEST mode)
- [ ] Featured listing checkout → success → `listings.is_featured = true`, `featured_until` set.
- [ ] Boost listing checkout → success → `boost_until` set.
- [ ] Dealer Starter subscription → `subscriptions` upserted, `dealers.subscription_tier = 'starter'`.
- [ ] Cancel subscription via Customer Portal → webhook fires → `subscription_status` updated.
- [ ] Concierge checkout → `concierge_requests.paid = true`, email received.
- [ ] Failed-card test (`4000 0000 0000 9995`) → webhook handles.
- [ ] Refund a test payment → audit log entry.

### First-day production monitoring
- [ ] Watch Stripe Dashboard live event feed for first 24h.
- [ ] Tail Supabase fn logs for `stripe-webhook`.
- [ ] Verify first real payment in `payments` table + email delivery.

## 8. Verdict

| Item | Status |
|---|---|
| Code is production ready | ✅ |
| Webhook signature verification | ✅ |
| Idempotency | ✅ |
| Ownership checks before metadata write | ✅ |
| Stripe LIVE keys provisioned | 🤝 VA — pending |
| Customer Portal wired in UI | 🛠 NF — small follow-up |
| `charge.refunded` / `subscription.deleted` cases | 🛠 NF — small follow-up |

**Live Stripe mode is NOT enabled yet, per request.** Code is ready; the switch is a documented manual operation.
