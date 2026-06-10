// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  createWebhookHandler,
  handleStripeEvent,
  type WebhookDb,
  type WebhookDeps,
  type StripeEvent,
} from "../stripe-webhook/handler.ts";
import { signPayloadForTest, DEFAULT_TOLERANCE_SECONDS } from "../_shared/stripe-signature.ts";

const SECRET = "whsec_unit_test";
const NOW = 1_750_000_000;

interface Call {
  op: "insert" | "update" | "upsert" | "select";
  table: string;
  payload?: Record<string, unknown>;
  match?: Record<string, unknown>;
  onConflict?: string;
}

class FakeDb implements WebhookDb {
  calls: Call[] = [];
  /** error returned for the next insert into a given table */
  insertErrors = new Map<string, { code?: string; message: string }>();
  /** canned rows for selectMaybeSingle, keyed by table */
  rows = new Map<string, unknown>();

  async insert(table: string, row: Record<string, unknown>) {
    this.calls.push({ op: "insert", table, payload: row });
    return { error: this.insertErrors.get(table) ?? null };
  }
  async update(table: string, patch: Record<string, unknown>, match: Record<string, unknown>) {
    this.calls.push({ op: "update", table, payload: patch, match });
    return { error: null };
  }
  async upsert(table: string, row: Record<string, unknown>, onConflict: string) {
    this.calls.push({ op: "upsert", table, payload: row, onConflict });
    return { error: null };
  }
  async selectMaybeSingle<T>(table: string, _columns: string, match: Record<string, unknown>) {
    this.calls.push({ op: "select", table, match });
    return { data: (this.rows.get(table) ?? null) as T | null };
  }

  tables(op?: Call["op"]): string[] {
    return this.calls.filter((c) => !op || c.op === op).map((c) => c.table);
  }
}

function makeDeps(db: FakeDb, emails: Array<{ template: string; to: string | null | undefined }> = []): WebhookDeps {
  return {
    db,
    webhookSecret: SECRET,
    sendEmail: async (template, to) => { emails.push({ template, to }); },
    nowSeconds: () => NOW,
  };
}

async function signedRequest(event: StripeEvent, signedAtSeconds = NOW): Promise<Request> {
  const payload = JSON.stringify(event);
  const header = await signPayloadForTest(payload, SECRET, signedAtSeconds);
  return new Request("https://example.test/stripe-webhook", {
    method: "POST",
    headers: { "stripe-signature": header },
    body: payload,
  });
}

const checkoutEvent = (metadata: Record<string, string>): StripeEvent => ({
  id: "evt_checkout_1",
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_test_123",
      payment_intent: "pi_test_123",
      amount_total: 19900,
      currency: "usd",
      metadata,
    },
  },
});

