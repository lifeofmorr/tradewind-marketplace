import type { Listing, ListingCategory } from "@/types/database";

/**
 * Heuristic deal-score model. Pure function — runs client-side.
 *
 * Output:
 *   score: 0–100 (higher = better value for buyer)
 *   label: short human-readable verdict
 *   color: tailwind tone token consumed by DealScoreBadge
 */

export type DealLabel =
  | "Great Deal"
  | "Fair Deal"
  | "High Price"
  | "Needs Review"
  | "Demo";

export interface DealScoreResult {
  score: number;
  label: DealLabel;
  color: "emerald" | "sky" | "amber" | "slate" | "violet";
  reasons: string[];
}

const CATEGORY_AVG_PRICE_CENTS: Record<ListingCategory, number> = {
  boat: 5_500_000,
  performance_boat: 14_500_000,
  yacht: 145_000_000,
  center_console: 19_500_000,
  car: 3_800_000,
  truck: 4_500_000,
  exotic: 22_500_000,
  classic: 8_500_000,
  powersports: 1_200_000,
  rv: 8_500_000,
};

const HOURS_RANGE = { fresh: 200, fair: 800, high: 1500 };
const MILEAGE_RANGE = { fresh: 30_000, fair: 80_000, high: 130_000 };

function depreciationCurve(yearsOld: number) {
  // Fast first-3-year drop, gradual after
  if (yearsOld <= 0) return 0;
  if (yearsOld === 1) return 18;
  if (yearsOld === 2) return 28;
  if (yearsOld === 3) return 36;
  return Math.min(60, 36 + (yearsOld - 3) * 2.5);
}

export function calculateDealScore(listing: Listing): DealScoreResult {
  const reasons: string[] = [];

  if (listing.is_demo) {
    return {
      score: 0,
      label: "Demo",
      color: "violet",
      reasons: ["Demo listing — not for sale"],
    };
  }

  let score = 50;

  // 1. Year/depreciation curve
  const now = new Date().getUTCFullYear();
  const yearsOld = listing.year ? Math.max(0, now - listing.year) : null;

  if (yearsOld != null && listing.price_cents) {
    const expectedDrop = depreciationCurve(yearsOld);
    const avg = CATEGORY_AVG_PRICE_CENTS[listing.category];
    if (avg) {
      const ratio = listing.price_cents / avg;
      if (ratio < 0.65) {
        score += 22;
        reasons.push("Priced well below the category average");
      } else if (ratio < 0.85) {
        score += 12;
        reasons.push("Priced under the category average");
      } else if (ratio < 1.15) {
        score += 4;
        reasons.push("Priced near the category average");
      } else if (ratio < 1.45) {
        score -= 10;
        reasons.push("Priced above the category average");
      } else {
        score -= 22;
        reasons.push("Priced well above the category average");
      }
    }
    if (expectedDrop > 30 && yearsOld >= 4) {
      score += 4;
    }
  } else {
    reasons.push("Year or price missing — review needed");
    score -= 6;
  }

  // 2. Hours / mileage
  const isBoat = ["boat", "performance_boat", "yacht", "center_console"].includes(
    listing.category,
  );
  if (isBoat && listing.hours != null) {
    if (listing.hours < HOURS_RANGE.fresh) {
      score += 10;
      reasons.push("Low engine hours");
    } else if (listing.hours < HOURS_RANGE.fair) {
      score += 4;
    } else if (listing.hours > HOURS_RANGE.high) {
      score -= 8;
      reasons.push("High engine hours");
    }
  }
  if (!isBoat && listing.mileage != null) {
    if (listing.mileage < MILEAGE_RANGE.fresh) {
      score += 10;
      reasons.push("Low miles");
    } else if (listing.mileage < MILEAGE_RANGE.fair) {
      score += 4;
    } else if (listing.mileage > MILEAGE_RANGE.high) {
      score -= 8;
      reasons.push("High miles");
    }
  }

  // 3. Condition
  const cond = (listing.condition ?? "").toLowerCase();
  if (cond.includes("new") || cond.includes("excellent")) {
    score += 6;
  } else if (cond.includes("rough") || cond.includes("project")) {
    score -= 8;
  }

  // 4. Trust signals
  if (listing.is_verified) {
    score += 4;
    reasons.push("Verified listing");
  }
  if (listing.is_finance_partner) {
    score += 2;
  }

  // 5. Title status
  if (listing.title_status && /salvage|rebuilt|flood/i.test(listing.title_status)) {
    score -= 18;
    reasons.push("Branded title");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let label: DealLabel = "Fair Deal";
  let color: DealScoreResult["color"] = "sky";

  if (score >= 78) {
    label = "Great Deal";
    color = "emerald";
  } else if (score >= 58) {
    label = "Fair Deal";
    color = "sky";
  } else if (score >= 35) {
    label = "High Price";
    color = "amber";
  } else {
    label = "Needs Review";
    color = "slate";
  }

  return { score, label, color, reasons };
}

