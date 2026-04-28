import type { Listing, Dealer, ServiceProvider } from "@/types/database";

export type BadgeType =
  | "verified_dealer"
  | "verified_provider"
  | "verified_listing"
  | "featured"
  | "premium"
  | "demo"
  | "financing_ready"
  | "insurance_ready"
  | "inspection_ready"
  | "transport_ready"
  | "concierge_eligible";

export interface BadgeMeta {
  type: BadgeType;
  label: string;
  tooltip: string;
  tone: "brass" | "emerald" | "blue" | "violet" | "slate" | "amber";
  icon:
    | "shield"
    | "star"
    | "flask"
    | "dollar"
    | "umbrella"
    | "search"
    | "truck"
    | "sparkles";
}

export const BADGE_META: Record<BadgeType, BadgeMeta> = {
  verified_dealer: {
    type: "verified_dealer",
    label: "Verified Dealer",
    tooltip: "Identity-verified dealer with active listings on TradeWind.",
    tone: "emerald",
    icon: "shield",
  },
  verified_provider: {
    type: "verified_provider",
    label: "Verified Provider",
    tooltip: "Vetted service provider with confirmed credentials.",
    tone: "emerald",
    icon: "shield",
  },
  verified_listing: {
    type: "verified_listing",
    label: "Verified",
    tooltip: "Title, HIN/VIN, and seller identity have been confirmed.",
    tone: "emerald",
    icon: "shield",
  },
  featured: {
    type: "featured",
    label: "Featured",
    tooltip: "Hand-picked by TradeWind editors for visibility this week.",
    tone: "brass",
    icon: "star",
  },
  premium: {
    type: "premium",
    label: "Premium",
    tooltip: "Premium-tier listing with priority concierge support.",
    tone: "violet",
    icon: "sparkles",
  },
  demo: {
    type: "demo",
    label: "Demo",
    tooltip: "Sample listing — not for sale. Used for product demos.",
    tone: "slate",
    icon: "flask",
  },
  financing_ready: {
    type: "financing_ready",
    label: "Financing Ready",
    tooltip: "Pre-matched with a marine/auto lender for fast approval.",
    tone: "brass",
    icon: "dollar",
  },
  insurance_ready: {
    type: "insurance_ready",
    label: "Insurance Ready",
    tooltip: "Insurance partner can quote this asset same-day.",
    tone: "blue",
    icon: "umbrella",
  },
  inspection_ready: {
    type: "inspection_ready",
    label: "Inspection Ready",
    tooltip: "Surveyors are available in the listing's region.",
    tone: "amber",
    icon: "search",
  },
  transport_ready: {
    type: "transport_ready",
    label: "Transport Ready",
    tooltip: "Pre-matched with a transport partner for delivery.",
    tone: "blue",
    icon: "truck",
  },
  concierge_eligible: {
    type: "concierge_eligible",
    label: "Concierge Eligible",
    tooltip: "Eligible for the TradeWind concierge end-to-end service.",
    tone: "violet",
    icon: "sparkles",
  },
};

export function getListingBadges(listing: Listing): BadgeType[] {
  const out: BadgeType[] = [];
  if (listing.is_demo) out.push("demo");
  if (listing.is_featured) out.push("featured");
  if (listing.is_premium) out.push("premium");
  if (listing.is_verified) out.push("verified_listing");
  if (listing.is_finance_partner) out.push("financing_ready");
  if (listing.is_insurance_partner) out.push("insurance_ready");
  if (listing.is_transport_partner) out.push("transport_ready");
  // Concierge eligibility heuristic: premium price, verified, has location
  if (
    listing.price_cents != null &&
    listing.price_cents >= 7_500_000 && // $75k+
    listing.is_verified
  ) {
    out.push("concierge_eligible");
  }
  return out;
}

export function getDealerBadges(dealer: Dealer): BadgeType[] {
  const out: BadgeType[] = [];
  if (dealer.is_verified) out.push("verified_dealer");
  if (dealer.is_featured) out.push("featured");
  return out;
}

export function getProviderBadges(provider: ServiceProvider): BadgeType[] {
  const out: BadgeType[] = [];
  if (provider.is_verified) out.push("verified_provider");
  if (provider.is_featured) out.push("featured");
  return out;
}
