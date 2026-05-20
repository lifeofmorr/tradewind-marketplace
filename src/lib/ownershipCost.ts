import type { Listing } from "@/types/database";
import { isAircraftCategory } from "@/lib/categories";

/**
 * Pure ownership-cost estimator. All values in dollars (not cents).
 * Outputs are intentionally rough — the UI must show a disclaimer.
 */

export interface FinancingInputs {
  downPaymentPct: number; // 0–1
  termMonths: number;
  aprPct: number; // e.g. 7.5
}

export interface OwnershipCostResult {
  monthlyPayment: number;
  insuranceMonthly: number;
  storageMonthly: number;       // marina / hangar / parking
  maintenanceMonthly: number;   // includes annual / engine reserve for aircraft
  fuelMonthly: number;
  /** Aircraft-only extras (also rolled into totalMonthly). */
  aircraft?: {
    annualInspectionMonthly: number;
    engineReserveMonthly: number;
    avionicsReserveMonthly: number;
    prebuyOneTime: number;
    ferryOneTime: number;
    transitionTrainingOneTime: number;
  };
  totalMonthly: number;
  annualTotal: number;
  fiveYearTotal: number;
  details: {
    pricePaid: number;
    downPayment: number;
    financedAmount: number;
    interestPaidLifetime: number;
  };
}

const BOAT_CATEGORIES = new Set([
  "boat",
  "performance_boat",
  "yacht",
  "center_console",
]);

export function calculateMonthlyPayment(
  principal: number,
  aprPct: number,
  termMonths: number,
): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  const r = aprPct / 100 / 12;
  if (r === 0) return principal / termMonths;
  const x = Math.pow(1 + r, termMonths);
  return (principal * r * x) / (x - 1);
}

export const DEFAULT_FINANCING: FinancingInputs = {
  downPaymentPct: 0.2,
  termMonths: 180, // 15 yr — common for marine
  aprPct: 8.25,
};

export function calculateOwnershipCost(
  listing: Listing,
  financing: FinancingInputs = DEFAULT_FINANCING,
): OwnershipCostResult {
  const price = (listing.price_cents ?? 0) / 100;
  const downPayment = price * financing.downPaymentPct;
  const financedAmount = Math.max(0, price - downPayment);
  const monthlyPayment = calculateMonthlyPayment(
    financedAmount,
    financing.aprPct,
    financing.termMonths,
  );

  const isAircraft = isAircraftCategory(listing.category);
  const isBoat = BOAT_CATEGORIES.has(listing.category);

  if (isAircraft) {
    return calculateAircraftOwnershipCost(listing, financing, {
      price, downPayment, financedAmount, monthlyPayment,
    });
  }

  // Insurance: ~1.0% of asset value annually for boats, ~3.5% for cars (national midpoints)
  const insuranceAnnualPct = isBoat ? 0.01 : 0.035;
  const insuranceMonthly = (price * insuranceAnnualPct) / 12;

  // Storage / dock fees (boats) or parking (cars usually 0)
  let storageMonthly = 0;
  if (isBoat) {
    const lengthFt = listing.length_ft ?? 24;
    storageMonthly = lengthFt * 35; // ~$35/ft/mo midpoint
  } else if (listing.category === "rv") {
    storageMonthly = 200;
  }

  // Maintenance: 5% of price/year for boats, 1.5% for cars, 4% for exotic/classic
  let maintenanceAnnualPct = 0.015;
  if (isBoat) maintenanceAnnualPct = 0.05;
  if (listing.category === "exotic" || listing.category === "classic") maintenanceAnnualPct = 0.04;
  if (listing.category === "rv") maintenanceAnnualPct = 0.025;
  const maintenanceMonthly = (price * maintenanceAnnualPct) / 12;

  // Fuel — extremely rough usage assumptions
  let fuelMonthly = 0;
  if (isBoat && listing.engine_hp) {
    // ~10% throttle avg, gph = hp * 0.06; 30 hours/yr usage
    const gph = listing.engine_hp * 0.06;
    const annualHours = listing.category === "yacht" ? 80 : 30;
    fuelMonthly = (gph * annualHours * 4.25) / 12; // $4.25/gal marine
  } else if (!isBoat) {
    const milesPerYear = 8000;
    const mpg = listing.category === "exotic" ? 14 : 22;
    fuelMonthly = (milesPerYear / mpg) * 3.55 / 12; // $3.55/gal pump
  }

  const totalMonthly =
    monthlyPayment + insuranceMonthly + storageMonthly + maintenanceMonthly + fuelMonthly;

  const interestPaidLifetime =
    monthlyPayment * financing.termMonths - financedAmount;

  return {
    monthlyPayment,
    insuranceMonthly,
    storageMonthly,
    maintenanceMonthly,
    fuelMonthly,
    totalMonthly,
    annualTotal: totalMonthly * 12,
    fiveYearTotal: totalMonthly * 60,
    details: {
      pricePaid: price,
      downPayment,
      financedAmount,
      interestPaidLifetime,
    },
  };
}

