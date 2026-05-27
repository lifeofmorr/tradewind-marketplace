# Demo Booking Flow

**Owner:** Don Morrison
**Date:** 2026-05-27
**Purpose:** Convert "yes I'll take a look" into a scheduled 10-minute demo
without losing the lead in scheduling friction.

---

## The default reply

The moment someone signals interest, this is the reply. No deck attached, no
form, no Calendly wall.

```
Appreciate it. I can show you the useful parts in 10 minutes —
listings, buyer requests, deal rooms, and the dealer/broker side.
What's better for you, tomorrow or Thursday?
```

That's it. The shorter the better. Two options forces a decision.

If they bounce back with a different time, say yes. Don't fight the calendar.

---

## Qualifying questions (3 only)

Send these only if the prospect asks "what should I prepare?" or if they're
clearly senior and want to make the time count. Otherwise hold them for the
call itself.

1. **What does your typical buyer / seller flow look like today?**
   — Tells you which part of the platform to spend the most minutes on.
2. **Where do most of your listings (or leads) come from now?**
   — Tells you who they think of as competitors / partners. Names like
   BoatTrader, YachtWorld, AutoTrader, Controller, dealer networks.
3. **What's the most painful part of running that day-to-day?**
   — Tells you which TradeWind feature to anchor the demo on (Deal Room,
   Asset Passport, lead flow, partner integrations).

If they answer in the reply, great — pre-tailor the demo. If they don't,
ask question #1 in the first minute of the call.

---

## The calendar

The signature in every reply includes a calendar link as a fallback. Replace
`[CALENDAR_LINK]` everywhere it appears in the playbook with the live URL
before sending.

```
[CALENDAR_LINK]
```

Until the calendar is wired (see below), the manual fallback is:

```
If easier — I have openings tomorrow 10am, 2pm, and 4pm ET, or
Thursday 9am, 11am, or 3pm ET. Just reply with which works.
```

Pick three slots in each of two days. Three is enough — more options
delays the decision.

### Setting up the calendar (one-time)

- Use Cal.com or Calendly. 10-minute event type. Buffer of 5 min after.
- Title: "TradeWind — 10-minute walkthrough"
- Description: "Quick look at the dealer/broker side of TradeWind. We'll
  cover listings, buyer requests, deal rooms, and answer questions."
- Auto-add Google Meet link.
- Reminder: 1 hour before via email.
- Once live, put the URL in this doc, `REPLY_TO_DEMO_PLAYBOOK.md`, and the
  email signature.

---

## Confirmation message (after they pick a time)

Send this within an hour of them confirming. Keep it short — over-eager
confirms feel transactional.

```
Locked in for [DAY] [TIME] [TIMEZONE]. Sending a Google Meet
invite from don@lifeofmorr.com.

I'll keep it to 10 minutes — focus on the parts most relevant to
[COMPANY]. If anything changes, just reply here.

— Don
```

If they want a phone call instead of video:

```
Locked in for [DAY] [TIME] [TIMEZONE]. I'll call [PHONE].

I'll keep it to 10 minutes. If anything changes, just reply here.

— Don
```

---

## Day-of reminders

- **24 hours before:** No reminder needed for a 10-minute call — over-eager.
- **1 hour before:** Calendar reminder fires automatically. No additional
  email.
- **At the start time:** Join 1 minute early, share screen ready, browser
  on `https://tradewind-marketplace.vercel.app/beta`.

---

## If they no-show

Wait 5 minutes. Then send:

```
[FIRST] — just hopping off. No worries if today got away from
you. Want me to send another couple of slots later this week?

— Don
```

If no response within 48 hours, reply once more with two new
time options. After that, mark `follow_up_later` in the beta pipeline
and stop pushing.

---

## CRM updates after booking

When the demo is on the calendar:

1. Open `/admin/outreach` → Replies tab → find the lead.
2. Click "Add to beta pipeline" in the lead detail panel.
3. Set `stage` to `demo_booked` and `demo_date` to the scheduled time.
4. Mark `outreach_leads.demo_booked = true`.
5. Add a note: "Demo scheduled [DAY] [TIME] — pulled in via [reply trigger]."

After the demo:

1. Move `stage` to `demo_completed`.
2. Add `feedback_notes` capturing what they said.
3. Decide and set:
   - `real_listing_candidate` (boolean) — will they list?
   - `partner_candidate` (boolean) — service / partner integration?
   - `interested_in_paying` (boolean) — meaningful pricing signal?
4. Set `next_step` to one sentence ("send beta invite", "send partner
   doc", "follow up in 30 days").

See `BETA_ONBOARDING_CHECKLIST.md` for what happens once they say yes
to listing.

---

## What never to do

- Don't send a deck before the call. The demo IS the deck.
- Don't ask for a long discovery questionnaire. Three questions max.
- Don't reschedule more than twice. After two reschedules, ask if they'd
  prefer to revisit in 30 days.
- Don't follow up more than three times to book the demo. After three,
  set `follow_up_later` and move on.
- Don't oversell features that aren't shipped. If something isn't on
  `/beta` today, frame it as "on the roadmap" — never "coming soon."

---

## The one rule

The booking message is a yes/no question with two options. Everything
else — agenda, links, prep — happens in the *confirmation*, not the
initial reply. That is the whole flow.
