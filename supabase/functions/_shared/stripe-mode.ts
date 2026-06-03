// Stripe mode guard — shared by edge functions that touch Stripe.
//
// Goal: make it IMPOSSIBLE to accidentally run live charges with a
// half-configured environment, and make it impossible to mix a live secret
// key with test price IDs (or vice-versa).
//
// Mode is controlled by the STRIPE_MODE secret ("test" | "live"). Default is
// "test" — live mode is opt-in and never the fallback.
//
// Fail-closed contract:
//   - STRIPE_MODE=live REQUIRES a live secret key (sk_live_…) and ALL price
//     IDs to be present. If anything is missing, checkout returns 503 and no
//     Stripe call is made.
//   - The secret-key prefix must match the mode. A test key in live mode (or
//     a live key in test mode) is rejected — this is the "never mix test
//     price IDs with live keys" guard at the key level.

export type StripeMode = "test" | "live";

// The seven price-ID secrets the checkout function depends on.
export const STRIPE_PRICE_ENVS = [
  "STRIPE_PRICE_FEATURED_LISTING",
  "STRIPE_PRICE_BOOST_LISTING",
  "STRIPE_PRICE_DEALER_STARTER",
  "STRIPE_PRICE_DEALER_PRO",
  "STRIPE_PRICE_DEALER_PREMIER",
  "STRIPE_PRICE_SERVICE_PROVIDER",
  "STRIPE_PRICE_CONCIERGE",
] as const;

export interface StripeReadiness {
  mode: StripeMode;
  keyPrefix: "sk_test" | "sk_live" | "unknown" | "missing";
  ok: boolean;
  /** Human-safe reasons the environment is not ready. Never contains secrets. */
  errors: string[];
  /** Names of required env vars that are missing. */
  missing: string[];
}

export interface StripeEnvInput {
  mode: string | undefined;
  secretKey: string | undefined;
  priceIds: Record<string, string | undefined>;
}

export function normalizeMode(raw: string | undefined): StripeMode {
  return (raw ?? "test").trim().toLowerCase() === "live" ? "live" : "test";
}

function keyPrefixOf(key: string | undefined): StripeReadiness["keyPrefix"] {
  if (!key) return "missing";
  if (key.startsWith("sk_live_") || key.startsWith("rk_live_")) return "sk_live";
  if (key.startsWith("sk_test_") || key.startsWith("rk_test_")) return "sk_test";
  return "unknown";
}

/**
 * Pure evaluation — no Deno access, so it is unit-testable. The edge wrapper
 * (`stripeReadinessFromEnv`) feeds it real secrets.
 */
export function evaluateStripeReadiness(input: StripeEnvInput): StripeReadiness {
  const mode = normalizeMode(input.mode);
  const keyPrefix = keyPrefixOf(input.secretKey);
  const errors: string[] = [];
  const missing: string[] = [];

  if (keyPrefix === "missing") {
    missing.push("STRIPE_SECRET_KEY");
    errors.push("STRIPE_SECRET_KEY is not configured.");
  }

  // Key/mode consistency — this is the core "no test/live mixing" guard.
  if (mode === "live" && keyPrefix === "sk_test") {
    errors.push("STRIPE_MODE is live but a TEST secret key is configured. Refusing to run.");
  }
  if (mode === "test" && keyPrefix === "sk_live") {
    errors.push("STRIPE_MODE is test but a LIVE secret key is configured. Refusing to run.");
  }

  // In live mode every price ID must exist, or we fail closed.
  if (mode === "live") {
    for (const name of STRIPE_PRICE_ENVS) {
      if (!input.priceIds[name]) {
        missing.push(name);
      }
    }
    if (missing.some((m) => m.startsWith("STRIPE_PRICE_"))) {
      errors.push("Live mode is enabled but one or more live price IDs are missing.");
    }
  }

  return { mode, keyPrefix, ok: errors.length === 0, errors, missing };
}

/** Read the current Stripe environment from Deno secrets and evaluate it. */
export function stripeReadinessFromEnv(): StripeReadiness {
  const priceIds: Record<string, string | undefined> = {};
  for (const name of STRIPE_PRICE_ENVS) priceIds[name] = Deno.env.get(name);
  return evaluateStripeReadiness({
    mode: Deno.env.get("STRIPE_MODE"),
    secretKey: Deno.env.get("STRIPE_SECRET_KEY"),
    priceIds,
  });
}
