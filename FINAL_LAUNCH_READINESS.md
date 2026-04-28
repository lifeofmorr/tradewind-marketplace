# TradeWind — Final Launch Readiness

**Date:** 2026-04-28
**Branch:** `claude/trusting-tharp-5b9815`
**Build:** ✓ passes (`npm run typecheck` + `npm run build` both clean)

## Go / no-go: **GO** for staging QA

This pass adds polish + the TradeWind Advantage feature set without touching auth,
payments, RLS policies, or any existing dashboards' data flow. Backwards compatible
with current prod schema (the new migration is purely additive).

## What changed in this pass

### Premium design system
- New CSS tokens, glassmorphism classes, scroll-reveal helper, brass glow + shimmer
  loading states, 3D card depth, reduced-motion fallbacks.
- Home page rebuilt with framer-motion sections, animated hero, brass gradient text.
- ListingCard rebuilt with overlay deal-score, badge chips, compare button.
- ListingDetail expanded with deal-score card, ownership-cost calculator, buy-ready
  checklist, trust badge row, safety notice.

### TradeWind Advantage features (11)
1. Trust badge system (lib + UI)
2. AI Deal Score (lib + circular badge + full card)
3. Ownership Cost Calculator (interactive)
4. Listing Quality Score (sellers see actionable hints)
5. Buy-Ready Checklist (localStorage-persisted)
6. Compare Drawer + side-by-side Compare page
7. Lead Quality Score (Hot/Warm/Cold/Spam Risk)
8. Trust Center (`/trust`)
9. Admin Command Center upgrade (KPIs + Health Score + Next Best Actions)
10. Listing detail safety notice
11. Inquiry form payment-warning copy

### Database
- `supabase/migrations/20260101000400_advantage.sql` adds optional snapshot columns
  + indexes. **Additive only** — no destructive changes. Safe to apply during low-traffic.

### Files changed
~30 files modified or created. See `git diff main...HEAD --stat`.

## Build metrics

- Main bundle: **938 KB** (gzip 269 KB) — up from baseline due to framer-motion +
  intersection-observer. Acceptable for a marketplace landing surface; consider
  splitting framer-motion into its own chunk if further pages adopt it.
- Dashboard chunks: largely unchanged — features lazy-load alongside the routes.

## Known follow-ups (not blockers)

- **Persisted scoring snapshots:** the new score columns are written by no one yet.
  Add an Edge Function or pg trigger to backfill `listings.deal_score` etc. when
  there's value in SQL-side filtering. Current UI computes on render, so this is
  an optimization, not a requirement.
- **Photo count for ListingQualityPanel** is sourced from the listing_photos query
  in EditListing. CreateListing intentionally does not show the panel because the
  listing has no fields filled yet.
- **Concierge eligibility** uses a simple `price_cents >= $75k AND verified`
  heuristic. Refine with subscription/AI signals once concierge funnel data exists.
- **Bundle size warning:** Vite warns at 500 KB; consider `manualChunks` config
  in `vite.config.ts` to split vendor libs.
- **framer-motion on Home is eager-loaded.** Acceptable for hero, but if Home grows
  it may be worth lazy-loading the home page itself.

## QA checklist

- [ ] Homepage hero animates on first load, respects reduced-motion
- [ ] Listing cards: deal-score overlay, badges, hover lift, compare toggle
- [ ] Compare drawer appears at bottom when ≥1 listing is added; clears properly
- [ ] `/buyer/compare` renders side-by-side specs for 2–3 listings
- [ ] ListingDetail: hero, badges, deal-score card, ownership cost, buy-ready
      checklist (signed-in only), safety notice
- [ ] Inquiry form: shows "Never send payment outside the platform" warning
- [ ] Demo listing: amber banner + Demo badge visible
- [ ] Sellers: editing a listing shows the Quality Panel with actionable hints
- [ ] Sellers + Dealers: inquiries / leads show Hot/Warm/Cold/Spam Risk badge
- [ ] Trust Center renders all 6 sections + reporting CTA
- [ ] Admin Command Center: stat grid, Marketplace Health Score, Next Best Actions
- [ ] Footer "Trust Center" link works
- [ ] Mobile (≤640px): all grids collapse to single column, hero readable, drawer
      doesn't break layout
- [ ] Dark theme stays consistent across all pages

## Rollback plan

If a regression is found post-deploy:
- The migration is additive — no rollback needed for it.
- Revert this PR's commits; auth, payments, dashboards, and RLS are untouched.
