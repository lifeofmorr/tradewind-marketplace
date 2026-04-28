// POST /functions/v1/ai-pricing-estimate
// Body: { category, make, model, year, mileage_or_hours?, state? }
// Returns: { median_cents, low_cents, high_cents, comp_count, rationale }

import { handleOptions, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { callLLM, parseJSON } from "../_shared/anthropic.ts";

interface Body {
  category: string;
  make: string;
  model: string;
  year: number;
  mileage_or_hours?: number;
  state?: string;
}

interface Estimate {
  median_cents: number;
  low_cents: number;
  high_cents: number;
  comp_count: number;
  rationale: string;
}

const SYSTEM = `You are TradeWind's pricing estimator for boats and autos.

Use your knowledge of typical US private/dealer pricing as of the model year through today.
Output a single JSON object with realistic CENTS values:
- median_cents (your best central estimate, in CENTS)
- low_cents (10th percentile)
- high_cents (90th percentile)
- comp_count (a rough integer of how many similar comps you considered)
- rationale (1–2 sentence explanation of the range and key drivers)

For boats older than 10 years, condition and engine hours dominate. For autos older than 5 years, mileage dominates. State affects salt/no-salt for boats and tax/regulation for exotics.

Output ONLY JSON.`;

Deno.serve(async (req: Request) => {
  const pre = handleOptions(req); if (pre) return pre;
  if (req.method !== "POST") return errorResponse("POST only", 405);
  let body: Body;
  try { body = await req.json() as Body; } catch { return errorResponse("Invalid JSON"); }
  if (!body.make || !body.model || !body.year || !body.category) {
    return errorResponse("category, make, model, year required");
  }

  const isBoat = ["boat","performance_boat","yacht","center_console"].includes(body.category);
  const user = `Category: ${body.category}\nMake: ${body.make}\nModel: ${body.model}\nYear: ${body.year}\n` +
    (body.mileage_or_hours != null ? `${isBoat ? "Hours" : "Mileage"}: ${body.mileage_or_hours}\n` : "") +
    (body.state ? `State: ${body.state}\n` : "");

  try {
    const out = await callLLM({
      system: SYSTEM,
      user,
      maxTokens: 600,
      temperature: 0.2,
      responseFormat: "json",
    });
    const est = parseJSON<Estimate>(out.text);
    return jsonResponse(est);
  } catch (e) {
    return errorResponse((e as Error).message, 500);
  }
});
