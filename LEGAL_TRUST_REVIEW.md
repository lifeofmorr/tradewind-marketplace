# Legal / Trust / Compliance Review — TradeWind

**Reviewed:** 2026-05-26
**Scope:** all customer-facing legal pages, disclaimers, and compliance touchpoints required for enterprise private beta.

> **Disclaimer:** this is a code/operations-level review. Engage qualified legal counsel for jurisdictional sign-off before public launch.

## 1. Required pages — verified present

| Page | Route | File | Status |
|---|---|---|---|
| Privacy Policy | `/privacy` | `src/pages/SimplePages.tsx::Privacy` | ✅ |
| Terms of Service | `/terms` | `src/pages/SimplePages.tsx::Terms` | ✅ |
| Trust Center | `/trust` | `src/pages/public/TrustCenter.tsx` | ✅ |
| Data Deletion | `/delete-my-data` | `src/pages/public/DataDeletion.tsx` | ✅ |
| About | `/about` | `src/pages/SimplePages.tsx::About` | ✅ |
| Contact | `/contact` | `src/pages/SimplePages.tsx::Contact` | ✅ |
| Pricing | `/pricing` | `src/pages/SimplePages.tsx::Pricing` | ✅ |
| 404 | catch-all | `src/pages/SimplePages.tsx::NotFound` | ✅ |

All pages are eager-loaded so first paint is fast and crawlers see real HTML. `Privacy`, `Terms`, `TrustCenter`, `DataDeletion` are linked from the footer (see `PublicShell`).

## 2. Data subject rights (GDPR / CCPA inspired)

| Right | Implementation | Status |
|---|---|---|
| Right to access | Supabase Auth user data export via admin or self-serve query | ⚙ MS — currently admin email request only |
| Right to deletion | `/delete-my-data` form → `data_deletion_requests` table (RLS-protected) → admin processes within SLA | ✅ |
| Right to correction | Profile editor in `/buyer` / `/seller` dashboards | ✅ |
| Right to portability | CSV export of buyer's saved listings / inquiries | 🛠 NF — admin can export ad-hoc |
| Right to object / restrict | Email opt-out + admin-side restriction flag | ✅ via `profiles.banned` admin-only |
| Right to be informed | Privacy page + signup acknowledgment | ✅ |

## 3. Demo / sandbox disclaimers — verified

| Surface | Disclaimer | File |
|---|---|---|
| Demo listing card | `<TrustBadge type="demo" />` pill on every demo listing | `src/components/listings/ListingCard.tsx:52` |
| Demo listing inquiry form | Banner "Demo listing — inquiries are not sent" | `src/components/listings/InquiryForm.tsx:70` |
| Demo asset passport | "Demo data — not a real asset" banner | `src/components/listings/AssetPassport.tsx:58` |
| Deal score | Confidence label + "Heuristic estimate, verify before purchase" copy | `src/lib/dealScore.ts` |
| AI summary | "AI-generated — verify with seller" caption when `ai_summary` is shown | listing detail page |
| Plaid sandbox | "Sandbox mode — bank linking is simulated" notice in FinancialHub | `src/pages/buyer/FinancialHub.tsx` |
| Escrow / financing | "Connections to vendor partners; quotes shown are estimates" in request pages | `src/pages/RequestPages.tsx` |
| Aircraft prebuy | Safety disclaimer + "Compliance with FAA inspection required" | `src/lib/aviationSafety.ts` |

## 4. Marketplace-specific disclosures

- **Listing accuracy** — Terms state TradeWind does not verify each listing's claims. Buyers are advised to inspect.
- **No fiduciary** — TradeWind facilitates connections; it is not a broker, dealer, lender, or escrow agent.
- **Pricing** — All prices in USD unless otherwise noted; subscriptions auto-renew.
- **AI use** — Buyers/sellers consented to AI processing of listing copy and inquiry text via Terms (covered in §3).
- **Partner referrals** — TradeWind may receive compensation when buyers engage referred finance/insurance/transport partners. Disclosed in Terms.

## 5. Cookies & tracking

- **No 3rd-party tracking ships today** (no Google Analytics, no Meta Pixel).
- `Permissions-Policy: interest-cohort=()` blocks FLoC at the browser level.
- Cookie banner not implemented — currently the only cookies are Supabase Auth session cookies (functional, exempt). When marketing pixels are added, a consent banner is required.

## 6. Email / messaging compliance

- Transactional emails (`send-email` edge fn) include sender info via Resend.
- No bulk marketing send today; when added, ensure CAN-SPAM unsubscribe link.
- Inbound buyer→seller messages logged in `messages` table — RLS-scoped to conversation participants.

## 7. Payments compliance

- **PCI:** scope stays with Stripe — no card data touches our servers.
- **VAT/sales tax:** Stripe Tax recommended once we cross thresholds (see `PAYMENT_PRODUCTION_READINESS.md`).
- **Refund policy:** documented in Terms + linked from `/pricing`.

## 8. Aviation regulatory

- `src/lib/aviationSafety.ts` flags safety disclaimers per aircraft category.
- TradeWind does not certify aircraft airworthiness — buyer is responsible for AD compliance, prebuy inspection, ferry pilot procurement.
- All aviation copy includes "consult your A&P / IA" disclaimer.

## 9. Open legal items (not launch-blocking)

| Item | Owner | When |
|---|---|---|
| Cookie banner (if marketing pixels added) | product | before public launch |
| GDPR DPA template for European buyers | legal | before any EU traffic |
| State-specific dealer license disclosure (varies by US state) | legal | per-state expansion |
| Aviation broker disclosures | legal | per-state |
| Drag-out portability export (self-serve) | engineering | post-launch |
| Verify Privacy/Terms wording with counsel | legal | before public launch |

## 10. Compliance posture summary

| Area | Status |
|---|---|
| Required legal pages present | ✅ |
| Data deletion mechanism | ✅ |
| Demo/sandbox disclaimers visible | ✅ |
| AI disclosure | ✅ |
| Payments PCI scope | ✅ (Stripe) |
| Tracking minimization | ✅ |
| Audit log of admin actions | ✅ |
| Counsel review | 🛠 NF — required before public launch |

**Verdict:** ✅ Ready for **controlled enterprise private beta** with the caveat that public-launch sign-off requires legal counsel review of jurisdiction-specific terms.
