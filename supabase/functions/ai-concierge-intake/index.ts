// POST /functions/v1/ai-concierge-intake
// Body: { messages: ChatMsg[] }
// Returns: { intake: ConciergeIntake }

import { handleOptions, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { callLLM, parseJSON } from "../_shared/anthropic.ts";

interface ChatMsg { role: "user" | "assistant"; content: string }
interface Body { messages: ChatMsg[] }

interface ConciergeIntake {
  category: string;
  budget_min_cents: number;
  budget_max_cents: number;
  desired_features: string[];
  timeline: string;
  preferred_locations: string[];
  next_question: string | null;
}

const SYSTEM = `You are TradeWind's concierge intake AI.

You are reading a partial conversation between a buyer and a concierge.
Extract a structured intake the human concierge can act on, and propose the next clarifying question.

Output ONLY JSON:
{
  "category": "boat|performance_boat|yacht|center_console|car|truck|exotic|classic|powersports|rv",
  "budget_min_cents": int,
  "budget_max_cents": int,
  "desired_features": [string],
  "timeline": string,
  "preferred_locations": [string],
  "next_question": string|null
}

Rules:
- If a field is unknown, use 0 for cents and "" or [] elsewhere.
- next_question is null when you have enough to start sourcing; otherwise a single sentence.
- Cents = integer USD * 100.`;

Deno.serve(async (req: Request) => {
  const pre = handleOptions(req); if (pre) return pre;
  if (req.method !== "POST") return errorResponse("POST only", 405);
  let body: Body;
  try { body = await req.json() as Body; } catch { return errorResponse("Invalid JSON"); }
  if (!body.messages?.length) return errorResponse("messages required");

  const transcript = body.messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");

  try {
    const out = await callLLM({
      system: SYSTEM,
      user: `Conversation:\n\n${transcript}`,
      maxTokens: 600,
      temperature: 0.2,
      responseFormat: "json",
    });
    const intake = parseJSON<ConciergeIntake>(out.text);
    return jsonResponse({ intake });
  } catch (e) {
    return errorResponse((e as Error).message, 500);
  }
});
