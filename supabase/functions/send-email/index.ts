// POST /functions/v1/send-email
// Body: { template, to, props?: Record<string, string> }
// Returns: { id?: string, ok: boolean }
//
// Sends a transactional email via Resend.
//
// Authentication:
//   - Server-to-server calls (other edge functions) authenticate with the
//     Supabase service-role key as a Bearer token. Those calls may set any
//     `to` address.
//   - User-initiated calls authenticate with the user's JWT. The `to`
//     address is forced to the authenticated user's email regardless of
//     what the client sent.
//   - Unauthenticated calls are rejected.
//
// Required secrets:
//   RESEND_API_KEY
//   RESEND_FROM                  (default: "TradeWind <hello@gotradewind.com>")
//   APP_URL                      (used to build links inside templates)
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY    (used to verify caller JWT)

import { handleOptions, jsonResponse, errorResponse } from "../_shared/cors.ts";

const RESEND_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = Deno.env.get("RESEND_FROM") ?? "TradeWind <hello@gotradewind.com>";
const APP_URL = (Deno.env.get("APP_URL") ?? "https://gotradewind.com").replace(/\/$/, "");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const VALID_TEMPLATES = new Set<Template>([
  "listing_approved", "new_inquiry", "featured_live",
  "request_received", "partner_assigned", "concierge_paid",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface AuthCheck { kind: "service" | "admin" | "user"; email?: string; userId?: string }

async function authenticate(req: Request): Promise<AuthCheck | null> {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.toLowerCase().startsWith("bearer ")) return null;
  const token = auth.slice(7).trim();
  if (!token) return null;
  // Server-to-server: token is the service role key itself.
  if (SERVICE_KEY && token === SERVICE_KEY) return { kind: "service" };
  if (!SUPABASE_URL) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: SERVICE_KEY },
  });
  if (!r.ok) return null;
  const data = await r.json() as { id?: string; email?: string };
  if (!data.id || !data.email) return null;

  // Look up role to decide if admin can send to arbitrary recipients.
  let kind: "admin" | "user" = "user";
  try {
    const pr = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${data.id}&select=role`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    if (pr.ok) {
      const rows = await pr.json() as { role?: string }[];
      if (rows[0]?.role === "admin") kind = "admin";
    }
  } catch {
    // fall through to "user"
  }
  return { kind, email: data.email, userId: data.id };
}

export type Template =
  | "listing_approved"
  | "new_inquiry"
  | "featured_live"
  | "request_received"
  | "partner_assigned"
  | "concierge_paid";

interface Body {
  template: Template;
  to: string | string[];
  props?: Record<string, string | number | undefined>;
}

function esc(s: string | number | undefined): string {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${esc(title)}</title></head>
<body style="margin:0;background:#0a1628;color:#f5f0e8;font-family:Inter,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a1628;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0f2238;border:1px solid rgba(201,168,76,0.18);border-radius:12px;overflow:hidden;">
        <tr><td style="padding:24px 32px;border-bottom:1px solid rgba(201,168,76,0.12);">
          <a href="${APP_URL}" style="color:#f5f0e8;text-decoration:none;font-family:Georgia,serif;font-size:22px;">TradeWind<span style="color:#c9a84c;">.</span></a>
        </td></tr>
        <tr><td style="padding:32px;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid rgba(201,168,76,0.12);font-size:12px;color:#8a99ad;">
          You're receiving this because you have an account on TradeWind.
          <br>Questions? <a style="color:#c9a84c;text-decoration:none;" href="mailto:support@gotradewind.com">support@gotradewind.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function btn(label: string, href: string): string {
  return `<a href="${esc(href)}" style="display:inline-block;background:#c9a84c;color:#0a1628;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:600;">${esc(label)}</a>`;
}

interface Rendered { subject: string; html: string }

function render(template: Template, props: Record<string, string | number | undefined>): Rendered {
  switch (template) {
    case "listing_approved": {
      const subject = `Your listing is live: ${props.listing_title ?? "your listing"}`;
      const html = shell(subject, `
        <h1 style="font-family:Georgia,serif;font-size:24px;margin:0 0 12px;">Your listing is live.</h1>
        <p>Good news — <strong>${esc(props.listing_title)}</strong> is now visible on TradeWind.</p>
        <p style="margin:24px 0;">${btn("View your listing", `${APP_URL}/listings/${props.listing_slug ?? ""}`)}</p>
      `);
      return { subject, html };
    }
    case "new_inquiry": {
      const subject = `New inquiry: ${props.listing_title ?? "your listing"}`;
      const html = shell(subject, `
        <h1 style="font-family:Georgia,serif;font-size:24px;margin:0 0 12px;">A buyer reached out.</h1>
        <p><strong>${esc(props.buyer_name)}</strong> messaged you about <strong>${esc(props.listing_title)}</strong>:</p>
        <blockquote style="border-left:3px solid #c9a84c;padding:8px 16px;color:#dce4ee;margin:16px 0;">${esc(props.message)}</blockquote>
        <p style="margin:24px 0;">${btn("Open your inbox", `${APP_URL}/seller/inquiries`)}</p>
      `);
      return { subject, html };
    }
    case "featured_live": {
      const subject = `Featured: ${props.listing_title ?? "your listing"} is now boosted`;
      const html = shell(subject, `
        <h1 style="font-family:Georgia,serif;font-size:24px;margin:0 0 12px;">You're featured.</h1>
        <p><strong>${esc(props.listing_title)}</strong> is now featured through <strong>${esc(props.ends_at)}</strong>.</p>
        <p style="margin:24px 0;">${btn("View your listing", `${APP_URL}/listings/${props.listing_slug ?? ""}`)}</p>
      `);
      return { subject, html };
    }
    case "request_received": {
      const subject = `We received your ${esc(props.kind)} request`;
      const html = shell(subject, `
        <h1 style="font-family:Georgia,serif;font-size:24px;margin:0 0 12px;">Got it.</h1>
        <p>We received your <strong>${esc(props.kind)}</strong> request. A vetted partner will reach out shortly with next steps.</p>
        <p style="margin:24px 0;">${btn("View my requests", `${APP_URL}/buyer/requests`)}</p>
      `);
      return { subject, html };
    }
    case "partner_assigned": {
      const subject = `A partner is on your ${esc(props.kind)} request`;
      const html = shell(subject, `
        <h1 style="font-family:Georgia,serif;font-size:24px;margin:0 0 12px;">A partner has been assigned.</h1>
        <p><strong>${esc(props.partner_name)}</strong> is handling your <strong>${esc(props.kind)}</strong> request and will reach out via email or phone within one business day.</p>
        <p style="margin:24px 0;">${btn("View my requests", `${APP_URL}/buyer/requests`)}</p>
      `);
      return { subject, html };
    }
    case "concierge_paid": {
      const subject = `Concierge engagement confirmed`;
      const html = shell(subject, `
        <h1 style="font-family:Georgia,serif;font-size:24px;margin:0 0 12px;">Welcome to concierge.</h1>
        <p>Your engagement is paid in full. A TradeWind concierge will reach out within one business day to begin sourcing.</p>
        <p style="margin:24px 0;">${btn("View my requests", `${APP_URL}/buyer/requests`)}</p>
      `);
      return { subject, html };
    }
  }
}

Deno.serve(async (req: Request) => {
  const pre = handleOptions(req); if (pre) return pre;
  if (req.method !== "POST") return errorResponse("POST only", 405, req);
  if (!RESEND_KEY) return errorResponse("RESEND_API_KEY not configured", 500, req);

  const auth = await authenticate(req);
  if (!auth) return errorResponse("authentication required", 401, req);

  let body: Body;
  try { body = await req.json() as Body; } catch { return errorResponse("Invalid JSON", 400, req); }
  if (!body.template || !body.to) return errorResponse("template + to required", 400, req);
  if (!VALID_TEMPLATES.has(body.template)) return errorResponse("invalid template", 400, req);

  // For non-admin user calls, ignore the client-supplied recipient and only
  // send to the caller's own email. This prevents the function from being
  // used as a generic spam relay. Service-role and admin callers may target
  // any recipient (admins act on behalf of sellers, e.g. listing_approved).
  let recipients: string[];
  if (auth.kind === "user") {
    recipients = [auth.email!];
  } else {
    recipients = Array.isArray(body.to) ? body.to : [body.to];
    if (!recipients.length || recipients.some((r) => !EMAIL_RE.test(r))) {
      return errorResponse("invalid recipient", 400, req);
    }
    // Reasonable cap to keep the function from being misused.
    if (recipients.length > 25) return errorResponse("too many recipients", 400, req);
  }

  const { subject, html } = render(body.template, body.props ?? {});
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: recipients,
      subject,
      html,
    }),
  });
  if (!r.ok) {
    const text = await r.text();
    return errorResponse(`resend ${r.status}: ${text}`, 502, req);
  }
  const data = await r.json() as { id?: string };
  return jsonResponse({ ok: true, id: data.id }, 200, req);
});
