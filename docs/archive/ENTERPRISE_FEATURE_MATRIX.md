# Enterprise Feature Matrix · 2026-05-21

Every feature is mapped to a code surface and a status. ✅ = production-ready,
🟡 = works but limited (intentionally), ⛔ = blocker (none in this pass).

## 1. Boats vertical
| Feature | Surface | Status |
|---|---|---|
| /boats group landing | `App.tsx → GroupPage group="boat"` | ✅ |
| Category browse (yacht, performance_boat, center_console, boat) | `pages/CategoryPage.tsx` | ✅ |
| Listing detail | `pages/ListingDetail.tsx` | ✅ |
| Asset Passport | `components/listings/AssetPassport.tsx` | ✅ |
| True Cost / Ownership Cost | `components/listings/OwnershipCostCard.tsx` | ✅ |
| Buy-Ready checklist | `components/listings/BuyReadyChecklist.tsx` | ✅ |
| Offer Builder | `components/listings/OfferBuilder.tsx` + `OfferBuilderPro.tsx` | ✅ |
| Deal Score | `lib/dealScore.ts` + `DealScoreBadge.tsx` | ✅ |

## 2. Autos vertical
| Feature | Surface | Status |
|---|---|---|
| /autos group landing | `App.tsx → GroupPage group="auto"` | ✅ |
| Cars / Trucks / Exotics / Classics | `pages/CategoryPage.tsx` | ✅ |
| Listing detail | `pages/ListingDetail.tsx` | ✅ |
| Compare drawer | `components/listings/CompareDrawer.tsx` + `BuyerCompare.tsx` | ✅ |
| Offer Builder | `components/listings/OfferBuilder.tsx` | ✅ |
| VIN decode (edge fn) | `supabase/functions/vin-decode/index.ts` | ✅ |

## 3. Aircraft vertical
| Feature | Surface | Status |
|---|---|---|
| /aircraft + /airplanes landing | `pages/public/AircraftPage.tsx` | ✅ |
| /jets, /helicopters subpages | `pages/public/AircraftPage.tsx` (typed props) | ✅ |
| 10 aircraft categories (single, twin, turboprop, VLJ, jet, helicopter, vintage, experimental, amphibious, LSA) | `lib/categories.ts` | ✅ |
| Aircraft spec panel | `components/listings/AircraftSpecPanel.tsx` | ✅ |
| Aircraft specs form (seller) | `components/listings/AircraftSpecsForm.tsx` | ✅ |
| Aircraft walkaround card | `components/listings/AircraftWalkaroundCard.tsx` (AI + local fallback) | ✅ |
| Aircraft Asset Passport (FAA registry hint, logbook completeness, escrow recommendation) | `components/listings/AssetPassport.tsx` | ✅ |
| Pre-buy request flow | `components/listings/AircraftPrebuyRequest.tsx` | ✅ |
| Aviation safety disclaimer | `lib/aviationSafety.ts` + inline disclaimers | ✅ |
| AIRCRAFT_FRAUD_WARNINGS | `lib/ai.ts` | ✅ |

## 4. Services / Partners
| Feature | Surface | Status |
|---|---|---|
| Service provider profile | `pages/ServiceProviderProfile.tsx` | ✅ |
| Services index | `pages/ServiceProviderProfile.tsx` (ServicesIndex) | ✅ |
| Aviation services categories | `pages/public/AviationServicesPage.tsx` | ✅ |
| Concierge | `pages/RequestPages.tsx → Concierge` + `ai-concierge-intake` | ✅ |
| Financing / Insurance / Inspections / Transport requests | `pages/RequestPages.tsx` | ✅ |
| Partner quote (edge fn) | `supabase/functions/partner-quote/index.ts` | 🟡 sandbox until live partners onboard |

## 5. Dealers
| Feature | Surface | Status |
|---|---|---|
| Dealer dashboard | `pages/dashboard/dealer/DealerDashboard.tsx` | ✅ |
| CSV import | `pages/dashboard/dealer/DealerImport.tsx` + `CsvImportPreview.tsx` | ✅ |
| Embeddable widgets | `pages/dashboard/dealer/DealerWidgets.tsx` | ✅ |
| Leads | `pages/dashboard/dealer/DealerLeads.tsx` | ✅ |
| Analytics | `pages/dashboard/dealer/DealerAnalytics.tsx` | ✅ |
| Growth Command Center | `components/dealer/GrowthCommandCenter.tsx` | ✅ |
| Follow-up assistant (AI) | `components/dealer/DealerFollowUpAssistant.tsx` | ✅ |
| Dealer onboarding gate | `routes/OnboardingGuard.tsx` + `pages/onboarding/DealerOnboarding.tsx` | ✅ |

