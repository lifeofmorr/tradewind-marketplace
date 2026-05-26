// Deno port of src/lib/outreach/fallbackMessageGenerator.ts.
//
// Why a port? Edge functions run under Deno and cannot import from src/
// (different module resolution, no .ts→.js step). The TypeScript surface is
// identical so the unit tests in src/__tests__/fallbackMessageGenerator.test.ts
// effectively cover this code by mirror.
//
// If you change voice rules or templates here, change them in
// src/lib/outreach/fallbackMessageGenerator.ts too. The tests will fail if
// the two drift on banned phrases or opt-out wording.

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

const BANNED = [
  "revolutionary", "game-changing", "game changing", "cutting-edge", "cutting edge",
  "synergy", "unlock", "seamless", "transform", "leverage ai", "next-generation",
  "next generation", "i hope this finds you well", "i hope this email finds you well",
  "just checking in", "circle back", "circling back", "touch base",
  "moving the needle", "low-hanging fruit", "best-in-class", "world-class",
  "paradigm", "disrupt", "supercharge", "10x",
];

const OPT_OUT_LINE =
  "If this is not relevant, no worries — just tell me and I will not follow up.";
const DEFAULT_CTA =
  "Would you be open to a quick 10-minute look and giving honest feedback?";
const SIGN_OFF = "— Don\nTradeWind";

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
    subject: (c) => `your inventory at ${c.toLowerCase()}`,
    observation: (l) =>
      l.personalization_angle?.trim() ||
      `Took a look at ${l.company}${l.location ? ` in ${l.location}` : ""} this morning. The mix of boats you carry is the kind of inventory I want on the platform early.`,
    hook:
      "I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. Dealers get a clean profile, AI-built listing descriptions from your photos and notes, and a feed of buyer requests filtered to your inventory.",
    offer: "Private beta. Free for 60 days. No fee until you see real lead flow.",
  },
  yacht_broker: {
    label: "yacht broker",
    subject: (c) => `quick note for ${c.toLowerCase()}`,
    observation: (l) =>
      l.personalization_angle?.trim() ||
      `Looked at ${l.company}${l.location ? ` over in ${l.location}` : ""}. Your listing mix and the way you present larger boats stood out.`,
    hook:
      "I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. Brokers get a verified profile, AI-built listing copy, and inbound buyer requests routed to the kind of boats you actually carry.",
    offer: "Private beta. Free for 60 days. No fee until you see real lead flow.",
  },
  auto_dealer: {
    label: "auto dealer",
    subject: (c) => `quick note for ${c.toLowerCase()}`,
    observation: (l) =>
      l.personalization_angle?.trim() ||
      `Took a look at ${l.company}${l.location ? ` in ${l.location}` : ""}. The inventory mix made me want to reach out before we open the platform up further.`,
    hook:
      "I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. Dealers get a clean profile, AI-built listing descriptions from your photos and notes, and inbound buyer requests routed to your actual stock.",
    offer: "Private beta. Free for 60 days. No fee until you see real lead flow.",
  },
  exotic_dealer: {
    label: "exotic car dealer",
    subject: () => `your exotic inventory`,
    observation: (l) =>
      l.personalization_angle?.trim() ||
      `Spent some time on ${l.company}${l.location ? ` (${l.location})` : ""}. The exotic mix you carry is the kind of inventory I want on the platform early.`,
    hook:
      "I am Don, building TradeWind, a marketplace for boats, exotic and classic cars, and aircraft. Dealers get a verified profile, AI-built listing copy, and serious buyer inquiries routed to their actual stock.",
    offer: "Private beta. Free for 60 days. No fee until you see real lead flow.",
  },
  classic_dealer: {
    label: "classic car dealer",
    subject: () => `your classic inventory`,
    observation: (l) =>
      l.personalization_angle?.trim() ||
      `Read through your inventory at ${l.company}${l.location ? ` (${l.location})` : ""}. Classic listings done right are rare and yours stood out.`,
    hook:
      "I am Don, building TradeWind, a marketplace for boats, classic and exotic cars, and aircraft. Dealers get a verified profile, AI-built listing copy from your existing photos and notes, and inbound buyer requests routed to your inventory.",
    offer: "Private beta. Free for 60 days. No fee until you see real lead flow.",
  },
  aircraft_broker: {
    label: "aircraft broker",
    subject: () => `quick aircraft broker question`,
    observation: (l) =>
      l.personalization_angle?.trim() ||
      `Read through the listings at ${l.company}${l.location ? ` (${l.location})` : ""} this morning. The mix you carry is the kind of inventory I want on the platform early.`,
    hook:
      "I am Don, building TradeWind, a marketplace that now includes aircraft (jets, helicopters, turbines). Brokers get a verified profile, AI-built listing copy, and inbound buyer requests routed to the kinds of aircraft you actually sell.",
    offer: "Private beta. Free for 60 days. No fee until you see real lead flow.",
  },
  marine_surveyor: {
    label: "marine surveyor",
    subject: () => `buyers asking who to trust for surveys`,
    observation: (l) =>
      l.personalization_angle?.trim() ||
      `Found ${l.company}${l.location ? ` in ${l.location}` : ""} while looking for surveyors I would actually route buyers to.`,
    hook:
      "I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. Right now buyers find us through search, then they immediately ask 'who can I trust to survey this.' I want surveyors like you on the network so I can route those requests instead of telling people to search around.",
    offer:
      "Free profile during beta, free routed leads, no fee until you see real volume.",
    cta: "Would you be open to a quick 10-minute call to walk through how this would look?",
  },
  transport: {
    label: "transport / logistics provider",
    subject: () => `buyers asking about transport`,
    observation: (l) =>
      l.personalization_angle?.trim() ||
      `Found ${l.company}${l.location ? ` based in ${l.location}` : ""} while looking for transport partners I would actually route deals to.`,
    hook:
      "I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. Buyers and sellers on the platform constantly need transport, and right now I have nobody honest to route them to. I would rather have a small bench of good partners than a directory.",
    offer:
      "Free partner profile during beta, free routed leads, no fee until real volume.",
    cta: "Would you be open to a quick 10-minute call to walk through how this would look?",
  },
  lender: {
    label: "lender",
    subject: () => `marketplace buyers needing financing`,
    observation: (l) =>
      l.personalization_angle?.trim() ||
      `Came across ${l.company}${l.location ? ` (${l.location})` : ""} while looking for finance partners on the boats and aircraft side.`,
    hook:
      "I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. Buyers on the platform routinely ask 'who finances this' and right now I just hand them a Google result. I would rather route them to a partner I trust.",
    offer: "Free partner profile during beta, no fee until real deal flow.",
    cta: "Open to a quick 10-minute call to see if a partner setup makes sense?",
  },
  insurance: {
    label: "marine / aviation / specialty insurer",
    subject: () => `marketplace buyers asking about coverage`,
    observation: (l) =>
      l.personalization_angle?.trim() ||
      `Came across ${l.company}${l.location ? ` (${l.location})` : ""} while looking for an insurance partner I would actually route buyers to.`,
    hook:
      "I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. Every closed deal triggers a 'who do I use for coverage' question, and right now I do not have a real answer. I want a small set of partners I trust.",
    offer:
      "Free partner profile during beta, free routed leads, no fee until real volume.",
    cta: "Open to a quick 10-minute call to see if this makes sense for you?",
  },
  escrow_title: {
    label: "escrow / title partner",
    subject: () => `marketplace deals needing escrow and title`,
    observation: (l) =>
      l.personalization_angle?.trim() ||
      `Found ${l.company}${l.location ? ` (${l.location})` : ""} while looking for an escrow and title partner who actually handles boats and aircraft.`,
    hook:
      "I am Don, building TradeWind, a marketplace for boats, autos, and aircraft. Buyers close on big-ticket assets and immediately need escrow and clean title handling. I do not want to wing that part. I want a partner on the platform.",
    offer: "Free partner profile during beta, no fee until real deal flow.",
    cta: "Open to a quick 10-minute call to see if this makes sense?",
  },
  ap_mechanic: {
    label: "A&P mechanic / aircraft maintenance shop",
    subject: () => `aircraft owners looking for shops`,
    observation: (l) =>
      l.personalization_angle?.trim() ||
      `Found ${l.company}${l.location ? ` (${l.location})` : ""} while looking for shops I would actually route owners to.`,
    hook:
      "I am Don, building TradeWind, a marketplace for aircraft buyers and owners. Buyers close on a plane and immediately ask 'who can I trust to inspect or maintain this.' I want shops like yours on the network so I can route those requests instead of telling people to Google.",
    offer:
      "Free profile during beta, free routed leads, no fee until you see real volume.",
    cta: "Worth a quick call to walk through how this would look?",
  },
};

