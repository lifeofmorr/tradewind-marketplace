import type { Listing } from "@/types/database";

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
  storageMonthly: number;
  maintenanceMonthly: number;
  fuelMonthly: number;
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

  const isBoat = BOAT_CATEGORIES.has(listing.category);

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
