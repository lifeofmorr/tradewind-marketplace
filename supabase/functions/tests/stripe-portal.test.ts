// @vitest-environment node
import { describe, it, expect } from "vitest";
import { createPortalHandler, type PortalDeps } from "../stripe-portal/handler.ts";

const SUPA = "https://unit.supabase.test";
const USER_ID = "00000000-0000-4000-8000-000000000001";
const DEALER_ID = "22222222-2222-4222-8222-222222222222";
const SP_ID = "33333333-3333-4333-8333-333333333333";

const ENV: Record<string, string> = {
  STRIPE_MODE: "test",
  STRIPE_SECRET_KEY: "sk_test_unit",
  SUPABASE_URL: SUPA,
  SUPABASE_SERVICE_ROLE_KEY: "service-role-unit",
  APP_URL: "https://gotradewind.com",
};

interface FakeWorld {
  user: { id: string } | null;
  rest: Record<string, unknown[]>;
  stripe: { status: number; body: unknown };
  log: Array<{ url: string; init?: RequestInit }>;
}

function makeDeps(world: FakeWorld): PortalDeps {
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
  return { env: (name) => ENV[name], fetchImpl };
}

function world(overrides: Partial<FakeWorld> = {}): FakeWorld {
  return {
    user: { id: USER_ID },
    rest: { dealers: [{ owner_id: USER_ID, stripe_customer_id: "cus_unit_1" }] },
    stripe: { status: 200, body: { url: "https://billing.stripe.com/p/session_unit" } },
    log: [],
    ...overrides,
  };
}

function post(body: unknown, auth = "Bearer jwt-unit"): Request {
  return new Request("https://edge.test/stripe-portal", {
    method: "POST",
    headers: auth ? { authorization: auth } : {},
    body: JSON.stringify(body),
  });
}

describe("stripe-portal handler", () => {
  it("rejects non-POST methods", async () => {
    const handler = createPortalHandler(makeDeps(world()));
    const res = await handler(new Request("https://edge.test/", { method: "GET" }));
    expect(res.status).toBe(405);
  });

  it("requires authentication", async () => {
    const handler = createPortalHandler(makeDeps(world({ user: null })));
    const res = await handler(post({ dealerId: DEALER_ID }));
    expect(res.status).toBe(401);
  });

  it("requires exactly one of dealerId / serviceProviderId", async () => {
    const handler = createPortalHandler(makeDeps(world()));
    expect((await handler(post({}))).status).toBe(400);
    expect((await handler(post({ dealerId: DEALER_ID, serviceProviderId: SP_ID }))).status).toBe(400);
  });

  it("rejects malformed ids and return urls", async () => {
    const handler = createPortalHandler(makeDeps(world()));
    expect((await handler(post({ dealerId: "nope" }))).status).toBe(400);
    expect((await handler(post({ dealerId: DEALER_ID, returnUrl: "javascript:x" }))).status).toBe(400);
  });

  it("refuses a dealer the caller does not own (same response as not-found)", async () => {
    const w = world({ rest: { dealers: [{ owner_id: "someone-else", stripe_customer_id: "cus_x" }] } });
    const handler = createPortalHandler(makeDeps(w));
    const res = await handler(post({ dealerId: DEALER_ID }));
    expect(res.status).toBe(403);
    const missing = world({ rest: { dealers: [] } });
    const res2 = await createPortalHandler(makeDeps(missing))(post({ dealerId: DEALER_ID }));
    expect(res2.status).toBe(403);
    expect(await res.text()).toBe(await res2.text());
  });

  it("returns 409 when the record has no stripe_customer_id yet", async () => {
    const w = world({ rest: { dealers: [{ owner_id: USER_ID, stripe_customer_id: null }] } });
    const handler = createPortalHandler(makeDeps(w));
    const res = await handler(post({ dealerId: DEALER_ID }));
    expect(res.status).toBe(409);
    expect(w.log.some((l) => l.url.includes("api.stripe.com"))).toBe(false);
  });

  it("creates a portal session for an owned dealer", async () => {
    const w = world();
    const handler = createPortalHandler(makeDeps(w));
    const res = await handler(post({ dealerId: DEALER_ID }));
    expect(res.status).toBe(200);
    expect((await res.json()).url).toBe("https://billing.stripe.com/p/session_unit");
    const stripeCall = w.log.find((l) => l.url.includes("billing_portal/sessions"))!;
    const params = new URLSearchParams(String(stripeCall.init?.body));
    expect(params.get("customer")).toBe("cus_unit_1");
    expect(params.get("return_url")).toBe("https://gotradewind.com/dashboard/billing");
  });

  it("creates a portal session for an owned service provider with a custom return url", async () => {
    const w = world({ rest: { service_providers: [{ owner_id: USER_ID, stripe_customer_id: "cus_sp_1" }] } });
    const handler = createPortalHandler(makeDeps(w));
    const res = await handler(post({ serviceProviderId: SP_ID, returnUrl: "https://gotradewind.com/dashboard" }));
    expect(res.status).toBe(200);
    const stripeCall = w.log.find((l) => l.url.includes("billing_portal/sessions"))!;
    const params = new URLSearchParams(String(stripeCall.init?.body));
    expect(params.get("customer")).toBe("cus_sp_1");
    expect(params.get("return_url")).toBe("https://gotradewind.com/dashboard");
  });

  it("maps a Stripe API failure to a sanitized 502", async () => {
    const w = world({ stripe: { status: 400, body: { error: { message: "internal detail" } } } });
    const handler = createPortalHandler(makeDeps(w));
    const res = await handler(post({ dealerId: DEALER_ID }));
    expect(res.status).toBe(502);
    expect(JSON.stringify(await res.json())).not.toContain("internal detail");
  });
});
