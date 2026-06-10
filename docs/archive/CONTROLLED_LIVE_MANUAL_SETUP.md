# CONTROLLED LIVE — MANUAL SETUP CHECKLIST

> Mode: **CONTROLLED LIVE BUSINESS ACTIVATION**
> Generated: 2026-06-03
>
> This checklist tracks **manual, human-only** setup steps that must be completed
> in external dashboards (Stripe, Sentry, Vercel, Supabase) before the business
> goes live. **Nothing here is auto-completed.** An item is only `[x]` when a
> human has truly configured and verified it.
>
> **Verification scope note:** This repository can verify *code wiring* and
> *templates*. It **cannot** read the real values stored in Vercel env vars or
> Supabase Function Secrets. Items marked **(verify in dashboard)** must be
> confirmed by a human in the relevant console — the repo cannot prove them.

Legend: `[ ]` not done · `[~]` code-ready, awaiting human config · `[x]` done & verified

---

## 1. Stripe Live Setup

Fail-closed contract is implemented and tested:
- Client gate: `src/lib/stripeMode.ts` — blocks "Pay" in live mode unless `pk_live_…` + all 7 `VITE_STRIPE_PRICE_*` set.
- Server gate: `supabase/functions/_shared/stripe-mode.ts` — checkout returns **503** unless `sk_live_…` + all 7 `STRIPE_PRICE_*` set; rejects test/live key↔mode mismatch.
- Checkout enforcement: `supabase/functions/stripe-checkout/index.ts` (calls `stripeReadinessFromEnv()`).
- Webhook handler: `supabase/functions/stripe-webhook/index.ts` (uses `STRIPE_WEBHOOK_SECRET`).
- Readiness dashboard: `/admin/payments/live-readiness` (`AdminPaymentsLiveReadiness.tsx`) — green ONLY when client.ok AND server.ok AND both modes = live.
- Mode banner: `src/components/admin/StripeModeBanner.tsx`.

Manual steps:
- [ ] ⏳ **Don handles manually** — Stripe business verification (legal entity, bank account, tax info). _Do not attempt to log into Stripe on Don's behalf._
- [~] Live publishable key `pk_live_…` → set `VITE_STRIPE_PUBLISHABLE_KEY` in Vercel **(verify in dashboard)**
- [~] Live secret key `sk_live_…` → set `STRIPE_SECRET_KEY` in Supabase secrets **(verify in dashboard)**
- [~] Live webhook signing secret `whsec_…` → set `STRIPE_WEBHOOK_SECRET` in Supabase secrets **(verify in dashboard)**
- [ ] Recreate all 7 products/prices in Stripe **Live** mode — **exact specs below**
- [~] Map all 7 live price IDs → 7 `VITE_STRIPE_PRICE_*` (Vercel) + 7 `STRIPE_PRICE_*` (Supabase) **(verify in dashboard)**
- [ ] Live webhook endpoint configured in Stripe → points at the deployed `stripe-webhook` function URL
- [ ] Success/cancel URLs verified (`/checkout/success`, `/checkout/cancel` both routed and reachable)
- [~] Set `VITE_STRIPE_MODE=live` (Vercel) AND `STRIPE_MODE=live` (Supabase) — **keep both `test` until the line below is green**
- [ ] `/admin/payments/live-readiness` shows **ALL GREEN** (client + server both `ok`, both mode = `live`)
- [ ] Stripe mode banner shows correct status on admin payment surfaces

> ⚠️ Until `/admin/payments/live-readiness` is all-green, leave Stripe in **test** mode. The code fails closed; do not force live mode.

### 1a. Exact products / prices to create in Stripe **Live** mode

Create these 7 prices (currency **USD**, quantity 1). The "Type" column matters — the checkout function (`stripe-checkout/index.ts:59`) opens a Stripe Checkout session in `mode: subscription` for the 4 recurring SKUs and `mode: payment` for the 3 one-time SKUs. **Amounts are sourced from the live Pricing page (`src/pages/SimplePages.tsx`).**

