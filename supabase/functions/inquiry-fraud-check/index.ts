// POST /functions/v1/inquiry-fraud-check
//
// Triggered by a Supabase database webhook on `inquiries` INSERT. Configure in
// Dashboard → Database → Webhooks:
//
//   Name:        inquiry-fraud-check
//   Table:       public.inquiries
//   Events:      INSERT
//   HTTP method: POST
//   URL:         https://YOUR-PROJECT.supabase.co/functions/v1/inquiry-fraud-check
//   Headers:     Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
//
// Payload shape (Supabase webhook):
//   { type: "INSERT", table: "inquiries", record: { ...row }, old_record: null }
//
// What we do:
//   1. Pull the listing for context (title + price).
//   2. Call ai-fraud-check internally.
//   3. Patch the inquiry: lead_score = 100 - score; is_spam = score >= 80.
//   4. If recommended_action === "block", insert a fraud_flag.
//
// Required secrets:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
//   ANTHROPIC_API_KEY (or OPENAI_API_KEY) — used by the inner AI call.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { handleOptions, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { callLLM, parseJSON } from "../_shared/anthropic.ts";

const SUPA_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPA_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const admin = createClient(SUPA_URL, SUPA_KEY, { auth: { persistSession: false } });

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: InquiryRow | null;
}

interface InquiryRow {
  id: string;
  listing_id: string;
  seller_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  message: string;
}

interface ListingRow {
  title: string;
  slug: string;
  price_cents: number | null;
}

interface Verdict {
  score: number;
  signals: string[];
  recommended_action: "allow" | "review" | "block";
}

const FRAUD_SYSTEM = `You are TradeWind's fraud-screening AI for marketplace inquiries.
Score the message 0–100 (100 = certainly fraud) and list specific signals.
Recommended action: allow (<30), review (30–70), block (>70).
Output ONLY JSON: { "score": int, "signals": [string], "recommended_action": "allow"|"review"|"block" }.`;

function severityFor(score: number): "low" | "medium" | "high" | "critical" {
  if (score >= 90) return "critical";
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

Deno.serve(async (req: Request) => {
  const pre = handleOptions(req); if (pre) return pre;
  if (req.method !== "POST") return errorResponse("POST only", 405);

  let payload: WebhookPayload;
  try { payload = await req.json() as WebhookPayload; } catch { return errorResponse("Invalid JSON"); }
  if (payload.type !== "INSERT" || !payload.record) {
    return jsonResponse({ skipped: true, reason: "not an insert" });
  }
  const inquiry = payload.record;

  // listing context
  const { data: listing } = await admin
    .from("listings")
    .select("title, slug, price_cents")
    .eq("id", inquiry.listing_id)
    .maybeSingle<ListingRow>();

  const userPrompt =
    `Listing: ${listing?.title ?? "(unknown)"}\n` +
    `Listing price (USD): ${listing?.price_cents != null ? (listing.price_cents / 100).toFixed(0) : "(unknown)"}\n` +
    `Buyer email: ${inquiry.buyer_email}\n` +
    `Buyer phone: ${inquiry.buyer_phone ?? "(none)"}\n\n` +
    `Message:\n${inquiry.message}`;

  let verdict: Verdict;
  try {
    const out = await callLLM({
      system: FRAUD_SYSTEM, user: userPrompt,
      maxTokens: 400, temperature: 0.1, responseFormat: "json",
    });
    verdict = parseJSON<Verdict>(out.text);
  } catch (e) {
    // On AI failure, leave the inquiry untouched but log a low-severity flag
    // so admins can audit silent failures.
    await admin.from("fraud_flags").insert({
      inquiry_id: inquiry.id,
      severity: "low",
      reason: `AI screening failed: ${(e as Error).message}`,
    });
    return errorResponse((e as Error).message, 500);
  }

  // Update the inquiry. lead_score is "buyer quality" so we invert.
  const isSpam = verdict.score >= 80;
  await admin.from("inquiries").update({
    lead_score: Math.max(0, Math.min(100, 100 - verdict.score)),
    is_spam: isSpam,
    status: isSpam ? "spam" : undefined,
  }).eq("id", inquiry.id);

  // Persist a fraud flag whenever AI says block (or score is high).
  if (verdict.recommended_action === "block" || verdict.score >= 70) {
    await admin.from("fraud_flags").insert({
      inquiry_id: inquiry.id,
      severity: severityFor(verdict.score),
      reason: verdict.signals.length
        ? verdict.signals.join(" · ")
        : "AI fraud screen recommended block",
    });
  }

  // Notify the seller if this isn't spam. Phase 2D — uses send-email.
  if (!isSpam && listing) {
    const { data: seller } = await admin
      .from("profiles")
      .select("email")
      .eq("id", inquiry.seller_id)
      .maybeSingle<{ email: string }>();
    if (seller?.email) {
      try {
        await fetch(`${SUPA_URL}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPA_KEY}`,
          },
          body: JSON.stringify({
            template: "new_inquiry",
            to: seller.email,
            props: {
              listing_title: listing.title,
              listing_slug: listing.slug,
              buyer_name: inquiry.buyer_name,
              message: inquiry.message,
            },
          }),
        });
      } catch (e) {
        console.warn("[fraud] send-email failed", (e as Error).message);
      }
    }
  }

  return jsonResponse({
    inquiry_id: inquiry.id,
    score: verdict.score,
    is_spam: isSpam,
    recommended_action: verdict.recommended_action,
  });
});
