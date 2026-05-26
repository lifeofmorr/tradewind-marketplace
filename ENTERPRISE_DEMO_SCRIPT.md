# ENTERPRISE DEMO SCRIPT

Two scripts: a **10-minute full demo** and a **3-minute quick pitch**. Both share the same opening hook so you can stretch or compress on the fly.

**Live URL:** https://tradewind-marketplace.vercel.app
**Recommended browser:** Chrome / Arc, 1440x900 window, no extensions visible.
**Pre-demo:** clear cookies, log out, have demo accounts ready (`demo-buyer@`, `demo-dealer@`, `demo-broker@`, `demo-sp@`, `demo-admin@`).

---

## OPENING HOOK (same for both scripts — 20 seconds)

> "Buying a boat, an exotic car, or an aircraft is the second-largest purchase most people will ever make. It involves a dealer or broker, an inspector, a transporter, a lender, an insurer, an escrow agent, sometimes a DMS partner — and today none of those people work in the same place. TradeWind is the first AI-powered marketplace where every party in the transaction — buyer, seller, and the entire service network — works in one place. Let me show you."

---

# SCRIPT A — 10-MINUTE FULL DEMO

## (0:20 — 1:00) HOMEPAGE
**Show:** https://tradewind-marketplace.vercel.app

**Talking points:**
- "Three verticals: boats, exotic and classic autos, aircraft. One platform."
- "Notice the clean, premium feel — this isn't BoatTrader. It's not AutoTrader. It's not Controller. It's the level of polish a high-ticket buyer expects."
- "Search bar handles natural language: 'twin-engine center console under 200k in Florida' works as well as filters do."
- Point to "For Dealers", "For Service Providers", "For Brokers" — "every party has a home."

## (1:00 — 2:00) BROWSE BOATS → AUTOS → AIRCRAFT
**Show:** Click through `/boats`, `/autos`, `/aircraft`

**Talking points:**
- "Each vertical has its own filter logic — boats by length/beam/engine, autos by year/make/transmission, aircraft by total time, engine SMOH, avionics package."
- "Verified seller badges. AI Deal Score on every card. No fake urgency, no clickbait."
- "65 demo listings live today, all clearly labeled DEMO. Real inventory comes in via dealer onboarding."

## (2:00 — 4:00) LISTING DETAIL — the showstopper
**Show:** Click into one high-quality boat listing (or auto if buyer is auto-focused).

Walk slowly through each panel:

1. **Hero photo carousel** — "Real dealer-grade photography. Source-matched, no stock photos."
2. **Asset Passport** — "AI-generated summary of every known fact about this vessel: hours, ownership chain, service record, known defects. Sourced from the seller, validated by us, scored for completeness."
3. **Deal Score** — "0–100 score combining listing price vs. comparable transactions, market velocity, condition signals. Buyers see WHY the score is what it is."
4. **True Cost Calculator** — "Most platforms show price. We show total cost of ownership over 1, 3, and 5 years: financing, insurance, fuel, slip/hangar/storage, maintenance, depreciation, resale curve."
5. **Pre-Buy Inspector** — "AI-generated inspection checklist customized to this exact make/model. Buyer can hand it to a surveyor."
6. **Offer Builder** — "Buyer drafts a structured offer with price, contingencies, inspection window, financing terms. Seller gets it in a clean format instead of a chaotic email thread."
7. **Transaction Room** — "Once an offer is accepted, both parties drop into a secure room. Documents, milestones, escrow, transport, insurance — all coordinated here."

**Key line:** "This is what 'AI-powered marketplace' actually means. Not a chatbot bolted onto a listings site."

## (4:00 — 5:00) BUYER FLOW
**Show:** Switch to `demo-buyer@` account.

- **Saved listings** — "Compare side-by-side: price, deal score, true cost, condition signals."
- **Financial Readiness profile** — "Buyer enters budget, financing preference, down payment, timeline. Every listing now shows whether it fits."
- **AI Concierge** — "Buyer asks: 'Which of my saved listings has the best blend of low hours and lowest true cost?' Real-time answer with reasoning."
- "Concierge is opt-in. Buyer's data is buyer's data. We never sell it."

## (5:00 — 6:30) DEALER FLOW
**Show:** Switch to `demo-dealer@` account.

- **Dealer dashboard** — "Active listings, lead pipeline, offers received, calendar appointments, performance metrics."
- **Inventory management** — "Add manually OR import via CSV / DMS feed. Auto-generates listing copy, suggests price band, validates required fields per vertical."
- **Leads** — "Every buyer inquiry routes here with full context: buyer's financial readiness, prior saved listings, concierge conversation summary."
- **Widgets** — "Embed a TradeWind lead capture widget on the dealer's own website. Their site stays, their brand stays, leads flow into TradeWind for follow-up."
- **Stripe billing** — "Two tiers — Pro and Premium — with clear capability deltas. Test mode today, live mode after first paying customer."

## (6:30 — 7:30) SERVICE PROVIDER FLOW
**Show:** Switch to `demo-sp@` account.

