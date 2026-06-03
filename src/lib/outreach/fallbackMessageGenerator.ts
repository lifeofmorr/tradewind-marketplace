// Fallback outreach message generator — pure TypeScript, no network calls.
//
// Used by:
//   - The admin dashboard, as a deterministic preview when the AI generator
//     is offline or returns garbage.
//   - The build-daily-queue edge function, when the AI call fails (no
//     credits, network error, timeout, banned-phrase rejection).
//
// Mirrors the founder voice rules in
//   go-to-market/outreach-autopilot/HUMAN_VOICE_RULES.md
// and the banned phrases in src/lib/outreach/messageQuality.ts.
//
// The output passes checkMessageQuality() — that contract is enforced by
// src/__tests__/fallbackMessageGenerator.test.ts. If you change a template,
// keep it passing.

import { BANNED_PHRASES } from "./messageQuality";

// ── Verticals we support ────────────────────────────────────────────────────

export type Vertical =
  | "boat_dealer"
  | "yacht_broker"
  | "auto_dealer"
  | "exotic_dealer"
  | "classic_dealer"
  | "aircraft_broker"
  | "marine_surveyor"
  | "transport"
  | "lender"
  | "insurance"
  | "escrow_title"
  | "ap_mechanic";

export const SUPPORTED_VERTICALS: readonly Vertical[] = [
  "boat_dealer",
  "yacht_broker",
  "auto_dealer",
  "exotic_dealer",
  "classic_dealer",
  "aircraft_broker",
  "marine_surveyor",
  "transport",
  "lender",
  "insurance",
  "escrow_title",
  "ap_mechanic",
];

export interface FallbackLead {
  company: string;
  contact_name?: string | null;
  contact_role?: string | null;
  vertical: string;
  location?: string | null;
  website?: string | null;
  personalization_angle?: string | null;
  pain_point?: string | null;
  recommended_offer?: string | null;
}

export type Channel = "email" | "linkedin" | "instagram";

export interface FallbackOutput {
  subject: string;
  body: string;
  cta: string;
  personalization_note: string;
  generation_source: "fallback_template";
}

// ── Constants we never vary ────────────────────────────────────────────────

const OPT_OUT_LINE =
  "If this is not relevant, no worries — just tell me and I will not follow up.";

const DEFAULT_CTA =
  "Would you be open to a quick 10-minute look and giving honest feedback?";

const SIGN_OFF = "— Don\nTradewind";

// ── Per-vertical templates ─────────────────────────────────────────────────
//
// Each vertical defines:
//   - label: human-readable vertical name (used in personalization_note)
//   - subject: lowercase, 3–6 words, real noun
//   - observation: one specific-but-generic line a real person could write
//     before having researched the company
//   - hook: the "why I am writing" sentence — what Tradewind does for them
//   - offer: the soft beta-honest line about what is free during beta
//   - cta: most use the default, but service-provider verticals get tailored

interface Template {
  label: string;
  subject: (company: string) => string;
  observation: (lead: FallbackLead) => string;
  hook: string;
  offer: string;
  cta?: string;
}