| # | Product name | Amount (USD) | Type / interval | Maps to env var (Vercel `VITE_…` + Supabase `…`) |
|---|--------------|--------------|-----------------|---------------------------------------------------|
| 1 | Tradewind Featured Listing (30 days) | $79.00 | **One-time** | `STRIPE_PRICE_FEATURED_LISTING` |
| 2 | Tradewind Boost Listing (7 days) | $29.00 | **One-time** | `STRIPE_PRICE_BOOST_LISTING` |
| 3 | Tradewind Dealer Starter | $149.00 | **Recurring — monthly** | `STRIPE_PRICE_DEALER_STARTER` |
| 4 | Tradewind Dealer Pro | $499.00 | **Recurring — monthly** | `STRIPE_PRICE_DEALER_PRO` |
| 5 | Tradewind Dealer Premier | $1,499.00 | **Recurring — monthly** | `STRIPE_PRICE_DEALER_PREMIER` |
| 6 | Tradewind Service Partner | $89.00 | **Recurring — monthly** | `STRIPE_PRICE_SERVICE_PROVIDER` |
| 7 | Tradewind Concierge Engagement | $499.00 | **One-time** | `STRIPE_PRICE_CONCIERGE` |

After creating each price, copy its **live price ID** (`price_…`) into BOTH:
- Vercel (Production scope): `VITE_STRIPE_PRICE_*`
- Supabase Function Secrets: `STRIPE_PRICE_*`

> ⚠️ **14-day free trial discrepancy — decision needed.** The Pricing page advertises *"Subscriptions billed monthly with a 14-day free trial"* (`SimplePages.tsx:184`), but `stripe-checkout/index.ts` does **not** pass `subscription_data[trial_period_days]` — so checkout currently grants **no trial**. Before charging real cards, either (a) add `subscription_data[trial_period_days]=14` to the subscription branch of the checkout session, or (b) remove the trial claim from the Pricing copy. Per the operating rules, do not advertise what isn't delivered. (Note: a Stripe *Price* cannot carry a Checkout trial; it must be set on the session.)
>
> Promotion codes: the subscription branch already sets `allow_promotion_codes=true`. One-time SKUs do not.

---

## 2. Sentry Setup

Wiring is implemented and degrades gracefully when DSN is absent:
- Init: `src/instrument.ts` (imported first in `src/main.tsx`); `sentryEnabled()` true only when DSN set; 10% trace sample in prod.
- Façade: `src/lib/telemetry.ts` — always console-logs, sends to Sentry only when enabled. App never breaks if DSN missing.
- Environment tag source: `VITE_ENV_NAME` (⚠️ **the code uses `VITE_ENV_NAME`, NOT `VITE_APP_ENV`** — see env audit).

Manual steps:
- [ ] ⏳ **PENDING** Sentry project created — Don is creating this himself (production project, separate from staging)
- [ ] ⏳ **PENDING** `VITE_SENTRY_DSN` added to Vercel (production scope) — waiting on the project above **(verify in dashboard)**
- [~] `VITE_ENV_NAME=production` set in Vercel ⚠️ **this is the var the code reads — NOT `VITE_APP_ENV`** **(verify in dashboard)**
- [ ] Test error captured and visible in the Sentry project
- [ ] Production errors confirmed visible after first deploy

---

## 3. CAN-SPAM / Mailing Address

Compliance gate is implemented and tested:
- Helper: `supabase/functions/_shared/outreach-compliance.ts` — `canSpamReady()` true only when `BUSINESS_MAILING_ADDRESS` set; `appendCanSpamFooter()` adds opt-out + postal address to **email** bodies.
- Hard block: `supabase/functions/build-daily-queue/index.ts:111` — email outreach scaling returns **409** when address missing.
- Admin UI: `AdminOutreach.tsx` reads `VITE_BUSINESS_MAILING_ADDRESS`, shows green "CAN-SPAM ready" / red blocking banner.
- Opt-out line enforced in generated copy + fallback.

