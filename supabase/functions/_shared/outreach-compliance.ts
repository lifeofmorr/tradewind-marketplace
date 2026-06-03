// CAN-SPAM compliance helpers for cold outreach.
//
// CAN-SPAM (15 U.S.C. §7704) requires every commercial email to include:
//   1. a clear opt-out mechanism, and
//   2. a valid physical postal address of the sender.
//
// The generated outreach copy already carries an opt-out line (enforced in the
// generate-outreach-message system prompt + outreach-fallback). This module
// adds the missing piece — the physical postal address — and provides the gate
// that blocks scaled outreach when no address is configured.
//
// Address source: the BUSINESS_MAILING_ADDRESS function secret. Until it is set,
// build-daily-queue refuses to draft, so we can never scale non-compliant email.

export function getBusinessMailingAddress(): string | null {
  const raw = Deno.env.get("BUSINESS_MAILING_ADDRESS")?.trim();
  return raw && raw.length > 0 ? raw : null;
}

/** True when a physical mailing address is configured (CAN-SPAM prerequisite). */
export function canSpamReady(): boolean {
  return getBusinessMailingAddress() !== null;
}

/** Opt-out line appended to email outreach when the model didn't include one. */
const OPT_OUT_LINE =
  "If you'd rather not hear from me, just reply and I won't follow up.";

function hasOptOut(body: string): boolean {
  const l = body.toLowerCase();
  return (
    l.includes("won't follow up") ||
    l.includes("wont follow up") ||
    l.includes("unsubscribe") ||
    l.includes("opt out") ||
    l.includes("opt-out") ||
    l.includes("no worries")
  );
}

/**
 * Append the CAN-SPAM footer (opt-out if missing + physical address) to an
 * EMAIL outreach body. Returns the body unchanged for non-email channels
 * (LinkedIn/Instagram DMs are not subject to CAN-SPAM and a postal address
 * reads as spammy there). No-op if no address is configured — but callers
 * should gate on canSpamReady() before scaling.
 */
export function appendCanSpamFooter(body: string, channel: string): string {
  if (channel !== "email") return body;
  const address = getBusinessMailingAddress();
  const parts = [body.trimEnd()];
  if (!hasOptOut(body)) parts.push("", OPT_OUT_LINE);
  if (address) parts.push("", `—`, `Tradewind · ${address}`);
  return parts.join("\n");
}
