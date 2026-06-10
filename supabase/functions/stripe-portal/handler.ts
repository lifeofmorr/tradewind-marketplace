// Stripe Billing-Portal session handling, separated from the Deno entrypoint
// so it can be unit-tested (vitest) with fake env + fetch. index.ts wires
// this to Deno.serve with the real environment.
//
// Lets a dealer or service provider manage their subscription (update card,
// cancel, view invoices) via Stripe's hosted customer portal. The caller must
// own the dealer/provider record, and that record must already have a
// stripe_customer_id (set by the webhook when the subscription was created).

import { handleOptions, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { readinessFromEnv } from "../stripe-checkout/handler.ts";

export interface PortalBody {
  dealerId?: string;
  serviceProviderId?: string;
  returnUrl?: string;
}

export interface PortalDeps {
  env: (name: string) => string | undefined;
  fetchImpl: typeof fetch;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const URL_RE = /^https?:\/\/[^\s]+$/;

interface AuthUser { id: string }

async function getCallingUser(req: Request, deps: PortalDeps): Promise<AuthUser | null> {
  const supabaseUrl = deps.env("SUPABASE_URL") ?? "";
  const serviceKey = deps.env("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.toLowerCase().startsWith("bearer ")) return null;
  const token = auth.slice(7).trim();
  if (!token || !supabaseUrl) return null;
  const r = await deps.fetchImpl(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: serviceKey },
  });
  if (!r.ok) return null;
  const data = await r.json() as { id?: string };
  return data.id ? { id: data.id } : null;
}

interface BillingRow { owner_id: string; stripe_customer_id: string | null }

async function fetchOwnedBillingRow(
  table: "dealers" | "service_providers",
  id: string,
  userId: string,
  deps: PortalDeps,
): Promise<{ found: boolean; owned: boolean; customerId: string | null }> {
  const supabaseUrl = deps.env("SUPABASE_URL") ?? "";
  const serviceKey = deps.env("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) return { found: false, owned: false, customerId: null };
  const r = await deps.fetchImpl(
    `${supabaseUrl}/rest/v1/${table}?id=eq.${id}&select=owner_id,stripe_customer_id`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
  );
  if (!r.ok) return { found: false, owned: false, customerId: null };
  const rows = await r.json() as BillingRow[];
  if (rows.length === 0) return { found: false, owned: false, customerId: null };
  return {
    found: true,
    owned: rows[0].owner_id === userId,
    customerId: rows[0].stripe_customer_id,
  };
}

export function createPortalHandler(deps: PortalDeps): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    const pre = handleOptions(req); if (pre) return pre;
    if (req.method !== "POST") return errorResponse("POST only", 405, req);

    // Same fail-closed Stripe environment gate as checkout — never talk to
    // Stripe with a half-configured or test/live-mixed environment.
    const readiness = readinessFromEnv(deps.env);
    if (!readiness.ok) {
      return jsonResponse(
        { error: "Billing portal is temporarily unavailable.", stripe_mode: readiness.mode },
        503,
        req,
      );
    }

    const user = await getCallingUser(req, deps);
    if (!user) return errorResponse("authentication required", 401, req);

    let body: PortalBody;
    try { body = await req.json() as PortalBody; } catch { return errorResponse("Invalid JSON", 400, req); }

    const hasDealer = !!body.dealerId;
    const hasProvider = !!body.serviceProviderId;
    if (hasDealer === hasProvider) {
      return errorResponse("exactly one of dealerId or serviceProviderId required", 400, req);
    }
    const id = (body.dealerId ?? body.serviceProviderId)!;
    if (!UUID_RE.test(id)) return errorResponse("invalid id format", 400, req);
    if (body.returnUrl != null && !URL_RE.test(body.returnUrl)) {
      return errorResponse("invalid url", 400, req);
    }

    const table = hasDealer ? "dealers" : "service_providers";
    const row = await fetchOwnedBillingRow(table, id, user.id, deps);
    if (!row.found || !row.owned) {
      // Same response for missing and unowned — don't leak which IDs exist.
      return errorResponse(`not authorized for ${hasDealer ? "dealer" : "service provider"}`, 403, req);
    }
    if (!row.customerId) {
      return errorResponse("no billing account yet — subscribe first", 409, req);
    }

    const appUrl = deps.env("APP_URL") ?? "https://gotradewind.com";
    const returnUrl = body.returnUrl ?? `${appUrl}/dashboard/billing`;

    try {
      const r = await deps.fetchImpl("https://api.stripe.com/v1/billing_portal/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${deps.env("STRIPE_SECRET_KEY") ?? ""}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ customer: row.customerId, return_url: returnUrl }).toString(),
      });
      if (!r.ok) {
        console.error("[stripe-portal] stripe error", r.status, await r.text());
        return errorResponse("Billing portal error — please try again.", 502, req);
      }
      const data = await r.json() as { url: string };
      return jsonResponse({ url: data.url }, 200, req);
    } catch (e) {
      return errorResponse((e as Error).message, 500, req);
    }
  };
}