describe("stripe-webhook request handler", () => {
  it("rejects non-POST", async () => {
    const handler = createWebhookHandler(makeDeps(new FakeDb()));
    const res = await handler(new Request("https://x.test/", { method: "GET" }));
    expect(res.status).toBe(405);
  });

  it("returns 500 when the webhook secret is not configured", async () => {
    const deps = { ...makeDeps(new FakeDb()), webhookSecret: "" };
    const handler = createWebhookHandler(deps);
    const res = await handler(await signedRequest(checkoutEvent({})));
    expect(res.status).toBe(500);
  });

  it("rejects a request with no/garbage signature header", async () => {
    const handler = createWebhookHandler(makeDeps(new FakeDb()));
    const res = await handler(new Request("https://x.test/", { method: "POST", body: "{}" }));
    expect(res.status).toBe(400);
  });

  it("rejects a tampered payload (signature mismatch)", async () => {
    const db = new FakeDb();
    const handler = createWebhookHandler(makeDeps(db));
    const payload = JSON.stringify(checkoutEvent({}));
    const header = await signPayloadForTest(payload, SECRET, NOW);
    const res = await handler(new Request("https://x.test/", {
      method: "POST",
      headers: { "stripe-signature": header },
      body: payload.replace("cs_test_123", "cs_evil_999"),
    }));
    expect(res.status).toBe(400);
    expect(db.calls).toHaveLength(0); // nothing touched the database
  });

  it("REPLAY PROTECTION: rejects a validly signed event older than 5 minutes", async () => {
    const db = new FakeDb();
    const handler = createWebhookHandler(makeDeps(db));
    const res = await handler(await signedRequest(checkoutEvent({}), NOW - DEFAULT_TOLERANCE_SECONDS - 1));
    expect(res.status).toBe(400);
    expect(await res.text()).toMatch(/tolerance/);
    expect(db.calls).toHaveLength(0);
  });

  it("accepts the same event when signed within the tolerance window", async () => {
    const db = new FakeDb();
    const handler = createWebhookHandler(makeDeps(db));
    const res = await handler(await signedRequest(checkoutEvent({}), NOW - 60));
    expect(res.status).toBe(200);
  });

  it("deduplicates an already-processed event id (unique violation) with a 200 ack", async () => {
    const db = new FakeDb();
    db.insertErrors.set("webhook_events", { code: "23505", message: "duplicate key" });
    const handler = createWebhookHandler(makeDeps(db));
    const res = await handler(await signedRequest(checkoutEvent({})));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true, deduped: true });
    // dedup short-circuits before any payment write
    expect(db.tables("insert")).toEqual(["webhook_events"]);
  });

  it("still processes the event if the dedup insert fails for another reason", async () => {
    const db = new FakeDb();
    db.insertErrors.set("webhook_events", { code: "08000", message: "connection error" });
    const handler = createWebhookHandler(makeDeps(db));
    const res = await handler(await signedRequest(checkoutEvent({ kind: "concierge" })));
    expect(res.status).toBe(200);
    expect(db.tables("insert")).toContain("payments");
  });

  it("records the payment for checkout.session.completed", async () => {
    const db = new FakeDb();
    const handler = createWebhookHandler(makeDeps(db));
    const res = await handler(await signedRequest(checkoutEvent({ kind: "concierge", user_id: "u-1" })));
    expect(res.status).toBe(200);
    const payment = db.calls.find((c) => c.op === "insert" && c.table === "payments");
    expect(payment?.payload).toMatchObject({
      user_id: "u-1",
      amount_cents: 19900,
      currency: "USD",
      status: "succeeded",
      stripe_session_id: "cs_test_123",
      stripe_payment_intent_id: "pi_test_123",
    });
  });

  it("features the listing and emails the seller for kind=featured_listing", async () => {
    const db = new FakeDb();
    db.rows.set("listings", { title: "Cessna 172", slug: "cessna-172", seller_id: "seller-1" });
    db.rows.set("profiles", { email: "seller@example.com" });
    const emails: Array<{ template: string; to: string | null | undefined }> = [];
    const handler = createWebhookHandler(makeDeps(db, emails));
    const listingId = "11111111-1111-1111-1111-111111111111";
    const res = await handler(await signedRequest(checkoutEvent({ kind: "featured_listing", listing_id: listingId })));
    expect(res.status).toBe(200);
    expect(db.tables("insert")).toContain("featured_listings");
    const listingUpdate = db.calls.find((c) => c.op === "update" && c.table === "listings");
    expect(listingUpdate?.payload).toMatchObject({ is_featured: true });
    expect(listingUpdate?.match).toEqual({ id: listingId });
    expect(emails).toEqual([{ template: "featured_live", to: "seller@example.com" }]);
  });

  it("marks the concierge request paid and emails the buyer", async () => {
    const db = new FakeDb();
    db.rows.set("concierge_requests", { email: "buyer@example.com" });
    const emails: Array<{ template: string; to: string | null | undefined }> = [];
    const handler = createWebhookHandler(makeDeps(db, emails));
    const res = await handler(await signedRequest(checkoutEvent({ kind: "concierge", concierge_request_id: "req-1" })));
    expect(res.status).toBe(200);
    const upd = db.calls.find((c) => c.op === "update" && c.table === "concierge_requests");
    expect(upd?.payload).toMatchObject({ paid: true });
    expect(emails).toEqual([{ template: "concierge_paid", to: "buyer@example.com" }]);
  });

  it("upserts the subscription and mirrors tier onto the dealer", async () => {
    const db = new FakeDb();
    const handler = createWebhookHandler(makeDeps(db));
    const event: StripeEvent = {
      id: "evt_sub_1",
      type: "customer.subscription.created",
      data: {
        object: {
          id: "sub_123",
          customer: "cus_123",
          status: "active",
          items: { data: [{ price: { id: "price_abc" } }] },
          current_period_start: NOW,
          current_period_end: NOW + 30 * 86400,
          metadata: { kind: "dealer_pro", dealer_id: "dealer-1" },
        },
      },
    };
    const res = await handler(await signedRequest(event));
    expect(res.status).toBe(200);
    const upsert = db.calls.find((c) => c.op === "upsert" && c.table === "subscriptions");
    expect(upsert?.payload).toMatchObject({ tier: "pro", status: "active", stripe_subscription_id: "sub_123", stripe_price_id: "price_abc" });
    expect(upsert?.onConflict).toBe("stripe_subscription_id");
    const dealer = db.calls.find((c) => c.op === "update" && c.table === "dealers");
    expect(dealer?.payload).toMatchObject({ subscription_tier: "pro", subscription_status: "active" });
    expect(dealer?.match).toEqual({ id: "dealer-1" });
  });

  it("ignores subscriptions without a recognized tier kind", async () => {
    const db = new FakeDb();
    const event: StripeEvent = {
      id: "evt_sub_2",
      type: "customer.subscription.updated",
      data: { object: { id: "sub_999", status: "active", metadata: { kind: "mystery" } } },
    };
    await handleStripeEvent(event, makeDeps(db));
    expect(db.calls.filter((c) => c.op !== "insert")).toHaveLength(0);
  });

  it("cancels the subscription on customer.subscription.deleted", async () => {
    const db = new FakeDb();
    const handler = createWebhookHandler(makeDeps(db));
    const event: StripeEvent = {
      id: "evt_sub_del",
      type: "customer.subscription.deleted",
      data: { object: { id: "sub_123" } },
    };
    const res = await handler(await signedRequest(event));
    expect(res.status).toBe(200);
    const upd = db.calls.find((c) => c.op === "update" && c.table === "subscriptions");
    expect(upd?.payload).toMatchObject({ status: "canceled" });
    expect(upd?.match).toEqual({ stripe_subscription_id: "sub_123" });
  });

  it("marks the payment refunded on charge.refunded", async () => {
    const db = new FakeDb();
    const handler = createWebhookHandler(makeDeps(db));
    const event: StripeEvent = {
      id: "evt_refund",
      type: "charge.refunded",
      data: { object: { payment_intent: "pi_test_123" } },
    };
    const res = await handler(await signedRequest(event));
    expect(res.status).toBe(200);
    const upd = db.calls.find((c) => c.op === "update" && c.table === "payments");
    expect(upd?.payload).toEqual({ status: "refunded" });
    expect(upd?.match).toEqual({ stripe_payment_intent_id: "pi_test_123" });
  });

  it("acks unhandled event types with a 200 and no writes beyond dedup", async () => {
    const db = new FakeDb();
    const handler = createWebhookHandler(makeDeps(db));
    const event: StripeEvent = { id: "evt_other", type: "invoice.finalized", data: { object: {} } };
    const res = await handler(await signedRequest(event));
    expect(res.status).toBe(200);
    expect(db.tables()).toEqual(["webhook_events"]);
  });
});
