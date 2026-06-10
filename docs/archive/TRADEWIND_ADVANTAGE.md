# TradeWind Advantage

The set of buyer-, seller-, dealer-, and admin-facing features that make TradeWind
a more serious marketplace than the boats/auto comps. Every feature is **client-side
pure** by default — scores recompute on render — with optional persisted columns for
batch-job snapshots.

## 1. Trust Badge System
- **Lib:** `src/lib/badges.ts` — `getListingBadges`, `getDealerBadges`, `getProviderBadges`.
- **Component:** `src/components/ui/TrustBadge.tsx` — single + list renderer.
- **Surfaces:** ListingCard, ListingDetail, DealerProfile, ServiceProviderProfile, Compare page.
- 11 badge types: `verified_dealer`, `verified_provider`, `verified_listing`, `featured`,
  `premium`, `demo`, `financing_ready`, `insurance_ready`, `inspection_ready`,
  `transport_ready`, `concierge_eligible`. Each has its own icon + tone + tooltip.

## 2. AI Deal Score
- **Lib:** `src/lib/dealScore.ts` — pure heuristic, returns `{ score, label, color, reasons }`.
- **Components:** `DealScoreBadge` (circular ring) + `DealScoreCard` (full panel with reasons).
- **Inputs:** year/depreciation curve, price vs category average, mileage/hours,
  condition, trust signals, title status.
- **Labels:** Great Deal / Fair Deal / High Price / Needs Review / Demo.
- **Surfaces:** ListingCard (overlay chip), ListingDetail (DealScoreCard), Compare page.

## 3. Ownership Cost Calculator
- **Lib:** `src/lib/ownershipCost.ts` — pure amortization + estimated insurance, storage,
  maintenance, fuel.
- **Component:** `OwnershipCostCard` — interactive (down %, term, APR sliders).
- **Surface:** ListingDetail right rail.
- Always shows: "Estimates are for planning only. Actual costs vary."

## 4. Listing Quality Score
- **Lib:** `src/lib/listingQuality.ts` — checks 11 fields with weighted points.
- **Component:** `ListingQualityPanel` — bar + per-field actionable hints.
- **Surface:** Seller Edit Listing page (right rail).
- **Labels:** Poor / Good / Strong / Premium.

## 5. Buy-Ready Checklist
- **Component:** `BuyReadyChecklist` — 8-step interactive checklist, `localStorage`-persisted.
- **Surface:** ListingDetail right rail (logged-in users only).
- Steps: contacted seller → financing → insurance → inspection → title review → transport
  → offer → delivery.

## 6. Compare Drawer + Compare Page
- **Context:** `src/contexts/CompareContext.tsx` — `localStorage`-persisted, max 3 items.
- **Component:** `CompareDrawer` — floating bottom bar shown on every public page.
- **Page:** `src/pages/dashboard/buyer/BuyerCompare.tsx` — side-by-side spec table.
- **Wired into:** ListingCard "Compare" button.

## 7. Lead Quality Score
- **Lib:** `src/lib/leadScore.ts` — pure scoring on inquiry text + contact completeness +
  intent signals + spam markers.
- **Component:** `LeadQualityBadge` — score chip with reasons tooltip.
- **Labels:** Hot / Warm / Cold / Spam Risk.
- **Surfaces:** SellerInquiries, DealerLeads.

## 8. Trust Center
- **Page:** `src/pages/public/TrustCenter.tsx` at `/trust`.
- Hero + Buyer Protection + Demo Listings + Verified Dealer criteria + Pre-Purchase Services
  + Scam Awareness + Reporting.
- Linked from footer.

## 9. Admin Command Center
- **Page:** `src/pages/dashboard/admin/AdminDashboard.tsx`.
- KPI grid: users, active listings (real vs demo split), pending review, new inquiries,
  dealers, service partners, open fraud flags, concierge requests, payments processed
  (sum + count).
- Marketplace Health Score (0–100) blending real-listing ratio, fraud flags, payments.
- Next Best Actions section: contextual cards that only appear when there's work to do.

## 10. Listing safety notice
- ListingDetail shows a "Buy with confidence" panel reminding buyers to verify
  title/HIN/VIN and never to wire funds outside the platform.

## 11. Inquiry safety notice
- InquiryForm shows a one-line warning above the form: "Never send payment outside
  the platform. Verify title and HIN/VIN before any deposit."

## Database
Migration `supabase/migrations/20260101000400_advantage.sql` adds optional persisted
snapshot columns. The UI does not require them — they're for future batch jobs that
want to pre-compute scores for sorting or filtering at the SQL layer:

- `listings.deal_score`, `listings.deal_score_label`
- `listings.quality_score`, `listings.quality_label`
- `inquiries.lead_quality_score`, `inquiries.lead_quality_label`

Indexes added on each `*_score` column for `order by score desc`.
