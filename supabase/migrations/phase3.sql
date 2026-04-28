-- ============================================================================
-- TradeWind · Phase 3 · auctions, messaging, reviews
-- ============================================================================
-- Idempotent. Safe to re-run. Apply after supabase/schema.sql.
--   psql "$SUPABASE_DB_URL" -f supabase/migrations/phase3.sql
-- ============================================================================


-- ── enums ────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.auction_status as enum ('upcoming', 'live', 'ended', 'cancelled');
exception when duplicate_object then null; end $$;


-- ── auctions ─────────────────────────────────────────────────────────────────
create table if not exists public.auctions (
  id                     uuid primary key default gen_random_uuid(),
  listing_id             uuid not null references public.listings(id) on delete cascade,
  start_time             timestamptz not null,
  end_time               timestamptz not null,
  starting_price_cents   bigint not null,
  reserve_price_cents    bigint,
  current_bid_cents      bigint,
  bid_count              integer not null default 0,
  winner_id              uuid references public.profiles(id) on delete set null,
  status                 public.auction_status not null default 'upcoming',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  check (end_time > start_time)
);

create index if not exists auctions_status_end_idx on public.auctions(status, end_time);
create index if not exists auctions_listing_idx    on public.auctions(listing_id);


-- ── bids ─────────────────────────────────────────────────────────────────────
create table if not exists public.bids (
  id           uuid primary key default gen_random_uuid(),
  auction_id   uuid not null references public.auctions(id) on delete cascade,
  bidder_id    uuid not null references public.profiles(id) on delete cascade,
  amount_cents bigint not null,
  is_winning   boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists bids_auction_amount_idx on public.bids(auction_id, amount_cents desc);
create index if not exists bids_bidder_idx          on public.bids(bidder_id, created_at desc);


-- ── trigger: bid insert → bump auctions.current_bid_cents + bid_count ───────
create or replace function public.bump_auction_on_bid()
returns trigger
language plpgsql
as $$
declare
  ends timestamptz;
  prev bigint;
begin
  select end_time, current_bid_cents into ends, prev
    from public.auctions where id = new.auction_id for update;

  if ends is null then return new; end if;
  if ends <= now() then
    raise exception 'auction has ended';
  end if;

  if prev is not null and new.amount_cents <= prev then
    raise exception 'bid must exceed current bid';
  end if;

  -- mark previous winning bids as no-longer-winning
  update public.bids set is_winning = false
    where auction_id = new.auction_id and is_winning = true;

  -- mark this bid as winning
  new.is_winning := true;

  update public.auctions
     set current_bid_cents = new.amount_cents,
         bid_count = bid_count + 1,
         status = case when status = 'upcoming' and start_time <= now() then 'live' else status end,
         updated_at = now()
   where id = new.auction_id;

  return new;
end;
$$;

drop trigger if exists trg_bump_auction_on_bid on public.bids;
create trigger trg_bump_auction_on_bid
  before insert on public.bids
  for each row execute function public.bump_auction_on_bid();

-- updated_at on auctions
drop trigger if exists trg_auctions_updated_at on public.auctions;
create trigger trg_auctions_updated_at
  before update on public.auctions
  for each row execute function public.set_updated_at();


-- ── conversations + messages (3B) ────────────────────────────────────────────
create table if not exists public.conversations (
  id              uuid primary key default gen_random_uuid(),
  listing_id      uuid references public.listings(id) on delete set null,
  participants    uuid[] not null,
  last_message_at timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists conversations_participants_idx on public.conversations using gin (participants);
create index if not exists conversations_last_msg_idx     on public.conversations (last_message_at desc);

create table if not exists public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  sender_id        uuid not null references public.profiles(id) on delete cascade,
  body             text not null,
  read_at          timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists messages_conv_created_idx on public.messages(conversation_id, created_at);
create index if not exists messages_sender_idx       on public.messages(sender_id, created_at desc);

-- bump conversations.last_message_at on each message
create or replace function public.bump_conversation_on_message()
returns trigger
language plpgsql
as $$
begin
  update public.conversations
     set last_message_at = new.created_at
   where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists trg_bump_conversation_on_message on public.messages;
create trigger trg_bump_conversation_on_message
  after insert on public.messages
  for each row execute function public.bump_conversation_on_message();


-- ── reviews (3C) ─────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id                    uuid primary key default gen_random_uuid(),
  reviewer_id           uuid not null references public.profiles(id) on delete cascade,
  dealer_id             uuid references public.dealers(id) on delete cascade,
  service_provider_id   uuid references public.service_providers(id) on delete cascade,
  listing_id            uuid references public.listings(id) on delete set null,
  rating                integer not null check (rating between 1 and 5),
  title                 text,
  body                  text,
  is_verified_purchase  boolean not null default false,
  is_published          boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  check (dealer_id is not null or service_provider_id is not null)
);

create index if not exists reviews_dealer_idx
  on public.reviews(dealer_id, created_at desc) where dealer_id is not null;
create index if not exists reviews_sp_idx
  on public.reviews(service_provider_id, created_at desc) where service_provider_id is not null;
create index if not exists reviews_reviewer_idx
  on public.reviews(reviewer_id, created_at desc);

-- updated_at trigger
drop trigger if exists trg_reviews_updated_at on public.reviews;
create trigger trg_reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- recalc rating aggregates
create or replace function public.recalc_review_aggregates()
returns trigger
language plpgsql
as $$
declare
  did uuid := coalesce(new.dealer_id, old.dealer_id);
  sid uuid := coalesce(new.service_provider_id, old.service_provider_id);
begin
  if did is not null then
    update public.dealers
       set rating_count = coalesce((select count(*) from public.reviews where dealer_id = did and is_published), 0),
           rating_avg   = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where dealer_id = did and is_published), 0)
     where id = did;
  end if;
  if sid is not null then
    update public.service_providers
       set rating_count = coalesce((select count(*) from public.reviews where service_provider_id = sid and is_published), 0),
           rating_avg   = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where service_provider_id = sid and is_published), 0)
     where id = sid;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_reviews_recalc on public.reviews;
