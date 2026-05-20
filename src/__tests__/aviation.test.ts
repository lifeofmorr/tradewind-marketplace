import { describe, it, expect, vi } from "vitest";

// Stub the Supabase client so this lib-only test doesn't require env vars.
vi.mock("@/lib/supabase", () => {
  return {
    supabase: {
      from: () => ({
        select: () => ({}),
      }),
      functions: { invoke: () => Promise.reject(new Error("offline")) },
    },
  };
});

import {
  CATEGORIES,
  AIRCRAFT_CATEGORIES,
  AVIATION_SERVICE_CATEGORIES,
  isAircraftCategory,
  isAviationServiceCategory,
  isFlyableAircraftCategory,
} from "@/lib/categories";
import {
  calculateOwnershipCost,
  calculateAircraftOwnershipCost,
  AIRCRAFT_DEFAULT_FINANCING,
} from "@/lib/ownershipCost";
import {
  calculateDealScore,
  calculateAircraftDealScore,
} from "@/lib/dealScore";
import { demoMediaMap, pickDemoPhotos } from "@/lib/demoMediaMap";
import { localAircraftWalkaround, AIRCRAFT_FRAUD_WARNINGS } from "@/lib/ai";
import type { Listing, AircraftSpecs, ListingCategory } from "@/types/database";

