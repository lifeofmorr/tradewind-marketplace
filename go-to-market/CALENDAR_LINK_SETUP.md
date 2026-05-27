# Calendar Link Setup — "Book 10-Minute Feedback Call"

Last reviewed: 2026-05-27

The /beta page and the BetaCTA component show a **Book 10-Minute Feedback
Call** button. The button reads `VITE_FEEDBACK_CALL_URL` at build time:

- **Set** → button opens that URL in a new tab (with `target="_blank"`
  and `rel="noopener noreferrer"`).
- **Unset / empty** → button routes to `/feedback` (the existing form).
  Never a dead link.

This doc captures the recommended setup so the URL we drop in is the
right one. The goal is a low-friction 10-minute slot that doesn't make
the visitor feel like they're booking a sales call.

---

## Recommended provider

**Cal.com (preferred)** — open-source, clean defaults, good free tier,
honest about pricing.

**Calendly (acceptable fallback)** — only if you already use it and
don't want a new account. Their free tier hides custom questions on
new event types, which we want.

Either way, the URL we paste into `VITE_FEEDBACK_CALL_URL` must:
- Open directly to the booking grid (not a profile page).
- Show real availability for the next 14 days.
- Not require the visitor to log in.

---

## Event configuration

| Field            | Value                                                      |
|------------------|------------------------------------------------------------|
| Event name       | TradeWind — 10-Minute Feedback Call                        |
| URL slug         | `tradewind-feedback` (Cal.com) / `feedback` (Calendly)     |
| Duration         | **10 minutes**                                             |
| Buffer before    | 5 minutes                                                  |
| Buffer after     | **10 minutes** (so you can write notes between calls)      |
| Min notice       | 4 hours                                                    |
| Daily cap        | 4 calls / day                                              |
| Weekly cap       | 12 calls / week                                            |
| Availability     | Mon–Thu, 9am–4pm Pacific. Avoid Friday + weekends.         |
| Location         | Google Meet (auto-generated link)                          |
| Time zone        | Detect from visitor (default Pacific)                      |
| Reminders        | Email 1 hour before · SMS 15 min before (if number given)  |
| Confirmation     | "I'll see you on the call — Don"                           |
| Reschedule       | Allowed up to 2 hours before                               |
| Cancel           | Allowed any time                                           |

---

## Pre-booking questions

Cal.com → "Booking Questions". Calendly → "Invitee Questions". Add:

1. **Name** — required.
2. **Email** — required.
3. **Company** — required.
4. **Your role** — required (e.g. "Owner", "Sales manager", "Broker").
5. **Which best describes you?** — required, single-select:
   - Marine dealer / yacht broker
   - Auto / specialty / exotic dealer
   - Aircraft broker
   - Service provider (survey / inspection / repair / detail / transport)
   - Lender / insurance / escrow
   - Serious buyer
   - Other
6. **What's the one thing you want to walk through?** — optional, long-text.
   (Lets you prep the demo. Tie it to the AdminBetaInbox "Prepare demo"
   card.)
7. **How did you hear about TradeWind?** — optional, short-text. Helps
   attribute beyond UTM.

Do **not** ask for phone number on the booking form — it gates the
flow. Capture it only on the call itself if relevant.

---

## After-booking automation

- Webhook → POST to a Supabase Edge Function that flips the matching
  `outreach_leads.demo_booked = true` (match by email).
- Webhook → insert a row into `admin_notifications` with
  `type='demo_booked'` so the admin shell pings you immediately.
- Confirmation email → from Don's address, plain text, signed `— Don`.
  No "Powered by Cal.com" footer (toggle in branding settings).

(Webhook wiring is out of scope for the inbound capture build — see
the AdminBetaInbox demo-prep card in the meantime.)

---

## Paste the URL

Once the event exists, paste the public booking URL into your env:

```bash
# .env.local
VITE_FEEDBACK_CALL_URL=https://cal.com/donmorrison/tradewind-feedback

# Vercel → Project Settings → Environment Variables (Production + Preview)
VITE_FEEDBACK_CALL_URL=https://cal.com/donmorrison/tradewind-feedback
```

Then redeploy. The button on /beta and the BetaCTA fall back to
`/feedback` if the variable is empty — so partial / mistaken setup
never produces a dead link, just the existing feedback form.