const TEMPLATES: Record<Vertical, Template> = {
  boat_dealer: {
    label: "boat dealer",
    subject: (company) => `your inventory at ${company.toLowerCase()}`,
    observation: (lead) =>
      lead.personalization_angle?.trim()
        ? lead.personalization_angle.trim()
        : `Took a look at ${lead.company}${
            lead.location ? ` in ${lead.location}` : ""
          } this morning. The mix of boats you carry is the kind of inventory I want on the platform early.`,
    hook:
      "I am Don, building Tradewind, a marketplace for boats, autos, and aircraft. Dealers get a clean profile, AI-built listing descriptions from your photos and notes, and a feed of buyer requests filtered to your inventory.",
    offer:
      "Private beta. Free for 60 days. No fee until you see real lead flow.",
  },

  yacht_broker: {
    label: "yacht broker",
    subject: (company) => `quick note for ${company.toLowerCase()}`,
    observation: (lead) =>
      lead.personalization_angle?.trim()
        ? lead.personalization_angle.trim()
        : `Looked at ${lead.company}${
            lead.location ? ` over in ${lead.location}` : ""
          }. Your listing mix and the way you present larger boats stood out.`,
    hook:
      "I am Don, building Tradewind, a marketplace for boats, autos, and aircraft. Brokers get a verified profile, AI-built listing copy, and inbound buyer requests routed to the kind of boats you actually carry.",
    offer:
      "Private beta. Free for 60 days. No fee until you see real lead flow.",
  },

  auto_dealer: {
    label: "auto dealer",
    subject: (company) => `quick note for ${company.toLowerCase()}`,
    observation: (lead) =>
      lead.personalization_angle?.trim()
        ? lead.personalization_angle.trim()
        : `Took a look at ${lead.company}${
            lead.location ? ` in ${lead.location}` : ""
          }. The inventory mix made me want to reach out before we open the platform up further.`,
    hook:
      "I am Don, building Tradewind, a marketplace for boats, autos, and aircraft. Dealers get a clean profile, AI-built listing descriptions from your photos and notes, and inbound buyer requests routed to your actual stock.",
    offer:
      "Private beta. Free for 60 days. No fee until you see real lead flow.",
  },

  exotic_dealer: {
    label: "exotic car dealer",
    subject: (company) => `your exotic inventory`,
    observation: (lead) =>
      lead.personalization_angle?.trim()
        ? lead.personalization_angle.trim()
        : `Spent some time on ${lead.company}${
            lead.location ? ` (${lead.location})` : ""
          }. The exotic mix you carry is the kind of inventory I want on the platform early.`,
    hook:
      "I am Don, building Tradewind, a marketplace for boats, exotic and classic cars, and aircraft. Dealers get a verified profile, AI-built listing copy, and serious buyer inquiries routed to their actual stock.",
    offer:
      "Private beta. Free for 60 days. No fee until you see real lead flow.",
  },

  classic_dealer: {
    label: "classic car dealer",
    subject: (company) => `your classic inventory`,
    observation: (lead) =>
      lead.personalization_angle?.trim()
        ? lead.personalization_angle.trim()
        : `Read through your inventory at ${lead.company}${
            lead.location ? ` (${lead.location})` : ""
          }. Classic listings done right are rare and yours stood out.`,
    hook:
      "I am Don, building Tradewind, a marketplace for boats, classic and exotic cars, and aircraft. Dealers get a verified profile, AI-built listing copy from your existing photos and notes, and inbound buyer requests routed to your inventory.",
    offer:
      "Private beta. Free for 60 days. No fee until you see real lead flow.",
  },

  aircraft_broker: {
    label: "aircraft broker",
    subject: () => `quick aircraft broker question`,
    observation: (lead) =>
      lead.personalization_angle?.trim()
        ? lead.personalization_angle.trim()
        : `Read through the listings at ${lead.company}${
            lead.location ? ` (${lead.location})` : ""
          } this morning. The mix you carry is the kind of inventory I want on the platform early.`,
    hook:
      "I am Don, building Tradewind, a marketplace that now includes aircraft (jets, helicopters, turbines). Brokers get a verified profile, AI-built listing copy, and inbound buyer requests routed to the kinds of aircraft you actually sell.",
    offer:
      "Private beta. Free for 60 days. No fee until you see real lead flow.",
  },

  marine_surveyor: {
    label: "marine surveyor",
    subject: () => `buyers asking who to trust for surveys`,
    observation: (lead) =>
      lead.personalization_angle?.trim()
        ? lead.personalization_angle.trim()
        : `Found ${lead.company}${
            lead.location ? ` in ${lead.location}` : ""
          } while looking for surveyors I would actually route buyers to.`,
    hook:
      "I am Don, building Tradewind, a marketplace for boats, autos, and aircraft. Right now buyers find us through search, then they immediately ask 'who can I trust to survey this.' I want surveyors like you on the network so I can route those requests instead of telling people to search around.",
    offer:
      "Free profile during beta, free routed leads, no fee until you see real volume.",
    cta: "Would you be open to a quick 10-minute call to walk through how this would look?",
  },

  transport: {
    label: "transport / logistics provider",
    subject: () => `buyers asking about transport`,
    observation: (lead) =>
      lead.personalization_angle?.trim()
        ? lead.personalization_angle.trim()
        : `Found ${lead.company}${
            lead.location ? ` based in ${lead.location}` : ""
          } while looking for transport partners I would actually route deals to.`,
    hook:
      "I am Don, building Tradewind, a marketplace for boats, autos, and aircraft. Buyers and sellers on the platform constantly need transport, and right now I have nobody honest to route them to. I would rather have a small bench of good partners than a directory.",
    offer:
      "Free partner profile during beta, free routed leads, no fee until real volume.",
    cta: "Would you be open to a quick 10-minute call to walk through how this would look?",
  },

  lender: {
    label: "lender",
    subject: () => `marketplace buyers needing financing`,
    observation: (lead) =>
      lead.personalization_angle?.trim()
        ? lead.personalization_angle.trim()
        : `Came across ${lead.company}${
            lead.location ? ` (${lead.location})` : ""
          } while looking for finance partners on the boats and aircraft side.`,
    hook:
      "I am Don, building Tradewind, a marketplace for boats, autos, and aircraft. Buyers on the platform routinely ask 'who finances this' and right now I just hand them a Google result. I would rather route them to a partner I trust.",
    offer:
      "Free partner profile during beta, no fee until real deal flow.",
    cta: "Open to a quick 10-minute call to see if a partner setup makes sense?",
  },

  insurance: {
    label: "marine / aviation / specialty insurer",
    subject: () => `marketplace buyers asking about coverage`,
    observation: (lead) =>
      lead.personalization_angle?.trim()
        ? lead.personalization_angle.trim()
        : `Came across ${lead.company}${
            lead.location ? ` (${lead.location})` : ""
          } while looking for an insurance partner I would actually route buyers to.`,
    hook:
      "I am Don, building Tradewind, a marketplace for boats, autos, and aircraft. Every closed deal triggers a 'who do I use for coverage' question, and right now I do not have a real answer. I want a small set of partners I trust.",
    offer:
      "Free partner profile during beta, free routed leads, no fee until real volume.",
    cta: "Open to a quick 10-minute call to see if this makes sense for you?",
  },

  escrow_title: {
    label: "escrow / title partner",
    subject: () => `marketplace deals needing escrow and title`,
    observation: (lead) =>
      lead.personalization_angle?.trim()
        ? lead.personalization_angle.trim()
        : `Found ${lead.company}${
            lead.location ? ` (${lead.location})` : ""
          } while looking for an escrow and title partner who actually handles boats and aircraft.`,
    hook:
      "I am Don, building Tradewind, a marketplace for boats, autos, and aircraft. Buyers close on big-ticket assets and immediately need escrow and clean title handling. I do not want to wing that part. I want a partner on the platform.",
    offer:
      "Free partner profile during beta, no fee until real deal flow.",
    cta: "Open to a quick 10-minute call to see if this makes sense?",
  },

  ap_mechanic: {
    label: "A&P mechanic / aircraft maintenance shop",
    subject: () => `aircraft owners looking for shops`,
    observation: (lead) =>
      lead.personalization_angle?.trim()
        ? lead.personalization_angle.trim()
        : `Found ${lead.company}${
            lead.location ? ` (${lead.location})` : ""
          } while looking for shops I would actually route owners to.`,
    hook:
      "I am Don, building Tradewind, a marketplace for aircraft buyers and owners. Buyers close on a plane and immediately ask 'who can I trust to inspect or maintain this.' I want shops like yours on the network so I can route those requests instead of telling people to Google.",
    offer:
      "Free profile during beta, free routed leads, no fee until you see real volume.",
    cta: "Worth a quick call to walk through how this would look?",
  },
};

