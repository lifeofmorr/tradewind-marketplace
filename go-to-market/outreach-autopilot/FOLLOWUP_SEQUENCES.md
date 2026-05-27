# Follow-Up Sequences — TradeWind 100 Campaign

Two follow-ups per lead, plus an optional close-the-loop. Voice rules
from `HUMAN_VOICE_RULES.md` apply. Every follow-up threads in the
recipient's inbox by reusing the original subject (`re: <subject>`).

This file is the **canonical templates for the TradeWind 100 campaign**.
The broader template library lives in `OUTREACH_FOLLOWUP_TEMPLATES.md` —
this file specializes for the 100-lead batch with the
`personalization_angle`-aware second-observation pattern.

---

## FU1 — Day +3 (business days) — "did this get buried?"

**Trigger:** First-touch sent, no reply within 3 business days, address
did not bounce, no opt-out signal in any inbound channel.

**Subject:** `re: <original subject>`

**Body (canonical text — interpolate `{first_name}` and
`{vertical_label}`):**

```
Hey {first_name} —

Quick bump in case my note from earlier this week got buried.

Still hand-picking the first set of {vertical_label}s into the TradeWind beta — free profile, free first listings, no fee until you see lead flow.

If a 5-minute look on your own time is useful, I will send the link. If not, no worries at all — just tell me and I will not follow up.

— Don
TradeWind
```

**Hard cap:** 70–100 words. No new claims. The ask is "send the link," not
"book a call."

**vertical_label mapping:**

| vertical            | label                                |
|---------------------|--------------------------------------|
| boat_dealer         | boat dealer                          |
| yacht_broker        | yacht broker                         |
| auto_dealer         | dealer                               |
| exotic_dealer       | exotic dealer                        |
| classic_dealer      | classic dealer                       |
| aircraft_broker     | aircraft broker                      |
| marine_surveyor     | surveyor                             |
| transport           | transport partner                    |
| lender              | finance partner                      |
| insurance           | insurance partner                    |
| escrow_title        | escrow / title partner               |
| ap_mechanic         | shop                                 |

---

## FU2 — Day +5–7 (business days) after FU1 — "last note from me"

**Trigger:** FU1 sent, no reply within 5 business days, no bounce, no
opt-out.

**Subject:** `one more on TradeWind`

**Body (canonical):**

```
Hey {first_name} —

Last note from me on this. {second_observation_or_repeat_value_one_line}

If you are slammed, totally get it. If timing is bad but you want me to circle back in {n_months_later}, just say "later" and I will save you for then. Otherwise I will close the loop here.

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
```

**Hard cap:** 100–130 words. The `{n_months_later}` token is "a couple of
months" by default — Don can override for a specific seasonal beat (e.g.
"after season" for FL boat brokers, "in the fall" for classic auto
dealers).

**`{second_observation_or_repeat_value_one_line}`** comes from the
lead's `personalization_angle` field. Use the *secondary* observation if
present; otherwise restate the core value prop in one sentence.

Example secondary observations from the 100-lead batch:

| vertical            | example second_observation                                                                 |
|---------------------|--------------------------------------------------------------------------------------------|
| yacht_broker        | "The Hatteras / Viking mix on your current page is exactly what our early buyers ask for." |
| classic_dealer      | "If a routed buyer for a 60s muscle car is interesting, I want you on the bench."          |
| aircraft_broker     | "Two buyers this week asked who they should call for a late-model Cirrus."                 |
| marine_surveyor     | "Three Tampa Bay closings in the last two weeks needed a SAMS surveyor."                   |
| ap_mechanic         | "Two recent Cirrus buyers asked who they should trust for pre-buy."                        |
| transport           | "Two FL→NC moves last week and we had nobody decent on the bench."                          |
| lender              | "Two boat buyers this week asked who would actually return their call on financing."        |
| insurance           | "Every closing kicks off a coverage question — I want a real answer."                       |
| escrow_title        | "Yacht closings have shown up; I do not want to wing the documentation side."               |

---

## Close-the-loop — Day +14 calendar days from FU2 — founder-discretion

**Trigger:** FU2 sent, no reply within 14 calendar days. **Optional** —
Don decides per-lead.

**Subject:** `closing the loop`

**Body (canonical):**

```
Hey {first_name} —

Not going to keep emailing. If it is a no — all good. If timing is bad but you want me to circle back in {n_months_later}, just say "later" and I will save you for then.

— Don
TradeWind
```

**Hard cap:** 40–70 words. No opt-out line (the whole message *is* the
opt-out). After this is sent (or skipped), the lead is marked
`next_action='loop_closed'` and removed from the active queue. Future
re-engagement is a separate campaign, not a follow-up.

---

## Stop conditions — NEVER send a follow-up if any of these are true

These are enforced both by the queue builder (`build-daily-queue` edge
function) and by the dashboard approval UI. Don should never have to
manually remember them.

| Condition                                                       | What stops                            |
|-----------------------------------------------------------------|---------------------------------------|
| Inbound reply with any content                                  | All queued FUs for the lead.          |
| Reply classified `not_interested` or `remove_me`                | Set `do_not_contact=true`; cancel queued FUs. |
| Hard bounce                                                     | Message → `bounced`; lead → `status='bounced'`; cancel queued FUs. |
| Opt-out language ("unsubscribe", "stop", "remove me", "do not contact", "take me off") in **any** inbound channel | Set `do_not_contact=true` immediately; cancel queued FUs. |
| Lead manually flagged `do_not_contact=true`                     | All queued FUs cancelled.             |
| `email_verification_status` flips to `bounced`, `invalid`, or `do_not_email` | All queued FUs cancelled.             |
| FU2 already sent + 14 days elapsed                              | Only Don can manually queue close-the-loop. |
| Campaign-wide hard-pause condition (see `30_DAY_SEND_SCHEDULE.md`) | All approvals disabled until cleared. |

To cancel queued follow-ups for a single lead:

```sql
update public.outreach_followups
   set status = 'cancelled', updated_at = now()
 where lead_id = '<uuid>'
   and status = 'due';
```

To cancel campaign-wide (emergency):

```sql
update public.outreach_followups
   set status = 'cancelled', updated_at = now()
 where status = 'due';
```

---

## Timing math (calendar approximation)

The current scheduler uses calendar days for simplicity:

| Event              | Due offset                            |
|--------------------|----------------------------------------|
| FU1                | first send + 3 calendar days           |
| FU2                | FU1 sent + 5 calendar days             |
| Close-the-loop     | FU2 sent + 14 calendar days            |

Move to business-day math when the proper scheduler ships.

---

## Voice rules recap (mirrored from HUMAN_VOICE_RULES.md)

- Short sentences. Plain English. One specific observation per message.
- No banned phrases ("circling back", "touching base", "leverage",
  "synergy", "world-class", etc.).
- Opt-out line on every FU except the close-the-loop.
- Subject lines lowercase, real-noun based, 3–6 words.
- Sign-off: `— Don\nTradeWind` on email; `— Don` on LinkedIn / IG DMs.
