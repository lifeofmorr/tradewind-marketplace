// @vitest-environment node
//
// Request-level tests for classify-outreach-reply, generate-outreach-message,
// and build-daily-queue.
import { describe, it, expect, afterEach, vi } from "vitest";
import {
  loadEdgeFunction,
  installFetchMock,
  anthropicRoute,
  rateLimitRoute,
  authUserRoute,
  baseEnv,
  json,
  SUPA_URL,
  type FetchCall,
} from "./helpers/edge-harness.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

const ADMIN = { id: "admin-1", email: "don@example.com" };
const AUTHED = { authorization: "Bearer admin-jwt" };

function post(body: unknown, headers: Record<string, string> = {}): Request {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  return new Request("https://edge.test/fn", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "content-length": String(payload.length),
      ...headers,
    },
    body: payload,
  });
}

// ───────────────────────── classify-outreach-reply ────────────────────────

describe("classify-outreach-reply", () => {
  const load = () => loadEdgeFunction(baseEnv(), () => import("../classify-outreach-reply/index.ts"));

  interface World {
    replies: Record<string, unknown>[];
    leadPatches: { url: string; body: Record<string, unknown> }[];
    followupPatches: { url: string; body: Record<string, unknown> }[];
    activity: Record<string, unknown>[];
  }

  function world(): World {
    return { replies: [], leadPatches: [], followupPatches: [], activity: [] };
  }

  function restRoutes(w: World) {
    return (call: FetchCall) => {
      const { url, method } = call;
      if (url.startsWith(`${SUPA_URL}/rest/v1/outreach_replies`)) {
        w.replies.push(call.body as Record<string, unknown>);
        return json([], 201);
      }
      if (url.startsWith(`${SUPA_URL}/rest/v1/outreach_leads`) && method === "PATCH") {
        w.leadPatches.push({ url, body: call.body as Record<string, unknown> });
        return json([], 200);
      }
      if (url.startsWith(`${SUPA_URL}/rest/v1/outreach_followups`) && method === "PATCH") {
        w.followupPatches.push({ url, body: call.body as Record<string, unknown> });
        return json([], 200);
      }
      if (url.startsWith(`${SUPA_URL}/rest/v1/outreach_activity_log`)) {
        w.activity.push(call.body as Record<string, unknown>);
        return json([], 201);
      }
      return undefined;
    };
  }

  it("requires an authorization header", async () => {
    const handler = await load();
    installFetchMock();
    const res = await handler(post({ lead_id: "l-1", reply_text: "hi", channel: "email" }));
    expect(res.status).toBe(401);
  });

  it("validates lead_id and reply_text", async () => {
    const handler = await load();
    installFetchMock(authUserRoute(ADMIN), rateLimitRoute());
    const res = await handler(post({ lead_id: "l-1", channel: "email" }, AUTHED));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/lead_id and reply_text required/);
  });

  it("classifies a demo request: reply stored, lead patched to 'Book demo'", async () => {
    const handler = await load();
    const w = world();
    installFetchMock(
      authUserRoute(ADMIN),
      rateLimitRoute(),
      restRoutes(w),
      anthropicRoute(
        JSON.stringify({
          reply_type: "wants_demo",
          recommended_response: "Happy to show you — would [TIME_1] or [TIME_2] work?",
          confidence: 0.93,
        }),
      ),
    );
    const res = await handler(
      post({ lead_id: "l-1", reply_text: "Sure, can you show me how it works?", channel: "email" }, AUTHED),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.reply_type).toBe("wants_demo");
    expect(body.do_not_contact_set).toBe(false);

    expect(w.replies[0]).toMatchObject({ lead_id: "l-1", reply_type: "wants_demo", status: "new" });
    expect(w.leadPatches[0].body).toMatchObject({ status: "replied", next_action: "Book demo" });
    expect(w.followupPatches).toHaveLength(0); // nothing to cancel
    expect(w.activity[0]).toMatchObject({ action: "reply_classified" });
  });

  it("sets do_not_contact and cancels follow-ups on an opt-out", async () => {
    const handler = await load();
    const w = world();
    installFetchMock(
      authUserRoute(ADMIN),
      rateLimitRoute(),
      restRoutes(w),
      anthropicRoute(
        JSON.stringify({ reply_type: "remove_me", recommended_response: "Understood — removed.", confidence: 0.99 }),
      ),
    );
    const res = await handler(
      post({ lead_id: "l-2", reply_text: "Unsubscribe me please.", channel: "email" }, AUTHED),
    );
    const body = await res.json();
    expect(body.do_not_contact_set).toBe(true);
    expect(w.leadPatches[0].body).toMatchObject({
      do_not_contact: true,
      next_action: "Confirmed opt-out — do not contact",
    });
    expect(w.followupPatches).toHaveLength(1);
    expect(w.followupPatches[0].body).toEqual({ status: "cancelled" });
    expect(w.followupPatches[0].url).toContain("lead_id=eq.l-2");
  });

  it("coerces unknown reply types from the model to 'other'", async () => {
    const handler = await load();
    const w = world();
    installFetchMock(
      authUserRoute(ADMIN),
      rateLimitRoute(),
      restRoutes(w),
      anthropicRoute(
        JSON.stringify({ reply_type: "hallucinated_type", recommended_response: "?", confidence: 0.2 }),
      ),
    );
    const res = await handler(post({ lead_id: "l-3", reply_text: "k", channel: "email" }, AUTHED));
    expect((await res.json()).reply_type).toBe("other");
  });

  it("returns 500 when classification fails", async () => {
    const handler = await load();
    installFetchMock(authUserRoute(ADMIN), rateLimitRoute(), (call) =>
      call.url.startsWith("https://api.anthropic.com/")
        ? new Response("nope", { status: 500 })
        : undefined,
    );
    const res = await handler(post({ lead_id: "l-4", reply_text: "hello", channel: "email" }, AUTHED));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/classify failed/);
  });
});

