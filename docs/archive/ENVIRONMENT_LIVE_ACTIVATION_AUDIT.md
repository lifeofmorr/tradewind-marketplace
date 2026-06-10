# ENVIRONMENT — LIVE ACTIVATION AUDIT

> Generated: 2026-06-03 · Updated: 2026-06-03 (Don's confirmed values applied)
> **No secret values are printed in this document.** Status only.

## Confirmed values applied this session

| Var | Confirmed value | Action taken |
|-----|-----------------|--------------|
| `VITE_BUSINESS_MAILING_ADDRESS` | `790 E Broward Blvd, Fort Lauderdale, FL 33301` | Written to `.env.production.example` + `.env.staging.example`; server `BUSINESS_MAILING_ADDRESS` documented to match |
| `VITE_BUSINESS_NAME` | `Tradewind` (capital T, lowercase rest, per Don's confirmation) | **Wired** into `src/lib/brand.ts` (env override, falls back to "Tradewind"); declared in `vite-env.d.ts`; added to env templates + `.env.local` |
| `VITE_BUSINESS_SUPPORT_EMAIL` | ⏳ **PENDING** (Don creating dedicated Gmail; placeholder `tradewindsupport@gmail.com`) | **Wired** into `brand.ts` (env override, falls back to `don@lifeofmorr.com`). Left UNSET in templates until the inbox is live so support keeps working. |
| `VITE_SENTRY_DSN` | ⏳ **PENDING** (Don creating Sentry project) | Unchanged; still empty in templates |

## Methodology & scope

- **Code wiring** was read directly from the repo (which env var each feature reads, and how).
- **`.env.production.example`** is a *template*; its values are placeholders (`pk_live_xxx`, `123 Example St`), NOT real config.
- **`.env.local`** (local dev, gitignored) was inspected for key *presence only* (names, never values).
- **Real production values** live in **Vercel env vars** and **Supabase Function Secrets**, which are **outside this repo and cannot be read here**. Those rows are marked **CANNOT VERIFY FROM REPO → confirm in dashboard**.

Status values: `WIRED` (code reads it) · `PRESENT (local)` · `MISSING (local)` · `TEMPLATE-ONLY` (placeholder in example) · `NOT IMPLEMENTED` (spec name not found in code) · `NAME MISMATCH` · `CONFIRM IN DASHBOARD`.

---

## Requested env vars

| Spec var | Where read (code) | Code wiring | Local `.env.local` | Production (Vercel/Supabase) |
|----------|-------------------|-------------|--------------------|------------------------------|
| `STRIPE_MODE` (server) | `_shared/stripe-mode.ts:101` (Deno) | ✅ WIRED | n/a (server secret) | CONFIRM IN DASHBOARD — keep `test` until readiness green |
| `STRIPE_SECRET_KEY` | `_shared/stripe-mode.ts:102` | ✅ WIRED | n/a | CONFIRM IN DASHBOARD |
| `STRIPE_WEBHOOK_SECRET` | `stripe-webhook/index.ts` | ✅ WIRED | n/a | CONFIRM IN DASHBOARD |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `stripeMode.ts:96`, `stripe.ts:4` | ✅ WIRED | PRESENT (local) — value SET | CONFIRM IN DASHBOARD (must be `pk_live_` for live) |
| live Stripe price IDs (×7) | `stripeMode.ts:16-24` (client) / `stripe-mode.ts:21-29` (server) | ✅ WIRED | All 7 `VITE_STRIPE_PRICE_*` PRESENT (local) | CONFIRM IN DASHBOARD — 7 client + 7 server |
| `VITE_SENTRY_DSN` | `instrument.ts:13` | ✅ WIRED (graceful if unset) | MISSING (local) → Sentry off locally | ⏳ PENDING (Don creating project) → CONFIRM IN DASHBOARD |
| `VITE_APP_ENV` | — | ⚠️ **NAME MISMATCH** | — | Code reads **`VITE_ENV_NAME`**, not `VITE_APP_ENV`. Set `VITE_ENV_NAME=production`. |
| `VITE_APP_VERSION` | — | ⚠️ **NOT IMPLEMENTED** | MISSING | Not read anywhere in `src/`; not declared in `vite-env.d.ts`. Either implement or drop from the spec. |
| `VITE_BUSINESS_MAILING_ADDRESS` | `AdminOutreach.tsx:881` | ✅ WIRED | unset (local) → outreach email blocked locally (correct) | ✅ CONFIRMED value `790 E Broward Blvd, Fort Lauderdale, FL 33301`; in templates → CONFIRM SET IN DASHBOARD (+ server secret) |
| `VITE_BUSINESS_NAME` | `src/lib/brand.ts:11` | ✅ **NOW WIRED** (env override, fallback "Tradewind") | PRESENT (local) = Tradewind | ✅ CONFIRMED `Tradewind` → set in Vercel |
| `VITE_BUSINESS_SUPPORT_EMAIL` | `src/lib/brand.ts:15` | ✅ **NOW WIRED** (env override, fallback `don@lifeofmorr.com`) | unset (local) → uses fallback | ⏳ PENDING dedicated Gmail. Leave UNSET until inbox live; fallback keeps support working. |
| `VITE_FEEDBACK_CALL_URL` | `BetaCTA.tsx:18`, `BetaPage.tsx:68` | ✅ WIRED (optional; falls back to `/feedback`); **now declared in `vite-env.d.ts`** | unset (local) → CTA routes to `/feedback` | OPTIONAL — set only if using external calendar. |

---

## Server-side companions (Supabase Function Secrets) — code-wired

| Secret | Read by | Status |
|--------|---------|--------|
| `STRIPE_MODE` | stripe-mode gate | CONFIRM IN DASHBOARD |
| `STRIPE_SECRET_KEY` | stripe-mode gate | CONFIRM IN DASHBOARD |
| `STRIPE_WEBHOOK_SECRET` | stripe-webhook | CONFIRM IN DASHBOARD |
| `STRIPE_PRICE_*` (×7) | stripe-mode gate | CONFIRM IN DASHBOARD |
| `BUSINESS_MAILING_ADDRESS` | outreach-compliance / build-daily-queue | CONFIRM IN DASHBOARD (gates email scaling, 409 if missing) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | rate-limit + functions | CONFIRM IN DASHBOARD |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` | AI functions | CONFIRM IN DASHBOARD |
| `RESEND_API_KEY` / `RESEND_FROM` | send-email | CONFIRM IN DASHBOARD |

---

## Findings & required actions

1. **`VITE_APP_ENV` does not exist in code — use `VITE_ENV_NAME`.** Setting `VITE_APP_ENV=production` would have **no effect**; Sentry's environment tag reads `VITE_ENV_NAME` (`instrument.ts:14`, `telemetry.ts:11`). **Action:** set `VITE_ENV_NAME=production` in Vercel.
2. **`VITE_APP_VERSION` is not implemented.** No code reads it. **Action:** drop it from the env spec, or add a release-version wiring if you want it in Sentry releases.
3. **`VITE_BUSINESS_NAME` / `VITE_BUSINESS_SUPPORT_EMAIL` — RESOLVED (now env-driven).** `src/lib/brand.ts` now reads both with safe fallbacks. `VITE_BUSINESS_NAME=Tradewind` confirmed. `VITE_BUSINESS_SUPPORT_EMAIL` is ⏳ pending Don's dedicated Gmail — leave unset so it falls back to the current monitored `don@lifeofmorr.com`; set it once the new inbox is live. **Action:** set `VITE_BUSINESS_NAME=Tradewind` in Vercel; set support email later.
4. **Mailing address — RESOLVED (value confirmed).** Templates now carry `790 E Broward Blvd, Fort Lauderdale, FL 33301`. **Action:** set the real `VITE_BUSINESS_MAILING_ADDRESS` (Vercel) **and** `BUSINESS_MAILING_ADDRESS` (Supabase secret, must match) before any email outreach. Local dev intentionally leaves it unset (outreach stays blocked).
5. **Local dev is correctly fail-closed:** no `VITE_STRIPE_MODE` (defaults to `test`), no Sentry DSN (telemetry → console only), no mailing address (email scaling blocked). Nothing in local config can trigger real charges or non-compliant email.
6. **Production values are unverifiable from this repo.** Every `CONFIRM IN DASHBOARD` row must be checked by a human in Vercel/Supabase. The repo's all-green proof for Stripe is `/admin/payments/live-readiness` (which reads the *real* server secrets at runtime).

**Audit verdict:** Code wiring is correct and fail-closed. Business name/email are now env-driven (gap closed). Remaining naming/spec gaps: `VITE_APP_ENV` → use `VITE_ENV_NAME`; `VITE_APP_VERSION` is not implemented. Production activation remains **blocked on human-only dashboard configuration** (Stripe live keys/prices, mailing-address secrets, Sentry DSN, dedicated support inbox).
