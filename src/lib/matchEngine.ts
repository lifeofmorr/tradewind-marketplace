/**
 * Marketplace match engine — pure scoring functions for buyer / listing /
 * dealer / partner pairings. No DB dependency: callers pass in arrays so
 * the same logic runs in the browser, in tests, or in an edge function.
 */
import type {
  Listing,
  ListingCategory,
  ServiceProvider,
  ServiceCategory,
  Inquiry,
} from "@/types/database";

// ─── Public types ───────────────────────────────────────────────────────────

export interface MatchResult<T> {
  item: T;
  score: number; // 0–100
  reasons: string[];
}

export interface BuyerPreferences {
  categories?: ListingCategory[];
  state?: string | null;
  city?: string | null;
  priceMinCents?: number | null;
  priceMaxCents?: number | null;
  yearMin?: number | null;
  preferredMakes?: string[];
}

export interface DealerProfileLite {
  primary_category: ListingCategory | null;
  state: string | null;
  city: string | null;
}

// Categories that boats and autos can sensibly cross-match within.
const BOAT_SET = new Set<ListingCategory>([
  "boat",
  "performance_boat",
  "yacht",
  "center_console",
]);
const AUTO_SET = new Set<ListingCategory>([
  "car",
  "truck",
  "exotic",
  "classic",
  "powersports",
  "rv",
]);

