import type { Listing, ListingCategory } from "@/types/database";

export interface CategoryStat {
  category: ListingCategory;
  count: number;
  avg_price_cents: number;
  median_price_cents: number;
}

export interface StateStat {
  state: string;
  count: number;
}

export interface MarketPulseData {
  total: number;
  active: number;
  featured: number;
  demo: number;
  all_demo: boolean;
  avg_price_cents: number;
  median_price_cents: number;
  categories: CategoryStat[];
  states: StateStat[];
}

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return Math.round(nums.reduce((s, n) => s + n, 0) / nums.length);
}

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[m - 1] + sorted[m]) / 2)
    : sorted[m];
}

export function calculateMarketPulse(listings: Listing[]): MarketPulseData {
  const valid = listings.filter((l) => l.status === "active" || l.status === "pending_review");
  const prices = valid.map((l) => l.price_cents ?? 0).filter((p) => p > 0);

  const byCategory = new Map<ListingCategory, Listing[]>();
  for (const l of valid) {
    const arr = byCategory.get(l.category) ?? [];
    arr.push(l);
    byCategory.set(l.category, arr);
  }

  const categories: CategoryStat[] = Array.from(byCategory.entries())
    .map(([category, ls]) => {
      const ps = ls.map((l) => l.price_cents ?? 0).filter((p) => p > 0);
      return {
        category,
        count: ls.length,
        avg_price_cents: avg(ps),
        median_price_cents: median(ps),
      };
    })
    .sort((a, b) => b.count - a.count);

  const stateMap = new Map<string, number>();
  for (const l of valid) {
    if (!l.state) continue;
    stateMap.set(l.state, (stateMap.get(l.state) ?? 0) + 1);
  }
  const states: StateStat[] = Array.from(stateMap.entries())
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const featured = valid.filter((l) => l.is_featured).length;
  const demo = listings.filter((l) => l.is_demo).length;

  return {
    total: listings.length,
    active: valid.length,
    featured,
    demo,
    all_demo: listings.length > 0 && demo === listings.length,
    avg_price_cents: avg(prices),
    median_price_cents: median(prices),
    categories,
    states,
  };
}