// ── Vertical normalization ─────────────────────────────────────────────────
//
// Lead data is messy. Accept common aliases and case variants and resolve
// them to a supported Vertical. Unknown verticals fall back to boat_dealer
// (the most common one) — the personalization_note flags this.

const VERTICAL_ALIASES: Record<string, Vertical> = {
  boat_dealer: "boat_dealer",
  "boat dealer": "boat_dealer",
  boat: "boat_dealer",
  boats: "boat_dealer",
  marine_dealer: "boat_dealer",
  "marine dealer": "boat_dealer",
  yacht_broker: "yacht_broker",
  "yacht broker": "yacht_broker",
  yacht: "yacht_broker",
  broker: "yacht_broker",
  auto_dealer: "auto_dealer",
  "auto dealer": "auto_dealer",
  auto: "auto_dealer",
  car_dealer: "auto_dealer",
  "car dealer": "auto_dealer",
  used_car_dealer: "auto_dealer",
  exotic_dealer: "exotic_dealer",
  "exotic dealer": "exotic_dealer",
  exotic: "exotic_dealer",
  "exotic car dealer": "exotic_dealer",
  supercar_dealer: "exotic_dealer",
  classic_dealer: "classic_dealer",
  "classic dealer": "classic_dealer",
  classic: "classic_dealer",
  "classic car dealer": "classic_dealer",
  vintage_dealer: "classic_dealer",
  aircraft_broker: "aircraft_broker",
  "aircraft broker": "aircraft_broker",
  aircraft: "aircraft_broker",
  plane_broker: "aircraft_broker",
  jet_broker: "aircraft_broker",
  marine_surveyor: "marine_surveyor",
  "marine surveyor": "marine_surveyor",
  surveyor: "marine_surveyor",
  boat_surveyor: "marine_surveyor",
  transport: "transport",
  transporter: "transport",
  logistics: "transport",
  hauler: "transport",
  shipper: "transport",
  lender: "lender",
  lending: "lender",
  finance: "lender",
  financing: "lender",
  bank: "lender",
  insurance: "insurance",
  insurer: "insurance",
  marine_insurance: "insurance",
  aviation_insurance: "insurance",
  escrow_title: "escrow_title",
  "escrow / title": "escrow_title",
  "escrow & title": "escrow_title",
  escrow: "escrow_title",
  title: "escrow_title",
  title_company: "escrow_title",
  ap_mechanic: "ap_mechanic",
  "a&p mechanic": "ap_mechanic",
  "a&p": "ap_mechanic",
  mechanic: "ap_mechanic",
  maintenance: "ap_mechanic",
  aircraft_maintenance: "ap_mechanic",
  ia: "ap_mechanic",
};

