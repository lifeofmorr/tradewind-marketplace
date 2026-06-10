# STRIPE LIVE — DASHBOARD STEPS FOR DON

_Maximum done-for-Don mode · 2026-06-03 · no secrets in this file_

Everything Claude could do is done. **The remaining steps require your Stripe
login and copying secret values — never paste those into chat.** Each step says
exactly *where* on screen, *which env var name*, and *which platform*.

## Safety: the app is fail-closed and currently in TEST mode
- Client gate `src/lib/stripeMode.ts` + server gate
  `supabase/functions/_shared/stripe-mode.ts` both default to `test`.
- `VITE_STRIPE_MODE` is unset in Vercel → client = test. Keep it that way until
  the live-readiness page is all-green.
- Live charges are impossible until `STRIPE_MODE`/`VITE_STRIPE_MODE` = `live`
  **and** a live secret key **and** all 7 live price IDs are present.

---

## Step 1 — Business verification
**Stripe Dashboard → Settings (gear, top-right) → Business**
Complete identity, business details, and bank/payout info. Until verified, live
payouts won't settle.

## Step 2 — Turn off Test mode
**Top-right toggle "Test mode" → OFF.** Do every step below in Live mode so you
create live objects and copy live values.

## Step 3 — Create the 7 live products
**Products → Add product** (in Live mode). Recreate each, then open the product
and copy its **price ID** (`price_…`).

| Product | Price | Billing | Env var name (used in both Vercel + Supabase) |
|---|---|---|---|
| Featured Listing | $79 | one-time | `STRIPE_PRICE_FEATURED_LISTING` |
| Boost Listing | $29 | one-time | `STRIPE_PRICE_BOOST_LISTING` |
| Dealer Starter | $149 | monthly | `STRIPE_PRICE_DEALER_STARTER` |
| Dealer Pro | $499 | monthly | `STRIPE_PRICE_DEALER_PRO` |
| Dealer Premier | $1,499 | monthly | `STRIPE_PRICE_DEALER_PREMIER` |
| Service Provider Pro | $89 | monthly | `STRIPE_PRICE_SERVICE_PROVIDER` |
| Concierge | $499 | one-time | `STRIPE_PRICE_CONCIERGE` |

## Step 4 — Get the live API keys
**Developers → API keys** (Live mode):
- **Publishable key** `pk_live_…` → goes to **Vercel** as `VITE_STRIPE_PUBLISHABLE_KEY`
- **Secret key** `sk_live_…` → goes to **Supabase** as `STRIPE_SECRET_KEY` (NEVER Vercel, NEVER chat)

## Step 5 — Create the live webhook
**Developers → Webhooks → Add endpoint** (Live mode):
- **Endpoint URL:** `https://qwaotydaazymgnvnfuuj.supabase.co/functions/v1/stripe-webhook`
- **Events:** `checkout.session.completed`, `customer.subscription.updated`,
  `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`
- After saving, **Reveal signing secret** `whsec_…` → goes to **Supabase** as
  `STRIPE_WEBHOOK_SECRET`

## Step 6 — Put values in the right platform

### Vercel (PUBLIC values) — Project `tradewind-marketplace`
**Vercel → Settings → Environment Variables → scope = Production → Add**

| Env var | Value |
|---|---|
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_…` |
| `VITE_STRIPE_PRICE_FEATURED_LISTING` | live `price_…` |
| `VITE_STRIPE_PRICE_BOOST_LISTING` | live `price_…` |
| `VITE_STRIPE_PRICE_DEALER_STARTER` | live `price_…` |
| `VITE_STRIPE_PRICE_DEALER_PRO` | live `price_…` |
| `VITE_STRIPE_PRICE_DEALER_PREMIER` | live `price_…` |
| `VITE_STRIPE_PRICE_SERVICE_PROVIDER` | live `price_…` |
| `VITE_STRIPE_PRICE_CONCIERGE` | live `price_…` |
| `VITE_STRIPE_MODE` | `live` — **add this LAST, after everything is green** |

### Supabase (SECRET values) — Project `qwaotydaazymgnvnfuuj`
**Supabase Dashboard → Project → Edge Functions → Secrets → Add new secret**

| Secret name | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` |
| `STRIPE_PRICE_FEATURED_LISTING` | live `price_…` (must equal Vercel) |
| `STRIPE_PRICE_BOOST_LISTING` | live `price_…` |
| `STRIPE_PRICE_DEALER_STARTER` | live `price_…` |
| `STRIPE_PRICE_DEALER_PRO` | live `price_…` |
| `STRIPE_PRICE_DEALER_PREMIER` | live `price_…` |
| `STRIPE_PRICE_SERVICE_PROVIDER` | live `price_…` |
| `STRIPE_PRICE_CONCIERGE` | live `price_…` |
| `STRIPE_MODE` | `live` — **add this LAST**, must match `VITE_STRIPE_MODE` |

## Step 7 — Redeploy & verify, THEN flip to live
1. Redeploy production so Vite bakes in the new public values.
2. Open **`/admin/payments/live-readiness`** → confirm every row is green on both
   the Browser panel and the Server panel (see `LIVE_PAGE_DONE_FOR_DON_VERIFY.md`).
3. Only then set `VITE_STRIPE_MODE=live` (Vercel) + `STRIPE_MODE=live` (Supabase),
   redeploy once more, and confirm the verdict reads **"Ready for live charges."**
4. Do a **$1 live charge + immediate refund** as a smoke test.

## Checklist

| # | Item | Platform / location | Verify |
|---|---|---|---|
| 1 | Business verified | Stripe → Settings → Business | payouts enabled |
| 2 | 7 live products | Stripe → Products (Live) | 7 `price_…` copied |
| 3 | Live keys copied | Stripe → Developers → API keys | `pk_live_…`, `sk_live_…` in hand |
| 4 | Live webhook | Stripe → Developers → Webhooks | `whsec_…` revealed |
| 5 | Public values in Vercel | Vercel → Env (Production) | `vercel env ls production` |
| 6 | Secret values in Supabase | Supabase → Edge Functions → Secrets | `supabase secrets list` |
| 7 | Live-readiness all green | `/admin/payments/live-readiness` | both panels green |
| 8 | Flip mode = live | Vercel + Supabase | verdict "Ready for live charges" |
| 9 | $1 smoke charge + refund | live checkout | webhook fires, refund clears |
