# Auth + Access Control Audit — TradeWind

**Audit date:** 2026-05-26
**Auth provider:** Supabase Auth (email + password, JWT sessions)
**Files audited:** `src/contexts/AuthContext.tsx`, `src/routes/ProtectedRoute.tsx`, `src/routes/OnboardingGuard.tsx`, `src/pages/Login.tsx`, `src/pages/Signup.tsx`, `src/App.tsx`, `supabase/migrations/20260521_prevent_self_role_escalation.sql`.

## Roles

`buyer | seller | dealer | dealer_staff | service_provider | admin` (`src/types/database.ts::UserRole`).

- Signup form exposes only `buyer | seller | dealer | service_provider` (`SIGNUP_ROLES` in `Signup.tsx`).
- `admin` and `dealer_staff` are **not** selectable on signup.
- `signUp()` throws synchronously if `role === 'admin'` (`AuthContext.tsx`).
- Admins are promoted via SQL by an existing admin.
- `dealer_staff` is provisioned by a dealer owner via the dealer dashboard.

## Auth flows — verified

| Flow | Status | Evidence |
|---|---|---|
| Email/password login | ✅ | `Login.tsx`, `AuthContext.signIn()` |
| Email/password signup | ✅ | `Signup.tsx`, `AuthContext.signUp()` |
| Logout | ✅ | `AuthContext.signOut()` clears profile + Supabase session |
| Password reset | ✅ | Supabase Auth email link flow (default template) |
| Session persistence | ✅ | `createClient(..., { auth: { persistSession: true, autoRefreshToken: true } })` |
| Auth state subscription | ✅ | `onAuthStateChange` re-loads profile |
| Banned-user lockout | ✅ | `ProtectedRoute.tsx` redirects to `/` if `profile.banned` |
| Role-based redirect after login | ✅ | `useEffect` in `Login.tsx` honors `location.state.from` |
| Onboarding gate for dealer / service_provider | ✅ | `OnboardingGuard.tsx` |

## Route protection map (verified line-by-line in `src/App.tsx`)

### Public routes — no auth required
- `/`, `/browse`, `/boats`, `/autos`, `/aircraft`, `/jets`, `/helicopters`, `/aviation-services`
- `/categories`, `/categories/:category`, `/listings/:slug`
- `/dealers`, `/dealers/:slug`, `/services`, `/services/:slug`
- `/about`, `/contact`, `/blog`, `/blog/:slug`, `/market-reports`, `/market-reports/:slug`
- `/auctions`, `/auctions/:id`, `/pricing`, `/dealers-info`
- `/sell`, `/sell-my-boat`, `/sell-my-car`, `/services-hub`
- `/financing`, `/insurance`, `/inspections`, `/transport`, `/concierge`
- `/terms`, `/privacy`, `/delete-my-data`, `/trust`
- `/integrations`, `/integrations/developer`, `/community`
- `/checkout/success`, `/checkout/cancel`
- Programmatic SEO: `/by-state`, `/boats-for-sale-in-:state`, `/brands`, `/:brand-for-sale`, `/by-city`, `/:category-in-:city`
- 404 catch-all

### Auth required, any role
- `/messages`, `/messages/:id`
- `/buyer`, `/buyer/saved`, `/buyer/requests`, `/buyer/reviews`, `/buyer/compare`, `/buyer/finance`
- `/transactions/:id`

### Auth + onboarding required
- `/onboarding/dealer` — role `dealer`
- `/onboarding/service-provider` — role `service_provider`

### Seller dashboard — `seller | dealer | dealer_staff | admin`
- `/seller`, `/seller/listings`, `/seller/listings/new`, `/seller/listings/:id`
- `/seller/inquiries`, `/seller/auctions`

### Dealer dashboard — `dealer | dealer_staff | admin` + OnboardingGuard
- `/dealer`, `/dealer/inventory`, `/dealer/import`, `/dealer/widgets`
- `/dealer/leads`, `/dealer/analytics`, `/dealer/profile`

### Service-provider dashboard — `service_provider | admin` + OnboardingGuard
- `/service`, `/service/leads`, `/service/profile`

### Admin — `admin` only
- `/admin`, `/admin/listings`, `/admin/auctions`, `/admin/users`, `/admin/requests`
- `/admin/fraud`, `/admin/payments`, `/admin/content`, `/admin/blog`, `/admin/market-reports`

## Defense in depth

1. **Frontend `ProtectedRoute`** — blocks navigation pre-render. Loading state shown during `auth.getSession()`.
2. **Supabase RLS** — even if a UI guard is bypassed, every table/policy enforces ownership and role at the DB layer (`RLS_AUDIT.md`).
3. **Edge-function JWT verification** — every mutation function (`stripe-checkout`, `send-email`, `plaid-link`, all AI fns) calls `getAuthedUser(req)` and ignores body-supplied `user_id`.
4. **Self-role-escalation trigger** — `profiles_guard_admin_fields` rejects non-admin attempts to change `role`, `banned`, or `verification_level`.
5. **Webhook signature** — Stripe webhook verifies HMAC v1 with timing-safe compare before any DB write.

## Threat model — coverage matrix

| Threat | Mitigation | Status |
|---|---|---|
| Direct URL access to admin route by non-admin | `ProtectedRoute roles={["admin"]}` + RLS | ✅ |
| Banned user keeps session, accesses dashboard | `ProtectedRoute` checks `profile.banned` | ✅ |
| User tampers with localStorage to claim admin role | `profile` reloaded from DB on every auth event; RLS overrides | ✅ |
| Non-admin sends UPDATE profiles SET role='admin' | trigger raises 42501 | ✅ |
| Stripe checkout for someone else's listing | ownership verified in edge fn before metadata write | ✅ |
| Replayed Stripe webhook | HMAC + `webhook_events` idempotency | ✅ |
| CSRF on edge function via browser | CORS allow-list + JWT header required | ✅ |
| Clickjacking | `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` | ✅ |
| Open redirect after login | `from` honored only if relative path | ✅ (state-only) |
| Brute force login | Supabase Auth rate limits by IP | ⚙ MS — verify Supabase tier |

## Outstanding items (not launch-blocking)

- [ ] Add **MFA** (Supabase Auth supports TOTP) — recommended for admin role pre-public launch.
- [ ] Add **session timeout** UI hint at 30 min idle.
- [ ] **Audit log** sign-in events server-side (currently only mutations).
- [ ] **Login rate limit** — verify Supabase Auth project tier or add edge fn rate-limiter.
- [ ] **OAuth providers** (Google / Apple) — recommended for buyer conversion.

## Verdict

✅ **Auth + access control is production ready for enterprise private beta.**
Trigger-based escalation block is a meaningful hardening over the typical SaaS posture. MFA for admin role is the next clear hardening step.
