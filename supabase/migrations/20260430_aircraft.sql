-- ============================================================================
-- TradeWind · Aircraft vertical
-- ============================================================================
-- Adds aircraft categories to the listing_category enum and a dedicated
-- aircraft_specs table for aviation-specific fields (N-number, total time,
-- engine hours, TBO, avionics, ADS-B, airworthiness status, etc.).
--
-- Apply with:
--   psql "$SUPABASE_DB_URL" -f supabase/migrations/20260430_aircraft.sql
--
-- Idempotent: safe to re-run.
-- ============================================================================

-- ── 1. Extend listing_category enum ─────────────────────────────────────────
-- ALTER TYPE ... ADD VALUE IF NOT EXISTS works on Postgres 12+. Each ADD
-- VALUE runs in its own transaction-implicit context.
do $$ begin
  alter type public.listing_category add value if not exists 'aircraft_single_engine';
exception when duplicate_object then null; end $$;

do $$ begin
  alter type public.listing_category add value if not exists 'aircraft_twin_engine';
exception when duplicate_object then null; end $$;

do $$ begin
  alter type public.listing_category add value if not exists 'aircraft_turboprop';
exception when duplicate_object then null; end $$;

do $$ begin
  alter type public.listing_category add value if not exists 'aircraft_jet';
exception when duplicate_object then null; end $$;

do $$ begin
  alter type public.listing_category add value if not exists 'aircraft_helicopter';
exception when duplicate_object then null; end $$;

do $$ begin
  alter type public.listing_category add value if not exists 'aircraft_vintage';
exception when duplicate_object then null; end $$;

-- ── 2. aircraft_specs ───────────────────────────────────────────────────────
create table if not exists public.aircraft_specs (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade unique,
  n_number text,
  serial_number text,
  total_time_hours numeric,
  airframe_hours numeric,
  engine_hours numeric,
  smoh_hours numeric,
  snew boolean default false,
  tbo_hours numeric,
  propeller_hours numeric,
  logbooks_complete boolean default false,
  annual_inspection_date date,
  airworthiness_status text check (airworthiness_status in
    ('standard','experimental','special','restricted','provisional','pending')),
  avionics_suite text,
  ads_b boolean default false,
  autopilot text,
  seats int,
  range_nm numeric,
  cruise_speed_ktas numeric,
  useful_load_lbs numeric,
  damage_history text,
  hangared boolean default false,
  created_at timestamptz not null default now()
);

alter table public.aircraft_specs enable row level security;

drop policy if exists "Public read" on public.aircraft_specs;
create policy "Public read" on public.aircraft_specs
  for select using (true);

drop policy if exists "Owner create/update" on public.aircraft_specs;
create policy "Owner create/update" on public.aircraft_specs
  for all using (
    exists (
      select 1 from public.listings
      where id = listing_id and seller_id = auth.uid()
    )
  );

drop policy if exists "Admin manage" on public.aircraft_specs;
create policy "Admin manage" on public.aircraft_specs
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create index if not exists aircraft_specs_listing_idx
  on public.aircraft_specs(listing_id);
