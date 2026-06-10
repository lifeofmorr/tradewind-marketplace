# TradeWind Marketplace -- Live Business Readiness Audit

**URL:** https://tradewind-marketplace.vercel.app
**Stack:** React 18 + Vite / Supabase (Postgres + Edge Functions + Auth + Storage) / Stripe / Vercel
**Audit date:** 2026-06-03
**Auditor:** Automated codebase analysis

---

## Summary Table

| # | Area | Status |
|---|------|--------|
| 1 | Public Website | LIVE READY |
| 2 | Beta Funnel | LIVE READY |
| 3 | Feedback System | LIVE READY |
| 4 | Admin Dashboard | LIVE READY |
| 5 | Outreach System | SAFE FOR BETA |
| 6 | Buyer Dashboard | SAFE FOR BETA |
| 7 | Seller Dashboard | SAFE FOR BETA |
| 8 | Dealer Dashboard | SAFE FOR BETA |
| 9 | Service Provider Dashboard | SAFE FOR BETA |
| 10 | Aircraft Vertical | SAFE FOR BETA |
| 11 | Demo Listings | LIVE READY |
| 12 | Real Listing Path | SAFE FOR BETA |
| 13 | Payments | NEEDS FIX |
| 14 | AI Features | SAFE FOR BETA |
| 15 | Security | SAFE FOR BETA |
| 16 | Legal Pages | LIVE READY |
| 17 | Analytics / Tracking | SAFE FOR BETA |
| 18 | Support | LIVE READY |
| 19 | Vendor Integrations | REQUIRES VENDOR |
| 20 | Deployment | LIVE READY |

**Totals:** 7 LIVE READY, 10 SAFE FOR BETA, 1 NEEDS FIX, 1 REQUIRES VENDOR

---

## 1. Public Website

**Status: LIVE READY**

### What is working

- All public routes render inside `PublicShell` (Header + Footer): `/`, `/browse`, `/about`, `/contact`, `/support`, `/pricing`, `/how-it-works`, `/blog`, `/market-reports`, `/auctions`, `/categories`.
- Programmatic SEO pages via `SeoPages.tsx` and `CategoryPage.tsx` provide crawlable category and vertical landing pages.
- Sitemap served via Supabase Edge Function, rewritten through `vercel.json` at `/sitemap.xml`.
- Security headers applied globally (see Area 15).

### What needs attention for live

- No critical issues. Content should be reviewed for final copy before announcing publicly.
- Consider adding `<meta>` descriptions per page for SEO if not already present.

---

## 2. Beta Funnel

**Status: LIVE READY**

### What is working

- `/beta` page (`BetaPage.tsx`) with Calendly embed via `VITE_FEEDBACK_CALL_URL` env var. If the env var is unset, the CTA gracefully routes to `/feedback` instead of producing a dead link.
- `/feedback` page with attribution tracking.
- `site_events` table with RLS allowing anonymous insert; only admins can read rows back.
- Full UTM and `lead_id` attribution capture via `trackEvent.ts`: `parseAttributionFromUrl()` reads UTM params and `lead_id` from the URL, `saveAttribution()` persists to `sessionStorage`, and `readAttribution()` merges them so attribution survives navigation from `/beta` to `/feedback`.
- `BetaCTA.tsx` component provides a reusable call-to-action across the site.
- Session tracking via `sessionStorage` UUID (`tw_sid`).

### What needs attention for live

- Ensure `VITE_FEEDBACK_CALL_URL` is set to the production Calendly or Cal.com link before go-to-market pushes.
- Validate that the `site_events` table has sufficient indexes for admin query patterns.

---

## 3. Feedback System

**Status: LIVE READY**

### What is working

- `FeedbackPage.tsx` submits form data as `feedback_submit` and `feedback_submitted` events to `site_events`.
- Attribution data (UTM source, campaign, lead_id) is automatically merged into every event via `trackEvent()`, tying feedback back to the outreach campaign that drove it.
- Admin review via `/admin/beta-inbox` (`AdminBetaInbox.tsx`) displays submitted leads with company, contact name, vertical, email, personalization angle, pain point, recommended offer, and priority.

