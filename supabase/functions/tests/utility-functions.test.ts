// @vitest-environment node
//
// Request-level tests for vin-decode, photo-enhance, plaid-link, and
// partner-quote.
import { describe, it, expect, afterEach, vi } from "vitest";
import {
  loadEdgeFunction,
  installFetchMock,
  authUserRoute,
  baseEnv,
  json,
  SUPA_URL,
} from "./helpers/edge-harness.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

const USER = { id: "00000000-0000-4000-8000-000000000001", email: "don@example.com" };

function post(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("https://edge.test/fn", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const AUTHED = { authorization: "Bearer user-jwt" };

describe("vin-decode", () => {
  const load = () => loadEdgeFunction(baseEnv(), () => import("../vin-decode/index.ts"));

  it("answers OPTIONS preflight", async () => {
    const handler = await load();
    installFetchMock();
    const res = await handler(new Request("https://edge.test/fn", { method: "OPTIONS" }));
    expect(res.status).toBe(200);
  });

  it("rejects VINs that are not 17 characters", async () => {
    const handler = await load();
    installFetchMock();
    for (const vin of [undefined, "", "SHORT", "X".repeat(18)]) {
      const res = await handler(post({ vin }));
      expect(res.status).toBe(400);
      expect((await res.json()).error).toMatch(/Invalid VIN/);
    }
  });

  it("decodes a VIN via the NHTSA vPIC API", async () => {
    const handler = await load();
    const vin = "1FTFW1ET5DFC10312";
    const fetchMock = installFetchMock((call) =>
      call.url.startsWith("https://vpic.nhtsa.dot.gov/")
        ? json({
            Results: [
              { VariableId: 26, Value: "FORD" },
              { VariableId: 28, Value: "F-150" },
              { VariableId: 29, Value: "2013" },
              { VariableId: 24, Value: "Gasoline" },
              { VariableId: 143, Value: "0" },
              { VariableId: 9, Value: "" }, // empty values map to null
            ],
          })
        : undefined,
    );
    const res = await handler(post({ vin }));
    expect(res.status).toBe(200);
    const decoded = await res.json();
    expect(decoded).toMatchObject({
      vin,
      make: "FORD",
      model: "F-150",
      year: "2013",
      fuel_type: "Gasoline",
      error_code: "0",
      engine_cylinders: null,
      raw_count: 6,
    });
    expect(fetchMock.to("vpic.nhtsa.dot.gov")[0].url).toContain(vin);
  });

  it("returns 500 when the NHTSA call blows up", async () => {
    const handler = await load();
    installFetchMock((call) => {
      if (call.url.startsWith("https://vpic.nhtsa.dot.gov/")) throw new Error("vpic down");
      return undefined;
    });
    const res = await handler(post({ vin: "1FTFW1ET5DFC10312" }));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/vpic down/);
  });
});

describe("photo-enhance", () => {
  const load = () => loadEdgeFunction(baseEnv(), () => import("../photo-enhance/index.ts"));

  it("requires a url", async () => {
    const handler = await load();
    installFetchMock();
    const res = await handler(post({}));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/url required/);
  });

  it("rejects non-image content types", async () => {
    const handler = await load();
    installFetchMock((call) =>
      call.method === "HEAD"
        ? new Response(null, { status: 200, headers: { "content-type": "text/html" } })
        : undefined,
    );
    const res = await handler(post({ url: "https://cdn.test/page.html" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/expected image\/\*/);
  });

  it("rejects URLs whose HEAD check fails", async () => {
    const handler = await load();
    installFetchMock((call) =>
      call.method === "HEAD" ? new Response(null, { status: 404 }) : undefined,
    );
    const res = await handler(post({ url: "https://cdn.test/missing.jpg" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/not OK/);
  });

  it("returns the enhancement plan for a valid image, with boat hint", async () => {
    const handler = await load();
    installFetchMock((call) =>
      call.method === "HEAD"
        ? new Response(null, { status: 200, headers: { "content-type": "image/jpeg" } })
        : undefined,
    );
    const res = await handler(post({ url: "https://cdn.test/boat.jpg", hints: { isBoat: true } }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBe("https://cdn.test/boat.jpg");
    expect(body.enhancements).toContain("auto-crop");
    expect(body.enhancements).toContain("waterline-cleanup");
    expect(body._meta.provider).toBe("placeholder");
  });

  it("omits the waterline pass without the boat hint", async () => {
    const handler = await load();
    installFetchMock((call) =>
      call.method === "HEAD"
        ? new Response(null, { status: 200, headers: { "content-type": "image/png" } })
        : undefined,
    );
    const res = await handler(post({ url: "https://cdn.test/car.png" }));
    const body = await res.json();
    expect(body.enhancements).not.toContain("waterline-cleanup");
  });
});

describe("plaid-link", () => {
  const sandboxEnv = () => baseEnv(); // no PLAID_CLIENT_ID/SECRET → sandbox
  const liveEnv = () =>
    baseEnv({ PLAID_CLIENT_ID: "plaid-client", PLAID_SECRET: "plaid-secret", PLAID_ENV: "sandbox" });

  it("rejects unauthenticated callers with 401", async () => {
    const handler = await loadEdgeFunction(sandboxEnv(), () => import("../plaid-link/index.ts"));
    installFetchMock(authUserRoute(null));
    const res = await handler(post({ action: "create_link_token" }));
    expect(res.status).toBe(401);
    expect((await res.json()).error).toMatch(/Unauthorized/);
  });

  it("returns a sandbox link token tied to the AUTHENTICATED user", async () => {
    const handler = await loadEdgeFunction(sandboxEnv(), () => import("../plaid-link/index.ts"));
    installFetchMock(authUserRoute(USER));
    const res = await handler(
      post({ action: "create_link_token", user_id: "attacker-id" }, AUTHED),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sandbox).toBe(true);
    expect(body.link_token).toContain(USER.id); // body-supplied user_id ignored
    expect(body.link_token).not.toContain("attacker-id");
  });

  it("simulates a sandbox public-token exchange", async () => {
    const handler = await loadEdgeFunction(sandboxEnv(), () => import("../plaid-link/index.ts"));
    installFetchMock(authUserRoute(USER));
    const res = await handler(post({ action: "exchange_public_token", public_token: "pt" }, AUTHED));
    const body = await res.json();
    expect(body.sandbox).toBe(true);
    expect(body.access_token).toMatch(/^sandbox-access-/);
    expect(body.item_id).toMatch(/^sandbox-item-/);
  });

  it("rejects unknown actions", async () => {
    const handler = await loadEdgeFunction(sandboxEnv(), () => import("../plaid-link/index.ts"));
    installFetchMock(authUserRoute(USER));
    const res = await handler(post({ action: "steal_tokens" }, AUTHED));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/Unknown action/);
  });

  it("calls the real Plaid API with the authed user when credentials are set", async () => {
    const handler = await loadEdgeFunction(liveEnv(), () => import("../plaid-link/index.ts"));
    const fetchMock = installFetchMock(authUserRoute(USER), (call) =>
      call.url.startsWith("https://sandbox.plaid.com/link/token/create")
        ? json({ link_token: "link-real-123", expiration: "2026-06-10T00:00:00Z" })
        : undefined,
    );
    const res = await handler(post({ action: "create_link_token" }, AUTHED));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.link_token).toBe("link-real-123");
    expect(body.sandbox).toBe(false);
    const plaidCall = fetchMock.to("plaid.com")[0].body as Record<string, unknown>;
    expect(plaidCall.client_id).toBe("plaid-client");
    expect((plaidCall.user as Record<string, unknown>).client_user_id).toBe(USER.id);
  });
});

describe("partner-quote", () => {
  const load = () => loadEdgeFunction(baseEnv(), () => import("../partner-quote/index.ts"));

  /** Routes the Supabase REST traffic the function performs. */
  function restRoutes(inserts: Record<string, unknown>[], patches: Record<string, unknown>[]) {
    return (call: { url: string; method: string; body: unknown }) => {
      if (!call.url.startsWith(`${SUPA_URL}/rest/v1/partner_quote_requests`)) return undefined;
      if (call.method === "POST") {
        inserts.push(call.body as Record<string, unknown>);
        return json({ id: "req-1", ...(call.body as Record<string, unknown>) }, 201);
      }
      if (call.method === "PATCH") {
        patches.push(call.body as Record<string, unknown>);
        return json([], 200);
      }
      return undefined;
    };
  }

  it("rejects unauthenticated callers with 401", async () => {
    const handler = await load();
    installFetchMock(authUserRoute(null));
    const res = await handler(post({ partner_type: "lender" }));
    expect(res.status).toBe(401);
  });

  it("requires a partner_type and rejects unknown types", async () => {
    const handler = await load();
    installFetchMock(authUserRoute(USER));
    const missing = await handler(post({}, AUTHED));
    expect(missing.status).toBe(400);
    expect((await missing.json()).error).toMatch(/partner_type required/);

    const unknown = await handler(post({ partner_type: "crypto_bro" }, AUTHED));
    expect(unknown.status).toBe(400);
    expect((await unknown.json()).error).toMatch(/Unknown partner_type/);
  });

  it("stores the request under the AUTHED user and returns a sandbox quote", async () => {
    const handler = await load();
    const inserts: Record<string, unknown>[] = [];
    const patches: Record<string, unknown>[] = [];
    installFetchMock(authUserRoute(USER), restRoutes(inserts, patches));
    const res = await handler(
      post(
        {
          partner_type: "lender",
          listing_id: "listing-9",
          details: { price_cents: 8_400_000 },
          user_id: "attacker-id",
        },
        AUTHED,
      ),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.request_id).toBe("req-1");
    expect(body.status).toBe("quoted");
    expect(body.sandbox).toBe(true);
    expect(body.quote.provider).toBe("Sandbox Lending Co.");
    expect(body.quote.apr).toBe(7.49);
    // monthly = price/84 * 1.08
    expect(body.quote.monthly_cents).toBe(Math.round((8_400_000 / 84) * 1.08));

    expect(inserts).toHaveLength(1);
    expect(inserts[0].user_id).toBe(USER.id); // never the body-supplied id
    expect(inserts[0].partner_type).toBe("lender");
    expect(patches).toHaveLength(1);
    expect(patches[0].status).toBe("quoted");
  });

  it("computes type-specific sandbox quotes with floors", async () => {
    const handler = await load();
    const inserts: Record<string, unknown>[] = [];
    const patches: Record<string, unknown>[] = [];
    installFetchMock(authUserRoute(USER), restRoutes(inserts, patches));

    // Cheap asset → insurance floor of $1,200/yr kicks in.
    const res = await handler(
      post({ partner_type: "insurance", details: { price_cents: 100_000 } }, AUTHED),
    );
    const body = await res.json();
    expect(body.quote.annual_cents).toBe(120_000);
    expect(body.quote.provider).toBe("Sandbox Insurance Group");
  });

  it("surfaces database insert failures as 500", async () => {
    const handler = await load();
    installFetchMock(authUserRoute(USER), (call) =>
      call.url.startsWith(`${SUPA_URL}/rest/v1/partner_quote_requests`)
        ? json({ message: "permission denied", code: "42501" }, 403)
        : undefined,
    );
    const res = await handler(post({ partner_type: "escrow" }, AUTHED));
    expect(res.status).toBe(500);
  });
});