// ───────────────────────── generate-outreach-message ──────────────────────

describe("generate-outreach-message", () => {
  const load = () => loadEdgeFunction(baseEnv(), () => import("../generate-outreach-message/index.ts"));

  const LEAD = {
    company: "Harbor Marine Group",
    contact_name: "Alex",
    vertical: "boat_dealer",
    location: "Tampa, FL",
    personalization_angle: "They just expanded their center-console inventory.",
  };

  const CLEAN_BODY =
    "Alex — noticed Harbor Marine just expanded the center-console side of the lot. " +
    "I'm Don, building Tradewind, a marketplace for boats, exotic cars, and aircraft, and dealers " +
    "get verified profiles plus serious inquiries routed to real stock. " +
    "Would you be open to a quick 10-minute look and giving honest feedback? " +
    "If this isn't relevant, no worries — just tell me and I won't follow up.\n— Don, Tradewind";

  it("validates lead and channel", async () => {
    const handler = await load();
    installFetchMock(rateLimitRoute());
    const noLead = await handler(post({ channel: "email", lead: { company: "X" } }));
    expect(noLead.status).toBe(400);
    expect((await noLead.json()).error).toMatch(/lead\.company and lead\.vertical required/);

    const badChannel = await handler(post({ channel: "fax", lead: LEAD }));
    expect(badChannel.status).toBe(400);
    expect((await badChannel.json()).error).toMatch(/channel must be/);
  });

  it("generates a clean message with quality + tone scores", async () => {
    const handler = await load();
    const fetchMock = installFetchMock(
      rateLimitRoute(),
      anthropicRoute(
        JSON.stringify({
          subject: "your center-console inventory",
          body: CLEAN_BODY,
          personalization_note: "Inventory expansion hook",
          cta: "Would you be open to a quick 10-minute look and giving honest feedback?",
        }),
      ),
    );
    const res = await handler(post({ channel: "email", lead: LEAD }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.subject).toBe("your center-console inventory");
    expect(body.issues).toEqual([]);
    expect(body.ai_tone_risk_score).toBe(0);
    expect(body.quality_score).toBe(100);
    expect(body.provider).toBe("anthropic");
    // The lead context must reach the prompt.
    const llmBody = fetchMock.to("api.anthropic.com")[0].body as { messages: { content: string }[] };
    expect(llmBody.messages[0].content).toContain("Harbor Marine Group");
    expect(llmBody.messages[0].content).toContain("center-console inventory");
  });

  it("flags buzzwords and overpromises in the model output", async () => {
    const handler = await load();
    installFetchMock(
      rateLimitRoute(),
      anthropicRoute(
        JSON.stringify({
          subject: "s",
          body:
            "I hope this finds you well. Our revolutionary platform has guaranteed results " +
            "and will supercharge your dealership. " + CLEAN_BODY,
          personalization_note: "",
          cta: "",
        }),
      ),
    );
    const res = await handler(post({ channel: "email", lead: LEAD }));
    const body = await res.json();
    expect(body.ai_tone_risk_score).toBeGreaterThan(0);
    expect(body.issues.join(" ")).toMatch(/buzzwords/);
    expect(body.issues.join(" ")).toMatch(/overpromise/);
    expect(body.quality_score).toBeLessThan(100);
  });

  it("returns 502 when the model returns an empty body", async () => {
    const handler = await load();
    installFetchMock(
      rateLimitRoute(),
      anthropicRoute(JSON.stringify({ subject: "s", body: "", personalization_note: "", cta: "" })),
    );
    const res = await handler(post({ channel: "email", lead: LEAD }));
    expect(res.status).toBe(502);
    expect((await res.json()).error).toMatch(/no body/);
  });

  it("respects the outreach rate limit", async () => {
    const handler = await load();
    installFetchMock(rateLimitRoute(false, 3600));
    const res = await handler(post({ channel: "email", lead: LEAD }));
    expect(res.status).toBe(429);
  });
});

// ──────────────────────────── build-daily-queue ───────────────────────────

describe("build-daily-queue", () => {
  const env = (extra: Record<string, string> = {}) =>
    baseEnv({ BUSINESS_MAILING_ADDRESS: "100 Harbor Way, Miami FL 33101", ...extra });
  const load = (e = env()) => loadEdgeFunction(e, () => import("../build-daily-queue/index.ts"));

  function lead(i: number, overrides: Record<string, unknown> = {}) {
    return {
      id: `lead-${i}`,
      company: `Company ${i}`,
      contact_name: "Pat",
      contact_role: "Owner",
      vertical: "boat_dealer",
      email: `pat${i}@example.com`,
      location: "Miami, FL",
      website: null,
      personalization_angle: "Strong center-console mix.",
      pain_point: null,
      recommended_offer: null,
      notes: null,
      status: "new",
      date_contacted: null,
      follow_up_date: null,
      priority: 3,
      lead_score: 80,
      do_not_contact: false,
      email_verification_status: "likely_valid",
      ...overrides,
    };
  }

  interface World {
    leads: Record<string, unknown>[];
    existingDrafts: Record<string, { id: string }[]>;
    aiResponse: { status: number; body: unknown } | "throw";
    messages: Record<string, unknown>[];
    leadPatches: { url: string; body: Record<string, unknown> }[];
    followups: Record<string, unknown>[];
    activity: Record<string, unknown>[];
  }

  function world(overrides: Partial<World> = {}): World {
    return {
      leads: [lead(1)],
      existingDrafts: {},
      aiResponse: {
        status: 200,
        body: {
          subject: "your inventory",
          body: "Short honest note. Would you be open to a quick 10-minute look? " +
            "If this isn't relevant, no worries — just tell me and I won't follow up.",
          personalization_note: "n",
          cta: "c",
          quality_score: 96,
          ai_tone_risk_score: 0,
        },
      },
      messages: [],
      leadPatches: [],
      followups: [],
      activity: [],
      ...overrides,
    };
  }

  function routes(w: World) {
    return (call: FetchCall) => {
      const { url, method } = call;
      if (url.startsWith(`${SUPA_URL}/rest/v1/outreach_leads`) && method === "GET") {
        return json(w.leads);
      }
      if (url.startsWith(`${SUPA_URL}/rest/v1/outreach_leads`) && method === "PATCH") {
        w.leadPatches.push({ url, body: call.body as Record<string, unknown> });
        return json([], 200);
      }
      if (url.startsWith(`${SUPA_URL}/rest/v1/outreach_messages`) && method === "GET") {
        const leadId = url.match(/lead_id=eq\.([^&]+)/)?.[1] ?? "";
        return json(w.existingDrafts[leadId] ?? []);
      }
      if (url.startsWith(`${SUPA_URL}/rest/v1/outreach_messages`) && method === "POST") {
        w.messages.push(call.body as Record<string, unknown>);
        return json([{ id: `msg-${w.messages.length}` }], 201);
      }
      if (url.startsWith(`${SUPA_URL}/rest/v1/outreach_followups`) && method === "GET") {
        return json([]);
      }
      if (url.startsWith(`${SUPA_URL}/rest/v1/outreach_followups`) && method === "POST") {
        w.followups.push(call.body as Record<string, unknown>);
        return json([{ id: "fu-1" }], 201);
      }
      if (url.startsWith(`${SUPA_URL}/rest/v1/outreach_activity_log`)) {
        w.activity.push(call.body as Record<string, unknown>);
        return json([], 201);
      }
      if (url.startsWith(`${SUPA_URL}/functions/v1/generate-outreach-message`)) {
        if (w.aiResponse === "throw") throw new Error("network down");
        return json(w.aiResponse.body, w.aiResponse.status);
      }
      return undefined;
    };
  }

  it("requires an authorization header", async () => {
    const handler = await load();
    installFetchMock();
    const res = await handler(post({}));
    expect(res.status).toBe(401);
  });

  it("refuses to draft email outreach without a CAN-SPAM mailing address", async () => {
    const handler = await load(baseEnv()); // no BUSINESS_MAILING_ADDRESS
    installFetchMock(authUserRoute(ADMIN), rateLimitRoute());
    const res = await handler(post({ channel: "email" }, AUTHED));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/BUSINESS_MAILING_ADDRESS/);
  });

  it("drafts AI messages with the CAN-SPAM footer, marks leads, creates follow-ups", async () => {
    const handler = await load();
    const w = world();
    installFetchMock(authUserRoute(ADMIN), rateLimitRoute(), routes(w));
    const res = await handler(post({ limit: 5 }, AUTHED));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      drafted: 1,
      ai_used: 1,
      fallback_used: 0,
      follow_ups_created: 1,
      skipped: 0,
      errors: [],
    });

    expect(w.messages).toHaveLength(1);
    const msg = w.messages[0];
    expect(msg).toMatchObject({
      lead_id: "lead-1",
      channel: "email",
      status: "drafted",
      approved: false,
      generation_source: "ai",
    });
    // CAN-SPAM physical address footer appended to the email body.
    expect(String(msg.body)).toContain("Tradewind · 100 Harbor Way, Miami FL 33101");
    expect(w.leadPatches[0].body).toEqual({ status: "drafted" });
    expect(w.followups[0]).toMatchObject({ lead_id: "lead-1", followup_number: 1, status: "due" });
    expect(w.activity[0]).toMatchObject({ action: "draft_generated" });
  });

  it("falls back to the deterministic template when the AI generator fails", async () => {
    const handler = await load();
    const w = world({ aiResponse: { status: 503, body: { error: "no credits" } } });
    installFetchMock(authUserRoute(ADMIN), rateLimitRoute(), routes(w));
    const res = await handler(post({}, AUTHED));
    const body = await res.json();
    expect(body.drafted).toBe(1);
    expect(body.fallback_used).toBe(1);
    expect(body.ai_used).toBe(0);

    const msg = w.messages[0];
    expect(msg.generation_source).toBe("fallback_template");
    expect((msg.meta as Record<string, unknown>).ai_fallback_reason).toMatch(/503/);
    expect(String(msg.body).length).toBeGreaterThan(50); // real template content
    expect(String(msg.body)).toContain("Tradewind · 100 Harbor Way, Miami FL 33101");
  });

  it("skips leads that already have a draft and unverified leads", async () => {
    const handler = await load();
    const w = world({
      leads: [
        lead(1), // ok
        lead(2), // already drafted
        lead(3, { email_verification_status: "unverified" }), // gate
      ],
      existingDrafts: { "lead-2": [{ id: "existing-draft" }] },
    });
    installFetchMock(authUserRoute(ADMIN), rateLimitRoute(), routes(w));
    const res = await handler(post({ limit: 10 }, AUTHED));
    const body = await res.json();
    expect(body.drafted).toBe(1);
    expect(body.skipped).toBe(1);
    expect(body.skipped_unverified).toBe(1);
    expect(body.considered).toBe(3);
    expect(w.messages.map((m) => m.lead_id)).toEqual(["lead-1"]);
  });

  it("enforces the daily outreach budget", async () => {
    const handler = await load();
    installFetchMock(authUserRoute(ADMIN), rateLimitRoute(false, 86_400));
    const res = await handler(post({}, AUTHED));
    expect(res.status).toBe(429);
  });
});