const baseAircraftListing: Listing = {
  id: "ac-1",
  slug: "2018-cirrus-sr22t-g6",
  category: "aircraft_single_engine",
  title: "2018 Cirrus SR22T G6",
  description: null,
  ai_summary: null,
  make: "Cirrus",
  model: "SR22T G6",
  trim_or_grade: null,
  year: 2018,
  price_cents: 649_000_00,
  currency: "USD",
  condition: "excellent",
  vin_or_hin: null,
  mileage: null, fuel_type: null, transmission: null, drivetrain: null,
  body_style: null, exterior_color: null, interior_color: null,
  hours: null, length_ft: null, beam_ft: null, hull_material: null, hull_type: null,
  engine_count: 1, engine_make: null, engine_model: null, engine_hp: null,
  fuel_capacity_gal: null,
  city: "Scottsdale", state: "AZ", zip: null, lat: null, lng: null,
  seller_type: "private", seller_id: "s1", dealer_id: null,
  status: "active", rejection_reason: null, reviewed_by: null, reviewed_at: null,
  is_verified: true, verified_at: null, trust_score: null,
  vin_hin_decoded: false, title_status: null,
  is_featured: true, is_premium: false, is_demo: false,
  featured_until: null, boost_until: null,
  is_finance_partner: true, is_insurance_partner: true, is_transport_partner: false,
  view_count: 0, inquiry_count: 0, save_count: 0,
  cover_photo_url: null,
  deal_score: null, deal_score_label: null, quality_score: null, quality_label: null,
  published_at: null, expires_at: null, sold_at: null, removed_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const baseSpec: AircraftSpecs = {
  id: "spec-1", listing_id: "ac-1",
  n_number: "N123AB", registration_number: "N123AB",
  serial_number: "0851",
  total_time_hours: 850, total_time: 850,
  airframe_hours: 850, landings: null,
  engine_make: "Continental", engine_model: "TSIO-550-K", engine_count: 1,
  engine_hours: 200, smoh_hours: 200, smoh: 200,
  snew: null, tbo_hours: 2000, tbo: 2000, propeller_hours: 200,
  annual_inspection_date: new Date().toISOString().slice(0, 10),
  logbooks_complete: true,
  airworthiness_status: "standard",
  airworthiness_certificate_status: "standard",
  avionics_suite: "Garmin Perspective+ NXi",
  ads_b: true, adsb: true,
  autopilot: "GFC700",
  ad_sb_compliance: "Current",
  seats: 5, range_nm: 1021, cruise_speed_ktas: 213, useful_load_lbs: 1328,
  damage_history: null,
  hangared: true,
  hangar_status: "hangared",
  pre_buy_inspection_status: "completed",
  ferry_ready: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ───────────────────────────────────────────────────────────────────────────
// Categories
// ───────────────────────────────────────────────────────────────────────────

describe("aircraft categories", () => {
  it("CATEGORIES contains all required aviation entries", () => {
    const keys = CATEGORIES.map((c) => c.key);
    const required: ListingCategory[] = [
      "aircraft_single_engine", "aircraft_twin_engine", "aircraft_turboprop",
      "aircraft_jet", "aircraft_very_light_jet", "aircraft_helicopter",
      "aircraft_experimental", "aircraft_vintage", "aircraft_amphibious",
      "aircraft_lsa", "aircraft_parts", "aviation_services",
    ];
    for (const r of required) expect(keys).toContain(r);
  });

  it("AIRCRAFT_CATEGORIES only includes aircraft group entries", () => {
    for (const cat of AIRCRAFT_CATEGORIES) {
      expect(cat).toMatch(/^aircraft_|^aviation_/);
    }
    expect(AIRCRAFT_CATEGORIES.length).toBeGreaterThanOrEqual(10);
  });

  it("isAircraftCategory returns true for aviation and false for boat/auto", () => {
    expect(isAircraftCategory("aircraft_single_engine")).toBe(true);
    expect(isAircraftCategory("aircraft_jet")).toBe(true);
    expect(isAircraftCategory("aviation_services")).toBe(true);
    expect(isAircraftCategory("boat")).toBe(false);
    expect(isAircraftCategory("car")).toBe(false);
  });

  it("isFlyableAircraftCategory excludes parts", () => {
    expect(isFlyableAircraftCategory("aircraft_single_engine")).toBe(true);
    expect(isFlyableAircraftCategory("aircraft_parts")).toBe(false);
  });

  it("AVIATION_SERVICE_CATEGORIES covers spec-required roles", () => {
    const required = [
      "ap_mechanic", "ia_inspector", "aviation_maintenance_shop",
      "aircraft_broker", "aircraft_lender", "aviation_insurance",
      "aircraft_title_company", "aircraft_escrow", "ferry_pilot",
      "avionics_shop", "hangar_storage",
    ];
    for (const r of required) {
      expect(AVIATION_SERVICE_CATEGORIES).toContain(r);
      expect(isAviationServiceCategory(r)).toBe(true);
    }
    expect(isAviationServiceCategory("marine_mechanic")).toBe(false);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// Demo media map
// ───────────────────────────────────────────────────────────────────────────

describe("demoMediaMap — aircraft coverage", () => {
  it("has photos for every aircraft category", () => {
    const cats: ListingCategory[] = [
      "aircraft_single_engine", "aircraft_twin_engine", "aircraft_turboprop",
      "aircraft_jet", "aircraft_very_light_jet", "aircraft_helicopter",
      "aircraft_experimental", "aircraft_vintage", "aircraft_amphibious",
      "aircraft_lsa", "aircraft_parts", "aviation_services",
    ];
    for (const c of cats) {
      expect(demoMediaMap[c]).toBeDefined();
      expect(demoMediaMap[c].length).toBeGreaterThan(0);
      for (const url of demoMediaMap[c]) {
        expect(url).toMatch(/^https:\/\/images\.unsplash\.com\//);
      }
    }
  });

  it("pickDemoPhotos rotates aircraft images by offset", () => {
    const a = pickDemoPhotos("aircraft_single_engine", 0, 3);
    const b = pickDemoPhotos("aircraft_single_engine", 1, 3);
    expect(a.length).toBe(3);
    expect(b.length).toBe(3);
    expect(a).not.toEqual(b);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// Aircraft True Cost to Own
// ───────────────────────────────────────────────────────────────────────────

describe("calculateAircraftOwnershipCost", () => {
  it("calculateOwnershipCost routes aircraft listings to aircraft cost model", () => {
    const result = calculateOwnershipCost(baseAircraftListing);
    expect(result.aircraft).toBeDefined();
    expect(result.aircraft?.annualInspectionMonthly).toBeGreaterThan(0);
    expect(result.aircraft?.engineReserveMonthly).toBeGreaterThan(0);
    expect(result.aircraft?.avionicsReserveMonthly).toBeGreaterThan(0);
    expect(result.aircraft?.prebuyOneTime).toBeGreaterThan(0);
    expect(result.aircraft?.ferryOneTime).toBeGreaterThan(0);
  });

  it("totalMonthly includes payment + insurance + hangar + annual + maint + engine reserve + avionics + fuel", () => {
    const r = calculateAircraftOwnershipCost(
      baseAircraftListing,
      AIRCRAFT_DEFAULT_FINANCING,
    );
    expect(r.totalMonthly).toBeGreaterThan(
      r.monthlyPayment + r.insuranceMonthly + r.storageMonthly,
    );
    expect(r.totalMonthly).toBeGreaterThan(0);
    expect(r.annualTotal).toBeCloseTo(r.totalMonthly * 12, 1);
    expect(r.fiveYearTotal).toBeCloseTo(r.totalMonthly * 60, 1);
  });

  it("Turboprops cost more than singles, jets cost more than turboprops", () => {
    const single = calculateAircraftOwnershipCost({
      ...baseAircraftListing,
      category: "aircraft_single_engine",
      price_cents: 500_000_00,
    });
    const turboprop = calculateAircraftOwnershipCost({
      ...baseAircraftListing,
      category: "aircraft_turboprop",
      price_cents: 500_000_00,
    });
    const jet = calculateAircraftOwnershipCost({
      ...baseAircraftListing,
      category: "aircraft_jet",
      price_cents: 500_000_00,
    });
    expect(turboprop.totalMonthly).toBeGreaterThan(single.totalMonthly);
    expect(jet.totalMonthly).toBeGreaterThan(turboprop.totalMonthly);
  });

  it("includes transition training one-time cost for jets but not for singles", () => {
    const single = calculateAircraftOwnershipCost({
      ...baseAircraftListing,
      category: "aircraft_single_engine",
    });
    const jet = calculateAircraftOwnershipCost({
      ...baseAircraftListing,
      category: "aircraft_jet",
    });
    expect(single.aircraft?.transitionTrainingOneTime).toBe(0);
    expect(jet.aircraft?.transitionTrainingOneTime ?? 0).toBeGreaterThan(0);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// Aircraft Deal Score
// ───────────────────────────────────────────────────────────────────────────

describe("calculateAircraftDealScore", () => {
  it("returns base score when spec is null", () => {
    const base = calculateDealScore(baseAircraftListing);
    const aircraft = calculateAircraftDealScore(baseAircraftListing, null);
    expect(aircraft.score).toBe(base.score);
  });

  it("boosts score for low total time + lots of engine life + complete logs + modern avionics", () => {
    const base = calculateDealScore(baseAircraftListing);
    const aircraft = calculateAircraftDealScore(baseAircraftListing, baseSpec);
    expect(aircraft.score).toBeGreaterThanOrEqual(base.score);
    expect(aircraft.reasons.length).toBeGreaterThan(0);
  });

  it("penalizes overdue annual + partial logbooks + no ADS-B", () => {
    const base = calculateDealScore(baseAircraftListing);
    const old = new Date(); old.setFullYear(old.getFullYear() - 2);
    const aircraft = calculateAircraftDealScore(baseAircraftListing, {
      ...baseSpec,
      annual_inspection_date: old.toISOString().slice(0, 10),
      logbooks_complete: false,
      adsb: false, ads_b: false,
      damage_history: "Prop strike 2015 — repaired per AC 43.13",
      pre_buy_inspection_status: null,
    });
    expect(aircraft.score).toBeLessThan(base.score);
    expect(aircraft.reasons.some((r) => /overdue|partial|ADS-B|damage/i.test(r))).toBe(true);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// Walkaround + fraud warnings
// ───────────────────────────────────────────────────────────────────────────

describe("aircraft walkaround + fraud warnings", () => {
  it("local walkaround script contains all required sections", () => {
    const out = localAircraftWalkaround({
      category: "aircraft_single_engine",
      make: "Cirrus", model: "SR22T", year: 2018,
    });
    expect(out.exterior.length).toBeGreaterThan(0);
    expect(out.cockpit.length).toBeGreaterThan(0);
    expect(out.engine_compartment.length).toBeGreaterThan(0);
    expect(out.logbook.length).toBeGreaterThan(0);
    expect(out.test_flight.length).toBeGreaterThan(0);
    expect(out.questions_to_ask.length).toBeGreaterThan(0);
    expect(out.red_flags.length).toBeGreaterThan(0);
    expect(out._disclaimer).toMatch(/A&P\/IA/);
  });

  it("turbine walkaround references borescope / hot-section", () => {
    const jet = localAircraftWalkaround({ category: "aircraft_jet" });
    expect(jet.engine_compartment.join(" ")).toMatch(/borescope|hot-section/i);
  });

  it("AIRCRAFT_FRAUD_WARNINGS covers wire, registration, logbook, escrow", () => {
    const joined = AIRCRAFT_FRAUD_WARNINGS.join(" ").toLowerCase();
    expect(joined).toMatch(/wire/);
    expect(joined).toMatch(/n-number|registration/);
    expect(joined).toMatch(/logbook/);
    expect(joined).toMatch(/escrow/);
  });
});
