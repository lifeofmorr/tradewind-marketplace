// @vitest-environment node
//
// Unit tests for the _shared edge-function helpers: CORS, the LLM wrapper
// (Anthropic with OpenAI fallback), the rate limiter, and the CAN-SPAM
// compliance helpers.
import { describe, it, expect, afterEach, vi } from "vitest";
import {
  installDeno,
  installFetchMock,
  anthropicResponse,
  baseEnv,
  json,
  SUPA_URL,
} from "./helpers/edge-harness.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

async function loadShared<T>(env: Record<string, string | undefined>, importer: () => Promise<T>): Promise<T> {
  vi.resetModules();
  installDeno(env);
  return importer();
}

// ─────────────────────────────── cors.ts ──────────────────────────────────

describe("_shared/cors", () => {
  const load = () => loadShared(baseEnv(), () => import("../_shared/cors.ts"));

  it("echoes allow-listed origins", async () => {
    const { buildCorsHeaders } = await load();
    const req = new Request("https://edge.test/fn", {
      headers: { origin: "https://gotradewind.com" },
    });
    expect(buildCorsHeaders(req)["Access-Control-Allow-Origin"]).toBe("https://gotradewind.com");
  });

  it("allows Vercel preview origins by pattern", async () => {
    const { buildCorsHeaders } = await load();
    const req = new Request("https://edge.test/fn", {
      headers: { origin: "https://tradewind-abc123.vercel.app" },
    });
    expect(buildCorsHeaders(req)["Access-Control-Allow-Origin"]).toBe("https://tradewind-abc123.vercel.app");
  });

  it("omits the allow-origin header for unknown origins (browser blocks)", async () => {
    const { buildCorsHeaders } = await load();
    const req = new Request("https://edge.test/fn", {
      headers: { origin: "https://evil.example.com" },
    });
    expect(buildCorsHeaders(req)["Access-Control-Allow-Origin"]).toBeUndefined();
    expect(buildCorsHeaders(req)["Vary"]).toBe("Origin");
  });

  it("honors extra origins from ALLOWED_ORIGINS env", async () => {
    const { buildCorsHeaders } = await loadShared(
      baseEnv({ ALLOWED_ORIGINS: "https://staging.gotradewind.com, https://other.example" }),
      () => import("../_shared/cors.ts"),
    );
    const req = new Request("https://edge.test/fn", {
      headers: { origin: "https://staging.gotradewind.com" },
    });
    expect(buildCorsHeaders(req)["Access-Control-Allow-Origin"]).toBe("https://staging.gotradewind.com");
  });

  it("handleOptions answers preflight and passes through other methods", async () => {
    const { handleOptions } = await load();
    const pre = handleOptions(new Request("https://edge.test/fn", { method: "OPTIONS" }));
    expect(pre?.status).toBe(200);
    expect(handleOptions(new Request("https://edge.test/fn", { method: "POST" }))).toBeNull();
  });

  it("jsonResponse / errorResponse set status + content type", async () => {
    const { jsonResponse, errorResponse } = await load();
    const ok = jsonResponse({ a: 1 }, 201);
    expect(ok.status).toBe(201);
    expect(ok.headers.get("content-type")).toContain("application/json");
    expect(await ok.json()).toEqual({ a: 1 });

    const err = errorResponse("boom", 418);
    expect(err.status).toBe(418);
    expect(await err.json()).toEqual({ error: "boom" });
  });
});

// ───────────────────────────── anthropic.ts ───────────────────────────────

