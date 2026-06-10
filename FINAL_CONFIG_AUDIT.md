# Final Config Audit — Tradewind Marketplace

**Date:** 2026-06-03
**Vercel project:** `tradewind-marketplace` (team-c29c835d)
**Vercel account:** authenticated as `donmondemorrison-5143`, project linked ✓
**Audit scope:** production environment readiness. No secret values printed — present/missing only.

---

## 1. Vercel Production Environment Variables

### Present
| Variable | Status | Notes |
|---|---|---|
| `VITE_APP_ENV` | ✅ present | |
| `VITE_APP_VERSION` | ✅ present | |
| `VITE_ENV_NAME` | ✅ present | drives Sentry environment tag |
| `VITE_BUSINESS_NAME` | ✅ present | overrides brand name |
| `VITE_BUSINESS_MAILING_ADDRESS` | ✅ present | **CAN-SPAM mailing address** |
| `VITE_BUSINESS_SUPPORT_EMAIL` | ✅ **present (set this audit)** | value: `donmondemorrison@gmail.com` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | ✅ present | |
| `VITE_STRIPE_PRICE_FEATURED_LISTING` | ✅ present | |
| `VITE_STRIPE_PRICE_BOOST_LISTING` | ✅ present | |
| `VITE_STRIPE_PRICE_DEALER_STARTER` | ✅ present | |
| `VITE_STRIPE_PRICE_DEALER_PRO` | ✅ present | |
| `VITE_STRIPE_PRICE_DEALER_PREMIER` | ✅ present | |
| `VITE_STRIPE_PRICE_SERVICE_PROVIDER` | ✅ present | |
| `VITE_STRIPE_PRICE_CONCIERGE` | ✅ present | |
| `VITE_SUPABASE_URL` | ✅ present | |
| `VITE_SUPABASE_ANON_KEY` | ✅ present | |

### Missing / Unset
| Variable | Status | Action |
|---|---|---|
| `VITE_SENTRY_DSN` | ⚠️ missing | **Don action required** — see §3 |
| `VITE_STRIPE_MODE` | ⬜ unset (intentional) | Defaults to `test`. Leave unset. See §4 |

---

## 2. Support Email — RESOLVED

- Was **missing** at start of audit.
- `gotradewind.com` mailbox not verified as deliverable, so per instruction the confirmed fallback was used.
- Set `VITE_BUSINESS_SUPPORT_EMAIL` = `donmondemorrison@gmail.com` (Don's confirmed email) in Production.
- Code fallback in `src/lib/brand.ts` was `don@lifeofmorr.com`; the env var now overrides it at build time.
- **Takes effect only after a production redeploy** (Vite bakes `VITE_*` vars at build time). See §6.

---

## 3. Sentry — MISSING (Don action required)

- `VITE_SENTRY_DSN` is **not set** in Vercel production.
- `src/instrument.ts` is a **safe no-op when the DSN is absent** — the app builds and runs fine; error reporting is simply disabled.
- **I cannot create accounts.** To enable error monitoring, Don must:
  1. Create a project at https://sentry.io (Platform: React).
  2. Copy the DSN.
  3. `vercel env add VITE_SENTRY_DSN production` (paste DSN), then redeploy.
- **Not a launch blocker** — app is fully functional without it; this is observability only.

---

## 4. Stripe Mode — TEST (confirmed, unchanged)

- `VITE_STRIPE_MODE` is **unset**.
- `normalizeMode()` in `src/lib/stripeMode.ts` defaults unset → `"test"`. Confirmed test mode.
- Publishable key present; client readiness logic blocks live checkout unless mode=live AND a `pk_live_` key + all live price IDs are coherent.
- **No change made.** Staying in safe test mode as instructed.

---

## 5. Build / Test / Type Status

| Check | Command | Result |
|---|---|---|
| Type check | `npm run typecheck` (`tsc --noEmit`) | ✅ **clean** (0 errors) |
| Production build | `npm run build` | ✅ **built in 4.61s** |
| Test suite | `npx vitest run` | ✅ **191 / 191 passed** (8 files) |

Build note: main chunk is 1,061 kB (300 kB gzip) — a Vite chunk-size warning, not an error. Cosmetic / future optimization only.

---

## 6. Redeploy

A `VITE_*` env var was added this audit (`VITE_BUSINESS_SUPPORT_EMAIL`). Because Vite inlines these at build time, **a redeploy is required** for the new support email to appear on the live site.

**Redeploy executed ✅** (`vercel --prod`):
- Deployment ID: `dpl_GnR4cgRAB6tpe2jef9U9hQg5sACx`
- State: `READY` · target: `production`
- Aliased: https://tradewind-marketplace.vercel.app
- The new support email is now live.

---

## Final Verdict

**🟢 GO for production in safe test mode.**

- ✅ All required config present (support email + CAN-SPAM mailing address now both set).
- ✅ Typecheck, build, and full test suite all pass.
- ✅ Stripe locked to test mode — no live payment risk.
- ⚠️ Sentry DSN missing — **optional observability**, not a blocker. Don must create the Sentry project to enable error monitoring.
- ⚠️ Support email points at `donmondemorrison@gmail.com` (Gmail fallback). Swap to `support@gotradewind.com` once that mailbox is live.

**Outstanding (Don-only) items:** create Sentry project + add DSN; optionally provision `support@gotradewind.com`.
