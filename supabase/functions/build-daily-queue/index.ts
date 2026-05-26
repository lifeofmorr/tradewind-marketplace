// POST /functions/v1/build-daily-queue
//
// Selects up to N (default 10) highest-priority leads:
//   - not DNC
//   - not contacted in the last 5 days
//   - status not in ('replied', 'demo_booked', 'beta_invited')
//
// For each lead:
//   - calls generate-outreach-message (email channel by default)
//   - inserts the message as a draft into outreach_messages
//   - creates a follow-up row for ~3 days out if none exists
//
// Returns: { drafted: number, follow_ups_created: number, skipped: number, errors: string[] }
//
// Auth: requires admin caller (uses the caller's JWT). The function passes the
// JWT through to Supabase so RLS does the access check.

import { handleOptions, jsonResponse, errorResponse } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

interface Lead {
  id: string;
  company: string;
  contact_name: string | null;
  contact_role: string | null;
  vertical: string;
  email: string | null;
  location: string | null;
  website: string | null;
  personalization_angle: string | null;
  pain_point: string | null;
  recommended_offer: string | null;
  notes: string | null;
  status: string;
  date_contacted: string | null;
  follow_up_date: string | null;
  priority: number;
  lead_score: number;
  do_not_contact: boolean;
}

interface BuildOpts {
  limit?: number;
  channel?: "email" | "linkedin" | "instagram";
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysFromNow(n: number): string {
  return new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);
}

async function authedFetch(req: Request, path: string, init: RequestInit = {}): Promise<Response> {
  const auth = req.headers.get("authorization") ?? "";
  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      apikey: SUPABASE_ANON,
      authorization: auth,
      "content-type": "application/json",
      prefer: "return=representation",
    },
  });
}

Deno.serve(async (req: Request) => {
  const pre = handleOptions(req);
  if (pre) return pre;
  if (req.method !== "POST") return errorResponse("POST only", 405, req);

  if (!SUPABASE_URL || !SUPABASE_ANON) {
    return errorResponse("Server missing SUPABASE_URL/SUPABASE_ANON_KEY", 500, req);
  }

  const auth = req.headers.get("authorization");
  if (!auth) return errorResponse("Missing authorization", 401, req);

  let opts: BuildOpts = {};
  try {
    if (req.headers.get("content-length") && Number(req.headers.get("content-length")) > 0) {
      opts = await req.json() as BuildOpts;
    }
  } catch { /* ignore — defaults */ }

  const limit = Math.max(1, Math.min(opts.limit ?? 10, 25));
  const channel = opts.channel ?? "email";

  // 1) Pull candidates. RLS will enforce admin.
  // Skip leads contacted in the last 5 days (date_contacted) and DNC/replied/etc.
  const cutoff = daysFromNow(-5);
  const q = new URLSearchParams({
    select: "*",
    do_not_contact: "eq.false",
    or: `(date_contacted.is.null,date_contacted.lt.${cutoff})`,
    status: "in.(new,drafted,sent)",
    order: "priority.desc,lead_score.desc,updated_at.desc",
    limit: String(limit * 3),
  });
  const leadsRes = await authedFetch(req, `/rest/v1/outreach_leads?${q.toString()}`);
  if (!leadsRes.ok) {
    const txt = await leadsRes.text();
    return errorResponse(`Could not fetch leads: ${txt}`, leadsRes.status, req);
  }
  const allLeads = await leadsRes.json() as Lead[];

  // Filter again client-side: skip beta_invited/demo_booked via status. Also
  // skip leads with an existing draft so we don't double-queue.
  const errors: string[] = [];
  let drafted = 0;
  let followUpsCreated = 0;
  let skipped = 0;

  const picked: Lead[] = [];
  for (const lead of allLeads) {
    if (picked.length >= limit) break;
    // skip if there's already a drafted message
    const draftCheck = await authedFetch(
      req,
      `/rest/v1/outreach_messages?lead_id=eq.${lead.id}&status=eq.drafted&select=id&limit=1`,
    );
    if (draftCheck.ok) {
      const existing = await draftCheck.json() as { id: string }[];
      if (existing.length > 0) {
        skipped++;
        continue;
      }
    }
    picked.push(lead);
  }

  // 2) For each picked lead, generate a message and insert as draft.
  for (const lead of picked) {
    try {
      const genRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-outreach-message`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: auth,
          apikey: SUPABASE_ANON,
        },
        body: JSON.stringify({
          lead,
          channel,
          vertical: lead.vertical,
        }),
      });
      if (!genRes.ok) {
        const txt = await genRes.text();
        errors.push(`${lead.company}: generate failed (${genRes.status}) ${txt.slice(0, 200)}`);
        continue;
      }
      const gen = await genRes.json() as {
        subject?: string;
        body: string;
        personalization_note?: string;
        cta?: string;
        quality_score?: number;
        ai_tone_risk_score?: number;
      };

      const insertRes = await authedFetch(req, "/rest/v1/outreach_messages", {
        method: "POST",
        body: JSON.stringify({
          lead_id: lead.id,
          direction: "outbound",
          channel,
          subject: gen.subject || null,
          body: gen.body,
          status: "drafted",
          approved: false,
          personalization_note: gen.personalization_note ?? null,
          cta: gen.cta ?? null,
          quality_score: gen.quality_score ?? null,
          ai_tone_risk_score: gen.ai_tone_risk_score ?? null,
        }),
      });
      if (!insertRes.ok) {
        const txt = await insertRes.text();
        errors.push(`${lead.company}: insert failed ${txt.slice(0, 200)}`);
        continue;
      }
      const inserted = await insertRes.json() as { id: string }[];
      const messageId = inserted[0]?.id;
      drafted++;

      // 3) Mark the lead so it doesn't show as "new" forever.
      await authedFetch(req, `/rest/v1/outreach_leads?id=eq.${lead.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "drafted" }),
      });

      // 4) Create a 3-day follow-up if none exists.
      const fuCheck = await authedFetch(
        req,
        `/rest/v1/outreach_followups?lead_id=eq.${lead.id}&status=eq.due&select=id&limit=1`,
      );
      if (fuCheck.ok) {
        const existing = await fuCheck.json() as { id: string }[];
        if (existing.length === 0) {
          const fuRes = await authedFetch(req, "/rest/v1/outreach_followups", {
            method: "POST",
            body: JSON.stringify({
              lead_id: lead.id,
              message_id: messageId ?? null,
              followup_number: 1,
              due_date: daysFromNow(3),
              status: "due",
            }),
          });
          if (fuRes.ok) followUpsCreated++;
        }
      }

      // 5) Activity log.
      await authedFetch(req, "/rest/v1/outreach_activity_log", {
        method: "POST",
        body: JSON.stringify({
          lead_id: lead.id,
          action: "draft_generated",
          metadata: {
            channel,
            message_id: messageId,
            ai_tone_risk_score: gen.ai_tone_risk_score ?? null,
            quality_score: gen.quality_score ?? null,
          },
        }),
      });
    } catch (e) {
      errors.push(`${lead.company}: ${(e as Error).message}`);
    }
  }

  return jsonResponse(
    {
      drafted,
      follow_ups_created: followUpsCreated,
      skipped,
      considered: allLeads.length,
      picked: picked.length,
      errors,
      built_at: todayIso(),
    },
    200,
    req,
  );
});
