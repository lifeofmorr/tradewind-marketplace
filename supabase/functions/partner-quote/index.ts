import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Partner Quote Request handler.
 * Accepts quote requests for lender, insurance, transport, inspector, escrow,
 * and title_verification partner types. Stores in partner_quote_requests table.
 * In sandbox mode (default), simulates a partner quote response.
 * When real partner APIs are connected, routes to the appropriate provider.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    const { partner_type, listing_id, user_id, details } = await req.json();

    if (!partner_type || !user_id) {
      return new Response(
        JSON.stringify({ error: "partner_type and user_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert request
    const { data: request, error } = await sb
      .from("partner_quote_requests")
      .insert({ user_id, listing_id, partner_type, details: details ?? {} })
      .select()
      .single();

    if (error) throw error;

    // Simulate partner response in sandbox mode
    const priceCents = Number(details?.price_cents ?? 0);
    const quote = simulateQuote(partner_type, priceCents);

    // Update with simulated quote after insert
    await sb
      .from("partner_quote_requests")
      .update({ status: "quoted", details: { ...details, sandbox_quote: quote } })
      .eq("id", request.id);

    return new Response(JSON.stringify({
      request_id: request.id,
      status: "quoted",
      sandbox: true,
      quote,
      message: `Sandbox ${partner_type} quote generated. Connect a real ${partner_type} API for live quotes.`,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function simulateQuote(type: string, priceCents: number) {
  switch (type) {
    case "lender":
      return { apr: 7.49, term_months: 84, monthly_cents: Math.round(priceCents / 84 * 1.08), provider: "Sandbox Lending Co." };
    case "insurance":
      return { annual_cents: Math.max(120000, Math.round(priceCents * 0.012)), deductible_cents: 100000, provider: "Sandbox Insurance Group" };
    case "transport":
      return { quote_cents: Math.max(85000, Math.round(priceCents * 0.018)), eta_days: 7, provider: "Sandbox Transport LLC" };
    case "inspector":
      return { fee_cents: 65000, soonest_iso: new Date(Date.now() + 86400_000 * 5).toISOString(), provider: "Sandbox Marine Surveyors" };
    case "escrow":
      return { fee_cents: Math.max(50000, Math.round(priceCents * 0.005)), accepts_wire: true, provider: "Sandbox Escrow Services" };
    case "title_verification":
      return { fee_cents: 9900, sla_hours: 24, provider: "Sandbox Title Verify" };
    default:
      return { message: "Unknown partner type" };
  }
}
