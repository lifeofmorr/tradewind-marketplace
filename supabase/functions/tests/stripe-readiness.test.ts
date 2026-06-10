// @vitest-environment node
import { describe, it, expect } from "vitest";
import { createReadinessHandler, type ReadinessDeps } from "../stripe-readiness/handler.ts";

const SUPA = "https://unit.supabase.test";

const ENV: Record<string, string> = {
  STRIPE_MODE: "test",
  STRIPE_SECRET_KEY: "sk_test_unit",
  SUPABASE_URL: SUPA,
  SUPABASE_SERVICE_ROLE_KEY: "service-role-unit",
};

function makeDeps(opts: { user?: { id: string } | null; role?: string }): ReadinessDeps {
  const fetchImpl: typeof fetch = async (input) => {
    const url = String(input);
    if (url.startsWith(`${SUPA}/auth/v1/user`)) {
      return opts.user
        ? new Response(JSON.stringify(opts.user), { status: 200 })
        : new Response("unauthorized", { status: 401 });
    }
    if (url.startsWith(`${SUPA}/rest/v1/profiles`)) {
      return new Response(JSON.stringify(opts.role ? [{ role: opts.role }] : []), { status: 200 });
    }
    throw new Error(`unexpected fetch in test: ${url}`);
  };
  return { env: (name) => ENV[name], fetchImpl };
}

function get(auth?: string): Request {
  return new Request("https://edge.test/stripe-readiness", {
    method: "GET",
    headers: auth ? { authorization: auth } : {},
  });
}

describe("stripe-readiness handler", () => {
  it("rejects unauthenticated callers", async () => {
    const handler = createReadinessHandler(makeDeps({ user: null }));
    expect((await handler(get())).status).toBe(403);
    expect((await handler(get("Bearer bad-jwt"))).status).toBe(403);
  });

  it("rejects authenticated non-admins", async () => {
    const handler = createReadinessHandler(makeDeps({ user: { id: "u-1" }, role: "dealer" }));
    expect((await handler(get("Bearer jwt"))).status).toBe(403);
  });

  it("returns readiness (env-var names only, never values) for admins", async () => {
    const handler = createReadinessHandler(makeDeps({ user: { id: "u-1" }, role: "admin" }));
    const res = await handler(get("Bearer jwt"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.mode).toBe("test");
    expect(body.ok).toBe(true);
    expect(body.keyPrefix).toBe("sk_test");
    // the secret value itself must never appear in the response
    expect(JSON.stringify(body)).not.toContain("sk_test_unit");
  });

  it("reports missing price IDs in live mode without leaking values", async () => {
    const deps = makeDeps({ user: { id: "u-1" }, role: "admin" });
    const liveEnv: Record<string, string> = { ...ENV, STRIPE_MODE: "live", STRIPE_SECRET_KEY: "sk_live_unit" };
    const handler = createReadinessHandler({ ...deps, env: (n) => liveEnv[n] });
    const res = await handler(get("Bearer jwt"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.missing).toContain("STRIPE_PRICE_FEATURED_LISTING");
    expect(JSON.stringify(body)).not.toContain("sk_live_unit");
  });
});
