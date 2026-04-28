-- ============================================================================
-- TradeWind · Migration · is_demo flag for listings
-- ============================================================================
-- Adds an explicit boolean to mark seed/demo inventory so we can hide or purge
-- it ahead of public launch. Backfills any existing rows that look like seed
-- data (condition='demo' or '[DEMO LISTING]' tag in description).
-- Idempotent: safe to re-run.
-- ============================================================================

alter table public.listings
  add column if not exists is_demo boolean not null default false;

create index if not exists idx_listings_is_demo
  on public.listings (is_demo)
  where is_demo = true;

update public.listings
   set is_demo = true
 where is_demo = false
   and (condition = 'demo' or description like '%[DEMO LISTING]%');