// ─── Aircraft default financing (loan terms differ from marine) ──────────────

export const AIRCRAFT_DEFAULT_FINANCING: FinancingInputs = {
  downPaymentPct: 0.2,
  termMonths: 240, // 20-year aircraft amortization (common with balloon)
  aprPct: 7.5,
};

interface AircraftAssumptions {
  /** Annual hours flown (default 150 — typical owner-flown piston). */
  annualHours?: number;
  /** Avg fuel burn gph (default by category). */
  fuelGph?: number;
  /** Avg fuel price per gallon (Avgas $7.00, Jet-A $6.25). */
  fuelPricePerGal?: number;
}

function defaultAircraftAssumptions(listing: Listing): Required<AircraftAssumptions> {
  switch (listing.category) {
    case "aircraft_jet":
      return { annualHours: 250, fuelGph: 220, fuelPricePerGal: 6.25 };
    case "aircraft_very_light_jet":
      return { annualHours: 200, fuelGph: 130, fuelPricePerGal: 6.25 };
    case "aircraft_turboprop":
      return { annualHours: 250, fuelGph: 60, fuelPricePerGal: 6.25 };
    case "aircraft_helicopter":
      return { annualHours: 150, fuelGph: 28, fuelPricePerGal: 6.25 };
    case "aircraft_twin_engine":
      return { annualHours: 150, fuelGph: 24, fuelPricePerGal: 7.00 };
    case "aircraft_vintage":
      return { annualHours: 60, fuelGph: 12, fuelPricePerGal: 7.00 };
    case "aircraft_amphibious":
    case "aircraft_lsa":
      return { annualHours: 100, fuelGph: 7, fuelPricePerGal: 7.00 };
    case "aircraft_single_engine":
    case "aircraft_experimental":
    default:
      return { annualHours: 150, fuelGph: 14, fuelPricePerGal: 7.00 };
  }
}

interface PriceContext {
  price: number;
  downPayment: number;
  financedAmount: number;
  monthlyPayment: number;
}

