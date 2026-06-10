// @vitest-environment node
//
// Request-level tests for send-email, sitemap, auction-end, and
// inquiry-fraud-check.
import { describe, it, expect, afterEach, vi } from "vitest";
import {
  loadEdgeFunction,
  installFetchMock,
  anthropicRoute,
  baseEnv,
  json,
  SUPA_URL,
  type FetchCall,
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

// ───────────────────────────── send-email ─────────────────────────────────

describe("send-email", () => {
  const SERVICE_KEY = "service-role-unit-key";
  const env = (extra: Record<string, string> = {}) =>
    baseEnv({ RESEND_API_KEY: "re_unit", ...extra });
  const load = (e = env()) => loadEdgeFunction(e, () => import("../send-email/index.ts"));

  function resendRoute(sent: Record<string, unknown>[], status = 200) {
    return (call: FetchCall) => {
      if (!call.url.startsWith("https://api.resend.com/")) return undefined;
      sent.push(call.body as Record<string, unknown>);
      return status === 200 ? json({ id: "email-1" }) : new Response("nope", { status });
    };
  }

  function userAuthRoutes(user: { id: string; email: string }, role = "user") {
    return (call: FetchCall) => {
      if (call.url.startsWith(`${SUPA_URL}/auth/v1/user`)) return json(user);
      if (call.url.startsWith(`${SUPA_URL}/rest/v1/profiles`)) return json([{ role }]);
      return undefined;
    };
  }

  it("fails closed when RESEND_API_KEY is missing", async () => {
    const handler = await load(baseEnv()); // no Resend key
    installFetchMock();
    const res = await handler(post({ template: "listing_approved", to: "a@b.com" }));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/RESEND_API_KEY/);
  });

  it("rejects unauthenticated callers", async () => {
    const handler = await load();
    installFetchMock();
    const res = await handler(post({ template: "listing_approved", to: "a@b.com" }));
    expect(res.status).toBe(401);
  });

  it("rejects unknown templates", async () => {
    const handler = await load();
    installFetchMock();
    const res = await handler(
      post(
        { template: "password_reset_phish", to: "a@b.com" },
        { authorization: `Bearer ${SERVICE_KEY}` },
      ),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/invalid template/);
  });

  it("lets service-role callers send to arbitrary recipients", async () => {
    const handler = await load();
    const sent: Record<string, unknown>[] = [];
    installFetchMock(resendRoute(sent));
    const res = await handler(
      post(
        {
          template: "listing_approved",
          to: "seller@example.com",
          props: { listing_title: "2019 Whaler", listing_slug: "2019-whaler" },
        },
        { authorization: `Bearer ${SERVICE_KEY}` },
      ),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(sent[0].to).toEqual(["seller@example.com"]);
    expect(sent[0].subject).toBe("Your listing is live: 2019 Whaler");
    expect(String(sent[0].html)).toContain("/listings/2019-whaler");
  });

  it("forces user-JWT callers to send only to their own email (anti spam-relay)", async () => {
    const handler = await load();
    const sent: Record<string, unknown>[] = [];
    installFetchMock(
      userAuthRoutes({ id: "u-1", email: "me@example.com" }),
      resendRoute(sent),
    );
    const res = await handler(
      post(
        { template: "request_received", to: "victim@example.com", props: { kind: "transport" } },
        { authorization: "Bearer user-jwt" },
      ),
    );
    expect(res.status).toBe(200);
    expect(sent[0].to).toEqual(["me@example.com"]); // not the supplied victim address
  });

  it("rejects invalid recipients and >25-recipient blasts for service callers", async () => {
    const handler = await load();
    installFetchMock();
    const bad = await handler(
      post(
        { template: "listing_approved", to: "not-an-email" },
        { authorization: `Bearer ${SERVICE_KEY}` },
      ),
    );
    expect(bad.status).toBe(400);

    const blast = await handler(
      post(
        {
          template: "listing_approved",
          to: Array.from({ length: 26 }, (_, i) => `u${i}@example.com`),
        },
        { authorization: `Bearer ${SERVICE_KEY}` },
      ),
    );
    expect(blast.status).toBe(400);
    expect((await blast.json()).error).toMatch(/too many recipients/);
  });

  it("HTML-escapes user-controlled props (no injection into the email body)", async () => {
    const handler = await load();
    const sent: Record<string, unknown>[] = [];
    installFetchMock(resendRoute(sent));
    await handler(
      post(
        {
          template: "new_inquiry",
          to: "seller@example.com",
          props: {
            buyer_name: '<script>alert("x")</script>',
            listing_title: "Whaler",
            message: "hi & <b>bye</b>",
          },
        },
        { authorization: `Bearer ${SERVICE_KEY}` },
      ),
    );
    const html = String(sent[0].html);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("hi &amp; &lt;b&gt;bye&lt;/b&gt;");
  });

  it("includes the CAN-SPAM mailing address in the footer when configured", async () => {
    const handler = await load(env({ BUSINESS_MAILING_ADDRESS: "100 Harbor Way, Miami FL 33101" }));
    const sent: Record<string, unknown>[] = [];
    installFetchMock(resendRoute(sent));
    await handler(
      post(
        { template: "concierge_paid", to: "x@example.com" },
        { authorization: `Bearer ${SERVICE_KEY}` },
      ),
    );
    expect(String(sent[0].html)).toContain("100 Harbor Way, Miami FL 33101");
  });

  it("maps Resend failures to 502", async () => {
    const handler = await load();
    installFetchMock(resendRoute([], 422));
    const res = await handler(
      post(
        { template: "listing_approved", to: "a@example.com" },
        { authorization: `Bearer ${SERVICE_KEY}` },
      ),
    );
    expect(res.status).toBe(502);
    expect((await res.json()).error).toMatch(/resend 422/);
  });
});

// ─────────────────────────────── sitemap ──────────────────────────────────

describe("sitemap", () => {
  const load = () => loadEdgeFunction(baseEnv(), () => import("../sitemap/index.ts"));

  function emptyRest(rows: Record<string, Record<string, unknown>[]> = {}) {
    return (call: FetchCall) => {
      const m = call.url.match(/\/rest\/v1\/([a-z_]+)\?/);
      if (!m) return undefined;
      return json(rows[m[1]] ?? []);
    };
  }

  it("serves robots.txt with the sitemap location", async () => {
    const handler = await load();
    installFetchMock();
    const res = await handler(new Request("https://edge.test/sitemap/robots"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");
    const text = await res.text();
    expect(text).toContain("User-agent: *");
    expect(text).toContain("Sitemap: https://gotradewind.com/sitemap.xml");
  });

  it("builds an XML sitemap with static, listing, dealer, and SEO routes", async () => {
    const handler = await load();
    installFetchMock(
      emptyRest({
        listings: [{ slug: "2019-whaler", updated_at: "2026-06-01T12:00:00Z" }],
        dealers: [{ slug: "harbor-marine", updated_at: "2026-05-20T08:00:00Z" }],
        blog_posts: [{ slug: "buying-guide", updated_at: "2026-04-01T00:00:00Z" }],
      }),
    );
    const res = await handler(new Request("https://edge.test/sitemap"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/xml");
    const xml = await res.text();
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<loc>https://gotradewind.com/</loc>");
    expect(xml).toContain("<loc>https://gotradewind.com/browse</loc>");
    expect(xml).toContain(
      "<url><loc>https://gotradewind.com/listings/2019-whaler</loc><lastmod>2026-06-01</lastmod><priority>0.9</priority></url>",
    );
    expect(xml).toContain("<loc>https://gotradewind.com/dealers/harbor-marine</loc>");
    expect(xml).toContain("<loc>https://gotradewind.com/blog/buying-guide</loc>");
    // programmatic SEO routes
    expect(xml).toContain("<loc>https://gotradewind.com/boats-for-sale-in-florida</loc>");
    expect(xml).toContain("<loc>https://gotradewind.com/boston-whaler-for-sale</loc>");
    expect(xml).toContain("<loc>https://gotradewind.com/boat-in-miami</loc>");
  });

  it("still serves the static sitemap when the database reads error out", async () => {
    const handler = await load();
    installFetchMock((call) =>
      call.url.includes("/rest/v1/")
        ? json({ message: "permission denied" }, 500)
        : undefined,
    );
    const res = await handler(new Request("https://edge.test/sitemap"));
    expect(res.status).toBe(200);
    const xml = await res.text();
    expect(xml).toContain("<loc>https://gotradewind.com/browse</loc>");
    expect(xml).not.toContain("/listings/");
  });

  it("returns 500 with a readable error when sitemap generation throws", async () => {
    const handler = await load();
    // A listing row with a null updated_at makes buildSitemap throw.
    installFetchMock(emptyRest({ listings: [{ slug: "broken", updated_at: null as unknown as string }] }) as never);
    const res = await handler(new Request("https://edge.test/sitemap"));
    expect(res.status).toBe(500);
    expect(await res.text()).toContain("error:");
  });
});

// ───────────────────────────── auction-end ────────────────────────────────

describe("auction-end", () => {
  const load = () => loadEdgeFunction(baseEnv(), () => import("../auction-end/index.ts"));

  interface World {
    auctions: Record<string, unknown>[];
    winningBid: Record<string, unknown> | null;
    listing: Record<string, unknown> | null;
    profiles: Record<string, { email: string }>;
    auctionPatches: Record<string, unknown>[];
    notifications: Record<string, unknown>[];
    emails: Record<string, unknown>[];
  }

  function world(overrides: Partial<World> = {}): World {
    return {
      auctions: [{ id: "auc-1", listing_id: "lst-1", current_bid_cents: 5_000_000 }],
      winningBid: { bidder_id: "buyer-1", amount_cents: 5_000_000 },
      listing: { title: "1972 Bertram 31", slug: "1972-bertram-31", seller_id: "seller-1" },
      profiles: { "buyer-1": { email: "buyer@example.com" }, "seller-1": { email: "seller@example.com" } },
      auctionPatches: [],
      notifications: [],
      emails: [],
      ...overrides,
    };
  }

  function maybeSingle(row: unknown): Response {
    if (row) return json(row);
    return json({ code: "PGRST116", message: "0 rows", details: null, hint: null }, 406);
  }

  function routes(w: World) {
    return (call: FetchCall) => {
      const { url, method } = call;
      if (url.startsWith(`${SUPA_URL}/rest/v1/auctions`)) {
        if (method === "PATCH") {
          w.auctionPatches.push(call.body as Record<string, unknown>);
          return json([], 200);
        }
        return json(w.auctions);
      }
      if (url.startsWith(`${SUPA_URL}/rest/v1/bids`)) return maybeSingle(w.winningBid);
      if (url.startsWith(`${SUPA_URL}/rest/v1/listings`)) return maybeSingle(w.listing);
      if (url.startsWith(`${SUPA_URL}/rest/v1/profiles`)) {
        const id = url.match(/id=eq\.([^&]+)/)?.[1] ?? "";
        return maybeSingle(w.profiles[id] ?? null);
      }
      if (url.startsWith(`${SUPA_URL}/rest/v1/notifications`)) {
        w.notifications.push(call.body as Record<string, unknown>);
        return json([], 201);
      }
      if (url.startsWith(`${SUPA_URL}/functions/v1/send-email`)) {
        w.emails.push(call.body as Record<string, unknown>);
        return json({ ok: true });
      }
      return undefined;
    };
  }

  it("rejects unsupported methods", async () => {
    const handler = await load();
    installFetchMock();
    const res = await handler(new Request("https://edge.test/fn", { method: "DELETE" }));
    expect(res.status).toBe(405);
  });

  it("finalizes a due auction: winner set, both parties notified and emailed", async () => {
    const handler = await load();
    const w = world();
    installFetchMock(routes(w));
    const res = await handler(post({}));
    expect(res.status).toBe(200);
    expect((await res.json()).processed).toBe(1);

    expect(w.auctionPatches).toHaveLength(1);
    expect(w.auctionPatches[0]).toMatchObject({ status: "ended", winner_id: "buyer-1" });

    expect(w.notifications).toHaveLength(2);
    const recipients = w.notifications.map((n) => n.user_id);
    expect(recipients).toContain("buyer-1");
    expect(recipients).toContain("seller-1");

    expect(w.emails).toHaveLength(2);
    const emailTos = w.emails.map((e) => e.to);
    expect(emailTos).toContain("buyer@example.com");
    expect(emailTos).toContain("seller@example.com");
  });

  it("ends a no-bid auction with a null winner and sends nothing", async () => {
    const handler = await load();
    const w = world({ winningBid: null });
    installFetchMock(routes(w));
    const res = await handler(post({}));
    expect((await res.json()).processed).toBe(1);
    expect(w.auctionPatches[0]).toMatchObject({ status: "ended", winner_id: null });
    expect(w.notifications).toHaveLength(0);
    expect(w.emails).toHaveLength(0);
  });

  it("is a no-op when no auctions are due", async () => {
    const handler = await load();
    const w = world({ auctions: [] });
    installFetchMock(routes(w));
    const res = await handler(post({}));
    expect((await res.json()).processed).toBe(0);
    expect(w.auctionPatches).toHaveLength(0);
  });
});

// ─────────────────────────── inquiry-fraud-check ──────────────────────────

describe("inquiry-fraud-check", () => {
  const load = () => loadEdgeFunction(baseEnv(), () => import("../inquiry-fraud-check/index.ts"));

  interface World {
    listing: Record<string, unknown> | null;
    seller: { email: string } | null;
    inquiryPatches: Record<string, unknown>[];
    fraudFlags: Record<string, unknown>[];
    emails: Record<string, unknown>[];
  }

  function world(overrides: Partial<World> = {}): World {
    return {
      listing: { title: "2019 Whaler", slug: "2019-whaler", price_cents: 9_500_000 },
      seller: { email: "seller@example.com" },
      inquiryPatches: [],
      fraudFlags: [],
      emails: [],
      ...overrides,
    };
  }

  function maybeSingle(row: unknown): Response {
    if (row) return json(row);
    return json({ code: "PGRST116", message: "0 rows", details: null, hint: null }, 406);
  }

  function routes(w: World) {
    return (call: FetchCall) => {
      const { url, method } = call;
      if (url.startsWith(`${SUPA_URL}/rest/v1/listings`)) return maybeSingle(w.listing);
      if (url.startsWith(`${SUPA_URL}/rest/v1/profiles`)) return maybeSingle(w.seller);
      if (url.startsWith(`${SUPA_URL}/rest/v1/inquiries`) && method === "PATCH") {
        w.inquiryPatches.push(call.body as Record<string, unknown>);
        return json([], 200);
      }
      if (url.startsWith(`${SUPA_URL}/rest/v1/fraud_flags`) && method === "POST") {
        w.fraudFlags.push(call.body as Record<string, unknown>);
        return json([], 201);
      }
      if (url.startsWith(`${SUPA_URL}/functions/v1/send-email`)) {
        w.emails.push(call.body as Record<string, unknown>);
        return json({ ok: true });
      }
      return undefined;
    };
  }

  const INQUIRY = {
    id: "inq-1",
    listing_id: "lst-1",
    seller_id: "seller-1",
    buyer_name: "Sam Buyer",
    buyer_email: "sam@example.com",
    buyer_phone: null,
    message: "Interested — can I schedule a sea trial this weekend?",
  };

  function webhook(record: typeof INQUIRY | null, type = "INSERT") {
    return post({ type, table: "inquiries", record });
  }

  it("skips non-INSERT webhook events", async () => {
    const handler = await load();
    installFetchMock();
    const res = await handler(webhook(INQUIRY, "UPDATE"));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ skipped: true });
  });

  it("scores a clean inquiry: lead_score inverted, no spam, seller emailed", async () => {
    const handler = await load();
    const w = world();
    installFetchMock(
      routes(w),
      anthropicRoute(JSON.stringify({ score: 10, signals: [], recommended_action: "allow" })),
    );
    const res = await handler(webhook(INQUIRY));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      inquiry_id: "inq-1",
      score: 10,
      is_spam: false,
      recommended_action: "allow",
    });
    expect(w.inquiryPatches[0]).toMatchObject({ lead_score: 90, is_spam: false });
    expect(w.fraudFlags).toHaveLength(0);
    expect(w.emails).toHaveLength(1);
    expect(w.emails[0]).toMatchObject({ template: "new_inquiry", to: "seller@example.com" });
  });

  it("marks high-score inquiries as spam and files a fraud flag, no email", async () => {
    const handler = await load();
    const w = world();
    installFetchMock(
      routes(w),
      anthropicRoute(
        JSON.stringify({ score: 92, signals: ["wire transfer", "off-platform"], recommended_action: "block" }),
      ),
    );
    const res = await handler(webhook(INQUIRY));
    expect(await res.json()).toMatchObject({ is_spam: true, recommended_action: "block" });
    expect(w.inquiryPatches[0]).toMatchObject({ lead_score: 8, is_spam: true, status: "spam" });
    expect(w.fraudFlags).toHaveLength(1);
    expect(w.fraudFlags[0]).toMatchObject({ inquiry_id: "inq-1", severity: "critical" });
    expect(String(w.fraudFlags[0].reason)).toContain("wire transfer");
    expect(w.emails).toHaveLength(0);
  });

  it("files a low-severity audit flag and returns 500 when the AI screen fails", async () => {
    const handler = await load();
    const w = world();
    installFetchMock(routes(w), (call) =>
      call.url.startsWith("https://api.anthropic.com/")
        ? new Response("overloaded", { status: 529 })
        : undefined,
    );
    const res = await handler(webhook(INQUIRY));
    expect(res.status).toBe(500);
    expect(w.inquiryPatches).toHaveLength(0); // inquiry left untouched
    expect(w.fraudFlags).toHaveLength(1);
    expect(w.fraudFlags[0]).toMatchObject({ severity: "low" });
    expect(String(w.fraudFlags[0].reason)).toContain("AI screening failed");
  });
});
