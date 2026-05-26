# PRIVATE BETA ACCESS PLAN

**Mode:** Invite-only, manually approved.
**Initial Cohort Size:** 3–5 users
**Phase 1 Expansion:** 15–30 users
**Owner:** Don Morrison

---

## 1. BETA GROUPS & TARGET MIX

### Group A — Dealers / Brokers (target: 10–15)
| Sub-vertical | Initial Targets |
|---|---|
| Boat dealers / brokers | 4 |
| Auto dealers (exotic/classic) | 3 |
| Aircraft brokers / dealers | 3 |
| Exotic/luxury auto specialists | 2 |
| Multi-vertical / cross-category dealers | 1–3 |

### Group B — Buyers (target: 5–10)
| Sub-vertical | Initial Targets |
|---|---|
| Boat buyers (active shoppers) | 3 |
| Exotic/classic auto buyers | 2 |
| Aircraft buyers / pilots | 2 |
| Luxury cross-category | 2 |
| Industry advisors (acting as buyer-proxies) | 1 |

### Group C — Service Providers (target: 5–10)
| Sub-vertical | Initial Targets |
|---|---|
| Transport (haul/ship) | 2 |
| Inspection / pre-buy surveyors | 2 |
| Aviation mechanics / IA shops | 1 |
| Marine mechanics / refit yards | 1 |
| Lenders (marine, auto, aviation) | 1 |
| Insurance brokers (specialty) | 1 |
| Escrow / title services | 1 |

---

## 2. INVITE-ONLY PROCESS

### Step 1 — Outreach
Owner sends personal outreach via email (templates in `PRIVATE_BETA_OUTREACH_TEMPLATES.md`) referencing targets in `FIRST_30_BETA_TARGETS.md`.

### Step 2 — Beta Application
Prospect responds with interest → owner sends signup link with referral code:
`https://gotradewind.com/signup?beta=[CODE]`

Beta codes are simple per-vertical tags: `BETA-BOAT-DEALER-001`, `BETA-AIRCRAFT-BROKER-003`, `BETA-BUYER-AUTO-002`, etc. This allows attribution per outreach campaign.

### Step 3 — Account Created (pending approval)
- Account lands in admin dashboard's **Pending Approvals** queue.
- User sees in-app message: *"Your TradeWind beta account is pending review. We'll email you within 24 hours."*

### Step 4 — Admin Review (within 24 hours)
Owner reviews in `/admin`:
- Confirms identity matches outreach target.
- Assigns role (Buyer / Dealer / Service Provider / Aircraft Broker / Admin).
- Assigns sub-vertical tags.
- Sets feature flags (e.g., dealer import enabled, aircraft brokerage tier).
- Approves → triggers welcome email + onboarding link.

### Step 5 — Welcome Email Sent
See `PRIVATE_BETA_OUTREACH_TEMPLATES.md` → "You're Approved" template.

### Step 6 — Onboarding Begins
User clicks email → lands on role-specific onboarding flow.

---

## 3. ACCOUNT APPROVAL WORKFLOW (Admin Dashboard)

Admin dashboard route: `/admin/users` and `/admin/approvals`

Per-applicant fields visible:
- Name, email, signup timestamp
- Beta code used (vertical attribution)
- Self-reported company / website
- Self-reported role
- Self-reported use case (free-text from signup)
- Admin actions: **Approve** / **Reject** / **Request More Info** / **Hold**

On approval:
- Role assigned (Buyer / Dealer / Service Provider / Aircraft Broker)
- Sub-vertical tag(s)
- Feature flags toggled (defaults per role)
- Welcome email triggered
- Audit log entry written (`admin-audit-log` edge function)

---

## 4. ROLE ASSIGNMENT MATRIX

| Role | Can Browse | Can List | Can Make Offer | Has Dashboard | Has Concierge | Stripe Tier |
|---|---|---|---|---|---|---|
| Buyer | YES | NO | YES | Buyer Dashboard | Optional add-on | Free / Concierge |
| Dealer | YES | YES (multi) | Receives | Dealer Dashboard | YES | Dealer Pro / Premium |
| Service Provider | YES (limited) | NO (service profile only) | N/A | SP Dashboard | N/A | Service Provider tier |
| Aircraft Broker | YES | YES (aircraft) | Receives | Brokerage Dashboard | YES | Aircraft Brokerage |
| Admin | YES | YES | N/A | Admin Dashboard | N/A | N/A |

Roles are exclusive (no user can self-escalate — confirmed in commit `9fdc2db`). Role changes require admin action with audit log.

---

## 5. ONBOARDING CHECKLIST — PER ROLE

### Buyer Onboarding
- [ ] Welcome video / screen (90 sec, what TradeWind does)
- [ ] Pick interests (boat / auto / aircraft / multiple)
- [ ] Set price band, location radius (optional)
- [ ] Save first 3 listings (gamified prompt)
- [ ] Try Deal Score on a listing
- [ ] Try AI Concierge with a sample question
- [ ] Set Financial Readiness profile (optional)
- [ ] Schedule 15-min founder call (optional)

### Dealer Onboarding
- [ ] Welcome screen + dealer-specific tour
- [ ] Verify business (upload license OR confirm via website match)
- [ ] Choose Stripe tier (Pro / Premium) — *test mode during beta*
- [ ] Add first listing (manual OR import via CSV / feed)
- [ ] Configure dealer profile (logo, bio, locations, hours)
- [ ] Install Lead Widget snippet (optional)
- [ ] Connect calendar (optional, for appointments)
- [ ] Founder onboarding call (mandatory for first 10 dealers)

