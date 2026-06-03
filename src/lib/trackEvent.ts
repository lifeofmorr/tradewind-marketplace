/**
 * Lightweight conversion event tracker.
 *
 * Fires fire-and-forget inserts into `public.site_events`. RLS allows
 * anonymous insert; only admins can read the data back. Use sparingly
 * for top-of-funnel conversion signals (beta CTA clicks, feedback
 * submits, key page views).
 *
 * Also exposes a small set of helpers for capturing UTM/lead_id
 * attribution from outreach links and persisting it across the visit
 * (BetaPage → FeedbackPage) so submissions can be tied back to the
 * outreach campaign that drove them.
 */
import { supabase } from "./supabase";

const SESSION_KEY = "tw_sid";
const ATTR_KEY = "tw_attribution";

function sessionId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

export type EventType =
  | "beta_page_view"
  | "request_beta_click"
  | "feedback_submit"
  | "feedback_submitted"
  | "book_call_click"
  | "listing_detail_view"
  | "contact_form_submit"
  | "support_page_view"
  | "dealer_cta_click"
  | "service_cta_click"
  | "aircraft_cta_click"
  | "pricing_page_view"
  | "payment_attempt"
  | "payment_complete"
  | (string & {});

export interface Attribution {
  lead_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
}

const UTM_KEYS: Array<keyof Attribution> = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

/**
 * Read attribution data from the current URL. Returns the parsed UTM
 * params and lead_id along with referrer + landing_page snapshots. If
 * the current URL has no UTM/lead_id params, the values are simply
 * undefined — referrer + landing_page still come back.
 */
export function parseAttributionFromUrl(): Attribution {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const out: Attribution = {};
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) out[k] = v;
  }
  const leadId = params.get("lead_id");
  if (leadId && isUuid(leadId)) out.lead_id = leadId;
  out.referrer = document.referrer || undefined;
  out.landing_page = window.location.href;
  return out;
}

/**
 * Persist attribution to sessionStorage so a later page (e.g. /feedback)
 * can read it even if the visitor lost the UTM params by clicking
 * around. We merge — never overwrite a known value with undefined.
 */
export function saveAttribution(attr: Attribution): void {
  if (typeof window === "undefined") return;
  try {
    const prior = readAttribution();
    const merged: Attribution = { ...prior };
    for (const [k, v] of Object.entries(attr)) {
      if (v !== undefined && v !== null && v !== "") {
        (merged as Record<string, unknown>)[k] = v;
      }
    }
    window.sessionStorage.setItem(ATTR_KEY, JSON.stringify(merged));
  } catch {
    /* sessionStorage unavailable — non-fatal */
  }
}

export function readAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(ATTR_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Attribution;
  } catch {
    return {};
  }
}

/**
 * Convenience: parse the current URL, persist to sessionStorage, and
 * return the merged attribution. Call once on page mount for any page
 * that's a landing target of an outreach link (e.g. BetaPage).
 */
export function captureAttribution(): Attribution {
  const fromUrl = parseAttributionFromUrl();
  saveAttribution(fromUrl);
  return readAttribution();
}

export function trackEvent(
  eventType: EventType,
  metadata: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  // Merge sticky attribution under a stable key so admins can group
  // events by campaign/lead in the site_events table.
  const attribution = readAttribution();
  const enriched: Record<string, unknown> = { ...metadata };
  if (attribution.lead_id) enriched.lead_id = attribution.lead_id;
  if (attribution.utm_source) enriched.utm_source = attribution.utm_source;
  if (attribution.utm_medium) enriched.utm_medium = attribution.utm_medium;
  if (attribution.utm_campaign) enriched.utm_campaign = attribution.utm_campaign;
  if (attribution.utm_term) enriched.utm_term = attribution.utm_term;
  if (attribution.utm_content) enriched.utm_content = attribution.utm_content;

  void supabase
    .from("site_events")
    .insert({
      event_type: eventType,
      metadata: enriched,
      session_id: sessionId() ?? null,
    })
    .then(() => {
      /* fire-and-forget */
    });
}
