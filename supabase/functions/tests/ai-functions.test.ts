// @vitest-environment node
//
// Request-level tests for the seven AI edge functions. The real index.ts
// modules run via the Deno shim in helpers/edge-harness.ts; the Anthropic
// API and the rate-limit RPC are served by the fetch mock.
import { describe, it, expect, afterEach, vi } from "vitest";
import {
  loadEdgeFunction,
  installFetchMock,
  anthropicRoute,
  rateLimitRoute,
  baseEnv,
  type EdgeHandler,
} from "./helpers/edge-harness.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

function post(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("https://edge.test/fn", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

interface AiFnSpec {
  name: string;
  importer: () => Promise<unknown>;
  /** Valid request body for the happy path. */
  validBody: unknown;
  /** Body that should fail field validation with this error fragment. */
  invalidBody: unknown;
  invalidError: RegExp;
  /** What the "model" answers on the happy path. */
  llmText: string;
  /** Assertions on the parsed happy-path response. */
  expectHappy: (json: Record<string, unknown>) => void;
}

const SPECS: AiFnSpec[] = [
  {
    name: "ai-buyer-assistant",
    importer: () => import("../ai-buyer-assistant/index.ts"),
    validBody: {
      messages: [{ role: "user", content: "I want a center console under 200k" }],
      context: { saved_listing_ids: ["a", "b"] },
    },
    invalidBody: { messages: [] },
    invalidError: /messages required/,
    llmText: "A Regulator 28 or a Grady-White Canyon 271 would fit that budget.",
    expectHappy: (json) => {
      expect(json.reply).toContain("Regulator 28");
      expect((json._meta as Record<string, unknown>).provider).toBe("anthropic");
    },
  },
  {
    name: "ai-concierge-intake",
    importer: () => import("../ai-concierge-intake/index.ts"),
    validBody: { messages: [{ role: "user", content: "Looking for a yacht, 1-2M, Florida" }] },
    invalidBody: {},
    invalidError: /messages required/,
    llmText: JSON.stringify({
      category: "yacht",
      budget_min_cents: 100_000_000,
      budget_max_cents: 200_000_000,
      desired_features: ["flybridge"],
      timeline: "3 months",
      preferred_locations: ["FL"],
      next_question: null,
    }),
    expectHappy: (json) => {
      const intake = json.intake as Record<string, unknown>;
      expect(intake.category).toBe("yacht");
      expect(intake.budget_max_cents).toBe(200_000_000);
      expect(intake.next_question).toBeNull();
    },
  },
  {
    name: "ai-fraud-check",
    importer: () => import("../ai-fraud-check/index.ts"),
    validBody: { email: "x@y.com", message: "Is this still available? wire transfer ok" },
    invalidBody: "{not json",
    invalidError: /Invalid JSON/,
    llmText: JSON.stringify({
      score: 85,
      signals: ["wire transfer mention", "no context"],
      recommended_action: "block",
    }),
    expectHappy: (json) => {
      expect(json.score).toBe(85);
      expect(json.recommended_action).toBe("block");
      expect(json.signals).toContain("wire transfer mention");
    },
  },
  {
    name: "ai-listing-autopilot",
    importer: () => import("../ai-listing-autopilot/index.ts"),
    validBody: { category: "boat", title: "2019 Whaler", price_cents: 9_500_000 },
    invalidBody: { title: "no category" },
    invalidError: /category required/,
    llmText: JSON.stringify({
      suggested_title: "2019 Boston Whaler 280 Outrage — Twin V300s",
      suggested_description: "x".repeat(900),
      missing_specs: ["engine hours"],
      price_assessment: "Reads as fair.",
      quality_tips: ["Add an engine-hour reading"],
    }),
    expectHappy: (json) => {
      expect(json.suggested_title).toContain("280 Outrage");
      expect(json.missing_specs).toEqual(["engine hours"]);
      expect(json._disclaimer).toMatch(/Advisory only/);
    },
  },
  {
    name: "ai-listing-generator",
    importer: () => import("../ai-listing-generator/index.ts"),
    validBody: { prompt: "2021 MasterCraft X24, 210 hours, fresh service", category: "boat" },
    invalidBody: { prompt: "no category" },
    invalidError: /prompt \+ category required/,
    llmText: JSON.stringify({
      title: "2021 MasterCraft X24 — 210 Hours",
      description: "y".repeat(850),
      ai_summary: "Low-hour wake boat.",
      make: "MasterCraft",
      model: "X24",
      year: 2021,
      suggested_price_cents: 13_900_000,
    }),
    expectHappy: (json) => {
      const draft = json.draft as Record<string, unknown>;
      expect(draft.title).toContain("MasterCraft X24");
      expect(draft.suggested_price_cents).toBe(13_900_000);
      expect((json._meta as Record<string, unknown>).tokens_out).toBe(22);
    },
  },
  {
    name: "ai-negotiation-assistant",
    importer: () => import("../ai-negotiation-assistant/index.ts"),
    validBody: {
      listing_price_cents: 10_000_000,
      offer_amount_cents: 9_000_000,
      category: "car",
      deal_score: 72,
    },
    invalidBody: { listing_price_cents: 10_000_000, category: "car" },
    invalidError: /offer_amount_cents/,
    llmText: JSON.stringify({
      fair_range: { low_cents: 8_800_000, high_cents: 9_600_000, label: "Fair band" },
      negotiation_message: "msg",
      counteroffer_message: "counter",
      deal_analysis: "Reasonable.",
    }),
    expectHappy: (json) => {
      const range = json.fair_range as Record<string, unknown>;
      expect(range.low_cents).toBe(8_800_000);
      expect(json.counteroffer_message).toBe("counter");
      expect(json._disclaimer).toMatch(/Advisory only/);
    },
  },
  {
    name: "ai-pricing-estimate",
    importer: () => import("../ai-pricing-estimate/index.ts"),
    validBody: { category: "boat", make: "Boston Whaler", model: "320 Vantage", year: 2019 },
    invalidBody: { category: "boat", make: "Boston Whaler" },
    invalidError: /category, make, model, year required/,
    // Wrapped in code fences on purpose — parseJSON must strip them.
    llmText: '```json\n{"median_cents": 28500000, "low_cents": 24000000, "high_cents": 33000000, "comp_count": 14, "rationale": "Hours dominate."}\n```',
    expectHappy: (json) => {
      expect(json.median_cents).toBe(28_500_000);
      expect(json.comp_count).toBe(14);
    },
  },
];

describe.each(SPECS)("$name", (spec) => {
  async function load(env = baseEnv()): Promise<EdgeHandler> {
    return loadEdgeFunction(env, spec.importer);
  }

  it("answers OPTIONS preflight", async () => {
    const handler = await load();
    installFetchMock();
    const res = await handler(new Request("https://edge.test/fn", { method: "OPTIONS" }));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
  });

  it("rejects non-POST methods with 405", async () => {
    const handler = await load();
    installFetchMock();
    const res = await handler(new Request("https://edge.test/fn", { method: "GET" }));
    expect(res.status).toBe(405);
  });

  it("returns 429 with Retry-After when rate limited", async () => {
    const handler = await load();
    installFetchMock(rateLimitRoute(false, 540));
    const res = await handler(post(spec.validBody));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("540");
    const body = await res.json();
    expect(body.error).toMatch(/rate limit/i);
  });

  it("rejects malformed JSON with 400", async () => {
    const handler = await load();
    installFetchMock(rateLimitRoute());
    const res = await handler(post("{nope"));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/Invalid JSON/);
  });

  it("validates required fields", async () => {
    const handler = await load();
    installFetchMock(rateLimitRoute());
    const res = await handler(post(spec.invalidBody));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(spec.invalidError);
  });

  it("returns the model output on the happy path", async () => {
    const handler = await load();
    const fetchMock = installFetchMock(rateLimitRoute(), anthropicRoute(spec.llmText));
    const res = await handler(post(spec.validBody));
    expect(res.status).toBe(200);
    spec.expectHappy(await res.json());
    // The Anthropic call must carry the API key + model.
    const llmCalls = fetchMock.to("api.anthropic.com");
    expect(llmCalls).toHaveLength(1);
    expect(llmCalls[0].headers["x-api-key"]).toBe("sk-ant-unit");
    expect((llmCalls[0].body as Record<string, unknown>).model).toBe("claude-sonnet-4-6");
  });

  it("returns 500 when the LLM call fails and no fallback is configured", async () => {
    const handler = await load();
    installFetchMock(rateLimitRoute(), (call) =>
      call.url.startsWith("https://api.anthropic.com/")
        ? new Response("overloaded", { status: 529 })
        : undefined,
    );
    const res = await handler(post(spec.validBody));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/anthropic 529/);
  });
});
