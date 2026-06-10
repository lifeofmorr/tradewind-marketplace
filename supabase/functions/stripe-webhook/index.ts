// POST /functions/v1/stripe-webhook
// Stripe → Tradewind webhook receiver. Verifies the signature (including the
// 5-minute replay-protection tolerance) and upserts payments + subscriptions
// + featured_listings rows. All request handling lives in handler.ts so it
// can be unit-tested; this file only wires the Deno runtime.
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
import { createWebhookHandler, type WebhookDb } from "./handler.ts";

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const SUPA_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPA_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const admin = createClient(SUPA_URL, SUPA_KEY, { auth: { persistSession: false } });

const db: WebhookDb = {
  async insert(table, row) {
    const { error } = await admin.from(table).insert(row);
    return { error };
  },
  async update(table, patch, match) {
    let q = admin.from(table).update(patch);
    for (const [k, v] of Object.entries(match)) q = q.eq(k, v);
    const { error } = await q;
    return { error };
  },
  async upsert(table, row, onConflict) {
    const { error } = await admin.from(table).upsert(row, { onConflict });
    return { error };
  },
  async selectMaybeSingle(table, columns, match) {
    let q = admin.from(table).select(columns);
    for (const [k, v] of Object.entries(match)) q = q.eq(k, v);
    const { data } = await q.maybeSingle();
    return { data: data as never };
  },
};

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

Deno.serve(createWebhookHandler({ db, webhookSecret: WEBHOOK_SECRET, sendEmail }));
