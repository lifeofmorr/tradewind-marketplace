# VERCEL — NON-SECRET ENV STATUS

_DONE-FOR-DON PRODUCTION CONFIGURATION MODE · 2026-06-03_

Scope: only **public, non-secret** values. Secrets (Stripe keys, webhook secret,
Supabase service-role key, Sentry DSN handling) are covered in their own docs and
were not touched here.

## Set by Claude this session (Vercel → Production scope)

| Variable | Value | Consumed by | Status |
|---|---|---|---|
| `VITE_BUSINESS_NAME` | `Tradewind` | `src/lib/brand.ts` → `BRAND.name` (header/footer) | ✅ set |
| `VITE_BUSINESS_MAILING_ADDRESS` | `790 E Broward Blvd, Fort Lauderdale, FL 33301` | `AdminOutreach.tsx` CAN-SPAM indicator | ✅ set |
| `VITE_ENV_NAME` | `production` | `src/instrument.ts` (Sentry `environment`) | ✅ set |
| `VITE_APP_VERSION` | `1.0.0` | _nothing yet — see note_ | ✅ set |

All four were added via `vercel env add <NAME> production` with the value piped on
stdin. Confirmed present via `vercel env ls production`. Values are public, so
storing them in Vercel is appropriate.

> Note on `vercel env pull`: deliberately **not run**. Pulling would write the
> full production env — including secrets — to disk on this laptop, which the
> production template forbids (hard rule #1). The `vercel env ls` confirmation is
> sufficient.

## Deviations from the literal request (honest notes)

- **`VITE_APP_ENV` → mapped to `VITE_ENV_NAME`.** The request named `VITE_APP_ENV`,
  but no code reads that. The code reads `VITE_ENV_NAME` (drives the Sentry
  environment tag). Claude set the variable the app actually consumes. If you
  specifically want `VITE_APP_ENV` to exist too, it would be dead weight — skip it.
- **`VITE_APP_VERSION` is currently inert.** Set to `1.0.0` as requested, but no
  source file references it. It does no harm; it just isn't surfaced anywhere yet.

## Support email — PENDING (Don)

`VITE_BUSINESS_SUPPORT_EMAIL` was intentionally **left UNSET**.

- `src/lib/brand.ts` falls back to the currently-monitored inbox
  `don@lifeofmorr.com` when this var is absent — so support is not broken.
- Per `.env.production.example` (lines 42–45), the dedicated inbox
  (`tradewindsupport@gmail.com`) is not live yet. **Do not set this var until that
  inbox exists and is monitored.** Once it does:
  ```
  vercel env add VITE_BUSINESS_SUPPORT_EMAIL production   # then paste the address
  ```
  followed by a redeploy.

## Already present (pre-existing, from initial setup 35d ago)

`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`, and
the 7 `VITE_STRIPE_PRICE_*` vars are already in Production. Whether the Stripe
values are test or live is governed by `STRIPE_LIVE_SETUP_FOR_DON.md`.

> `VITE_STRIPE_MODE` is **not** set in Production → the client defaults to `test`
> (`normalizeMode` in `src/lib/stripeMode.ts`). This is the correct safe default and
> was left unchanged.

## Redeploy required

These vars only take effect on the next production build. See
`STRIPE_LIVE_SETUP_FOR_DON.md` §redeploy and the final report for the command.