create trigger trg_reviews_recalc
  after insert or update or delete on public.reviews
  for each row execute function public.recalc_review_aggregates();


-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.auctions      enable row level security;
alter table public.bids          enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;
alter table public.reviews       enable row level security;

-- auctions: public read for upcoming/live/ended; admin everything; seller can
-- create/update/cancel auctions on their own listings.
drop policy if exists auctions_public_read on public.auctions;
create policy auctions_public_read on public.auctions
  for select using (status in ('upcoming','live','ended') or public.is_admin());

drop policy if exists auctions_owner_write on public.auctions;
create policy auctions_owner_write on public.auctions
  for all using (
    public.is_admin()
    or exists (
      select 1 from public.listings l
       where l.id = auctions.listing_id
         and (l.seller_id = auth.uid()
              or (l.dealer_id is not null and l.dealer_id = public.user_dealer_id()))
    )
  ) with check (
    public.is_admin()
    or exists (
      select 1 from public.listings l
       where l.id = auctions.listing_id
         and (l.seller_id = auth.uid()
              or (l.dealer_id is not null and l.dealer_id = public.user_dealer_id()))
    )
  );

-- bids: anyone authenticated can insert (their own); read only own + admin
drop policy if exists bids_insert_authed on public.bids;
create policy bids_insert_authed on public.bids
  for insert to authenticated with check (bidder_id = auth.uid());

drop policy if exists bids_select_own_or_admin on public.bids;
create policy bids_select_own_or_admin on public.bids
  for select using (
    bidder_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.auctions a
       join public.listings l on l.id = a.listing_id
      where a.id = bids.auction_id
        and (l.seller_id = auth.uid()
             or (l.dealer_id is not null and l.dealer_id = public.user_dealer_id()))
    )
  );

-- conversations: select / write where caller is a participant
drop policy if exists conversations_select_party on public.conversations;
create policy conversations_select_party on public.conversations
  for select using (auth.uid() = any(participants) or public.is_admin());

drop policy if exists conversations_insert_party on public.conversations;
create policy conversations_insert_party on public.conversations
  for insert to authenticated with check (auth.uid() = any(participants));

drop policy if exists conversations_update_party on public.conversations;
create policy conversations_update_party on public.conversations
  for update using (auth.uid() = any(participants) or public.is_admin())
            with check (auth.uid() = any(participants) or public.is_admin());

-- messages: select where caller is a participant of the conversation
drop policy if exists messages_select_party on public.messages;
create policy messages_select_party on public.messages
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.conversations c
       where c.id = messages.conversation_id
         and auth.uid() = any(c.participants)
    )
  );

drop policy if exists messages_insert_party on public.messages;
create policy messages_insert_party on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
       where c.id = messages.conversation_id
         and auth.uid() = any(c.participants)
    )
  );

drop policy if exists messages_update_own on public.messages;
create policy messages_update_own on public.messages
  for update using (sender_id = auth.uid() or public.is_admin())
            with check (sender_id = auth.uid() or public.is_admin());

-- reviews: public read where published; insert by authed (themselves);
-- update/delete own or admin
drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read on public.reviews
  for select using (is_published or public.is_admin() or reviewer_id = auth.uid());

drop policy if exists reviews_insert_own on public.reviews;
create policy reviews_insert_own on public.reviews
  for insert to authenticated with check (reviewer_id = auth.uid());

drop policy if exists reviews_update_own_or_admin on public.reviews;
create policy reviews_update_own_or_admin on public.reviews
  for update using (reviewer_id = auth.uid() or public.is_admin())
            with check (reviewer_id = auth.uid() or public.is_admin());

drop policy if exists reviews_delete_own_or_admin on public.reviews;
create policy reviews_delete_own_or_admin on public.reviews
  for delete using (reviewer_id = auth.uid() or public.is_admin());


-- ── realtime publication ─────────────────────────────────────────────────────
-- Add messages, conversations, bids, auctions to the supabase_realtime
-- publication so the client can subscribe to live changes.
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.conversations;
exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.bids;
exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.auctions;
exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null; when undefined_object then null; end $$;


-- ============================================================================
-- END Phase 3 schema
-- ============================================================================
