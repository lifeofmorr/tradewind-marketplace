// POST /functions/v1/send-email
// Body: { template, to, props?: Record<string, string> }
// Returns: { id?: string, ok: boolean }
//
// Sends a transactional email via Resend.
//
// Required secrets:
//   RESEND_API_KEY
//   RESEND_FROM      (default: "TradeWind <hello@gotradewind.com>")
//   APP_URL          (used to build links inside templates)

import { handleOptions, jsonResponse, errorResponse } from "../_shared/cors.ts";

const RESEND_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = Deno.env.get("RESEND_FROM") ?? "TradeWind <hello@gotradewind.com>";
const APP_URL = (Deno.env.get("APP_URL") ?? "https://gotradewind.com").replace(/\/$/, "");

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
  if (req.method !== "POST") return errorResponse("POST only", 405);
  if (!RESEND_KEY) return errorResponse("RESEND_API_KEY not configured", 500);

  let body: Body;
  try { body = await req.json() as Body; } catch { return errorResponse("Invalid JSON"); }
  if (!body.template || !body.to) return errorResponse("template + to required");

  const { subject, html } = render(body.template, body.props ?? {});
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: Array.isArray(body.to) ? body.to : [body.to],
      subject,
      html,
    }),
  });
  if (!r.ok) {
    const text = await r.text();
    return errorResponse(`resend ${r.status}: ${text}`, 502);
  }
  const data = await r.json() as { id?: string };
  return jsonResponse({ ok: true, id: data.id });
});
