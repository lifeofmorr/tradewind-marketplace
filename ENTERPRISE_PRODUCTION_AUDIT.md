# ENTERPRISE PRODUCTION AUDIT — TradeWind

**Audit date:** 2026-05-26
**Live URL:** https://tradewind-marketplace.vercel.app
**Supabase project:** qwaotydaazymgnvnfuuj
**Stack:** React 18 / Vite 5 / TypeScript 5.6 / Supabase / Tailwind / shadcn
**Status legend:**
- ✅ **PR** — Production ready
- 🛠 **NF** — Needs fix
- ⚙ **MS** — Needs manual setup (env vars / dashboard config)
- 🤝 **VA** — Needs vendor approval (Stripe live, Plaid prod, etc.)
- 🟡 **NB** — Not launch blocking

Each row references the file(s) that grounded the verdict. **Verified ranges only — nothing is asserted from memory.**

---

## 1. Frontend (Vite + React + TypeScript)

| Item | Status | Evidence |
|---|---|---|
| Build pipeline (`tsc -b && vite build`) | ✅ PR | `package.json` scripts.build |
| Strict TypeScript (`strict: true`) | ✅ PR | `tsconfig.json` |
| Lazy-loaded surfaces (Suspense + ErrorBoundary) | ✅ PR | `src/App.tsx` defines `<L>` wrapper around every lazy import |
| Top-level ErrorBoundary + AuthProvider + Router | ✅ PR | `src/main.tsx` |
| Per-route guard pattern | ✅ PR | `src/routes/ProtectedRoute.tsx`, `src/routes/OnboardingGuard.tsx` |
| 404 catch-all | ✅ PR | `<Route path="*" element={<NotFound />} />` in `src/App.tsx` |
| Banned-user lockout in route guard | ✅ PR | `ProtectedRoute.tsx` checks `profile?.banned` before role match |
| Public meta/SEO helper | ✅ PR | `src/lib/seo.ts` used on every page (`setMeta`) |
| Image lazy loading | ✅ PR | `react-intersection-observer` in deps, used in listing grids |
| Console errors on prod | 🟡 NB | One known `[supabase]` warn if env missing — guarded |

**Verdict:** Frontend is production ready.

---

## 2. Supabase Database

| Item | Status | Evidence |
|---|---|---|
| All migrations committed | ✅ PR | 16 migrations in `supabase/migrations/`, 3,164 lines total |
| Initial schema migration | ✅ PR | `20260101000000_initial.sql` |
| Aviation vertical migration | ✅ PR | `20260520_aviation_vertical.sql`, `20260430_aircraft.sql` |
| Community schema | ✅ PR | `20260430_community.sql` |
| Audit logs table | ✅ PR | RLS enabled, used by `src/lib/audit.ts` |
| Webhook idempotency table | ✅ PR | `webhook_events` RLS enabled |
| Self-role-escalation trigger | ✅ PR | `20260521_prevent_self_role_escalation.sql` |
| Demo media metadata | ✅ PR | `20260521_demo_media_metadata.sql` |
| TypeScript types mirror schema | ✅ PR | `src/types/database.ts` hand-mirrors `schema.sql` |
| Schema lives in repo | ✅ PR | `supabase/schema.sql` + per-migration |

**Verdict:** DB is production ready.

---

## 3. Row-Level Security (RLS)

| Item | Status | Evidence |
|---|---|---|
| 46 distinct tables with `ENABLE ROW LEVEL SECURITY` | ✅ PR | grep across all migrations |
| 137 distinct `CREATE POLICY` statements | ✅ PR | grep across all migrations |
| `asset_verifications` tightened (no more `USING (true)`) | ✅ PR | `20260520_tighten_asset_verifications_rls.sql` |
| `transactions`, `dealer_widgets`, `import_logs`, `partner_quote_requests` RLS enabled | ✅ PR | `20260430_security.sql` |
| Profile self-edits cannot escalate role, banned, verification_level | ✅ PR | trigger `profiles_guard_admin_fields` |
| Admin-only reads on sensitive tables (audit, fraud, payments) | ✅ PR | policies in `20260430_security.sql` |
| Service role bypass acknowledged in trigger | ✅ PR | trigger explicitly allows `auth.uid() IS NULL` |