const VERTICAL_ALIASES: Record<string, Vertical> = {
  boat_dealer: "boat_dealer", "boat dealer": "boat_dealer", boat: "boat_dealer",
  boats: "boat_dealer", marine_dealer: "boat_dealer", "marine dealer": "boat_dealer",
  yacht_broker: "yacht_broker", "yacht broker": "yacht_broker", yacht: "yacht_broker", broker: "yacht_broker",
  auto_dealer: "auto_dealer", "auto dealer": "auto_dealer", auto: "auto_dealer",
  car_dealer: "auto_dealer", "car dealer": "auto_dealer", used_car_dealer: "auto_dealer",
  exotic_dealer: "exotic_dealer", "exotic dealer": "exotic_dealer", exotic: "exotic_dealer",
  "exotic car dealer": "exotic_dealer", supercar_dealer: "exotic_dealer",
  classic_dealer: "classic_dealer", "classic dealer": "classic_dealer", classic: "classic_dealer",
  "classic car dealer": "classic_dealer", vintage_dealer: "classic_dealer",
  aircraft_broker: "aircraft_broker", "aircraft broker": "aircraft_broker",
  aircraft: "aircraft_broker", plane_broker: "aircraft_broker", jet_broker: "aircraft_broker",
  marine_surveyor: "marine_surveyor", "marine surveyor": "marine_surveyor",
  surveyor: "marine_surveyor", boat_surveyor: "marine_surveyor",
  transport: "transport", transporter: "transport", logistics: "transport",
  hauler: "transport", shipper: "transport",
  lender: "lender", lending: "lender", finance: "lender", financing: "lender", bank: "lender",
  insurance: "insurance", insurer: "insurance",
  marine_insurance: "insurance", aviation_insurance: "insurance",
  escrow_title: "escrow_title", "escrow / title": "escrow_title", "escrow & title": "escrow_title",
  escrow: "escrow_title", title: "escrow_title", title_company: "escrow_title",
  ap_mechanic: "ap_mechanic", "a&p mechanic": "ap_mechanic", "a&p": "ap_mechanic",
  mechanic: "ap_mechanic", maintenance: "ap_mechanic",
  aircraft_maintenance: "ap_mechanic", ia: "ap_mechanic",
};

