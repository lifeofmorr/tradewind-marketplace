import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getAuthedUser } from "../_shared/auth.ts";

/**
 * Plaid Link Token edge function.
 * In sandbox mode (no PLAID_CLIENT_ID set), returns a sandbox stub so the
 * front-end flow can be exercised end-to-end without live credentials.
 * When credentials are set, calls the real Plaid API.
 *
 * Auth: requires a valid Supabase JWT. The authenticated user's id is used as
 * the Plaid client_user_id — body-supplied user_id is ignored.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const user = await getAuthedUser(req);
  if (!user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized — sign in to link a bank account." }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const PLAID_CLIENT_ID = Deno.env.get("PLAID_CLIENT_ID") ?? "";
  const PLAID_SECRET = Deno.env.get("PLAID_SECRET") ?? "";
  const PLAID_ENV = Deno.env.get("PLAID_ENV") ?? "sandbox";
  const isSandbox = !PLAID_CLIENT_ID || !PLAID_SECRET;

  try {
    const { action, public_token } = await req.json();
    const user_id = user.id;

    if (action === "create_link_token") {
      if (isSandbox) {
        return new Response(JSON.stringify({
          link_token: `sandbox-link-${user_id}-${Date.now()}`,
          expiration: new Date(Date.now() + 30 * 60_000).toISOString(),
          sandbox: true,
          message: "Plaid sandbox mode — bank linking will be simulated. Connect Plaid credentials for live bank verification.",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Real Plaid call
      const plaidHost = PLAID_ENV === "production"
        ? "https://production.plaid.com"
        : PLAID_ENV === "development"
        ? "https://development.plaid.com"
        : "https://sandbox.plaid.com";

      const res = await fetch(`${plaidHost}/link/token/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: PLAID_CLIENT_ID,
          secret: PLAID_SECRET,
          user: { client_user_id: user_id },
          client_name: "TradeWind",
          products: ["auth", "identity"],
          country_codes: ["US"],
          language: "en",
        }),
      });
      const data = await res.json();
      return new Response(JSON.stringify({ ...data, sandbox: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "exchange_public_token") {
      if (isSandbox) {
        return new Response(JSON.stringify({
          access_token: `sandbox-access-${Date.now()}`,
          item_id: `sandbox-item-${Date.now()}`,
          sandbox: true,
          message: "Sandbox exchange complete — bank account simulated.",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const plaidHost = PLAID_ENV === "production"
        ? "https://production.plaid.com"
        : PLAID_ENV === "development"
        ? "https://development.plaid.com"
        : "https://sandbox.plaid.com";

      const res = await fetch(`${plaidHost}/item/public_token/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: PLAID_CLIENT_ID,
          secret: PLAID_SECRET,
          public_token,
        }),
      });
      const data = await res.json();
      return new Response(JSON.stringify({ ...data, sandbox: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Unknown action. Use 'create_link_token' or 'exchange_public_token'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
