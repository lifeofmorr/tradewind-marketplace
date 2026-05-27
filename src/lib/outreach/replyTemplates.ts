// ─────────────────────────────────────────────────────────────────────────────
// Reply templates — canned responses for inbound beta feedback + outreach
// replies. Used by the AdminBetaInbox "Copy response email" action and by
// AdminOutreach when triaging incoming replies.
//
// Each template is short, signed by Don, and assumes the recipient has
// already engaged once — these are *responses*, not first-touch outreach.
//
// Canonical voice rules:
//   • No fake urgency, no flattery, no "synergy"-style copy.
//   • Always one specific next step ("tomorrow or Thursday?").
//   • One signature: "— Don".
//   • No subject lines that start with "Re:" — the email client will
//     prefix automatically when used as a reply.
// ─────────────────────────────────────────────────────────────────────────────

export type ReplyTemplateKey =
  | "interested"
  | "wants_info"
  | "wants_demo"
  | "asks_pricing"
  | "asks_if_live"
  | "asks_if_real"
  | "asks_aircraft"
  | "asks_service_leads"
  | "wants_to_list"
  | "wants_partnership"
  | "not_interested"
  | "follow_up_later"
  | "remove_me";

export interface ReplyTemplate {
  /** Short, human label for the template picker. */
  label: string;
  /** Email subject line (no auto "Re:" prefix). */
  subject: string;
  /** Plain-text body. \n separates paragraphs. */
  body: string;
}

const SIGNATURE = "— Don";

