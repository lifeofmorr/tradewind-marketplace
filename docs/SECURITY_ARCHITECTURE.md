# TradeWind Security Architecture

**Last updated:** 2026-05-26 (enterprise readiness pass)

This document is the canonical reference for how the TradeWind marketplace
handles authentication, authorization, payments, AI input/output, file storage,
HTTP security headers, and fraud response. It is meant to be short — the
authoritative source for any individual control is the code or the SQL it
references.

## 1. Authentication

- Auth provider: **Supabase Auth** (email + password, JWT-based sessions). See `src/contexts/AuthContext.tsx`.
- The browser receives a short-lived access token and a refresh token. We never
  store either token in `localStorage` ourselves; the Supabase client handles
  rotation (`persistSession: true, autoRefreshToken: true` in `src/lib/supabase.ts`).
- Roles: `buyer | seller | dealer | dealer_staff | service_provider | admin`.
  Roles live on `profiles.role`. The signup form refuses to create `admin`
  (`src/contexts/AuthContext.tsx::signUp` throws on `role === 'admin'`).
  Admins are promoted manually in SQL.
- Public anon key is the only Supabase key shipped to the browser. The
  service-role key is only available inside edge functions (`Deno.env`).

## 2. Authorization (Row Level Security)

- **46 application tables have RLS enabled, 137 policies total.** Coverage
  audited in `RLS_AUDIT.md`.
- Public-readable tables (e.g. `listings` with `status = 'active'`,
  `blog_posts`, `market_reports`) expose a narrow `select` policy with the
  filter applied in SQL — never relying on the client to filter sensitive rows.
- Owner-scoped tables (`inquiries`, `saved_listings`, `*_requests`,
  `conversations`, `messages`, `notifications`, `reports`,
  `financial_readiness`) gate `select` / `update` / `delete` to
  `auth.uid() = user_id` (or membership in `participants`).
- Admin-only views (`audit_logs`, `fraud_flags`) gate `select` to
  `exists (select 1 from profiles where id = auth.uid() and role = 'admin')`.
- **Role-escalation prevention** — `profiles_guard_admin_fields` trigger
  (`20260521_prevent_self_role_escalation.sql`) blocks any non-admin from
  changing `role`, `banned`, or `verification_level` on their own row. The
  trigger is `SECURITY DEFINER` with `search_path = public`.
- **Asset verification tightening** — the original `USING (true)` policy on
  `asset_verifications` was replaced by a scoped policy
  (`20260520_tighten_asset_verifications_rls.sql`).

## 3. Payments

- Stripe is the only payment processor. The publishable key is shipped to the
  browser; the **secret key lives only inside Supabase edge functions** and is
  never imported by `src/`. Verified: `grep -rn "service_role\|SERVICE_ROLE\|service-role" src/` returns no matches.
- Checkout sessions and subscription mutations are created server-side via
  `stripe-checkout` edge function, which verifies the caller's JWT, validates
  UUID and URL format, and **verifies ownership** before any listing/dealer/
  service-provider/concierge-request id is forwarded as Stripe metadata.
- Webhooks (`stripe-webhook` edge function) verify the Stripe signature with
  HMAC-SHA256 and a timing-safe compare on every request. Unsigned or
  replayed webhooks are rejected before any DB write. Idempotency is enforced
  via the `webhook_events` table.
- The `payments` table records Stripe IDs and metadata only — never raw card
  numbers. PCI scope stays with Stripe.

## 4. AI input / output

- System prompts for each AI workflow live server-side in edge functions
  and are never returned to the client. The browser only sees parsed,
  schema-validated output.
- The shared `_shared/anthropic.ts` helper defaults to `claude-sonnet-4-6`
  and falls back to OpenAI on transient errors. Both keys live in Supabase
  Function Secrets — never in `VITE_*` env vars.
- All free-text user input fed to AI is length-capped and prompt-injection
  screened. We treat AI output as untrusted: every consumer parses it (Zod
  schema or `parseJSON()`) before persisting or rendering.
- AI calls are logged in `ai_logs` with `workflow`, `tokens_in`, `tokens_out`,
  and `cost_cents`, so abuse and cost overruns are observable.

## 5. Storage

- Listing photos live in a Supabase storage bucket with RLS-equivalent
  policies. Sellers can write only to paths prefixed with their own
  `listing_id`; reads are public for active listings (via `publicStorageUrl()`
  in `src/lib/supabase.ts`).
- Uploads go through a presigned URL flow. The client validates content type
  (image/jpeg, image/png, image/webp) and size (≤ 10 MB) before posting; the
  storage policy re-checks on the server.

## 6. HTTP security headers

Set by `vercel.json` for every response, verified against the live deploy:

| Header | Value | Purpose |
| --- | --- | --- |
| `X-Content-Type-Options` | `nosniff` | Block MIME sniffing. |
| `X-Frame-Options` | `DENY` | Block clickjacking. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Strip path/query from cross-origin referrers. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | Deny opt-in features + FLoC. |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS at the edge. |
| `Cross-Origin-Opener-Policy` | `same-origin` | Isolate browsing context. |
| `Content-Security-Policy` | see below | Restrict script/connect/frame origins. |

**CSP** (from `vercel.json`):
```
default-src 'self';
script-src 'self' 'unsafe-inline' https://js.stripe.com https://cdn.plaid.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' data: https://fonts.gstatic.com;
img-src 'self' data: blob: https:;
media-src 'self' blob: https:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co
            https://api.stripe.com
            https://production.plaid.com https://sandbox.plaid.com https://development.plaid.com;
frame-src 'self' https://js.stripe.com https://cdn.plaid.com;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
```

> `'unsafe-inline'` for scripts is required by Vite's chunk bootstrap. A
> nonce-based CSP is on the post-launch hardening roadmap.

## 7. CORS for edge functions

Origin allow-list lives in `supabase/functions/_shared/cors.ts`:
- `https://gotradewind.com`, `https://www.gotradewind.com`
- `https://tradewind-marketplace.vercel.app`
- `http://localhost:5173`, `http://localhost:3000`
- Wildcard for `https://*.vercel.app` (preview deploys)
- Extras added via `ALLOWED_ORIGINS` env var
- `Vary: Origin` set on every response

## 8. Fraud response

- **AI screening** — every inquiry runs through `inquiry-fraud-check` before
  the seller is notified. Severity ≥ `high` short-circuits the email and
  creates a `fraud_flags` row.
- **User reporting** — the `reports` table + `<ReportButton>` component.
- **Audit log** — sensitive admin actions (status changes, refunds, role
  grants, ban/unban) are written to `audit_logs` via `src/lib/audit.ts`.
  Audit insert is best-effort; reads are admin-only.
- **Bans** — `profiles.banned = true` is the kill switch. `ProtectedRoute`
  redirects banned users to `/` regardless of role.
- **Buyer verification** — `profiles.verification_level` tracks trust level;
  high-trust actions gate on the level.

## 9. Secrets management

- **No service-role key in `src/`** — verified via grep on every audit pass.
- **No `.env*` files in git** — `.gitignore` excludes `.env.local`; only
  `.env.*.example` templates are committed.
- **Supabase Function Secrets** — single source of truth for non-VITE secrets.
- **Rotate on exposure** — any key that appears in a screenshot, log, or
  shared message is rotated within 24 hours.

## 10. Incident response

See `INCIDENT_RESPONSE_PLAN.md` for the playbook. Severity tiers, on-call
contacts, and post-mortem template live there.
