# CRM Reply Update Rules — /admin/outreach

**Owner:** Don Morrison
**Date:** 2026-05-27
**CRM location:** `/admin/outreach` in the TradeWind admin dashboard

After every inbound reply, update the contact's row in `/admin/outreach` within 24 hours.
Rules below are authoritative — match CRM state exactly to what happened.

---

## Reply Type: interested

Contact replied positively and has not booked yet.

| Field | Value |
|---|---|
| **status** | `replied` |
| **beta_pipeline** | `interested` |
| **next_action** | Send calendar link or propose two times (tomorrow/Thursday) |
| **Gmail label** | `TradeWind/Interested` |

**Note:** If you've already proposed a time and they haven't confirmed, set next_action to `follow_up — confirm time`.

---

## Reply Type: wants_demo

Contact explicitly asked for a demo or a call.

| Field | Value |
|---|---|
| **status** | `replied` |
| **beta_pipeline** | `demo_requested` |
| **next_action** | Send calendar link immediately — same reply thread |
| **Gmail label** | `TradeWind/Interested` |

**Note:** Once they click the calendar link and book, update beta_pipeline to `demo_booked`.

---

## Reply Type: demo booked (calendar confirmation received)

Contact booked a time on your calendar.

| Field | Value |
|---|---|
| **status** | `demo_booked` |
| **beta_pipeline** | `demo_booked` |
| **next_action** | Prep `FIRST_DEMO_SCORECARD.md` with their name and vertical before the call |
| **Gmail label** | `TradeWind/Demo Booked` |

---

## Reply Type: not_interested

Contact declined, but no removal request.

| Field | Value |
|---|---|
| **status** | `not_interested` |
| **beta_pipeline** | `closed_lost` |
| **next_action** | None — do not re-contact unless they reach out first |
| **Gmail label** | `TradeWind/Not Interested` |

**Note:** Still eligible for a future send if you launch a materially different product feature. Do not suppress permanently.

---

## Reply Type: remove_me

Contact asked to be removed, unsubscribed, or complained.

| Field | Value |
|---|---|
| **status** | `dnc` |
| **beta_pipeline** | `dnc` |
| **next_action** | Remove from all future sends immediately. Add to suppression list before next batch. |
| **Gmail label** | `TradeWind/DNC` |

**This is permanent.** Do not re-add to any list. Do not send a follow-up other than the one-line removal confirmation.

---

## Reply Type: follow_up_later

Contact said "check back later", "busy right now", or gave a future date.

| Field | Value |
|---|---|
| **status** | `follow_up_later` |
| **beta_pipeline** | `nurture` |
| **next_action** | Set a specific follow-up date based on what they said. Add a note with their exact words. |
| **Gmail label** | `TradeWind/Follow Up Later` |

**Note:** If they gave a timeframe ("Q3", "after the boat show", "in 30 days"), convert it to an absolute date and put it in the follow-up date field.

---

## Reply Type: referral

Contact referred someone else or offered an intro.

| Field | Value |
|---|---|
| **status** | `replied` |
| **beta_pipeline** | `referred_out` |
| **next_action** | Thank them and ask for the intro to be made over email. Create a new CRM row for the referred contact. |
| **Gmail label** | `TradeWind/Interested` (keep the referrer warm) |

**Note:** The referred contact gets a new CRM row with `source = referral` and a note naming who referred them. Warm intro — treat as a higher-priority lead.

---

## Field Reference

| Field | Options |
|---|---|
| **status** | `sent` / `replied` / `demo_booked` / `not_interested` / `dnc` / `follow_up_later` / `bounced` |
| **beta_pipeline** | `new` / `interested` / `demo_requested` / `demo_booked` / `demo_complete` / `beta_invited` / `beta_active` / `closed_lost` / `dnc` / `nurture` / `referred_out` |
| **next_action** | Free text — one specific, dated action |

---

## Timing

- **Within 1 hour:** DNC and remove_me updates (before any scheduled send runs)
- **Within 24 hours:** All other reply types
- **Before each send batch:** Verify all DNC/Bounced contacts are suppressed
