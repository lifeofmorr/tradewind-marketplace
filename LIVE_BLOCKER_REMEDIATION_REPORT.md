# Live Blocker Remediation Report

Date: 2026-06-03

Remediation of the 4 production blockers before go-live. All four are addressed,
gated fail-closed/opt-in, and documented. **No live charges were enabled and no
outreach was sent** — these changes add the gates and visibility to do those
things safely, not the actions themselves.

## Verification

| Check | Result |
|-------|--------|
| `npm run typecheck` | ✅ pass (no errors) |
| `npm run build` | ✅ pass (built in ~3.7s) |
| `npx vitest run` | ✅ 191 passed / 8 files (incl. 8 new Stripe-mode tests) |

> Edge functions are Deno (esm.sh imports) and are not part of the `tsc`
> project; the repo/CI does not `deno check` them. They were reviewed by hand
> and follow the existing `_shared` patterns.

---

## Blocker 1 — Stripe live-mode readiness ✅

Makes live charges **opt-in and fail-closed**: checkout refuses to run unless the
selected mode is fully and consistently configured.

**Server gate (authoritative)** — `supabase/functions/_shared/stripe-mode.ts`,
called by `stripe-checkout`. `STRIPE_MODE` defaults to `test`. Live mode requires
`sk_live_…` + all 7 `STRIPE_PRICE_*`; secret-key prefix must match the mode (no
test/live mixing). Otherwise `503`, no Stripe call. Only env-var **names** leak,
never values.

**Client mirror** — `src/lib/stripeMode.ts` runs the same checks on public
values (publishable key + price IDs) to drive UI.

**Surfaces**
- `src/components/admin/StripeModeBanner.tsx` — mode banner on `/admin/payments`.
- `src/pages/dashboard/admin/AdminPaymentsLiveReadiness.tsx` +
  `supabase/functions/stripe-readiness/` — admin-only `/admin/payments/live-readiness`
  go/no-go checklist (browser + server panels).

**Env** — `VITE_STRIPE_MODE` / `STRIPE_MODE` added to `vite-env.d.ts` and all 3
`.env.*.example` files. Runbook: `STRIPE_LIVE_MODE_READINESS.md`.

Files: `stripe-mode.ts`, `stripeMode.ts`, `stripe-readiness/index.ts`,
`stripe-checkout/index.ts`, `StripeModeBanner.tsx`, `AdminPaymentsLiveReadiness.tsx`,
`AdminPayments.tsx`, `App.tsx`, `vite-env.d.ts`, `__tests__/stripeMode.test.ts`.

## Blocker 2 — AI endpoint rate limiting ✅

`supabase/migrations/20260603_edge_rate_limits.sql` — `edge_rate_limits` table
(RLS on, no policies → service-role only) + atomic `edge_rate_limit_hit()` RPC
(fixed window, lazy reset, no cron). `_shared/rate-limit.ts` middleware.

Limits: public 5/10min/IP · auth 20/hr/user · admin 100/hr · outreach 25/day.
Identity derived automatically (JWT → per-user; anon → per-IP). `429` with
`Retry-After`. **Fail-open** if the limiter backend is down (cost guard, not auth)
— documented.

Applied to: `ai-listing-autopilot`, `ai-negotiation-assistant`,
`ai-buyer-assistant`, `ai-concierge-intake`, `ai-pricing-estimate`,
`ai-listing-generator`, `ai-fraud-check`, `classify-outreach-reply` (admin),
`generate-outreach-message` (outreach), `build-daily-queue` (outreach).
Excluded: `inquiry-fraud-check` (server-to-server). Doc: `AI_RATE_LIMITING.md`.

## Blocker 3 — Sentry wiring ✅

`@sentry/react@10.56.0` installed. `src/instrument.ts` runs `Sentry.init()`
**only when `VITE_SENTRY_DSN` is set**, with `browserTracingIntegration()` (route
tracing), env-aware `tracesSampleRate`, `sendDefaultPii:false`. Imported first in
`main.tsx`. `src/lib/telemetry.ts` now delegates `captureException` /
`captureMessage` / `setUser` to Sentry (console fallback). The existing
`ErrorBoundary` forwards caught errors via `captureException`. `AuthContext`
attaches `{id,email,role}` on auth change. No DSN → no-op. Doc: `SENTRY_SETUP.md`.

## Blocker 4 — CAN-SPAM ✅

`_shared/outreach-compliance.ts` — `BUSINESS_MAILING_ADDRESS` source,
`canSpamReady()`, `appendCanSpamFooter()`. `build-daily-queue` **hard-blocks**
email scaling (`409`) until the address is set, and footers every drafted email
with opt-out + physical address. `send-email` adds the address to transactional
footers. `VITE_BUSINESS_MAILING_ADDRESS` drives a CAN-SPAM indicator in the
`/admin/outreach` `ComplianceBanner` (green ready / red blocked). DM channels are
exempt. Env added to typings + examples. Doc: `OUTREACH_CAN_SPAM_READINESS.md`.

---

## Operator actions required before go-live

These are deliberate human steps — the code is ready but inert until set:

1. **Stripe live:** set live `VITE_STRIPE_*` + `STRIPE_*` secrets, then
   `VITE_STRIPE_MODE=live` / `STRIPE_MODE=live`; verify
   `/admin/payments/live-readiness` is all-green; smoke-test + refund one charge.
2. **Rate limiting:** `supabase db push` (migration) + redeploy functions.
3. **Sentry:** set `VITE_SENTRY_DSN` (Production + Preview projects).
4. **CAN-SPAM:** set `BUSINESS_MAILING_ADDRESS` + `VITE_BUSINESS_MAILING_ADDRESS`.

## Scope discipline

No new product features, no app rebuild, no outreach sent, no Stripe live charges
turned on. Pre-existing uncommitted working-tree changes (Support page, footer,
brand email, robots.txt, request-page legal copy) were left untouched.
