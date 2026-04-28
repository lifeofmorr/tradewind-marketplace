# TradeWind — First 100 Listings Plan (30 Days)

The marketplace flywheel doesn't start until there are listings worth browsing.
This document is the operational plan for the first 30 days post-launch:
how we get to 100 real, verified listings while keeping the site looking
populated to early visitors.

**Owner:** Don Morrison
**Start date:** 2026-04-28 (Day 1)
**Target end date:** 2026-05-28 (Day 30)
**Definition of "real listing":** non-demo (`is_demo=false`), `condition != 'demo'`,
seller is a verified dealer or a real private seller, has at least one photo,
status = `active`.

---

## North-star metrics

| Metric | Day 7 | Day 14 | Day 21 | Day 30 |
|---|---|---|---|---|
| Total active listings | 50 (demo) | 65 | 90 | 100 (real only) |
| Real (non-demo) listings | 0 | 15 | 50 | 100 |
| Demo listings remaining | 50 | 50 | 25 | 0 |
| Verified dealers signed | 0 | 3 | 8 | 12 |
| Service providers live | 20 (demo) | 22 | 28 | 35 |
| Outreach emails sent | 100 | 250 | 400 | 600 |
| Outreach reply rate | — | 8% | 10% | 12% |
| New listings per day | — | 2 | 5 | 4 |
| Avg dealer time-to-first-listing | — | 4 days | 2 days | 1 day |

Track in a Google Sheet (`tradewind-launch-metrics`) updated daily.

---

## Phase 1 — Days 1-3: Seed inventory & infrastructure

**Goal:** Site looks populated. Outreach assets ready. Founder can demo to
any dealer in under 5 minutes.

- [x] **Day 1 (today)** — `supabase/seed.sql` applied with 50 demo listings,
      5 dealers, 20 service providers (transport, finance, insurance included).
      All rows are `is_demo=true` so they're trivially purgeable.
- [ ] **Day 2** — Capture 10 hero photos for the homepage carousel by
      pulling royalty-free shots that match the demo categories. Stage in
      Supabase Storage `listing-photos` bucket. Stash photo credits in
      `/legal/photo-credits.md`.
- [ ] **Day 2** — Send the founder's personal network a "we just launched"
      note (LinkedIn DM + 5 personal texts). No public launch yet.
- [ ] **Day 3** — Confirm the AI listing generator works end-to-end on a
      real VIN/HIN. If it doesn't, bump it before any dealer touches the
      product.
- [ ] **Day 3** — Buy 3 follow-up domains (twind.io, tradewindboats.com,
      tradewindmotors.com) and 301 them.

**Exit criteria:** Production landing page shows 50 listings with photos,
search returns results in every category, founder can demo end-to-end on
mobile in under 90 seconds.

---

## Phase 2 — Days 4-7: Outreach blast (300 emails)

**Goal:** Get the offer in front of 300 segments and book the first 5
dealer demo calls.

Outreach lists, all sourced from public directories:

| Segment | Source | Count | Channel |
|---|---|---|---|
| Boat dealers (FL/SC/NC/TN) | YachtWorld dealer index, BoatTrader | 100 | Cold email + IG DM |
| Auto dealers (TN/NC/FL) | DealerRater, Cars.com, AutoTrader | 100 | Cold email + LinkedIn |
| Yacht/boat brokers | IYBA member directory | 50 | Cold email + warm intro |
| Service providers | Google Maps + Yelp | 50 | Cold email |
| **Total** | | **300** | |

Outreach scripts live in [OUTREACH_SCRIPTS.md](OUTREACH_SCRIPTS.md). All
templates reference TradeWind by name, the AI listing generator, lead
routing, featured placement, analytics, and the launch offer.

- [ ] **Day 4** — Build the 300-row outreach sheet. Columns:
      `business_name`, `contact_name`, `email`, `phone`, `city`, `state`,
      `category`, `source`, `last_touch`, `status`, `notes`.
- [ ] **Day 4** — Day 1 email sent to first 100 (boat dealers).
- [ ] **Day 5** — Day 1 email sent to next 100 (auto dealers).
- [ ] **Day 6** — Day 1 email sent to remaining 100 (brokers + services).
- [ ] **Day 6** — Begin DM/LinkedIn personalization on the 30 highest-fit
      targets (high IG followers, premium inventory, regional fit).
- [ ] **Day 7** — Send Day 3 follow-up to the first 100. Tally responses,
      book demos.

**Launch offer (mention in every email):**
- 60-day free dealer profile (no payment up front)
- First 10 listings free for early partners (no per-listing fee)
- Free featured placement for first 30 days
- AI listing generator usage included in the trial
- No long-term contract — cancel any time before day 60

**Exit criteria:** 5 booked demo calls scheduled, 8% reply rate on Day 1
emails, 3 inbound IG/LinkedIn DMs.

---

## Phase 3 — Days 8-14: Convert first 5 dealers

**Goal:** Land the first 5 dealers and import their inventory via CSV
so the front end starts showing real listings alongside demos.

- [ ] **Day 8-10** — Run 5 demos. Same script every time:
      1. Show the homepage and search.
      2. Run AI listing generator on one of *their* current cars/boats.
      3. Show the dealer dashboard, lead routing, analytics.
      4. Quote the launch offer; ask for a verbal yes.
- [ ] **Day 9** — Ship a "white-glove" CSV import for any dealer who says
      yes. Founder manually maps their CSV columns to `dealer-inventory-import.csv`
      and runs the import himself. No self-serve until Day 21.
