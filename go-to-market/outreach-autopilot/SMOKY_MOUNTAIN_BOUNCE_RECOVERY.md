# Smoky Mountain Traders — Bounce Recovery Pack

**Date:** 2026-05-26
**Lead status:** `bounced` (info@smokymountaintraders.com rejected today's send)
**Do-not-contact:** **false** — the *address* bounced, not the company. The
business is in-vertical for TradeWind.

---

## What we know about the company

- **Website:** https://www.smokymountaintraders.com/
- **Vertical:** Classic / muscle car dealer (1960s–70s muscle cars, street
  rods). Solidly in-vertical for TradeWind.
- **Physical address:** 2520 S Carver Rd, Maryville, TN
- **Phone:** (865) 988-8088
- **Owner:** Keith Bledsoe
- **Working alternate email (public listings):** `sales@smtclassics.com`
  — different domain (likely their CRM / lead-routing inbox), but
  consistently listed as their business email across Yelp, BBB, Classics on
  Autotrader, and Collector Car Nation.
- **Contact form:** https://www.smokymountaintraders.com/contact
- **Social:** Facebook (Smoky Mountain Traders)
- **BBB profile:** https://www.bbb.org/us/tn/maryville/profile/classic-car-dealers/smoky-mountain-traders-inc-0533-90010448

The bounced `info@smokymountaintraders.com` is almost certainly an unused
forwarder. The dealer's actual lead inbox is on a sister domain
(`smtclassics.com`).

---

## Recommended next move (pick one, do not blast all)

| Rank | Channel | Address / URL | Why |
|------|---------|---------------|-----|
| 1 | Email | `sales@smtclassics.com` | Published business email across multiple third-party directories. Owner-operated shop — owner Keith Bledsoe likely reads this inbox personally. |
| 2 | Phone | (865) 988-8088 | If email is silent after 5–7 days. Small dealer, real person picks up. |
| 3 | Contact form | https://www.smokymountaintraders.com/contact | Last resort. Cold-blast forms typically dead-end at junk folders. |

Recommendation: send the email below to `sales@smtclassics.com` after Don's
approval. Wait 5–7 days. If no reply, call Keith directly using the phone
script.

---

## Draft — Corrected-contact email (`sales@smtclassics.com`)

```
Subject: correcting an earlier note to Smoky Mountain Traders

Hi Keith —

I sent a note this morning to info@smokymountaintraders.com that bounced, so I am trying the email on your dealer listings instead. Apologies for the second touch.

I am Don Morrison, founder of TradeWind. We are a marketplace for boats, autos, and aircraft, currently in private beta. The reason I picked your shop: Smoky Mountain Traders is one of the few dealers in the region with a deep, hand-picked muscle car inventory — that's the kind of inventory I want on the platform early.

Dealers on TradeWind get a verified profile, AI-built listing copy from your existing photos and notes, and inbound buyer requests routed to the kinds of cars you actually carry. Free for 60 days during beta. No fee until you see real lead flow.

Would you be open to a quick 10-minute look and giving honest feedback?

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
don@lifeofmorr.com
```

**Why it is shaped this way**
- Opens by naming the bounce — turns a second touch into a polite correction, not spam.
- Specific observation (hand-picked muscle car inventory, owner-operated) so it does not read as a blast.
- Acknowledges the size of the shop: small dealer, owner-operated — keep the ask small.
- Required opt-out line included verbatim.

---

## Phone script (only if email is silent after 5–7 days)

> "Hi, is this Keith? — Don Morrison. I emailed your sales inbox last week about TradeWind, the new marketplace for boats, autos, and aircraft. Not sure if it landed. I'm picking a small number of classic car dealers for private beta and Smoky Mountain Traders came up. Got 60 seconds?"

If yes: 1-sentence pitch → ask to send a 5-minute walk-through link.
If no:  "No worries, thanks for picking up — have a good one."

---

## What NOT to do

- ❌ Do **not** resend to `info@smokymountaintraders.com`. The address is on
  the bounced list and stays there permanently.
- ❌ Do **not** mass-blast `sales@smtclassics.com` — it is one address, one
  human, one shot.
- ❌ Do **not** scrape personal email from BBB / Yelp profiles. The
  published business email is the right channel.

---

## Tracking

- The lead row was updated to `status='bounced'`,
  `next_action='research_corrected_contact'`. `do_not_contact` is left
  **false** (the company is fine; only the address is dead).
- The email-verification migration sets
  `invalid_email_address='info@smokymountaintraders.com'` and
  `email_verification_status='bounced'`, which prevents the daily queue
  from picking it up again until a verified address replaces it.
- When `sales@smtclassics.com` is confirmed as a working contact (reply
  received or first email lands without bounce), add it as a **new lead
  row** with `email_verification_status='verified'` — do not mutate the
  existing row's email, so the bounce history stays intact.
