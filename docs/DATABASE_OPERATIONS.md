# Database Operations — TradeWind

**Database:** Supabase Postgres 15 (project `qwaotydaazymgnvnfuuj`)
**Migration tool:** `supabase` CLI v1.207.9 (pinned in `package.json` devDependencies)

## Schema artifacts

- `supabase/schema.sql` — canonical full schema dump.
- `supabase/migrations/*.sql` — 16 ordered migrations (3,164 lines total).
- `supabase/seed.sql` — dev/staging-only listing/dealer seed data.
- `supabase/aircraft_seed.sql` — aviation vertical seed.
- `supabase/realistic-demo-descriptions.sql`, `repair-demo-photos.sql`, `source-match-demo-photos.sql`, `backfill-demo-photos.sql`, `demo_score_patch.sql` — one-shot demo data fixers (idempotent, dev/staging only).

## Migration order (verified)

```
20260101000000_initial.sql
20260101000100_phase3.sql
20260101000200_seed.sql
20260101000400_advantage.sql
20260101000500_priority2.sql
20260429_completion.sql
20260430_aircraft.sql
20260430_community.sql
20260430_ecosystem.sql
20260430_full_completion.sql
20260430_security.sql
20260520_aircraft_demo_reclass.sql
20260520_aviation_vertical.sql
20260520_tighten_asset_verifications_rls.sql
20260521_demo_media_metadata.sql
20260521_prevent_self_role_escalation.sql
```

## Applying migrations

### Local
```bash
supabase start
supabase db reset      # wipes + re-applies migrations + seed
```

### Staging
```bash
supabase link --project-ref <staging-ref>
supabase db push --linked
```

### Production
```bash
supabase link --project-ref qwaotydaazymgnvnfuuj
supabase db diff --linked       # dry-run — review SQL
supabase db push --linked       # apply
```

> **Production rule:** always `db diff` first. Never run an unreviewed migration against prod.

## Indexes (86 verified)

A representative slice from `grep "create index" supabase/migrations/*.sql`:

- `listings_status_idx`, `listings_category_status_idx`, `listings_seller_id_idx`, `listings_dealer_id_idx`, `listings_price_idx`, `listings_year_idx`, `listings_state_idx`, `listings_featured_idx (partial WHERE is_featured)`, `listings_created_at_idx (desc)`, `listings_search_gin (GIN over tsvector)`.
- `listing_photos_listing_id_idx (listing_id, position)`.
- `inquiries_seller_status_idx`, `inquiries_dealer_status_idx`.
- `auctions_status_end_idx (status, end_time)`, `auctions_listing_idx`.
- `bids_auction_amount_idx (auction_id, amount_cents desc)`, `bids_bidder_idx (bidder_id, created_at desc)`.
- `conversations_participants_idx (GIN over participants)`, `conversations_last_msg_idx (last_message_at desc)`.
- `messages_conv_created_idx (conversation_id, created_at)`, `messages_sender_idx (sender_id, created_at desc)`.
- `reviews_dealer_idx`, `reviews_sp_idx`, `reviews_reviewer_idx`.

**Pagination & search:** GIN index on `listings` supports search; created-at indexes support cursor pagination.

## Audit logs

- Table: `audit_logs(id, actor_id, action, target_type, target_id, metadata jsonb, created_at)`.
- Insert path: `src/lib/audit.ts::logAuditEvent()` — best-effort, never throws.
- Read path: admin only via RLS.

## Webhook events (idempotency)

- Table: `webhook_events(id, provider, event_id, payload jsonb, received_at)`.
- Service-role write only; reads admin-only.
- Stripe webhook checks for existing `event_id` before processing.

## Rollback strategy

**Hard rollback (rare):**
1. Restore from Supabase PITR snapshot (Pro plan, 7-day window).
2. Apply only migrations up to the target timestamp.

**Soft rollback (preferred):**
1. Write a **forward** migration that reverses the offending change.
2. Test on staging.
3. Apply via `db push`.

**Why forward-only:** rollback by re-running an older migration is destructive on production data. The forward-fix pattern is auditable and reversible itself.

## Demo vs real data

- All seeded rows are flagged `is_demo = true` on `listings`.
- Public UI shows a "Demo listing" pill on every demo card (`demoMediaMap.ts`).
- Admin can filter to real-only or demo-only.
- Demo media metadata lives in `20260521_demo_media_metadata.sql` for transparency.

## Seed file usage

| File | Target | Idempotent? |
|---|---|---|
| `supabase/seed.sql` | local + staging | Yes — uses `on conflict do nothing` |
| `supabase/aircraft_seed.sql` | local + staging | Yes |
| `supabase/realistic-demo-descriptions.sql` | local + staging | Yes |
| `supabase/repair-demo-photos.sql` | local + staging | Yes |
| `supabase/source-match-demo-photos.sql` | local + staging | Yes |
| `supabase/backfill-demo-photos.sql` | local + staging | Yes |
| `supabase/demo_score_patch.sql` | local + staging | Yes |

**Never run seed files against production.** All seed scripts are gated by the operator running them; no CI auto-seed step exists.

## Day-2 ops cheatsheet

```bash
# View live schema
supabase db dump --linked --schema public > /tmp/prod-schema.sql

# Check recent migrations
supabase migration list --linked

# Tail edge function logs
supabase functions logs stripe-webhook --linked

# Run psql interactively
psql "$(supabase status -o json | jq -r .DB_URL)"  # local
# prod: pgAdmin / TablePlus over Supabase connection string
```