export const REPLY_TEMPLATES: Record<ReplyTemplateKey, ReplyTemplate> = {
  interested: {
    label: "Interested — book a quick demo",
    subject: "Quick 10-min walkthrough?",
    body:
      "Appreciate it. I can show you the useful parts in 10 minutes — listings, buyer requests, deal rooms, and the dealer/broker side.\n\n" +
      "What's better for you, tomorrow or Thursday?\n\n" +
      SIGNATURE,
  },

  wants_info: {
    label: "Wants more info before committing",
    subject: "Quick TradeWind primer",
    body:
      "Happy to send over more. Short version: TradeWind is a private marketplace for boats, autos, and aircraft, with deal rooms, buyer requests, and a service-partner side built in. Free for beta partners through public launch.\n\n" +
      "If a 10-minute call is easier than reading, I can show you the parts that matter to your operation. Tomorrow or Thursday work?\n\n" +
      SIGNATURE,
  },

  wants_demo: {
    label: "Wants a demo",
    subject: "Booking your TradeWind demo",
    body:
      "Glad to. The walkthrough is 10 minutes — I'll show your vertical's listing flow, the buyer-request side, and the deal room.\n\n" +
      "Tomorrow or Thursday? I can do mornings or after 3pm Pacific.\n\n" +
      SIGNATURE,
  },

  asks_pricing: {
    label: "Asks about pricing",
    subject: "TradeWind beta pricing",
    body:
      "Honest answer: beta partners pay nothing through public launch. After that, we'll lock in an early-adopter rate that's well below the public price for anyone who used the platform during beta.\n\n" +
      "The point of the beta is to find out what's actually worth paying for, not to test a price point. Want a 10-minute walkthrough? Tomorrow or Thursday?\n\n" +
      SIGNATURE,
  },

  asks_if_live: {
    label: "Asks if the platform is live",
    subject: "Yes — TradeWind is live",
    body:
      "It is. tradewind-marketplace.vercel.app — listings, buyer requests, deal rooms, service-partner side. Demo inventory is labeled clearly; real inventory comes from beta partners.\n\n" +
      "If you want a guided 10-minute look at the parts relevant to your side of the business, I can do tomorrow or Thursday.\n\n" +
      SIGNATURE,
  },

  asks_if_real: {
    label: "Asks if listings are real",
    subject: "Real vs demo inventory on TradeWind",
    body:
      "Fair question. Anything tagged \"demo\" is staged inventory we use to show the platform; everything else is real inventory from verified beta partners.\n\n" +
      "We label demo listings clearly because the alternative — inflating counts — is exactly the kind of thing TradeWind exists to push back on. Want a 10-minute walkthrough of how the verified-listing flow works? Tomorrow or Thursday?\n\n" +
      SIGNATURE,
  },

  asks_aircraft: {
    label: "Asks about aircraft side",
    subject: "Aircraft on TradeWind",
    body:
      "Yes — aircraft is a first-class vertical alongside boats and autos. Light piston through midsize jets, plus rotorcraft. Listing fields cover N-number, TT, SMOH, avionics suite, last annual, damage history.\n\n" +
      "If you want to see the aircraft listing + deal-room flow end-to-end, I can do a 10-minute walkthrough. Tomorrow or Thursday?\n\n" +
      SIGNATURE,
  },

  asks_service_leads: {
    label: "Service provider — asks about leads",
    subject: "How TradeWind sends service leads",
    body:
      "Service leads come from two places: (1) buyers requesting an inspection / survey / transport / detail tied to a specific listing, and (2) dealers attaching a service partner to a deal room.\n\n" +
      "Beta service partners get listed in the service directory, surfaced on relevant listings, and matched to active buyer requests in their region. Free through public launch.\n\n" +
      "Want a 10-minute walkthrough of the service side? Tomorrow or Thursday?\n\n" +
      SIGNATURE,
  },

  wants_to_list: {
    label: "Wants to list inventory now",
    subject: "Listing your inventory on TradeWind",
    body:
      "Great. Two options: (1) I can spin up your dealer account today and walk you through a first listing in 10 minutes, or (2) if you have a feed (CSV / Boatwizard / Dealertrack), we can import.\n\n" +
      "What works — call tomorrow or Thursday, or just send a sample feed?\n\n" +
      SIGNATURE,
  },

  wants_partnership: {
    label: "Wants partnership / integration",
    subject: "TradeWind partnership chat",
    body:
      "Worth a real conversation. Beta partnerships fall in one of three buckets: data/feed, service network, or lender/insurance/escrow. Each has a different shape.\n\n" +
      "If you can tell me which of those is closest, I'll send a 10-minute call link. Tomorrow or Thursday?\n\n" +
      SIGNATURE,
  },

  not_interested: {
    label: "Not interested — polite close",
    subject: "Understood",
    body:
      "Got it — no problem. Thanks for taking a look. If something changes later (new inventory line, new region), the door's open.\n\n" +
      SIGNATURE,
  },

  follow_up_later: {
    label: "Follow up later",
    subject: "Circling back later",
    body:
      "Understood — I'll circle back in a few weeks once you have more bandwidth. If anything changes in the meantime, my line's open.\n\n" +
      SIGNATURE,
  },

  remove_me: {
    label: "Opt-out / remove me",
    subject: "Removed",
    body:
      "Done — you won't hear from us again. Sorry for the noise.\n\n" +
      SIGNATURE,
  },
};

/** Ordered list of templates for the picker. */
export const REPLY_TEMPLATE_ORDER: ReplyTemplateKey[] = [
  "interested",
  "wants_info",
  "wants_demo",
  "asks_pricing",
  "asks_if_live",
  "asks_if_real",
  "asks_aircraft",
  "asks_service_leads",
  "wants_to_list",
  "wants_partnership",
  "follow_up_later",
  "not_interested",
  "remove_me",
];

export function getReplyTemplate(key: ReplyTemplateKey): ReplyTemplate {
  return REPLY_TEMPLATES[key];
}

/** Format a template as "Subject: ...\n\n<body>" for clipboard copy. */
export function formatReplyForClipboard(key: ReplyTemplateKey): string {
  const t = REPLY_TEMPLATES[key];
  return `Subject: ${t.subject}\n\n${t.body}`;
}