export function resolveVertical(raw: string | null | undefined): { vertical: Vertical; matched: boolean } {
  if (!raw) return { vertical: "boat_dealer", matched: false };
  const key = raw.trim().toLowerCase().replace(/\s+/g, " ");
  const direct = VERTICAL_ALIASES[key];
  if (direct) return { vertical: direct, matched: true };
  const underscored = VERTICAL_ALIASES[key.replace(/\s+/g, "_")];
  if (underscored) return { vertical: underscored, matched: true };
  return { vertical: "boat_dealer", matched: false };
}

function firstName(c: string | null | undefined): string {
  if (!c) return "team";
  const t = c.trim();
  if (!t) return "team";
  const f = t.split(/\s+/)[0];
  return f.length > 1 ? f : "team";
}

function scrubBanned(text: string): string {
  let out = text;
  for (const p of BANNED) {
    out = out.replace(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "");
  }
  return out.replace(/[ ]{2,}/g, " ").replace(/\n[ \t]+/g, "\n");
}

export function generateFallbackMessage(lead: FallbackLead, channel: Channel = "email"): FallbackOutput {
  const { vertical, matched } = resolveVertical(lead.vertical);
  const t = TEMPLATES[vertical];
  const cta = t.cta ?? DEFAULT_CTA;
  let subject = "";
  let body: string;

  if (channel === "email") {
    subject = t.subject(lead.company);
    body = [
      `Hey ${firstName(lead.contact_name)} —`,
      "",
      t.observation(lead),
      "",
      t.hook,
      "",
      t.offer,
      "",
      cta,
      "",
      OPT_OUT_LINE,
      "",
      SIGN_OFF,
    ].join("\n");
  } else if (channel === "linkedin") {
    body = [
      `Hey ${firstName(lead.contact_name)} —`,
      "",
      t.observation(lead),
      "",
      t.hook,
      "",
      t.offer,
      "",
      cta,
      "",
      OPT_OUT_LINE,
      "",
      "— Don",
    ].join("\n");
  } else {
    const obs = t.observation(lead).split(/\.\s+/)[0];
    body = [
      `Hey ${firstName(lead.contact_name)} — ${obs}.`,
      `I am Don, building TradeWind (marketplace for boats, autos, and aircraft). We are in private beta and bringing on a few ${t.label}s with real inventory. Free profile during beta.`,
      `Open to a 10-minute look?`,
      OPT_OUT_LINE,
      `— Don`,
    ].join("\n\n");
  }

  body = scrubBanned(body);

  const personalization_note = matched
    ? `Used the ${t.label} template${
        lead.personalization_angle?.trim()
          ? ", interpolated with the personalization angle from the lead row"
          : ", with a generic observation (no personalization_angle on the lead)"
      }.`
    : `Vertical "${lead.vertical}" was not recognised — used the boat dealer template as a safe default. Edit before sending.`;

  return { subject, body, cta, personalization_note, generation_source: "fallback_template" };
}
