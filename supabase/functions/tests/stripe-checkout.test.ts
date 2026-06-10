// @vitest-environment node
import { describe, it, expect } from "vitest";
import { createCheckoutHandler, type CheckoutDeps } from "../stripe-checkout/handler.ts";

const SUPA = "https://unit.supabase.test";
const USER_ID = "00000000-0000-4000-8000-000000000001";
const LISTING_ID = "11111111-1111-4111-8111-111111111111";
const DEALER_ID = "22222222-2222-4222-8222-222222222222";

const BASE_ENV: Record<string, string> = {
  STRIPE_MODE: "test",
  STRIPE_SECRET_KEY: "sk_test_unit",
  SUPABASE_URL: SUPA,
  SUPABASE_SERVICE_ROLE_KEY: "service-role-unit",
  APP_URL: "https://gotradewind.com",
  STRIPE_PRICE_FEATURED_LISTING: "price_featured",
  STRIPE_PRICE_BOOST_LISTING: "price_boost",
  STRIPE_PRICE_DEALER_STARTER: "price_starter",
  STRIPE_PRICE_DEALER_PRO: "price_pro",
  STRIPE_PRICE_DEALER_PREMIER: "price_premier",
  STRIPE_PRICE_SERVICE_PROVIDER: "price_service",
  STRIPE_PRICE_CONCIERGE: "price_concierge",
};

interface FetchLog { url: string; init?: RequestInit }

interface FakeWorld {
  /** authenticated user returned by /auth/v1/user, or null for 401 */
  user: { id: string; email?: string } | null;
  /** rows returned by /rest/v1/<table>?… queries, keyed by table name */
  rest: Record<string, unknown[]>;
  /** Stripe response */
  stripe: { status: number; body: unknown };
  log: FetchLog[];
}

function makeDeps(world: FakeWorld, env: Record<string, string> = BASE_ENV): CheckoutDeps {
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    world.log.push({ url, init: init ?? undefined });
    if (url.startsWith(`${SUPA}/auth/v1/user`)) {
      return world.user
        ? new Response(JSON.stringify(world.user), { status: 200 })
        : new Response("unauthorized", { status: 401 });
    }
    if (url.startsWith(`${SUPA}/rest/v1/`)) {
      const table = url.slice(`${SUPA}/rest/v1/`.length).split("?")[0];
      return new Response(JSON.stringify(world.rest[table] ?? []), { status: 200 });
    }
    if (url.startsWith("https://api.stripe.com/")) {
      return new Response(JSON.stringify(world.stripe.body), { status: world.stripe.status });
    }
    throw new Error(`unexpected fetch in test: ${url}`);
  };
  return { env: (name) => env[name], fetchImpl };
}

function post(body: unknown, headers: Record<string, string> = { authorization: "Bearer jwt-unit" }): Request {
  return new Request("https://edge.test/stripe-checkout", {
    method: "POST",
    headers: { ...headers, origin: "https://gotradewind.com" },
    body: JSON.stringify(body),
  });
}

function world(overrides: Partial<FakeWorld> = {}): FakeWorld {
  return {
    user: { id: USER_ID, email: "don@example.com" },
    rest: {},
    stripe: { status: 200, body: { id: "cs_test_1", url: "https://checkout.stripe.com/c/pay/cs_test_1" } },
    log: [],
    ...overrides,
  };
}