**Confirmed values (2026-06-03):**
- Mailing address: **790 E Broward Blvd, Fort Lauderdale, FL 33301** ✅ confirmed by Don
- Business name: **Tradewind** ✅ confirmed (capital T, lowercase rest; the env var now feeds `brand.ts`)
- Support email: **PENDING** — Don is creating a dedicated Gmail. Doc placeholder: `tradewindsupport@gmail.com` (⏳ not yet active)

Manual steps:
- [x] Real physical mailing address obtained — 790 E Broward Blvd, Fort Lauderdale, FL 33301
- [~] `VITE_BUSINESS_MAILING_ADDRESS=790 E Broward Blvd, Fort Lauderdale, FL 33301` set in Vercel (Production) **(verify in dashboard)** — value confirmed; templates updated
- [~] `BUSINESS_MAILING_ADDRESS=790 E Broward Blvd, Fort Lauderdale, FL 33301` set in Supabase secrets (must match) **(verify in dashboard)**
- [x] Business name confirmed — `VITE_BUSINESS_NAME=Tradewind`; now wired into `src/lib/brand.ts` (falls back to "Tradewind" if unset)
- [ ] ⏳ **PENDING** Support email — Don creating dedicated Gmail (`tradewindsupport@gmail.com`). **Do NOT set `VITE_BUSINESS_SUPPORT_EMAIL` until that inbox is live and monitored.** Until then `brand.ts` falls back to the current monitored address (`don@lifeofmorr.com`), so support keeps working.
- [ ] Outreach footer renders address + opt-out (verify on a real draft in `/admin/outreach`)
- [ ] Opt-out language present in generated copy (verified)
- [ ] DNC workflow active (`do_not_contact` leads filtered in `build-daily-queue`)

---

## 4. Support / Contact Setup

Routes & inboxes are implemented:
- `/contact` (`SimplePages.Contact`), `/support` (`SimplePages.Support`) — route to `BRAND.supportEmail`.
- `/feedback` (`FeedbackPage`) → writes to `beta_feedback` table.
- `/admin/beta-inbox` (`AdminBetaInbox`) → triage of `beta_feedback`.

Manual steps:
- [ ] ⏳ **PENDING** Support email — dedicated Gmail (`tradewindsupport@gmail.com`) being created by Don. Until live, support routes to the fallback `don@lifeofmorr.com`. Confirm the new inbox is monitored, then set `VITE_BUSINESS_SUPPORT_EMAIL`.
- [ ] `/contact` works end-to-end (renders, mailto/submit reaches a real inbox)
- [ ] `/support` works end-to-end
- [ ] Admin notifications working (new beta feedback / inquiries surface to an admin who checks them)
- [ ] Beta inbox (`/admin/beta-inbox`) loads real submissions and status transitions work

---

## 5. Domain Setup

- [ ] Confirm current Vercel deployment URL is safe to use for private beta
- [ ] Custom domain plan documented (target: `gotradewind.com` per `BRAND.domain`; see `CUSTOM_DOMAIN_LAUNCH_PLAN.md`)
- [ ] Canonical URL correct in production (`APP_URL=https://gotradewind.com` template value — verify once domain is live)
- [ ] Footer links correct (`src/components/layout/Footer.tsx`)

---

## Summary of code-level readiness (verified in repo)

| Area | Code wiring | Fail-closed | Verified in repo |
|------|-------------|-------------|------------------|
| Stripe live gate | ✅ | ✅ 503/blocked | ✅ |
| Stripe webhook | ✅ | — | ✅ function present |
| Sentry | ✅ | ✅ graceful no-op | ✅ |
| CAN-SPAM gate | ✅ | ✅ 409 block | ✅ |
| Support/contact routes | ✅ | — | ✅ |
| Disclaimers | ✅ | — | ✅ |

**What the repo CANNOT confirm:** the real values in Vercel/Supabase, real Stripe live keys/prices, the real mailing address, a live Sentry DSN, and the production domain. All `(verify in dashboard)` items require a human.
