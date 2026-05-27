# Calendar Setup Guide — TradeWind Beta Feedback Call

**Owner:** Don Morrison
**Date:** 2026-05-27
**Status:** Pending — drop in your calendar link, then set VITE_FEEDBACK_CALL_URL

---

## Event Configuration

| Field | Value |
|---|---|
| **Event name** | TradeWind Beta Feedback Call |
| **Duration** | 10 minutes |
| **Buffer after** | 10 minutes |
| **Daily availability** | 2 windows/day (see below) |
| **Minimum notice** | 4 hours |
| **Max days out** | 14 days |

### Recommended availability windows

Pick two non-adjacent slots so you have breathing room:

- **Window 1:** 9:00–10:00 am Pacific (morning slot)
- **Window 2:** 3:00–4:30 pm Pacific (post-lunch slot)

Limit to 2–3 bookings per day across both windows so calls don't stack into a full day of demos.

---

## Pre-Booking Questions (3 required)

Configure these as required fields on the booking page:

1. **What kind of business are you running?**
   *(Boat dealer / aircraft broker / auto dealer / service shop / buyer — other)*

2. **What's the biggest pain point in how you reach qualified buyers or find inventory today?**
   *(Free text, 1–2 sentences)*

3. **Do you currently list on any other marketplaces?**
   *(Yes — which ones? / No / Evaluating options)*

These run on Supabase `beta_feedback` and `beta_leads` via the admin inbox. They tell you in advance whether to run a listing-side or buyer-side demo.

---

## Event Description (shown on booking page)

```
You'll spend 10 minutes with Don Morrison, TradeWind's founder.

No slide deck. I'll show you the parts of the platform most relevant
to your operation — listings, buyer requests, deal rooms, or the
service-partner side, depending on what you do.

This is a feedback call, not a sales call. TradeWind is in private
beta and we're building it with our first partners. Your honest
read on what's useful (or not) is the point of this call.

Bring questions. Come as you are.
```

---

## Calendar Link Placeholder

**Your booking link goes here:**

```
[CALENDAR_LINK]
```

Once you have it:
1. Paste it into `.env.local` (development) and your hosting env (production):
   ```
   VITE_FEEDBACK_CALL_URL=https://cal.com/donmorrison/tradewind-feedback
   ```
2. The "Book 10-Minute Feedback Call" button on `/beta` and in BetaCTA will immediately open the link in a new tab.
3. If unset, the button falls back to `/feedback` — no dead link.

---

## Recommended Providers

### Cal.com (preferred)

- Open source, honest free tier, clean booking UI
- Custom questions included on free plan
- Self-hostable if you want full control later
- Setup: cal.com → New event type → "10 min" → configure questions → copy link

### Calendly (acceptable fallback)

- Use only if you already have an active account
- Free tier restricts custom questions on new event types — you'll need their paid plan to get all 3 questions
- Booking link format: `calendly.com/your-handle/tradewind-feedback`

---

## After Each Call

- Log the call in `/admin/outreach` — update status to `demo_booked` → `demo_complete`
- Fill out `FIRST_DEMO_SCORECARD.md` within 30 minutes while it's fresh
- Send the matching template from `POST_DEMO_NEXT_STEPS.md` same day
