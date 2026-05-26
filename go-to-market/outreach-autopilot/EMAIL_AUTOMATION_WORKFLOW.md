# Email Automation Workflow

How TradeWind outreach actually ships — two operating modes. Mode A is the default. Mode B unlocks only after Mode A has produced 30+ replies and the voice/quality is dialed in.

---

## Mode A — Draft Approval (default)

**Who sends:** Don, manually.
**Who drafts:** Claude, via the daily prompt in `DAILY_CLAUDE_OUTREACH_COMMAND.md`.
**Where the drafts live:** Either the `DAILY_SEND_QUEUE.csv`, the admin Outreach Dashboard at `/admin/outreach`, or Don's Gmail drafts folder.

### Loop
1. Don runs the daily Claude prompt (afternoon).
2. Claude produces ~15–25 drafts in the send queue or as Gmail drafts.
3. Don reviews each one:
   - Edits the observation if it's weak
   - Cuts banned words and rewrites
   - Flips the CTA if it's too heavy
   - Approves with `Approved? = Yes`
4. Don sends from his personal Gmail (or from `/admin/outreach` if Resend integration is live).
5. The system marks `Sent? = Yes` and sets `Follow Up Due` = today + 3 days.

### Why we start here
- Every message goes out approved by a human.
- The brand voice gets dialed in by Don, not by the model alone.
- Bounce rate, reply rate, and unsubscribe rate stay low while we calibrate.
- No risk of an automated mishap blasting 200 wrong messages.

---

## Mode B — Controlled Send (unlocks after 30+ approved sends)

**Who sends:** The TradeWind app, via Supabase Edge Function calling Resend.
**Who drafts:** Claude.
**Approval:** Don pre-approves a batch in `/admin/outreach`, then the system schedules sends.

### Hard caps and guardrails

- **10–25 messages/day maximum**. The system refuses to schedule more.
- **Business contacts only.** Every row must have a public business email (not a personal Gmail/Yahoo).
- **Opt-out line is required.** The system refuses to send a message that doesn't contain the exact opt-out line.
- **Stops after reply.** Any inbound from that contact (positive or negative) cancels the remaining sequence.
- **Stops after opt-out.** Any negative reply or explicit opt-out flips `Do Not Contact = Yes` and removes from all future queues forever.
- **Follow-ups spaced 3–5 days apart**, never sooner.
- **Subject lines are human and lowercase.** The system rejects ALL CAPS, emoji, and any string matching the banned list.
- **No duplicates.** Same contact cannot appear in the queue more than once per 60 days.
- **Hours-of-day window:** 8:00 AM – 5:00 PM in the recipient's time zone (best-effort by state).
- **Mon–Thu only.** No Friday afternoon or weekend sends.

### Opt-out line, verbatim

Every cold message must end with this exact line (and it must be the second-to-last line, above the signature):

> If this is not relevant, no worries — just tell me and I will not follow up.

The system regex-checks each outbound for this exact string before send. Missing → reject.

### Subject line constraints

- 3–6 words
- Lowercase only (proper nouns ok)
- No emoji
- No `Re:` unless there's a real prior thread
- No "URGENT", "Quick chat?", "Following up", "Touching base"

### What Mode B looks like in the admin dashboard

In `/admin/outreach`:
- A "Schedule batch" button on approved rows
- A per-row toggle for `Approved? = Yes` and a row-level "Send now" button
- Each send is recorded in `outreach_messages` with `sent_at`, `channel`, `status`
- Replies received in Gmail are manually mirrored into the dashboard (or via Resend webhook in the Best tier)

---

## Reply handling (both modes)

When a reply lands:
1. Mark `Reply? = Yes` on the lead row
2. Paste the reply text into the `Reply` column
3. Identify the reply type using `REPLY_HANDLING_SYSTEM.md`
4. Use the matching response template
5. Move the lead to the next status (`Demo Scheduled`, `Beta Invited`, `DNC`, etc.)

The system never auto-responds to a real human reply. Always Don.

---

## What gets logged

For every outbound and inbound message, the `outreach_messages` table stores:

- `lead_id` → `outreach_leads`
- `direction` (`outbound` / `inbound`)
- `channel` (`email` / `linkedin` / `instagram` / `phone` / `voicemail`)
- `subject` (nullable for non-email)
- `body`
- `sent_at` / `received_at`
- `status` (`drafted` / `approved` / `sent` / `bounced` / `replied`)
- `meta` (JSON — anything else worth keeping)

Drafts are also stored so we have a full history of what was almost-sent — useful for rewriting the playbook.

---

## What we never do

- Mass send from a shared mailbox
- Use scraped personal emails or harvested contact lists
- Auto-DM via unauthorized LinkedIn/Instagram tools
- Send the same template to two different leads in the same day
- Send without an opt-out line
- Send after a `Do Not Contact = Yes` flag
- Add anyone to a sequence after they replied "stop", "remove", or "not interested"
