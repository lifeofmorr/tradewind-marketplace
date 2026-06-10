# LIVE-READINESS PAGE — DONE-FOR-DON VERIFY

_Maximum done-for-Don mode · 2026-06-03_

How to read the go/no-go page that gates real charges. Claude verified the page
exists, is routed, and is fail-closed — but it must run against the **deployed**
build, so the final visual check is yours after deploy.

## Where it is
- **Route:** `/admin/payments/live-readiness` (registered in `src/App.tsx:282`,
  admin-guarded).
- **Source:** `src/pages/dashboard/admin/AdminPaymentsLiveReadiness.tsx`.
- Reachable from **Admin → Payments** (the `StripeModeBanner` + a link live there).

## What it shows
Two panels + one overall verdict.

**Browser config (public)** — from `clientStripeReadiness()`:
- `VITE_STRIPE_MODE` (mode = test/live)
- Publishable key prefix (`pk_test` / `pk_live` / missing)
- Each of the 7 `VITE_STRIPE_PRICE_*` present/absent

**Server secrets (Supabase)** — from the `stripe-readiness` edge function
(returns NAMES + prefixes only, never secret values):
- `STRIPE_MODE`
- Secret key prefix (`sk_test` / `sk_live` / missing)
- Live price IDs present

**Overall verdict** logic (`goLive`): green only when
`client.ok && server.ok && client.mode === 'live' && server.mode === 'live'`.
Otherwise it reads "Test mode" (safe) or "Not ready" (something failing).

## Expected states

| Situation | Browser panel | Server panel | Verdict |
|---|---|---|---|
| **Now (pre-go-live)** | mode = test, key = pk_test/missing | mode = test | 🟡 "Test mode" |
| Mid-setup (live key, missing prices) | some ✗ rows | some ✗ rows | 🟠 "Not ready" |
| **Fully configured + mode flipped** | all green, pk_live, 7 prices ✓ | all green, sk_live, prices present | 🟢 "Ready for live charges" |

## Your verification steps (after deploy)
1. Deploy the current production build (so the page reflects shipped code).
2. Log in as an admin → open `/admin/payments/live-readiness`.
3. **Before go-live:** expect the 🟡 "Test mode" verdict. That is correct and safe.
4. If the **Server secrets** panel errors with "Could not reach the
   stripe-readiness function," confirm that edge function is deployed
   (`supabase functions deploy stripe-readiness`) and you're an admin.
5. **During go-live:** after completing `STRIPE_LIVE_DASHBOARD_STEPS_FOR_DON.md`,
   reload and confirm **every row green on both panels** before flipping
   `VITE_STRIPE_MODE`/`STRIPE_MODE` to `live`.
6. After flipping + redeploy, confirm the verdict reads 🟢 **"Ready for live
   charges."** Only then take a real payment.

## Gotcha
Vite env vars are **build-time**. If you change a `VITE_STRIPE_*` var in Vercel,
the page won't reflect it until you **redeploy**. The server panel updates as soon
as the Supabase secret changes (read at request time).
