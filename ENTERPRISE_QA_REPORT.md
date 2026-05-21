# TradeWind Enterprise All-Vertical QA Report

**Date:** 2026-05-20
**Branch:** `claude/hungry-wiles-3fda56`
**Scope:** Full marketplace audit across boats, autos, trucks, exotics, classics, aircraft, services, financing, insurance, transport, inspections, dealers, service providers, community, integrations, transaction rooms, and admin.

---

## TL;DR

TradeWind is a **single coherent marketplace** across all verticals. The aircraft vertical reaches parity with boats/autos in browse, listing detail, asset passport, true-cost-to-own, pre-buy flow, services, and a 10-step transaction timeline. 53/53 unit tests pass, typecheck is clean, and the production build succeeds. Three preventive security fixes were applied this pass (JWT auth on two edge functions, tightened RLS on `asset_verifications`, and a Content-Security-Policy header).

---

## Phase 1 — Public Routes ✅

| Route | Status | Notes |
|---|---|---|
| `/` | ✅ | Featured listings, market pulse, category carousel, services, trust, dealer CTA |
| `/boats`, `/autos` | ✅ | `GroupPage` with wired `ListingFilters` and `ListingGrid` |
| `/aircraft`, `/airplanes`, `/jets`, `/helicopters` | ✅ | `AircraftPage` with safety badge + 10 category chips |
| `/aviation-services` | ✅ | 11 aviation service categories with provider cards |
| `/trust` | ✅ | Buyer protection, demo badge explanation, scam red flags |
| `/community` | ✅ | Real `community_posts` table insert + demo activity sidebar |
| `/integrations` | ✅ | Real `integration_requests` table insert with status chips |
| `/integrations/developer` | ✅ | Honest "coming soon" status on REST/Webhooks/SDKs |
| `/concierge`, `/financing`, `/insurance`, `/inspections`, `/transport` | ✅ | All forms validated (zod), persist to service-request tables |
| `/pricing` | ✅ | Seller, dealer, service, concierge tiers |
| `/blog`, `/market-reports`, `/auctions` | ✅ | Real Supabase queries, graceful empty states |
| `/listings/:slug` | ✅ | Renders gallery, video walkaround, inquiry, offer builder, asset passport, deal score, ownership cost, buy-ready checklist; aircraft-specific panels conditional |

**Blockers found:** 0
**Nav consistency:** Header (9 links) + footer (19 links) all resolve to real routes.

---

## Phase 2 — Role Dashboards ✅

| Dashboard | Status |
|---|---|
| Buyer (dashboard, saved, requests, compare, financial hub) | ✅ Real Supabase queries, aircraft-aware compare |
| Seller (dashboard, listings, create/edit, inquiries, auctions) | ✅ Create-listing schema accepts all 10 aircraft categories |
| Dealer (dashboard, inventory, import, widgets, leads, analytics) | ✅ CSV import accepts aircraft; widgets generate embed code |
| Service provider (dashboard, leads, profile) | ✅ Profile form supports aviation categories |
| Admin (dashboard, listings, users, requests, fraud, payments, content, auctions, blog, market reports) | ✅ All count/moderation views work |

`ProtectedRoute` enforces role arrays. `DashboardShell` nav is role-scoped. No aircraft data is hidden by hard-coded category filters in admin/dealer tools.

---

## Phase 3 — Feature Completion

| Feature | Status | Note |
|---|---|---|
| AI Listing Autopilot | ✅ Real | Claude LLM via `ai-listing-autopilot` |
| AI Negotiation Assistant | ✅ Real | Claude LLM via `ai-negotiation-assistant` |
| AI Deal Score | ✅ Real | Heuristic + stored scores via `ai-pricing-estimate` |
| AI Fraud Check | ✅ Real | Claude LLM via `ai-fraud-check` |
| AI Concierge Intake | ✅ Real | `ai-concierge-intake` edge fn |
| Asset Passport (boats/autos) | ✅ Real | Built from listing verification fields |
| Asset Passport (aircraft) | ✅ Real | Queries `aircraft_specs`; demo listings show deterministic sample status (labeled) |
| Buyer Readiness Card | ✅ Real | Tied to authed user |
| Dealer Response Score | ✅ Real | `src/components/dealer/DealerResponseScore.tsx` |
| Offer Builder / Pro | ✅ Real | `offers` table backed |
| Transaction Room | ⚠️ Honest demo | 10-step timeline for aircraft / 7-step for marine-auto; document checklist is local-state. Labeled as a guided closing companion, not an escrow product. |
| Partner Marketplace + Matching | ✅ Real | `matchPartners()` heuristic with category/state/rating/radius |
| Partner Quote | ⚠️ Sandbox | `partner-quote` edge fn returns sandbox quotes; response includes `"sandbox": true` and disclosure message |
| Dealer Tools (inventory, import, widgets, leads, analytics) | ✅ Real | All files present and Supabase-backed |
| Community (posts, likes, comments) | ✅ Real | `community_posts` insert + reactions table |
| Integrations (Slack, Zapier, etc.) | ✅ Honest | "Available" buttons capture requests to `integration_requests`; no fake OAuth |
| Developer Hub | ✅ Honest | All three feature cards labeled `coming_soon` |
| Financial Hub | ✅ Honest | `financial_readiness` table; Plaid sandbox stub with disclosure |

---

## Phase 4 — Aircraft Vertical ✅

