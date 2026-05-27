# Calendar Setup Checklist

**Owner:** Don Morrison
**Date:** 2026-05-27
**Purpose:** Action steps to activate the feedback call booking flow on TradeWind.

Until VITE_FEEDBACK_CALL_URL is set, all CTAs route to `/feedback` automatically.
Nothing breaks — this checklist just unlocks the direct booking flow.

---

## Step 1 — Create Cal.com account

- [ ] Go to `cal.com` and create a free account.
- [ ] Set your display name to "Don Morrison" and photo.
- [ ] Connect your Google Calendar (or iCloud) for availability sync.

---

## Step 2 — Create the event

- [ ] Click **New Event Type** → **One-on-one**.
- [ ] Set event title: `TradeWind Beta Feedback Call`
- [ ] Set duration: **10 minutes**
- [ ] Set buffer after event: **10 minutes**
- [ ] Set minimum notice: **4 hours**
- [ ] Set maximum days in advance: **14 days**

---

## Step 3 — Set availability windows

- [ ] Open availability settings for this event.
- [ ] Set Window 1: **9:00–10:00 am Pacific** (morning slot)
- [ ] Set Window 2: **3:00–4:30 pm Pacific** (post-lunch slot)
- [ ] Cap bookings per day at **2–3** across both windows.

---

## Step 4 — Add intake questions

Mark all 3 as **Required**:

- [ ] Question 1: *What kind of business are you in?*
  Options: Boat dealer, Aircraft broker, Auto dealer, Service shop, Buyer, Other
- [ ] Question 2: *What's the biggest pain point in how you reach qualified buyers or find inventory today?*
  Type: Free text (1–2 sentences)
- [ ] Question 3: *Is there a specific part of TradeWind you'd like to see during the call?*
  Type: Free text (optional label — ask them to answer anyway)

---

## Step 5 — Add event description

Paste into the booking page description field:

```
This is a 10-minute call with Don Morrison, founder of TradeWind.

Not a sales call. I'll show you the parts of the platform that are relevant
to your business and ask for honest feedback.

TradeWind is a premium marketplace and transaction platform for boats, autos,
and aircraft — built for dealers, brokers, and service providers who want
better tools for the full transaction, not just listings.

Bring questions. Tell me what's broken. That's the whole point.
```

---

## Step 6 — Copy the booking link

- [ ] Navigate to the event page in Cal.com.
- [ ] Copy the shareable link. It will look like:
  `https://cal.com/donmorrison/tradewind-beta-feedback`

---

## Step 7 — Add to Vercel as environment variable

- [ ] Go to Vercel dashboard → TradeWind project → Settings → Environment Variables.
- [ ] Add a new variable:
  - **Name:** `VITE_FEEDBACK_CALL_URL`
  - **Value:** *(paste your Cal.com link)*
  - **Environments:** Production, Preview
- [ ] Click Save.
- [ ] Trigger a redeploy (push a commit or use "Redeploy" in Vercel).

---

## Step 8 — Verify CTAs work

- [ ] Open `https://tradewind-marketplace.vercel.app/beta` after deploy.
- [ ] Click the primary CTA button — it should open your Cal.com booking page.
- [ ] Open `/feedback` — verify the feedback form still works independently.
- [ ] Check `/how-it-works` — verify any booking CTA there also resolves correctly.

---

## Step 9 — Test a booking end-to-end

- [ ] Book a test call using a different email address.
- [ ] Confirm the intake questions appear.
- [ ] Confirm the confirmation email lands.
- [ ] Check that the event appears on your connected calendar.
- [ ] Cancel the test booking.

---

## Fallback behavior (no action needed)

If `VITE_FEEDBACK_CALL_URL` is not set, the CTAs automatically route to `/feedback`.
The feedback form captures name, email, business type, and a message — enough
to qualify a lead and follow up manually.

Do not delay outreach waiting for the calendar to be set up. The fallback works.
