// POST /functions/v1/ai-fraud-check
// Body: { email?, phone?, message?, listing_title?, listing_price_cents? }
// Returns: { score, signals[], recommended_action }

import { handleOptions, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { callLLM, parseJSON } from "../_shared/anthropic.ts";

interface Body {
  email?: string;
  phone?: string;
  message?: string;
  listing_title?: string;
  listing_price_cents?: number;
}

interface Verdict {
  score: number;                                  // 0–100
  signals: string[];
  recommended_action: "allow" | "review" | "block";
}

const SYSTEM = `You are TradeWind's fraud-screening AI for marketplace inquiries.
Score the message 0–100 (100 = certainly fraud) and list specific signals.

Common fraud signals on a high-ticket marketplace:
- "Is this still available?" with no other context
- Generic message + suspicious email domain
- Pressure to move off-platform (telegram, whatsapp, email)
- Asking for VIN/HIN+title only, no inspection
- Wire transfer / Western Union mentions
- Phishing-style URL in the message
- Mismatched email/phone country vs. listing location
- Offers above asking price sight-unseen
- Shipper/agent intermediary scams

Recommended action: allow (score < 30), review (30–70), block (> 70).

Output ONLY JSON: { "score": int, "signals": [string], "recommended_action": "allow"|"review"|"block" }.`;

Deno.serve(async (req: Request) => {
  const pre = handleOptions(req); if (pre) return pre;
  if (req.method !== "POST") return errorResponse("POST only", 405);
  let body: Body;
  try { body = await req.json() as Body; } catch { return errorResponse("Invalid JSON"); }

  const user = `Listing: ${body.listing_title ?? "(unknown)"}\n` +
    `Listing price (USD): ${body.listing_price_cents != null ? (body.listing_price_cents / 100).toFixed(0) : "(unknown)"}\n` +
    `Buyer email: ${body.email ?? "(none)"}\n` +
    `Buyer phone: ${body.phone ?? "(none)"}\n\n` +
    `Message:\n${body.message ?? "(empty)"}`;

  try {
    const out = await callLLM({
      system: SYSTEM,
      user,
      maxTokens: 400,
      temperature: 0.1,
      responseFormat: "json",
    });
    const verdict = parseJSON<Verdict>(out.text);
    return jsonResponse(verdict);
  } catch (e) {
    return errorResponse((e as Error).message, 500);
  }
});
