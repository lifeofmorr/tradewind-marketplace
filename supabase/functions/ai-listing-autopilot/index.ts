// POST /functions/v1/ai-listing-autopilot
// Body: {
//   title?: string, description?: string, category: string,
//   price_cents?: number, specs?: Record<string, unknown>
// }
// Returns: {
//   suggested_title, suggested_description, missing_specs[],
//   price_assessment, quality_tips[], _disclaimer
// }

import { handleOptions, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { callLLM, parseJSON } from "../_shared/anthropic.ts";

interface Body {
  title?: string;
  description?: string;
  category: string;
  price_cents?: number;
  specs?: Record<string, unknown>;
}

interface AutopilotResult {
  suggested_title: string;
  suggested_description: string;
  missing_specs: string[];
  price_assessment: string;
  quality_tips: string[];
}

const SYSTEM = `You are TradeWind's Listing Quality Advisor. Given a draft listing, you return suggestions for improving it.

You output JSON with these keys:
- suggested_title (string, ≤80 chars; if the existing title is already strong, return it unchanged)
- suggested_description (string, 800–1500 chars; if the existing description is already strong, return it lightly cleaned up)
- missing_specs (array of plain-English strings naming specs the listing should add; max 6)
- price_assessment (string, 1–2 sentences; comment on whether the price reads as fair/aggressive/light without inventing market data — speak in qualitative terms)
- quality_tips (array of 1-line actionable tips, max 5; e.g. "Add an engine-hour reading", "Mention recent service")

Tone: confident, specific, no fluff. No emojis, no exclamation points. Output ONLY a single JSON object — no prose, no fences.`;

const DISCLAIMER =
  "Advisory only — TradeWind's AI suggestions are non-binding and do not replace a professional appraisal or surveyor inspection.";

Deno.serve(async (req: Request) => {
  const pre = handleOptions(req); if (pre) return pre;
  if (req.method !== "POST") return errorResponse("POST only", 405, req);
  let body: Body;
  try { body = await req.json() as Body; } catch { return errorResponse("Invalid JSON", 400, req); }
  if (!body.category) return errorResponse("category required", 400, req);

  const userMsg = [
    `Category: ${body.category}`,
    body.title ? `Title: ${body.title}` : "Title: (none)",
    body.price_cents ? `Asking: $${(body.price_cents / 100).toLocaleString()}` : "Asking: (none)",
    body.specs && Object.keys(body.specs).length
      ? `Specs:\n${JSON.stringify(body.specs, null, 2)}`
      : "Specs: (none)",
    body.description ? `Description:\n${body.description}` : "Description: (none)",
  ].join("\n\n");

  try {
    const out = await callLLM({
      system: SYSTEM,
      user: userMsg,
      maxTokens: 1500,
      temperature: 0.4,
      responseFormat: "json",
    });
    const parsed = parseJSON<AutopilotResult>(out.text);
    return jsonResponse({
      ...parsed,
      _disclaimer: DISCLAIMER,
      _meta: { provider: out.provider, model: out.model, tokens_in: out.inputTokens, tokens_out: out.outputTokens },
    }, 200, req);
  } catch (e) {
    return errorResponse((e as Error).message, 500, req);
  }
});
