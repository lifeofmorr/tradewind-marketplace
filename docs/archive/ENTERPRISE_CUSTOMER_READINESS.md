# Enterprise Customer Readiness — TradeWind

**Last reviewed:** 2026-05-26
**Scope:** onboarding + support readiness for the controlled enterprise private beta.

Five customer personas, each with its own checklist. All checklists are managed through `/admin/users` + email follow-up by the admin owner.

---

## A. Dealer onboarding

**Onboarding form:** `/onboarding/dealer` (`src/pages/onboarding/DealerOnboarding.tsx`), gated by `<OnboardingGuard>` until `dealer_id` is set.

**Admin checklist:**
- [ ] Confirm signup email matches dealership domain.
- [ ] Verify dealer license (manual — collected via support email).
- [ ] Confirm DBA / legal entity name.
- [ ] Set `dealer.subscription_tier` to expected plan.
- [ ] Walk through dashboard tour: Inventory → Import (CSV) → Leads → Analytics → Widgets → Profile.
- [ ] Confirm Stripe Customer Portal accessible from dealer profile.
- [ ] Set `dealer.verified = true` once docs received.
- [ ] Send welcome email referencing CSV import template.

**Dealer self-serve:**
- Dashboards live at `/dealer/*`.
- CSV template at `/dealer/import` (downloadable).
- Embed widgets at `/dealer/widgets`.

---

## B. Broker onboarding

Brokers use the same role as dealers (`role = 'dealer'`) but with `seller_type = 'broker'` on listings.

**Admin checklist:**
- [ ] Verify brokerage license.
- [ ] Confirm jurisdiction(s).
- [ ] Set up dealer account same flow as A.
- [ ] Enable broker disclosures on profile (auto-injected via `seller_type`).
- [ ] Confirm broker-specific commission / co-broke language acknowledged.

---

## C. Service-provider onboarding

**Onboarding form:** `/onboarding/service-provider` (`src/pages/onboarding/ServiceProviderOnboarding.tsx`).

**Admin checklist:**
- [ ] Verify trade license (mechanic, surveyor, etc.) — collected via support.
- [ ] Confirm service categories from `ServiceCategory` enum.
- [ ] Confirm coverage geographies.
- [ ] Set `service_provider.verified = true` once docs received.
- [ ] Walk through `/service/leads` + `/service/profile`.
- [ ] Enable subscription tier (`service_pro`).
- [ ] Send welcome email.

---

## D. Aircraft-broker onboarding

Aircraft brokers are a specialization of service-provider with category `aircraft_broker` or `aircraft_escrow` / `aircraft_title_company`.

**Admin checklist:**
- [ ] Verify FAA registration / IADA membership where applicable.
- [ ] Verify state aircraft-broker license.
- [ ] Confirm export control acknowledgment (ITAR-relevant aircraft).
- [ ] Same dashboard onboarding as C.
- [ ] Confirm aviation safety disclaimers visible on listings they touch.

---

## E. Lender / insurance onboarding (partner)

Lenders and insurance providers are not Supabase Auth users — they're integration partners. `connectedApps.ts` + `partnerApi.ts` define the hand-off shape.

**Admin checklist:**
- [ ] Sign partner MSA (legal counsel).
- [ ] Receive partner sandbox + production API credentials.
- [ ] Store credentials in Supabase Function Secrets — never in repo.
- [ ] Configure partner row in `partner_quote_requests` routing.
- [ ] Run sandbox quote E2E.
- [ ] Provision production endpoint switch.

---

## F. Beta tester checklist

For each new beta tester (paid or comp'd):

- [ ] Tester is on the **invited list** (private beta).
- [ ] Tester role assigned: `buyer` / `seller` / `dealer` / `service_provider`.
- [ ] Tester receives the appropriate onboarding email.
- [ ] Tester acknowledged the **demo data disclaimer**.
- [ ] Tester has `BUG_REPORT_TEMPLATE.md` link.
- [ ] Admin reads daily feedback inbox.

---

## Support process

### Channels
- **Email:** support@gotradewind.com → routes to admin inbox.
- **In-app:** `/contact` form posts to email.
- **Bug reports:** template at `BUG_REPORT_TEMPLATE.md` — beta testers submit via email.

### SLA targets (private beta)
- P0 (production down): respond < 30 min, fix or rollback < 2 h.
- P1 (feature broken for many): respond < 4 h, fix < 24 h.
- P2 (one user, workaround exists): respond < 1 business day, fix in next release.
- P3 (cosmetic / nice-to-have): respond < 3 business days, ticketed.

### Escalation chain
1. Admin owner triages.
2. If code change needed → engineering owner (founder).
3. If legal / counsel needed → external counsel.
4. If vendor (Stripe / Supabase / Anthropic) outage → vendor support + post status on `/trust`.

See `SUPPORT_RUNBOOK.md` for the full runbook and `BUG_TRIAGE_PROCESS.md` for triage rules.

## Bug reporting flow

1. Tester / customer fills `BUG_REPORT_TEMPLATE.md`.
2. Email arrives — admin triages within SLA.
3. Severity assigned (P0/P1/P2/P3).
4. If reproducible → create GitHub Issue (or internal tracker).
5. If fix is < 1h and risk-low → ship via PR + deploy.
6. If larger → schedule into next release per `RELEASE_CHECKLIST.md`.
7. Notify reporter when fix lands.

## Communication templates

- **Welcome (dealer):** plan ID, dashboard URL, first-action ("import inventory"), support contact.
- **Welcome (service provider):** profile fields to fill, first-lead expectation, support contact.
- **Welcome (buyer beta):** browsing tips, financial hub callout, demo-data note.
- **Outage notice:** plain-language, status, ETA, contact for urgent issues.
- **Resolution notice:** what was wrong, what we changed, what we'll change to prevent.

## Customer feedback loop

- Weekly feedback summary: collate emails + Slack mentions, post in admin notes.
- Monthly feature triage: rank by frequency × persona × revenue impact.
- Quarterly NPS survey: in-app prompt (post-private-beta only).

## Verdict

✅ Onboarding flows + support runbooks are **ready for controlled enterprise private beta**. Public-launch readiness requires expanded support staffing and a status page (current status notices live on `/trust`).