| Element | Status |
|---|---|
| Browse pages | ✅ 10 aircraft categories (single/twin/turboprop/jet/heli/LSA/experimental/amphibious/vintage/VLJ) |
| Listing detail aircraft fields | ✅ N-number, total time, engine hours, SMOH/TBO, avionics, ADS-B, annual, useful load, range, cruise |
| Aircraft Asset Passport | ✅ Identification + certificates + closing readiness with aviation safety notice |
| Aircraft True Cost to Own | ✅ Hangar, insurance, annual, engine reserve, avionics reserve, fuel, prebuy, ferry, training |
| Pre-buy inspection flow | ✅ Submits to `aircraft_prebuy_requests` with scope checkboxes |
| Aviation service providers | ✅ 11 categories (A&P, IA, maint shop, broker, lender, insurance, title, escrow, ferry, avionics, hangar) |
| Aircraft transaction timeline | ✅ 10 steps: inquiry → offer → LOI → escrow → prebuy → logbook/title → financing → insurance → ferry → closing |
| Aviation safety lib | ✅ Disclaimers + report categories + AI walkaround script generator |

---

## Phase 5 — Security

| Check | Status |
|---|---|
| No service-role key in `src/` | ✅ Confirmed by grep |
| `src/lib/supabase.ts` uses anon key only | ✅ |
| Stripe webhook signature + idempotency | ✅ HMAC-SHA256, timing-safe compare, `webhook_events` unique constraint |
| RLS enabled on critical tables | ✅ `profiles`, `listings`, `inquiries`, `transactions`, `partner_quote_requests`, `dealer_widgets`, `import_logs`, `asset_verifications` |
| `asset_verifications` SELECT policy | ✅ **Fixed this pass** — was `USING (true)`; now scoped to active listings, owner, requester, or admin |
| `plaid-link` JWT auth | ✅ **Fixed this pass** — body-supplied `user_id` ignored; uses authed user id |
| `partner-quote` JWT auth + partner_type allowlist | ✅ **Fixed this pass** — same fix + ALLOWED_TYPES whitelist |
| Admin route protection | ✅ `ProtectedRoute` enforces `roles=["admin"]` |
| Security headers (incl. CSP) | ✅ **Fixed this pass** — CSP, COOP, plus prior X-Frame, X-Content-Type, Referrer-Policy, Permissions-Policy, HSTS |
| Privacy / terms / data deletion | ✅ Real content, 30-day SLA, writes to `data_deletion_requests` |
| Report flows | ✅ `ReportButton` → `reports` table; aviation-specific reasons via `aviationSafety.ts` |
| Audit logging | ✅ `src/lib/audit.ts` → `audit_logs`; used by admin moderation actions |
| Aircraft fraud warnings | ✅ `AVIATION_REPORT_REASONS` covers fake escrow, unverifiable N-number, missing logbooks, suspicious wire patterns |

---

## Phase 6 — Visual / Mobile

| Area | Status |
|---|---|
| `PublicShell` / `DashboardShell` | ✅ Hamburger nav, responsive sidebar |
| `ListingCard`, `ListingGallery`, `ListingGrid`, `ListingFilters` | ✅ aspect-ratio'd images, `sm:`/`md:`/`lg:` grids |
| Home, AircraftPage, ListingDetail | ✅ Responsive grids and text scaling |
| Admin/Dealer tables | ✅ All wrapped in `overflow-x-auto` |
| `BuyerCompare` | ⚠️ `min-w-[720px]` table — works via horizontal scroll, but UX is tight on phones. Tracked for follow-up; not a beta blocker. |
| `TradeWindHeroScene` | ✅ Disables 3D animations via `useIsMobile()` |

---

## Phase 7 — Performance

| Check | Status |
|---|---|
| Lazy-loaded dashboards | ✅ 43 `lazy()` imports across role surfaces |
| TradeWindHeroScene lazy | ✅ |
| Image URLs | ✅ Unsplash CDN with `?w=800&q=80&auto=format` |
| Console errors on happy path | ✅ Only `console.warn` in error handlers |
| Build size | ⚠️ Main chunk 1.04 MB / 296 KB gzipped (warning fired). `Reveal` component pulls framer-motion into the eager bundle. **Tracked for follow-up; not a beta blocker.** Recommended fix: add `manualChunks` for `framer-motion` and `react-hook-form + zod + @hookform/resolvers`. |

---

## Phase 8 — Tests

```
typecheck   ✅  clean
build       ✅  2.5s, only chunk-size warning
vitest      ✅  53/53 passing in 4 files
```

---

## Phase 9 — Deploy

Three fixes committed this pass:
1. `supabase/functions/_shared/auth.ts` (new) — shared JWT verifier
2. `supabase/functions/plaid-link/index.ts` — auth required
3. `supabase/functions/partner-quote/index.ts` — auth required + partner_type allowlist
4. `supabase/migrations/20260520_tighten_asset_verifications_rls.sql` (new) — scoped SELECT policy
5. `vercel.json` — CSP, COOP, expanded Permissions-Policy

After commit, push to `main` to trigger Vercel auto-deploy. The two edge function changes also need:
```
npx supabase functions deploy plaid-link --project-ref qwaotydaazymgnvnfuuj
npx supabase functions deploy partner-quote --project-ref qwaotydaazymgnvnfuuj
```
And the RLS migration applied via Supabase migrations.

---

## Outstanding (non-blocking) follow-ups

- **Bundle:** add `manualChunks` in `vite.config.ts` for `framer-motion`, form libs, and Radix UI to cut main chunk by ~25%.
- **BuyerCompare mobile:** reflow to single-column card mode below `sm`.
- **TransactionRoom:** the 10-step aircraft / 7-step marine timeline is currently client-state only. Document checklist persistence to a `transaction_documents` table would let parties resume from any device.
- **Buyer Assistant UI:** `aiBuyerAssistant()` edge fn exists in `src/lib/ai.ts` but is not yet surfaced in a buyer-facing component; consider adding a "Ask the assistant about this listing" CTA to `ListingDetail`.
- **AviationServicesPage:** CFI and DPE are not in the 11 service categories — add if those service partners come online.