### What needs attention for live

- No blockers. Confirm admin notification flow exists so feedback is acted on promptly.

---

## 4. Admin Dashboard

**Status: LIVE READY**

### What is working

- 12 admin pages, all under role-protected routes:
  - `AdminDashboard` -- overview and metrics
  - `AdminListings` -- listing moderation (approve/reject)
  - `AdminUsers` -- user management
  - `AdminRequests` -- service request review
  - `AdminFraud` -- fraud detection dashboard
  - `AdminPayments` -- payment oversight
  - `AdminContent` -- content management
  - `AdminBlog` -- blog post management
  - `AdminMarketReports` -- market report management
  - `AdminAuctions` -- auction oversight
  - `AdminOutreach` -- outreach campaign management
  - `AdminBetaInbox` -- beta lead triage
- `PartnerMatchPanel.tsx` provides partner matching from admin context.

### What needs attention for live

- Verify that admin role check cannot be bypassed via client-side manipulation (RLS on the backend enforces this, but confirm route guard is airtight).
- Consider adding audit logging for admin actions (approve, reject, user role changes).

---

## 5. Outreach System

**Status: SAFE FOR BETA**

### What is working

- Admin outreach page (`AdminOutreach.tsx`) with campaign builder, lead management, and email verification status tracking.
- 5 outreach library modules (1,110 lines total):
  - `followupTemplates.ts` -- FU1, FU2, close-loop follow-up sequences
  - `replyTemplates.ts` -- reply handling templates
  - `fallbackMessageGenerator.ts` -- AI-free fallback message generation (495 lines)
  - `csvImport.ts` -- CSV lead import
  - `messageQuality.ts` -- outreach message quality scoring
- 3 Supabase Edge Functions: `build-daily-queue`, `classify-outreach-reply`, `generate-outreach-message`.
- Do-not-contact and bounced-email filtering.
- 50 go-to-market campaign files covering demo prep, scripts, follow-up playbooks, reply operations, calendar setup, and CRM rules.

### What needs attention for live

- Daily follow-up Edge Function (`build-daily-queue`) needs a cron trigger configured in Supabase.
- Email sending depends on the `send-email` Edge Function; confirm the sending provider (Resend, SendGrid, etc.) is wired and has production API keys.
- Deliverability: set up SPF/DKIM/DMARC for the sending domain.

---

## 6. Buyer Dashboard

**Status: SAFE FOR BETA**

### What is working

- Dashboard home (`BuyerDashboard.tsx`) with trust score readiness cards.
- Saved listings / watchlist (`BuyerSaved.tsx`) with demo listing awareness.
- Service requests (`BuyerRequests.tsx`).
- Reviews (`BuyerReviews.tsx`).
- Comparison tool (`BuyerCompare.tsx`) with demo listing filtering.
- Financial hub (`FinancialHub.tsx`).
- Trust score engine (`trustScore.ts`).

### What needs attention for live

- Financial hub requires Plaid integration for live bank verification (currently not wired).
- Comparison tool should be tested with real (non-demo) listings once available.

---

## 7. Seller Dashboard

**Status: SAFE FOR BETA**

### What is working

- Dashboard home (`SellerDashboard.tsx`).
- Listings manager (`SellerListings.tsx`).
- Create listing (`CreateListing.tsx`) and edit listing (`EditListing.tsx`) with AI listing generator integration.
- Inquiries management (`SellerInquiries.tsx`).
- Auction management (`SellerAuctions.tsx`).

### What needs attention for live

- Listing photo upload flow should be stress-tested with large image files and multiple uploads.
- Listing status workflow (draft, pending_review, active, sold, expired) should be documented for seller onboarding.

---

## 8. Dealer Dashboard

**Status: SAFE FOR BETA**

### What is working

