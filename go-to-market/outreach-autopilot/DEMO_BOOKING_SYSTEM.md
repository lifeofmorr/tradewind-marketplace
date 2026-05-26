# Demo Booking System

How a reply turns into a booked 10-minute demo, and how the demo turns into a beta signup or partner call.

---

## Stage 1 — They replied positively

Use Reply Template #3 from `REPLY_HANDLING_SYSTEM.md`. Ask three qualifying questions before sending the calendar link:

### The three qualifying questions

For a **dealer / broker:**
1. How many [boats / cars / aircraft] do you typically have live at any given time?
2. Where do most of your buyers find you today?
3. What's the #1 thing about your current setup that costs you the most time?

For a **service provider:**
1. What service(s) do you offer that you'd want buyers routed for?
2. Geo coverage — what regions do you actually cover?
3. What's the biggest bottleneck in getting new buyer/owner clients today?

For a **lender / insurance / escrow:**
1. What asset categories do you write/finance/close?
2. What's a typical deal size you're looking for?
3. What's your current lead source mix, and what would you want from a partner like us?

For a **transport:**
1. What lanes do you run regularly?
2. Asset types (boats, exotics, aircraft ferry)?
3. Where do empty backhauls hurt you the most?

---

## Stage 2 — Send the calendar link

Once they answer, send:

```
Hey [First] —

Perfect, that's helpful. Grab a 10-minute slot here: [CALENDAR LINK PLACEHOLDER — replace with Cal.com or Google Calendar appointment link]

Zoom link will land in the calendar invite.

— Don
```

**Where the calendar link lives:** for now, `https://cal.com/donmorrison/tradewind-demo` (placeholder — wire to actual Cal.com or Google Calendar Appointment Scheduling link when set up).

---

## Stage 3 — Pre-demo notes (Don, day-of)

15 minutes before the call, Don opens the lead in `/admin/outreach` and reviews:

- The personalization angle from their CRM row
- The three qualifying answers
- Their website + most recent listing/post
- The vertical-specific sequence used (so we don't repeat what's in the emails)

Write 3 lines of notes into the `Notes` field:

```
Pre-demo notes (YYYY-MM-DD):
- Pain point: [from their answers]
- Demo focus: [the 1-2 features that map to their pain]
- Beta ask: [exact offer we'll make at the end of the call]
```

---

## Stage 4 — The 10-minute demo format

| Minute | What |
|---|---|
| 0:00 – 0:30 | "Thanks for the time. Honest 10 minutes — I'll show you the platform and you tell me what's missing." |
| 0:30 – 2:00 | Confirm their pain point in their own words. "You said X — let me show you the part of the platform that addresses that." |
| 2:00 – 6:00 | Live walk-through of the relevant surface: dealer profile, listing creation flow, buyer requests inbox, AI listing copy, or service profile + buyer requests. Show, don't tell. |
| 6:00 – 7:30 | One question: "What's the part of this that's worth your time vs. what's noise for you?" |
| 7:30 – 9:00 | The beta offer (see `BETA_CONVERSION_SYSTEM.md`). Free 60 days, free first 10 listings, no fee until lead flow, early pricing lock. |
| 9:00 – 10:00 | One clear next step: "If yes, I send you the onboarding invite today. If you want to think about it, I follow up in 3 days." |

---

## Stage 5 — Post-demo follow-up (same day)

Within 2 hours of the demo, send:

```
Subject: thanks for the time

Hey [First] —

Quick recap of what we talked through:

- [The 1-2 features they reacted to]
- [The beta offer: free 60 days, free first 10 listings, early pricing lock, no fee until lead flow]
- [Next step they agreed to]

Onboarding link: [private invite link]

If you want a second pair of eyes on anything before you commit, I'm a reply away.

— Don
TradeWind
```

Update CRM:
- `Demo Booked? = Yes`
- `Beta Invited? = Yes` (if they said yes verbally)
- `Notes`: paste the recap
- `Next Action`: "Wait for onboarding completion" or "Follow up in 3 days"

---

## Stage 6 — If they didn't say yes on the call

Send the post-demo follow-up the same day. Then:

- **+3 days, no response:** one nudge: "Hey [First] — any leftover questions from the demo? Happy to address them or get out of your way."
- **+7 days:** the close-the-loop email.
- **No response after that:** mark `Beta Invited? = No`, `Status = Demo Cold`, park for 90 days.

---

## Stage 7 — If they said yes → handoff to onboarding

See `BETA_CONVERSION_SYSTEM.md` for the onboarding steps.

---

## Cancellations and reschedules

- Auto-allow rescheduling via the calendar link.
- If they no-show: wait 1 hour, send one message: "No worries — life happens. Want to grab another slot? [link]"
- After 2 no-shows, downgrade the lead score by 1 and stop pursuing actively for 30 days.

---

## Demo metrics to track

In the CRM `Notes` field after each demo, log:

- `Demo outcome:` (Beta yes / Beta no / Thinking / Partner instead)
- `Top objection:` (one line)
- `Most-reacted feature:` (one line)
- `Would they pay:` (Yes / Maybe / Not yet / No)

Weekly review these to tune the sequence library and the demo script itself.
