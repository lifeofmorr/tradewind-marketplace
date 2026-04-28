-- TradeWind Priority 2: offer drafts table.
-- Buyers can build a non-binding offer on a listing and save it for later.

create table if not exists public.offer_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  offer_price_cents bigint,
  financing_status text,
  inspection_contingency boolean default true,
  transport_needed boolean default false,
  timeline text,
  note text,
  generated_message text,
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists offer_drafts_user_idx
  on public.offer_drafts(user_id, created_at desc);

create index if not exists offer_drafts_listing_idx
  on public.offer_drafts(listing_id, created_at desc);

alter table public.offer_drafts enable row level security;

drop policy if exists "own offer drafts" on public.offer_drafts;
create policy "own offer drafts"
  on public.offer_drafts
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Admin read access for support
drop policy if exists "admin read offer drafts" on public.offer_drafts;
create policy "admin read offer drafts"
  on public.offer_drafts
  for select
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));
