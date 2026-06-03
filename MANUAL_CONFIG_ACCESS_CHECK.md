# MANUAL CONFIG — ACCESS CHECK

_Generated during DONE-FOR-DON PRODUCTION CONFIGURATION MODE · 2026-06-03_

This report records what Claude Code could and could not reach from this machine,
so the rest of the configuration work has an honest baseline. **No secret values
are printed anywhere in this file** — only variable names and key prefixes.

## Summary table

| Capability | State | Who acts |
|---|---|---|
| Vercel CLI installed | ✅ v52.0.0 | — |
| Vercel authenticated | ✅ as `donmondemorrison-5143` | — |
| Vercel project linked | ✅ `tradewind-marketplace` (team `team_nYFrQVb2RV7g3ao5UpnqH8M4`) | — |
| Supabase CLI installed | ✅ v2.104.0 | — |
| Supabase CLI authenticated | ❌ no access token on this machine | **Don** (run `supabase login`) |
| Supabase project linked locally | ❌ no `supabase/.temp/project-ref` | **Don** (`supabase link`) |
| Git remote | ✅ `origin` → github.com/lifeofmorr/tradewind-marketplace | — |
| Git working tree clean | ⚠️ many tracked files modified (pre-existing, unrelated to this task) | informational |
| `.env.local` present | ✅ | — |
| `.env.production.example` present | ✅ (the production template / runbook) | — |

## What Claude could do safely

- **Read** the Vercel production env var inventory (names only).
- **Set** the four non-secret public production env vars in Vercel (Phase 2).
- **Read** all client-side env var usage in `src/` to confirm which names the
  code actually consumes.
- **Run** typecheck / tests / build locally (Phase 8).

## What Claude could NOT do (needs Don)

1. **Supabase secrets inspection (Phase 5).** The Supabase CLI is not logged in on
   this machine (no `~/.supabase/access-token`, no `SUPABASE_ACCESS_TOKEN`, and
   `supabase projects list` hangs waiting for interactive login). Claude therefore
   could not run `supabase secrets list`. See `SUPABASE_SECRET_STATUS.md`.
2. **Anything requiring secret values.** Per the rules, Claude never sets, reads,
   or prints `sk_…`, `whsec_…`, service-role keys, API keys, or DSNs.
3. **Enabling live Stripe charges.** Left in test mode by design.

## Project identifiers (non-secret)

- Vercel project: `tradewind-marketplace` (`prj_vaN5ShDtDFwjO2o6U7uTCGiELYOY`)
- Supabase project ref (from `.env.production.example`): `qwaotydaazymgnvnfuuj`
- Production domain (from `brand.ts` / template): `gotradewind.com`

## Important code-vs-request discrepancy found

The task asked for `VITE_APP_ENV` and `VITE_APP_VERSION`. A grep of `src/`
(`import.meta.env.*` plus the `env.VITE_*` indexed access in `brand.ts`) shows:

- The app reads **`VITE_ENV_NAME`** for environment naming (used by
  `src/instrument.ts` to set the Sentry `environment`). **`VITE_APP_ENV` is not
  read anywhere.** → Claude set `VITE_ENV_NAME=production` (the var the code
  actually consumes) instead of a dead `VITE_APP_ENV`.
- **`VITE_APP_VERSION` is not read by any code** today. Claude set it to `1.0.0`
  as requested (harmless, future-proofing) but it currently drives nothing.

See `VERCEL_NON_SECRET_ENV_STATUS.md` for details.
