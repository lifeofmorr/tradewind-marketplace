# Tradewind Marketplace — Final 10/10 Scorecard

**Date:** 2026-06-10
**Scope:** Full test suite, page/route audit, vertical coverage (boats / autos / aircraft), Deal Score verification, WCAG 2.1 AA, SEO, Stripe integration review.
**Verification:** `tsc --noEmit` clean · **194/194 tests passing** (8 files) · production build clean (main bundle 234.7 kB / 66.4 kB gzip).

---

## Scorecard

| Area | Score | Notes |
|---|---|---|
| Test suite | 10/10 | 194/194 passing. Fixed one flaky smoke test; added 3 regression tests this pass. |
| Pages, links, error handling | 10/10 | All internal links resolve to real routes. Fixed `?redirect=` handling, silent save failures, app-level ErrorBoundary. |
| Verticals: boats / autos / aircraft | 10/10 | All three wired end-to-end. Closed 4 aircraft UX gaps found in audit. |
| Deal Score algorithm | 10/10 | Verified correct: gap-free bands, all NaN/÷0 paths guarded, clamped 0–100, UI colors match bands. No changes needed. |
| Accessibility (WCAG 2.1 AA) | 10/10 | Code audit clean across 10 categories; added skip-to-content links (2.4.1 Bypass Blocks). |
| SEO | 10/10 | All 46 public routes set title/description. Fixed JSON-LD nulls, 404 noindex, robots/twitter tags, env-overridable canonical domain. |
| Stripe integration | 10/10 | Logic complete and fail-closed in test mode. Fixed error-detail leak in checkout function. No secrets in repo. |

---

## 1. Test suite

- **Before:** 190/191 passing — `smoke.test.tsx` "Home page renders hero search" flaked under full-suite load (lazy hero chunk exceeded the 1 s `findBy` default timeout; passed in isolation).
- **Fix:** explicit 10 s timeout on the lazy-mount assertion (`src/__tests__/smoke.test.tsx`).
- **Added:** 3 regression tests in `lib.test.ts` — aircraft listing-quality specs check, and two `listingMeta` JSON-LD tests (null-stripping + populated offer/address).
- **After:** 194/194 passing, typecheck clean, build clean.

## 2. Pages, broken links, error handling

Audit found no broken internal links (every `to=`/`navigate()` target maps to a route in `App.tsx`; catch-all 404 present). Fixed:

| Severity | Fix | Files |
|---|---|---|
| High | `/login?redirect=…` was ignored — users sent to `/` after sign-in. Now honored, restricted to app-internal paths (no `//` open-redirect). | `src/pages/Login.tsx` |
| High | `saveVideoUrl` and `persistPhotos` swallowed Supabase errors and showed "Saved" anyway. Now surface the error and abort. | `src/pages/dashboard/seller/EditListing.tsx` |
| Medium | Eager-loaded routes (Home, auth, SimplePages) had no ErrorBoundary — a render throw blanked the app. Whole router now wrapped. | `src/App.tsx` |

Forms (Login, Signup, CreateListing, EditListing) verified: Zod validation + handled submit errors.

## 3. Verticals — boats, autos, aircraft

All three verticals verified wired: routes (`/boats`, `/autos`, `/aircraft`, `/jets`, `/helicopters`), 21 categories, filters, create/edit flows (incl. `AircraftSpecsForm`), Deal Score, ownership cost, listing detail panels, header nav, and `aviation.test.ts` coverage. Closed the four gaps the audit surfaced:

1. **ListingCard** now shows `hours TT` for aircraft (was: aircraft cards showed no operational data) — `src/components/listings/ListingCard.tsx`.
2. **Listing quality** scoring now has an aircraft branch — specs check uses total time hours, ID check labeled "N-number / serial" (was: aircraft always failed the mileage check) — `src/lib/listingQuality.ts`.
3. **Home concierge copy** now reads "boat, car, or aircraft" — `src/pages/Home.tsx`.
4. **Sell funnel:** new `/sell-my-aircraft` page + route, added to footer and `/sell` hub (aircraft sellers previously had no guided entry) — `src/pages/SimplePages.tsx`, `src/App.tsx`, `src/components/layout/Footer.tsx`.

## 4. Deal Score — verified correct, no changes

The previously fixed gap (stored-score precedence + aircraft layer) is sound:

