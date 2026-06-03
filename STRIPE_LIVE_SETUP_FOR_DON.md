# STRIPE LIVE SETUP — FOR DON

_DONE-FOR-DON PRODUCTION CONFIGURATION MODE · 2026-06-03_

**Claude did NOT enable live charges and cannot.** This is a runbook of the exact
dashboard steps only you can do (they require Stripe login + secret values).
The app is **fail-closed**: it stays in test mode until every item below is green.

## How the safety gate works (so you trust it)

Two independent guards, both default to **test**:

- **Client** (`src/lib/stripeMode.ts`): reads `VITE_STRIPE_MODE`. If unset →
  `test`. Live "Pay" buttons are blocked unless mode is `live` AND the publishable
  key is `pk_live_…` AND all 7 `VITE_STRIPE_PRICE_*` are present.
- **Server** (`supabase/functions/_shared/stripe-mode.ts`): reads `STRIPE_MODE`.
  If unset → `test`. In live mode, checkout returns **503 and makes no Stripe call**
  unless `STRIPE_SECRET_KEY` is `sk_live_…` AND all 7 `STRIPE_PRICE_*` exist. A
  test key in live mode (or vice-versa) is rejected.

Current state: `VITE_STRIPE_MODE` is unset in Vercel and `STRIPE_MODE` is
(per the template) unset/`test` in Supabase → **test mode, safe.** Leave it there
until `/admin/payments/live-readiness` is all-green and you explicitly decide to go.

## Step 1 — Business verification

Stripe Dashboard → **Settings → Business** → complete identity/business
verification and bank payout details. Live charges cannot settle until this is done.

## Step 2 — Switch to Live mode

Toggle **"Test mode" → off** (top-right of the Stripe Dashboard). All steps below
must be performed with Live mode active so you create **live** objects and copy
**live** keys.

## Step 3 — Create the 7 live products

Products → **Add product**. Recreate each SKU in Live mode and copy its
`price_…` ID. Match the existing test catalog exactly:

| Product | Price | Billing | → env var (client `VITE_…` + server) |
|---|---|---|---|
| Featured Listing | $79 | one-time | `STRIPE_PRICE_FEATURED_LISTING` |
| Boost Listing | $29 | one-time | `STRIPE_PRICE_BOOST_LISTING` |
| Dealer Starter | $149 | monthly | `STRIPE_PRICE_DEALER_STARTER` |
| Dealer Pro | $499 | monthly | `STRIPE_PRICE_DEALER_PRO` |
| Dealer Premier | $1,499 | monthly | `STRIPE_PRICE_DEALER_PREMIER` |
| Service Provider Pro | $89 | monthly | `STRIPE_PRICE_SERVICE_PROVIDER` |
| Concierge | $499 | one-time | `STRIPE_PRICE_CONCIERGE` |

> Confirm each billing interval matches your test products before copying IDs.
> A monthly/one-time mismatch is silent and only shows up at first charge.

## Step 4 — Create the live webhook endpoint

Developers → **Webhooks → Add endpoint**:

- **URL:** `https://qwaotydaazymgnvnfuuj.supabase.co/functions/v1/stripe-webhook`
  (confirm against the deployed function name in `supabase/functions/`).
- **Events:** at minimum `checkout.session.completed`,
  `customer.subscription.updated`, `customer.subscription.deleted`,
  `invoice.paid`, `invoice.payment_failed` (match what the webhook handler reads).
- Copy the **Signing secret** (`whsec_…`) → becomes `STRIPE_WEBHOOK_SECRET`.

## Step 5 — Where each value goes

**Vercel** (Production scope) — public values, via Dashboard or `vercel env add`:

| Var | Value |
|---|---|
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_…` |
| `VITE_STRIPE_PRICE_FEATURED_LISTING` | `price_…` (live) |
| `VITE_STRIPE_PRICE_BOOST_LISTING` | `price_…` (live) |
| `VITE_STRIPE_PRICE_DEALER_STARTER` | `price_…` (live) |
| `VITE_STRIPE_PRICE_DEALER_PRO` | `price_…` (live) |
| `VITE_STRIPE_PRICE_DEALER_PREMIER` | `price_…` (live) |
| `VITE_STRIPE_PRICE_SERVICE_PROVIDER` | `price_…` (live) |
| `VITE_STRIPE_PRICE_CONCIERGE` | `price_…` (live) |
| `VITE_STRIPE_MODE` | `live` — **set LAST, after everything is green** |

**Supabase Function Secrets** — secret values, via Dashboard
(Project `qwaotydaazymgnvnfuuj` → Edge Functions → **Secrets**) or
`supabase secrets set --project-ref qwaotydaazymgnvnfuuj KEY=value`:

| Secret | Value | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_…` | **never** put in Vercel or commit |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` | from Step 4 |
| `STRIPE_PRICE_FEATURED_LISTING` | `price_…` | must equal the Vercel value |
| `STRIPE_PRICE_BOOST_LISTING` | `price_…` | " |
| `STRIPE_PRICE_DEALER_STARTER` | `price_…` | " |
| `STRIPE_PRICE_DEALER_PRO` | `price_…` | " |
| `STRIPE_PRICE_DEALER_PREMIER` | `price_…` | " |
| `STRIPE_PRICE_SERVICE_PROVIDER` | `price_…` | " |
| `STRIPE_PRICE_CONCIERGE` | `price_…` | " |
| `STRIPE_MODE` | `live` — **set LAST**, must match `VITE_STRIPE_MODE` | |

## Step 6 — Keep mode = test until you approve

Do **not** set `VITE_STRIPE_MODE=live` / `STRIPE_MODE=live` until steps 1–5 are
done and `/admin/payments/live-readiness` shows every row green for both the
browser and server panels. Flipping these two values is the single deliberate
"go live" action — and it's reversible (set back to `test`).

## Go-live checklist

| # | Item | Owner | Where | Verify |
|---|---|---|---|---|
| 1 | Business verification complete | Don | Stripe → Settings → Business | Stripe shows "Verified" / payouts enabled |
| 2 | 7 live products created | Don | Stripe → Products (Live) | 7 `price_…` IDs copied |
| 3 | Live webhook endpoint added | Don | Stripe → Webhooks (Live) | endpoint shows "Enabled"; `whsec_…` copied |
| 4 | `pk_live_…` + 7 price IDs in Vercel | Don | Vercel → Env (Production) | `vercel env ls production` lists them |
| 5 | `sk_live_…` + `whsec_…` + 7 prices in Supabase | Don | Supabase → Function Secrets | `supabase secrets list` shows names |
| 6 | Redeploy after Vercel changes | Don | `vercel --prod` / Git push | new deployment live |
| 7 | Browser panel all-green | Don | `/admin/payments/live-readiness` | mode=live, prefix=pk_live, 7 prices ✓ |
| 8 | Server panel all-green | Don | same page | mode=live, prefix=sk_live, prices present |
| 9 | Flip `VITE_STRIPE_MODE`+`STRIPE_MODE`=`live` | Don | Vercel + Supabase | overall verdict = "Ready for live charges" |
| 10 | $1 smoke transaction + refund | Don | live checkout | charge succeeds, webhook fires, refund clears |

Full runbook also referenced in-app: `STRIPE_LIVE_MODE_READINESS.md` /
`PAYMENT_PRODUCTION_READINESS.md`.
