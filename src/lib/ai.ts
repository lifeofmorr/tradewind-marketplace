import { supabase } from "./supabase";

export type AIWorkflow =
  | "listing_generator" | "buyer_assistant" | "fraud_check"
  | "pricing_estimate" | "concierge_intake";

async function call<TIn extends Record<string, unknown>, TOut>(fn: string, body: TIn): Promise<TOut> {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) throw error;
  return data as TOut;
}

export interface ListingDraft {
  title: string;
  description: string;
  ai_summary: string;
  make?: string; model?: string; year?: number; category?: string;
  length_ft?: number; hours?: number; engine_count?: number; engine_hp?: number;
  mileage?: number; drivetrain?: string; fuel_type?: string;
  city?: string; state?: string;
  suggested_price_cents?: number;
}
export const aiListingGenerator = (prompt: string, category: string) =>
  call<{ prompt: string; category: string }, { draft: ListingDraft }>(
    "ai-listing-generator", { prompt, category });

export interface AIChatMessage { role: "user" | "assistant"; content: string }
export const aiBuyerAssistant = (
  messages: AIChatMessage[],
  context?: { listing_id?: string; saved_listing_ids?: string[] },
) =>
  call<{ messages: AIChatMessage[]; context?: unknown }, { reply: string }>(
    "ai-buyer-assistant", { messages, context });

export interface FraudVerdict {
  score: number; signals: string[]; recommended_action: "allow" | "review" | "block";
}
export const aiFraudCheck = (input: {
  email?: string; phone?: string; message?: string;
  listing_title?: string; listing_price_cents?: number;
}) => call<typeof input, FraudVerdict>("ai-fraud-check", input);

export interface PriceEstimate {
  median_cents: number; low_cents: number; high_cents: number;
  comp_count: number; rationale: string;
}
export const aiPricingEstimate = (input: {
  category: string; make: string; model: string;
  year: number; mileage_or_hours?: number; state?: string;
}) => call<typeof input, PriceEstimate>("ai-pricing-estimate", input);

export interface ConciergeIntake {
  category: string;
  budget_min_cents: number; budget_max_cents: number;
  desired_features: string[];
  timeline: string;
  preferred_locations: string[];
  next_question: string | null;
}
export const aiConciergeIntake = (messages: AIChatMessage[]) =>
  call<{ messages: AIChatMessage[] }, { intake: ConciergeIntake }>(
    "ai-concierge-intake", { messages });

export interface ListingAutopilotResult {
  suggested_title: string;
  suggested_description: string;
  missing_specs: string[];
  price_assessment: string;
  quality_tips: string[];
  _disclaimer: string;
}
export const aiListingAutopilot = (input: {
  title?: string; description?: string; category: string;
  price_cents?: number; specs?: Record<string, unknown>;
}) => call<typeof input, ListingAutopilotResult>("ai-listing-autopilot", input);

export interface NegotiationResult {
  fair_range: { low_cents: number; high_cents: number; label: string };
  negotiation_message: string;
  counteroffer_message: string;
  deal_analysis: string;
  _disclaimer: string;
}
export const aiNegotiationAssistant = (input: {
  listing_price_cents: number; offer_amount_cents: number;
  category: string; deal_score?: number; listing_title?: string;
}) => call<typeof input, NegotiationResult>("ai-negotiation-assistant", input);

// ─── Aircraft-specific AI helpers ───────────────────────────────────────────

export interface AircraftWalkaroundScript {
  exterior: string[];
  cockpit: string[];
  engine_compartment: string[];
  logbook: string[];
  test_flight: string[];
  questions_to_ask: string[];
  red_flags: string[];
  _disclaimer: string;
}

/**
 * Generates a walkaround / inspection script tailored to a specific aircraft.
 * Strictly informational — emphasizes that a real A&P/IA pre-buy is required.
 *
 * Falls back to a client-side template if the AI edge function isn't deployed
 * yet — we never block the user on AI availability for aviation-safety content.
 */
