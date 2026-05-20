-- ============================================================================
-- TradeWind · Aviation vertical (full expansion)
-- ============================================================================
-- Expands the aircraft vertical with additional categories (very light jet,
-- experimental, LSA, amphibious, parts, services), a comprehensive
-- aircraft_specs schema, and aviation service-provider categories.
--
-- Idempotent: safe to re-run.
-- ============================================================================

-- ── 1. Extend listing_category enum with new aviation categories ─────────────
do $$ begin alter type public.listing_category add value if not exists 'aircraft_very_light_jet';
exception when duplicate_object then null; end $$;
do $$ begin alter type public.listing_category add value if not exists 'aircraft_experimental';
exception when duplicate_object then null; end $$;
do $$ begin alter type public.listing_category add value if not exists 'aircraft_amphibious';
exception when duplicate_object then null; end $$;
do $$ begin alter type public.listing_category add value if not exists 'aircraft_lsa';
exception when duplicate_object then null; end $$;
do $$ begin alter type public.listing_category add value if not exists 'aircraft_parts';
exception when duplicate_object then null; end $$;
do $$ begin alter type public.listing_category add value if not exists 'aviation_services';
exception when duplicate_object then null; end $$;

-- ── 2. Extend service_category enum with aviation roles ──────────────────────
do $$ begin alter type public.service_category add value if not exists 'ap_mechanic';
exception when duplicate_object then null; end $$;
do $$ begin alter type public.service_category add value if not exists 'ia_inspector';
exception when duplicate_object then null; end $$;
do $$ begin alter type public.service_category add value if not exists 'aviation_maintenance_shop';
exception when duplicate_object then null; end $$;
do $$ begin alter type public.service_category add value if not exists 'aircraft_broker';
exception when duplicate_object then null; end $$;
do $$ begin alter type public.service_category add value if not exists 'aircraft_lender';
exception when duplicate_object then null; end $$;
do $$ begin alter type public.service_category add value if not exists 'aviation_insurance';
exception when duplicate_object then null; end $$;
do $$ begin alter type public.service_category add value if not exists 'aircraft_title_company';
exception when duplicate_object then null; end $$;
do $$ begin alter type public.service_category add value if not exists 'aircraft_escrow';
exception when duplicate_object then null; end $$;
do $$ begin alter type public.service_category add value if not exists 'ferry_pilot';
exception when duplicate_object then null; end $$;
do $$ begin alter type public.service_category add value if not exists 'avionics_shop';
exception when duplicate_object then null; end $$;
do $$ begin alter type public.service_category add value if not exists 'hangar_storage';
exception when duplicate_object then null; end $$;

-- ── 3. Expand aircraft_specs columns (additive only, never drop) ─────────────
alter table public.aircraft_specs
  add column if not exists registration_number text,
  add column if not exists total_time numeric,
  add column if not exists landings integer,
  add column if not exists engine_make text,
  add column if not exists engine_model text,
  add column if not exists engine_count integer,
  add column if not exists smoh numeric,
  add column if not exists snew numeric,
  add column if not exists tbo numeric,
  add column if not exists airworthiness_certificate_status text,
  add column if not exists adsb boolean,
  add column if not exists ad_sb_compliance text,
  add column if not exists pre_buy_inspection_status text,
  add column if not exists ferry_ready boolean default false,
  add column if not exists hangar_status text,
  add column if not exists updated_at timestamptz not null default now();

-- Backfill the newer columns from the existing legacy columns so the panel
-- still works for older rows. Safe to re-run.
update public.aircraft_specs
   set total_time = coalesce(total_time, total_time_hours),
       smoh       = coalesce(smoh,       smoh_hours),
       tbo        = coalesce(tbo,        tbo_hours),
       registration_number =
         coalesce(registration_number, n_number),
       airworthiness_certificate_status =
         coalesce(airworthiness_certificate_status, airworthiness_status),
       adsb = coalesce(adsb, ads_b)
 where total_time is null
    or smoh is null
    or tbo is null
    or registration_number is null
    or airworthiness_certificate_status is null
    or adsb is null;

-- updated_at trigger
create or replace function public.aircraft_specs_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists aircraft_specs_updated_at on public.aircraft_specs;
create trigger aircraft_specs_updated_at
  before update on public.aircraft_specs
  for each row execute function public.aircraft_specs_set_updated_at();

-- ── 4. Refined RLS policies ──────────────────────────────────────────────────
-- Public can read when the parent listing is active (or always, for the
-- previously-permissive "Public read" policy we keep around for backward
-- compatibility). Owners & dealers can write rows for listings they own.

drop policy if exists "Public read" on public.aircraft_specs;
create policy "Public read" on public.aircraft_specs
  for select using (
    exists (
      select 1 from public.listings l
       where l.id = aircraft_specs.listing_id
         and (l.status in ('active','sold')
              or l.seller_id = auth.uid())
    )
  );

drop policy if exists "Owner create/update" on public.aircraft_specs;
create policy "Owner manage" on public.aircraft_specs
  for all using (
    exists (
      select 1 from public.listings l
       where l.id = aircraft_specs.listing_id
         and (l.seller_id = auth.uid()
              or (l.dealer_id is not null and l.dealer_id in (
                    select dealer_id from public.profiles where id = auth.uid()
              )))
    )
  ) with check (
    exists (
      select 1 from public.listings l
       where l.id = aircraft_specs.listing_id
         and (l.seller_id = auth.uid()
              or (l.dealer_id is not null and l.dealer_id in (
                    select dealer_id from public.profiles where id = auth.uid()
              )))
    )
  );

drop policy if exists "Admin manage" on public.aircraft_specs;
create policy "Admin manage" on public.aircraft_specs
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── 5. Aviation pre-buy inspection requests ──────────────────────────────────
create table if not exists public.aircraft_prebuy_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid references public.profiles(id) on delete set null,
  assigned_provider_id uuid references public.service_providers(id) on delete set null,
  inspection_type text not null default 'pre_buy',
  scope_logbook boolean not null default true,
  scope_airframe boolean not null default true,
  scope_engine boolean not null default true,
  scope_avionics boolean not null default true,
  scope_corrosion boolean not null default true,
  scope_ad_sb boolean not null default true,
  status text not null default 'submitted',
  notes text,
  report_url text,
  report_uploaded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.aircraft_prebuy_requests enable row level security;

drop policy if exists "Buyer or admin read" on public.aircraft_prebuy_requests;
create policy "Buyer or admin read" on public.aircraft_prebuy_requests
  for select using (
    buyer_id = auth.uid()
    or exists (select 1 from public.profiles
               where id = auth.uid() and role = 'admin')
    or exists (select 1 from public.listings l
               where l.id = aircraft_prebuy_requests.listing_id
                 and l.seller_id = auth.uid())
  );

drop policy if exists "Buyer insert" on public.aircraft_prebuy_requests;
create policy "Buyer insert" on public.aircraft_prebuy_requests
  for insert with check (buyer_id = auth.uid());

drop policy if exists "Buyer or admin update" on public.aircraft_prebuy_requests;
create policy "Buyer or admin update" on public.aircraft_prebuy_requests
  for update using (
    buyer_id = auth.uid()
    or exists (select 1 from public.profiles
               where id = auth.uid() and role = 'admin')
  );

create index if not exists aircraft_prebuy_listing_idx
  on public.aircraft_prebuy_requests(listing_id);
create index if not exists aircraft_prebuy_buyer_idx
  on public.aircraft_prebuy_requests(buyer_id);
