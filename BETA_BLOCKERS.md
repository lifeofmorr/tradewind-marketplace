# TradeWind Beta Blockers

**Date:** 2026-05-20
**Status after this QA pass: NO BLOCKERS for controlled private beta across boats, autos, and aircraft.**

This file lists anything that *would* block a wider release if not addressed.

---

## 🟢 Blockers cleared during this pass

1. **`plaid-link` accepted body-supplied `user_id` with no auth check.**
   Fix: edge fn now verifies the Supabase JWT in `Authorization: Bearer ...` and uses the authed user's id, ignoring the body. New shared helper at `supabase/functions/_shared/auth.ts`.

2. **`partner-quote` accepted body-supplied `user_id` with no auth check, plus no `partner_type` whitelist.**
   Fix: same JWT requirement; added `ALLOWED_TYPES` whitelist (lender, insurance, transport, inspector, escrow, title_verification).

3. **`asset_verifications` SELECT policy was `USING (true)`** — exposing seller-side verification documents to any authenticated user.
   Fix: new migration `20260520_tighten_asset_verifications_rls.sql` scopes SELECT to active listings, the listing seller, the requester, or admins.

4. **No Content-Security-Policy header on the Vercel deployment.**
   Fix: added CSP, `Cross-Origin-Opener-Policy: same-origin`, and `interest-cohort=()` to Permissions-Policy in `vercel.json`.

After deploy, these are closed.

---

## 🟡 Not blockers, but watch list

These should be tracked but do NOT block a controlled private beta:

| Item | Owner | When |
|---|---|---|
| Main JS chunk 1.04 MB (`Reveal` pulls framer-motion eagerly) | frontend | Pre-public-launch |
| BuyerCompare table forces 720px min width on mobile | frontend | Pre-public-launch |
| TransactionRoom timeline + document checklist are client-state only — buyers can't resume on another device | product | Phase 2 |
| Partner Quote responses are sandbox stubs (labeled, with disclosure message) | partnerships | Per-partner rollout |
| Buyer Assistant edge function deployed but no UI surface yet | product | Next sprint |
| Plaid is in sandbox mode by default; live mode requires `PLAID_CLIENT_ID`/`PLAID_SECRET` env vars + verification at Plaid | ops | Per-vertical (financing rollout) |
| AviationServicesPage missing CFI/DPE categories | content | When CFI/DPE partners onboard |

---

## What "controlled private beta" means here

- **Verticals open:** boats, autos/trucks/exotics/classics, aircraft
- **User caps:** advised — small per-vertical cohorts so partner sandbox responses can be hand-replaced with real quotes as partners come online
- **Money flows:** Stripe is webhook-verified + idempotent; all large purchases still rely on third-party escrow, not platform funds
- **Aircraft caution:** all aircraft listings carry the aviation safety disclaimer; pre-buy inspections route to A&P/IA partners; FAA registration + logbook review surfaced as required closing steps

---

## What WOULD block a wider public beta later

- Live Plaid keys & a "Verify funds" step on offers over a threshold
- Live partner quote APIs (lender + insurance, at minimum) replacing sandbox stubs
- Transaction Room persistence + e-sign integration for closing docs
- Per-vertical content moderation queue staffed
- Independent security review (pentest) of admin and edge-function surfaces
