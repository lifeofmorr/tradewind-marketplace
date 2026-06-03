import { describe, it, expect } from "vitest";
import {
  evaluateClientStripeReadiness,
  normalizeMode,
  STRIPE_PRICE_VITE_VARS,
  type ClientStripeEnvInput,
} from "@/lib/stripeMode";

function allPrices(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of STRIPE_PRICE_VITE_VARS) out[name] = "price_live_123";
  return out;
}

describe("normalizeMode", () => {
  it("defaults to test", () => {
    expect(normalizeMode(undefined)).toBe("test");
    expect(normalizeMode("")).toBe("test");
    expect(normalizeMode("anything")).toBe("test");
  });
  it("recognizes live (case/space-insensitive)", () => {
    expect(normalizeMode("live")).toBe("live");
    expect(normalizeMode("  LIVE ")).toBe("live");
  });
});

describe("evaluateClientStripeReadiness", () => {
  it("test mode with a test key is OK and not live-enabled", () => {
    const input: ClientStripeEnvInput = {
      mode: "test",
      publishableKey: "pk_test_abc",
      priceIds: {},
    };
    const r = evaluateClientStripeReadiness(input);
    expect(r.ok).toBe(true);
    expect(r.mode).toBe("test");
    expect(r.liveEnabled).toBe(false);
  });

  it("fails closed when live mode is set but price IDs are missing", () => {
    const input: ClientStripeEnvInput = {
      mode: "live",
      publishableKey: "pk_live_abc",
      priceIds: {},
    };
    const r = evaluateClientStripeReadiness(input);
    expect(r.ok).toBe(false);
    expect(r.liveEnabled).toBe(false);
    expect(r.missing.length).toBe(STRIPE_PRICE_VITE_VARS.length);
    expect(r.errors.some((e) => /price ids? .*missing/i.test(e))).toBe(true);
  });

  it("rejects a test key while in live mode (no mixing)", () => {
    const input: ClientStripeEnvInput = {
      mode: "live",
      publishableKey: "pk_test_abc",
      priceIds: allPrices(),
    };
    const r = evaluateClientStripeReadiness(input);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /TEST publishable key/i.test(e))).toBe(true);
  });

  it("rejects a live key while in test mode", () => {
    const input: ClientStripeEnvInput = {
      mode: "test",
      publishableKey: "pk_live_abc",
      priceIds: {},
    };
    const r = evaluateClientStripeReadiness(input);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /LIVE publishable key/i.test(e))).toBe(true);
  });

  it("is fully ready and live-enabled when live key + all price IDs are present", () => {
    const input: ClientStripeEnvInput = {
      mode: "live",
      publishableKey: "pk_live_abc",
      priceIds: allPrices(),
    };
    const r = evaluateClientStripeReadiness(input);
    expect(r.ok).toBe(true);
    expect(r.liveEnabled).toBe(true);
    expect(r.keyPrefix).toBe("pk_live");
  });

  it("flags a missing publishable key", () => {
    const r = evaluateClientStripeReadiness({ mode: "test", publishableKey: undefined, priceIds: {} });
    expect(r.ok).toBe(false);
    expect(r.missing).toContain("VITE_STRIPE_PUBLISHABLE_KEY");
  });
});
