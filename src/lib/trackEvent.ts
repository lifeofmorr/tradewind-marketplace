/**
 * Lightweight conversion event tracker.
 *
 * Fires fire-and-forget inserts into `public.site_events`. RLS allows
 * anonymous insert; only admins can read the data back. Use sparingly
 * for top-of-funnel conversion signals (beta CTA clicks, feedback
 * submits, key page views).
 */
import { supabase } from "./supabase";

const SESSION_KEY = "tw_sid";

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
  | "book_call_click"
  | "listing_detail_view"
  | (string & {});

export function trackEvent(
  eventType: EventType,
  metadata: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  void supabase
    .from("site_events")
    .insert({
      event_type: eventType,
      metadata,
      session_id: sessionId() ?? null,
    })
    .then(() => {
      /* fire-and-forget */
    });
}
