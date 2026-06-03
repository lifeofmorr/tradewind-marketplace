# Supabase RLS Audit — TradeWind (Phase 4)

**Date:** 2026-06-03 · **Method:** read of every `supabase/migrations/*.sql` + `schema.sql`.

## Verdict: RLS enabled on all tables; policies sound. One INSERT hole found and FIXED.

## Sensitive-table matrix
| Table | RLS | SELECT | INSERT | UPDATE/DELETE | Verdict |
|---|---|---|---|---|---|
| profiles | ✅ | own \| admin | own | own \| admin (+ role-guard trigger) | ✅ |
| listings | ✅ | active \| owner \| dealer-member \| admin | owner | owner \| dealer \| admin | ✅ |
| inquiries | ✅ | party \| admin | **public** (intentional) | seller \| dealer \| admin | ⚠ rate-limit |
| conversations / messages | ✅ | participant \| admin | participant | sender \| admin | ✅ |
| payments | ✅ | owner \| admin | service-role only | — | ✅ |
| subscriptions | ✅ | owner \| admin | service-role only | — | ✅ |
| webhook_events | ✅ | admin | service-role | — | ✅ idempotency table |
| fraud_flags | ✅ | admin only (ALL) | admin | admin | ✅ |
| admin_notifications | ✅ | admin | admin (trigger, SECURITY DEFINER) | admin | ✅ |
| beta_feedback | ✅ | admin | **public** (intentional /feedback) | admin | ✅ |
| site_events | ✅ | admin | **public** (intentional analytics) | — | ✅ |
| outreach_leads / messages | ✅ | admin only | admin | admin | ✅ |
| asset_verifications | ✅ | active-listing \| seller \| requester \| admin | authed | admin | ⚠ see note |
| audit_logs | ✅ | admin | ~~`true`~~ → **admin (FIXED)** | — | ✅ after fix |
| dealer_staff | ✅ | member \| admin | owner \| admin | owner \| admin | ✅ no self-add escalation |
| Storage buckets (6) | ✅ | public-read (5) / private (documents) | path-owner | path-owner | ✅ |

## Findings
1. **audit_logs INSERT `with check (true)`** (`20260430_security.sql:27`) — forgeable audit trail. **FIXED** in `20260603_tighten_audit_logs_insert_rls.sql` → restricted to `public.is_admin()`. (All real callers are admin pages; service_role bypasses RLS.) Apply to prod.
2. **asset_verifications** (`20260520_tighten_asset_verifications_rls.sql:14-19`) — verification status is readable on any active listing. Already tightened from a prior world-readable state. **WARNING:** if the row exposes failure reasons/lien detail, a browsing buyer could infer title problems. Recommend hiding failure metadata at the API/select layer, or restrict to seller/requester/admin. Not a blocker if results are limited to a pass/fail boolean.
3. **Public INSERT on inquiries / beta_feedback / site_events** — intentional and correct (anonymous buyer inquiries, public feedback form, anonymous analytics). SELECT is admin/party-only in every case. Add IP rate limiting before public scale to prevent spam floods.

## Role-escalation defense — PASS
`20260521_prevent_self_role_escalation.sql` trigger rejects non-admin changes to `role`/`banned`/`verification_level`, checking admin status against `OLD.role`. Correct.

**Net:** RLS posture is production-grade after the one fix is applied.