- Growth command center (`DealerDashboard.tsx`).
- Inventory management (`DealerInventory.tsx`).
- CSV/bulk import (`DealerImport.tsx`).
- Connected apps and widgets (`DealerWidgets.tsx`) with Calendly and other integrations listed.
- Lead management with scoring (`DealerLeads.tsx`).
- Analytics (`DealerAnalytics.tsx`).
- Profile editor (`DealerProfilePage.tsx`).
- Public-facing dealer profile (`DealerProfile.tsx`).
- Onboarding guard (`OnboardingGuard.tsx`) redirects dealers without a `dealer_id` to `/onboarding/dealer` until setup is complete.
- Dedicated onboarding flow (`DealerOnboarding.tsx`).

### What needs attention for live

- CSV import should validate schema and handle edge cases (duplicate VINs, missing required fields).
- Dealer subscription tiers (Starter, Pro, Premier) are defined but require Stripe live mode for real billing.

---

## 9. Service Provider Dashboard

**Status: SAFE FOR BETA**

### What is working

- Dashboard home (`ServiceDashboard.tsx`).
- Lead management (`ServiceLeads.tsx`).
- Profile form (`ServiceProviderProfileForm.tsx`).
- Public-facing profile (`ServiceProviderProfile.tsx`).
- Onboarding guard active: service providers without a `service_provider_id` are redirected to `/onboarding/service-provider`.
- Dedicated onboarding flow (`ServiceProviderOnboarding.tsx`).
- Aviation services marketplace page (`AviationServicesPage.tsx`).

### What needs attention for live

- Service provider subscription (`VITE_STRIPE_PRICE_SERVICE_PROVIDER`) requires Stripe live mode.
- Lead routing from buyer service requests to matched providers should be validated end-to-end.

---

## 10. Aircraft Vertical

**Status: SAFE FOR BETA**

### What is working

- Dedicated pages: `/aircraft` (`AircraftPage.tsx`), plus SEO routes for `/jets`, `/helicopters`, `/airplanes`.
- Specialized components:
  - `AircraftSpecPanel.tsx` -- aircraft-specific specification display
  - `AircraftWalkaroundCard.tsx` -- AI walkaround/inspection script generator
  - `AircraftPrebuyRequest.tsx` -- pre-buy inspection request form
  - `AircraftSpecsForm.tsx` -- aircraft specification entry form
- Aviation safety checks (`aviationSafety.ts`) with test coverage (`aviation.test.ts`).
- `AviationServicesPage.tsx` for aviation-specific service marketplace.
- Video walkaround component (`VideoWalkaround.tsx`) for listing media.

### What needs attention for live

- Aircraft walkaround script calls an AI Edge Function; verify prompt quality produces accurate inspection checklists for the specific aircraft types listed.
- Aviation disclaimers should be reviewed by someone with industry knowledge to ensure regulatory compliance (FAA/EASA references, airworthiness statements).
- No live aircraft listings yet; vertical depends on seller/dealer adoption.

---

## 11. Demo Listings

**Status: LIVE READY**

### What is working

- Demo seed data uses `is_demo` flag on listings, checked across 15 files in the codebase.
- Demo photo URLs sourced from Unsplash CDN via `demoMediaMap.ts`.
- Demo disclaimer displayed on demo listings via `demoDisclaimer.ts`.
- Demo-aware filtering in comparison tool, saved listings, admin dashboard, and deal scoring.
- Backfill scripts available for populating demo photos and descriptions.

### What needs attention for live

- Ensure demo listings are clearly distinguishable from real listings for all users, not just via a small disclaimer.
- Consider a visual badge or overlay on demo listing cards.

---

## 12. Real Listing Path

**Status: SAFE FOR BETA**

### What is working

- Full create/edit listing flow with photo uploader.
- Listing status workflow: `draft` -> `pending_review` -> `active` -> `sold`/`expired`.
- Admin moderation via `AdminListings.tsx` (approve/reject with status transitions).
- AI listing generator (`ai-listing-generator` Edge Function) for assisted listing creation.
- Listing autopilot (`ai-listing-autopilot` Edge Function) for automated listing improvement suggestions.
- Inquiry fraud check (`inquiry-fraud-check` Edge Function) for incoming inquiry screening.
- `ListingDetail.tsx` handles full listing view with tracking events.

