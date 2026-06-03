# First Customer Workflows - TradeWind Marketplace

**Platform:** https://tradewind-marketplace.vercel.app
**Support Email:** don@lifeofmorr.com

Each workflow covers: intake, review, onboarding, what to show/collect/not promise, next step, success metric.

---

## 1. First Dealer

**Intake:** Dealer signs up at /signup?role=dealer or contacts via email/outreach.

**Review:** Admin reviews dealer application:
- Business name, location, inventory category
- Verify business exists (Google, website, social)
- Check for dealership license (if applicable)

**Onboarding:**
- Dealer completes /onboarding/dealer (profile, subscription selection)
- Admin sets subscription in Stripe (14-day free trial)
- Dealer imports inventory via CSV or creates listings manually

**What to Show:** Live dealer profile page, inventory management, lead inbox, analytics dashboard, CSV import tool.

**What to Collect:** Business name, contact info, inventory category, location, subscription tier preference.

**What NOT to Promise:** Guaranteed buyer traffic, specific lead volume, immediate ROI. TradeWind is a new marketplace building its audience.

**Next Step:** First listing goes live → monitor engagement → check-in after 7 days.

**Success Metric:** Dealer has 3+ active listings and has received at least 1 inquiry within 30 days.

---

## 2. First Aircraft Broker

**Intake:** Broker reaches out via /contact, /beta, or outreach response.

**Review:** Verify broker credentials, FAA registry checks if applicable. Aircraft brokers often work with high-value inventory — extra care required.

**Onboarding:** Same as dealer flow with aircraft category selected. Emphasize aircraft-specific features: spec panels, walkaround cards, pre-buy request forms, N-number verification.

**What to Show:** Aircraft listing pages (/aircraft, /jets, /helicopters), aircraft spec forms, walkaround generator, aviation services marketplace.

**What to Collect:** FAA certificate (if applicable), business info, sample inventory, preferred aircraft types.

**What NOT to Promise:** Airworthiness verification, title search, escrow services, or any aviation regulatory compliance. TradeWind is a listing platform, not an aviation authority.

**Next Step:** First aircraft listing live → monitor → share walkaround feature feedback.

**Success Metric:** Broker has 2+ aircraft listed with complete specs and photos within 14 days.

---

## 3. First Service Provider

**Intake:** Service provider applies at /signup?role=service_provider or via outreach.

**Review:** Verify service type (financing, insurance, surveyor, transport, etc.), check licensing where applicable.

**Onboarding:** Provider completes /onboarding/service-provider (profile, service categories, coverage area). Admin activates subscription ($89/mo with trial).

**What to Show:** Directory profile, lead inbox, service request routing, reviews system.

**What to Collect:** Business info, service categories, coverage area/states, licensing info, response time commitment.

**What NOT to Promise:** Guaranteed lead volume, exclusive territory, direct buyer connections. Leads come from buyer service requests — volume depends on marketplace growth.

**Next Step:** Profile live → first service request routed → check-in after 14 days.

**Success Metric:** Provider has complete profile, has responded to at least 1 lead within 21 days.

---

## 4. First Real Listing

**Intake:** Seller creates account and listing via /seller/listings/new.

**Review:** Admin reviews per REAL_LISTING_APPROVAL_SOP.md (photos, description, price, ownership verification, fraud check).

**Onboarding:** Help seller through listing creation. Offer AI listing generator for description. Ensure high-quality photos.

**What to Show:** Listing creation flow, AI-generated description, pricing estimates, photo upload, listing preview.

**What to Collect:** Asset details, photos (actual unit), price, seller contact info, HIN/VIN/N-number.

**What NOT to Promise:** Sale within any timeframe, specific number of views, buyer contact guarantees.

**Next Step:** Listing approved → goes live → monitor views and inquiries → seller check-in after 7 days.

**Success Metric:** Listing receives at least 3 views and 1 inquiry within 14 days.

---

## 5. First Concierge Inquiry

**Intake:** Buyer submits via /concierge page. AI concierge intake chat helps gather requirements.

**Review:** Admin reviews parsed requirements (budget, features, timeline, locations) in /admin/requests.

**What to Show:** Concierge chat flow, requirement summary, search process explanation.

**What to Collect:** Budget range, desired make/model/type, must-have features, location preference, timeline.

**What NOT to Promise:** Guaranteed match, specific timeline for results. Promise: if no qualifying match found, full refund of $499 engagement fee.

**Next Step:** Requirements confirmed → manual sourcing begins → update buyer on progress weekly.

**Success Metric:** Match presented within 30 days, or refund processed.

---

## 6. First Paid Featured Listing

**Intake:** Seller selects "Feature my listing" ($79/30 days) from listing management.

**Review:** Verify listing is approved and active before allowing featured purchase.

**Onboarding:** Seller clicks feature CTA → Stripe checkout → payment confirmation → listing marked as featured.

**What to Show:** Featured badge on listing, priority placement in browse/search results, analytics showing increased views.

**What to Collect:** Payment via Stripe checkout.

**What NOT to Promise:** Specific view count increase, guaranteed inquiries, guaranteed sale.

**Next Step:** Monitor featured listing performance → share analytics with seller after 7 days.

**Success Metric:** Featured listing receives 2x+ views compared to non-featured listings in same category.

---

## 7. First Paid Dealer Subscription

**Intake:** Dealer selects subscription tier during onboarding or from /pricing.

**Review:** Verify dealer business legitimacy. Confirm subscription tier matches needs (Starter: 25 listings, Pro: 100, Premier: unlimited).

**Onboarding:** Stripe checkout → subscription active → full dashboard access → import inventory.

**What to Show:** Subscription benefits per tier, dashboard features, import tools, analytics.

**What to Collect:** Payment via Stripe, business verification.

**What NOT to Promise:** Guaranteed ROI, specific lead volume, exclusive territory.

**Next Step:** Inventory imported → first week check-in → analytics review at 30 days.

**Success Metric:** Dealer active with 5+ listings at 30 days, subscription renewed at 60 days.

---

## 8. First Partner Inquiry

**Intake:** Partner contacts via /contact, /integrations, or outreach response. Could be: financing partner, insurance partner, transport company, technology partner.

**Review:** Evaluate partnership fit, verify business, assess integration requirements.

**What to Show:** Integrations page, developer hub, partner match panel (admin), connected apps framework.

**What to Collect:** Business info, integration type, API capabilities, coverage area, pricing model.

**What NOT to Promise:** Exclusive partnership, guaranteed referral volume, immediate integration. Connected apps framework exists but custom integrations need development.

**Next Step:** Initial call → scope integration → pilot agreement → build integration.

**Success Metric:** Partnership agreement signed, integration live within 90 days.
