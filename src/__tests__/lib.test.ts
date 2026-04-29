import { describe, it, expect } from "vitest";
import { calculateDealScore } from "@/lib/dealScore";
import { calculateListingQuality } from "@/lib/listingQuality";
import {
  calculateMonthlyPayment,
  calculateOwnershipCost,
  DEFAULT_FINANCING,
} from "@/lib/ownershipCost";
import {
  matchBuyerToListings,
  matchListingToPartners,
  matchDealerToLeads,
} from "@/lib/matchEngine";
import { formatCents, formatNumber, slugify, cn } from "@/lib/utils";
import type { Listing, ServiceProvider } from "@/types/database";

const baseListing: Listing = {
  id: "test-1",
  slug: "test-1",
  category: "boat",
  title: "Test boat",
  description: null,
  ai_summary: null,
  make: "Boston Whaler",
  model: "330 Outrage",
  trim_or_grade: null,
  year: 2020,
  price_cents: 35_000_00,
  currency: "USD",
  condition: "excellent",
  vin_or_hin: null,
  mileage: null,
  fuel_type: null,
  transmission: null,
  drivetrain: null,
  body_style: null,
  exterior_color: null,
  interior_color: null,
  hours: 150,
  length_ft: 33,
  beam_ft: null,
  hull_material: "fiberglass",
  hull_type: null,
  engine_count: 2,
  engine_make: "Mercury",
  engine_model: null,
  engine_hp: 350,
  fuel_capacity_gal: null,
  city: "Miami",
  state: "FL",
  zip: null,
  lat: null,
  lng: null,
  seller_type: "dealer",
  seller_id: "seller-1",
  dealer_id: null,
  status: "active",
  rejection_reason: null,
  reviewed_by: null,
  reviewed_at: null,
  is_verified: true,
  verified_at: null,
  trust_score: null,
  vin_hin_decoded: false,
  title_status: null,
  is_featured: false,
  is_premium: false,
  is_demo: false,
  featured_until: null,
  boost_until: null,
  is_finance_partner: false,
  is_insurance_partner: false,
  is_transport_partner: false,
  view_count: 0,
  inquiry_count: 0,
  save_count: 0,
  cover_photo_url: null,
  deal_score: null,
  deal_score_label: null,
  quality_score: null,
  quality_label: null,
  published_at: null,
  expires_at: null,
  sold_at: null,
  removed_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("formatCents / formatNumber", () => {
  it("formats cents to USD", () => {
    expect(formatCents(123_45)).toBe("$123");
    expect(formatCents(35_000_00)).toMatch(/\$35,000/);
  });
  it("returns dash for null/undefined cents", () => {
    expect(formatCents(null)).toBe("—");
    expect(formatCents(undefined)).toBe("—");
  });
  it("formats numbers with thousands separators", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
    expect(formatNumber(null)).toBe("—");
  });
});

describe("slugify", () => {
  it("lowercases and dashes spaces", () => {
    expect(slugify("Boston Whaler 330")).toBe("boston-whaler-330");
  });
  it("strips punctuation", () => {
    expect(slugify("Hello, world!")).toBe("hello-world");
  });
  it("collapses repeated dashes and trims", () => {
    expect(slugify("  multi   space  ")).toBe("multi-space");
  });
});

describe("cn", () => {
  it("merges tailwind classes preferring later utilities", () => {
    expect(cn("px-2 py-1", "px-4")).toContain("px-4");
    expect(cn("px-2 py-1", "px-4")).not.toContain("px-2");
  });
  it("filters falsy values", () => {
    expect(cn("a", false && "b", null, undefined, "c")).toBe("a c");
  });
});

