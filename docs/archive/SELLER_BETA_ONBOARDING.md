# Private Seller Beta Onboarding

If you're a private seller (one boat or one car, not a dealership), this is your shortest path to a live listing.

## Why we picked you

You've got a single high-quality unit and you're willing to give us blunt feedback. That's exactly what we need to test the seller flow against the real-world friction of selling something you actually own and care about.

## Step 1: Sign up

Open the signup link we sent. It includes `?role=seller`. If it doesn't, choose "Sell something I own" on the role selector.

Use the email you actually check. Verify when Supabase sends confirmation.

## Step 2: Choose your sell flow

You have three entry points:
- `/sell` — the seller hub with both options.
- `/sell-my-boat` — guided boat-listing flow.
- `/sell-my-car` — guided auto-listing flow.

Either of the second two will deep-link you into `/seller/listings/new` with the right category preselected.

## Step 3: Build the listing

Click through `/seller/listings/new`. The form is short on purpose — better to publish and edit than to perfect it.

Required fields:
- Title (e.g., "2018 Boston Whaler 230 Outrage — Single Owner, Garaged")
- Year, make, model.
- Asking price. Toggle "open to offers" if you want the offer-builder enabled.
- Location (zip).
- 5+ photos. The first is the hero. Shoot in daylight, three-quarter angle, clean unit, no clutter.

Recommended fields:
- Hours/miles, condition rating, recent service.
- A 4-paragraph description: what it is, what you've done to it, why you're selling, what's included.

Hit **Publish** when you're happy. Your listing goes to the admin queue and is usually live within an hour during beta.

## Step 4: Manage inquiries

`/seller/inquiries` is your inbox. Each inquiry shows the buyer's name, message, and any context (financing pre-approval, inspection request) they've attached.

You can:
- Reply directly in-thread.
- Mark as serious / not serious — affects your future quality signals.
- Hand the lead to a partner dealer if you'd rather offload (this is rare during beta).

## Step 5: Auctions (optional)

If your unit is a candidate for auction:
- `/seller/auctions` lets you create a timed auction off an existing listing.
- Set reserve, start price, and duration (3, 7, or 14 days).
- Admin approves auction setups during beta — figure on a few hours.

## Step 6: Adjust based on signals

`/seller/listings/:id` shows views and saves. If you've been live for a week with high views and zero inquiries, the most likely culprit is price. Second most likely: photo 1.

You can edit the listing any time — there's no penalty for re-publishing.

## What you can expect

- Most beta buyers are warm — they came in through a TradeWind cohort, not random internet traffic.
- Inquiries trickle, not flood. 1–3 inquiries per week on a well-priced unit is realistic during beta.
- You can always pause your listing (save as draft) without losing anything.

## Things that aren't done yet

See `KNOWN_LIMITATIONS.md`. For sellers, the biggest gaps are:
- No native escrow yet — final transactions happen via the channels you already trust (cashier's check, bank wire, etc.).
- Transport partners are real but the routing layer is manual during beta — admin will broker if a buyer wants delivery.

## Reporting issues

`BUG_REPORT_TEMPLATE.md`. Email it. Text the founder for anything urgent. The phone number is in your welcome note.

Thanks for trusting us with something you actually own. We won't waste your patience.
