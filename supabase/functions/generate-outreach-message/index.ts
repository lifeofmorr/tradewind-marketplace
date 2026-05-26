// POST /functions/v1/generate-outreach-message
//
// Input:
//   {
//     lead: {
//       company, contact_name, contact_role, vertical,
//       location?, website?, personalization_angle?, pain_point?,
//       recommended_offer?, notes?
//     },
//     channel: "email" | "linkedin" | "instagram",
//     vertical?: string,
//     goal?: string,
//     previous_messages?: Array<{ direction, channel, body }>
//   }
//
// Output:
//   {
//     subject, body, personalization_note, cta,
//     quality_score, ai_tone_risk_score, issues
//   }
//
// Founder-voice cold outreach for TradeWind. No buzzwords, no AI-speak.

import { handleOptions, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { callLLM, parseJSON } from "../_shared/anthropic.ts";

interface Lead {
  company: string;
  contact_name?: string | null;
  contact_role?: string | null;
  vertical: string;
  location?: string | null;
  website?: string | null;
  personalization_angle?: string | null;
  pain_point?: string | null;
  recommended_offer?: string | null;
  notes?: string | null;
}

interface PreviousMessage {
  direction: "outbound" | "inbound";
  channel: string;
  body: string;
}

interface Body {
  lead: Lead;
  channel: "email" | "linkedin" | "instagram";
  vertical?: string;
  goal?: string;
  previous_messages?: PreviousMessage[];
}

interface Generated {
  subject: string;
  body: string;
  personalization_note: string;
  cta: string;
}

// ── Banned phrases — mirrors src/lib/outreach/messageQuality.ts ────────────
const BANNED = [
  "revolutionary", "game-changing", "game changing", "cutting-edge", "cutting edge",
  "synergy", "unlock", "seamless", "transform", "leverage ai", "next-generation",
  "next generation", "i hope this finds you well", "i hope this email finds you well",
  "just checking in", "circle back", "circling back", "touch base",
  "moving the needle", "low-hanging fruit", "best-in-class", "world-class",
  "paradigm", "disrupt", "supercharge", "10x",
];

const OVERPROMISE = [
  "guaranteed", "we promise", "always works", "100% success",
  "no risk", "risk-free", "double your sales",
];

const SYSTEM = `You write cold outreach for Don Morrison, founder of TradeWind — a marketplace for boats, exotic cars, and aircraft.

TradeWind is in private beta. Don is the founder reaching out personally to brokers, dealers, marine/aviation service providers, and high-net-worth advisors. The goal is honest, useful conversation — not a sales push.

VOICE RULES (these are absolute):
- Short, plain sentences. Eighth-grade English. No big words when small ones work.
- Specific observations about the recipient's business — never generic.
- Honest founder tone. Acknowledge it's a beta and a cold message.
- No buzzwords. No AI-speak. No fake urgency. No "I hope this finds you well."
- No emojis. No exclamation points. No "just checking in" / "circle back."
- Lead with one specific thing you noticed about their business.
- Then one sentence on what TradeWind is and why it could matter to them.
- Then a soft, low-commitment CTA.
- Then an opt-out line so they don't feel pressured.

CHANNEL FORMAT:
- email: 90–160 words, plain text, no marketing fluff. Include a subject.
  Sign off as "— Don, TradeWind". Use the recipient's first name if known.
- linkedin: 60–110 words, DM-friendly, no subject. Same voice rules.
- instagram: 30–70 words, very casual, like a real human DM. No subject.

DEFAULT CTA (use this exact wording unless the lead context demands different):
"Would you be open to a quick 10-minute look and giving honest feedback?"

OPT-OUT LINE (required, last line before signoff, vary lightly):
"If this isn't relevant, no worries — just tell me and I won't follow up."

BANNED PHRASES (never use any of these):
${BANNED.join(", ")}

NEVER:
- Claim guaranteed results.
- Quote made-up stats.
- Pretend to know more about them than the input gives you.
- Use the phrase "I came across your" — it sounds like every cold email ever.

OUTPUT FORMAT — return ONLY this JSON object, no prose, no code fences:
{
  "subject": "string (empty string for linkedin/instagram)",
  "body": "string — the actual message text, with the opt-out line included",
  "personalization_note": "1 sentence explaining the specific hook you used",
  "cta": "string — the actual CTA sentence used"
}`;

function buildUserPrompt(req: Body): string {
  const { lead, channel, goal, previous_messages: prev } = req;
  const parts: string[] = [];
  parts.push(`Recipient:`);
  parts.push(`- Company: ${lead.company}`);
  if (lead.contact_name) parts.push(`- Name: ${lead.contact_name}`);
  if (lead.contact_role) parts.push(`- Role: ${lead.contact_role}`);
  parts.push(`- Vertical: ${lead.vertical}`);
  if (lead.location) parts.push(`- Location: ${lead.location}`);
  if (lead.website) parts.push(`- Website: ${lead.website}`);
  parts.push("");
  parts.push(`Channel: ${channel}`);
  parts.push(`Goal: ${goal ?? "introduce TradeWind, ask for honest feedback, see if a quick demo makes sense"}`);
  parts.push("");
  parts.push(`Personalization hook (use this — be specific, don't just paraphrase it):`);
  parts.push(lead.personalization_angle?.trim() || "(none provided — infer from company name/vertical and stay generic-but-specific)");
  if (lead.pain_point) {
    parts.push("");
    parts.push(`Pain point we think they have: ${lead.pain_point}`);
  }
  if (lead.recommended_offer) {
    parts.push(`Offer we'd extend: ${lead.recommended_offer}`);
  }
  if (lead.notes) {
    parts.push(`Notes: ${lead.notes}`);
  }
  if (prev && prev.length > 0) {
    parts.push("");
    parts.push(`Prior messages (most recent last) — vary the angle, don't repeat:`);
    for (const m of prev.slice(-3)) {
      parts.push(`[${m.direction} · ${m.channel}] ${m.body.slice(0, 400)}`);
    }
  }
  parts.push("");
  parts.push(`Now write the message. JSON only.`);
  return parts.join("\n");
}

// ── Quality scoring (mirrors src/lib/outreach/messageQuality.ts) ───────────
function scoreMessage(body: string): { quality_score: number; ai_tone_risk_score: number; issues: string[] } {
  const issues: string[] = [];
  const text = body.trim();
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);

  const bannedHits = BANNED.filter((p) => lower.includes(p));
  if (bannedHits.length) issues.push(`buzzwords: ${bannedHits.join(", ")}`);

  const overHits = OVERPROMISE.filter((p) => lower.includes(p));
  if (overHits.length) issues.push(`overpromise: ${overHits.join(", ")}`);

  if (words.length > 200) issues.push(`too long (${words.length} words)`);
  if (words.length < 25) issues.push(`too short (${words.length} words)`);

  const exclam = (text.match(/!/g) ?? []).length;
  if (exclam > 1) issues.push(`too many exclamations (${exclam})`);

  let risk = 0;
  risk += bannedHits.length * 18;
  risk += overHits.length * 20;
  if (words.length > 200) risk += 10;
  if (words.length < 25) risk += 5;
  if (exclam > 1) risk += 8;
  if (risk > 100) risk = 100;

  const quality = Math.max(0, 100 - risk - issues.length * 3);
  return { quality_score: quality, ai_tone_risk_score: risk, issues };
}

