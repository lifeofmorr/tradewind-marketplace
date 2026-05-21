# TradeWind Beta Blockers

**Date:** 2026-05-21
**Status after the final enterprise beta readiness gate: ZERO blockers for controlled private beta across boats, autos, and aircraft.**

This file lists anything that *would* block a wider release if not addressed.

---

## Final gate (2026-05-21): ZERO blockers

| Dimension | Result |
|---|---|
| Critical bugs | 0 |
| High-priority bugs | 0 |
| Dead buttons | 0 (every "coming soon" / "preview" surface is honestly labeled — see `ZERO_DEAD_BUTTON_AUDIT.md`) |
| Broken images | 0 (15/15 random demo URLs return 200 image/jpeg) |
| Misleading demo listings | 0 (every demo listing carries an `is_demo` banner; demo media tagged `image_source='unsplash'`, `is_demo_media=true`) |
| Payment blockers | 0 (Stripe path JWT-authenticated, ownership-checked, signature-verified, idempotent) |
| AI blockers | 0 (aircraft-aware as of this pass; aviation safety has local fallback) |
| Security blockers | 0 (self-role-escalation hole closed in `20260521_prevent_self_role_escalation.sql`) |

**Action required before invites go out:** apply
`supabase/migrations/20260521_prevent_self_role_escalation.sql` to the live
database (project `qwaotydaazymgnvnfuuj`). All other fixes ship via the
Vercel auto-deploy.

---

## 🟢 Blockers cleared earlier in the beta-readiness cycle

1. **`plaid-link` accepted body-supplied `user_id` with no auth check.** Fixed in commit `d899f12` — edge fn verifies the Supabase JWT and uses the authed user's id.
2. **`partner-quote` accepted body-supplied `user_id` with no auth check, plus no `partner_type` whitelist.** Fixed in `d899f12` — same JWT requirement; `ALLOWED_TYPES` whitelist added.
3. **`asset_verifications` SELECT policy was `USING (true)`.** Fixed in `20260520_tighten_asset_verifications_rls.sql`.
4. **No Content-Security-Policy header on the Vercel deployment.** Fixed in `d899f12` — CSP, COOP, `interest-cohort=()` all live and verified via `curl -I`.
5. **Demo media subject mismatches (VW van for "boat", coffee cup for "performance_boat", etc.).** Fixed in `b823f7b` (source-match-demo-photos.sql).
6. **Demo media without license attribution.** Fixed in `b0a15b0` (`20260521_demo_media_metadata.sql`).
7. **AI listing-generator / pricing-estimate / concierge-intake / fraud-check / buyer-assistant only knew about boats and autos.** Fixed in this pass — all five are aircraft-aware.
8. **`profiles_update_own_or_admin` allowed users to set their own `role` to admin.** Fixed in this pass — `20260521_prevent_self_role_escalation.sql`.

---

## 🟡 Not blockers — watch list (do NOT block controlled private beta)

| Item | Owner | When |
|---|---|---|
| Main JS chunk 1.04 MB ungzipped / 296 KB gzipped — `manualChunks` can shave ~25% | frontend | Pre-public-launch |
| TransactionRoom timeline + checklist are client-state only — buyer can't resume across devices | product | Phase 2 |
| Partner Quote responses are sandbox stubs (labeled in the UI) | partnerships | Per-partner rollout |
| Plaid is in sandbox by default; live mode requires `PLAID_CLIENT_ID` + `PLAID_SECRET` env vars | ops | Per-vertical (financing rollout) |
| Developer Hub & Integrations marketplace are request-access only | platform | When API is GA |
| `BuyerCompare` table forces ~720px min width on mobile | frontend | Pre-public-launch |

---

## What "controlled private beta" means here

- **Verticals open:** boats, autos/trucks/exotics/classics, aircraft (10 categories)
- **User caps:** small per-vertical cohorts so partner sandbox responses can be replaced with real quotes as partners come online
- **Money flows:** Stripe is webhook-verified + idempotent; large purchases rely on third-party escrow, not platform funds
- **Aircraft caution:** every aircraft listing carries the aviation safety disclaimer; pre-buy inspections route to A&P/IA partners; FAA registration + logbook review surfaced as required closing steps

---

## What WOULD block a wider public beta later

- Live Plaid keys + a "Verify funds" step on offers over a threshold
- Live partner quote APIs (lender + insurance, at minimum) replacing sandbox stubs
- Transaction Room persistence + e-sign integration for closing docs
- Per-vertical content moderation queue staffed
- Independent security review (pentest) of admin + edge function surfaces
