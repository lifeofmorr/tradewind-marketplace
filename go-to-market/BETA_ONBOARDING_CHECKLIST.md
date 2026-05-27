# Beta Onboarding Checklist

**Owner:** Don Morrison
**Date:** 2026-05-27
**Used by:** Don, during or right after a successful demo.

When a prospect says yes to listing real inventory, partnering, or being a
beta buyer, walk them through onboarding within 24 hours. The checklist
below is per-role. Each step is something that has to happen — either by
Don or by the prospect — before they're a useful beta participant.

Reference the relevant role onboarding doc in the repo root for the long
form:

- `DEALER_BETA_ONBOARDING.md`
- `SELLER_BETA_ONBOARDING.md`
- `SERVICE_PROVIDER_BETA_ONBOARDING.md`
- `BUYER_BETA_TEST_GUIDE.md`

This checklist is the short, action-oriented version.

---

## Universal first steps (every role)

1. **Send the beta invite email** (see `POST_DEMO_FOLLOW_UPS.md` template
   2). Include their direct signup link.
2. **Update CRM**:
   - `outreach_leads.beta_invited = true`
   - `beta_pipeline.stage = beta_invited`
   - `beta_pipeline.beta_type = seller_beta | partner_beta | buyer_beta`
3. **Confirm they signed up** (watch for the new auth event in the admin
   panel or `site_events`).
4. **Personal onboarding nudge** within 24 hours: "Saw you signed up —
   want me to walk you through the first listing / first lead?"

When they complete the first meaningful action (listing live, partner
profile verified, first compare saved), move:
   - `beta_pipeline.stage = onboarded` (or `beta_onboarded` once the
     migration lands)
   - `outreach_leads.notes` — add a date-stamped note.

---

## Dealer / Yacht Broker / Auto Dealer

**Goal:** First real listing live within 7 days.

- [ ] Create account at `/beta` signup.
- [ ] Assign **Dealer** role (Don, via admin panel — `/admin/users`).
- [ ] Complete business profile: name, logo, location, coverage area,
      website, contact, hours.
- [ ] Verify business (license number, dealer ID, or trade reference —
      whichever applies to their vertical).
- [ ] Upload first listing — premium unit ideal, full photos, full specs,
      Asset Passport documents.
- [ ] Confirm dealer dashboard renders inventory + leads correctly.
- [ ] Walk through buyer request / lead flow — answer one inbound request
      together if one comes in.
- [ ] Show Transaction Room — open a sample deal so they see the
      paperwork slots.
- [ ] Capture feedback into `beta_pipeline.feedback_notes`.
- [ ] Send the "what worked, what didn't" follow-up after 7 days.

**Don's eyes-on tasks:**

- Watch their first listing land — verify photos, specs, Asset Passport.
- Tag the first inbound buyer request from their inventory.
- Set `real_listing_candidate = true` once at least one real listing is
  live.

---

## Aircraft Broker

**Goal:** First aircraft listing live within 14 days (longer because of
log-book + equipment data).

- [ ] Create account at `/beta` signup.
- [ ] Assign **Aircraft Broker** role.
- [ ] Complete profile: brokerage, certifications, coverage, contact.
- [ ] Upload first aircraft listing — full airframe / engine / prop times,
      equipment list, log status, recent inspection / annual records.
- [ ] Set pre-buy expectations on the listing (preferred providers, what
      pre-buy includes).
- [ ] Walk through pre-buy workflow — open a Transaction Room and show
      how a buyer requests a pre-buy in-thread.
- [ ] Walk through Transaction Room: title, escrow, financing, insurance,
      transport (ferrying).
- [ ] Confirm the broker dashboard renders inventory + buyer requests.
- [ ] Capture feedback into `beta_pipeline.feedback_notes`.

**Don's eyes-on tasks:**

- Verify the aircraft listing has full log-book status — that's the
  highest-trust signal for the aircraft side.
- Test a pre-buy request end-to-end with a verified service provider.
- Set `real_listing_candidate = true` once first listing is live.

---

## Service Provider (surveyor, mechanic, transporter, escrow, title, financing, insurance)

**Goal:** Profile live + first lead within 14 days.

- [ ] Create account at `/beta` signup.
- [ ] Assign **Service Provider** role.
- [ ] Complete profile: business name, categories (Survey / Mechanical /
      Transport / Escrow / Title / Financing / Insurance), coverage area
      (geographic + asset types), credentials (license, accreditation,
      insurance certs).
- [ ] Enable lead notifications (email + in-app).
- [ ] Walk through what an inbound request looks like — open a sample
      Transaction Room with a pre-buy request.
- [ ] Confirm they can quote in-thread.
- [ ] Capture feedback into `beta_pipeline.feedback_notes`.
- [ ] Set `partner_candidate = true` if they're a fit for a deeper
      integration (Plaid, VIN, partner API).

**Don's eyes-on tasks:**

- Manually route one inbound request to them within 7 days so they see
  the workflow live.
- Verify their credentials (license, insurance certs) actually check out.
- For high-fit partners (escrow, title, financing, insurance, Plaid /
  VIN / inspection APIs), advance to a partner integration conversation.

---

## Buyer / Advisor

**Goal:** Save + compare two listings, leave one piece of feedback.

- [ ] Create account at `/beta` signup.
- [ ] Browse inventory in their vertical.
- [ ] Save at least 2 listings.
- [ ] Use Compare view on saved listings.
- [ ] Leave one feedback note via `/feedback` or the in-app widget.
- [ ] Optional: schedule a 30-day beta call to share what they'd want
      next.

**Don's eyes-on tasks:**

- Note what they searched for vs. what they saved (gap = inventory we
  need).
- Capture what they wanted to filter on but couldn't.
- If they're a high-net-worth advisor, set `partner_candidate = true`
  for a possible advisor program.

---

## Stage progression cheat sheet

| Trigger | Stage moves to |
|---|---|
| Lead replies positively | `interested` |
| Demo on calendar | `wants_demo` |
| Demo time confirmed | `demo_booked` |
| Demo happened | `demo_completed` |
| Beta invite sent | `beta_invited` |
| Account live + first listing/profile | `beta_onboarded` |
| Listing one or more real assets | `real_listing_candidate` |
| Signed (or quoted) for partner integration | `partner_candidate` |
| Verbally indicated pay-after-beta interest | `paid_candidate` |
| Wants to revisit later | `follow_up_later` |
| Explicit no | `not_interested` |
| Opted out / DNC | `declined` |

Use the Beta Pipeline tab on `/admin/outreach` to move them through.

---

## What "onboarded" means

A lead is `beta_onboarded` only when:

- Account exists and is verified.
- Role is assigned correctly.
- Profile is meaningfully complete.
- At least one meaningful first action is done (listing posted, profile
  verified, lead responded to, comparison saved).
- Don has seen the activity in admin and tagged the lead.

Anything less and they stay at `beta_invited`. Don't inflate the funnel.
