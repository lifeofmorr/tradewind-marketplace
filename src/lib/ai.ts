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
