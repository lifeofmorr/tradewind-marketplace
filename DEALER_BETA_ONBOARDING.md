# Dealer Beta Onboarding Guide

Welcome to TradeWind's private beta. This guide gets you from signup to your first published listing in under 30 minutes.

## What we're asking of you

During beta, you'll:
- Build out your dealer profile and add 5–20 real (or representative) inventory items.
- Use the leads inbox like you would a normal lead source.
- Tell us what's broken, confusing, or missing — bluntly. That feedback is the entire point of this phase.

In return: free access through the public-launch transition, founding-dealer placement on the dealers index, and direct access to the founder for product input.

## Step 1: Create your account

1. Open the signup link we sent you. It looks like:
   `https://[your-tradewind-domain]/signup?role=dealer`
2. Use a real business email — that becomes your login.
3. Verify your email when Supabase sends the confirmation.

If the link didn't include `?role=dealer`, that's fine — pick "Dealer" on the role selector after signup.

## Step 2: Complete dealer onboarding

After first login you'll land on `/onboarding/dealer`. Fill in:
- **Business name**, address, phone, website.
- **Category mix** (boats / autos / both) and rough inventory size.
- **Brands carried** — pick the major ones; you can add more later.
- **Service area** — states or radius from your primary lot.
- **Logo and cover image** — square logo (≥ 512px) and a wide cover (1600×600 ideal).

This screen feeds your public dealer page at `/dealers/your-slug`.

## Step 3: Add inventory

Go to `/dealer/inventory` and click **Add listing**.

For each unit:
- Title, year/make/model, condition.
- Price (asking) and "willing to negotiate" toggle.
- Photos: minimum 5, ideally 10+. First photo is the hero — make it count.
- Specs: length/HP/hours for boats; mileage/trim/drivetrain for autos.
- Location (zip code, marina/lot name if relevant).
- Description: write like a person, not a brochure. 3–6 short paragraphs is the sweet spot.

Tip: the **Cost-to-own** and **Deal Score** widgets on the listing detail page pull from your specs and price. The more complete the listing, the better those signals look to buyers.

## Step 4: Tune your dealer profile

`/dealer/profile` — write a 2–3 paragraph "About us" that names a real human (you), your years in the business, and what you stand for. Buyers respond to specificity ("we've been on the same dock since 2009") far more than slogans.

Add team members if you have a sales team. Each shows up on your dealer page with a photo and direct contact button.

## Step 5: Watch the leads inbox

`/dealer/leads` shows every inquiry routed to you, with:
- Buyer's name, contact preference, and budget range (when shared).
- A **Lead quality** badge — green/amber/red based on completeness and engagement.
- The **Follow-up assistant** which drafts a first reply you can edit and send.

Reply within an hour during business hours if you can. Beta buyers are more patient than public-launch buyers, but speed of first response is the single biggest predictor of close rate in our pilot data.

## Step 6: Use analytics weekly

`/dealer/analytics` shows views, saves, and lead volume per listing. Look for:
- Listings with high views but few leads → price or photos likely off.
- Listings with high saves but few leads → buyers are interested but stuck. Check for missing specs or unclear next-step CTA.
- The Market Pulse card → benchmark your asking prices against comparable inventory.

## What to expect during beta

- Buyers will trickle in, not flood. We're seeding cohorts deliberately.
- Some features (concierge requests, AI-drafted replies) require manual admin help while we tune them — your inbox may show "pending admin assignment" briefly.
- We may reset demo accounts overnight. Your real dealer account and listings are persistent — never seeded.
- We'll ask for a 15-minute call in week 2 and week 4. That's it for synchronous time.

## Reporting issues

Use the bug template at `BUG_REPORT_TEMPLATE.md`. Email it to the address in your welcome note. For anything urgent (you can't list, can't log in, lead inbox blank when it shouldn't be), text the founder directly — that number is in the welcome note.

## Things that aren't done yet

See `KNOWN_LIMITATIONS.md` for the honest list. The biggest one for dealers: transactional email isn't routed through our domain yet, so buyers contacting you via the in-app message thread will see notifications come from a Resend address. We'll cut that over before public launch.

Welcome aboard.