- **Bands are gap-free:** cascading `score >= 78 / 58 / 35 / else` covers every integer 0–100 exactly once (Great Deal / Fair Deal / High Price / Needs Review).
- **Guards:** zero/missing average price, TBO=0, missing price/year all short-circuit — no NaN or ÷0 paths.
- **Clamping:** `Math.round` then clamp to [0, 100] in both base and aircraft variants.
- **Call sites (6):** badges, cards, offer builder, negotiation assistant, compare — all consume score/label safely; badge colors map 1:1 to bands.
- **Aircraft layer:** TT, engine hours vs TBO, annual currency, logbooks, avionics, ADS-B, damage history, pre-buy all factored.

## 5. Accessibility (WCAG 2.1 AA)

Code audit clean across: document metadata, images (16/16 with alt), form labels, icon-button aria-labels, landmarks, focus-visible styles, ARIA usage, Radix-managed dialogs/tabs/selects, `prefers-reduced-motion` (hook + CSS fallback), and color contrast (all measured combos ≥ 5.8:1, body text 15.4:1).

**Fixed:** added skip-to-main-content links + `id="main-content"` to both shells (`PublicShell.tsx`, `DashboardShell.tsx`) — satisfies 2.4.1 Bypass Blocks, the one Level A criterion that was unmet.

## 6. SEO

All 46 public routes set title + description via `setMeta()`; programmatic SEO pages emit BreadcrumbList JSON-LD; robots.txt blocks dashboards; sitemap edge function covers listings/dealers/blog/programmatic routes. Fixed:

| Fix | Files |
|---|---|
| Listing JSON-LD emitted literal `null` for missing make/model/year (fails schema.org validation). Now conditional-spread — nulls omitted entirely. (Note: `undefined` values were never a problem — `JSON.stringify` drops them; the audit's claim about those was a false positive.) | `src/lib/seo.ts` |
| 404 page now emits `noindex, follow`; `setMeta` gained a `noindex` option; all other pages explicitly `index, follow`. | `src/lib/seo.ts`, `src/pages/SimplePages.tsx` |
| Default `robots` meta + `twitter:image` added to the HTML shell. | `index.html` |
| Canonical domain (`gotradewind.com`) now overridable via `VITE_PUBLIC_DOMAIN` — set it to the vercel.app host until the custom domain resolves, flip back at domain launch. Sitemap function already honors `APP_URL`. | `src/lib/brand.ts` |

**Open item (config, not code):** canonical URLs default to `gotradewind.com`, which doesn't resolve yet (known launch blocker). Set `VITE_PUBLIC_DOMAIN=tradewind-marketplace.vercel.app` in Vercel env (and `APP_URL` in Supabase function secrets) until the domain is live.

## 7. Stripe integration

Audit verdict: **complete and safe**; the app stays in test mode by design.

- **Fail-closed live gate:** live mode requires `VITE_STRIPE_MODE=live` + `STRIPE_MODE=live` + all 7 live price IDs + `pk_live_`/`sk_live_` key prefixes; any mismatch → 503, no API call. Covered by `stripeMode.test.ts`.
- **Webhook:** HMAC-SHA256 signature verification with timing-safe compare; idempotency via `webhook_events` unique-key dedup; handles checkout completion, subscription create/update/delete, refunds.
- **Checkout:** prices are server-side env price IDs (never user-controlled), ownership checks before session creation, UUID/URL validation.
- **Fixed:** raw Stripe error bodies were returned to the browser on failure — now logged server-side only, generic message to caller (`supabase/functions/stripe-checkout/index.ts`).
- **Secrets:** no `sk_live`/`sk_test`/`whsec` values committed; `.env.local` untracked.
- Success page is informational only (fulfillment is webhook-driven) — acceptable by design.

---

## Remaining items outside this codebase

These are operational, not code, and were already tracked as launch blockers:

1. **Custom domain** (`gotradewind.com`) unresolved — set `VITE_PUBLIC_DOMAIN` / `APP_URL` env overrides until it resolves.
2. **Supabase CLI not authenticated** — the modified `stripe-checkout` edge function needs a `supabase functions deploy` once auth is restored (frontend changes deploy via Vercel automatically).
3. Stripe remains in test mode on purpose; live activation follows `PAYMENT_LIVE_MODE_CHECKLIST.md`.
