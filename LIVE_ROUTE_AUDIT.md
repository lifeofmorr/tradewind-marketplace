# Live Route Audit — TradeWind (Phase 2)

**Date:** 2026-06-03 · **Live:** https://tradewind-marketplace.vercel.app

## Method note
This is a client-rendered SPA with a Vercel catch-all rewrite, so **every path returns HTTP 200 serving the same `index.html`** and the React router resolves the view. A 200 therefore confirms the shell loads; route correctness is verified against `src/App.tsx` definitions and the page components.

## Public routes — all defined & serving 200
| Route | Component | Status |
|---|---|---|
| `/` | Home | ✅ 200, renders featured + market pulse |
| `/browse` `/boats` `/autos` | Category/Group | ✅ defined |
| `/aircraft` `/airplanes` `/jets` `/helicopters` `/aviation-services` | AircraftPage / Aviation | ✅ defined |
| `/categories` `/categories/:category` | CategoryPage | ✅ |
| `/listings/:slug` | ListingDetail | ✅ |
| `/dealers` `/dealers/:slug` `/services` `/services/:slug` | Profiles | ✅ |
| `/about` `/contact` `/support` `/pricing` `/dealers-info` | SimplePages | ✅ 200 |
| `/blog` `/blog/:slug` `/market-reports` `/market-reports/:slug` | Content | ✅ |
| `/auctions` `/auctions/:id` | Auctions | ✅ |
| `/sell` `/sell-my-boat` `/sell-my-car` `/services-hub` | Sell/Services | ✅ |
| `/financing` `/insurance` `/inspections` `/transport` `/concierge` | RequestPages | ✅ (now w/ partner disclaimer) |
| `/terms` `/privacy` `/trust` `/delete-my-data` | Legal | ✅ 200 |
| `/beta` `/how-it-works` `/feedback` | Beta funnel | ✅ 200 |
| `/integrations` `/integrations/developer` `/community` | Premium | ✅ lazy |
| `/checkout/success` `/checkout/cancel` | Checkout | ✅ |
| SEO: `/by-state` `/boats-for-sale-in-:state` `/brands` `/:brand-for-sale` `/by-city` `/:category-in-:city` | SeoPages | ✅ |
| `*` | NotFound | ✅ (e.g. `/nonexistent-xyz` → NotFound view) |

## Auth-gated routes — guarded
- `/login` `/signup` — public.
- `/messages`, `/buyer/*`, `/transactions/:id` — `ProtectedRoute` (any signed-in role).
- `/seller/*` — seller/dealer/admin. `/dealer/*` — dealer/admin + `OnboardingGuard`. `/service/*` — service_provider/admin + guard.
- `/admin/*` (12 routes: dashboard, listings, auctions, users, requests, fraud, payments, content, blog, market-reports, outreach, beta-inbox) — **admin only**.

## Findings
- No undefined/dead public route found; catch-all redirects unknown authed paths to `/`.
- Contact/Support pages serve but are **mailto-based, not forms** (see business-ops audit) — minor.

**Verdict:** Route surface is complete and correctly guarded. ✅