### Service Provider Onboarding
- [ ] Welcome screen + SP-specific tour
- [ ] Verify business / credentials (license #, insurance, certs if applicable)
- [ ] Create service profile (services offered, coverage area, pricing model)
- [ ] Upload portfolio photos
- [ ] Set lead routing preferences
- [ ] Set availability calendar
- [ ] Configure quote template
- [ ] Founder onboarding call (mandatory for first 5 SPs)

### Aircraft Broker Onboarding
- [ ] Welcome screen + aviation-specific tour
- [ ] Verify broker credentials (NBAA member ID, brokerage name, escrow agent on file)
- [ ] Compliance review: no claims that violate FAR Part 135/91 advertising rules
- [ ] First listing walkthrough (logbooks, damage history, total time, engine status)
- [ ] Founder onboarding call (mandatory for ALL brokers)

---

## 6. FEEDBACK CAPTURE

Standard 4-question format (from existing beta templates):

1. **What worked?** — What felt natural, intuitive, valuable?
2. **What broke?** — What didn't work, was confusing, or felt incomplete?
3. **What's missing?** — What would you expect that we don't have?
4. **Would you pay?** — At what price tier, with what features, for what value?

Delivery channels:
- In-app feedback widget (always-visible "Send Feedback" button)
- Weekly email survey (Day 7, Day 14, Day 30)
- Founder-led 30-minute interview at Day 14 (mandatory for dealers + SPs, optional for buyers)
- Slack channel (private, invite-only — see section 9)

---

## 7. BUG REPORTING PROCESS

Beta users submit bugs via:
1. **In-app "Report Bug" button** (preferred — auto-captures URL, user agent, timestamp, screenshot)
2. **Email to `morrisondon89@gmail.com`** (fallback)
3. **Slack #bugs channel** (real-time)

All bugs flow into the triage process documented in `BUG_TRIAGE_BOARD.md`. P0/P1 acknowledged within 4 hours, P2 within 24 hours.

---

## 8. WEEKLY REVIEW CADENCE

**Every Monday morning (Owner: Don):**
- Pull beta dashboard metrics (active users, listings created, offers made, concierge sessions, lead-routes)
- Review prior week's bug triage board — close anything fixed, re-prioritize open
- Review prior week's feedback responses — categorize themes
- Send weekly beta digest email to all users: "Here's what shipped this week, here's what's next, here's how to give feedback"
- Update `PRIVATE_BETA_LAUNCH_PACKAGE.md` success metrics

**Every Friday afternoon:**
- Founder calls (3–5 per week, 30 min each, rotating through cohort)
- Update target tracker (`FIRST_30_BETA_TARGETS.md`)

---

## 9. ADMIN MONITORING

Daily admin scan via `/admin`:
- New signups awaiting approval
- New listings awaiting moderation
- Stripe events (test mode — verify no production charge attempts)
- Edge function error rates (Supabase dashboard)
- Anthropic / OpenAI quota
- Active concierge sessions
- Open lead-routes awaiting SP response

Optional: private Slack workspace (`tradewind-beta.slack.com`) with channels:
- `#announcements` — owner posts only
- `#feedback` — users post freely
- `#bugs` — bug reports
- `#dealers`, `#brokers`, `#service-providers`, `#buyers` — role-specific
- `#wins` — celebrate first listing, first offer, first close

---

## 10. BETA APPLICATION TRACKING STRUCTURE

Tracked in admin DB + mirrored in `FIRST_30_BETA_TARGETS.md` spreadsheet.

Fields per applicant:
- `id` (UUID)
- `company_name`
- `contact_name`
- `role` (buyer / dealer / service_provider / aircraft_broker)
- `sub_vertical` (boat / auto / aircraft / exotic / classic / luxury / etc.)
- `email`
- `phone` (optional)
- `linkedin` (optional)
- `website`
- `outreach_status` (not_contacted / contacted / interested / scheduled_demo / approved / declined / active / churned)
- `outreach_date`
- `last_contact_date`
- `approval_date`
- `first_login_date`
- `first_listing_date` (dealers/brokers only)
- `feedback_count`
- `bug_reports_count`
- `notes` (free-text founder notes)

---

## 11. SUCCESS GATES — WHEN TO EXPAND COHORT

**Move from 3–5 → 15 users when:**
- 3+ users have logged in and used core flows (browse, listing, concierge, offer)
- 0 open P0/P1 bugs
- At least 1 dealer has imported real inventory
- At least 1 service provider has completed onboarding
- Feedback themes are positive or actionable (no fundamental misalignment)

**Move from 15 → 30 users when:**
- 10+ users actively using the platform weekly
- At least 3 real listings live (not demo)
- At least 1 real lead routed to a service provider
- At least 1 concierge conversation that produced a buyer-side outcome
- Stripe test flow exercised by at least 1 dealer signup
- 0 open P0/P1 bugs

**Move from 30 → public beta when:**
- Stripe live mode enabled
- Domain cutover complete (`gotradewind.com`)
- At least 1 transaction completed end-to-end
- All vendor-dependent items either live or clearly gated
- NPS / qualitative feedback overwhelmingly positive

---

**Beta access is the heartbeat of go-live. Move deliberately. Quality of users > quantity.**