export function resolveVertical(raw: string | null | undefined): {
  vertical: Vertical;
  matched: boolean;
} {
  if (!raw) return { vertical: "boat_dealer", matched: false };
  const key = raw.trim().toLowerCase().replace(/\s+/g, " ");
  const direct = VERTICAL_ALIASES[key];
  if (direct) return { vertical: direct, matched: true };
  const underscored = VERTICAL_ALIASES[key.replace(/\s+/g, "_")];
  if (underscored) return { vertical: underscored, matched: true };
  return { vertical: "boat_dealer", matched: false };
}

// ── Body assembly ──────────────────────────────────────────────────────────

function firstName(contactName: string | null | undefined): string {
  if (!contactName) return "team";
  const trimmed = contactName.trim();
  if (!trimmed) return "team";
  const first = trimmed.split(/\s+/)[0];
  return first.length > 1 ? first : "team";
}

function buildEmailBody(t: Template, lead: FallbackLead): string {
  const greeting = `Hey ${firstName(lead.contact_name)} —`;
  const cta = t.cta ?? DEFAULT_CTA;
  const lines: string[] = [];
  lines.push(greeting);
  lines.push("");
  lines.push(t.observation(lead));
  lines.push("");
  lines.push(t.hook);
  lines.push("");
  lines.push(t.offer);
  lines.push("");
  lines.push(cta);
  lines.push("");
  lines.push(OPT_OUT_LINE);
  lines.push("");
  lines.push(SIGN_OFF);
  return lines.join("\n");
}

function buildLinkedInBody(t: Template, lead: FallbackLead): string {
  const cta = t.cta ?? DEFAULT_CTA;
  const lines: string[] = [];
  lines.push(`Hey ${firstName(lead.contact_name)} —`);
  lines.push("");
  lines.push(t.observation(lead));
  lines.push("");
  lines.push(t.hook);
  lines.push("");
  lines.push(t.offer);
  lines.push("");
  lines.push(cta);
  lines.push("");
  lines.push(OPT_OUT_LINE);
  lines.push("");
  lines.push("— Don");
  return lines.join("\n");
}

function buildInstagramBody(t: Template, lead: FallbackLead): string {
  // IG DMs need to be very short. Keep it under 70 words.
  const first = firstName(lead.contact_name);
  const obs = t.observation(lead).split(/\.\s+/)[0];
  return [
    `Hey ${first} — ${obs}.`,
    `I am Don, building Tradewind (marketplace for boats, autos, and aircraft). We are in private beta and bringing on a few ${t.label}s with real inventory. Free profile during beta.`,
    `Open to a 10-minute look?`,
    OPT_OUT_LINE,
    `— Don`,
  ].join("\n\n");
}

// ── Public API ─────────────────────────────────────────────────────────────

export function generateFallbackMessage(
  lead: FallbackLead,
  channel: Channel = "email",
): FallbackOutput {
  const { vertical, matched } = resolveVertical(lead.vertical);
  const t = TEMPLATES[vertical];

  let body: string;
  let subject: string;
  if (channel === "email") {
    body = buildEmailBody(t, lead);
    subject = t.subject(lead.company);
  } else if (channel === "linkedin") {
    body = buildLinkedInBody(t, lead);
    subject = "";
  } else {
    body = buildInstagramBody(t, lead);
    subject = "";
  }

  // Defense-in-depth: scrub any banned phrase that snuck in via the lead's
  // free-text personalization_angle. The template strings themselves are
  // checked by tests, but a noisy lead field could still poison the output.
  body = scrubBannedPhrases(body);

  const cta = t.cta ?? DEFAULT_CTA;
  const personalization_note = matched
    ? `Used the ${t.label} template${
        lead.personalization_angle?.trim()
          ? ", interpolated with the personalization angle from the lead row"
          : ", with a generic observation (no personalization_angle on the lead)"
      }.`
    : `Vertical "${lead.vertical}" was not recognised — used the boat dealer template as a safe default. Edit before sending.`;

  return {
    subject,
    body,
    cta,
    personalization_note,
    generation_source: "fallback_template",
  };
}

// Replace any banned phrase with a tame substitution. We never want a
// fallback message to fail the quality check downstream.
function scrubBannedPhrases(text: string): string {
  let out = text;
  for (const phrase of BANNED_PHRASES) {
    if (!phrase) continue;
    const re = new RegExp(escapeRegExp(phrase), "gi");
    out = out.replace(re, "");
  }
  return out.replace(/[ ]{2,}/g, " ").replace(/\n[ \t]+/g, "\n");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
