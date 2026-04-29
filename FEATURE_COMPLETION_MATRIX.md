# TradeWind Feature Completion Matrix

Audit date: 2026-04-29 · Branch: claude/determined-khayyam-5b60b2

Status legend: **Done** = wired end-to-end · **Partial** = exists but missing wiring or surface · **Missing** = not built · **Documented** = mentioned in docs only · **Scaffolded** = stub UI without backing.

| # | Feature | Status | Files | Gap |
|---|---|---|---|---|
| 1 | Premium 3D homepage | Done | `src/components/visual/TradeWindHeroScene.tsx`, `src/pages/Home.tsx` | — |
| 2 | Premium listing cards | Done | `src/components/listings/ListingCard.tsx` | — |
| 3 | Premium listing detail gallery | Done | `src/components/listings/ListingGallery.tsx`, `src/pages/ListingDetail.tsx` | — |
| 4 | Category-matched demo images | Done | `src/components/listings/ListingPlaceholder.tsx`, `supabase/backfill-demo-photos.sql` | — |
| 5 | Demo labels | Done | `src/components/listings/ListingCard.tsx` (`is_demo` badge) | — |
| 6 | Verified Badge System | Done | `src/components/ui/TrustBadge.tsx`, `profiles.verification_level` | — |
| 7 | AI Deal Score | Done | `src/components/listings/DealScoreBadge.tsx`, `src/lib/dealScore.ts`, `listings.deal_score` | — |
| 8 | True Cost to Own | Done | `src/components/listings/OwnershipCostCard.tsx`, `src/lib/ownershipCost.ts` | — |
| 9 | Smart Listing Quality Score | Done | `src/components/listings/ListingQualityPanel.tsx`, `listings.quality_score` | — |
| 10 | Buy-Ready Checklist | Done | `src/components/listings/BuyReadyChecklist.tsx` | — |
| 11 | Compare | Done | `src/components/listings/CompareDrawer.tsx`, `src/pages/dashboard/buyer/BuyerCompare.tsx`, `src/contexts/CompareContext.tsx` | — |
| 12 | Dealer Lead Quality | Done | `src/components/listings/LeadQualityBadge.tsx`, `inquiries.lead_quality_score` | — |
| 13 | Concierge | Done | `src/pages/RequestPages.tsx`, `concierge_requests` table, `supabase/functions/ai-concierge-intake` | — |
| 14 | Trust Center | Done | `src/pages/public/TrustCenter.tsx` | — |
| 15 | Admin Command Center | Done | `src/pages/dashboard/admin/AdminDashboard.tsx` | — |
| 16 | Scam Shield | Done | `supabase/functions/ai-fraud-check`, `inquiry-fraud-check`, `fraud_flags` table | — |
| 17 | Offer Builder Pro | Done | `src/components/listings/OfferBuilderPro.tsx`, `offer_drafts` table | — |
| 18 | Partner Match | Done | `src/components/admin/PartnerMatchPanel.tsx`, `src/lib/partnerMatch.ts` | — |
| 19 | Market Pulse | Done | `src/components/market/MarketPulseCard.tsx` | — |
| 20 | Dealer Inventory Health | Done | `src/pages/dashboard/dealer/DealerInventory.tsx`, `DealerAnalytics.tsx` | — |
| 21 | AI Dealer Follow-Up | Done | `src/components/dealer/DealerFollowUpAssistant.tsx` | — |
| 22 | Demo-to-Real Conversion | Missing | — | No "claim demo listing" or import flow exists |
| 23 | Asset Passport | Done | `src/components/listings/AssetPassport.tsx` | — |
| 24 | Transaction Room | Done | `src/pages/TransactionRoom.tsx`, route `/transactions/:id` | — |
| 25 | Smart Negotiation Assistant | Partial | `src/components/listings/OfferBuilderPro.tsx` | Builder shows %-vs-asking but has no AI suggest button or fair-range hint |
| 26 | Inspection Network Layer | Done | `src/pages/RequestPages.tsx` (Inspections), `inspection_requests` table | — |
| 27 | Title/Doc Checklist | Done | `src/pages/TransactionRoom.tsx` (`BOAT_DOCS`/`AUTO_DOCS`) | — |
| 28 | Seller Verification System | Done | `profiles.verification_level`, surfaced via `TrustBadge.tsx` | — |
| 29 | Buyer Readiness Score | Done | `src/components/buyer/BuyerReadinessCard.tsx`, `profiles.buyer_readiness_score` | — |
| 30 | Dealer Response Score | Done | `src/components/dealer/DealerResponseScore.tsx` | — |
| 31 | Dealer Growth Command Center | Done | `src/components/dealer/GrowthCommandCenter.tsx` | — |
| 32 | Inventory Import | Missing | — | No CSV import UI; no `/dealer/import` route |
| 33 | Dealer Website Widget | Missing | — | No embed/iframe snippet in dealer profile |
| 34 | Buyer Watchlist | Done | `src/components/buyer/WatchlistCard.tsx`, `src/pages/dashboard/buyer/BuyerSaved.tsx`, `saved_listings` table | — |
| 35 | Match Engine | Partial | `src/contexts/CompareContext.tsx` | Compare exists; no recommendation/match scoring engine |
| 36 | Concierge Command Center | Done | `src/pages/dashboard/admin/AdminRequests.tsx` (Concierge tab) | — |
| 37 | Partner Marketplace | Done | `src/pages/public/Integrations.tsx`, `integration_requests` table | — |
| 38 | Social Proof | Partial | `src/pages/Home.tsx`, `Community.tsx` | Demo posts only — no live activity rail on homepage |
| 39 | Secure Messaging | Done | `src/pages/dashboard/Messages.tsx`, `messages`/`conversations` tables, RLS | — |
| 40 | Video Walkaround | Partial | `listing_videos` table | No upload UI in CreateListing/EditListing |
| 41 | Listing Quality Autopilot | Done | `src/components/listings/ListingQualityPanel.tsx` shown in `EditListing.tsx` | — |
| 42 | Trust Score System | Partial | `src/components/ui/TrustBadge.tsx` | Individual badges exist; no composite "trust score" display |
| 43 | App Marketplace | Done | `src/pages/public/Integrations.tsx` | — |
| 44 | Developer Hub | Done | `src/pages/public/DeveloperHub.tsx` | — |
| 45 | White-Glove Concierge | Done | `src/pages/RequestPages.tsx` (Concierge) | — |
| 46 | Community Feed | Done | `src/pages/public/Community.tsx`, `community_posts` table | — |
| 47 | Community posting | Done | `src/components/social/PostComposer.tsx` writes to `community_posts` | — |
| 48 | Community likes | Done | `src/components/social/PostCard.tsx` + `Community.tsx` toggleLike, `community_likes` table | — |
| 49 | Community comments | Partial | `community_comments` table + RLS | Comment button in `PostCard.tsx` is non-interactive — no compose UI, no listing |
| 50 | Community follows | Partial | `community_follows` table + RLS | No follow button anywhere in the UI |
| 51 | Community moderation | Missing | — | No admin surface to delete/hide community posts or comments |
| 52 | Integrations Hub | Done | `src/pages/public/Integrations.tsx` | — |
| 53 | Integration request capture | Done | `src/pages/public/Integrations.tsx` writes `integration_requests` | — |
| 54 | Integration connection records | Done | `integration_requests` rows persist | — |
| 55 | Admin integration management | Missing | — | `AdminRequests.tsx` doesn't include `integration_requests` tab |
| 56 | Financial Hub | Done | `src/pages/buyer/FinancialHub.tsx`, route `/buyer/finance` | — |
| 57 | Bank-link capture | Done | `src/components/finance/BankLinkPanel.tsx` writes `integration_requests` | — |
| 58 | Lender dashboard | Missing | — | Lenders use `service_provider` role; no dedicated lender view |
| 59 | Buyer financial readiness | Done | `src/components/finance/FinancialReadinessCard.tsx`, `financial_readiness` table | — |
| 60 | Internal App Switcher | Done | `src/components/layout/AppSwitcher.tsx` | — |
| 61 | Role-aware access | Done | `src/routes/ProtectedRoute.tsx`, `OnboardingGuard.tsx` | — |
| 62 | Developer request-access | Partial | `src/pages/public/DeveloperHub.tsx` | Form writes a `notes` column that **doesn't exist** in `integration_requests` — insert will fail |
| 63 | Privacy page | Done | `src/pages/SimplePages.tsx` (`Privacy`) | — |
| 64 | Terms page | Done | `src/pages/SimplePages.tsx` (`Terms`) | — |
| 65 | Data deletion placeholder | Missing | — | No `/delete-my-data` route or form |
| 66 | Cookie notice | Missing | — | Mentioned in Privacy text only — no banner component |
| 67 | Report Listing | Done | `src/components/ui/ReportButton.tsx` used in `ListingDetail.tsx:206` | — |
| 68 | Report Message | Missing | `src/components/ui/ReportButton.tsx` exists | Not wired into `MessageThread.tsx` or `Messages.tsx` |
| 69 | Report Inquiry | Missing | `src/components/ui/ReportButton.tsx` exists | Not wired into `SellerInquiries.tsx` |
| 70 | Admin fraud queue | Partial | `src/pages/dashboard/admin/AdminFraud.tsx` | Shows `fraud_flags` only — does not surface user `reports` |
| 71 | Audit logs | Done | `audit_logs` table + RLS in `20260430_security.sql` | — |
| 72 | Admin action logging | Missing | — | No insert into `audit_logs` from any admin code path |
| 73 | Payment webhook idempotency | Partial | `supabase/functions/stripe-webhook/index.ts` | No `event.id` dedup — duplicate Stripe retries will double-insert payments |
| 74 | Stripe webhook signature | Done | `supabase/functions/stripe-webhook/index.ts` (HMAC-SHA256 + timing-safe compare) | — |
| 75 | Payment records protected | Done | `payments` table RLS in initial migration | — |
| 76 | Edge function validation | Partial | `supabase/functions/_shared/`, ai-* | Coverage uneven across functions |
| 77 | AI validation | Partial | `supabase/functions/ai-*` | Inconsistent input length / type checks |
| 78 | File upload validation | Partial | `src/components/listings/PhotoUploader.tsx` | Type checked; size limit not enforced strictly |
| 79 | Storage RLS | Done | `supabase/migrations/20260101000100_phase3.sql` | — |
| 80 | Community RLS | Done | `supabase/migrations/20260430_community.sql` | — |
| 81 | Integration RLS | Done | `supabase/migrations/20260430_ecosystem.sql` | — |
| 82 | Financial data RLS | Done | `supabase/migrations/20260430_security.sql` + `20260430_ecosystem.sql` | — |
| 83 | Security headers | Done | `vercel.json` (HSTS, X-Frame-Options, X-Content-Type-Options, Permissions-Policy) | — |
| 84 | Rate limiting strategy | Missing | — | No middleware / no shared limiter in `_shared/` |
| 85 | Incident response docs | Done | `INCIDENT_RESPONSE_PLAN.md` | — |
| 86 | Backup docs | Documented | `DATA_PRIVACY.md`, `SECURITY_ARCHITECTURE.md` mention Supabase backups | No dedicated backup runbook |
| 87 | Smoke tests | Done | `src/__tests__/smoke.test.tsx` | — |
| 88 | Route tests | Done | `src/__tests__/routes.test.tsx` | — |
| 89 | Security tests | Partial | `src/__tests__/lib.test.ts` | No dedicated security suite (RLS, header checks) |
| 90 | Live production verification | Missing | — | No production smoke / health-check script |

## Roll-up

- **Done:** 60
- **Partial:** 16
- **Missing:** 13
- **Documented (no code):** 1

Critical bug surfaced by the audit: **`DeveloperHub.requestAccess` writes a `notes` column that does not exist** in `integration_requests`, so every Request-Access submission fails silently for users. Fix is either to add the column or drop the field — addressed under Priority A.