describe("stripe-checkout handler", () => {
  it("answers OPTIONS preflight with CORS headers", async () => {
    const handler = createCheckoutHandler(makeDeps(world()));
    const res = await handler(new Request("https://edge.test/", {
      method: "OPTIONS", headers: { origin: "https://gotradewind.com" },
    }));
    expect(res.status).toBe(200);
    expect(res.headers.get("access-control-allow-origin")).toBe("https://gotradewind.com");
  });

  it("rejects non-POST methods", async () => {
    const handler = createCheckoutHandler(makeDeps(world()));
    const res = await handler(new Request("https://edge.test/", { method: "GET" }));
    expect(res.status).toBe(405);
  });

  it("fails closed (503, no Stripe call) when live mode is half-configured", async () => {
    const w = world();
    const env = { ...BASE_ENV, STRIPE_MODE: "live", STRIPE_SECRET_KEY: "sk_live_unit" };
    delete (env as Record<string, string | undefined>).STRIPE_PRICE_CONCIERGE;
    const handler = createCheckoutHandler(makeDeps(w, env));
    const res = await handler(post({ kind: "concierge" }));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.stripe_mode).toBe("live");
    expect(body.missing).toContain("STRIPE_PRICE_CONCIERGE");
    expect(w.log).toHaveLength(0); // never reached auth or Stripe
  });

  it("fails closed when a live key is configured in test mode (no mixing)", async () => {
    const env = { ...BASE_ENV, STRIPE_SECRET_KEY: "sk_live_unit" };
    const handler = createCheckoutHandler(makeDeps(world(), env));
    const res = await handler(post({ kind: "concierge" }));
    expect(res.status).toBe(503);
  });

  it("requires authentication", async () => {
    const handler = createCheckoutHandler(makeDeps(world({ user: null })));
    const res = await handler(post({ kind: "concierge" }));
    expect(res.status).toBe(401);
  });

  it("rejects a request with no Authorization header without calling Supabase", async () => {
    const w = world();
    const handler = createCheckoutHandler(makeDeps(w));
    const res = await handler(post({ kind: "concierge" }, {}));
    expect(res.status).toBe(401);
    expect(w.log).toHaveLength(0);
  });

  it("rejects invalid JSON, missing kind, and unknown kind", async () => {
    const handler = createCheckoutHandler(makeDeps(world()));
    const bad = await handler(new Request("https://edge.test/", {
      method: "POST", headers: { authorization: "Bearer jwt" }, body: "not json",
    }));
    expect(bad.status).toBe(400);
    expect((await handler(post({}))).status).toBe(400);
    expect((await handler(post({ kind: "free_money" }))).status).toBe(400);
  });

  it("rejects malformed ids and urls", async () => {
    const handler = createCheckoutHandler(makeDeps(world()));
    const badId = await handler(post({ kind: "featured_listing", listingId: "1; DROP TABLE listings" }));
    expect(badId.status).toBe(400);
    const badUrl = await handler(post({ kind: "concierge", successUrl: "javascript:alert(1)" }));
    expect(badUrl.status).toBe(400);
  });

  it("refuses to feature a listing the caller does not own", async () => {
    const w = world({ rest: { listings: [{ seller_id: "someone-else" }] } });
    const handler = createCheckoutHandler(makeDeps(w));
    const res = await handler(post({ kind: "featured_listing", listingId: LISTING_ID }));
    expect(res.status).toBe(403);
    expect(w.log.some((l) => l.url.includes("api.stripe.com"))).toBe(false);
  });

  it("refuses a dealer subscription for a dealer the caller does not own", async () => {
    const w = world({ rest: { dealers: [{ owner_id: "someone-else" }] } });
    const handler = createCheckoutHandler(makeDeps(w));
    const res = await handler(post({ kind: "dealer_pro", dealerId: DEALER_ID }));
    expect(res.status).toBe(403);
  });

  it("creates a payment-mode session for an owned featured listing", async () => {
    const w = world({ rest: { listings: [{ seller_id: USER_ID }] } });
    const handler = createCheckoutHandler(makeDeps(w));
    const res = await handler(post({ kind: "featured_listing", listingId: LISTING_ID }));
    expect(res.status).toBe(200);
    expect((await res.json()).url).toMatch(/^https:\/\/checkout\.stripe\.com\//);

    const stripeCall = w.log.find((l) => l.url.includes("api.stripe.com"))!;
    const params = new URLSearchParams(String(stripeCall.init?.body));
    expect(params.get("mode")).toBe("payment");
    expect(params.get("line_items[0][price]")).toBe("price_featured");
    expect(params.get("metadata[kind]")).toBe("featured_listing");
    expect(params.get("metadata[user_id]")).toBe(USER_ID);
    expect(params.get("metadata[listing_id]")).toBe(LISTING_ID);
    expect(params.get("customer_email")).toBe("don@example.com");
    // sends the secret key as the bearer, never in the body
    const headers = stripeCall.init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer sk_test_unit");
  });

  it("creates a subscription-mode session with promo codes for dealer tiers", async () => {
    const w = world({ rest: { dealers: [{ owner_id: USER_ID }] } });
    const handler = createCheckoutHandler(makeDeps(w));
    const res = await handler(post({ kind: "dealer_pro", dealerId: DEALER_ID }));
    expect(res.status).toBe(200);
    const stripeCall = w.log.find((l) => l.url.includes("api.stripe.com"))!;
    const params = new URLSearchParams(String(stripeCall.init?.body));
    expect(params.get("mode")).toBe("subscription");
    expect(params.get("allow_promotion_codes")).toBe("true");
    expect(params.get("line_items[0][price]")).toBe("price_pro");
  });

  it("defaults success/cancel URLs to APP_URL", async () => {
    const w = world();
    const handler = createCheckoutHandler(makeDeps(w));
    await handler(post({ kind: "concierge" }));
    const stripeCall = w.log.find((l) => l.url.includes("api.stripe.com"))!;
    const params = new URLSearchParams(String(stripeCall.init?.body));
    expect(params.get("success_url")).toContain("https://gotradewind.com/checkout/success");
    expect(params.get("cancel_url")).toBe("https://gotradewind.com/checkout/cancel");
  });

  it("maps a Stripe API failure to a sanitized 502", async () => {
    const w = world({ stripe: { status: 402, body: { error: { message: "secret internals" } } } });
    const handler = createCheckoutHandler(makeDeps(w));
    const res = await handler(post({ kind: "concierge" }));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(JSON.stringify(body)).not.toContain("secret internals");
  });
});
