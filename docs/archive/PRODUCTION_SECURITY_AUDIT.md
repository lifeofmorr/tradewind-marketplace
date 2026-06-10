# Production Security Audit — TradeWind (Phase 3)

**Date:** 2026-06-03 · **Auditor:** Opus 4.8 (brutally honest pass) · **Live:** https://tradewind-marketplace.vercel.app

## Verdict: STRONG. One real hole found and FIXED this pass. One vendor/infra hardening item remains for public launch.

---

## 1. Secrets in the frontend — PASS
- `grep` of `src/` for `sk_live|sk_test|service_role|sk-ant|AKIA|secret` returns **nothing** except a doc comment in `src/lib/plaid.ts:9` naming the server-side var.
- Frontend only references public `VITE_*` vars: `VITE_SUPABASE_ANON_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`, Plaid sandbox/client-id, Sentry DSN — all client-safe by design.
- `.env` and `.env.local` are gitignored; `git ls-files` shows only `*.example` files tracked. **No secret has ever been committed.**
- All server secrets (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `PLAID_SECRET`) are read via `Deno.env` in edge functions only.

## 2. HTTP security headers (live) — PASS (excellent)
Pulled live from the deployed site:
- `content-security-policy`: full policy — `default-src 'self'`; script-src restricted to self + js.stripe.com + cdn.plaid.com; `object-src 'none'`; `frame-ancestors 'none'`; `base-uri 'self'`; `form-action 'self'`. Genuinely tight.
- `strict-transport-security: max-age=63072000; includeSubDomains; preload`
- `x-frame-options: DENY`, `x-content-type-options: nosniff`, `cross-origin-opener-policy: same-origin`, `referrer-policy: strict-origin-when-cross-origin`, `permissions-policy: camera=(), microphone=(), geolocation=()`.

This is better than most production SaaS. No action needed.

## 3. Webhook signature verification — PASS
- `supabase/functions/stripe-webhook/index.ts:45-71` implements HMAC-SHA256 over `${timestamp}.${payload}` with a **timing-safe** comparison and rejects bad signatures with 400 (`:240-241`). Correct per Stripe spec.

## 4. Admin protection — PASS
- All `/admin/*` routes gated by `<ProtectedRoute roles={["admin"]} />` (`src/App.tsx`).
- Admin-only tables enforce `public.is_admin()` in RLS (see SUPABASE_RLS_AUDIT.md).
- Self-role-escalation blocked by trigger `profiles_guard_admin_fields()` (`20260521_prevent_self_role_escalation.sql:36-47`) — uses `OLD.role` to check admin status, defeating the set-role-then-pass-check attack.

## 5. Storage policies — PASS
- Public buckets (`listings-photos`, `avatars`, dealer/service assets) are public-read but write-restricted by path ownership via `storage.foldername(name)[1] = auth.uid()` or dealer membership (`schema.sql:1399-1434`).
- `documents` bucket is **private** (public=false), owner-only read/write (`schema.sql:1576-1602`). Correct.

## 6. RLS hole found and FIXED this pass — was BLOCKER, now resolved
- `audit_logs` INSERT policy was `with check (true)` (`20260430_security.sql:27`) — any authenticated role could forge audit-trail rows.
- **Fixed:** `supabase/migrations/20260603_tighten_audit_logs_insert_rls.sql` restricts INSERT to `public.is_admin()`. Verified safe: every `logAuditEvent()` caller is an admin-only dashboard page (`src/pages/dashboard/admin/*`); the service_role used by triggers bypasses RLS. **Apply this migration to production before launch.**

## 7. Remaining hardening — WARNING (not a private-beta blocker)
- **AI edge functions have no per-user auth or rate limiting.** They are reachable with the public anon JWT and call paid Anthropic APIs. See AI_PRODUCTION_AUDIT.md. Cost-drain/abuse risk. Acceptable for an invited private beta with monitoring; **must add a server-side rate limiter before any public/unauthenticated launch.**
- **Anonymous public INSERT on `inquiries`, `beta_feedback`, `site_events`** is intentional (marketplace/forms/analytics) but unrate-limited — add IP/edge rate limiting before public scale.

## Blocker summary
| Item | Severity | Status |
|---|---|---|
| audit_logs forgeable INSERT | Medium | ✅ FIXED (migration pending apply) |
| AI endpoints: no rate limit | Med (public) / Low (private beta) | ⛔ OPEN — public-launch blocker |
| Anon form/inquiry rate limiting | Low | OPEN — pre-scale |
| Secrets / headers / webhook / admin / storage | — | ✅ PASS |
