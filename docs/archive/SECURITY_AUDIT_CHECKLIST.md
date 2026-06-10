# Security Audit Checklist

Run before each beta milestone and at minimum quarterly.

## Row Level Security (RLS)

- [ ] RLS enabled on every public-schema table (`SELECT FROM pg_tables`)
- [ ] `profiles` — users can read self + public columns; only self/admin update
- [ ] `dealers` / `service_providers` — owner + staff write; public read
- [ ] `dealer_staff` — only dealer owners manage their staff list
- [ ] `listings` — seller + dealer staff write; public read for active only
- [ ] `listing_photos` / `listing_videos` — gated through listing ownership
- [ ] `saved_listings` — strictly per-user
- [ ] `inquiries` — buyer write; seller/dealer/admin read; never public
- [ ] `financing_/insurance_/inspection_/transport_requests` — submitter + admin/partner read
- [ ] `concierge_requests` — submitter + admin only
- [ ] `service_requests` — submitter + provider + admin
- [ ] `subscriptions` / `payments` — owner + admin; never public
- [ ] `featured_listings` — public read; admin write only
- [ ] `fraud_flags` — reporter + admin; never public
- [ ] `ai_logs` — admin-only
- [ ] `notifications` — recipient-only
- [ ] `messages` / `conversations` — participant-only
- [ ] `reviews` — public read for published; reviewer + admin write
- [ ] `auctions` / `bids` — public read for live/upcoming; bidder write own bid
- [ ] `integration_requests` — submitter + admin

## Authentication

- [ ] Email confirmation required in production (no auto-confirm)
- [ ] Password minimum length and complexity enforced
- [ ] Session JWTs short-lived (≤ 1h), refresh rotation on
- [ ] OAuth providers (if any) restricted to verified domains
- [ ] Admin role requires manual provisioning — no self-service
- [ ] Banned users cannot log in (`profiles.banned` checked in middleware)

## Payments

- [ ] Stripe webhook secret rotated and stored in Supabase secrets
- [ ] Webhook signature verified before any DB write
- [ ] No card / bank credentials touch our database
- [ ] Idempotency keys used on all charge creates
- [ ] Subscription state changes traceable in `payments` + `subscriptions`

## Edge Functions

- [ ] All inputs schema-validated (zod) before use
- [ ] Service role key used only server-side, never returned to client
- [ ] Rate limits on AI workflow invocations per-user
- [ ] CORS restricted to TradeWind domains
- [ ] Errors logged but never leak stack traces to client

## File Uploads

- [ ] Storage buckets RLS-locked to listing ownership
- [ ] MIME type and extension whitelist enforced
- [ ] Max file size enforced (images ≤ 10MB, videos ≤ 200MB)
- [ ] EXIF GPS scrubbed on upload (privacy)
- [ ] Public URLs only for cover/gallery; private buckets for KYC