### What needs attention for live

- No real listings exist yet; first real listings will require admin approval workflow to be exercised.
- Photo storage bucket RLS policies should be verified for the upload path.
- Consider adding listing expiration automation.

---

## 13. Payments

**Status: NEEDS FIX**

*For live revenue collection. Safe for beta in test mode.*

### What is working

- Stripe integration via `stripe.ts` with publishable key detection (`pk_test_` prefix check).
- 7 price IDs configured for test mode:
  - `VITE_STRIPE_PRICE_FEATURED_LISTING` -- featured listing upgrade
  - `VITE_STRIPE_PRICE_BOOST_LISTING` -- listing boost
  - `VITE_STRIPE_PRICE_DEALER_STARTER` -- dealer starter subscription
  - `VITE_STRIPE_PRICE_DEALER_PRO` -- dealer pro subscription
  - `VITE_STRIPE_PRICE_DEALER_PREMIER` -- dealer premier subscription
  - `VITE_STRIPE_PRICE_SERVICE_PROVIDER` -- service provider subscription
  - `VITE_STRIPE_PRICE_CONCIERGE` -- concierge service
- Checkout flow via `stripe-checkout` Supabase Edge Function.
- Webhook handling via `stripe-webhook` Edge Function.
- Success and cancel pages (`CheckoutPages.tsx`).
- Admin payment dashboard (`AdminPayments.tsx`).
- Test-mode indicator displayed when `pk_test_` key is detected.

### What needs attention for live

- **Stripe live mode activation required.** All 7 price IDs must be recreated in Stripe live mode and corresponding env vars updated.
- **Webhook endpoint must be registered in Stripe Dashboard** for the production URL and verified with the signing secret.
- **Stripe live publishable key** must replace `pk_test_xxx` in production environment.
- **PCI compliance:** confirm no card data touches the server (Stripe.js handles this, but verify the flow).
- **Refund policy** should be documented and accessible from checkout.
- Tax collection (Stripe Tax or manual) not yet configured.

---

## 14. AI Features

**Status: SAFE FOR BETA**

### What is working

- 8 AI workflows via Supabase Edge Functions (all using Anthropic API via `_shared/anthropic.ts`):
  1. `ai-listing-generator` -- generates listing descriptions from specs
  2. `ai-buyer-assistant` -- buyer-facing Q&A assistant
  3. `ai-fraud-check` -- listing fraud detection
  4. `ai-pricing-estimate` -- market-based pricing estimates
  5. `ai-concierge-intake` -- concierge service intake processing
  6. `ai-listing-autopilot` -- automated listing improvement
  7. `ai-negotiation-assistant` -- offer/negotiation guidance
  8. `ai-pricing-estimate` -- pricing intelligence
- Additional AI-adjacent features in the frontend:
  - Deal scoring (`dealScore.ts`)
  - Lead scoring (dealer leads)
  - Ownership cost calculations
  - Match engine
  - Market pulse analysis (`marketPulse.ts`)
  - Aircraft walkaround script generation
- All AI outputs include disclaimers that estimates are not professional advice.

### What needs attention for live

- `ANTHROPIC_API_KEY` must be set as a Supabase Function Secret for production.
- Rate limiting on AI Edge Functions should be implemented to prevent abuse and cost overruns.
- AI output quality should be reviewed for each vertical (boats, cars, aircraft, powersports) to ensure domain accuracy.
- Cost monitoring: each AI call incurs API charges; set up alerts for unexpected spikes.

---

## 15. Security

**Status: SAFE FOR BETA**

### What is working

