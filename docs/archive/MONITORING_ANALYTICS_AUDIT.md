# Analytics / Monitoring Audit — TradeWind (Phase 13)

**Date:** 2026-06-03

## Verdict: First-party analytics work. Error monitoring (Sentry) is NOT wired — the main observability gap.

## Analytics — working
- `trackEvent()` (`src/lib/trackEvent.ts:137-163`) fire-and-forget inserts into `site_events` (`20260528_site_events.sql`): `event_type`, JSONB `metadata`, `session_id`, `created_at`; enriched with UTM/lead_id from sessionStorage. RLS: anon insert, admin read.
- Events include `listing_detail_view`, `feedback_submitted`, payment events, beta page views.

## Admin notifications — working
- Trigger on `beta_feedback` insert → `admin_notifications` row (`20260528_admin_notifications.sql`), admin-only RLS, surfaced via NotificationBell.

## Audit logs — working (and now hardened)
- `audit_logs` written by admin actions via `logAuditEvent` (`src/lib/audit.ts`). INSERT policy tightened to admin this pass (Phase 4 fix).

## Sentry — NOT WIRED (WARNING)
- `src/lib/telemetry.ts:19-26`: reads `VITE_SENTRY_DSN` but **all Sentry calls are commented out**; logs `"DSN present, Sentry not yet wired"`. **No runtime error capture in production.**
- **Action before live business:** install `@sentry/react`, init in `telemetry.ts`, verify source maps + a test exception. This is the top monitoring gap.

## Status
| Item | Status |
|---|---|
| site_events analytics | ✅ |
| admin_notifications | ✅ |
| audit_logs | ✅ (hardened) |
| Sentry error tracking | ⛔ not wired — wire before live |
| Uptime/alerting | see `OBSERVABILITY_PLAN.md` (planned) |