describe("_shared/anthropic", () => {
  it("calls Anthropic and returns text + usage", async () => {
    const { callLLM } = await loadShared(baseEnv(), () => import("../_shared/anthropic.ts"));
    const fetchMock = installFetchMock((call) =>
      call.url.startsWith("https://api.anthropic.com/") ? anthropicResponse("hello") : undefined,
    );
    const out = await callLLM({ system: "sys", user: "hi", responseFormat: "json" });
    expect(out).toMatchObject({ text: "hello", provider: "anthropic", inputTokens: 11, outputTokens: 22 });
    const body = fetchMock.to("api.anthropic.com")[0].body as Record<string, unknown>;
    expect(String(body.system)).toContain("ONLY valid JSON"); // json mode appended
  });

  it("falls back to OpenAI when Anthropic fails and a key is configured", async () => {
    const { callLLM } = await loadShared(
      baseEnv({ OPENAI_API_KEY: "sk-openai-unit" }),
      () => import("../_shared/anthropic.ts"),
    );
    installFetchMock(
      (call) =>
        call.url.startsWith("https://api.anthropic.com/")
          ? new Response("overloaded", { status: 529 })
          : undefined,
      (call) =>
        call.url.startsWith("https://api.openai.com/")
          ? json({
              choices: [{ message: { content: "fallback answer" } }],
              usage: { prompt_tokens: 5, completion_tokens: 7 },
              model: "gpt-4o-mini",
            })
          : undefined,
    );
    const out = await callLLM({ system: "sys", user: "hi" });
    expect(out.provider).toBe("openai");
    expect(out.text).toBe("fallback answer");
  });

  it("throws the Anthropic error when no fallback key exists", async () => {
    const { callLLM } = await loadShared(baseEnv(), () => import("../_shared/anthropic.ts"));
    installFetchMock((call) =>
      call.url.startsWith("https://api.anthropic.com/")
        ? new Response("bad key", { status: 401 })
        : undefined,
    );
    await expect(callLLM({ system: "s", user: "u" })).rejects.toThrow(/anthropic 401/);
  });

  it("throws when no LLM key is configured at all", async () => {
    const { callLLM } = await loadShared(
      baseEnv({ ANTHROPIC_API_KEY: undefined }),
      () => import("../_shared/anthropic.ts"),
    );
    installFetchMock();
    await expect(callLLM({ system: "s", user: "u" })).rejects.toThrow(/No LLM API key/);
  });

  it("parseJSON strips code fences and parses", async () => {
    const { parseJSON } = await loadShared(baseEnv(), () => import("../_shared/anthropic.ts"));
    expect(parseJSON('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(parseJSON('{"b":2}')).toEqual({ b: 2 });
    expect(() => parseJSON("not json")).toThrow();
  });
});

// ───────────────────────────── rate-limit.ts ──────────────────────────────

describe("_shared/rate-limit", () => {
  it("clientIp prefers x-forwarded-for's first hop", async () => {
    const { clientIp } = await loadShared(baseEnv(), () => import("../_shared/rate-limit.ts"));
    expect(
      clientIp(new Request("https://e.test", { headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" } })),
    ).toBe("1.2.3.4");
    expect(clientIp(new Request("https://e.test", { headers: { "x-real-ip": "9.9.9.9" } }))).toBe("9.9.9.9");
    expect(clientIp(new Request("https://e.test"))).toBe("unknown");
  });

  it("consults the RPC and propagates a denial", async () => {
    const { checkRateLimit } = await loadShared(baseEnv(), () => import("../_shared/rate-limit.ts"));
    const fetchMock = installFetchMock((call) =>
      call.url.includes("/rpc/edge_rate_limit_hit")
        ? json([{ allowed: false, remaining: 0, retry_after: 120 }])
        : undefined,
    );
    const result = await checkRateLimit("fn:auth:user-1", "auth");
    expect(result).toMatchObject({ allowed: false, remaining: 0, retryAfter: 120, degraded: false });
    const rpcBody = fetchMock.to("/rpc/")[0].body as Record<string, unknown>;
    expect(rpcBody.p_key).toBe("fn:auth:user-1");
    expect(rpcBody.p_limit).toBe(20); // auth scope = 20/hour
  });

  it("fails OPEN when the limiter backend is unconfigured", async () => {
    const { checkRateLimit } = await loadShared(
      baseEnv({ SUPABASE_URL: undefined, SUPABASE_SERVICE_ROLE_KEY: undefined }),
      () => import("../_shared/rate-limit.ts"),
    );
    installFetchMock();
    const result = await checkRateLimit("k", "public");
    expect(result.allowed).toBe(true);
    expect(result.degraded).toBe(true);
  });

  it("fails OPEN when the RPC errors", async () => {
    const { checkRateLimit } = await loadShared(baseEnv(), () => import("../_shared/rate-limit.ts"));
    installFetchMock((call) =>
      call.url.includes("/rpc/") ? new Response("oops", { status: 500 }) : undefined,
    );
    const result = await checkRateLimit("k", "public");
    expect(result.allowed).toBe(true);
    expect(result.degraded).toBe(true);
  });

  it("tooManyRequests builds a 429 with rate headers", async () => {
    const { tooManyRequests } = await loadShared(baseEnv(), () => import("../_shared/rate-limit.ts"));
    const res = tooManyRequests(new Request("https://e.test"), {
      allowed: false,
      remaining: 0,
      retryAfter: 60,
      scope: "public",
      degraded: false,
    });
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    expect(res.headers.get("X-RateLimit-Limit")).toBe("5");
  });

  it("enforceAiRateLimit keys authenticated callers by user id", async () => {
    const { enforceAiRateLimit } = await loadShared(baseEnv(), () => import("../_shared/rate-limit.ts"));
    const fetchMock = installFetchMock(
      (call) => (call.url.includes("/auth/v1/user") ? json({ id: "user-77", email: "x@y.z" }) : undefined),
      (call) =>
        call.url.includes("/rpc/edge_rate_limit_hit")
          ? json([{ allowed: true, remaining: 19, retry_after: 0 }])
          : undefined,
    );
    const verdict = await enforceAiRateLimit(
      new Request("https://e.test", { headers: { authorization: "Bearer jwt" } }),
      "my-fn",
    );
    expect(verdict).toBeNull();
    const rpcBody = fetchMock.to("/rpc/")[0].body as Record<string, unknown>;
    expect(rpcBody.p_key).toBe("my-fn:auth:user-77");
  });
});

// ───────────────────────── outreach-compliance.ts ─────────────────────────

describe("_shared/outreach-compliance", () => {
  const ADDRESS = "100 Harbor Way, Miami FL 33101";

  it("canSpamReady reflects the configured mailing address", async () => {
    const without = await loadShared(baseEnv(), () => import("../_shared/outreach-compliance.ts"));
    expect(without.canSpamReady()).toBe(false);

    const blank = await loadShared(
      baseEnv({ BUSINESS_MAILING_ADDRESS: "   " }),
      () => import("../_shared/outreach-compliance.ts"),
    );
    expect(blank.canSpamReady()).toBe(false);

    const withAddr = await loadShared(
      baseEnv({ BUSINESS_MAILING_ADDRESS: ADDRESS }),
      () => import("../_shared/outreach-compliance.ts"),
    );
    expect(withAddr.canSpamReady()).toBe(true);
    expect(withAddr.getBusinessMailingAddress()).toBe(ADDRESS);
  });

  it("appends address + opt-out to email bodies missing one", async () => {
    const { appendCanSpamFooter } = await loadShared(
      baseEnv({ BUSINESS_MAILING_ADDRESS: ADDRESS }),
      () => import("../_shared/outreach-compliance.ts"),
    );
    const out = appendCanSpamFooter("Plain pitch with no compliance language.", "email");
    expect(out).toContain("I won't follow up");
    expect(out).toContain(`Tradewind · ${ADDRESS}`);
  });

  it("does not duplicate an existing opt-out line", async () => {
    const { appendCanSpamFooter } = await loadShared(
      baseEnv({ BUSINESS_MAILING_ADDRESS: ADDRESS }),
      () => import("../_shared/outreach-compliance.ts"),
    );
    const body = "Pitch. If this isn't relevant, no worries — just tell me and I won't follow up.";
    const out = appendCanSpamFooter(body, "email");
    expect(out.match(/won't follow up/g)).toHaveLength(1);
    expect(out).toContain(ADDRESS);
  });

  it("leaves non-email channels untouched (CAN-SPAM is email-only)", async () => {
    const { appendCanSpamFooter } = await loadShared(
      baseEnv({ BUSINESS_MAILING_ADDRESS: ADDRESS }),
      () => import("../_shared/outreach-compliance.ts"),
    );
    expect(appendCanSpamFooter("dm text", "linkedin")).toBe("dm text");
    expect(appendCanSpamFooter("dm text", "instagram")).toBe("dm text");
  });
});

// Sanity: the harness env helper exposes the canonical test URL.
describe("edge-harness", () => {
  it("baseEnv provides the Supabase URL used by route matchers", () => {
    expect(baseEnv().SUPABASE_URL).toBe(SUPA_URL);
  });
});