## 6. Buyer
| Feature | Surface | Status |
|---|---|---|
| Dashboard | `pages/dashboard/buyer/BuyerDashboard.tsx` | ✅ |
| Saved listings | `pages/dashboard/buyer/BuyerSaved.tsx` | ✅ |
| Compare | `pages/dashboard/buyer/BuyerCompare.tsx` | ✅ |
| Financial Hub | `pages/buyer/FinancialHub.tsx` | ✅ (Bank-Link panel honestly labeled "Coming soon" with working request flow) |
| Requests (financing, insurance, inspections, transport, concierge) | `pages/dashboard/buyer/BuyerRequests.tsx` | ✅ |
| Reviews left by me | `pages/dashboard/buyer/BuyerReviews.tsx` | ✅ |
| Watchlist | `components/buyer/WatchlistCard.tsx` | ✅ (email channel labeled coming soon) |
| Transaction Room | `pages/TransactionRoom.tsx` | 🟡 preview labeled — timeline + docs work, messages/offers/services labeled preview |

## 7. Seller
| Feature | Surface | Status |
|---|---|---|
| Dashboard | `pages/dashboard/seller/SellerDashboard.tsx` | ✅ |
| Listings list | `pages/dashboard/seller/SellerListings.tsx` | ✅ |
| Create listing (AI-assisted) | `pages/dashboard/seller/CreateListing.tsx` + `ai-listing-generator` | ✅ (aircraft-aware as of this pass) |
| Edit listing | `pages/dashboard/seller/EditListing.tsx` | ✅ |
| Listing Autopilot | `components/listings/ListingAutopilot.tsx` + `ai-listing-autopilot` | ✅ |
| Negotiation Assistant | `components/listings/NegotiationAssistant.tsx` + `ai-negotiation-assistant` | ✅ |
| Inquiries inbox | `pages/dashboard/seller/SellerInquiries.tsx` | ✅ |
| Auctions | `pages/dashboard/seller/SellerAuctions.tsx` + `supabase/functions/auction-end` | ✅ |
| Submit for review (admin moderation gate) | `pages/dashboard/seller/CreateListing.tsx` → status pending | ✅ |

## 8. Admin
| Feature | Surface | Status |
|---|---|---|
| Dashboard | `pages/dashboard/admin/AdminDashboard.tsx` | ✅ |
| Listings approvals | `pages/dashboard/admin/AdminListings.tsx` | ✅ |
| Requests (financing, insurance, inspections, transport, concierge) | `pages/dashboard/admin/AdminRequests.tsx` | ✅ |
| Users | `pages/dashboard/admin/AdminUsers.tsx` | ✅ |
| Fraud queue | `pages/dashboard/admin/AdminFraud.tsx` + `ai-fraud-check` + `inquiry-fraud-check` | ✅ |
| Payments | `pages/dashboard/admin/AdminPayments.tsx` | ✅ |
| Content (announcements, FAQ) | `pages/dashboard/admin/AdminContent.tsx` | ✅ |
| Blog admin | `pages/dashboard/admin/AdminBlog.tsx` | ✅ |
| Market reports admin | `pages/dashboard/admin/AdminMarketReports.tsx` | ✅ |
| Auctions admin | `pages/dashboard/admin/AdminAuctions.tsx` | ✅ |
| Audit logs | `audit_logs` table + admin-only RLS | ✅ |
| Partner match panel | `components/admin/PartnerMatchPanel.tsx` | ✅ |

## Cross-cutting
| Feature | Surface | Status |
|---|---|---|
| Messaging | `pages/dashboard/Messages.tsx` + `components/messaging/*` | ✅ |
| Notifications | `components/notifications/NotificationBell.tsx` + `notifications` table | ✅ |
| Reviews | `components/reviews/*` + `reviews` table | ✅ |
| Cookie notice | `components/ui/CookieNotice.tsx` | ✅ |
| Reports (user-submitted) | `components/ui/ReportButton.tsx` + `reports` table | ✅ |
| Community feed | `pages/public/Community.tsx` + `community_*` tables | ✅ |
| Stripe checkout | `supabase/functions/stripe-checkout/index.ts` | ✅ |
| Stripe webhook | `supabase/functions/stripe-webhook/index.ts` | ✅ |
| Sitemap | `supabase/functions/sitemap/index.ts` | ✅ |
| Send-email (Resend) | `supabase/functions/send-email/index.ts` | ✅ |

## Legend & notes
- 🟡 = working as designed for private beta. Each 🟡 row is honestly labeled
  in the UI and has a request-access or "coming soon" path that records
  intent rather than dropping silently.
- ⛔ = none in this pass.

The 8 verticals × the cross-cutting plane render real Supabase data with RLS
enforced. Every dashboard route is wrapped in `ProtectedRoute` with the right
`roles` array (see `src/App.tsx`).
