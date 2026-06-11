// Outreach campaign constants — extracted verbatim from AdminOutreach.tsx.

export const VERTICALS = [
  "all",
  "Boat Dealer",
  "Yacht Broker",
  "Auto Dealer",
  "Exotic/Classic Auto",
  "Aircraft Broker",
  "Aviation Service",
  "Marine Surveyor",
  "Marine Mechanic",
  "Transport",
  "Marine Lender",
  "Aviation Lender",
  "Insurance",
  "Escrow/Title",
  "Buyer Advisor",
] as const;

export const STATUSES = [
  "all", "new", "send_ready", "needs_review", "non_email_channel",
  "drafted", "approved", "sent", "replied", "interested", "wants_demo",
  "demo_booked", "beta_invited", "do_not_contact",
] as const;

// Status buckets introduced by supabase/outreach-lead-cleanup.sql (2026-05-27),
// referenced below as string literals:
// send_ready        — likely_valid email, safe to draft
// needs_review      — email pattern-inferred / post-audit downgrade
// non_email_channel — no public email; LinkedIn / form / phone only

export const PRIORITIES = ["all", "1", "2", "3", "4", "5"] as const;

// Beta pipeline stages used by /admin/outreach. Must match the CHECK
// constraint in supabase/migrations/20260527_beta_pipeline_expanded_stages.sql.
// Ordered to reflect the typical reply → demo → onboarded → paid flow,
// with terminal stages (follow_up_later, not_interested, declined) last.
export const BETA_STAGES = [
  "interested",
  "wants_demo",
  "demo_booked",
  "demo_completed",
  "beta_invited",
  "beta_onboarded",
  "real_listing_candidate",
  "partner_candidate",
  "paid_candidate",
  "follow_up_later",
  "not_interested",
  "declined",
] as const;

export const BETA_OFFER = [
  "60-day free beta access",
  "Free public business profile",
  "First 10 listings free",
  "Founder support (text/email Don directly)",
  "Influence the roadmap",
  "Locked-in early-adopter rate after beta",
];

// ── Tradewind 100 campaign ───────────────────────────────────────────────────
//
// The Tradewind 100 campaign — 100 verified leads across 9 verticals, sent
// over ~30 days. Daily caps are enforced in the UI so we never overshoot the
// schedule documented in go-to-market/outreach-autopilot/30_DAY_SEND_SCHEDULE.md.
//
// Week ramps: Wk1=7/day, Wk2=8/day, Wk3=13/day, Wk4=15/day. The cap below is
// the current "today" cap that the dashboard enforces — bump it as the weeks
// progress (or wire to date math later).

export const CAMPAIGN_NAME = "Tradewind 100";
export const CAMPAIGN_TARGET = 100;
export const CAMPAIGN_DAILY_CAP = 7; // Week 1 cap; bump as the schedule progresses.

export const POSITIVE_REPLY_TYPES = new Set([
  "interested",
  "demo_request",
  "positive",
  "ready_to_buy",
]);

export const VERIFICATION_FILTERS = [
  "all",
  "verified",
  "likely_valid",
  "unverified",
  "bounced",
  "invalid",
  "do_not_email",
] as const;
