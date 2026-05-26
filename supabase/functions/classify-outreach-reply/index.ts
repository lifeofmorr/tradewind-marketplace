// POST /functions/v1/classify-outreach-reply
//
// Classify a cold-outreach reply and recommend a human response.
//
// Input:
//   {
//     lead_id: uuid,
//     reply_text: string,
//     channel: "email" | "linkedin" | "instagram" | "phone" | "voicemail" | "other"
//   }
//
// Output:
//   {
//     reply_type: "interested" | "wants_more_info" | "wants_demo" |
//                 "asks_pricing" | "not_interested" | "follow_up_later" |
//                 "remove_me" | "wrong_person" | "out_of_office" | "other",
//     recommended_response: string,
//     confidence: number 0..1
//   }
//
// Side effects (RLS-enforced via caller's JWT):
//   - inserts an outreach_replies row
//   - updates outreach_leads.status (and do_not_contact if remove_me/not_interested)
//   - cancels outstanding outreach_followups for negative replies
//   - writes an activity log entry

import { handleOptions, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { callLLM, parseJSON } from "../_shared/anthropic.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

interface Body {
  lead_id: string;
  reply_text: string;
  channel: string;
  message_id?: string | null;
}

interface Classified {
  reply_type: string;
  recommended_response: string;
  confidence: number;
}

const SYSTEM = `You classify replies to founder-led cold outreach for TradeWind, a marketplace for boats, exotic cars, and aircraft.

Pick ONE reply_type from this exact list:
- interested            → positive, wants to learn more, asks a follow-up question
- wants_more_info       → polite curiosity, wants details before committing
- wants_demo            → explicitly asks for a demo/call/walkthrough
- asks_pricing          → asks how much / what does it cost / pricing structure
- not_interested        → polite no, not now, doesn't see fit
- follow_up_later       → "ask me in Q3" / "later this year" / "remind me in 6 months"
- remove_me             → explicit opt-out, unsubscribe, "stop contacting me"
- wrong_person          → "I'm not the right contact, try X" / "I left this company"
- out_of_office         → autoresponder / OOO bounce
- other                 → genuinely doesn't fit any of the above

Then write a SHORT recommended_response (2–5 sentences, founder tone, plain English):
- Match the reply's energy. If they're warm, be warm. If they're brief, be brief.
- For wants_demo/interested: propose a 10-minute look, offer 2 time options as placeholders [TIME_1] [TIME_2], mention calendar link [CALENDAR_LINK].
- For asks_pricing: be honest — beta is free for the first 60 days, free profile, first 10 listings free, then a transparent fee.
- For not_interested / remove_me: thank them, confirm no further contact, no pushback.
- For wrong_person: thank them, ask for the right contact if they'd share.
- For follow_up_later: confirm the date, set expectation that you'll circle back then.
- Never use buzzwords or AI-speak. No "I hope this finds you well." No "circle back." No emojis.

Output ONLY this JSON:
{
  "reply_type": "one of the values above",
  "recommended_response": "string",
  "confidence": 0.0 to 1.0
}`;

const VALID_TYPES = new Set([
  "interested", "wants_more_info", "wants_demo", "asks_pricing",
  "not_interested", "follow_up_later", "remove_me", "wrong_person",
  "out_of_office", "other",
]);

const NEGATIVE_TYPES = new Set(["not_interested", "remove_me"]);

async function authedFetch(req: Request, path: string, init: RequestInit = {}): Promise<Response> {
  const auth = req.headers.get("authorization") ?? "";
  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      apikey: SUPABASE_ANON,
      authorization: auth,
      "content-type": "application/json",
      prefer: "return=representation",
    },
  });
}

Deno.serve(async (req: Request) => {
  const pre = handleOptions(req);
  if (pre) return pre;
  if (req.method !== "POST") return errorResponse("POST only", 405, req);

  if (!SUPABASE_URL || !SUPABASE_ANON) {
    return errorResponse("Server missing SUPABASE_URL/SUPABASE_ANON_KEY", 500, req);
  }
  const auth = req.headers.get("authorization");
  if (!auth) return errorResponse("Missing authorization", 401, req);

  let body: Body;
  try { body = await req.json() as Body; } catch { return errorResponse("Invalid JSON", 400, req); }
  if (!body.lead_id || !body.reply_text) {
    return errorResponse("lead_id and reply_text required", 400, req);
  }
  const channel = body.channel || "other";

  // 1) Classify with the LLM.
  let classified: Classified;
  try {
    const llm = await callLLM({
      system: SYSTEM,
      user: `Reply (channel: ${channel}):\n\n${body.reply_text.slice(0, 4000)}\n\nClassify and respond. JSON only.`,
      maxTokens: 500,
      temperature: 0.3,
      responseFormat: "json",
    });
    classified = parseJSON<Classified>(llm.text);
  } catch (e) {
    return errorResponse(`classify failed: ${(e as Error).message}`, 500, req);
  }
  if (!VALID_TYPES.has(classified.reply_type)) {
    classified.reply_type = "other";
  }

  // 2) Insert outreach_replies row.
  await authedFetch(req, "/rest/v1/outreach_replies", {
    method: "POST",
    body: JSON.stringify({
      lead_id: body.lead_id,
      message_id: body.message_id ?? null,
      channel,
      reply_text: body.reply_text,
      reply_type: classified.reply_type,
      recommended_response: classified.recommended_response,
      status: "new",
    }),
  });

  // 3) Update the lead.
  const leadPatch: Record<string, unknown> = { status: "replied", reply_text: body.reply_text };
  if (NEGATIVE_TYPES.has(classified.reply_type)) {
    leadPatch.do_not_contact = true;
    leadPatch.next_action = classified.reply_type === "remove_me"
      ? "Confirmed opt-out — do not contact"
      : "Not interested — closed";
  } else if (classified.reply_type === "wants_demo") {
    leadPatch.next_action = "Book demo";
  } else if (classified.reply_type === "interested" || classified.reply_type === "wants_more_info") {
    leadPatch.next_action = "Reply with details + propose demo";
  } else if (classified.reply_type === "follow_up_later") {
    leadPatch.next_action = "Follow up at requested date";
  }
  await authedFetch(req, `/rest/v1/outreach_leads?id=eq.${body.lead_id}`, {
    method: "PATCH",
    body: JSON.stringify(leadPatch),
  });

  // 4) Cancel outstanding follow-ups on negative.
  if (NEGATIVE_TYPES.has(classified.reply_type)) {
    await authedFetch(
      req,
      `/rest/v1/outreach_followups?lead_id=eq.${body.lead_id}&status=eq.due`,
      {
        method: "PATCH",
        body: JSON.stringify({ status: "cancelled" }),
      },
    );
  }

  // 5) Activity log.
  await authedFetch(req, "/rest/v1/outreach_activity_log", {
    method: "POST",
    body: JSON.stringify({
      lead_id: body.lead_id,
      action: "reply_classified",
      metadata: {
        reply_type: classified.reply_type,
        channel,
        confidence: classified.confidence,
      },
    }),
  });

  return jsonResponse(
    {
      reply_type: classified.reply_type,
      recommended_response: classified.recommended_response,
      confidence: classified.confidence,
      do_not_contact_set: NEGATIVE_TYPES.has(classified.reply_type),
    },
    200,
    req,
  );
});
