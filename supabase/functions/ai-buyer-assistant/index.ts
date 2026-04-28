// POST /functions/v1/ai-buyer-assistant
// Body: { messages: {role,content}[], context?: { listing_id?, saved_listing_ids? } }
// Returns: { reply: string }

import { handleOptions, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { callLLM } from "../_shared/anthropic.ts";

interface ChatMsg { role: "user" | "assistant"; content: string }
interface Body { messages: ChatMsg[]; context?: { listing_id?: string; saved_listing_ids?: string[] } }

const SYSTEM = `You are TradeWind's buyer concierge. You help buyers narrow boat / car decisions.

Behavior:
- Ask one focused question per turn until you understand budget, intended use, and must-haves.
- Once oriented, recommend 2–3 categories or specific makes/models with one-sentence rationale each.
- If the user asks about a specific listing, focus your advice on that listing.
- Be concise. No emojis. No marketing fluff.`;

Deno.serve(async (req: Request) => {
  const pre = handleOptions(req); if (pre) return pre;
  if (req.method !== "POST") return errorResponse("POST only", 405);
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