export async function aiAircraftWalkaround(input: {
  category: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  registration?: string | null;
}): Promise<AircraftWalkaroundScript> {
  try {
    return await call<typeof input, AircraftWalkaroundScript>(
      "ai-aircraft-walkaround", input,
    );
  } catch {
    return localAircraftWalkaround(input);
  }
}

export function localAircraftWalkaround(input: {
  category: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  registration?: string | null;
}): AircraftWalkaroundScript {
  const isTurbine = input.category === "aircraft_jet"
    || input.category === "aircraft_very_light_jet"
    || input.category === "aircraft_turboprop"
    || input.category === "aircraft_helicopter";
  return {
    exterior: [
      "Check for hangar rash, ramp damage, and waviness on control surfaces.",
      "Look at rivet lines for working rivets, paint cracks, or filler.",
      "Inspect leading edges, tips, and stabilizer attach points for prior damage.",
      "Photograph the registration / tail (verify against FAA registry independently).",
      "Look at tires, brakes, struts, and gear doors for leaks.",
    ],
    cockpit: [
      "Confirm avionics suite matches the listing (model + software versions).",
      "Verify ADS-B Out compliance — check transponder code and altitude reporting.",
      "Inventory documents: AROW (Airworthiness, Registration, Owner manual, Weight & Balance).",
      "Test autopilot modes on the ground if safe; note any flags.",
      "Inspect upholstery, plastics, and panel for water staining (could indicate leaks).",
    ],
    engine_compartment: isTurbine
      ? [
          "Borescope hot-section access — request photos from a turbine-rated A&P.",
          "Check for fuel staining, oil residue on accessories, and corrosion.",
          "Review trend monitoring data and any FOD events in logs.",
        ]
      : [
          "Check oil filter contents and last analysis report.",
          "Look at cylinder compression test results from the most recent annual.",
          "Inspect exhaust for cracks, baffles for fit, and hoses for cracking.",
          "Check magneto timing if accessible.",
        ],
    logbook: [
      "Verify continuous chain of annual inspections (12 months for Part 91).",
      "Confirm AD/SB compliance entries — independent A&P/IA must verify.",
      "Look for engine overhauls, prop overhauls, gear overhauls with shop receipts.",
      "Check for major repairs / alterations (337 forms) and STCs.",
      "Note any damage history entries or insurance claims.",
    ],
    test_flight: [
      "Power assurance check on takeoff roll (turbine) or static RPM (piston).",
      "Verify avionics in flight — autopilot, GPS approach mode, ADS-B traffic.",
      "Check pressurization, anti-ice, and environmental systems if equipped.",
      "Note vibrations, rigging issues, or trim anomalies in cruise.",
    ],
    questions_to_ask: [
      "Why are you selling?",
      "Has the aircraft ever been damaged or had a major repair?",
      "When was the last engine, prop, and gear overhaul?",
      "Is the title clean? Will you use an aircraft title / escrow company at closing?",
      "Are logbooks complete and available for review by my A&P/IA?",
    ],
    red_flags: [
      "Seller refuses to use an aircraft escrow / title company.",
      "Logbooks are missing pages, recent entries, or have gaps.",
      "Damage history disclosed inconsistently with logbook entries.",
      "Seller demands wire transfer to a personal account.",
      "Annual is overdue or aircraft hasn't flown in 12+ months without explanation.",
      "Avionics or panel doesn't match the photos.",
    ],
    _disclaimer:
      "This walkaround script is informational only. Tradewind does not perform inspections, "
      + "verify airworthiness, or sign off on AD/SB compliance. A licensed A&P/IA must conduct "
      + "the pre-buy inspection and make the final airworthiness determination.",
  };
}

/** Aircraft-specific fraud warnings — surfaced inline in messaging UI. */
export const AIRCRAFT_FRAUD_WARNINGS: string[] = [
  "Be wary of sellers who demand a wire transfer to a personal (non-escrow) account.",
  "Unverifiable N-numbers / registrations are a red flag — cross-check the FAA registry.",
  "Missing or partial logbooks are a top fraud indicator in aviation transactions.",
  "Aircraft escrow should always be handled by a licensed aircraft title / escrow company.",
  "If the seller refuses a pre-buy inspection, walk away.",
];
