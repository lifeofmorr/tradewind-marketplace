# Sentry Setup

Client-side error + performance monitoring for the React app. Wired so it is a
**no-op until `VITE_SENTRY_DSN` is set** — local dev and preview builds without
the secret ship effectively nothing.

## Components

| Piece | Location | Role |
|-------|----------|------|
| `@sentry/react` | dependency (`package.json`) | SDK |
| `src/instrument.ts` | init | `Sentry.init()` guarded by DSN; route tracing; imported first in `main.tsx` |
| `src/lib/telemetry.ts` | façade | `captureException` / `captureMessage` / `setUser` delegate to Sentry |
| `src/components/ui/ErrorBoundary.tsx` | error boundary | `componentDidCatch` → `captureException` → Sentry |
| `src/contexts/AuthContext.tsx` | user context | `setUser({id,email,role})` on auth change |

## How it initializes

`src/instrument.ts` runs `initSentry()` on import and is the **first** import in
`src/main.tsx`, so instrumentation is in place before React mounts:

```ts
import "./instrument"; // must be first
```

`initSentry()` only calls `Sentry.init()` when `VITE_SENTRY_DSN` is present.
Config:

- `environment` = `VITE_ENV_NAME` (falls back to Vite `MODE`)
- `integrations: [Sentry.browserTracingIntegration()]` — automatic pageload +
  navigation (route) tracing for the BrowserRouter app
- `tracesSampleRate` = `0.1` in production, `1.0` elsewhere
- `sendDefaultPii: false` — we attach `{ id, email, role }` explicitly via
  `setUser`, nothing implicit

## Error boundaries

The app's `ErrorBoundary` (used at the app root in `main.tsx` and around every
lazy route in `App.tsx`) forwards caught errors to Sentry through
`captureException`. No separate Sentry boundary is needed — capture happens
wherever the existing boundary catches.

## Enabling Sentry

1. Create a project at sentry.io (one per environment is recommended).
2. Copy the DSN.
3. Set `VITE_SENTRY_DSN` in Vercel:
   - **Production** scope → production project DSN
   - **Preview** scope → staging project DSN (keeps noise isolated)
4. Optionally set `VITE_ENV_NAME` (`production` / `staging` / `local`) so events
   are tagged with the right environment.
5. Re-deploy. Without a DSN, nothing is sent.

## Verifying

In a build with the DSN set, trigger a thrown error (or call
`captureMessage("sentry smoke test")` from the console via the telemetry module)
and confirm it appears in the Sentry issues stream within ~1 minute, tagged with
the right `environment` and (if signed in) the user id/role.

## Source maps (optional, recommended)

For readable stack traces, upload source maps at build time with
`@sentry/vite-plugin` and a `SENTRY_AUTH_TOKEN` build secret. Not wired here to
keep the build dependency-free; add it when you want de-minified traces.
