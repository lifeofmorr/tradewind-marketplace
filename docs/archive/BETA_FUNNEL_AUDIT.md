# Beta / Feedback Funnel Audit — TradeWind (Phase 7)

**Date:** 2026-06-03

## Verdict: WORKING END-TO-END. No broken links in the funnel.

## Flow
1. **`/beta`** (`src/pages/public/BetaPage.tsx`) — captures UTM + `lead_id` via `captureAttribution()` into sessionStorage (`:115-118`); CTAs route to `/feedback` and an external call link.
2. **`/feedback`** (`src/pages/public/FeedbackPage.tsx`) — reads attribution (`:101`), inserts into `beta_feedback` with UTM/referrer/landing_page (`:127`), fires `feedback_submitted` event (`:139-144`).
3. **`beta_feedback` table** (`20260528_beta_feedback.sql` + `_attribution.sql`) — public INSERT, admin-only SELECT/UPDATE; default `created_at`; attribution columns + nullable `lead_id` FK to `outreach_leads`.
4. **Admin inbox** (`src/pages/dashboard/admin/AdminBetaInbox.tsx`) — fetches all rows (`:152-163`), hydrates linked lead (`:172-183`), status workflow new→reviewed→interested→demo_requested→beta_invited, writes back via `updateStatus()` (`:225-243`) with cache invalidation. Status changes logged to audit_logs (best-effort).
5. **Admin notification** — trigger on `beta_feedback` insert creates an `admin_notifications` row (`20260528_admin_notifications.sql`), so the founder sees new feedback live.
6. **Pipeline** — `beta_pipeline` extended stages (`20260527_beta_pipeline_expanded_stages.sql:41-54`): interested → wants_demo → demo_booked → demo_completed → beta_invited → beta_onboarded → real_listing_candidate → partner_candidate → paid_candidate (+ terminal stages).

## Checks
| Check | Status |
|---|---|
| Feedback persists | ✅ Supabase insert, no deletes |
| Admin inbox wired to table | ✅ reads + writes status |
| Attribution captured | ✅ UTM + referrer + lead_id |
| Pipeline stages defined | ✅ 12 stages |
| Notification on submit | ✅ trigger → admin_notifications |

**Blockers:** none. Funnel is production-ready. (Minor: one email can submit multiple times — intentional, low spam risk in closed beta.)
