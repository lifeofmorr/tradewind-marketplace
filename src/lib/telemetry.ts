// Telemetry façade over Sentry.
//
// The actual Sentry.init() happens in src/instrument.ts (imported first in
// main.tsx, before any app code, so route/fetch tracing is in place from the
// start). This module is the app-facing API: captureException/captureMessage/
// setUser delegate to Sentry when a DSN is configured, and degrade to console
// logging otherwise. Callers never import @sentry/react directly.

import { Sentry, sentryEnabled, initSentry } from "@/instrument";

const ENV: string = import.meta.env.VITE_ENV_NAME ?? import.meta.env.MODE ?? "unknown";

/**
 * Idempotent. Sentry already self-initializes on import of instrument.ts; this
 * remains for call sites (main.tsx) and guarantees init even if import order
 * changes. No-op when VITE_SENTRY_DSN is unset.
 */
export function initTelemetry(): void {
  initSentry();
}

export function captureException(err: unknown, context?: Record<string, unknown>): void {
  // eslint-disable-next-line no-console
  console.error("[telemetry]", err, context ?? {});
  if (sentryEnabled()) {
    Sentry.captureException(err, context ? { extra: context } : undefined);
  }
}

export function captureMessage(msg: string, context?: Record<string, unknown>): void {
  // eslint-disable-next-line no-console
  console.warn("[telemetry]", msg, context ?? {});
  if (sentryEnabled()) {
    Sentry.captureMessage(msg, context ? { extra: context } : undefined);
  }
}

export function setUser(
  user: { id: string; email?: string | null; role?: string | null } | null,
): void {
  if (!sentryEnabled()) return;
  Sentry.setUser(
    user
      ? { id: user.id, email: user.email ?? undefined, role: user.role ?? undefined }
      : null,
  );
}

export const telemetryEnv = ENV;
