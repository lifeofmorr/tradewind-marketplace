# TradeWind Security Architecture

Last updated: 2026-04-29.

This document is the canonical reference for how the TradeWind marketplace
handles authentication, authorization, payments, AI input/output, file storage,
HTTP security headers, and fraud response. It is meant to be short — the
authoritative source for any individual control is the code or the SQL it
references.

## 1. Authentication

- Auth provider: **Supabase Auth** (email + password, JWT-based sessions).
- The browser receives a short-lived access token and a refresh token. We never
  store either token in `localStorage` ourselves; the Supabase client handles
  rotation.
- Roles: `buyer | seller | dealer | dealer_staff | service_provider | admin`.
  Roles live on `profiles.role`. The signup form refuses to create `admin` —
  admins are promoted manually in SQL.
- Public anon key is the only Supabase key shipped to the browser. The
  service-role key is only available inside edge functions.

## 2. Authorization (Row Level Security)

- **Every** application table has RLS enabled. Policies are defined in
  `supabase/migrations/*.sql` alongside the table.
- Public-readable tables (e.g. `listings` with `status = 'active'`,
  `blog_posts`, `market_reports`) expose a narrow `select` policy with the
  filter applied in SQL — never relying on the client to filter sensitive rows.
- Owner-scoped tables (`inquiries`, `saved_listings`, `*_requests`,
  `conversations`, `messages`, `notifications`, `reports`,
  `financial_readiness`) gate `select` / `update` / `delete` to
  `auth.uid() = user_id` (or membership in `participants`).
- Admin-only views (`audit_logs`, `fraud_flags`, `reports`) gate `select` to
  `exists (select 1 from profiles where id = auth.uid() and role = 'admin')`.

## 3. Payments

- Stripe is the only payment processor. The publishable key is shipped to the
  browser; the **secret key lives only inside Supabase edge functions** and is
  never imported by `src/`.
- Checkout sessions and subscription mutations are created server-side via
  edge functions, which verify the caller's JWT before invoking the Stripe SDK.
- Webhooks (`stripe-webhook` edge function) verify the Stripe signature on
  every request. Unsigned or replayed webhooks are rejected before any DB
  write.
- The `payments` table records Stripe IDs and metadata only — never raw card
  numbers. PCI scope stays with Stripe.

## 4. AI input / output

- The system prompt for each AI workflow lives server-side in edge functions
  and is never returned to the client. The browser only sees parsed,
  schema-validated output (e.g. listing copy, fraud severity).
- All free-text user input fed to AI is run through a length cap and a
  prompt-injection screen before reaching the model. We treat AI output as
  untrusted: every consumer parses it (Zod schema or JSON.parse with
  validation) before persisting or rendering.
- AI calls are logged in `ai_logs` with `workflow`, `tokens_in`, `tokens_out`,
  and `cost_cents`, so abuse and cost overruns are observable.

## 5. Storage

- Listing photos live in a Supabase storage bucket with RLS-equivalent
  policies. Sellers can write only to paths prefixed with their own
  `listing_id`; reads are public for active listings.
- Uploads go through a presigned URL flow. The client validates content type
  (image/jpeg, image/png, image/webp) and size (≤ 10 MB) before posting; the
  storage policy re-checks on the server.

## 6. HTTP security headers

Set by `vercel.json` for every response (see `vercel.json`):

| Header | Value | Purpose |
| --- | --- | --- |
| `X-Content-Type-Options` | `nosniff` | Block MIME sniffing of script/style assets. |
| `X-Frame-Options` | `DENY` | Block clickjacking via iframe embeds. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Strip path/query from cross-origin referrers. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Deny opt-in browser features the app does not use. |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS at the Vercel edge. |

A Content Security Policy is enforced via the `<meta http-equiv>` tag in
`index.html` rather than a Vercel header so it can reference dynamic Supabase
project URLs in dev. Sources allowed: `'self'`, Supabase project, Stripe.

## 7. Fraud response

- **AI screening** — every inquiry runs through the `inquiry-fraud-check` edge
  function before the seller is notified. Severity ≥ `high` short-circuits the
  email and creates a `fraud_flags` row for admin review.
- **User reporting** — the `reports` table backs the `<ReportButton>`
  component on listings, posts, and messages. Any authenticated user can
  report; admins triage from the moderation queue.
- **Audit log** — sensitive admin actions (status changes, refunds, role
  grants, ban/unban) are written to `audit_logs` with actor, target, IP, and
  timestamp. Admins-only `select` policy.
- **Bans** — `profiles.banned = true` is the kill switch. The login flow
  checks the flag on profile load and signs the user out if banned.
- **Buyer verification** — `profiles.verification_level` tracks the verified
  level (`unverified` → `tradewind_verified`); high-trust actions (large
  offers, concierge engagements) gate on the level.
