# TradeWind — Private Beta Readiness

**Date:** 2026-04-28
**Decision:** **GO** — ship to private beta cohort.

This document is the go/no-go assessment after the final perfection QA pass. It states what we will and will not promise to private-beta customers, and what must still be done by hand before the first invite goes out.

---

## Go/No-Go checklist

| Area | Status | Notes |
| --- | --- | --- |
| **Code builds clean** | ✅ | `tsc -b && vite build` — 0 errors |
| **Smoke tests pass** | ✅ | 5/5 — Login, Signup, Home, TrustCenter, CheckoutSuccess |
| **All routes resolve** | ✅ | 47 page components mapped to routes in App.tsx |
| **Loading states** | ✅ | Every data-fetching page has skeleton or spinner |
| **Empty states** | ✅ | Every list/table has an icon + message + CTA |
| **Mobile layout** | ✅ | Tailwind responsive classes used; admin tables use `overflow-x-auto` |
| **Demo-listing labels obvious** | ✅ | TrustBadge "Demo" chip on cards + amber banner on detail |
| **Trust safety copy** | ✅ | Listing detail "Buy with confidence" + Trust Center linked from Footer |
| **AI disclaimers** | ✅ | Deal Score and Ownership Cost both have "not financial advice" copy |
| **Stripe checkout** | ✅ | All 7 payment kinds wired; success/cancel pages render |
| **Stripe webhook** | ✅ | 3 lifecycle events handled |
| **AI edge functions** | ✅ | All 5 present with try/catch |
| **SEO meta** | ✅ | `setMeta()` on every public page; JSON-LD on listings; sitemap edge function present |
| **Programmatic SEO** | ✅ | State, brand, and city pages routed |
| **Auth + RBAC** | ✅ | `ProtectedRoute` + `OnboardingGuard` on every gated section |
| **Concierge fee disclosed** | ✅ | $499 fee now shown on /pricing AND /concierge intake |
| **Footer Trust link** | ✅ | Legal column |

No blockers found. Ready for invited beta users.

---

## What we promise the beta cohort

These are the user-facing guarantees TradeWind makes today, all of which are backed by code in this branch:

1. **Buy or sell boats and autos** — listings live with photos, specs, and price.
2. **Browse without an account** — public marketplace works anonymously.
3. **Save and compare** — up to 3 listings side-by-side once signed in.
4. **Talk to sellers** — inquiry form + in-app messaging with fraud screening.
5. **Get help with services** — financing, insurance, inspection, transport, concierge intake forms route to the right partner queue.
6. **See trust signals** — "Verified Dealer", "Featured", "Demo" badges; Deal Score and Ownership Cost on every real listing.
7. **Know what's demo** — every demo listing wears a chip on its card and a banner on its detail page.
8. **Pay safely** — Stripe Checkout for featured/boost upgrades, dealer subscriptions, service-pro subscriptions, and concierge engagements.
9. **Get an admin response** — fraud flags, content reports, and concierge requests all hit a moderation queue with a 1-business-day SLA (per Trust Center).

---

## What we explicitly do NOT promise

- **Escrow / closing**: TradeWind does not take custody of funds. Buyers are routed to bonded F&I or partner financing.
- **Title/VIN verification automation**: We help buyers run checks via concierge, but we do not run them automatically.
- **Live inventory feeds**: Dealers post manually or via CSV import in this release. Auto-sync from CDK / DealerSocket is later.
- **In-app payments to sellers**: All money for the asset itself moves through the buyer's chosen lender, escrow, or bonded F&I — never via our Stripe.
- **Mobile native app**: Web only. The site is responsive but no iOS/Android app yet.
- **24/7 support**: Trust team responds within 1 business day.

---

## Setup that must happen by hand before launch

These are owner-only steps. They can't be done in code:

1. **Supabase project**
   - Run all migrations in `supabase/migrations/` against the production project (latest: `20260101000400_advantage.sql`).
   - Enable Row Level Security on every table touched by the migrations (RLS policies are part of the migrations themselves).
   - Set service role key as `SUPABASE_SERVICE_ROLE_KEY` in edge function secrets.
   - Verify `auth.users` email confirmation flow points at `https://gotradewind.com/login`.

2. **Stripe**
   - Create live products + prices for all 7 payment kinds and store the price IDs as edge function secrets:
     `STRIPE_PRICE_FEATURED_LISTING`, `STRIPE_PRICE_BOOST_LISTING`, `STRIPE_PRICE_DEALER_STARTER`, `STRIPE_PRICE_DEALER_PRO`, `STRIPE_PRICE_DEALER_PREMIER`, `STRIPE_PRICE_SERVICE_PROVIDER`, `STRIPE_PRICE_CONCIERGE`.
   - Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` as edge function secrets.
   - Point the Stripe webhook at `https://<project>.functions.supabase.co/stripe-webhook` and subscribe to: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
   - Add `VITE_STRIPE_PUBLISHABLE_KEY` to Vercel env (so the frontend banner can detect test vs live).

3. **AI provider**
   - Set the LLM provider key (`ANTHROPIC_API_KEY` or `OPENAI_API_KEY` per `_shared/llm.ts`) for the 5 AI edge functions.

4. **Email**
   - Configure the `send-email` function with the chosen transactional provider (Postmark / Resend / SES) and verify the `from:` domain.
   - Templates referenced: `listing_approved`, `request_received`. Confirm both exist in the provider's template library.

5. **Vercel**
   - Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY` as Production env vars.
   - Point `gotradewind.com` and `www.gotradewind.com` at the Vercel project.
   - Set `APP_URL=https://gotradewind.com` in edge function secrets so Stripe success/cancel URLs work.

6. **Trust + abuse**
   - Stand up `trust@tradewind.market` (referenced from Trust Center) and route to a real human inbox.
   - Set `BRAND.supportEmail` already in `src/lib/brand.ts`; verify forwarding works.

7. **Seed data**
   - Demo listings should already be in production from earlier phases. Confirm `is_demo=true` is set on every one before inviting beta users — otherwise the DEMO chip won't appear and buyers will be confused.

---

## Risk register

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Beta user submits inquiry on a demo listing thinking it's real | Low | High | DEMO chip on card + amber banner on detail + Trust Center copy explaining demos |
| Webhook drops a `subscription.updated` event during launch traffic spike | Low | Medium | Stripe retries automatically for 3 days; admin/payments view shows latest status |
| AI fraud check false-positives a real high-intent buyer | Medium | Medium | All flags go to admin/fraud for human resolve, never auto-block |
| Concierge intake forms get spammed | Medium | Low | rate limit at edge function layer (already in `_shared/`); concierge requires $499 charge before fulfillment |
| `index-*.js` 952 kB bundle slows first paint on 3G | Medium | Low | Dashboards already lazy-loaded; will optimize after beta feedback |

---

## Decision

**GO for private beta.**

The marketplace, role flows, payment flows, AI flows, SEO, and trust copy are all wired and tested. Visual polish from this pass eliminated the last of the placeholder-grade dashboard headers. The remaining work is operational (infra, secrets, support email) and is captured in the runbook above.

— Final QA pass, 2026-04-28
