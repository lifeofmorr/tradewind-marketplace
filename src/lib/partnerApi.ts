import { supabase } from "@/lib/supabase";

export type PartnerType =
  | "lender"
  | "insurance"
  | "transport"
  | "inspector"
  | "escrow"
  | "title_verification";

export type QuoteStatus =
  | "pending"
  | "sent"
  | "quoted"
  | "accepted"
  | "declined"
  | "expired";

export interface QuoteRequest {
  id: string;
  user_id: string;
  listing_id: string | null;
  partner_type: PartnerType;
  status: QuoteStatus;
  details: Record<string, unknown>;
  created_at: string;
}

export interface QuoteResponse {
  request: QuoteRequest;
  sandbox: boolean;
}

const SANDBOX = (import.meta.env.VITE_PARTNER_API_SANDBOX ?? "true") === "true";

export function isPartnerSandbox(): boolean {
  return SANDBOX;
}

/**
 * Submit a quote request to a partner. In sandbox mode, the request is still
 * recorded but a fake provider response is simulated after 2 s so UIs can
 * exercise the full happy path without live partner credentials.
 */
export async function requestQuote(
  type: PartnerType,
  listingId: string | null,
  details: Record<string, unknown>,
): Promise<QuoteResponse> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error("Sign in to request a partner quote.");

  const { data, error } = await supabase
    .from("partner_quote_requests")
    .insert({
      user_id: userId,
      listing_id: listingId,
      partner_type: type,
      details,
    })
    .select()
    .single();

  if (error) throw error;
  const request = data as QuoteRequest;

  if (SANDBOX) {
    setTimeout(() => {
      void supabase
        .from("partner_quote_requests")
        .update({
          status: "quoted",
          details: { ...details, sandbox_quote: simulatedQuote(type, details) },
        })
        .eq("id", request.id);
    }, 2000);
  }

  return { request, sandbox: SANDBOX };
}

export async function getQuoteStatus(requestId: string): Promise<QuoteRequest | null> {
  const { data, error } = await supabase
    .from("partner_quote_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();
  if (error) throw error;
  return (data as QuoteRequest | null) ?? null;
}

function simulatedQuote(type: PartnerType, details: Record<string, unknown>): Record<string, unknown> {
  const priceCents = Number(details.price_cents ?? 0);
  switch (type) {
    case "lender":
      return { apr: 7.49, term_months: 84, monthly_cents: Math.round(priceCents / 84 * 1.08) };
    case "insurance":
      return { annual_cents: Math.max(120000, Math.round(priceCents * 0.012)), deductible_cents: 100000 };
    case "transport":
      return { quote_cents: Math.max(85000, Math.round(priceCents * 0.018)), eta_days: 7 };
    case "inspector":
      return { fee_cents: 65000, soonest_iso: new Date(Date.now() + 86400_000 * 5).toISOString() };
    case "escrow":
      return { fee_cents: Math.max(50000, Math.round(priceCents * 0.005)), accepts_wire: true };
    case "title_verification":
      return { fee_cents: 9900, sla_hours: 24 };
  }
}