Deno.serve(async (req: Request) => {
  const pre = handleOptions(req);
  if (pre) return pre;
  if (req.method !== "POST") return errorResponse("POST only", 405, req);

  let body: Body;
  try {
    body = await req.json() as Body;
  } catch {
    return errorResponse("Invalid JSON", 400, req);
  }
  if (!body.lead?.company || !body.lead?.vertical) {
    return errorResponse("lead.company and lead.vertical required", 400, req);
  }
  if (!body.channel || !["email", "linkedin", "instagram"].includes(body.channel)) {
    return errorResponse("channel must be email, linkedin, or instagram", 400, req);
  }

  try {
    const llm = await callLLM({
      system: SYSTEM,
      user: buildUserPrompt(body),
      maxTokens: 900,
      temperature: 0.55,
      responseFormat: "json",
    });
    const gen = parseJSON<Generated>(llm.text);
    if (!gen.body) {
      return errorResponse("LLM returned no body", 502, req);
    }
    const scored = scoreMessage(gen.body);
    return jsonResponse(
      {
        subject: gen.subject ?? "",
        body: gen.body,
        personalization_note: gen.personalization_note ?? "",
        cta: gen.cta ?? "",
        quality_score: scored.quality_score,
        ai_tone_risk_score: scored.ai_tone_risk_score,
        issues: scored.issues,
        provider: llm.provider,
        model: llm.model,
      },
      200,
      req,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return errorResponse(`generate failed: ${msg}`, 500, req);
  }
});
