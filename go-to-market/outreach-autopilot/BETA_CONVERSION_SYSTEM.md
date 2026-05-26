# Beta Conversion System

How a positive demo turns into a beta signup, and how a beta signup turns into a paying customer.

---

## The TradeWind beta offer

A single, clean offer that's the same for every flagship beta participant:

> **60 days, free.**
>
> - Free verified profile (dealer / broker / service / partner)
> - Free first 10 listings (dealers and brokers)
> - Featured placement during the beta window
> - Early pricing lock — whatever your beta rate is, that's your rate after beta
> - No fee until you've seen real lead flow

That's it. No tier shopping, no upsell during beta. Less time selling, more time onboarding.

---

## Beta invite messages by role

Each role gets a tailored invite after a yes on the demo (or on the strength of a reply where they explicitly said "I want in").

### Dealer / broker beta invite

```
Subject: TradeWind beta — your invite

Hey [First] —

You're in. Here's what happens next:

1. Click here to claim your profile: [private invite link]
2. Either upload your inventory manually, or send me a CSV / your existing feed and I'll get the first 10 listings imported.
3. Once you're happy with the profile, we flip it live and start routing buyer requests.

You're in the first 30. Free 60 days, free first 10 listings, early pricing lock, no fee until lead flow. Reply with any questions; I'll move fast.

— Don
TradeWind
```

### Service provider beta invite

```
Subject: TradeWind beta — your service profile

Hey [First] —

You're in. Three steps:

1. Claim your service profile: [private invite link]
2. Set your geo coverage and the services you want to be routed for.
3. Tell me your preferred response SLA (24h, same day, etc.) so I can tune the buyer routing.

Free during beta, free leads, no fee until you see real volume. You're one of the first 15 service providers — feedback you give now changes how the network works.

— Don
TradeWind
```

### Lender beta invite

```
Subject: TradeWind lender partner — onboarding

Hey [First] —

Welcome. Three things to align this week:

1. Sign the partner MOU (one-pager, no surprises): [link]
2. Pre-qual form fields — I'll send a draft, you redline.
3. The financing hub page goes live with you listed as the marine / aviation / specialty auto partner.

You're our [marine / aviation / specialty] lender partner during beta. Worth a 20-min call to lock it in?

— Don
TradeWind
```

### Insurance / escrow / transport partner invite

(Same pattern as the lender invite — partner MOU, integration scope, go-live timing.)

---

## Beta onboarding steps (every beta participant)

Track each in CRM `Notes`:

1. **Confirm role and vertical** — dealer / broker / service / lender / insurance / escrow / transport / advisor.
2. **Create their TradeWind account** — they sign up at `/signup`, Don assigns the right role server-side via Supabase auth.
3. **Assign role** — through admin user management (`/admin/users`).
4. **Build the profile** — Don helps the first time, or sends a Loom walkthrough. Photos, bio, coverage, specialties.
5. **Add inventory or service listings** — first 10 free, either uploaded manually, via CSV import, or via Don pulling their feed.
6. **Test 3 core workflows:**
   - Create a listing end-to-end
   - Receive a buyer inquiry and respond in-platform
   - Update profile or change pricing without errors
7. **Capture feedback** — 15-min check-in call at Day 7. Three questions:
   - What works?
   - What's broken?
   - What's missing?
8. **Ask if they'd pay** — explicit question at Day 30: "Once beta ends, would you pay $X/mo to keep this? Yes / Maybe / Not yet / No — and why?" Answer goes into `Interested In Paying?`.

---

## The 7-touch beta cadence

| Day | Touch | Purpose |
|---|---|---|
| 0 | Demo + invite email | Get them in |
| 1 | Loom walkthrough of profile setup | Reduce friction |
| 3 | Check-in: "Got everything you need?" | Catch blockers |
| 7 | 15-min feedback call | First real signal |
| 14 | Inventory health check — are listings live, are photos right | Quality |
| 30 | "Would you pay?" call | Conversion signal |
| 60 | Beta end / paid conversion call | Close to paying |

---

## What "paying customer" looks like

After Day 60 we move beta participants to one of three buckets:

1. **Paid** — they agreed to the post-beta pricing and signed up.
2. **Extended beta** — they want to stay but aren't ready to pay yet. We extend 30–60 days in exchange for a written commitment to be a case study.
3. **Churned beta** — not paying, not extending. Mark `Interested In Paying? = No`, archive the lead, capture the reason in `Notes`.

---

## Capturing what we learn

Every beta participant generates 4 data points worth keeping:

- **Top objection** they raised before joining
- **Most-used feature** during their first 30 days
- **First thing they asked us to fix**
- **Will they pay** (yes / maybe / not yet / no)

These four data points roll up into the weekly review. Patterns from these reshape the sequence library, the demo, and the pricing.

---

## What we don't do during beta

- No surprise pricing changes
- No "we said free, but actually..."
- No reselling beta data to anyone
- No public quotes/testimonials without written permission
- No automated emails to beta participants (they get human emails from Don, period)
- No removing them silently — if we're sunsetting their access, they get a personal call from Don 14 days ahead
