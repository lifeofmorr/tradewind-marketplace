# TradeWind Feature Audit

Audit date: 2026-04-28
Branch: `claude/youthful-buck-191c59`
Scope: 20 industry-disrupting features promised in `TRADEWIND_ADVANTAGE.md`.

## Legend

- ✅ **Live** — implemented, wired into the right page(s), passes typecheck/build
- 🟡 **Partial** — code exists but not the full vision (missing UI polish, not wired everywhere it should be, or stub implementation)
- ❌ **Missing** — no code in the repo

## Priority 1 — must work before private beta

| # | Feature | Status | Implementation | Wired into |
|---|---------|--------|----------------|------------|
| 2 | Demo Listing labels | ✅ Live | `is_demo` column, `TrustBadge type="demo"`, `lib/badges.ts:114` | `ListingCard:52`, `InquiryForm:70` (blocks contact), `ListingDetail` (suppresses score/cost) |
| 3 | Verified Badge System | ✅ Live | `lib/badges.ts` (BadgeType union: verified_dealer, premium, featured, demo, etc.), `components/ui/TrustBadge.tsx` | `ListingCard` (chips + corner overlays), dealer/provider profiles via `getDealerBadges` / `getProviderBadges` |
| 4 | AI Deal Score | ✅ Live | `lib/dealScore.ts` + `components/listings/DealScoreBadge.tsx` (badge + card variants) | `ListingCard:75` (badge), `ListingDetail:160` (full card) |
| 5 | True Cost to Own Calculator | ✅ Live | `lib/ownershipCost.ts` + `components/listings/OwnershipCostCard.tsx` (interactive inputs + memoised result) | `ListingDetail:215`, `BuyerCompare:13` (cross-listing comparison) |
| 6 | Smart Listing Quality Score | ✅ Live | `lib/listingQuality.ts` + `components/listings/ListingQualityPanel.tsx` | `EditListing:144` (live coaching while editing) |
| 7 | Buy-Ready Checklist | ✅ Live | `components/listings/BuyReadyChecklist.tsx` (locally-persisted progress, links to concierge) | `ListingDetail:216` |
| 8 | Side-by-Side Compare | ✅ Live | `contexts/CompareContext.tsx` + `components/listings/CompareDrawer.tsx` + `pages/dashboard/buyer/BuyerCompare.tsx` | Compare button on `ListingCard`, persistent `CompareDrawer` in `PublicShell`, full grid at `/buyer/compare` |
| 9 | Dealer Lead Quality Score | ✅ Live | `lib/leadScore.ts` + `components/listings/LeadQualityBadge.tsx` (uses `lead_quality_score` / `lead_quality_label` columns) | `DealerLeads:75`, `SellerInquiries:75` |
| 10 | Concierge "Find It For Me" | ✅ Live | `pages/RequestPages.tsx::Concierge` — premium glass-card-elevated treatment, hero glow, brass blur, $499 fully-refundable engagement copy, writes to `concierge_requests` table, fires `concierge` notification | `/concierge` route, header nav, footer |
| 11 | Trust Center | ✅ Live | `pages/public/TrustCenter.tsx` — verification copy, scam awareness, red-flag list | `/trust` route, footer link, listing detail safety notice link, home page link |
| 12 | Admin Command Center | ✅ Live | `pages/dashboard/admin/AdminDashboard.tsx` — marketplace health score, KPI grid (users/listings/pending/inquiries/dealers/providers/fraud/concierge/payments), "Next best actions" cards | `/admin` route |
| 13 | Scam Shield / Safety Warnings | ✅ Live | Trust + safety notice block on `ListingDetail:184`, "never send payment outside platform" warning on `InquiryForm:86` and `RequestPages:49`, dedicated red-flag section in TrustCenter | All listing detail pages, all inquiry forms, all concierge/financing/insurance request pages |

**Result: 12/12 Priority 1 features are live and wired.** No fixes were needed — every Priority 1 feature already had its component file, was imported into the correct page, and rendered conditionally where appropriate (e.g. `!listing.is_demo` for AI scores so demo data doesn't pollute the signal).

## Priority 2 — Nice-to-have for beta

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Premium 3D Homepage / TradeWindHeroScene | 🟡 Partial | `framer-motion` is installed and `components/ui/Reveal.tsx` powers scroll-reveal across the homepage. Hero has animated brass-blur ambience (`Home.tsx`). No `three.js` / `@react-three/fiber` 3D scene — current treatment is 2D motion-driven, not the full 3D vision. |
| 18 | AI Listing Assistant Upgrade | 🟡 Partial | `lib/ai.ts::aiListingGenerator` invokes the `ai-listing-generator` Supabase edge function. The CreateListing form mentions "Our AI will polish this into a listing" but does not yet call the function — no button/UX hooked up. Backend ready, frontend trigger missing. |
| 20 | Demo-to-Real Conversion Workflow | 🟡 Partial | AdminDashboard shows demo count and surfaces an action card to "phase out" demos, but no automated conversion flow / "promote demo to real" button exists. |

## Priority 3 — Future / not yet built

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 14 | Offer Builder | ❌ Missing | No `offer_drafts` schema, no UI. |
| 15 | Partner Match | ❌ Missing | No matching logic between buyers and dealers/service providers. |
| 16 | Market Pulse | ❌ Missing | `MarketReports` exists as content but no live "pulse" / pricing index. |
| 17 | Dealer Inventory Health Dashboard | ❌ Missing | `DealerAnalytics` exists but no health-score model for dealer inventory. |
| 19 | AI Dealer Follow-Up Assistant | ❌ Missing | No follow-up automation; admin dashboard mentions "white-glove follow-up" copy but no AI assistant. |

## Verification

- `npm run typecheck` — passes with no errors
- `npm run build` — passes (953 kB main bundle, gzip 273 kB; chunk-size warning is pre-existing)
- Smoke tests in `src/__tests__/smoke.test.tsx` cover TrustCenter rendering and key route mounts

## Bottom line

**Private beta is not blocked.** All 12 Priority 1 features are implemented, wired into the pages where users will actually encounter them, and ship in the production build. The remaining gaps (3D hero, AI listing assistant frontend trigger, demo-to-real workflow, and the four Priority 3 features) are growth/polish work that can land iteratively after launch.
