// Follow-up message templates — canonical strings live in
// go-to-market/outreach-autopilot/OUTREACH_FOLLOWUP_TEMPLATES.md.
//
// Pure functions. No IO. Used by the admin dashboard preview and (via a
// Deno mirror) by the build-daily-queue follow-up writer. If you change a
// template string, update the .md file as well.

import { resolveVertical, type Vertical } from "./fallbackMessageGenerator";

const VERTICAL_LABELS: Record<Vertical, string> = {
  boat_dealer: "boat dealer",
  yacht_broker: "yacht broker",
  auto_dealer: "auto dealer",
  exotic_dealer: "exotic car dealer",
  classic_dealer: "classic car dealer",
  aircraft_broker: "aircraft broker",
  marine_surveyor: "marine surveyor",
  transport: "transport partner",
  lender: "lender",
  insurance: "insurance partner",
  escrow_title: "escrow / title partner",
  ap_mechanic: "A&P / maintenance shop",
};

export interface FollowupContext {
  contact_name?: string | null;
  vertical: string;
  original_subject?: string | null;
  /** Optional: a fresh, specific observation for FU2. Falls back to a value restatement. */
  second_observation?: string | null;
}

export interface FollowupOutput {
  subject: string;
  body: string;
  followup_number: 1 | 2;
}

export interface CloseLoopOutput {
  subject: string;
  body: string;
}

function firstName(contactName: string | null | undefined): string {
  if (!contactName) return "team";
  const trimmed = contactName.trim();
  if (!trimmed) return "team";
  const first = trimmed.split(/\s+/)[0];
  return first.length > 1 ? first : "team";
}

function verticalLabel(raw: string): string {
  const { vertical } = resolveVertical(raw);
  return VERTICAL_LABELS[vertical];
}

export function buildFollowup1(ctx: FollowupContext): FollowupOutput {
  const first = firstName(ctx.contact_name);
  const label = verticalLabel(ctx.vertical);
  const subject = ctx.original_subject?.trim()
    ? `re: ${ctx.original_subject.trim()}`
    : "re: Tradewind";
  const body = [
    `Hey ${first} —`,
    "",
    `Quick bump in case my note from earlier this week got buried.`,
    "",
    `Still hand-picking the first set of ${label}s into the Tradewind beta — free profile, free first listings, no fee until you see lead flow.`,
    "",
    `If a 5-minute look on your own time is useful, I will send the link. If not, no worries at all — just tell me and I will not follow up.`,
    "",
    `— Don`,
    `Tradewind`,
  ].join("\n");
  return { subject, body, followup_number: 1 };
}

export function buildFollowup2(ctx: FollowupContext): FollowupOutput {
  const first = firstName(ctx.contact_name);
  const observation =
    ctx.second_observation?.trim() ||
    "The short version: free profile during beta, AI-built listing copy, and inbound buyer requests routed to your actual inventory.";
  const body = [
    `Hey ${first} —`,
    "",
    `Last note from me on this. ${observation}`,
    "",
    `If you are slammed, totally get it. If timing is bad but you want me to circle back in a quarter or two, just say "later" and I will save you for then. Otherwise I will close the loop here.`,
    "",
    `If this is not relevant, no worries — just tell me and I will not follow up.`,
    "",
    `— Don`,
    `Tradewind`,
  ].join("\n");
  return { subject: "one more on Tradewind", body, followup_number: 2 };
}

export function buildCloseLoop(ctx: FollowupContext): CloseLoopOutput {
  const first = firstName(ctx.contact_name);
  const body = [
    `Hey ${first} —`,
    "",
    `Not going to keep emailing. If it is a no — all good. If timing is bad but you want me to circle back in a quarter or two, just say "later" and I will save you for then.`,
    "",
    `— Don`,
    `Tradewind`,
  ].join("\n");
  return { subject: "closing the loop", body };
}

// Stop rules — pure predicate the scheduler / queue can use. Returns the
// reason a follow-up should NOT be sent, or null if it is safe to send.
export type LeadLikeForStopCheck = {
  do_not_contact?: boolean | null;
  status?: string | null;
};

export function followupBlockedReason(lead: LeadLikeForStopCheck): string | null {
  if (lead.do_not_contact) return "lead.do_not_contact=true";
  const s = (lead.status ?? "").toLowerCase();
  if (s === "replied") return "lead has replied — manual handling only";
  if (s === "bounced") return "lead bounced — do not re-send";
  if (s === "demo_booked") return "demo already booked";
  if (s === "beta_invited") return "lead is in beta_invited";
  if (s === "loop_closed") return "loop already closed";
  return null;
}
