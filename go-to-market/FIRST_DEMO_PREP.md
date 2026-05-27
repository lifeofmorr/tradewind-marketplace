# First Demo Prep

**Owner:** Don Morrison
**Date:** 2026-05-27
**Purpose:** What Don should do the first time someone says "yes, walk me
through it." This is the demo before muscle memory takes over.

This is a 10-minute live walkthrough of `https://tradewind-marketplace.vercel.app/beta`.
You are the founder, not a sales engineer, not a product marketing manager.
Act like one human inviting another into something you're building.

For the minute-by-minute, see `TRADEWIND_10_MINUTE_DEMO_SCRIPT.md`. This
doc covers the things that aren't in the script: the framing, the things
you must not say, and the asks that turn a demo into a beta participant.

---

## Opening line (exact)

> "Thanks for the time. I'm Don — I'm building TradeWind. I'd rather use
> 10 minutes to show you the parts that might matter for [COMPANY] than
> walk through a generic deck. Cool to start with what your day looks
> like, or do you want me to drive?"

That opens with respect, sets the time box, and invites them to redirect
the demo. Most will say "you drive."

---

## What to say (themes, not lines)

- **Premium calm.** No "super excited", no "absolutely game-changing", no
  "the future of \[anything\]". The product carries that weight — your
  voice doesn't need to.
- **Concrete examples over abstractions.** "When a buyer requests a
  pre-buy on this aircraft listing" beats "we have a workflow."
- **Their vertical first.** Dealer? Open the dealer dashboard. Aircraft
  broker? Open an aircraft listing. Service provider? Open a request
  thread.
- **Honest stage.** "Live beta," "small group of first dealers," "we're
  seeding inventory while real listings come in." Don't pretend to be
  bigger than you are.

---

## What NOT to promise

- No traction numbers that don't exist. No invented user counts, deal
  volumes, GMV, partner names, or institutional logos.
- No specific launch dates ("public launch in Q3"). Always say
  "when it's ready" or "after beta."
- No custom feature commitments on the call. If they ask "can you do X
  for us?" the answer is: *"Worth capturing — let me note it. I won't
  promise on the call, but if it lines up with what other beta
  partners are saying, it moves up the list."*
- No pricing promises below the standard beta terms. The terms are
  60 days free, first 10 listings included, no card.
- No "we beat \[competitor\] on every dimension." That's never true and
  it's never necessary. Pick the two or three places where TradeWind
  is meaningfully different and stop there.
- No exact partner integration dates (Plaid, VIN, partner APIs). Frame
  these as "credential-ready" — the work is wired, partner integration
  goes live in the order partner demand demands.

---

## What to ask

Three questions, in order. Each one tells you something the others
can't.