- **Row Level Security (RLS):** Active on key tables across 10+ migration files. Policies cover profiles, listings, outreach, admin notifications, asset verifications, community, and ecosystem tables. `site_events` allows anonymous insert, admin-only read.
- **Role-based route protection:** Admin pages are guarded by role check. Dealer/service-provider dashboards use `OnboardingGuard.tsx`.
- **Self-role-escalation prevention:** Dedicated migration (`20260521_prevent_self_role_escalation.sql`) prevents users from promoting their own role via profile update.
- **Security headers** in `vercel.json`:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Content-Security-Policy` with restrictive directives (self, Stripe, Plaid, Supabase, Google Fonts)
- **No secrets in frontend code.** All `VITE_*` vars are explicitly documented as public. Sensitive keys live in Supabase Function Secrets.
- **Supabase anon key** is public by design (frontend auth token, scoped by RLS).
- **Fraud detection system** via `ai-fraud-check` and `inquiry-fraud-check` Edge Functions plus `AdminFraud.tsx` dashboard.

### What needs attention for live

- **CSP uses `unsafe-inline` for scripts and styles.** This is common for React/Vite SPAs but weakens XSS protection. Consider using nonce-based CSP if feasible.
- Conduct a security review of all RLS policies before processing real user data.
- Verify that `SECURITY DEFINER` functions cannot be exploited via parameter injection.
- Enable Supabase Auth email confirmation for production signups.
- Consider adding rate limiting on auth endpoints and public API routes.

---

## 16. Legal Pages

**Status: LIVE READY**

### What is working

- `/terms` -- Terms of Service covering marketplace role, account responsibilities, listing standards, payments, and disclaimers.
- `/privacy` -- Privacy Policy.
- `/trust` -- Trust Center (`TrustCenter.tsx`).
- `/delete-my-data` -- Data deletion request page (`DataDeletion.tsx`).
- All legal pages are linked in the footer.
- Terms cover the marketplace's role as an intermediary, not a direct seller.

### What needs attention for live

- Legal pages should be reviewed by a lawyer before the platform processes real transactions or handles user PII at scale.
- CCPA/GDPR compliance: verify the data deletion page actually triggers data removal in Supabase, not just a request form.
- Cookie consent banner may be needed depending on jurisdiction and analytics setup.

---

## 17. Analytics / Tracking

**Status: SAFE FOR BETA**

### What is working

- `trackEvent()` system in `trackEvent.ts`: fire-and-forget insert to `site_events` table.
- 14+ defined event types: `beta_page_view`, `request_beta_click`, `feedback_submit`, `feedback_submitted`, `book_call_click`, `listing_detail_view`, `contact_form_submit`, `support_page_view`, `dealer_cta_click`, `service_cta_click`, `aircraft_cta_click`, `pricing_page_view`, `payment_attempt`, `payment_complete`.
- Full attribution capture: UTM params (`source`, `medium`, `campaign`, `term`, `content`), `lead_id`, `referrer`, `landing_page`.
- Attribution persistence across pages via `sessionStorage` with merge semantics (never overwrites known values with undefined).
- Session tracking via UUID stored in `sessionStorage`.
- Telemetry module (`telemetry.ts`) available.
- Sentry integration prepared: `VITE_SENTRY_DSN` env var exists in `.env.local.example` but is empty/unset.

### What needs attention for live

- **Sentry is not wired.** Set `VITE_SENTRY_DSN` to enable client-side error reporting before going live. This is important for catching production errors.
- No server-side analytics (page views, unique visitors). Consider adding a lightweight analytics tool (Plausible, PostHog, or similar) for traffic reporting.
- `site_events` table will grow unbounded; implement a retention/archival policy.
- No dashboard for non-admin analytics review; all event data is only visible via `AdminDashboard` or direct database queries.

---

## 18. Support

**Status: LIVE READY**

### What is working

- `/contact` page with contact form (submissions tracked via `contact_form_submit` event).
- `/support` page (`support_page_view` tracking) with documented response times.
- Support email: `don@lifeofmorr.com` (configured in `brand.ts` as `BRAND.supportEmail`).
- Email displayed on contact page with `mailto:` link.
- Admin outreach page includes "Founder support (text/email Don directly)" as a support option.

### What needs attention for live

- Consider setting up a dedicated support email (e.g., `support@tradewindmarketplace.com`) before scaling beyond beta.
- No ticketing system or SLA tracking; acceptable for beta but will need structure as volume grows.
- Contact form submissions go to `site_events` -- confirm there is a notification mechanism so they are not missed.

---

## 19. Vendor Integrations

**Status: REQUIRES VENDOR**

### What is working

- **Stripe:** Full integration code exists (checkout, webhooks, subscriptions, admin dashboard). Currently in test mode only.
- **Plaid:** Integration code exists (`plaid-link` Edge Function), CSP allows Plaid domains (sandbox, development, production). Not yet wired to the frontend financial hub.
- **Google Maps:** `VITE_GOOGLE_MAPS_API_KEY` slot exists in env config. Not populated.
- **Anthropic (Claude API):** Edge Functions use `_shared/anthropic.ts`. Requires `ANTHROPIC_API_KEY` as Supabase Function Secret.
- **Supabase:** Fully operational (auth, database, storage, Edge Functions, realtime).
- **Vercel:** Fully operational for deployment.

### What needs attention for live

| Vendor | Action Required |
|--------|----------------|
| Stripe | Activate live mode, create live products/prices, set webhook signing secret, update env vars |
| Plaid | Obtain production credentials, wire frontend integration, complete compliance requirements |
| Google Maps | Obtain API key, configure billing, set key restrictions |
| Sentry | Create project, obtain DSN, set `VITE_SENTRY_DSN` |
| Escrow | No integration exists; currently manual process via intake forms |
| Financing | No integration exists; intake forms route to manual processing |
| Insurance | No integration exists; intake forms route to manual processing |
| Transport/Shipping | No integration exists; intake forms route to manual processing |
| Email Sending | Confirm provider (Resend/SendGrid) is configured for `send-email` Edge Function |

---

## 20. Deployment

**Status: LIVE READY**

### What is working

- Vercel deployment at `tradewind-marketplace.vercel.app`.
- `vercel.json` configured with:
  - Security headers (7 headers, see Area 15)
  - Sitemap rewrite to Supabase Edge Function
  - SPA fallback (`/(.*) -> /index.html`)
- Build command: `tsc -b && vite build` (TypeScript type-check + Vite production build).
- Test suite: `vitest run` with jsdom environment. 7 test files covering routes, aviation, outreach, enterprise, and library smoke tests.
- Environment configuration:
  - `.env.local.example` -- local development
  - `.env.production.example` -- production template
  - `.env.staging.example` -- staging template

### What needs attention for live

- Custom domain setup: currently on `*.vercel.app`. Obtain and configure the production domain.
- Verify all production environment variables are set in Vercel dashboard (especially Stripe live keys and Sentry DSN).
- Set up Vercel preview deployments for PR review if not already active.
- Consider enabling Vercel Analytics or Speed Insights for performance monitoring.

---

## Pre-Launch Checklist (Priority Order)

### Must do before accepting real money

1. Activate Stripe live mode and create production products/prices
2. Register Stripe webhook endpoint for production URL
3. Update all `VITE_STRIPE_*` env vars with live values in Vercel
4. Legal review of Terms of Service and Privacy Policy
5. Set up custom domain

### Should do before public launch

6. Wire Sentry DSN for error reporting
7. RLS policy security review
8. Set up email sending provider for transactional emails
9. Configure SPF/DKIM/DMARC for sending domain
10. Set up support email on a dedicated domain
11. Add cookie consent banner if required by jurisdiction

### Can follow after beta

12. Plaid production integration
13. Google Maps API key
14. AI rate limiting and cost monitoring
15. Escrow/financing/insurance/transport vendor integrations
16. Ticketing system for support
17. Server-side analytics tool
18. CSP hardening (replace `unsafe-inline`)
19. Data retention policy for `site_events`
20. Automated listing expiration
