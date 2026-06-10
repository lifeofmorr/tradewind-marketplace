# TradeWind — Revenue Execution Plan

**Date:** 2026-06-08
**Owner:** Don Morrison
**Current Revenue:** $0
**Current Customers:** 0

---

## 1. Beta Offer (Weeks 1–8)

The goal of the beta is NOT revenue. It's validation. Revenue follows validation.

### The Offer

> "Free 60-day founding dealer access. You get the full platform — AI listing tools, lead inbox, analytics — at no cost. In exchange, I ask for 30 minutes of your time for feedback at Day 15 and Day 45. After 60 days, you decide if you want to continue at our Starter rate ($149/mo). No auto-charge, no surprise billing."

### Why 60 Days Free
- 14-day trial (currently advertised on pricing page) is too short for a marketplace — dealers need time to list inventory AND see leads come in
- 60 days gives enough time for organic traffic to find their listings
- It removes the pricing objection entirely during outreach
- "Founding dealer" framing creates exclusivity without fake scarcity

### Beta Conversion Target
- 3–5 dealers in beta by end of Week 4
- 1–2 convert to paid by end of Week 10 (after beta expires)
- First revenue target: $149–$499/mo (one or two Starter/Pro dealers)

---

## 2. Revenue Products (Already Built in Stripe — Test Mode)

### Recurring Revenue (Subscriptions)

| Product | Price | Target Customer | When to Sell |
|---|---|---|---|
| Dealer Starter | $149/mo | Small dealers (1–25 listings) | After beta proves lead quality |
| Dealer Pro | $499/mo | Mid-size dealers (25–100 listings) | After dealer outgrows Starter |
| Dealer Premier | $1,499/mo | Large dealers (100+ listings, premium) | After Pro proves ROI |
| Service Provider | $89/mo | Marine surveyors, mechanics, transport | When service marketplace launches |

### One-Time Revenue

| Product | Price | Target Customer | When to Sell |
|---|---|---|---|
| Featured Listing (30 days) | $79 | Any seller wanting top placement | When there's enough browse traffic to make it worth it |
| Boost Listing (7 days) | $29 | Sellers with stale listings | When organic views exist to boost above |
| Concierge Engagement | $499 | High-net-worth buyers | When concierge flow is validated |

### Honest Assessment of Each Product

| Product | Ready to Sell? | Blocker |
|---|---|---|
| Dealer Starter | Almost — needs Stripe live | Stripe activation by Don |
| Dealer Pro | Almost — same blocker | Same |
| Dealer Premier | Not yet | Need to prove Starter/Pro value first |
| Service Provider | Not yet | Service marketplace needs real providers |
| Featured Listing | Not yet | Need baseline organic traffic to "boost above" |
| Boost Listing | Not yet | Same — no traffic to boost |
| Concierge | Not yet | Need validated concierge workflow with real buyer |

---

## 3. Revenue Path — Honest Timeline

### Month 1 (June 2026): Foundation
- **Revenue target:** $0 (beta is free)
- **Work:** Send outreach (3–5/day), book demos, onboard 3 beta dealers
- **Milestone:** 3 dealers with real listings on the platform

### Month 2 (July 2026): Validation
- **Revenue target:** $0 (still in beta window)
- **Work:** Collect feedback at Day 15 and Day 45. Fix what they tell you. Get 5 real listings per dealer. Monitor organic traffic.
- **Milestone:** At least 1 dealer says "I would pay for this"

### Month 3 (August 2026): First Revenue
- **Revenue target:** $149–$499/mo
- **Work:** Beta expires for Month 1 cohort. Convert 1–2 to paid. Send second wave of outreach based on what worked.
- **Milestone:** First Stripe live transaction. First MRR.

### Month 4–6 (Sep–Nov 2026): Growth
- **Revenue target:** $500–$2,000/mo MRR
- **Work:** Onboard 5–10 total paying dealers. Introduce featured/boost listings. Begin service provider outreach.
- **Milestone:** $1K MRR. Enough to cover infrastructure costs.

### Month 7–12 (Dec 2026–May 2027): Scale
- **Revenue target:** $2,000–$10,000/mo MRR
- **Work:** Expand to new verticals/regions. Hire first part-time support. Consider Pro/Premier tier upgrades.
- **Milestone:** $5K MRR = ramen profitable for a solo founder.

### Revenue Scenarios (12-Month)

| Scenario | Dealers | Avg Plan | MRR | ARR |
|---|---|---|---|---|
| Worst case | 3 | $149 (Starter) | $447 | $5,364 |
| Base case | 10 | $250 (mix) | $2,500 | $30,000 |
| Good case | 25 | $350 (mix) | $8,750 | $105,000 |
| Stretch | 50 | $400 (mix) | $20,000 | $240,000 |

**Note:** These are scenarios, not forecasts. There is no data to forecast from. They exist to set mental anchors for "what would make this worth doing."

---

## 4. Weekly Revenue Goals

### Week 1 (June 8–14)
- [ ] Verify top 5 leads from LEADS_TO_REVIEW_BEFORE_SENDING.csv
- [ ] Send 3 personalized outreach emails
- [ ] Set up Sentry DSN in Vercel
- [ ] Set up custom domain (or decide not to)

### Week 2 (June 15–21)
- [ ] Send 5 more outreach emails (total: 8)
- [ ] Follow up on Week 1 sends (Day 3 follow-up)
- [ ] Book first demo call
- [ ] Activate Stripe live mode (products + keys)

### Week 3 (June 22–28)
- [ ] Conduct first demo
- [ ] Send 5 more outreach emails (total: 13)
- [ ] Onboard first beta dealer (if demo converts)
- [ ] Week 1 Day 7 follow-ups (final follow-up)

### Week 4 (June 29–July 5)
- [ ] Target: 3 beta dealers onboarded
- [ ] First real listings live on platform
- [ ] First weekly rollup review — what's working in outreach?
- [ ] Adjust templates based on reply patterns

---

## 5. Pricing Principles

- **Never discount below published rates.** The beta is free; after that, published prices are the floor.
- **Never offer custom pricing** until you have 20+ paying customers and understand price sensitivity.
- **Annual billing discount:** Not yet. Too early to lock in annual contracts.
- **Refund policy:** 30-day money-back, no questions asked. Better to refund than get a chargeback or a bad reputation.
- **Free trial after beta:** 14 days (as currently advertised). Fix the checkout code to actually pass `trial_period_days: 14`.

---

## 6. Revenue Risks (Honest)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Nobody replies to outreach | Medium | Fatal | Iterate messaging, try different verticals, try warm intros |
| Dealers sign up but don't list | High | High | Offer white-glove listing help for first 5 listings |
| Buyers don't find the platform | High | High | SEO takes 3–6 months; consider paid ads if organic is too slow |
| Pricing too high for small dealers | Medium | Medium | $149/mo is competitive; offer beta discount if needed |
| Competitor launches similar product | Low | Medium | Speed + founder attention beats feature parity |
| Stripe live activation blocked | Low | Fatal | Don owns this — complete in Week 2 |

---

## 7. What "Revenue Ready" Actually Means

Before charging real money, all of these must be true:

- [ ] Stripe in live mode with real products/prices
- [ ] Webhook endpoint verified with live events
- [ ] Refund process tested manually
- [ ] Terms of service link visible at checkout
- [ ] Receipt email sends after purchase
- [ ] Subscription cancellation flow works
- [ ] Don can see transactions in Stripe dashboard
- [ ] At least 1 beta dealer has used the platform for 2+ weeks and confirmed value
- [ ] Support email is monitored (not just personal inbox)
- [ ] Error monitoring (Sentry) is active