**Verdict:** RLS is enterprise ready. See `RLS_AUDIT.md` for per-table review.

---

## 4. Supabase Storage

| Item | Status | Evidence |
|---|---|---|
| Public read for listing photos | ✅ PR | `publicStorageUrl()` in `src/lib/supabase.ts` |
| Upload pathway through edge fn / RLS | ⚙ MS | Buckets created in dashboard, not in repo migrations |
| Demo media metadata flag (`is_demo`) | ✅ PR | `20260521_demo_media_metadata.sql` |

**Action:** Document bucket setup in `MANUAL_SETUP_REQUIRED.md`. ✅ already covered there.

---

## 5. Edge Functions (17 active)

| Function | Auth | Logging | Status |
|---|---|---|---|
| `stripe-checkout` | JWT (own resources only) | console + audit | ✅ PR |
| `stripe-webhook` | HMAC v1 (no JWT) | console + DB upsert | ✅ PR |
| `send-email` | JWT or service-role | console | ✅ PR (forces `to` to caller email for non-admin) |
| `plaid-link` | JWT (uses `user.id`, ignores body) | console | ✅ PR / sandbox by default |
| `partner-quote` | JWT (uses `user.id`, ignores body) | console | ✅ PR |
| `auction-end` | service-role (cron-driven) | console | ✅ PR |
| `sitemap` | none (no-verify-jwt, public) | console | ✅ PR |
| `vin-decode` | JWT | console | ✅ PR |
| `photo-enhance` | JWT | console | ✅ PR |
| `inquiry-fraud-check` | JWT | console | ✅ PR |
| `ai-buyer-assistant` | JWT | console | ✅ PR |
| `ai-concierge-intake` | JWT | console | ✅ PR |
| `ai-fraud-check` | JWT | console | ✅ PR |
| `ai-listing-autopilot` | JWT | console | ✅ PR |
| `ai-listing-generator` | JWT | console | ✅ PR |
| `ai-negotiation-assistant` | JWT | console | ✅ PR |
| `ai-pricing-estimate` | JWT | console | ✅ PR |

Shared helpers:
- `_shared/cors.ts` — origin allow-list (gotradewind.com, vercel preview wildcard, localhost) + Vary: Origin
- `_shared/auth.ts` — Supabase JWT verification via `auth.getUser()`
- `_shared/anthropic.ts` — Claude (claude-sonnet-4-6) + OpenAI fallback

**Verdict:** All edge functions production ready.

---

## 6. Stripe (7 products / SKUs)

| Item | Status | Evidence |
|---|---|---|
| 7 product price-env mapping (`PRICE_ENV`) | ✅ PR | `stripe-checkout/index.ts` |
| Subscription vs one-off split correct | ✅ PR | `SUBSCRIPTION_KINDS` set |
| Ownership verified before checkout | ✅ PR | `userOwnsListing/Dealer/ServiceProvider/ConciergeRequest` |
| UUID + URL input validation | ✅ PR | `UUID_RE`, `URL_RE` in checkout |
| Webhook HMAC signature verification (timing-safe compare) | ✅ PR | `timingSafeEq()` in `stripe-webhook` |
| Webhook idempotency via `webhook_events` upsert | ✅ PR | `20260430_security.sql` table + RLS |
| Live-mode keys in Vercel/Supabase prod env | 🤝 VA | Not yet swapped — see `PAYMENT_PRODUCTION_READINESS.md` |

**Verdict:** Code is ready; live mode awaits vendor swap.

---

## 7. AI Functions (Anthropic + OpenAI fallback)

| Item | Status | Evidence |
|---|---|---|
| Anthropic default with OpenAI fallback | ✅ PR | `_shared/anthropic.ts` `callLLM()` |
| Token usage returned (`inputTokens`, `outputTokens`) | ✅ PR | `LLMResult` interface |
| JSON-mode handling for structured outputs | ✅ PR | `responseFormat: "json"` |
| Default model `claude-sonnet-4-6` (latest 4.X family) | ✅ PR | `ANTHROPIC_MODEL` env default |
| No secrets exposed to client | ✅ PR | All keys server-side via `Deno.env` |
| Fraud-check rate limiting | 🟡 NB | Soft-only via Stripe-style infra; add server-side rate limiter pre-public-launch |

**Verdict:** AI layer is production ready for private beta.

