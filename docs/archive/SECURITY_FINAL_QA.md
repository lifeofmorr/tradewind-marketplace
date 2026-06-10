# Security Final QA · 2026-05-21

## Service-role leak check
`grep -rn "SUPABASE_SERVICE_ROLE_KEY\|service_role" src/` → **0 matches**.
Service-role usage is confined to edge functions and never reaches the browser
bundle.

## RLS posture
- `supabase/schema.sql` enables RLS and defines policies for all production
  tables. Across the schema and migrations there are **165+ `create policy`
  statements** covering 46 tables (listings, listing_photos, dealers,
  service_providers, profiles, inquiries, offer_drafts, transactions,
  audit_logs, reports, asset_verifications, partner_quote_requests,
  aircraft_specs, aircraft_prebuy_requests, financial_readiness,
  data_deletion_requests, integration_requests, community_*, etc.).
- Admin-gated tables (`audit_logs`, `reports`) require
  `role = 'admin'` in their policy `using`/`with check` clauses.
- `is_admin()` is `SECURITY DEFINER` with `set search_path = public` — safe
  against search-path attacks.
- `20260520_tighten_asset_verifications_rls.sql` already hardened
  `asset_verifications` access.

## P0 finding (fixed this pass): self role escalation
The pre-existing `profiles_update_own_or_admin` policy allowed a user to
UPDATE their own profile row, including the `role` column. Without a column
guard, a signed-in non-admin could PATCH `profiles` and set
`role = 'admin'`, escalating to full admin via the RLS bypass that
`is_admin()` grants.

**Fix:** new migration `supabase/migrations/20260521_prevent_self_role_escalation.sql`
installs a `BEFORE UPDATE` trigger on `public.profiles` that:
- Bypasses the check for service-role updates (`auth.uid() IS NULL`).
- Allows admins to set any field on any row.
- Raises `insufficient_privilege` (SQLSTATE 42501) if a non-admin tries to
  change `role`, `banned`, or `verification_level`.

The same trigger has been mirrored into `supabase/schema.sql` so dev/test
environments built from schema get the same protection.

> **Action required before beta invites go out:** apply the new migration to
> the live database (`qwaotydaazymgnvnfuuj`). Recommended via Supabase SQL
> editor or `supabase db push`. This is the only deploy-side action needed
> from this readiness pass.

The pre-existing `handle_new_user()` trigger already rejects `admin` on
signup, so the new trigger only needs to cover the post-signup UPDATE path.

## Security headers (live verification on `https://tradewind-marketplace.vercel.app`)
| Header | Value | Status |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | ✅ |
| `X-Frame-Options` | `DENY` | ✅ |
| `X-Content-Type-Options` | `nosniff` | ✅ |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | ✅ |
| `Cross-Origin-Opener-Policy` | `same-origin` | ✅ |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://cdn.plaid.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; media-src 'self' blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://production.plaid.com https://sandbox.plaid.com https://development.plaid.com; frame-src 'self' https://js.stripe.com https://cdn.plaid.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'` | ✅ |

`frame-ancestors 'none'`, `object-src 'none'`, and `form-action 'self'`
neutralize clickjacking, Flash/PDF embedding, and form-hijacking respectively.

## Admin route protection
Every admin route in `src/App.tsx` is wrapped in
`<ProtectedRoute roles={["admin"]} />` (lines 263–276):
- `/admin`, `/admin/listings`, `/admin/auctions`, `/admin/users`,
  `/admin/requests`, `/admin/fraud`, `/admin/payments`, `/admin/content`,
  `/admin/blog`, `/admin/market-reports`.
- `ProtectedRoute` short-circuits on `loading`, redirects unauthenticated
  users to `/login`, redirects `profile.banned = true` to `/`, redirects
  role mismatch to `/`.

## Legal / privacy pages
- `/terms` → `SimplePages.Terms` (eager-loaded under PublicShell)
- `/privacy` → `SimplePages.Privacy`
- `/delete-my-data` → `pages/public/DataDeletion` (lazy)
- `/trust` → `pages/public/TrustCenter`
All four routes are mounted in `App.tsx` and reachable from the footer.

## JWT on partner / Plaid edge functions
Verified previously in commit `d899f12` ("enterprise QA pass — JWT auth on
plaid/partner edge fns"). Re-spot-checked `partner-quote/index.ts` and
`plaid-link/index.ts` headers in this pass — both require Bearer JWT.

## Conclusion
**Zero security blockers after applying `20260521_prevent_self_role_escalation.sql`.**
The single P0 found in this pass is fixed in migration form; everything else
(headers, admin guards, RLS, legal pages, JWT auth on partner functions)
is already in place.
