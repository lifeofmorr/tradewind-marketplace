// Lightweight telemetry shim.
//
// Production wires this to Sentry (or any error reporter) by reading
// VITE_SENTRY_DSN at build time. When the env var is missing, the module
// becomes a no-op so dev/local/preview builds never break.
//
// To wire Sentry:
//   1. npm i @sentry/react
//   2. set VITE_SENTRY_DSN in Vercel
//   3. uncomment the Sentry import + init below
//
// Until then, every captureException() simply logs to console.

const DSN: string | undefined = import.meta.env.VITE_SENTRY_DSN;
const ENV: string = import.meta.env.VITE_ENV_NAME ?? import.meta.env.MODE ?? "unknown";

let initialized = false;

export function initTelemetry(): void {
  if (initialized) return;
  initialized = true;
  if (!DSN) return;
  // Wire @sentry/react here once installed:
  //   Sentry.init({ dsn: DSN, environment: ENV, tracesSampleRate: 0.1 });
  // eslint-disable-next-line no-console
  console.info("[telemetry] DSN present, Sentry not yet wired");
}

export function captureException(err: unknown, context?: Record<string, unknown>): void {
  // eslint-disable-next-line no-console
  console.error("[telemetry]", err, context ?? {});
  // When Sentry is wired:
  //   Sentry.captureException(err, { extra: context });
}

export function captureMessage(msg: string, context?: Record<string, unknown>): void {
  // eslint-disable-next-line no-console
  console.warn("[telemetry]", msg, context ?? {});
  // When Sentry is wired:
  //   Sentry.captureMessage(msg, { extra: context });
}

export function setUser(user: { id: string; email?: string | null; role?: string | null } | null): void {
  if (!DSN) return;
  // When Sentry is wired:
  //   Sentry.setUser(user ? { id: user.id, email: user.email ?? undefined, role: user.role ?? undefined } : null);
}

export const telemetryEnv = ENV;
