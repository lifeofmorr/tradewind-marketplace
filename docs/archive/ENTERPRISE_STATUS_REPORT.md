# TradeWind · Enterprise Status Report

_Last updated: 2026-04-29_

A single-page snapshot of platform status across web, data, AI, and partner
integrations. Used by leadership and ops to track production readiness and
greenlight launches.

---

## 1. Platform surface

- **Web app (Vite + React + TypeScript strict)** — production build green,
  React.lazy() splits per dashboard, ErrorBoundary wraps every lazy route.
- **Routes shipped (10+):** `/`, `/browse`, `/boats`, `/autos`, `/aircraft`
  (new), `/categories/*`, `/listings/:slug`, `/dealers/*`, `/services/*`,
  `/auctions/*`, `/blog/*`, `/market-reports/*`, plus six dashboards (buyer,
  seller, dealer, dealer-staff, service provider, admin).
- **Tests:** 36 passing across `routes.test.tsx`, `smoke.test.tsx`,
  `lib.test.ts`. Vitest + Testing Library.

## 2. Edge functions (Supabase)

**12 active and deployed:**

1. `ai-buyer-assistant` — buyer-facing concierge AI
2. `ai-concierge-intake` — structured concierge request triage
3. `ai-fraud-check` — listing/inquiry fraud scoring
4. `ai-listing-generator` — AI-written listing copy
5. `ai-pricing-estimate` — automated comp pricing
6. `auction-end` — auction settlement + winner notification
7. `inquiry-fraud-check` — buyer-side fraud heuristics
8. `photo-enhance` — listing photo upscaling and cleanup
9. `send-email` — transactional email delivery
10. `sitemap` — dynamic sitemap.xml generation
11. `stripe-checkout` — Stripe checkout sessions for featured/boost packages
12. `stripe-webhook` — Stripe event ingestion + subscription sync

**2 pending deployment (Docker Desktop required to bundle):**

- `ai-listing-autopilot` — fully automated listing creation pipeline
- `ai-negotiation-assistant` — buyer/seller negotiation coach

## 3. Database

- **20+ tables with Row-Level Security** covering profiles, dealers, service
  providers, listings, listing_photos, inquiries, leads, auctions, bids,
  conversations, messages, reviews, saved_listings, subscriptions, payments,
  notifications, fraud_signals, audit_log, blog_posts, market_reports,
  partner_quotes, transaction_rooms, plus the new `aircraft_specs` extension.
- **16 enums** including `listing_category` (now extended with six aircraft
  values: `aircraft_single_engine`, `aircraft_twin_engine`,
  `aircraft_turboprop`, `aircraft_jet`, `aircraft_helicopter`,
  `aircraft_vintage`).
- **Indexes** on every foreign key, hot read path, and full-text search vector.

## 4. Credential-ready integrations

Schema, hooks, UI, and API clients are all in place — these light up the
moment production credentials are installed:

- **Plaid** — bank-account verification + ACH for escrow.
- **VIN/HIN decode** — auto + boat decoder providers.
- **Lender APIs** — pre-qualified financing offers.
- **Insurance APIs** — instant marine and auto quotes.
- **Transport APIs** — door-to-door logistics quotes.
- **Escrow** — funds-held + buyer protection.
- **DMS (Dealer Management System) connectors** — inventory ingest for the
  big four dealer platforms.

## 5. Verticals

- **Boats** — center-console, performance, yacht, generic — live with seed
  data, photos, comps, partner network.
- **Autos** — car, truck, exotic, classic, powersports, RV — live.
- **Aircraft** — _new this build_. Six aircraft categories, dedicated
  `/aircraft` browse page with single/twin/jet/helicopter aliases, 15
  demo listings, aircraft_specs table for N-number, total time, engine
  hours, TBO, avionics, ADS-B, airworthiness status. Aviation-specific
  safety disclaimer rendered on every aircraft listing.

## 6. Mobile

The native Expo / React Native client is **a separate project**. Deferred
from the web codebase to keep release cadence independent. Plan tracked in
`MOBILE_APP_PROJECT_PLAN.md`.

## 7. What still needs hands

- Production keys for Plaid, VIN/HIN, lender, insurance, transport, escrow.
- Push Docker Desktop builds for the two pending edge functions.
- Native mobile project kickoff (separate repo).
- Aircraft inventory partnerships (Trade-A-Plane, Controller, AvBuyer feeds).