---

## 8. Community

| Item | Status | Evidence |
|---|---|---|
| Community posts / comments / likes / follows | ✅ PR | `20260430_community.sql`, all RLS-enabled |
| Reports table | ✅ PR | RLS-enabled, admin-readable |
| Community page lazy-loaded | ✅ PR | `src/App.tsx` `Community` lazy import |
| Moderator UI | ✅ PR | `AdminContent`, `AdminFraud` |

---

## 9. Integrations

| Item | Status | Evidence |
|---|---|---|
| Integrations page | ✅ PR | `src/pages/public/Integrations.tsx` |
| Developer Hub | ✅ PR | `src/pages/public/DeveloperHub.tsx` |
| Integration requests table | ✅ PR | RLS-enabled |
| Partner API helpers | ✅ PR | `src/lib/partnerApi.ts`, `src/lib/connectedApps.ts` |
| OAuth flows | ⚙ MS | Live partner credentials required |

---

## 10. Financial Hub (Plaid + readiness scoring)

| Item | Status | Evidence |
|---|---|---|
| FinancialHub buyer page | ✅ PR | `src/pages/buyer/FinancialHub.tsx` (lazy) |
| Plaid edge fn JWT-gated, sandbox by default | ✅ PR | `plaid-link/index.ts` |
| `financial_readiness` table RLS-enabled | ✅ PR | migration |
| Real Plaid credentials | 🤝 VA | `PLAID_CLIENT_ID` / `PLAID_SECRET` not set → sandbox stub |

---

## 11. Dealer Tools

| Item | Status | Evidence |
|---|---|---|
| Dealer dashboard + inventory + leads + analytics | ✅ PR | `src/pages/dashboard/dealer/*` |
| CSV import w/ schema validation | ✅ PR | `src/lib/csvImport.ts`, `DealerImport.tsx` |
| Embed widgets | ✅ PR | `DealerWidgets.tsx`, `dealer_widgets` table |
| Onboarding gate | ✅ PR | `OnboardingGuard.tsx` redirects to `/onboarding/dealer` if no `dealer_id` |
| Dealer-staff role + RLS | ✅ PR | `dealer_staff` table + policies |

---

## 12. Admin Tools

| Item | Status | Evidence |
|---|---|---|
| 10 admin pages (Listings, Auctions, Users, Requests, Fraud, Payments, Content, Blog, MarketReports, Dashboard) | ✅ PR | `src/pages/dashboard/admin/*` |
| Admin-only RLS on sensitive tables | ✅ PR | 137 policies including admin-bypass |
| Admin can't self-grant via UI — trigger blocks | ✅ PR | `profiles_guard_admin_fields` |
| Audit logs reachable via admin only | ✅ PR | RLS policy + `src/lib/audit.ts` |

---

## 13. Aircraft Vertical

| Item | Status | Evidence |
|---|---|---|
| 9 aircraft categories in enum | ✅ PR | `src/types/database.ts` ListingCategory |
| Aviation services category | ✅ PR | `aviation_services` enum value |
| `aircraft_specs` + `aircraft_prebuy_requests` tables, RLS | ✅ PR | `20260430_aircraft.sql` |
| `/aircraft`, `/jets`, `/helicopters`, `/aviation-services` routes | ✅ PR | `src/App.tsx` |
| AI aircraft context fix | ✅ PR | commit `9fdc2db` |
| Aviation safety helpers | ✅ PR | `src/lib/aviationSafety.ts` |
| Demo reclass migration | ✅ PR | `20260520_aircraft_demo_reclass.sql` |

---

## 14. Security Headers

`vercel.json` configures (verified by reading file):
- ✅ `X-Frame-Options: DENY`
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ✅ `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
- ✅ `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- ✅ `Cross-Origin-Opener-Policy: same-origin`
- ✅ `Content-Security-Policy` — restricts to self + Stripe + Plaid + Supabase + Google Fonts, with `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`

**Verdict:** ✅ PR. CSP allows `'unsafe-inline'` for scripts — required by Vite chunk init; tracked as an enhancement for nonce-based CSP post-launch.

---

## 15. Error Handling

