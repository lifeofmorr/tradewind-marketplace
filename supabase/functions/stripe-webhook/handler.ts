// Stripe webhook request handling, separated from the Deno entrypoint so it
// can be unit-tested (vitest) with a fake database and an injectable clock.
// index.ts wires this to Deno.serve with a real supabase-js client.

import {
  verifyStripeSignature,
  DEFAULT_TOLERANCE_SECONDS,
} from "../_shared/stripe-signature.ts";

export interface DbError {
  code?: string;
  message: string;
}

export interface DbResult {
  error: DbError | null;
}

/**
 * Narrow database surface the webhook needs. index.ts implements it with
 * supabase-js; tests implement it with an in-memory fake.
 */
export interface WebhookDb {
  insert(table: string, row: Record<string, unknown>): Promise<DbResult>;
  update(table: string, patch: Record<string, unknown>, match: Record<string, unknown>): Promise<DbResult>;
  upsert(table: string, row: Record<string, unknown>, onConflict: string): Promise<DbResult>;
  selectMaybeSingle<T>(table: string, columns: string, match: Record<string, unknown>): Promise<{ data: T | null }>;
}

export interface WebhookDeps {
  db: WebhookDb;
  webhookSecret: string;
  /** Fire-and-forget email; implementations must never throw. */
  sendEmail: (template: string, to: string | null | undefined, props: Record<string, unknown>) => Promise<void>;
  /** Replay-protection window; defaults to Stripe's recommended 5 minutes. */
  toleranceSeconds?: number;
  /** Injectable clock (unix seconds) for tests. */
  nowSeconds?: () => number;
}

export interface StripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
}

export async function handleStripeEvent(event: StripeEvent, deps: WebhookDeps): Promise<void> {
  const { db, sendEmail } = deps;
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as {
        id: string;
        payment_intent?: string;
        amount_total?: number;
        currency?: string;
        customer?: string;
        subscription?: string;
        mode?: "payment" | "subscription";
        metadata?: Record<string, string>;
      };
      const md = session.metadata ?? {};
      await db.insert("payments", {
        user_id: md.user_id ?? null,
        dealer_id: md.dealer_id ?? null,
        service_provider_id: md.service_provider_id ?? null,
        listing_id: md.listing_id ?? null,
        description: md.kind ?? "checkout.session.completed",
        amount_cents: session.amount_total ?? 0,
        currency: (session.currency ?? "usd").toUpperCase(),
        status: "succeeded",
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent ?? null,
        metadata: md,
      });

      // Featured / boost: extend the listing window.
      if (md.listing_id && (md.kind === "featured_listing" || md.kind === "boost_listing")) {
        const days = md.kind === "boost_listing" ? 7 : 30;
        const ends = new Date();
        ends.setDate(ends.getDate() + days);
        await db.insert("featured_listings", {
          listing_id: md.listing_id,
          package: md.kind === "boost_listing" ? "boost_7d" : "featured_30d",
          starts_at: new Date().toISOString(),
          ends_at: ends.toISOString(),
        });
        const patch: Record<string, unknown> = { is_featured: true, featured_until: ends.toISOString() };
        if (md.kind === "boost_listing") patch.boost_until = ends.toISOString();
        await db.update("listings", patch, { id: md.listing_id });

        // Email the seller — look up listing + seller for context.
        const { data: lst } = await db.selectMaybeSingle<{ title: string; slug: string; seller_id: string }>(
          "listings", "title, slug, seller_id", { id: md.listing_id },
        );
        if (lst) {
          const { data: seller } = await db.selectMaybeSingle<{ email: string }>(
            "profiles", "email", { id: lst.seller_id },
          );
          await sendEmail("featured_live", seller?.email, {
            listing_title: lst.title,
            listing_slug: lst.slug,
            ends_at: ends.toISOString().slice(0, 10),
          });
        }
      }

      // Concierge: mark the request as paid + email the buyer.
      if (md.kind === "concierge" && md.concierge_request_id) {
        await db.update("concierge_requests",
          { paid: true, paid_at: new Date().toISOString() },
          { id: md.concierge_request_id });
        const { data: req } = await db.selectMaybeSingle<{ email: string }>(
          "concierge_requests", "email", { id: md.concierge_request_id },
        );
        await sendEmail("concierge_paid", req?.email, {});
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as {
        id: string;
        customer?: string;
        status: string;
        items?: { data?: { price?: { id?: string } }[] };
        current_period_start?: number;
        current_period_end?: number;
        cancel_at_period_end?: boolean;
        canceled_at?: number | null;
        trial_end?: number | null;
        metadata?: Record<string, string>;
      };
      const md = sub.metadata ?? {};
      const tier = md.kind === "dealer_starter" ? "starter"
        : md.kind === "dealer_pro" ? "pro"
        : md.kind === "dealer_premier" ? "premier"
        : md.kind === "service_pro" ? "service_pro"
        : null;
      if (!tier) break;
      const row = {
        dealer_id: md.dealer_id ?? null,
        service_provider_id: md.service_provider_id ?? null,
        tier,
        status: sub.status,
        stripe_customer_id: sub.customer ?? null,
        stripe_subscription_id: sub.id,
        stripe_price_id: sub.items?.data?.[0]?.price?.id ?? null,
        current_period_start: sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null,
        current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
        cancel_at_period_end: sub.cancel_at_period_end ?? false,
        canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
        trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      };
      await db.upsert("subscriptions", row, "stripe_subscription_id");
      // mirror onto dealer / provider
      if (md.dealer_id) {
        await db.update("dealers", {
          subscription_tier: tier, subscription_status: sub.status,
          stripe_customer_id: sub.customer ?? null,
          stripe_subscription_id: sub.id,
        }, { id: md.dealer_id });
      }
      if (md.service_provider_id) {
        await db.update("service_providers", {
          subscription_tier: tier, subscription_status: sub.status,
          stripe_customer_id: sub.customer ?? null,
          stripe_subscription_id: sub.id,
        }, { id: md.service_provider_id });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as { id: string };
      await db.update("subscriptions", {
        status: "canceled", canceled_at: new Date().toISOString(),
      }, { stripe_subscription_id: sub.id });
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as { payment_intent?: string };
      if (charge.payment_intent) {
        await db.update("payments", { status: "refunded" },
          { stripe_payment_intent_id: charge.payment_intent });
      }
      break;
    }

    default:
      // unhandled event types are still 200'd to ack
      break;
  }
}

