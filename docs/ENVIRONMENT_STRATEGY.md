# Environment Strategy — TradeWind

Three logical environments — **local**, **staging**, **production**. Goal: **no live customer data ever touches dev or staging**, no live charges from staging.

## Logical separation

| Layer | local | staging | production |
|---|---|---|---|
| Frontend host | `vite dev` @ :5173 | Vercel Preview (PR / `staging` branch) | Vercel Prod (`main`) |
| Supabase project | local docker OR shared dev project | `tradewind-staging` (separate project) | `qwaotydaazymgnvnfuuj` (current live) |
| Stripe | TEST keys | TEST keys | LIVE keys |
| Plaid | sandbox | sandbox | production |
| Anthropic | dev key | dev key | prod key (separate billing) |
| Resend | sandbox sender | sandbox sender | verified domain sender |
| Domain | localhost:5173 | tradewind-marketplace.vercel.app | gotradewind.com |

> **Hard rule:** the production Supabase project is never accessed from a developer laptop. Local dev points at the local Docker Supabase or a dedicated dev project — never live.

## Vercel project setup

A single Vercel project, three environments:

| Vercel scope | Branch | Stripe | Supabase project |
|---|---|---|---|
| Production | `main` | live | live |
| Preview | all other branches | test | staging |
| Development | local | test | local docker |

Vars are scoped by environment in Vercel → Settings → Environment Variables. **Never** copy a `production` var into `preview`.

## Required env vars

See `.env.local.example`, `.env.staging.example`, `.env.production.example` for the canonical lists. The frontend reads `import.meta.env.VITE_*`. The Supabase edge functions read non-VITE vars from Supabase Function Secrets.

### Frontend (Vercel)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_STRIPE_PRICE_*` (7 SKUs)
- `VITE_GOOGLE_MAPS_API_KEY` (optional)
- `VITE_SENTRY_DSN` (optional — build does not break if missing)
- `VITE_ENV_NAME` (optional — surfaced in UI footer)

### Supabase Edge Function Secrets
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_*` (7 SKUs, mirrors frontend)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (never expose to client)
- `SUPABASE_ANON_KEY`
- `APP_URL`
- `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` (default `claude-sonnet-4-6`)
- `OPENAI_API_KEY`, `OPENAI_FALLBACK_MODEL` (optional fallback)
- `RESEND_API_KEY`, `RESEND_FROM`
- `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV` (`sandbox` / `production`)
- `ALLOWED_ORIGINS` (optional — comma-separated additions to default allow-list)

## Webhook URLs

| Service | URL pattern |
|---|---|
| Stripe webhook | `https://<supabase-project>.supabase.co/functions/v1/stripe-webhook` |
| Auction cron | `https://<supabase-project>.supabase.co/functions/v1/auction-end` (called by pg_cron every 5 min) |
| Sitemap | `https://gotradewind.com/sitemap.xml` (Vercel rewrite → Supabase) |

Stripe Dashboard webhook endpoints: **two separate endpoints**, one each on the staging and production Supabase projects. Each gets its own `STRIPE_WEBHOOK_SECRET`. **Never reuse a webhook secret across environments.**

## Partner sandboxes

- Plaid: `PLAID_ENV=sandbox` until production credentials granted.
- Aircraft API providers (Globe.aero, Flightradar24): demo keys until vendor approval.
- Lender / insurance partners: sandbox endpoints until contracts signed.

## Test-vs-live golden rules

1. Production Supabase service-role key lives **only** in Supabase Function Secrets — never in Vercel, never on disk.
2. Stripe live mode flips on **after** dry-run on staging with at least one test card cycle + refund cycle.
3. No seeding scripts target the production project. `supabase/seed.sql` is dev/staging only.
4. `is_demo = true` listings stay flagged in production for transparency.

## Promotion flow

```
local → push branch → preview deploy → manual QA on staging
      → squash-merge to main → production deploy → smoke test
      → tag release (RELEASE_CHECKLIST.md)
```

All migrations applied to staging Supabase first, smoke-tested, then re-applied to production via `supabase db push --linked` (see `DATABASE_OPERATIONS.md`).
