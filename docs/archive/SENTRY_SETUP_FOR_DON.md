# SENTRY SETUP — FOR DON

_DONE-FOR-DON PRODUCTION CONFIGURATION MODE · 2026-06-03_

Sentry is **already wired in code** and is a safe no-op until a DSN is set. Your
only job is to create the project and paste the DSN into Vercel.

## What's already done (Claude verified)

- `src/instrument.ts` calls `Sentry.init` **only when `VITE_SENTRY_DSN` is set**.
  No DSN → no-op, nothing sent, SDK tree-shaken to the guard. So shipping today
  with no DSN is safe; it just isn't capturing.
- It is imported first in `src/main.tsx`, before app code, so fetch/router
  instrumentation is in place from boot.
- `environment` is taken from `VITE_ENV_NAME` (now `production` in Vercel — set
  this session). `tracesSampleRate` = 0.1 in production, 1.0 elsewhere.
- `sendDefaultPii: false`; user id/role attached explicitly via
  `src/lib/telemetry.ts`. No PII leaks by default.

> A DSN is **not** a secret in the password sense (it's embedded in the shipped
> client bundle and is write-only — it can't read your data). But treat it like
> config: set it in Vercel, don't hardcode it in source.

## Steps

1. **Create the project.** sentry.io → **Projects → Create project**.
2. **Platform:** choose **React** (the Vite/React SDK; `@sentry/react` is already
   installed). Name it e.g. `tradewind-production`. Use a **separate project from
   staging** so prod errors aren't drowned out.
3. **Copy the DSN.** Project **Settings → Client Keys (DSN)** → copy the DSN
   (looks like `https://<hash>@o<org>.ingest.sentry.io/<project>`).
4. **Add to Vercel** (Production scope):
   - Dashboard: Project → Settings → Environment Variables → add
     `VITE_SENTRY_DSN` = the DSN, scope **Production**, or
   - CLI: `vercel env add VITE_SENTRY_DSN production` then paste the DSN.
5. **Redeploy** production so the bundle is rebuilt with the DSN baked in
   (`vercel --prod`, or push to `main`). Vite env vars are build-time only — an
   env change does nothing until a rebuild.
6. **Test capture.** After deploy, trigger a test error (e.g. temporarily throw in
   a dev/preview build, or use Sentry's "Send test event" from onboarding) and
   confirm it lands in the new project with `environment: production`.

## Optional (later)

- Add **source maps** upload (Sentry Vite plugin + auth token as a build secret)
  so stack traces are de-minified. Not required to start capturing.
- Set an alert rule (email/Slack) for new issues in production.

## Checklist

| # | Item | Owner | Where | Verify |
|---|---|---|---|---|
| 1 | Sentry project created (React) | Don | sentry.io | project exists |
| 2 | DSN copied | Don | Settings → Client Keys | DSN in hand |
| 3 | `VITE_SENTRY_DSN` set | Don | Vercel → Env (Production) | `vercel env ls production` lists it |
| 4 | Production redeployed | Don | `vercel --prod` / push | new build live |
| 5 | Test event received | Don | Sentry Issues | event tagged `environment: production` |
