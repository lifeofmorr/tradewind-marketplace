// GET /functions/v1/stripe-readiness
//
// Admin-only. Returns the live/test readiness of the server-side Stripe
// configuration so the /admin/payments/live-readiness dashboard can show
// the current mode and any missing config — WITHOUT ever exposing secret
// values. Only env-var NAMES (never values) are returned.
//
// Auth: requires an authenticated caller whose profiles.role = 'admin'.
//
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (for the role
// check), plus the Stripe secrets being evaluated.

import { handleOptions, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { stripeReadinessFromEnv } from "../_shared/stripe-mode.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

async function callerIsAdmin(req: Request): Promise<boolean> {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.toLowerCase().startsWith("bearer ")) return false;
  const token = auth.slice(7).trim();
  if (!token || !SUPABASE_URL || !SERVICE_KEY) return false;

  // 1) Resolve the user from the JWT.
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: SERVICE_KEY },
  });
  if (!userRes.ok) return false;
  const user = await userRes.json() as { id?: string };
  if (!user.id) return false;

  // 2) Check their role via service-role read (bypasses RLS safely server-side).
  const roleRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=role`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
  );
  if (!roleRes.ok) return false;
  const rows = await roleRes.json() as { role: string }[];
  return rows.length > 0 && rows[0].role === "admin";
}

Deno.serve(async (req: Request) => {
  const pre = handleOptions(req); if (pre) return pre;
  if (req.method !== "GET" && req.method !== "POST") return errorResponse("GET only", 405, req);

  if (!(await callerIsAdmin(req))) {
    return errorResponse("admin only", 403, req);
  }

  const readiness = stripeReadinessFromEnv();
  return jsonResponse(readiness, 200, req);
});