function sameGroup(a: ListingCategory, b: ListingCategory): boolean {
  return (BOAT_SET.has(a) && BOAT_SET.has(b)) || (AUTO_SET.has(a) && AUTO_SET.has(b));
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

// ─── Buyer → Listings ───────────────────────────────────────────────────────

export function matchBuyerToListings(
  prefs: BuyerPreferences,
  listings: Listing[],
  limit = 12,
): MatchResult<Listing>[] {
  return listings
    .filter((l) => l.status === "active")
    .map((listing) => {
      const reasons: string[] = [];
      let score = 30; // baseline so a buyer with no prefs still sees options

      // Category match — exact, then within group.
      if (prefs.categories?.length) {
        if (prefs.categories.includes(listing.category)) {
          score += 30;
          reasons.push("Matches your category");
        } else if (prefs.categories.some((c) => sameGroup(c, listing.category))) {
          score += 12;
          reasons.push("Adjacent category");
        }
      }

      // Location match.
      if (prefs.state && listing.state && prefs.state.toLowerCase() === listing.state.toLowerCase()) {
        score += 14;
        reasons.push(`Same state (${listing.state})`);
        if (prefs.city && listing.city && prefs.city.toLowerCase() === listing.city.toLowerCase()) {
          score += 6;
          reasons.push(`In ${listing.city}`);
        }
      }

      // Price band.
      if (listing.price_cents != null) {
        const min = prefs.priceMinCents ?? 0;
        const max = prefs.priceMaxCents ?? Number.POSITIVE_INFINITY;
        if (listing.price_cents >= min && listing.price_cents <= max) {
          score += 12;
          reasons.push("Within your budget");
        } else if (Math.abs(listing.price_cents - max) / Math.max(max, 1) < 0.1) {
          score += 4;
          reasons.push("Just outside budget");
        }
      }

      // Year preference.
      if (prefs.yearMin && listing.year && listing.year >= prefs.yearMin) {
        score += 6;
        reasons.push(`${listing.year} fits year preference`);
      }

      // Make preference.
      if (prefs.preferredMakes?.length && listing.make) {
        const hit = prefs.preferredMakes.some(
          (m) => m.toLowerCase() === (listing.make ?? "").toLowerCase(),
        );
        if (hit) {
          score += 8;
          reasons.push(`Preferred make: ${listing.make}`);
        }
      }

      // Quality boosts.
      if (listing.is_verified) {
        score += 4;
        reasons.push("Verified listing");
      }
      if ((listing.quality_score ?? 0) >= 80) {
        score += 4;
        reasons.push("High-quality listing");
      }

      return { item: listing, score: clamp(score), reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ─── Listing → Service Partners ─────────────────────────────────────────────

const CATEGORY_TO_SERVICE: Record<ListingCategory, ServiceCategory[]> = {
  boat: ["marine_mechanic", "inspector_surveyor", "transport", "marina", "insurance_agent", "lender"],
  performance_boat: ["marine_mechanic", "inspector_surveyor", "transport", "performance_shop"],
  yacht: ["marine_mechanic", "inspector_surveyor", "transport", "marina", "dock_service"],
  center_console: ["marine_mechanic", "inspector_surveyor", "transport", "marina"],
  car: ["auto_mechanic", "inspector_surveyor", "detailer", "transport", "insurance_agent", "lender"],
  truck: ["auto_mechanic", "inspector_surveyor", "transport", "wrap_shop"],
  exotic: ["auto_mechanic", "inspector_surveyor", "transport", "detailer", "wrap_shop"],
  classic: ["auto_mechanic", "inspector_surveyor", "transport", "detailer"],
  powersports: ["auto_mechanic", "inspector_surveyor", "transport", "performance_shop"],
  rv: ["auto_mechanic", "inspector_surveyor", "transport", "storage"],
  aircraft_single_engine: ["inspector_surveyor", "transport", "insurance_agent", "lender", "storage"],
  aircraft_twin_engine: ["inspector_surveyor", "transport", "insurance_agent", "lender", "storage"],
  aircraft_turboprop: ["inspector_surveyor", "transport", "insurance_agent", "lender", "storage"],
  aircraft_jet: ["inspector_surveyor", "transport", "insurance_agent", "lender", "storage"],
  aircraft_helicopter: ["inspector_surveyor", "transport", "insurance_agent", "lender", "storage"],
  aircraft_vintage: ["inspector_surveyor", "transport", "insurance_agent", "storage"],
};

export function matchListingToPartners(
  listing: Pick<Listing, "category" | "state" | "city">,
  partners: ServiceProvider[],
  limit = 6,
): MatchResult<ServiceProvider>[] {
  const wanted = new Set<ServiceCategory>(CATEGORY_TO_SERVICE[listing.category] ?? []);

  return partners
    .filter((p) => wanted.has(p.category))
    .map((p) => {
      const reasons: string[] = [`Relevant service: ${p.category.replace(/_/g, " ")}`];
      let score = 55;

      if (listing.state && p.state && listing.state.toLowerCase() === p.state.toLowerCase()) {
        score += 18;
        reasons.push(`Local — ${p.state}`);
        if (listing.city && p.city && listing.city.toLowerCase() === p.city.toLowerCase()) {
          score += 8;
          reasons.push(`Same city as listing`);
        }
      }

      if (p.is_verified) {
        score += 8;
        reasons.push("Verified partner");
      }
      if (p.is_featured) {
        score += 4;
        reasons.push("Featured partner");
      }
      if (p.rating_count > 0) {
        score += Math.min(8, Math.round(p.rating_avg * 2));
        if (p.rating_avg >= 4.5) reasons.push(`${p.rating_avg.toFixed(1)}★ across ${p.rating_count} reviews`);
      }

      return { item: p, score: clamp(score), reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ─── Dealer → Inbound Leads ─────────────────────────────────────────────────

export interface LeadInput extends Pick<Inquiry, "id" | "lead_quality_score" | "status" | "created_at"> {
  listing_category?: ListingCategory | null;
  listing_state?: string | null;
}

export function matchDealerToLeads(
  dealer: DealerProfileLite,
  leads: LeadInput[],
  limit = 10,
): MatchResult<LeadInput>[] {
  return leads
    .filter((l) => l.status !== "spam" && l.status !== "closed_lost")
    .map((lead) => {
      const reasons: string[] = [];
      let score = 25;

      if (lead.lead_quality_score != null) {
        // Map 0–100 quality directly into the bulk of the score.
        score += Math.round(lead.lead_quality_score * 0.4);
        reasons.push(`Quality score ${lead.lead_quality_score}`);
      }

      if (dealer.primary_category && lead.listing_category === dealer.primary_category) {
        score += 12;
        reasons.push("Matches your primary category");
      }

      if (dealer.state && lead.listing_state && dealer.state.toLowerCase() === lead.listing_state.toLowerCase()) {
        score += 8;
        reasons.push("Local lead");
      }

      // Fresh leads bubble up.
      const ageMs = Date.now() - new Date(lead.created_at).getTime();
      const ageHrs = ageMs / 36e5;
      if (ageHrs < 2) {
        score += 12;
        reasons.push("Fresh — under 2 hours");
      } else if (ageHrs < 24) {
        score += 6;
        reasons.push("Today");
      } else if (ageHrs > 72) {
        score -= 8;
        reasons.push("Aging — respond fast");
      }

      if (lead.status === "new") {
        score += 5;
        reasons.push("Awaiting first reply");
      }

      return { item: lead, score: clamp(score), reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
