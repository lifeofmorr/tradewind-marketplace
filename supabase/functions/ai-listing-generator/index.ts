// POST /functions/v1/ai-listing-generator
// Body: { prompt: string, category: string }
// Returns: { draft: ListingDraft }

import { handleOptions, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { callLLM, parseJSON } from "../_shared/anthropic.ts";

interface Body { prompt: string; category: string }

interface ListingDraft {
  title: string;
  description: string;
  ai_summary: string;
  make?: string;
  model?: string;
  year?: number;
  category?: string;
  length_ft?: number;
  hours?: number;
  engine_count?: number;
  engine_hp?: number;
  mileage?: number;
  drivetrain?: string;
  fuel_type?: string;
  city?: string;
  state?: string;
  suggested_price_cents?: number;
}

const SYSTEM = `You are TradeWind's listing copywriter. Given a seller's free-text prompt about a boat or vehicle, you produce a structured listing JSON.

Tone:
- Confident, specific, no fluff. No emojis. No exclamation points.
- Mention model details, condition, recent service, key features.

JSON keys:
- title (string, ≤80 chars, includes year/make/model)
- description (string, 800–1500 chars, plain prose)
- ai_summary (string, 1–2 sentences for cards)
- make, model (string, optional)
- year (number, optional)
- category (one of: boat, performance_boat, yacht, center_console, car, truck, exotic, classic, powersports, rv)
- For boats: length_ft, hours, engine_count, engine_hp (numbers, optional)
- For autos: mileage, drivetrain, fuel_type (numbers/strings, optional)
- city, state (strings, optional)
- suggested_price_cents (integer, optional, your best guess in CENTS)

Output ONLY a single JSON object. No prose, no code fences.`;

Deno.serve(async (req: Request) => {
  const pre = handleOptions(req); if (pre) return pre;
  if (req.method !== "POST") return errorResponse("POST only", 405);
  let body: Body;
  try { body = await req.json() as Body; } catch { return errorResponse("Invalid JSON"); }
  if (!body.prompt || !body.category) return errorResponse("prompt + category required");

  try {
    const out = await callLLM({
      system: SYSTEM,
      user: `Category: ${body.category}\n\nSeller said:\n${body.prompt}`,
      maxTokens: 1500,
      temperature: 0.5,
      responseFormat: "json",
    });
    const draft = parseJSON<ListingDraft>(out.text);
    return jsonResponse({ draft, _meta: { provider: out.provider, model: out.model, tokens_in: out.inputTokens, tokens_out: out.outputTokens } });
  } catch (e) {
    return errorResponse((e as Error).message, 500);
  }
});
