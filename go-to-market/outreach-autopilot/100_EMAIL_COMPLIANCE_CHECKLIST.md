# 100-Lead Campaign — Compliance Checklist

Run this checklist **before** approving any send in the TradeWind 100
campaign. If any item is unchecked, the message does not leave the
building.

Owner: Don Morrison · From address: `Don Morrison <don@lifeofmorr.com>` ·
Reply-to: same. Prepared: 2026-05-26.

---

## Per-message checklist (every send)

- [ ] **From line correct.** `Don Morrison <don@lifeofmorr.com>` — never
  `team@`, `hello@`, or any generic.
- [ ] **Reply-to is a real monitored inbox.** Same as the From, and Don
  reads it daily.
- [ ] **Subject not misleading.** No "re:" unless this is an actual reply
  or follow-up to a sent message. No fake "FW:" prefixes. No clickbait
  ("you won't believe…", "ACT NOW", emoji bait).
- [ ] **Subject is lowercase, real-noun based, 3–6 words.** Matches the
  HUMAN_VOICE_RULES.md spec.
- [ ] **Honest beta language.** Says "I'm building", "private beta", or
  similar. **Never** claims revenue, user counts, traction, or "trusted by
  X dealers" we do not have.
- [ ] **Demo inventory clearly labeled.** Any reference to live listings,
  numbers, or "what's on the platform" must be reconcilable with what's
  actually on the public site (or explicitly framed as
  demo/seed/illustrative). If a link is in the email, that link must
  resolve to public content that matches the email.
- [ ] **Opt-out line included verbatim:**
  > If this is not relevant, no worries — just tell me and I will not follow up.
  (FU2 may use the FU2 variant; close-the-loop is exempt — the whole
  message *is* the opt-out.)
- [ ] **Recipient is not on the bounce list.** `email_verification_status`
  is `verified` or `likely_valid` — NOT `bounced`, `invalid`, or
  `do_not_email`.
- [ ] **Recipient is not DNC.** `do_not_contact = false`.
- [ ] **Recipient has not opted out previously** in any channel (search
  outreach_replies for prior opt-out language).
- [ ] **Quality score is acceptable.** `ai_tone_risk_score < 50` and no
  banned-phrase flags in `checkMessageQuality()`.
- [ ] **One specific observation present** in the body — not a generic
  "I noticed your business".
- [ ] **No more than one ask.** A reply, a 10-min call, or the link —
  pick one.

---

## Per-day checklist (run once at start of send day)

- [ ] **Daily cap not exceeded.** See `30_DAY_SEND_SCHEDULE.md` — the
  dashboard enforces the cap.
- [ ] **No active hard-pause condition.** Bounce rate ≤ 5% rolling 7d,
  no unhonored opt-outs, no postmaster spam-rate alert.
- [ ] **Inbox sanity check.** Don has actually read his inbox today —
  any replies/bounces from yesterday have been triaged and the right
  rows updated (DNC, bounced, follow-up cancelled, etc.).

---

## Per-week checklist (run end of week)

- [ ] **Bounce rate snapshot logged** in the schedule doc.
- [ ] **Reply rate snapshot logged.**
- [ ] **Postmaster check.** Gmail + Yahoo postmaster tools show spam
  complaint rate < 0.1%, IP reputation = "High" or "Medium" (not
  "Low"/"Bad"), domain reputation same.
- [ ] **SPF / DKIM / DMARC still passing** for `lifeofmorr.com`. Use
  `mail-tester.com` or send-to-self to confirm headers show all three
  pass. **Document the result here:**

  | Date         | SPF | DKIM | DMARC | Notes |
  |--------------|-----|------|-------|-------|
  | 2026-05-26   | ?   | ?    | ?     | Pre-campaign baseline — DON to confirm before Week 1 Tue 05-27. |

- [ ] **Gmail / Yahoo sender requirements still met.** As of Feb 2024
  the bulk sender thresholds apply only above 5,000 messages/day — we
  are well below — but the **best-practice requirements** still apply:

  - SPF and DKIM both pass.
  - DMARC policy published (`p=none` minimum).
  - Reverse DNS (PTR record) matches sending hostname.
  - Functional `List-Unsubscribe` header (mailto + HTTPS).
  - One-click `List-Unsubscribe-Post: List-Unsubscribe=One-Click`.
  - Reply-to is a real monitored mailbox.
  - Spam-complaint rate kept below 0.3% (target 0.1%).

  If sending from Gmail directly (not via a transactional ESP), Gmail
  signs DKIM automatically for the gmail.com domain. For
  `don@lifeofmorr.com`, the DKIM record must be set up on the
  `lifeofmorr.com` DNS — Don to verify with the domain registrar.

---

## Bounce handling — automated

- Hard bounce → `outreach_messages.status = 'bounced'`,
  `outreach_leads.email_verification_status = 'bounced'`,
  `invalid_email_address = email`, `bounce_reason = '<reason>'`. Cancel
  any queued follow-ups. **Do NOT retry the same address.**
- Soft bounce → log but do not block; retry once on FU1. If FU1 also
  soft-bounces, treat as hard.

---

## Opt-out handling — manual + automated

The dashboard's reply classifier flags `not_interested` and `remove_me`
intents. When either fires:

1. `outreach_leads.do_not_contact = true`.
2. `outreach_leads.email_verification_status = 'do_not_email'`.
3. Cancel all queued `outreach_followups` for the lead.
4. Send a one-line acknowledgement reply (founder-discretion). Template:
   > Got it — taking you off the list. Best of luck.

Free-text opt-out phrases that must be honored (case-insensitive substring
match):

- `unsubscribe`
- `remove me`
- `stop emailing`
- `do not contact`
- `take me off`
- `please stop`
- `don't email`
- `not interested`

Add new phrases here as they show up in replies.

---

## Records retention

For each send, retain in `outreach_messages`:

- Full body, subject, channel, recipient address.
- `created_at`, `approved_at`, `sent_at`.
- `quality_score` and `ai_tone_risk_score`.
- Approver (will be `user_id` once dashboard captures it; for now,
  approver is implicitly Don).

For each reply, retain in `outreach_replies`:

- Full reply text, channel, classifier output, recommended response.

Audit trail in `outreach_activity_log` for every status flip.

---

## Pre-launch sign-off — Don to check before Week 1 Tue 05-27

- [ ] All 100 lead rows loaded via `supabase/outreach-100-leads.sql`.
- [ ] Verification status distribution looks right (no >50% unverified).
- [ ] SPF + DKIM + DMARC verified on `lifeofmorr.com`.
- [ ] First 3 drafts hand-reviewed for voice + opt-out line.
- [ ] Dashboard shows correct "Campaign: TradeWind 100" header + KPIs.
- [ ] Daily cap indicator visible.
- [ ] Familiar with Hard pause rules in `30_DAY_SEND_SCHEDULE.md`.

When all 6 boxes are checked, the campaign is live.
