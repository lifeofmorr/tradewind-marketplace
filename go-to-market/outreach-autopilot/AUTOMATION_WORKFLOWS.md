# Automation Workflows — Three Tiers

We do not pretend automation is the goal. The goal is replies, demos, and beta signups. Automation only helps if it doesn't sacrifice the human voice.

Three tiers, in order of complexity. Start at Minimum. Move up only when the previous tier has produced volume.

---

## Tier 1 — Minimum (Google Sheets + Claude + Gmail drafts)

**When to use:** day one. Until Don has sent ~50 messages and seen ~10 replies.

**How it works:**

1. The `OUTREACH_CRM_TEMPLATE.csv` is opened as a Google Sheet.
2. Don runs the `DAILY_CLAUDE_OUTREACH_COMMAND.md` prompt in Claude (this app).
3. Claude reads the sheet, picks 10–25 leads to work today, drafts each message inline in the sheet.
4. Don approves rows by setting `Approved? = Yes`.
5. For each approved row, Don copies the message into a new Gmail draft, addresses it, and sends from his personal Gmail.
6. Don marks `Sent? = Yes` and writes the follow-up date.

**Pros:** zero infra risk, every message human-approved, easy to iterate voice.
**Cons:** manual, doesn't scale past ~25/day.

---

## Tier 2 — Better (Supabase CRM + Resend)

**When to use:** Don has consistently sent for 2+ weeks and the voice is dialed.

**How it works:**

1. The CRM lives in Supabase `outreach_leads` + `outreach_messages` tables.
2. The admin dashboard at `/admin/outreach` is the working surface — see Tier 13 dashboard spec.
3. Don approves a draft in the dashboard. The "Send now" button on an approved row calls a Supabase Edge Function that emails via Resend, signed by Don's domain.
4. Send writes a row to `outreach_messages` with `status = sent`, `sent_at = now()`.
5. Follow-up dates auto-calculate. When a follow-up comes due, the dashboard shows it in the "Due today" tab. Don approves and sends each one.
6. Replies land in Gmail. Don mirrors them into the dashboard with the "Mark replied" action.

**Pros:** clean audit trail, faster than Gmail copy/paste, ready for the next tier.
**Cons:** still requires Don to approve each send (by design).

**Resend integration sketch:**

```
POST /functions/v1/send-outreach
{
  "lead_id": "uuid",
  "subject": "string",
  "body_text": "string",
  "body_html": "string (optional)"
}

→ Resend API: from: don@tradewind.com, to: lead.email
→ Insert outreach_messages row { status: 'sent', sent_at: now() }
→ Update outreach_leads.status = 'contacted', follow_up_date = now() + 3 days
```

**Send guards (enforced server-side):**

- Refuse if lead's `do_not_contact = true`
- Refuse if lead already received an email in the last 3 days
- Refuse if body doesn't contain the exact opt-out line
- Refuse if more than 25 sends today
- Refuse outside Mon-Thu 8am-5pm recipient-local time (best-effort)

---

## Tier 3 — Best (Admin dashboard + approved-send + follow-up automation)

**When to use:** Tier 2 has produced 100+ sends and ~20 replies without quality issues.

**How it works:** everything from Tier 2, plus:

1. **Auto-schedule follow-ups.** When Email 1 is sent and no reply within 3 days, the system auto-drafts FU1 using the matching sequence from the library and puts it in the "Pending approval" queue. Don still approves before send.
2. **Resend reply webhook.** Replies land in `outreach_messages` automatically with `direction = inbound`. Status flips on the lead row to `replied`. The dashboard surfaces new replies in a "Needs response" tab.
3. **Smart pause.** If a lead replies — even with an OOO — all queued follow-ups for that lead are auto-paused. Don decides whether to resume.
4. **Bounce handling.** A hard bounce from Resend marks the lead's email as invalid and removes from queue.
5. **Daily digest.** End-of-day email to Don: how many sent, how many replied, top 3 leads needing attention.

**What we still won't do at Tier 3:**

- Auto-respond to inbound human replies (always Don)
- Auto-DM via LinkedIn or Instagram tools (against platform ToS)
- Buy or import scraped contact lists
- Send without an opt-out line
- Send to a flagged `do_not_contact` row
- Exceed 25/day

---

## Tooling we'll never use

- Mass-blast services (Mailchimp campaigns to cold lists, Lemlist auto-sequences with no approval, etc.)
- LinkedIn scrapers (Octopus CRM, Phantombuster auto-DM, etc.)
- Instagram auto-DM tools
- Email warmup tools that send fake conversations to game inbox placement
- Any tool that hides the fact that we're a human reaching out

These tools all eventually trigger the AI-spam smell test and get our messages binned. The whole point of `HUMAN_VOICE_RULES.md` is to never trigger that reflex.

---

## Tier choice cheat sheet

| Stage | Daily volume | Tier |
|---|---|---|
| 0–50 total sends | 5–15 / day | Minimum |
| 50–250 total sends | 15–25 / day | Better |
| 250+ total sends, dialed | 20–25 / day | Best |

We never exceed 25/day regardless of tier. Above 25/day, message quality decays and replies tank.
