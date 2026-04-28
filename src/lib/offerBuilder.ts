import { formatCents } from "./utils";

export interface OfferDraft {
  listing_title: string;
  listing_price_cents?: number | null;
  offer_price_cents: number;
  financing_status: "cash" | "preapproved" | "needs_financing" | "tbd";
  inspection_contingency: boolean;
  transport_needed: boolean;
  timeline: string;
  note?: string;
  buyer_name?: string;
}

const FINANCING_LABEL: Record<OfferDraft["financing_status"], string> = {
  cash: "Cash offer — funds available now",
  preapproved: "Pre-approved with my lender",
  needs_financing: "Need financing — can use TradeWind partners",
  tbd: "Financing TBD",
};

export function generateOfferMessage(data: OfferDraft): string {
  const lines: string[] = [];
  const greeting = data.buyer_name ? `Hi — ${data.buyer_name} here.` : "Hi —";
  lines.push(greeting);
  lines.push("");
  lines.push(`I'd like to put in a non-binding offer on: ${data.listing_title}.`);
  lines.push("");

  lines.push(`• Offer price: ${formatCents(data.offer_price_cents)}`);
  if (data.listing_price_cents && data.listing_price_cents > 0) {
    const delta = data.offer_price_cents - data.listing_price_cents;
    const pct = (delta / data.listing_price_cents) * 100;
    const direction = delta < 0 ? "below" : delta > 0 ? "above" : "at";
    lines.push(`  (${Math.abs(pct).toFixed(1)}% ${direction} asking of ${formatCents(data.listing_price_cents)})`);
  }
  lines.push(`• Financing: ${FINANCING_LABEL[data.financing_status]}`);
  lines.push(`• Inspection contingency: ${data.inspection_contingency ? "yes — subject to surveyor / PPI" : "no — buying as-is after my own due diligence"}`);
  lines.push(`• Transport: ${data.transport_needed ? "I'll need TradeWind transport coordination" : "I can pick up / arrange my own"}`);
  if (data.timeline?.trim()) lines.push(`• Timeline: ${data.timeline.trim()}`);
  if (data.note?.trim()) {
    lines.push("");
    lines.push(data.note.trim());
  }

  lines.push("");
  lines.push("This is a non-binding offer to start the conversation — happy to formalize through a TradeWind concierge or your preferred F&I office.");
  lines.push("");
  lines.push("Thanks!");
  return lines.join("\n");
}
