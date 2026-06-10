# PRIVATE BETA LAUNCH PACKAGE

**Status:** READY TO LAUNCH
**Mode:** Invite-only, manually approved
**Owner:** Don Morrison
**Initial cohort:** 3–5 users → expand to 15 → expand to 30

This is the operational summary tying together the entire go-live package. If you only read one document before launching, read this one.

---

## 1. BETA GOAL

Validate that TradeWind delivers real value across the three verticals (boats, autos, aircraft) AND across the four roles (buyer, dealer, broker, service provider) BEFORE opening to the public.

**Specifically, prove:**
1. The product works end-to-end with real users in real shopping cycles.
2. The pricing model resonates with each persona.
3. The vendor-dependent gaps (Plaid, Carfax, Escrow, DMS, etc.) are tolerable as request-access surfaces, OR identify which gaps must close before public launch.
4. The AI tools (Concierge, Deal Score, True Cost, Pre-Buy, Asset Passport, Offer Builder) actually shift buyer / dealer behavior — not just demo well.
5. The service-provider lead-routing creates real value for SPs and real velocity for transactions.

---

## 2. WHO GETS INVITED (and when)

| Wave | Cohort Size | Composition | Trigger |
|---|---|---|---|
| **Wave 0 (right now)** | 3–5 | 1–2 dealers + 1 broker + 1 buyer + 1 service provider (founder's warm network) | All 10 launch gates GREEN (per `GO_LIVE_CONTROL_CENTER.md`) — currently satisfied |
| **Wave 1 (Week 2–3)** | Up to 15 | Add: 2 more dealers, 1 more broker, 2 more buyers, 2 more SPs from `FIRST_30_BETA_TARGETS.md` | Wave 0 active for 7 days, 0 open P0/P1 bugs, at least one full vertical exercised end-to-end |
| **Wave 2 (Week 4–6)** | Up to 30 | Fill remaining slots in `FIRST_30_BETA_TARGETS.md` | Wave 1 metrics meet expansion gates (see §11) |
| **Public beta (Week 8+)** | Open | Public landing page, self-serve onboarding (still admin-approved during early public beta) | Stripe live, domain cut over, at least 1 transaction closed end-to-end |

Each wave triggers `PRIVATE_BETA_ACCESS_PLAN.md` §11 expansion gates explicitly.

---

## 3. WHAT TO TEST

Beta users are asked to exercise these flows and report friction:

### Buyer flows
- Browse all three verticals
- Save listings, compare side-by-side
- Try AI Concierge with a real question they actually have
- Run Deal Score, True Cost, and Pre-Buy on a listing they're genuinely interested in
- Draft an Offer using Offer Builder
- Set Financial Readiness profile
- (Optional) Request a transport / inspection / financing quote and observe routing

### Dealer flows
- Add a listing manually
- Import a listing via CSV (or DMS feed if Premium tier)
- Review and respond to a lead
- Try the AI listing assist
- Configure dealer profile
- Install the Lead Widget on their own site (optional)
- Walk through Stripe checkout in test mode

### Aircraft broker flows
- Create an aircraft listing with logbook upload
- Verify the compliance check flags appropriately
- Open a Transaction Room for a deal
- Coordinate with in-network pre-buy inspector / escrow agent / ferry pilot

### Service provider flows
- Set up service profile
- Receive at least one routed lead
- Submit a structured quote
- Track quote through to acceptance / rejection

### Admin / observer flows (Don only)
- Approve accounts daily
- Moderate listings daily
- Review audit log weekly
- Monitor edge function error rates daily

---

## 4. FEEDBACK TO COLLECT

Standardized 4-question format (every beta user, every survey moment):

1. **What worked?**
2. **What broke?**
3. **What's missing?**
4. **Would you pay — and if so, at what price for what value?**

Collected via:
- In-app feedback widget (continuous)
- Day-7 email survey (template #8 in `PRIVATE_BETA_OUTREACH_TEMPLATES.md`)
- Day-14 founder call (30 min, mandatory for dealers/brokers/SPs)
- Day-30 email + optional testimonial ask (template #10)

Aggregated weekly into themes. Themes feed into product priorities.

---

## 5. WHAT NOT TO PROMISE

During the beta we do NOT commit to or claim:
- Live escrow / financing / insurance / VIN history / aircraft history (currently gated as request-access — see `LIVE_DATA_POLICY.md` §8)
- Specific volume of buyer leads for dealers / SPs (we don't have the data yet)
- Specific time-to-close metrics
- A specific public launch date
- Specific pricing — beta pricing is locked at beta rates for 12 months but final public pricing may shift based on feedback
- Any specific competitor comparison data we haven't actually measured

What we DO commit to during beta:
- Founder-level support
- Direct product input — feedback shipped within the week, not the quarter
- Beta pricing grandfathered for 12 months on the tier they sign up for
- No surprise charges (Stripe is test mode; live mode requires explicit opt-in)
- Honest representation of what is live vs. what is gated

---

## 6. HOW TO MONITOR

Daily owner check (5–10 minutes — per `GO_LIVE_CONTROL_CENTER.md` §7):
- New beta applications in admin queue
- New listings in moderation queue
- Bug reports inbox
- Edge function error rate (Supabase dashboard)
- Stripe webhook health
- Anthropic + OpenAI quotas

Weekly owner review (60–90 min — per `SUPPORT_OPERATIONS.md` §6):
- Bug triage board update
- Feedback aggregation + theming
- Beta digest email to all users
- Update success metrics table (§11)
- Update `FIRST_30_BETA_TARGETS.md` outreach status

---

## 7. HOW TO APPROVE ACCOUNTS

Per `PRIVATE_BETA_ACCESS_PLAN.md` §3:
1. Pending applications appear in `/admin/approvals`
2. Confirm identity matches outreach target
3. Assign role + sub-vertical + feature flags
4. Approve → triggers welcome email (template #9 in outreach docs)
5. Audit log entry written

Approvals SLA: within 24 hours of signup.

---

## 8. ONBOARDING SUPPORT

Per role, the onboarding flow is built into the app (`PRIVATE_BETA_ACCESS_PLAN.md` §5). On top of that:

- **Dealers + brokers:** mandatory founder onboarding call within first 7 days. Calendly link sent in welcome email.
- **Service providers:** mandatory founder onboarding call within first 7 days.
- **Buyers:** optional 15-min orientation call offered in welcome email.

These calls are not sales calls — they are product walkthroughs and feedback-capture sessions. Founder takes notes and feeds them into the weekly review.

---

## 9. COMMUNICATIONS RHYTHM

| Communication | Audience | Cadence | Owner |
|---|---|---|---|
| Welcome email | New approvals | On approval | Don (template #9) |
| Day-7 feedback survey | All active beta users | At day 7 of each user | Don (template #8) |
| Day-14 founder call | Dealers, brokers, SPs | At day 14 of each user | Don (in person / Zoom) |
| Weekly beta digest | All active beta users | Every Monday | Don (custom each week — what shipped, what's next, how to give feedback) |
| Day-30 thank-you + final survey | All active beta users at day 30 | At day 30 of each user | Don (template #10) |
| Incident notifications | All affected users | On detection of P0/P1 | Don (per `SUPPORT_OPERATIONS.md` §9) |
| Policy update notice | All users | Per material change | Don (per `LIVE_DATA_POLICY.md` §13) |

---

## 10. SUCCESS METRICS (track weekly)

Update this table at every Monday review:

| Metric | Target (by end of Wave 2 / Week 6) | Current | Status |
|---|---|---|---|
| Users onboarded | 10+ | 0 | NOT STARTED |
| Dealers interested (signed up + active) | 3+ | 0 | NOT STARTED |
| Aircraft brokers interested | 1+ | 0 | NOT STARTED |
| Service providers interested | 2+ | 0 | NOT STARTED |
| Real (non-demo) listings posted | 1+ | 0 | NOT STARTED |
| Concierge conversations | 5+ meaningful | 0 | NOT STARTED |
| Leads routed to service providers | 1+ | 0 | NOT STARTED |
| Open P0 / P1 bugs | 0 (always) | 0 | ON TARGET |
| Clear pricing feedback captured | Pricing direction validated for each tier | None | NOT STARTED |
| Day-30 retention | 70%+ of approved users active | N/A | NOT STARTED |

Beta is on track when:
- All targets in green by end of Wave 2.
- No more than one target consistently missed across 3 weeks → re-evaluate scope.

---

## 11. EXPANSION GATES

(Restated from `PRIVATE_BETA_ACCESS_PLAN.md` §11 for convenience.)

### 3–5 → 15 users:
- [ ] 3+ users have logged in and used core flows
- [ ] 0 open P0/P1 bugs
- [ ] At least 1 dealer has imported real inventory
- [ ] At least 1 service provider has completed onboarding
- [ ] Feedback themes are positive or actionable (no fundamental misalignment)

### 15 → 30 users:
- [ ] 10+ users actively using the platform weekly
- [ ] At least 3 real listings live (not demo)
- [ ] At least 1 real lead routed to a service provider
- [ ] At least 1 concierge conversation that produced a buyer-side outcome
- [ ] Stripe test flow exercised by at least 1 dealer signup
- [ ] 0 open P0/P1 bugs

### 30 → public beta:
- [ ] Stripe live mode enabled (with first paying customer signed LOI)
- [ ] Domain cutover complete (`gotradewind.com`)
- [ ] At least 1 transaction completed end-to-end
- [ ] All vendor-dependent items either live or clearly gated
- [ ] NPS / qualitative feedback overwhelmingly positive

---

## 12. RISK REGISTER (during beta)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| P0 bug in production with active beta users | Low | High | Pre-launch gates GREEN; weekly QA review; kill-switch documented in Control Center |
| Stripe webhook failures | Low | Medium | Test-mode only; webhook health monitored daily |
| AI provider outage (Anthropic + OpenAI both down) | Very Low | High | Auto-failover; user-visible graceful degradation if both fail |
| User confuses demo listings as real and contacts demo seller | Low | Medium | Demo labeling per `LIVE_DATA_POLICY.md` §1; demos use fabricated identifiers |
| Listed asset claimed as stolen | Low | Very High | Takedown SLA 24 hr per `LIVE_DATA_POLICY.md` §12 |
| Dealer or broker churns over a single bug | Medium | Medium | Founder-level support; rapid acknowledgement SLA per `SUPPORT_OPERATIONS.md` §4 |
| Vendor refuses to sign integration contract | Medium | Medium | Keep gates in UI; pivot to next vendor in same category; don't claim live until live |
| Press picks up beta as "launched product" | Low | Medium | Beta-only messaging in all materials; founder personally handles press per `SUPPORT_OPERATIONS.md` §5 |
| Compliance complaint on aircraft listing | Low | High | Compliance check in listing editor; broker attestation; counsel on retainer (TBD) before any aircraft sale closes |
| Owner burnout (founder-led support has limits) | Medium | High | Cohort sizes capped per wave; weekly review enforced; expansion gates require proven capacity |

---

## 13. LAUNCH DAY SCRIPT

When the first Wave 0 invite goes out:

1. **Morning** — Final Control Center scan. Confirm all 10 gates still GREEN. Confirm daily ops checklist clean.
2. **Send first invite** — Use template #1, #2, #3, or #4 from outreach templates. Personalize for recipient.
3. **Wait** — Resist the urge to send 10 at once. Send 1–2, see how they respond, learn before scaling.
4. **First approval** — When the first signup hits the queue, approve within 1 hour. Send welcome email. Add to calendar for Day-7 follow-up.
5. **End of day** — Update `FIRST_30_BETA_TARGETS.md` with outreach status. Log to weekly review.

The first 5 invites set the tone for the next 25. Make them count.

---

## 14. DOCUMENT MAP

This package is operational; not all documents are referenced equally often.

**Daily reference:**
- `GO_LIVE_CONTROL_CENTER.md` — environment + gate status
- `BUG_TRIAGE_BOARD.md` — active issues
- `FIRST_30_BETA_TARGETS.md` — outreach pipeline

**Weekly reference:**
- `PRIVATE_BETA_LAUNCH_PACKAGE.md` (this file) — overall plan + metrics
- `SUPPORT_OPERATIONS.md` — process discipline
- `PRIVATE_BETA_ACCESS_PLAN.md` — onboarding + role workflow

**Event-driven reference:**
- `ENTERPRISE_DEMO_SCRIPT.md` — before every demo
- `SALES_ENABLEMENT_PACKAGE.md` — before every prospect conversation
- `PRIVATE_BETA_OUTREACH_TEMPLATES.md` — before every outreach send
- `LIVE_DATA_POLICY.md` — before every policy edge case
- `DOMAIN_LAUNCH_CHECKLIST.md` — only when ready to cut over

---

**TradeWind is verified clean, the gates are green, and the package is ready. The next move is the first invite.**
