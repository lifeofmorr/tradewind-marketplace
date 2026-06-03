// Sentry initialization — imported FIRST in main.tsx, before any app code, so
// the SDK can instrument fetch/history/etc. from the very start.
//
// Sentry only initializes when VITE_SENTRY_DSN is set. With no DSN (local dev,
// preview builds without the secret) this is a no-op and ships effectively
// nothing — @sentry/react is tree-shaken to the init guard.
//
// Wiring of captureException / setUser lives in src/lib/telemetry.ts, which
// delegates here. See SENTRY_SETUP.md.

import * as Sentry from "@sentry/react";

const DSN: string | undefined = import.meta.env.VITE_SENTRY_DSN;
const ENV: string = import.meta.env.VITE_ENV_NAME ?? import.meta.env.MODE ?? "unknown";

let started = false;

/** True once Sentry.init has actually run (DSN present). */
export function sentryEnabled(): boolean {
  return started;
}

export function initSentry(): void {
  if (started) return;
  if (!DSN) return; // no DSN → stay a no-op
  Sentry.init({
    dsn: DSN,
    environment: ENV,
    // Route + navigation tracing for a React Router (BrowserRouter) app.
    integrations: [Sentry.browserTracingIntegration()],
    // Sample 10% of transactions in production; everything in non-prod.
    tracesSampleRate: ENV === "production" ? 0.1 : 1.0,
    // Don't send PII by default; we attach user id/role explicitly via setUser.
    sendDefaultPii: false,
  });
  started = true;
}

// Initialize on import so instrumentation is in place before React mounts.
initSentry();

export { Sentry };
