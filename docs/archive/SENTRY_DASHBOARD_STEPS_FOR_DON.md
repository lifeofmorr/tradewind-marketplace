# SENTRY — DASHBOARD STEPS FOR DON

_Maximum done-for-Don mode · 2026-06-03 · no secrets in this file_

Code side is **fully wired and safe** (Claude verified). Your only job is the
dashboard: create the project, copy the DSN, and add it in Vercel.

## Already done in code (no action needed)
- `src/instrument.ts` runs `Sentry.init` **only when `VITE_SENTRY_DSN` is set**.
  No DSN = silent no-op (tree-shaken). So shipping now is safe; it just isn't
  capturing yet.
- Imported first in `src/main.tsx` (instruments fetch/router from boot).
- `environment` = `VITE_ENV_NAME` (now `production`); `tracesSampleRate` 0.1 in prod.
- `sendDefaultPii: false`; user id/role attached explicitly in `src/lib/telemetry.ts`.

> A Sentry DSN is embedded in the client bundle and is write-only (can't read your
> data), so it isn't a password-grade secret — but still set it as Vercel config,
> don't hardcode it. Don't paste it in chat regardless.

## Steps (all on sentry.io)

| # | Action | Where on screen |
|---|---|---|
| 1 | Create project | **Projects → Create project** |
| 2 | Choose platform **React** | platform picker (uses installed `@sentry/react`) |
| 3 | Name it `tradewind-production` (separate from staging) | create dialog |
| 4 | Copy the **DSN** | **Settings → Client Keys (DSN)** |
| 5 | Add env var in **Vercel** | **Vercel → Settings → Environment Variables → Production →** add `VITE_SENTRY_DSN` = the DSN |
| 6 | Redeploy production | Vite vars are build-time; needs a rebuild |
| 7 | Send a test event | Sentry onboarding "Send test event", confirm it shows `environment: production` |

## Platform / env var summary
- **Platform:** Vercel
- **Env var name:** `VITE_SENTRY_DSN`
- **Scope:** Production
- **Value source:** Sentry → Settings → Client Keys (DSN)

## Optional later
- Source-map upload (Sentry Vite plugin + build-time auth token as a Vercel
  secret) for de-minified stack traces.
- Alert rule for new production issues.

## Checklist
| # | Item | Platform | Verify |
|---|---|---|---|
| 1 | Project created (React) | Sentry | project exists |
| 2 | DSN copied | Sentry | DSN in hand |
| 3 | `VITE_SENTRY_DSN` set | Vercel (Production) | `vercel env ls production` lists it |
| 4 | Redeployed | Vercel | new build live |
| 5 | Test event received | Sentry | event tagged `production` |
