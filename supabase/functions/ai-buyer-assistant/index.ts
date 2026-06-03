// POST /functions/v1/ai-buyer-assistant
// Body: { messages: {role,content}[], context?: { listing_id?, saved_listing_ids? } }
// Returns: { reply: string }

import { handleOptions, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { callLLM } from "../_shared/anthropic.ts";
import { enforceAiRateLimit } from "../_shared/rate-limit.ts";

interface ChatMsg { role: "user" | "assistant"; content: string }
interface Body { messages: ChatMsg[]; context?: { listing_id?: string; saved_listing_ids?: string[] } }

const SYSTEM = `You are Tradewind's buyer concierge. You help buyers narrow boat, car, or aircraft decisions.

Behavior:
- Ask one focused question per turn until you understand budget, intended use, and must-haves.
- Once oriented, recommend 2–3 categories or specific makes/models with one-sentence rationale each.
- If the user asks about a specific listing, focus your advice on that listing.
- For aircraft: ask about mission profile (training, transport, business, fun), expected annual hours, runway constraints, and IFR vs. VFR before recommending. Always remind that a licensed A&P/IA pre-buy is required before any aircraft purchase decision is final.
- Be concise. No emojis. No marketing fluff.`;

Deno.serve(async (req: Request) => {
  const pre = handleOptions(req); if (pre) return pre;
  if (req.method !== "POST") return errorResponse("POST only", 405);
  const limited = await enforceAiRateLimit(req, "ai-buyer-assistant");
  if (limited) return limited;
  let body: Body;
  try { body = await req.json() as Body; } catch { return errorResponse("Invalid JSON"); }
  if (!body.messages?.length) return errorResponse("messages required");

  const ctx: string[] = [];
  if (body.context?.listing_id) ctx.push(`Buyer is viewing listing ${body.context.listing_id}.`);
  if (body.context?.saved_listing_ids?.length) ctx.push(`Buyer has saved ${body.context.saved_listing_ids.length} listings.`);

  const transcript = body.messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
  const user = `${ctx.length ? `Context:\n${ctx.join("\n")}\n\n` : ""}Conversation so far:\n\n${transcript}\n\nReply as the assistant. Output only the reply text.`;

  try {
    const out = await callLLM({ system: SYSTEM, user, maxTokens: 600, temperature: 0.6 });
    return jsonResponse({ reply: out.text, _meta: { provider: out.provider, model: out.model } });
  } catch (e) {
    return errorResponse((e as Error).message, 500);
  }
});
