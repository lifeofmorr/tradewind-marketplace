# SUPABASE SECRET STATUS

_DONE-FOR-DON PRODUCTION CONFIGURATION MODE · 2026-06-03_

## ⚠️ Could not inspect from Claude Code

The Supabase CLI is installed (v2.104.0) but **not authenticated on this machine**:

- no `~/.supabase/access-token`
- no `SUPABASE_ACCESS_TOKEN` env var
- `supabase projects list` / `supabase secrets list` hang waiting for interactive
  login (so Claude could not run `secrets list` to report present/missing).

**This means the present/missing column below is UNVERIFIED.** It is the list of
secrets the deployed edge functions actually read (from `Deno.env.get(...)` in
`supabase/functions/`), not a live readout. You must confirm against the dashboard.

## How to inspect yourself (name-only, no values printed)

```bash
supabase login                                   # opens browser; one-time
supabase secrets list --project-ref qwaotydaazymgnvnfuuj
```

`secrets list` prints **names + a digest only — never the values**, so it is safe
to run and paste.

## Required secrets (what the edge functions consume)

Project ref: **`qwaotydaazymgnvnfuuj`** · Dashboard path:
**Project → Edge Functions → Secrets** (or
`supabase secrets set --project-ref qwaotydaazymgnvnfuuj KEY=value`).

### Payments (Stripe) — needed before live charges

| Secret | Purpose | Set when |
|---|---|---|
| `STRIPE_MODE` | `test`/`live` gate; must match `VITE_STRIPE_MODE` | keep `test` until go-live |
| `STRIPE_SECRET_KEY` | server charges (`sk_live_…` in live) | go-live |
| `STRIPE_WEBHOOK_SECRET` | verify webhook signatures (`whsec_…`) | go-live |
| `STRIPE_PRICE_FEATURED_LISTING` … `STRIPE_PRICE_CONCIERGE` (7) | live price IDs, must match Vercel `VITE_STRIPE_PRICE_*` | go-live |

### Core platform — needed now

| Secret | Purpose |
|---|---|
| `SUPABASE_URL` | self-reference for service calls |
| `SUPABASE_SERVICE_ROLE_KEY` | privileged DB access — **never leaves Supabase, never log** |
| `SUPABASE_ANON_KEY` | anon client in functions |
| `APP_URL` | absolute links in emails/redirects → `https://gotradewind.com` |
| `ALLOWED_ORIGINS` | CORS allow-list → `https://gotradewind.com,https://www.gotradewind.com` |

### Outreach / CAN-SPAM — gates email scaling

| Secret | Purpose |
|---|---|
| `BUSINESS_MAILING_ADDRESS` | CAN-SPAM physical address. `build-daily-queue` **refuses to draft email until set.** Value: `790 E Broward Blvd, Fort Lauderdale, FL 33301` (confirmed). Must match `VITE_BUSINESS_MAILING_ADDRESS`. |
| `RESEND_API_KEY` | transactional/outreach sender |
| `RESEND_FROM` | verified sender, e.g. `Tradewind <hello@gotradewind.com>` |

### AI providers — used by AI features

| Secret | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | primary model (e.g. `claude-sonnet-4-6`) |
| `OPENAI_API_KEY` / `OPENAI_FALLBACK_MODEL` | fallback (e.g. `gpt-4o-mini`) |

### Financing (Plaid) — used by FinancialHub / bank link

| Secret | Purpose |
|---|---|
| `PLAID_CLIENT_ID` / `PLAID_SECRET` / `PLAID_ENV` | bank linking; `PLAID_ENV=production` for live |

## What needs review (Don)

1. **Authenticate the CLI** and run `supabase secrets list` to get the true
   present/missing state, then reconcile against the table above.
2. **`BUSINESS_MAILING_ADDRESS`** — confirm it is set server-side to the exact
   confirmed address so outreach drafting is unblocked and email footers are
   CAN-SPAM compliant. (The client mirror `VITE_BUSINESS_MAILING_ADDRESS` was set
   in Vercel this session.)
3. **Stripe secrets** stay test until go-live (see `STRIPE_LIVE_SETUP_FOR_DON.md`).
4. **Service-role key** must exist but must never be copied into Vercel, logs, or
   chat.
