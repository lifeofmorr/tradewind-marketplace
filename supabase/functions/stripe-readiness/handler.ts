// Stripe readiness request handling, separated from the Deno entrypoint so
// it can be unit-tested (vitest) with fake env + fetch. index.ts wires this
// to Deno.serve with the real environment.

import { handleOptions, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { readinessFromEnv } from "../stripe-checkout/handler.ts";

export interface ReadinessDeps {
  env: (name: string) => string | undefined;
  fetchImpl: typeof fetch;
}

async function callerIsAdmin(req: Request, deps: ReadinessDeps): Promise<boolean> {
  const supabaseUrl = deps.env("SUPABASE_URL") ?? "";
  const serviceKey = deps.env("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.toLowerCase().startsWith("bearer ")) return false;
  const token = auth.slice(7).trim();
  if (!token || !supabaseUrl || !serviceKey) return false;

  // 1) Resolve the user from the JWT.
  const userRes = await deps.fetchImpl(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: serviceKey },
  });
  if (!userRes.ok) return false;
  const user = await userRes.json() as { id?: string };
  if (!user.id) return false;

  // 2) Check their role via service-role read (bypasses RLS safely server-side).
  const roleRes = await deps.fetchImpl(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=role`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
  );
  if (!roleRes.ok) return false;
  const rows = await roleRes.json() as { role: string }[];
  return rows.length > 0 && rows[0].role === "admin";
}

export function createReadinessHandler(deps: ReadinessDeps): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    const pre = handleOptions(req); if (pre) return pre;
    if (req.method !== "GET" && req.method !== "POST") return errorResponse("GET only", 405, req);

    if (!(await callerIsAdmin(req, deps))) {
      return errorResponse("admin only", 403, req);
    }

    return jsonResponse(readinessFromEnv(deps.env), 200, req);
  };
}
