# Live Business Operations Audit — TradeWind (Phase 8)

**Date:** 2026-06-03

## Verdict: Operationally documented and mostly wired. Intake works for service/beta requests; general contact is email-only.

## Customer intake paths
| Path | Mechanism | Status |
|---|---|---|
| Financing/Insurance/Inspections/Transport/Concierge | Form → respective `_requests` table → `send-email` `request_received` (`RequestPages.tsx:17-21,107-387`) | ✅ working (+ now carries partner disclaimer) |
| Beta interest / feedback | `/feedback` → `beta_feedback` → admin inbox + notification | ✅ working (Phase 7) |
| Buyer inquiry on listing | `InquiryForm` → `inquiries` (+ AI fraud screen webhook) | ✅ working; demo listings blocked |
| General contact / support | `/contact` & `/support` are **mailto links + FAQ**, not web forms (`SimplePages.tsx:46-53, 341-377`) | ⚠ gap, not a blocker |

**Recommendation:** add a real contact form (reuse FeedbackPage/RequestPages pattern → a `contact_requests` table) so general inquiries are tracked, not just emailed. Minor.

## Onboarding
- Dealer onboarding (`/onboarding/dealer`) and service-provider onboarding exist behind role guards + `OnboardingGuard`. Real-listing/dealer/aircraft intake SOPs are documented (`REAL_LISTING_ONBOARDING_PROCESS.md`, `REAL_LISTING_APPROVAL_SOP.md`, `DEALER_BETA_ONBOARDING.md`, `SERVICE_PROVIDER_BETA_ONBOARDING.md`).

## Support & reporting
- Support runbook + live support ops documented (`SUPPORT_OPERATIONS_LIVE.md`, `SUPPORT_RUNBOOK.md`, `REFUND_AND_PAYMENT_SUPPORT.md`).
- Admin dashboards cover listings, users, requests, fraud, payments, content, outreach, beta — all behind admin RLS.
- Refunds are a manual Stripe-dashboard process (documented) — acceptable at this scale.

## Supporting SOPs (already present in repo)
`REAL_LISTING_APPROVAL_SOP.md`, `REAL_LISTING_ONBOARDING_PROCESS.md`, `FIRST_CUSTOMER_WORKFLOWS.md`, `INBOUND_PIPELINE_OPERATIONS.md`, `SUPPORT_OPERATIONS_LIVE.md`, `REFUND_AND_PAYMENT_SUPPORT.md`, `DATA_DELETION_PROCESS.md`, `LIVE_OPERATIONS_MANUAL.md`.

## Status
| Item | Verdict |
|---|---|
| Service/beta/inquiry intake | ✅ wired |
| General contact form | ⚠ email-only |
| Onboarding flows + SOPs | ✅ present |
| Support/refund process | ✅ documented (manual) |
