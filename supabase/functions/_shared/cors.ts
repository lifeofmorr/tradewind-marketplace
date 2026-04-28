// CORS helpers shared by all edge functions.
// Edge functions run on Deno; the standard library is loaded via the
// supabase/functions runtime, so this file is plain TypeScript.

// Origins allowed to call edge functions from a browser. Defaults cover
// production, the Vercel preview wildcard pattern, and local dev. Override
// with the ALLOWED_ORIGINS env (comma-separated) for self-hosted deploys.
const DEFAULT_ALLOWED = [
  "https://gotradewind.com",
  "https://www.gotradewind.com",
  "https://tradewind-marketplace.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const ENV_ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const ALLOWED = new Set([...DEFAULT_ALLOWED, ...ENV_ALLOWED]);

// Match `https://<anything>.vercel.app` for Vercel preview deploys.
const VERCEL_PREVIEW = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

function pickOrigin(req: Request): string {
  const origin = req.headers.get("origin") ?? "";
  if (!origin) return "";
  if (ALLOWED.has(origin)) return origin;
  if (VERCEL_PREVIEW.test(origin)) return origin;
  // Unknown origin — return empty so the browser blocks the response.
  return "";
}

export function buildCorsHeaders(req: Request): Record<string, string> {
  const origin = pickOrigin(req);
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, stripe-signature",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Vary": "Origin",
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

// Back-compat: legacy callers reference `corsHeaders` directly. Returns the
// permissive default for OPTIONS preflight without an origin header
// (e.g. server-to-server). Browser requests use buildCorsHeaders(req).
export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Vary": "Origin",
};

export function handleOptions(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: buildCorsHeaders(req) });
  }
  return null;
}

export function jsonResponse(body: unknown, status = 200, req?: Request): Response {
  const headers = req ? buildCorsHeaders(req) : corsHeaders;
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

export function errorResponse(message: string, status = 400, req?: Request): Response {
  return jsonResponse({ error: message }, status, req);
}