| Item | Status | Evidence |
|---|---|---|
| Top-level ErrorBoundary | ✅ PR | `src/main.tsx` + `src/components/ui/ErrorBoundary.tsx` |
| Per-lazy-route ErrorBoundary | ✅ PR | `<L>` wrapper in `src/App.tsx` |
| Auth context catches profile-load errors | ✅ PR | `AuthContext.tsx` try/catch |
| Edge fn errors wrapped in `errorResponse()` | ✅ PR | `_shared/cors.ts` |
| Email send failures are swallowed in webhook | ✅ PR | `stripe-webhook` `sendEmail()` try/catch |

---

## 16. Logging

| Item | Status | Evidence |
|---|---|---|
| `audit_logs` table + `logAuditEvent()` helper | ✅ PR | `src/lib/audit.ts` |
| Edge fn `console.warn/error` | ✅ PR | every fn |
| Webhook event dedup table | ✅ PR | `webhook_events` |
| Centralized client log shipper | 🛠 NF | Add Sentry-ready hook — see `OBSERVABILITY_PLAN.md` |

---

## 17. Monitoring

| Item | Status | Evidence |
|---|---|---|
| Supabase project metrics (dashboard) | ⚙ MS | Built-in, just enable email alerts |
| Vercel analytics | ⚙ MS | Toggle in Vercel project settings |
| Stripe dashboard alerts | ⚙ MS | Configure email alerts on failed payments |
| Sentry / Rollbar | 🛠 NF | `VITE_SENTRY_DSN` placeholder added — see Phase 7 |

---

## 18. Backups & Recovery

| Item | Status | Evidence |
|---|---|---|
| Supabase Pro plan PITR | ⚙ MS | Enabled in Supabase dashboard — confirm tier supports 7-day PITR |
| Daily logical backups | ⚙ MS | `pg_dump` runbook in `BACKUP_RECOVERY_PLAN.md` |
| Migration rollback runbook | ✅ PR | see `DATABASE_OPERATIONS.md` |

---

## 19. Legal Pages

| Item | Status | Evidence |
|---|---|---|
| `/privacy` | ✅ PR | `SimplePages.tsx` |
| `/terms` | ✅ PR | `SimplePages.tsx` |
| `/trust` (Trust Center) | ✅ PR | `src/pages/public/TrustCenter.tsx` |
| `/delete-my-data` | ✅ PR | `src/pages/public/DataDeletion.tsx` |
| `data_deletion_requests` table | ✅ PR | RLS-enabled |
| Cookie notice | 🟡 NB | Captured in privacy; banner ok pre-launch |

---

## 20. Performance

| Item | Status | Evidence |
|---|---|---|
| 25+ surfaces lazy-loaded behind Suspense | ✅ PR | `src/App.tsx` |
| Image lazy (intersection observer) | ✅ PR | dependency |
| Query staleTime 30s, no refetchOnFocus | ✅ PR | `src/main.tsx` `QueryClient` |
| Bundle sizes reported | see `PERFORMANCE_AUDIT.md` |

---

## 21. Mobile

| Item | Status | Evidence |
|---|---|---|
| Responsive tailwind | ✅ PR | grid + breakpoints across pages |
| Touch-friendly button sizes | ✅ PR | `Button` size variants |
| Final mobile QA report exists | ✅ PR | `MOBILE_FINAL_QA.md` |

---

## 22. Deployment

| Item | Status | Evidence |
|---|---|---|
| Push to `main` → Vercel auto-deploy | ✅ PR | confirmed via recent commits |
| `vercel.json` rewrite for sitemap | ✅ PR | proxies to Supabase fn |
| Headers + CSP shipped | ✅ PR | `vercel.json` |
| Rollback runbook | ✅ PR | `ROLLBACK_PLAN.md` |

---

## SUMMARY — ENTERPRISE GATING

- ✅ **PR** count: 110+ items
- 🛠 **NF** count: 2 (Sentry-ready hook, centralized client log shipper — same fix)
- ⚙ **MS** count: ~8 (env vars, bucket setup, vendor dashboards)
- 🤝 **VA** count: 2 (Stripe live mode, Plaid production)
- 🟡 **NB** count: 4 (cookie banner polish, rate limits, CSP nonce upgrade)

**Conclusion:** TradeWind is **READY for controlled enterprise private beta** pending the documented manual setup and vendor approvals. No launch-blocking code defects discovered in this audit.
