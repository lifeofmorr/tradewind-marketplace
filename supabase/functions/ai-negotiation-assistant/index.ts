// POST /functions/v1/ai-negotiation-assistant
// Body: {
//   listing_price_cents: number,
//   offer_amount_cents: number,
//   category: string,
//   deal_score?: number,
//   listing_title?: string
// }
// Returns: {
//   fair_range: { low_cents: number, high_cents: number, label: string },
//   negotiation_message: string,
//   counteroffer_message: string,
//   deal_analysis: string,
//   _disclaimer
// }

import { handleOptions, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { callLLM, parseJSON } from "../_shared/anthropic.ts";

interface Body {
  listing_price_cents: number;
  offer_amount_cents: number;
  category: string;
  deal_score?: number;
  listing_title?: string;
}

interface NegotiationResult {
  fair_range: { low_cents: number; high_cents: number; label: string };
  negotiation_message: string;
  counteroffer_message: string;
  deal_analysis: string;
}

const SYSTEM = `You are TradeWind's Negotiation Coach. Given a listing's asking price, an offer amount, and a deal-score signal, you produce buyer-side and seller-side messaging plus a fair-range read.

Output JSON with these keys:
- fair_range: { low_cents (int), high_cents (int), label (1-line string) } — your read on a reasonable buy-side range, anchored to the asking price and deal score
- negotiation_message: 4-7 sentence message a BUYER could send to the seller. Confident, specific, justifies the offer briefly. No emojis.
- counteroffer_message: 3-5 sentence message a SELLER could send back as a counter. Polite, anchored, leaves room.
- deal_analysis: 2-3 sentence read on whether this is a good deal at the offer price; mention deal score qualitatively if provided.

No fluff. Don't invent comps or market data — speak qualitatively (e.g. "consistent with a fair market", "aggressive ask"). Output ONLY a single JSON object.`;

const DISCLAIMER =
  "Advisory only — TradeWind's AI suggestions are non-binding negotiation aids, not appraisals or contracts.";

Deno.serve(async (req: Request) => {
  const pre = handleOptions(req); if (pre) return pre;
  if (req.method !== "POST") return errorResponse("POST only", 405, req);
  let body: Body;
  try { body = await req.json() as Body; } catch { return errorResponse("Invalid JSON", 400, req); }
  if (!body.listing_price_cents || !body.offer_amount_cents || !body.category) {
    return errorResponse("listing_price_cents, offer_amount_cents, category required", 400, req);
  }

  const userMsg = [
    `Listing: ${body.listing_title ?? "(unnamed)"} (${body.category})`,
    `Asking: $${(body.listing_price_cents / 100).toLocaleString()}`,
    `Offer:  $${(body.offer_amount_cents / 100).toLocaleString()}`,
    body.deal_score !== undefined ? `Deal score: ${body.deal_score}/100` : "Deal score: (none)",
  ].join("\n");

  try {
    const out = await callLLM({
      system: SYSTEM,
      user: userMsg,
      maxTokens: 1200,
      temperature: 0.5,
      responseFormat: "json",
    });
    const parsed = parseJSON<NegotiationResult>(out.text);
    return jsonResponse({
      ...parsed,
      _disclaimer: DISCLAIMER,
      _meta: { provider: out.provider, model: out.model, tokens_in: out.inputTokens, tokens_out: out.outputTokens },
    }, 200, req);
  } catch (e) {
    return errorResponse((e as Error).message, 500, req);
  }
});
