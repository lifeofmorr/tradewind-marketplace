// POST /functions/v1/stripe-webhook
// Stripe → TradeWind webhook receiver. Verify the signature, then upsert
// payments + subscriptions + featured_listings rows.
//
// IMPORTANT: deploy with `--no-verify-jwt`:
//   supabase functions deploy stripe-webhook --no-verify-jwt
// Stripe doesn't include the Supabase user JWT.
//
// Required secrets:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const STRIPE_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const SUPA_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPA_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const admin = createClient(SUPA_URL, SUPA_KEY, { auth: { persistSession: false } });

// Fire-and-forget email via the send-email edge function. We deliberately
// swallow errors here so a Resend outage never causes Stripe to retry the
// webhook (Stripe retries on non-2xx).
async function sendEmail(template: string, to: string | null | undefined, props: Record<string, unknown>) {
  if (!to) return;
  try {
    await fetch(`${SUPA_URL}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPA_KEY}`,
      },
      body: JSON.stringify({ template, to, props }),
    });
  } catch (e) {
    console.warn("[webhook] send-email failed", (e as Error).message);
  }
}

// Stripe signature verification (HMAC-SHA256). Avoid pulling the Stripe SDK
// into the edge function; the signed-payload format is documented and stable.
async function verify(payload: string, header: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(header.split(",").map((p) => {
    const [k, v] = p.split("=");
    return [k, v];
  }));
  const ts = parts["t"];
  const sig = parts["v1"];
  if (!ts || !sig) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(`${ts}.${payload}`));
  const macHex = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return timingSafeEq(macHex, sig);
}

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

interface StripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
}

async function handle(event: StripeEvent): Promise<void> {
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
      await admin.from("payments").insert({
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
        await admin.from("featured_listings").insert({
          listing_id: md.listing_id,
          package: md.kind === "boost_listing" ? "boost_7d" : "featured_30d",
          starts_at: new Date().toISOString(),
          ends_at: ends.toISOString(),
        });
        const patch: Record<string, unknown> = { is_featured: true, featured_until: ends.toISOString() };
        if (md.kind === "boost_listing") patch.boost_until = ends.toISOString();
        await admin.from("listings").update(patch).eq("id", md.listing_id);

        // Email the seller — look up listing + seller for context.
        const { data: lst } = await admin
          .from("listings")
          .select("title, slug, seller_id")
          .eq("id", md.listing_id)
          .maybeSingle<{ title: string; slug: string; seller_id: string }>();
        if (lst) {
          const { data: seller } = await admin
            .from("profiles")
            .select("email")
            .eq("id", lst.seller_id)
            .maybeSingle<{ email: string }>();
          await sendEmail("featured_live", seller?.email, {
            listing_title: lst.title,
            listing_slug: lst.slug,
            ends_at: ends.toISOString().slice(0, 10),
          });
        }
      }

      // Concierge: mark the request as paid + email the buyer.
      if (md.kind === "concierge" && md.concierge_request_id) {
        await admin.from("concierge_requests")
          .update({ paid: true, paid_at: new Date().toISOString() })
          .eq("id", md.concierge_request_id);
        const { data: req } = await admin
          .from("concierge_requests")
          .select("email")
          .eq("id", md.concierge_request_id)
          .maybeSingle<{ email: string }>();
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
      await admin.from("subscriptions").upsert(row, { onConflict: "stripe_subscription_id" });
      // mirror onto dealer / provider
      if (md.dealer_id) {
        await admin.from("dealers").update({
          subscription_tier: tier, subscription_status: sub.status,
          stripe_customer_id: sub.customer ?? null,
          stripe_subscription_id: sub.id,
        }).eq("id", md.dealer_id);
      }
      if (md.service_provider_id) {
        await admin.from("service_providers").update({
          subscription_tier: tier, subscription_status: sub.status,
          stripe_customer_id: sub.customer ?? null,
          stripe_subscription_id: sub.id,
        }).eq("id", md.service_provider_id);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as { id: string };
      await admin.from("subscriptions").update({
        status: "canceled", canceled_at: new Date().toISOString(),
      }).eq("stripe_subscription_id", sub.id);
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as { payment_intent?: string };
      if (charge.payment_intent) {
        await admin.from("payments").update({
          status: "refunded",
        }).eq("stripe_payment_intent_id", charge.payment_intent);
      }
      break;
    }

    default:
      // unhandled event types are still 200'd to ack
      break;
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return new Response("POST only", { status: 405 });
  const sig = req.headers.get("stripe-signature") ?? "";
  const payload = await req.text();
  if (!WEBHOOK_SECRET) return new Response("not configured", { status: 500 });
  const ok = await verify(payload, sig, WEBHOOK_SECRET);
  if (!ok) return new Response("bad signature", { status: 400 });
  let event: StripeEvent;
  try { event = JSON.parse(payload) as StripeEvent; } catch { return new Response("bad json", { status: 400 }); }

  // Idempotency: Stripe retries on any non-2xx, so we ack-and-skip already-seen
  // events. The unique violation on webhook_events.id is the dedup signal.
  if (event.id) {
    const { error: insErr } = await admin.from("webhook_events").insert({
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
    await handle(event);
    return new Response(JSON.stringify({ received: true }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[webhook] handler failed", e);
    return new Response((e as Error).message, { status: 500 });
  }
});
