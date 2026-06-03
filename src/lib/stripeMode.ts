// Client-side Stripe mode + readiness.
//
// The browser only ever sees PUBLIC values (publishable key, price IDs). This
// module computes whether the *client* environment is coherent so the UI can:
//   - show the current Stripe mode (test/live) in an admin banner
//   - block "Pay" buttons when live mode is enabled but not fully configured
//   - drive the /admin/payments/live-readiness checklist
//
// The authoritative server-side gate lives in
// supabase/functions/_shared/stripe-mode.ts — this is the client mirror. The
// real secret key never reaches the browser, so we can only validate the
// publishable key + price IDs here.

export type StripeMode = "test" | "live";

export const STRIPE_PRICE_VITE_VARS = [
  "VITE_STRIPE_PRICE_FEATURED_LISTING",
  "VITE_STRIPE_PRICE_BOOST_LISTING",
  "VITE_STRIPE_PRICE_DEALER_STARTER",
  "VITE_STRIPE_PRICE_DEALER_PRO",
  "VITE_STRIPE_PRICE_DEALER_PREMIER",
  "VITE_STRIPE_PRICE_SERVICE_PROVIDER",
  "VITE_STRIPE_PRICE_CONCIERGE",
] as const;

export interface ClientStripeReadiness {
  mode: StripeMode;
  keyPrefix: "pk_test" | "pk_live" | "unknown" | "missing";
  /** True when the client config is coherent and checkout may be attempted. */
  ok: boolean;
  /** True only when live mode is enabled AND coherent. */
  liveEnabled: boolean;
  errors: string[];
  /** Names of required VITE_ vars that are missing. */
  missing: string[];
}

export interface ClientStripeEnvInput {
  mode: string | undefined;
  publishableKey: string | undefined;
  priceIds: Record<string, string | undefined>;
}

export function normalizeMode(raw: string | undefined): StripeMode {
  return (raw ?? "test").trim().toLowerCase() === "live" ? "live" : "test";
}

function keyPrefixOf(key: string | undefined): ClientStripeReadiness["keyPrefix"] {
  if (!key) return "missing";
  if (key.startsWith("pk_live_")) return "pk_live";
  if (key.startsWith("pk_test_")) return "pk_test";
  return "unknown";
}

/** Pure evaluation — unit-testable, no import.meta access. */
export function evaluateClientStripeReadiness(
  input: ClientStripeEnvInput,
): ClientStripeReadiness {
  const mode = normalizeMode(input.mode);
  const keyPrefix = keyPrefixOf(input.publishableKey);
  const errors: string[] = [];
  const missing: string[] = [];

  if (keyPrefix === "missing") {
    missing.push("VITE_STRIPE_PUBLISHABLE_KEY");
    errors.push("VITE_STRIPE_PUBLISHABLE_KEY is not set.");
  }

  // Key/mode consistency — block the test/live mismatch in the browser too.
  if (mode === "live" && keyPrefix === "pk_test") {
    errors.push("Live mode is enabled but a TEST publishable key is set.");
  }
  if (mode === "test" && keyPrefix === "pk_live") {
    errors.push("Test mode is set but a LIVE publishable key is configured.");
  }

  if (mode === "live") {
    for (const name of STRIPE_PRICE_VITE_VARS) {
      if (!input.priceIds[name]) missing.push(name);
    }
    if (missing.some((m) => m.startsWith("VITE_STRIPE_PRICE_"))) {
      errors.push("Live mode is enabled but one or more live price IDs are missing.");
    }
  }

  const ok = errors.length === 0;
  return { mode, keyPrefix, ok, liveEnabled: mode === "live" && ok, errors, missing };
}

function readEnv(): ClientStripeEnvInput {
  const env = import.meta.env as Record<string, string | undefined>;
  const priceIds: Record<string, string | undefined> = {};
  for (const name of STRIPE_PRICE_VITE_VARS) priceIds[name] = env[name];
  return {
    mode: env.VITE_STRIPE_MODE,
    publishableKey: env.VITE_STRIPE_PUBLISHABLE_KEY,
    priceIds,
  };
}

/** Live readiness computed from the current browser env. */
export function clientStripeReadiness(): ClientStripeReadiness {
  return evaluateClientStripeReadiness(readEnv());
}

/** Current Stripe mode from the browser env ("test" | "live"). */
export function stripeMode(): StripeMode {
  return normalizeMode((import.meta.env as Record<string, string | undefined>).VITE_STRIPE_MODE);
}