1. **"What does your day-to-day buyer/seller flow look like today?"**
   Reveals which TradeWind feature actually matters to them. Listen
   for the verb they use the most ("juggle", "chase", "manually
   resend", "lose").

2. **"Where do your listings / leads come from right now?"**
   Reveals which competitors they think in. BoatTrader, YachtWorld,
   Controller, dealer networks, AutoTrader, direct walk-ins. Adjust
   the comparison talking points accordingly.

3. **"If TradeWind reduced one of those pains, which would matter
   most?"**
   Reveals where to spend the deep two minutes of the demo (minutes
   6:00–8:00, role-specific view).

---

## What feedback to capture

Open `/admin/outreach`, find the lead, and into the beta_pipeline row's
`feedback_notes` field, capture:

- **One feature that resonated** — the thing they said "oh, that's
  useful" or "huh, that's interesting" to.
- **One feature that confused them or felt off** — the thing they
  asked a follow-up question about or paused on.
- **Their typical deal volume and average price** — only if they share
  it. Don't push.
- **Where they currently source / list** — names of platforms,
  networks, partners.
- **Pricing reaction** — positive (lock me in), neutral (sure, makes
  sense), negative (too high / unclear / not interested).
- **Whether they'd refer a peer** — note any names mentioned.

Then set the booleans on the beta_pipeline row:

- `real_listing_candidate` — willing to list real inventory.
- `partner_candidate` — fit for partner / service integration.
- `interested_in_paying` — meaningful pricing signal post-beta.

And the next stage:

- Said "yes, list me" → `beta_invited`
- Said "yes, integration" → `partner_candidate`
- Said "I want to think about it" → `follow_up_later`
- Said "not a fit" → `not_interested`
- Said "take me off" → `declined` + `outreach_leads.do_not_contact = true`

---

## How to handle pricing questions

If they ask during the demo: **defer.**

> "Short version: beta is free for 60 days, first 10 listings on us. No
> card. After beta we move to a per-listing + optional premium
> placement model, and everyone who joins in beta locks in
> early-adopter rates. I'd rather show you the value first — pricing
> will land if the demo does."

If they push for specifics:

> "Per-listing pricing is being calibrated to where dealer and broker
> margins actually live — meaningfully below what AutoTrader,
> BoatTrader, and Controller charge for premium placement. Specific
> rates will be locked before we exit beta and I'll show you the
> sheet before then."

Never give a specific dollar amount on the first call.

---

## How to explain demo inventory vs real

When they ask "are these real?" — be honest:

> "Mix. Most of what you're seeing on /beta is curated demo inventory
> we built so the experience feels real while we onboard the first
> dealers. A handful are real listings from seed partners. That's
> partly why I'm reaching out — we want a small group of dealers and
> brokers to list real inventory during beta. Your unit would be one
> of the first."

This turns the honest answer into the ask.

---

## How to explain credential-ready integrations

Plaid (financing), VIN (vehicle history), partner APIs (escrow, title,
insurance, transport):

> "Credential-ready means the integration plumbing is wired — the
> Transaction Room has the slot, the API auth is set up, the data
> shape is right. We turn on each partner as their side signs the
> integration agreement. Plaid and VIN data flows are first in line.
> Title, escrow, insurance, and transport partners are being added in
> the order we get real deal flow."

Don't name specific partner companies that haven't signed.

---

## How to ask for a real listing

After minute 8 (Transaction Room) but before minute 10:

> "One question — would [COMPANY] be open to putting one piece of
> real inventory in the beta? First 10 listings are free, no card.
> You'd be one of the first dealers / brokers with real listings on
> the platform. We'd handle the import and the Asset Passport with
> you."

If yes → `real_listing_candidate = true`, move to `beta_invited`.

If "maybe" → send the beta invite anyway. The signup is the
commitment that matters.

If "not yet" → don't push. Set `follow_up_later`, set a 30-day
reminder, send template 8 from `POST_DEMO_FOLLOW_UPS.md`.

---

## How to ask for a referral

Only ask if they engaged. Don't ask if the call felt flat.

> "Last ask — and feel free to say no. If anyone in your network —
> dealer, broker, surveyor, mechanic, transport, lender — should hear
> about this, an intro would mean a lot. A forwarded email is plenty.
> Either way, thanks for the time."

Note any names they offer in `beta_pipeline.feedback_notes` and send
template 10 from `POST_DEMO_FOLLOW_UPS.md` within 24 hours.

---

## Closing line (exact)

> "What would make this actually useful for your side of the business?"

Let them answer. Don't fill the silence with another feature.

When they answer, write it down. That's the most important sentence
of the call.

Then:

> "Appreciate the time. I'll send a short follow-up in the next couple
> hours."

End the call. Stop the recording (if recording). Update the CRM. Send
template 1 from `POST_DEMO_FOLLOW_UPS.md` within 2 hours.

---

## After the first demo

- Mark `beta_pipeline.stage = demo_completed`.
- Update `feedback_notes`.
- Send template 1 from `POST_DEMO_FOLLOW_UPS.md`.
- If they're a real listing candidate, send template 2 (beta invite)
  within 24 hours.
- Write a one-paragraph note for yourself: what surprised you, what
  fell flat, what you'd cut from the script. The second demo will be
  20% better than the first, and the tenth will be 80% better. The
  way to get there is to write down what you learned each time.

---

## The one rule

You are the founder. They are talking to you because you wrote them
a personal email and they wanted to see what you'd built. The demo is
not a pitch — it's you showing someone you respect what you're
working on, and asking them to help you make it better.

That's the whole frame. Everything else flows from it.