describe("calculateDealScore", () => {
  it("uses stored score when present", () => {
    const result = calculateDealScore({
      ...baseListing,
      deal_score: 87,
      deal_score_label: "Great Deal",
    });
    expect(result.score).toBe(87);
    expect(result.label).toBe("Great Deal");
    expect(result.color).toBe("emerald");
  });

  it("applies Demo color when label is Demo", () => {
    const result = calculateDealScore({
      ...baseListing,
      deal_score: 65,
      deal_score_label: "demo",
      is_demo: true,
    });
    expect(result.label).toBe("Demo");
    expect(result.color).toBe("violet");
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("returns Needs Review when year and price both missing", () => {
    const result = calculateDealScore({
      ...baseListing,
      year: null,
      price_cents: null,
    });
    expect(result.label).toBe("Needs Review");
    expect(result.score).toBe(0);
  });

  it("scores below average price as a great deal", () => {
    const result = calculateDealScore({
      ...baseListing,
      price_cents: 30_000_00,
      year: 2020,
    });
    expect(result.score).toBeGreaterThan(50);
    expect(result.reasons.some((r) => /below|under|near/i.test(r))).toBe(true);
  });

  it("clamps score within 0–100", () => {
    const result = calculateDealScore({
      ...baseListing,
      title_status: "salvage",
      price_cents: 999_999_999,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

describe("calculateListingQuality", () => {
  it("scores a sparse listing as Poor", () => {
    const result = calculateListingQuality({
      listing: {
        ...baseListing,
        title: "x",
        description: null,
        price_cents: null,
        year: null,
        make: null,
        model: null,
        cover_photo_url: null,
        city: null,
        state: null,
        hours: null,
        length_ft: null,
        condition: null,
        vin_or_hin: null,
      },
      photoCount: 0,
    });
    expect(result.label).toBe("Poor");
    expect(result.score).toBeLessThan(50);
  });

  it("scores a complete boat listing as Premium", () => {
    const result = calculateListingQuality({
      listing: {
        ...baseListing,
        description: "x".repeat(200),
        cover_photo_url: "https://img.example.com/x.jpg",
        vin_or_hin: "ABC123",
      },
      photoCount: 8,
    });
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.label).toBe("Premium");
  });

  it("returns 0–100 score and 11 checks", () => {
    const result = calculateListingQuality({ listing: baseListing, photoCount: 0 });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.checks.length).toBe(11);
  });
});

describe("calculateOwnershipCost", () => {
  it("returns zero monthly payment for zero principal", () => {
    expect(calculateMonthlyPayment(0, 7, 60)).toBe(0);
  });

  it("returns simple division when APR is 0", () => {
    expect(calculateMonthlyPayment(12_000, 0, 12)).toBe(1000);
  });

  it("computes a typical amortizing payment", () => {
    const m = calculateMonthlyPayment(100_000, 6, 360);
    expect(m).toBeGreaterThan(599);
    expect(m).toBeLessThan(601);
  });

  it("includes payment, insurance, storage, maintenance, fuel for a boat", () => {
    const result = calculateOwnershipCost(baseListing);
    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.insuranceMonthly).toBeGreaterThan(0);
    expect(result.storageMonthly).toBeGreaterThan(0);
    expect(result.maintenanceMonthly).toBeGreaterThan(0);
    expect(result.totalMonthly).toBeGreaterThan(result.monthlyPayment);
    expect(result.fiveYearTotal).toBeCloseTo(result.totalMonthly * 60, 1);
  });

  it("uses the supplied financing inputs", () => {
    const r1 = calculateOwnershipCost(baseListing, DEFAULT_FINANCING);
    const r2 = calculateOwnershipCost(baseListing, {
      ...DEFAULT_FINANCING,
      downPaymentPct: 0.5,
    });
    expect(r2.details.financedAmount).toBeLessThan(r1.details.financedAmount);
    expect(r2.monthlyPayment).toBeLessThan(r1.monthlyPayment);
  });

  it("zero storage for cars", () => {
    const result = calculateOwnershipCost({
      ...baseListing,
      category: "car",
      length_ft: null,
      hours: null,
      mileage: 30_000,
      engine_hp: null,
    });
    expect(result.storageMonthly).toBe(0);
    expect(result.fuelMonthly).toBeGreaterThan(0);
  });
});

describe("matchEngine", () => {
  const inBudget: Listing = {
    ...baseListing,
    id: "match-1",
    category: "boat",
    state: "FL",
    city: "Miami",
    price_cents: 30_000_00,
    make: "Boston Whaler",
    is_verified: true,
  };
  const wrongCat: Listing = { ...baseListing, id: "match-2", category: "car", state: "FL" };
  const farAway: Listing = { ...baseListing, id: "match-3", category: "boat", state: "WA" };

  it("matchBuyerToListings ranks category + location matches highest", () => {
    const ranked = matchBuyerToListings(
      {
        categories: ["boat"],
        state: "FL",
        priceMaxCents: 50_000_00,
      },
      [wrongCat, farAway, inBudget],
    );
    expect(ranked[0].item.id).toBe("match-1");
    expect(ranked[0].reasons.length).toBeGreaterThan(0);
    expect(ranked[0].score).toBeGreaterThan(70);
  });

  it("matchBuyerToListings only considers active listings", () => {
    const ranked = matchBuyerToListings(
      { categories: ["boat"] },
      [{ ...inBudget, status: "draft" }],
    );
    expect(ranked.length).toBe(0);
  });

  it("matchListingToPartners filters out unrelated services", () => {
    const partners: ServiceProvider[] = [
      {
        id: "p1", slug: "p1", name: "Marine Mech", category: "marine_mechanic",
        description: null, logo_url: null, hero_image_url: null, website: null,
        phone: null, email: null, address_line1: null, city: "Miami", state: "FL",
        zip: null, lat: null, lng: null, service_radius_mi: null,
        rating_avg: 4.8, rating_count: 50, is_verified: true, is_featured: false,
        subscription_tier: null, subscription_status: null, stripe_customer_id: null,
        stripe_subscription_id: null, owner_id: "o", created_at: "", updated_at: "",
      },
      {
        id: "p2", slug: "p2", name: "Wrap Shop", category: "wrap_shop",
        description: null, logo_url: null, hero_image_url: null, website: null,
        phone: null, email: null, address_line1: null, city: "Miami", state: "FL",
        zip: null, lat: null, lng: null, service_radius_mi: null,
        rating_avg: 0, rating_count: 0, is_verified: false, is_featured: false,
        subscription_tier: null, subscription_status: null, stripe_customer_id: null,
        stripe_subscription_id: null, owner_id: "o", created_at: "", updated_at: "",
      },
    ];
    const out = matchListingToPartners({ category: "boat", state: "FL", city: "Miami" }, partners);
    expect(out[0].item.id).toBe("p1");
    expect(out.find((m) => m.item.id === "p2")).toBeUndefined();
  });

  it("matchDealerToLeads boosts fresh, high-quality leads", () => {
    const fresh = new Date().toISOString();
    const old = new Date(Date.now() - 7 * 24 * 36e5).toISOString();
    const ranked = matchDealerToLeads(
      { primary_category: "boat", state: "FL", city: "Miami" },
      [
        { id: "a", lead_quality_score: 30, status: "new", created_at: old, listing_category: "car", listing_state: "TX" },
        { id: "b", lead_quality_score: 90, status: "new", created_at: fresh, listing_category: "boat", listing_state: "FL" },
      ],
    );
    expect(ranked[0].item.id).toBe("b");
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  it("matchDealerToLeads excludes spam / closed_lost", () => {
    const ranked = matchDealerToLeads(
      { primary_category: "boat", state: "FL", city: "Miami" },
      [
        { id: "a", lead_quality_score: 90, status: "spam", created_at: new Date().toISOString() },
        { id: "b", lead_quality_score: 90, status: "closed_lost", created_at: new Date().toISOString() },
      ],
    );
    expect(ranked.length).toBe(0);
  });
});
