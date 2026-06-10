# RLS Audit — TradeWind

**Audit date:** 2026-05-26
**Method:** `grep -hiE "enable row level security|create policy" supabase/migrations/*.sql`
**Headline numbers:** 46 distinct tables with RLS enabled, 137 `CREATE POLICY` statements.

---

## Tables with `ENABLE ROW LEVEL SECURITY`

From `supabase/migrations/*.sql` (dedup, alphabetized):

| # | Table | Source migration |
|---|---|---|
| 1 | `ai_logs` | initial |
| 2 | `aircraft_prebuy_requests` | 20260430_aircraft |
| 3 | `aircraft_specs` | 20260430_aircraft |
| 4 | `asset_verifications` | 20260430_full_completion + 20260520 tighten |
| 5 | `auctions` | 20260430_full_completion |
| 6 | `audit_logs` | 20260430_security |
| 7 | `bids` | 20260430_full_completion |
| 8 | `blog_posts` | initial |
| 9 | `community_comments` | 20260430_community |
| 10 | `community_follows` | 20260430_community |
| 11 | `community_likes` | 20260430_community |
| 12 | `community_posts` | 20260430_community |
| 13 | `concierge_requests` | initial |
| 14 | `conversations` | 20260430_full_completion |
| 15 | `data_deletion_requests` | 20260430_ecosystem |
| 16 | `dealer_staff` | initial |
| 17 | `dealer_widgets` | 20260430_security |
| 18 | `dealers` | initial |
| 19 | `featured_listings` | initial |
| 20 | `financial_readiness` | 20260430_ecosystem |
| 21 | `financing_requests` | initial |
| 22 | `fraud_flags` | initial |
| 23 | `import_logs` | 20260430_security |
| 24 | `inquiries` | initial |
| 25 | `inspection_requests` | initial |
| 26 | `insurance_requests` | initial |
| 27 | `integration_requests` | 20260430_ecosystem |
| 28 | `listing_photos` | initial |
| 29 | `listing_videos` | initial |
| 30 | `listings` | initial |
| 31 | `market_reports` | initial |
| 32 | `messages` | 20260430_full_completion |
| 33 | `notifications` | initial |
| 34 | `offer_drafts` | 20260430_full_completion |
| 35 | `partner_quote_requests` | 20260430_security |
| 36 | `payments` | initial |
| 37 | `profiles` | initial |
| 38 | `reports` | 20260430_community |
| 39 | `reviews` | 20260430_full_completion |
| 40 | `saved_listings` | initial |
| 41 | `service_providers` | initial |
| 42 | `service_requests` | initial |
| 43 | `subscriptions` | initial |
| 44 | `transactions` | 20260430_security |
| 45 | `transport_requests` | initial |
| 46 | `webhook_events` | 20260430_security |

---

## Policy patterns

### Public-read tables (filtered)
- `listings` — `select` for `status = 'active'` only.
- `blog_posts` — `select` for `published_at is not null`.
- `market_reports` — `select` for `published_at is not null`.
- `dealers` / `service_providers` — public profile rows readable to everyone.
- `auctions` — `status in ('upcoming','live','ended')` readable.

### Owner-scoped tables
- `inquiries`, `saved_listings`, `notifications`, `financing_requests`,
  `insurance_requests`, `inspection_requests`, `transport_requests`,
  `concierge_requests`, `service_requests`, `financial_readiness`,
  `offer_drafts`, `partner_quote_requests`, `data_deletion_requests`,
  `aircraft_prebuy_requests` — all scoped to `auth.uid() = user_id` for
  `select` / `update` / `delete`.

### Conversation-scoped
- `conversations` — `select` requires the caller to appear in
  `participants` (jsonb array).
- `messages` — `select` requires conversation membership.

### Seller / dealer-staff scoped
- `listing_photos`, `listing_videos` — `insert` / `update` / `delete` require
  the caller to own the parent listing.
- `dealer_staff` — managed by `dealers.owner_id`.
- `dealer_widgets`, `import_logs` — scoped to dealer ownership.

### Admin-only `select`
- `audit_logs` — admin-only `select`; **insert allowed for authenticated**
  (so any signed-in action can leave a trail). See `src/lib/audit.ts`.
- `fraud_flags` — admin-only `select` and `update`.
- `reports` — admin-only `select`; insert allowed for any authenticated user.

### Webhook idempotency
- `webhook_events` — service-role write only (no JWT path). RLS-enabled to
  block anon/auth callers from reading idempotency state.

---

## Specific hardening passes (recent)

### 2026-05-21 — `20260521_prevent_self_role_escalation.sql`
Trigger `profiles_guard_admin_fields` (`SECURITY DEFINER`, `search_path = public`):
- Allows updates when `auth.uid() IS NULL` (service-role / trusted server).
- Allows updates when `public.is_admin()` returns true.
- Otherwise raises `ERRCODE 42501` on any change to `role`, `banned`, or
  `verification_level`.

**Tested by:** manual SQL `UPDATE profiles SET role='admin' WHERE id=auth.uid()` while signed in as a non-admin returns `permission denied` (42501).

### 2026-05-20 — `20260520_tighten_asset_verifications_rls.sql`
Removed the dangerous `USING (true)` policy. New visibility:
- Listing is `status = 'active'` → public read.
- Listing seller (or admin) can always read.
- Requester (`requested_by`) can read.

### 2026-04-30 — `20260430_security.sql`
- Created `audit_logs`, `webhook_events`, `transactions`, `import_logs`,
  `dealer_widgets`, `partner_quote_requests`.
- Enabled RLS on all of them.
- Admin-only read for `audit_logs`, `webhook_events`.

---

## Verification checklist

- [x] No `service_role` reference in `src/` (`grep -rn "service_role\|SERVICE_ROLE\|service-role" src/` → empty).
- [x] No `policy ... USING (true)` in current migrations (the `asset_verifications`
       case was the last and is fixed).
- [x] `profiles.role` / `banned` / `verification_level` cannot be set by self.
- [x] `audit_logs` insert from any auth session; read from admin only.
- [x] `webhook_events` write only via service-role (idempotency dedup).
- [x] Stripe webhook handler uses idempotent upserts (`onConflict: "stripe_subscription_id"`).
- [x] All 17 edge functions either verify a JWT or are signed-payload only.

---

## Open RLS items (not launch-blocking)

| Item | Owner | When |
|---|---|---|
| Add `policy ... AS RESTRICTIVE` layer on `payments` to require `auth.uid()` (currently permissive only — service-role inserts) | infra | next migration |
| Add `policy` on `ai_logs` to allow self-read so users can see their own AI history | infra | next migration |
| Migrate from hand-mirrored `src/types/database.ts` to `supabase gen types` | infra | post-launch |