export function createWebhookHandler(deps: WebhookDeps): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    if (req.method !== "POST") return new Response("POST only", { status: 405 });
    const sig = req.headers.get("stripe-signature") ?? "";
    const payload = await req.text();
    if (!deps.webhookSecret) return new Response("not configured", { status: 500 });

    const verdict = await verifyStripeSignature(payload, sig, deps.webhookSecret, {
      toleranceSeconds: deps.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS,
      nowSeconds: deps.nowSeconds?.(),
    });
    if (!verdict.ok) {
      // 400 → Stripe will retry with a fresh (in-tolerance) signature; a
      // replayed capture stays permanently rejected.
      const msg = verdict.reason === "timestamp_outside_tolerance" ? "timestamp outside tolerance" : "bad signature";
      return new Response(msg, { status: 400 });
    }

    let event: StripeEvent;
    try { event = JSON.parse(payload) as StripeEvent; } catch { return new Response("bad json", { status: 400 }); }

    // Idempotency: Stripe retries on any non-2xx, so we ack-and-skip already-seen
    // events. The unique violation on webhook_events.id is the dedup signal.
    if (event.id) {
      const { error: insErr } = await deps.db.insert("webhook_events", {
        id: event.id,
        type: event.type,
      });
      if (insErr && insErr.code === "23505") {
        // already processed — ack so Stripe stops retrying
        return new Response(JSON.stringify({ received: true, deduped: true }), {
          status: 200, headers: { "Content-Type": "application/json" },
        });
      }
      if (insErr) {
        console.warn("[webhook] dedup insert failed", insErr.message);
        // fall through; better to risk a duplicate handler run than to drop the event
      }
    }

    try {
      await handleStripeEvent(event, deps);
      return new Response(JSON.stringify({ received: true }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("[webhook] handler failed", e);
      return new Response((e as Error).message, { status: 500 });
    }
  };
}