- [ ] **Day 11-13** — Each new dealer gets:
      - Verified badge after a 10-minute video call
      - First 5 listings reviewed by founder before they go active
      - Public testimonial captured by Day 14 (text + photo, not video yet)
- [ ] **Day 14** — At least 15 real (non-demo) listings live. Demo listings
      stay up; real listings appear above them in default sort.

**Exit criteria:** 3 dealers signed and live with at least 5 listings each,
2 dealers in pipeline with imports staged.

---

## Phase 4 — Days 15-21: Scale to 50 real listings

**Goal:** Open self-serve dealer signup, double dealer count, double
listing count.

- [ ] **Day 15** — Self-serve dealer signup flow goes live (no founder
      manual review for tier='starter'). Founder still reviews tier='pro'
      and tier='premier' upgrades.
- [ ] **Day 15** — Day 7 follow-up to anyone who hasn't replied. Subject
      line shifts from value-prop to social proof: "[Dealer X] just listed
      40 boats on TradeWind — here's what they said".
- [ ] **Day 16-18** — Run 5 more demos (target: 5 more signed dealers).
- [ ] **Day 17** — Begin Phase 2 of outreach: private sellers from
      Facebook Marketplace and Craigslist. Personal DM only — never bulk.
      Use the private-seller script from `OUTREACH_SCRIPTS.md`.
- [ ] **Day 19** — Press: pitch one regional outlet (Charleston Business,
      Knoxville News Sentinel, or South Florida Business Journal) per week.
- [ ] **Day 20** — Add testimonials section to homepage with first 3
      dealer quotes.
- [ ] **Day 21** — At least 50 real listings live, 8 verified dealers,
      ~25 demo listings still up (start removing the weakest ones).

**Exit criteria:** 8 dealers, 50 real listings, 3 published testimonials,
self-serve flow vetted by 3+ dealers without founder intervention.

---

## Phase 5 — Days 22-30: Replace all demos with real inventory

**Goal:** Reach 100 real listings. Remove all `is_demo=true` rows.

- [ ] **Day 22** — Send Day 14 final-touch email to all unconverted
      outreach targets. Include a 90-second loom video walking through
      the dealer dashboard with real data from existing partners.
- [ ] **Day 23-26** — Convert the next 4-5 dealers (target: 12-13 total).
- [ ] **Day 24** — Begin removing demo listings in the same category as
      real listings. Rule: when a category has 8+ real listings, remove
      all demos in that category.
- [ ] **Day 27** — Press release: "TradeWind passes 100 listings in 30
      days." Pitch to TechCrunch, Business Insider South, regional press.
- [ ] **Day 28** — All demo listings hidden via `update listings set
      status = 'removed' where is_demo = true`. Run the analytics
      review: which demo categories drove the most engagement?
- [ ] **Day 29** — Charge the first dealer Stripe subscription (the 60-day
      trial for the Day 9 dealer expires Day 30). Founder calls each
      converting dealer personally before the auto-charge.
- [ ] **Day 30** — Retro: write the Day 30 post-mortem covering CAC per
      dealer, time-to-first-listing, top objection categories, and
      the next 30-day plan.

**Exit criteria:** 100 real listings, 12+ dealers paying or in trial,
all demos removed, retro doc complete and shared with advisors.

---

## Demo-purge rules

When real inventory is ready, demo listings get removed in this order:

1. Lowest-engagement demos first (sort by `view_count + 5*inquiry_count`).
2. Demos in a category where we have 8+ real listings.
3. All remaining demos by Day 28.

The is_demo flag (added in `20260101000300_demo_field.sql`) makes this
trivial: `update listings set status='removed' where is_demo=true`.

---

## Offer structure (use in every conversation)

| Tier | Listings | Lead routing | Featured | AI generator | First 60 days | Then |
|---|---|---|---|---|---|---|
| **Starter (early-partner)** | 10 | ✓ | 30 days included | ✓ | $0 | $99/mo |
| **Pro (early-partner)** | 50 | ✓ priority | 60 days included | ✓ | $0 | $299/mo |
| **Premier (early-partner)** | unlimited | ✓ priority + concierge | unlimited | ✓ + custom prompts | $0 | $799/mo |
| **Service Pro** | n/a (provider profile) | ✓ inbound | 30 days included | n/a | $0 | $79/mo |

**Locked-in pricing for early partners:** anyone signed before Day 30 keeps
their tier price for 12 months even when public pricing rises.

---

## Risk register

| Risk | Likelihood | Mitigation |
|---|---|---|
| AI listing generator hallucinates VINs | Medium | Founder QA on first 10 generations per dealer |
| Stripe webhook fails on subscription cycle | Low | Manual reconciliation on Day 28 before first charges |
| Demo listings rank above real ones in search | Medium | `order by is_demo asc, published_at desc` in default sort |
| Single-region concentration (FL/SC/NC/TN) | High | Plan deliberate — don't expand until cohort 1 is healthy |
| Founder bandwidth (running demos + sales + product) | High | Hire 1 part-time SDR by Day 14 if reply rate >10% |

---

## Daily founder ritual (Days 4-30)

- 8:00 AM — Outreach sheet: send 20 personalized cold emails
- 9:00 AM — Standup with self: yesterday wins, today plan, blockers
- 10:00 AM — Demos (book in 30-min blocks)
- 1:00 PM — Inbound: respond to every reply within 2 hours
- 3:00 PM — Product: ship one improvement based on dealer feedback
- 6:00 PM — Update metrics sheet, post end-of-day note in #launch Slack

If a single day misses 4 of 6 of these, that's the signal to slow growth
and stabilize.
