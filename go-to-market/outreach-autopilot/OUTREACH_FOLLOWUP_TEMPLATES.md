# Outreach Follow-Up Templates

Two follow-ups per lead, then a close-the-loop. Voice rules from
`HUMAN_VOICE_RULES.md` apply — short sentences, no buzzwords, opt-out line.
Every follow-up must reference the original message implicitly (subject =
`re: <original subject>`) so it threads in the recipient's inbox.

These are the canonical strings. The TS module
`src/lib/outreach/followupTemplates.ts` produces the same text
programmatically for the queue builder. If you edit a string here, mirror the
change in code.

---

## FU1 — Day +3 business days, no reply

**Subject:** `re: <original subject>`

**Body:**

```
Hey {first_name} —

Quick bump in case my note from earlier this week got buried.

Still hand-picking the first set of {vertical_label}s into the TradeWind beta — free profile, free first listings, no fee until you see lead flow.

If a 5-minute look on your own time is useful, I will send the link. If not, no worries at all — just tell me and I will not follow up.

— Don
TradeWind
```

Notes:
- Hard cap: 70–100 words.
- No new claims, no new asks beyond "send the link."
- Opt-out line baked into the body (slightly varied wording so it does not look auto-generated).

---

## FU2 — Day +5–7 business days after FU1, no reply

**Subject:** `one more on TradeWind`

**Body:**

```
Hey {first_name} —

Last note from me on this. {second_observation_or_repeat_value_one_line}

If you are slammed, totally get it. If timing is bad but you want me to circle back in {n_months_later}, just say "later" and I will save you for then. Otherwise I will close the loop here.

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

Notes:
- Hard cap: 100–130 words.
- Use the `{second_observation_or_repeat_value_one_line}` slot for the
  founder's actual observation (new specific thing) if one is on file, or a
  one-line restatement of the original value prop.
- The "say later" line is what pulls the most replies in the existing
  sequence library — keep it.

---

## Close-the-loop — Day +14 from FU2, still no reply (optional, founder-discretion)

**Subject:** `closing the loop`

**Body:**

```
Hey {first_name} —

Not going to keep emailing. If it is a no — all good. If timing is bad but you want me to circle back in {n_months_later}, just say "later" and I will save you for then.

— Don
TradeWind
```

Notes:
- 40–70 words.
- No opt-out line needed (the entire message *is* the opt-out).
- After this, mark the lead `next_action='loop_closed'` and stop scheduling.

---

## Stop rules — when to NEVER send a follow-up

Stop the sequence the moment any of these is true:

| Trigger | Stop after |
|---------|------------|
| Reply received (any content) | Always — manual handling from here. Do not send a queued FU. |
| Reply classified `not_interested` or `remove_me` | Set `do_not_contact=true`. Cancel all queued follow-ups. |
| Bounce | Set the message status to `bounced` and the lead `status='bounced'`. Do **not** retry the same address. |
| Opt-out language ("unsubscribe", "stop", "do not contact", "remove me", "take me off") in any inbound message | Set `do_not_contact=true`. Cancel all queued follow-ups. |
| Lead flagged `do_not_contact=true` manually | Cancel all queued follow-ups for that lead. |
| FU2 already sent and not yet replied to | Do not auto-queue FU3 — close-the-loop is founder-discretion only. |

The build-daily-queue function already excludes `do_not_contact=true` and
statuses `replied / demo_booked / beta_invited`, so once the lead state is
updated, no further drafts will appear.

To cancel queued follow-ups for a lead manually:

```sql
update public.outreach_followups
   set status = 'cancelled', updated_at = now()
 where lead_id = '<uuid>'
   and status = 'due';
```

---

## Timing — business-day math

| Event | Due date |
|-------|----------|
| FU1 | First send + 3 business days |
| FU2 | FU1 sent + 5 business days |
| Close-the-loop | FU2 sent + 14 calendar days |

The current queue builder uses calendar days (`+3 days`) — close enough for
v1. When we move to a proper scheduler, switch to business-day math.