- **Service Provider dashboard** — "Inbound lead requests, quote pipeline, calendar."
- **Lead routing** — "When a buyer or dealer requests transport, inspection, financing, insurance, escrow — the request routes to in-network providers based on geography, specialty, availability."
- **Quote system** — "SP responds with a structured quote. Buyer/dealer compares quotes side-by-side."
- **Profile** — "SP showcases credentials, portfolio, coverage area, response time, reviews."
- "This is the network effect: every buyer brings demand, every dealer brings supply, every SP brings completion. They all need each other."

## (7:30 — 8:30) ADMIN FLOW
**Show:** Switch to `demo-admin@` account.

- **Listings moderation** — "Flag, suspend, edit any listing. Audit-logged."
- **User approvals** — "Beta gate: every signup pending until approved."
- **Payments dashboard** — "Stripe events, refunds, disputes."
- **Fraud screen** — "Edge function scores listings for risk. Admin reviews flagged items."
- **Integrations panel** — "Vendor integrations (Plaid, Carfax, escrow, DMS) shown as REQUEST-ACCESS until live contracts. We don't pretend to be wired to things we aren't."
- **Audit log** — "Every admin action logged. SOC-2 ready."

## (8:30 — 9:30) ENTERPRISE TRUST
**Show:** Stay on admin or jump to the homepage trust section.

Talking points (rapid-fire):
- **Security:** Supabase Postgres with row-level security on every user table. No service-role key exposed to client. Verified.
- **Auth:** Email + magic link, role-based access, role escalation paths closed (just fixed and verified).
- **Audit:** Every admin action, every payment event, every AI call logged.
- **Payments:** Stripe-managed. We never see card data. PCI scope minimized.
- **AI Safety:** Anthropic primary + OpenAI fallback. Prompt-injection guards on all user-supplied AI inputs. No PII sent to LLM beyond what user explicitly shared in chat.
- **Disclaimers:** Every AI-generated estimate (Deal Score, True Cost) clearly labeled as estimate, not appraisal. Every vendor integration honestly labeled as live or pending.
- **Compliance:** Aircraft listings reviewed against FAR advertising rules. No claims we can't back.

## (9:30 — 10:00) CLOSE

> "TradeWind is live today in private beta. We're onboarding 30 hand-picked dealers, brokers, service providers, and buyers across all three verticals. If you fit any of those, I'd love to get you in. Worst case you spend 20 minutes onboarding and tell me it's not for you. Best case you're our first reference customer in [their vertical]. What do you want to do?"

**Always end with a question.** Never end with a pitch.

---

# SCRIPT B — 3-MINUTE QUICK PITCH

Same hook (0:00 — 0:20).

## (0:20 — 1:00) ONE LISTING, EVERY FEATURE
Open one premium listing detail page. Scroll through Asset Passport, Deal Score, True Cost, Pre-Buy, Offer Builder. **20 seconds per panel, no deep dive.** Say:

> "Every listing has these. Not a chatbot, not gimmicks. AI that actually helps a buyer make the second-biggest purchase of their life."

## (1:00 — 1:45) THE NETWORK
Switch tabs / windows fast:
- Buyer dashboard: "Buyer side."
- Dealer dashboard: "Dealer side."
- Service Provider dashboard: "Service provider side."

> "Same platform, three lenses. Everyone in the transaction works in one place. That's the moat."

## (1:45 — 2:30) WHY NOW
- "Existing marketplaces are listing boards. We're a transaction platform."
- "AI is finally good enough to do real work — pricing, summarization, lead matching, document drafting. We use it where it adds value, not as a wrapper."
- "Boats + autos + aircraft sit at $200B+ in annual US transactions. Service providers around them are another $30B+. Nobody owns the full stack."

## (2:30 — 3:00) THE ASK
Same close as Script A. Always end with a question.

---

# DEMO LOGISTICS CHECKLIST

Before every demo:
- [ ] Browser cleared, no extensions, no autofill mid-demo
- [ ] All 5 demo accounts logged in across 5 browser tabs (buyer / dealer / SP / broker / admin)
- [ ] Demo listing #1 (boat): pre-loaded in a tab
- [ ] Demo listing #2 (aircraft): pre-loaded in a tab
- [ ] Stripe webhook listener confirmed working
- [ ] Internet connection backup (mobile hotspot ready)
- [ ] Screen-share quality tested
- [ ] Mute notifications, slack, mail
- [ ] Have `SALES_ENABLEMENT_PACKAGE.md` open in a side window for pricing/objection answers
- [ ] Have a notepad ready — capture every question they ask, every word they emphasize

After every demo:
- [ ] Send follow-up email within 2 hours
- [ ] Log demo in `FIRST_30_BETA_TARGETS.md` outreach status
- [ ] Capture qualitative notes — what excited them, what concerned them
- [ ] If they want in: send signup link with their beta code
- [ ] If they don't: ask "what would make this a yes?" and log it
