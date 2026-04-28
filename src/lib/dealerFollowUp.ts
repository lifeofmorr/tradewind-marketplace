import type { Inquiry } from "@/types/database";

export type FollowUpType = "first_reply" | "follow_up" | "still_interested";

interface Context {
  listing_title?: string | null;
  dealer_name?: string | null;
  agent_name?: string | null;
}

function firstName(name?: string | null): string {
  if (!name) return "there";
  return name.split(/\s+/)[0];
}

export function generateFollowUp(
  inquiry: Inquiry,
  type: FollowUpType,
  ctx: Context = {},
): string {
  const buyer = firstName(inquiry.buyer_name);
  const listing = ctx.listing_title ? ` ${ctx.listing_title}` : " your inquiry";
  const sigName = ctx.agent_name ?? "TradeWind dealer team";
  const sigDealer = ctx.dealer_name ? `\n${ctx.dealer_name}` : "";

  if (type === "first_reply") {
    return [
      `Hi ${buyer},`,
      "",
      `Thanks for reaching out about${listing}. It's still available, and I'd love to help you decide if it's the right fit.`,
      "",
      "A few quick questions to point you to the right unit:",
      "  • Are you cross-shopping a specific make/model, or open to suggestions?",
      "  • Looking to finance, or paying cash?",
      "  • Are you local, or will you need transport?",
      "",
      "Happy to send extra photos, walk-around video, or set up a phone/Facetime tour today.",
      "",
      "Best,",
      sigName + sigDealer,
    ].join("\n");
  }

  if (type === "follow_up") {
    return [
      `Hi ${buyer},`,
      "",
      `Following up on${listing}. Wanted to make sure my last note didn't get buried.`,
      "",
      "Quick update: still available, and I can lock in a viewing or hold for a refundable deposit if you're close to a decision.",
      "",
      "If timing has shifted, just reply with a one-liner — happy to circle back later or point you to something better suited.",
      "",
      "Talk soon,",
      sigName + sigDealer,
    ].join("\n");
  }

  // still_interested
  return [
    `Hi ${buyer},`,
    "",
    `Quick check on${listing} — are you still in the market? It's been a few weeks since we last spoke.`,
    "",
    "If you've already bought something else, no worries at all. If you're still looking, I have a couple of similar units that might fit better. Just say the word.",
    "",
    "Either way, I'd love a one-liner so I can update my notes.",
    "",
    "Thanks,",
    sigName + sigDealer,
  ].join("\n");
}
