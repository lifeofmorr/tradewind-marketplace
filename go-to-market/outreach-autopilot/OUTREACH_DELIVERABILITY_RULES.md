# Outreach Deliverability Rules

These are the operating rules for cold outreach from TradeWind. They are
deliberately conservative. The goal during private beta is to protect
sender reputation, not to maximize daily volume — once a domain is on a
spam list, getting off is expensive and slow.

If a rule below conflicts with a tactic suggested elsewhere, **the
deliverability rule wins**.

---

## 1. Daily send limits

| Phase | Daily limit | When |
|-------|-------------|------|
| Warm-up | 3–5 emails / day | First 2 weeks from `don@lifeofmorr.com` or any new sender domain. |
| Steady-state | 10–15 emails / day | Only after 2 weeks of clean delivery (bounce rate < 5%, no spam complaints). |
| Scale review | 25 / day max | Only with founder approval and a documented reply rate baseline. |

We do **not** scale beyond 25/day until reply patterns are understood. There
is no business reason to push higher during private beta.

---

## 2. Email verification before sending

Every email address gets verified before it is queued for send. Verification
means at least ONE of:

1. The address appears on the company's own public website (contact page,
   team page, footer). This is the gold standard.
2. The address was confirmed live by a reply on a prior touch (LinkedIn,
   phone, contact form).

Addresses sourced from third-party data aggregators (RocketReach, ZoomInfo,
Apollo, Hunter "guess" formats) are **not enough** on their own. They are
acceptable as a *starting point* for a website-verification or LinkedIn
check, but never a direct send target.

If verification fails, the lead goes to `next_action='verify_contact'` and
out of the queue.

---

## 3. Bounce handling

| Bounce class | Action |
|--------------|--------|
| Hard bounce (mailbox not found, domain not found) | Set `outreach_messages.status='bounced'`. Set the lead `status='bounced'`. Add the exact bounced address to `do_not_contact=true` at the lead level. Never retry the same address. |
| Soft bounce (full mailbox, transient) | Wait 48h, retry once. If it bounces again, treat as hard. |
| Spam-filter bounce (550 / 5.7.1 etc.) | Pause all sends from that sender domain for 24h. Investigate before resuming. |

**Never** resend to a hard-bounced address — even months later, even if the
domain looks healthy. The deliverability cost is real.

If the company has a real alternate address (different mailbox on the same
domain), that is a **new lead row** with the new address, not a re-send.

---

## 4. Audience rules — who we are allowed to email

Outreach is **business-to-business only**. Specifically:

- Targets must be a business inbox (info@, sales@, broker@, named-person@
  on a company domain).
- Personal addresses (gmail.com, yahoo.com, hotmail.com, aol.com, etc.) are
  acceptable **only** when the company itself publishes that address on
  their own website as the business contact (e.g., Maple Motors uses
  `maplemotors@aol.com` as their published business address).
- No consumer marketing. No B2C. No purchased lists. Ever.

We are not in jurisdictions or industries that require explicit opt-in for
B2B (this is not GDPR-only audience), but we operate under CAN-SPAM:
identifiable sender, real reply-to, accurate subject, opt-out honored.

---

## 5. Opt-out language is required

Every cold message includes the standard opt-out line from
`HUMAN_VOICE_RULES.md`:

> If this is not relevant, no worries — just tell me and I will not follow up.

The wording can vary lightly between FU1 and FU2 (the canonical strings live
in `OUTREACH_FOLLOWUP_TEMPLATES.md`) but the *intent* is always there:
recipient can reply with "no thanks" and the sequence ends.

Quality checks already enforce this — `checkMessageQuality()` flags missing
CTA / missing personalization. The fallback generator hard-codes the
opt-out line.

---

## 6. Stop the sequence the moment any of these happens

| Trigger | Action |
|---------|--------|
| Any reply at all | Stop the automated sequence. Manual handling only. |
| Reply classified as `not_interested` or `remove_me` | `do_not_contact=true`, all queued FUs cancelled. |
| Negative reply (rude, hostile, opt-out language anywhere) | Same as `remove_me`. |
| Hard bounce | `do_not_contact=true` on the bounced address. |
| Lead manually flagged DNC | All queued FUs cancelled. |
| Beta invited / demo booked | Sequence exits — separate beta workflow takes over. |

The `classify-outreach-reply` edge function already applies these for
common reply types. If a reply is ambiguous (e.g. "later"), do not
auto-DNC — leave it for founder review.

---

## 7. Track bounce rate and reply rate

Two metrics worth watching daily during beta:

- **Bounce rate** = bounced messages / sent messages (rolling 7 days). Goal:
  < 2%. Action threshold: > 10% triggers an immediate pause (see Rule 8).
- **Reply rate (any)** = inbound replies / sent messages (rolling 7 days).
  Healthy founder-led B2B cold range: 6–15%. Below 3% means the messages
  are either landing in spam or the voice/value-prop is off — investigate
  before scaling.

Use the admin dashboard's outreach metrics view or this SQL:

```sql
-- Bounce + reply rates, last 7 days
select
  count(*) filter (where status = 'sent')      as sent,
  count(*) filter (where status = 'bounced')   as bounced,
  count(*) filter (where status = 'replied')   as replied,
  round(
    count(*) filter (where status = 'bounced')::numeric
    / nullif(count(*) filter (where status in ('sent', 'bounced')), 0) * 100,
    2
  ) as bounce_pct,
  round(
    count(*) filter (where status = 'replied')::numeric
    / nullif(count(*) filter (where status = 'sent'), 0) * 100,
    2
  ) as reply_pct
from public.outreach_messages
where sent_at >= now() - interval '7 days';
```

---

## 8. Auto-pause if bounce rate > 10%

If the 7-day bounce rate crosses 10%, **stop all sends immediately** and
investigate. Likely causes, in order of probability:

1. Lead source was bad (purchased list, stale aggregator data) — purge
   that source's leads from the queue.
2. Sender domain is on a graylist — check `mxtoolbox.com` or similar for
   blacklist status; if listed, do not send while investigating.
3. SPF / DKIM / DMARC misconfigured on the sending domain — check DNS.

How to pause programmatically (admin):

```sql
-- Cancel everything currently in the queue, until pause is lifted
update public.outreach_messages
   set status = 'failed',
       meta = coalesce(meta, '{}'::jsonb) || jsonb_build_object(
         'paused', true,
         'paused_at', now()::text,
         'paused_reason', 'bounce_rate_over_10_percent'
       )
 where status = 'drafted' and approved = false;

-- And cancel due follow-ups so we do not double-send when we resume
update public.outreach_followups
   set status = 'cancelled', updated_at = now()
 where status = 'due';
```

Resume only after the underlying cause is fixed and the team has reviewed
which addresses survived the audit.

---

## 9. Do not scale until reply patterns are understood

Concretely, do not raise the daily limit beyond 10/day until **all** of the
following are true:

1. At least 14 calendar days of sends with bounce rate < 5%.
2. At least 5 inbound replies (any type) — not zero. Zero replies usually
   means we are in spam, even if the bounce rate is clean.
3. At least 1 reply was a "yes" or "tell me more" — meaning the message
   resonated with a real human, not just delivered.
4. Founder has read all replies and signed off on the voice / value-prop.

If any of those is false, the rate stays at 5–10/day. There is no penalty
for moving slowly during beta. There is a real penalty for moving fast
into spam folders.

---

## 10. One more reminder

The point of outreach during beta is conversation, not throughput. If you
ever find yourself reasoning about how to "send more, faster" — stop and
re-read this doc. The constraint is reputation, not effort.