export function calculateAircraftOwnershipCost(
  listing: Listing,
  financing: FinancingInputs = AIRCRAFT_DEFAULT_FINANCING,
  ctx?: PriceContext,
  assumptions: AircraftAssumptions = {},
): OwnershipCostResult {
  const price = ctx?.price ?? (listing.price_cents ?? 0) / 100;
  const downPayment = ctx?.downPayment ?? price * financing.downPaymentPct;
  const financedAmount = ctx?.financedAmount ?? Math.max(0, price - downPayment);
  const monthlyPayment = ctx?.monthlyPayment
    ?? calculateMonthlyPayment(financedAmount, financing.aprPct, financing.termMonths);

  const a = { ...defaultAircraftAssumptions(listing), ...assumptions };

  // Insurance: 1.2–2.5% of hull value annually
  const cat = listing.category;
  let insurAnnualPct = 0.012;
  if (cat === "aircraft_twin_engine" || cat === "aircraft_vintage") insurAnnualPct = 0.02;
  if (cat === "aircraft_turboprop") insurAnnualPct = 0.015;
  if (cat === "aircraft_jet" || cat === "aircraft_very_light_jet") insurAnnualPct = 0.018;
  if (cat === "aircraft_helicopter") insurAnnualPct = 0.025;
  const insuranceMonthly = (price * insurAnnualPct) / 12;

  // Hangar / storage — by category and price tier
  let storageMonthly = 600;
  if (cat === "aircraft_lsa" || cat === "aircraft_experimental") storageMonthly = 350;
  if (cat === "aircraft_twin_engine") storageMonthly = 850;
  if (cat === "aircraft_turboprop") storageMonthly = 1200;
  if (cat === "aircraft_jet") storageMonthly = 2500;
  if (cat === "aircraft_very_light_jet") storageMonthly = 1600;
  if (cat === "aircraft_helicopter") storageMonthly = 750;
  if (cat === "aircraft_vintage") storageMonthly = 900;

  // Annual inspection — fixed cost amortized monthly
  let annualInspection = 2200;
  if (cat === "aircraft_twin_engine") annualInspection = 4500;
  if (cat === "aircraft_turboprop") annualInspection = 12000;
  if (cat === "aircraft_jet" || cat === "aircraft_very_light_jet") annualInspection = 18000;
  if (cat === "aircraft_helicopter") annualInspection = 8000;
  if (cat === "aircraft_vintage") annualInspection = 3500;
  if (cat === "aircraft_lsa") annualInspection = 800; // condition inspection
  const annualInspectionMonthly = annualInspection / 12;

  // Routine maintenance reserve (excludes engine/avionics earmarked separately).
  let maintAnnualPct = 0.015;
  if (cat === "aircraft_twin_engine") maintAnnualPct = 0.025;
  if (cat === "aircraft_turboprop") maintAnnualPct = 0.04;
  if (cat === "aircraft_jet" || cat === "aircraft_very_light_jet") maintAnnualPct = 0.05;
  if (cat === "aircraft_helicopter") maintAnnualPct = 0.05;
  if (cat === "aircraft_vintage") maintAnnualPct = 0.035;
  const maintenanceMonthly = (price * maintAnnualPct) / 12;

  // Engine reserve: per-hour reserve × annual hours
  let engineReservePerHour = 25;
  if (cat === "aircraft_twin_engine") engineReservePerHour = 45;
  if (cat === "aircraft_turboprop") engineReservePerHour = 200;
  if (cat === "aircraft_jet") engineReservePerHour = 450;
  if (cat === "aircraft_very_light_jet") engineReservePerHour = 300;
  if (cat === "aircraft_helicopter") engineReservePerHour = 250;
  if (cat === "aircraft_vintage") engineReservePerHour = 30;
  if (cat === "aircraft_lsa") engineReservePerHour = 12;
  const engineReserveMonthly = (engineReservePerHour * a.annualHours) / 12;

  // Avionics reserve — 1–2% of hull/yr earmarked for db updates, ADS-B etc.
  const avionicsReserveMonthly = (price * 0.01) / 12;

  // Fuel
  const fuelMonthly = (a.fuelGph * a.annualHours * a.fuelPricePerGal) / 12;

  // One-time costs (informational, not added to totalMonthly)
  let prebuyOneTime = 2500;
  if (cat === "aircraft_twin_engine") prebuyOneTime = 4500;
  if (cat === "aircraft_turboprop") prebuyOneTime = 8500;
  if (cat === "aircraft_jet" || cat === "aircraft_very_light_jet") prebuyOneTime = 15000;
  if (cat === "aircraft_helicopter") prebuyOneTime = 6500;
  if (cat === "aircraft_vintage") prebuyOneTime = 3000;
  if (cat === "aircraft_lsa") prebuyOneTime = 1200;

  let ferryOneTime = 1500;
  if (cat === "aircraft_twin_engine") ferryOneTime = 3000;
  if (cat === "aircraft_turboprop") ferryOneTime = 6000;
  if (cat === "aircraft_jet" || cat === "aircraft_very_light_jet") ferryOneTime = 12000;
  if (cat === "aircraft_helicopter") ferryOneTime = 5000;

  let transitionTrainingOneTime = 0;
  if (cat === "aircraft_turboprop") transitionTrainingOneTime = 8000;
  if (cat === "aircraft_jet" || cat === "aircraft_very_light_jet") transitionTrainingOneTime = 25000;
  if (cat === "aircraft_helicopter") transitionTrainingOneTime = 4500;
  if (cat === "aircraft_twin_engine") transitionTrainingOneTime = 3000;
  if (cat === "aircraft_vintage") transitionTrainingOneTime = 2500;

  const totalMonthly =
    monthlyPayment
    + insuranceMonthly
    + storageMonthly
    + maintenanceMonthly
    + fuelMonthly
    + annualInspectionMonthly
    + engineReserveMonthly
    + avionicsReserveMonthly;

  const interestPaidLifetime =
    monthlyPayment * financing.termMonths - financedAmount;

  return {
    monthlyPayment,
    insuranceMonthly,
    storageMonthly,
    maintenanceMonthly,
    fuelMonthly,
    aircraft: {
      annualInspectionMonthly,
      engineReserveMonthly,
      avionicsReserveMonthly,
      prebuyOneTime,
      ferryOneTime,
      transitionTrainingOneTime,
    },
    totalMonthly,
    annualTotal: totalMonthly * 12,
    fiveYearTotal: totalMonthly * 60,
    details: {
      pricePaid: price,
      downPayment,
      financedAmount,
      interestPaidLifetime,
    },
  };
}
