-- ============================================================================
-- TradeWind · Phase 1A · Database schema
-- ============================================================================
-- The AI-powered marketplace for boats, autos, dealers, and serious buyers.
--
-- Apply with:
--   psql "$SUPABASE_DB_URL" -f supabase/schema.sql
--   --or--
--   supabase db push --include-all
--
-- Idempotent: safe to re-run. Drops + recreates triggers/policies, creates
-- tables/enums only if absent.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";


-- ----------------------------------------------------------------------------
-- 2. ENUMS  (16)
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum
    ('buyer', 'seller', 'dealer', 'dealer_staff', 'service_provider', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.dealer_staff_role as enum
    ('owner', 'manager', 'sales', 'finance', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.listing_category as enum
    ('boat', 'performance_boat', 'yacht', 'center_console',
     'car', 'truck', 'exotic', 'classic', 'powersports', 'rv');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.listing_status as enum
    ('draft', 'pending_review', 'active', 'sold', 'expired', 'rejected', 'removed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.seller_type as enum ('private', 'dealer', 'broker');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.lead_status as enum
    ('new', 'contacted', 'qualified', 'offer', 'closed_won', 'closed_lost', 'spam');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.subscription_tier as enum
    ('starter', 'pro', 'premier', 'service_pro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.subscription_status as enum
    ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum
    ('pending', 'succeeded', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.service_category as enum
    ('marine_mechanic', 'auto_mechanic', 'detailer', 'transport',
     'inspector_surveyor', 'insurance_agent', 'lender', 'storage',
     'marina', 'wrap_shop', 'audio_shop', 'performance_shop', 'dock_service');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.request_status as enum
    ('submitted', 'assigned', 'in_progress', 'quoted', 'completed', 'canceled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.fraud_severity as enum
    ('low', 'medium', 'high', 'critical');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ai_workflow as enum
    ('listing_generator', 'buyer_assistant', 'fraud_check',
     'pricing_estimate', 'concierge_intake');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.notification_kind as enum
    ('lead', 'listing_status', 'payment', 'subscription',
     'concierge', 'service_request', 'system');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.featured_package as enum
    ('featured_30d', 'featured_90d', 'boost_7d', 'boost_30d');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.credit_band as enum
    ('excellent', 'good', 'fair', 'poor', 'thin_file');
exception when duplicate_object then null; end $$;


-- ----------------------------------------------------------------------------
-- 3. UTILITY FUNCTIONS  (created early; tables and triggers reference these)
-- ----------------------------------------------------------------------------

-- generic updated_at touch
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


-- ----------------------------------------------------------------------------
-- 4. TABLE: profiles
-- ----------------------------------------------------------------------------
-- profiles.dealer_id and .service_provider_id FKs are added later (after the
-- target tables exist) to break the create-order cycle.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text not null unique,
  full_name             text,
  phone                 text,
  avatar_url            text,
  role                  public.user_role not null default 'buyer',
  city                  text,
  state                 text,
  zip                   text,
  dealer_id             uuid,
  service_provider_id   uuid,
  marketing_opt_in      boolean not null default false,
  banned                boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 5. TABLE: dealers
-- ----------------------------------------------------------------------------
create table if not exists public.dealers (
  id                       uuid primary key default gen_random_uuid(),
  slug                     text not null unique,
  name                     text not null,
  description              text,
  logo_url                 text,
  hero_image_url           text,
  website                  text,
  phone                    text,
  email                    text,
  address_line1            text,
  address_line2            text,
  city                     text,
  state                    text,
  zip                      text,
  lat                      double precision,
  lng                      double precision,
  primary_category         public.listing_category,
  rating_avg               numeric(3,2) not null default 0,
  rating_count             integer not null default 0,
  is_verified              boolean not null default false,
  is_featured              boolean not null default false,
  subscription_tier        public.subscription_tier,
  subscription_status      public.subscription_status,
  stripe_customer_id       text,
  stripe_subscription_id   text,
  owner_id                 uuid not null references public.profiles(id) on delete restrict,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 6. TABLE: dealer_staff
-- ----------------------------------------------------------------------------
create table if not exists public.dealer_staff (
  id           uuid primary key default gen_random_uuid(),
  dealer_id    uuid not null references public.dealers(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  role         public.dealer_staff_role not null default 'owner',
  invited_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (dealer_id, user_id)
);


-- ----------------------------------------------------------------------------
-- 7. TABLE: service_providers
-- ----------------------------------------------------------------------------
create table if not exists public.service_providers (
  id                       uuid primary key default gen_random_uuid(),
  slug                     text not null unique,
  name                     text not null,
  category                 public.service_category not null,
  description              text,
  logo_url                 text,
  hero_image_url           text,
  website                  text,
  phone                    text,
  email                    text,
  address_line1            text,
  city                     text,
  state                    text,
  zip                      text,
  lat                      double precision,
  lng                      double precision,
  service_radius_mi        integer,
  rating_avg               numeric(3,2) not null default 0,
  rating_count             integer not null default 0,
  is_verified              boolean not null default false,
  is_featured              boolean not null default false,
  subscription_tier        public.subscription_tier,
  subscription_status      public.subscription_status,
  stripe_customer_id       text,
  stripe_subscription_id   text,
  owner_id                 uuid not null references public.profiles(id) on delete restrict,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);


-- close the cycle: profiles → dealers / service_providers
do $$ begin
  alter table public.profiles
    add constraint profiles_dealer_id_fkey
    foreign key (dealer_id) references public.dealers(id) on delete set null;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.profiles
    add constraint profiles_service_provider_id_fkey
    foreign key (service_provider_id) references public.service_providers(id) on delete set null;
exception when duplicate_object then null; end $$;


-- ----------------------------------------------------------------------------
-- 8. AUTH-AWARE HELPERS
-- ----------------------------------------------------------------------------
-- All run as SECURITY DEFINER so they bypass RLS on profiles when invoked
-- from policies on other tables (no recursion).
-- ----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and banned = false
  );
$$;

create or replace function public.user_dealer_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select dealer_id from public.profiles where id = auth.uid();
$$;

create or replace function public.user_service_provider_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select service_provider_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_dealer_member(_dealer_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.dealer_staff
    where dealer_id = _dealer_id and user_id = auth.uid()
  );
$$;


-- ----------------------------------------------------------------------------
-- 9. TABLE: listings
-- ----------------------------------------------------------------------------
create table if not exists public.listings (
  id                     uuid primary key default gen_random_uuid(),
  slug                   text not null unique,
  category               public.listing_category not null,
  title                  text not null,
  description            text,
  ai_summary             text,

  -- product
  make                   text,
  model                  text,
  trim_or_grade          text,
  year                   integer,
  price_cents            bigint,
  currency               text not null default 'USD',
  condition              text,
  vin_or_hin             text,

  -- auto-only
  mileage                integer,
  fuel_type              text,
  transmission           text,
  drivetrain             text,
  body_style             text,
  exterior_color         text,
  interior_color         text,

  -- boat-only
  hours                  integer,
  length_ft              numeric(6,2),
  beam_ft                numeric(6,2),
  hull_material          text,
  hull_type              text,
  engine_count           integer,
  engine_make            text,
  engine_model           text,
  engine_hp              integer,
  fuel_capacity_gal      numeric(8,2),

  -- location
  city                   text,
  state                  text,
  zip                    text,
  lat                    double precision,
  lng                    double precision,

  -- ownership
  seller_type            public.seller_type not null default 'private',
  seller_id              uuid not null references public.profiles(id) on delete cascade,
  dealer_id              uuid references public.dealers(id) on delete set null,

  -- status & moderation
  status                 public.listing_status not null default 'draft',
  rejection_reason       text,
  reviewed_by            uuid references public.profiles(id) on delete set null,
  reviewed_at            timestamptz,

  -- trust
  is_verified            boolean not null default false,
  verified_at            timestamptz,
  trust_score            integer,
  vin_hin_decoded        boolean not null default false,
  title_status           text,

  -- partner / marketing flags
  is_featured            boolean not null default false,
  is_premium             boolean not null default false,
  featured_until         timestamptz,
  boost_until            timestamptz,
  is_finance_partner     boolean not null default false,
  is_insurance_partner   boolean not null default false,
  is_transport_partner   boolean not null default false,

  -- counters
  view_count             integer not null default 0,
  inquiry_count          integer not null default 0,
  save_count             integer not null default 0,
  cover_photo_url        text,

  -- lifecycle
  published_at           timestamptz,
  expires_at             timestamptz,
  sold_at                timestamptz,
  removed_at             timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 10. TABLE: listing_photos
-- ----------------------------------------------------------------------------
create table if not exists public.listing_photos (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid not null references public.listings(id) on delete cascade,
  storage_path  text not null,
  url           text,
  alt_text      text,
  position      integer not null default 0,
  is_cover      boolean not null default false,
  created_at    timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 11. TABLE: listing_videos
-- ----------------------------------------------------------------------------
create table if not exists public.listing_videos (
  id              uuid primary key default gen_random_uuid(),
  listing_id      uuid not null references public.listings(id) on delete cascade,
  url             text,
  storage_path    text,
  thumbnail_url   text,
  duration_sec    integer,
  position        integer not null default 0,
  created_at      timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 12. TABLE: saved_listings
-- ----------------------------------------------------------------------------
create table if not exists public.saved_listings (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  listing_id  uuid not null references public.listings(id) on delete cascade,
  notes       text,
  created_at  timestamptz not null default now(),
  primary key (user_id, listing_id)
);


-- ----------------------------------------------------------------------------
-- 13. TABLE: inquiries
-- ----------------------------------------------------------------------------
create table if not exists public.inquiries (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid not null references public.listings(id) on delete cascade,
  buyer_id      uuid references public.profiles(id) on delete set null,
  buyer_name    text not null,
  buyer_email   text not null,
  buyer_phone   text,
  message       text not null,
  seller_id     uuid not null references public.profiles(id) on delete cascade,
  dealer_id     uuid references public.dealers(id) on delete set null,
  lead_score    integer,
  status        public.lead_status not null default 'new',
  is_spam       boolean not null default false,
  source        text not null default 'listing_form',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 14. TABLE: financing_requests
-- ----------------------------------------------------------------------------
create table if not exists public.financing_requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles(id) on delete set null,
  listing_id      uuid references public.listings(id) on delete set null,
  full_name       text not null,
  email           text not null,
  phone           text,
  amount_cents    bigint not null,
  term_months     integer,
  credit_band     public.credit_band,
  state           text,
  notes           text,
  partner_id      uuid references public.service_providers(id) on delete set null,
  admin_notes     text,
  status          public.request_status not null default 'submitted',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 15. TABLE: insurance_requests
-- ----------------------------------------------------------------------------
create table if not exists public.insurance_requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles(id) on delete set null,
  listing_id      uuid references public.listings(id) on delete set null,
  full_name       text not null,
  email           text not null,
  phone           text,
  asset_value_cents bigint,
  asset_summary   text,
  state           text,
  notes           text,
  partner_id      uuid references public.service_providers(id) on delete set null,
  admin_notes     text,
  status          public.request_status not null default 'submitted',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 16. TABLE: inspection_requests
-- ----------------------------------------------------------------------------
create table if not exists public.inspection_requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles(id) on delete set null,
  listing_id      uuid references public.listings(id) on delete set null,
  full_name       text not null,
  email           text not null,
  phone           text,
  location        text,
  city            text,
  state           text,
  zip             text,
  preferred_date  date,
  notes           text,
  partner_id      uuid references public.service_providers(id) on delete set null,
  admin_notes     text,
  status          public.request_status not null default 'submitted',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 17. TABLE: transport_requests
-- ----------------------------------------------------------------------------
create table if not exists public.transport_requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles(id) on delete set null,
  listing_id      uuid references public.listings(id) on delete set null,
  full_name       text not null,
  email           text not null,
  phone           text,
  pickup_zip      text,
  dropoff_zip     text,
  asset_length_ft numeric(6,2),
  asset_summary   text,
  preferred_date  date,
  notes           text,
  partner_id      uuid references public.service_providers(id) on delete set null,
  admin_notes     text,
  status          public.request_status not null default 'submitted',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 18. TABLE: concierge_requests
-- ----------------------------------------------------------------------------
create table if not exists public.concierge_requests (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references public.profiles(id) on delete set null,
  full_name           text not null,
  email               text not null,
  phone               text,
  budget_min_cents    bigint,
  budget_max_cents    bigint,
  category            public.listing_category,
  desired_summary     text,
  timeline            text,
  ai_intake_json      jsonb,
  assigned_to         uuid references public.profiles(id) on delete set null,
  paid                boolean not null default false,
  paid_at             timestamptz,
  admin_notes         text,
  status              public.request_status not null default 'submitted',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 19. TABLE: service_requests
-- ----------------------------------------------------------------------------
create table if not exists public.service_requests (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references public.profiles(id) on delete set null,
  service_provider_id   uuid references public.service_providers(id) on delete set null,
  full_name             text not null,
  email                 text not null,
  phone                 text,
  asset_summary         text,
  service_needed        text not null,
  location              text,
  preferred_date        date,
  notes                 text,
  admin_notes           text,
  status                public.request_status not null default 'submitted',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 20. TABLE: subscriptions
-- ----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  dealer_id                uuid references public.dealers(id) on delete cascade,
  service_provider_id      uuid references public.service_providers(id) on delete cascade,
  tier                     public.subscription_tier not null,
  status                   public.subscription_status not null default 'incomplete',
  stripe_customer_id       text,
  stripe_subscription_id   text unique,
  stripe_price_id          text,
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  cancel_at_period_end     boolean not null default false,
  canceled_at              timestamptz,
  trial_end                timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  check (dealer_id is not null or service_provider_id is not null)
);


-- ----------------------------------------------------------------------------
-- 21. TABLE: payments
-- ----------------------------------------------------------------------------
create table if not exists public.payments (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid references public.profiles(id) on delete set null,
  dealer_id                   uuid references public.dealers(id) on delete set null,
  service_provider_id         uuid references public.service_providers(id) on delete set null,
  listing_id                  uuid references public.listings(id) on delete set null,
  description                 text,
  amount_cents                bigint not null,
  currency                    text not null default 'USD',
  status                      public.payment_status not null default 'pending',
  stripe_payment_intent_id    text unique,
  stripe_session_id           text,
  metadata                    jsonb not null default '{}'::jsonb,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 22. TABLE: featured_listings
-- ----------------------------------------------------------------------------
create table if not exists public.featured_listings (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid not null references public.listings(id) on delete cascade,
  payment_id   uuid references public.payments(id) on delete set null,
  package      public.featured_package not null,
  starts_at    timestamptz not null default now(),
  ends_at      timestamptz not null,
  created_at   timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 23. TABLE: fraud_flags
-- ----------------------------------------------------------------------------
create table if not exists public.fraud_flags (
  id              uuid primary key default gen_random_uuid(),
  listing_id      uuid references public.listings(id) on delete cascade,
  user_id         uuid references public.profiles(id) on delete cascade,
  inquiry_id      uuid references public.inquiries(id) on delete cascade,
  severity        public.fraud_severity not null default 'low',
  reason          text not null,
  reporter_id     uuid references public.profiles(id) on delete set null,
  resolved        boolean not null default false,
  resolved_by     uuid references public.profiles(id) on delete set null,
  resolved_at     timestamptz,
  resolution      text,
  created_at      timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 24. TABLE: ai_logs
-- ----------------------------------------------------------------------------
create table if not exists public.ai_logs (
  id            uuid primary key default gen_random_uuid(),
  workflow      public.ai_workflow not null,
  user_id       uuid references public.profiles(id) on delete set null,
  listing_id    uuid references public.listings(id) on delete set null,
  prompt        jsonb not null,
  response      jsonb,
  tokens_in     integer,
  tokens_out    integer,
  cost_cents    integer,
  model         text,
  created_at    timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 25. TABLE: notifications
-- ----------------------------------------------------------------------------
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  kind        public.notification_kind not null,
  title       text not null,
  body        text,
  link        text,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 26. TABLE: blog_posts
-- ----------------------------------------------------------------------------
create table if not exists public.blog_posts (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,
  excerpt           text,
  body_md           text not null,
  cover_image_url   text,
  author_id         uuid references public.profiles(id) on delete set null,
  tags              text[] not null default '{}',
  category          text,
  is_published      boolean not null default false,
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 27. TABLE: market_reports
-- ----------------------------------------------------------------------------
create table if not exists public.market_reports (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,
  summary           text,
  body_md           text not null,
  cover_image_url   text,
  category          public.listing_category,
  region            text,
  is_published      boolean not null default false,
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 28. INDEXES
-- ----------------------------------------------------------------------------

-- listings
create index if not exists listings_status_idx          on public.listings(status);
create index if not exists listings_category_status_idx on public.listings(category, status);
create index if not exists listings_seller_id_idx       on public.listings(seller_id);
create index if not exists listings_dealer_id_idx       on public.listings(dealer_id);
create index if not exists listings_price_idx           on public.listings(price_cents);
create index if not exists listings_year_idx            on public.listings(year);
create index if not exists listings_state_idx           on public.listings(state);
create index if not exists listings_featured_idx        on public.listings(is_featured) where is_featured;
create index if not exists listings_created_at_idx      on public.listings(created_at desc);
create index if not exists listings_search_gin          on public.listings using gin (
  to_tsvector('english',
    coalesce(title, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(make, '') || ' ' ||
    coalesce(model, '') || ' ' ||
    coalesce(city, '')
  )
);

-- listing children
create index if not exists listing_photos_listing_id_idx on public.listing_photos(listing_id, position);
create index if not exists listing_videos_listing_id_idx on public.listing_videos(listing_id, position);

-- inquiries
create index if not exists inquiries_seller_status_idx     on public.inquiries(seller_id, status);
create index if not exists inquiries_dealer_status_idx     on public.inquiries(dealer_id, status);
create index if not exists inquiries_listing_created_idx   on public.inquiries(listing_id, created_at desc);

-- saves
create index if not exists saved_listings_user_idx  on public.saved_listings(user_id);

-- request inboxes
create index if not exists financing_status_idx    on public.financing_requests(status, created_at desc);
create index if not exists insurance_status_idx    on public.insurance_requests(status, created_at desc);
create index if not exists inspection_status_idx   on public.inspection_requests(status, created_at desc);
create index if not exists transport_status_idx    on public.transport_requests(status, created_at desc);
create index if not exists concierge_status_idx    on public.concierge_requests(status, created_at desc);
create index if not exists service_req_status_idx  on public.service_requests(status, created_at desc);

-- payments
create index if not exists payments_user_idx    on public.payments(user_id, created_at desc);
create index if not exists payments_dealer_idx  on public.payments(dealer_id, created_at desc);

-- providers + dealers
create index if not exists service_providers_slug_idx     on public.service_providers(slug);
create index if not exists service_providers_category_idx on public.service_providers(category);
create index if not exists service_providers_state_idx    on public.service_providers(state);
create index if not exists dealers_slug_idx               on public.dealers(slug);
create index if not exists dealers_state_idx              on public.dealers(state);

-- staff
create index if not exists dealer_staff_user_idx    on public.dealer_staff(user_id);
create index if not exists dealer_staff_dealer_idx  on public.dealer_staff(dealer_id);

-- editorial
create index if not exists blog_posts_published_idx     on public.blog_posts(is_published, published_at desc);
create index if not exists market_reports_published_idx on public.market_reports(is_published, published_at desc);

-- featured & subscriptions
create index if not exists featured_listings_listing_idx on public.featured_listings(listing_id);
create index if not exists featured_listings_window_idx  on public.featured_listings(starts_at, ends_at);
create index if not exists subscriptions_dealer_idx      on public.subscriptions(dealer_id);
create index if not exists subscriptions_provider_idx    on public.subscriptions(service_provider_id);

-- ops
create index if not exists fraud_flags_listing_idx  on public.fraud_flags(listing_id);
create index if not exists ai_logs_workflow_idx     on public.ai_logs(workflow, created_at desc);
create index if not exists notifications_user_idx   on public.notifications(user_id, created_at desc);


-- ----------------------------------------------------------------------------
-- 29. TRIGGER FUNCTIONS  (auth bridge + counters)
-- ----------------------------------------------------------------------------

-- bridges auth.users → public.profiles. raw_user_meta_data carries full_name
-- and (optional) role at signup. Default role is buyer.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text := nullif(new.raw_user_meta_data->>'role', '');
  resolved_role public.user_role;
begin
  begin
    resolved_role := coalesce(meta_role::public.user_role, 'buyer'::public.user_role);
  exception when others then
    resolved_role := 'buyer'::public.user_role;
  end;

  -- never allow a self-promoted admin via signup
  if resolved_role = 'admin' then
    resolved_role := 'buyer';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    resolved_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.inc_inquiry_count()
returns trigger
language plpgsql
as $$
begin
  update public.listings
     set inquiry_count = inquiry_count + 1,
         updated_at = now()
   where id = new.listing_id;
  return new;
end;
$$;

create or replace function public.inc_save_count()
returns trigger
language plpgsql
as $$
begin
  update public.listings
     set save_count = save_count + 1,
         updated_at = now()
   where id = new.listing_id;
  return new;
end;
$$;

create or replace function public.dec_save_count()
returns trigger
language plpgsql
as $$
begin
  update public.listings
     set save_count = greatest(save_count - 1, 0),
         updated_at = now()
   where id = old.listing_id;
  return old;
end;
$$;


-- ----------------------------------------------------------------------------
-- 30. TRIGGERS
-- ----------------------------------------------------------------------------

-- updated_at on every table that has an updated_at column
do $$
declare
  t text;
begin
  for t in
    select c.table_name
      from information_schema.columns c
     where c.table_schema = 'public'
       and c.column_name = 'updated_at'
  loop
    execute format(
      'drop trigger if exists trg_%1$s_updated_at on public.%1$I; ' ||
      'create trigger trg_%1$s_updated_at before update on public.%1$I ' ||
      'for each row execute function public.set_updated_at();',
      t
    );
  end loop;
end $$;

-- auth.users → profiles bridge
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- counters
drop trigger if exists trg_inquiries_inc on public.inquiries;
create trigger trg_inquiries_inc
  after insert on public.inquiries
  for each row execute function public.inc_inquiry_count();

drop trigger if exists trg_saves_inc on public.saved_listings;
create trigger trg_saves_inc
  after insert on public.saved_listings
  for each row execute function public.inc_save_count();

drop trigger if exists trg_saves_dec on public.saved_listings;
create trigger trg_saves_dec
  after delete on public.saved_listings
  for each row execute function public.dec_save_count();


-- ----------------------------------------------------------------------------
-- 31. ROW-LEVEL SECURITY  (enable on EVERY table)
-- ----------------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.dealers             enable row level security;
alter table public.dealer_staff        enable row level security;
alter table public.service_providers   enable row level security;
alter table public.listings            enable row level security;
alter table public.listing_photos      enable row level security;
alter table public.listing_videos      enable row level security;
alter table public.saved_listings      enable row level security;
alter table public.inquiries           enable row level security;
alter table public.financing_requests  enable row level security;
alter table public.insurance_requests  enable row level security;
alter table public.inspection_requests enable row level security;
alter table public.transport_requests  enable row level security;
alter table public.concierge_requests  enable row level security;
alter table public.service_requests    enable row level security;
alter table public.subscriptions       enable row level security;
alter table public.payments            enable row level security;
alter table public.featured_listings   enable row level security;
alter table public.fraud_flags         enable row level security;
alter table public.ai_logs             enable row level security;
alter table public.notifications       enable row level security;
alter table public.blog_posts          enable row level security;
alter table public.market_reports      enable row level security;


-- ─── profiles ────────────────────────────────────────────────────────────────
drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists profiles_update_own_or_admin on public.profiles;
create policy profiles_update_own_or_admin on public.profiles
  for update using (id = auth.uid() or public.is_admin())
            with check (id = auth.uid() or public.is_admin());


-- ─── dealers ─────────────────────────────────────────────────────────────────
drop policy if exists dealers_public_read on public.dealers;
create policy dealers_public_read on public.dealers
  for select using (true);

drop policy if exists dealers_insert_own on public.dealers;
create policy dealers_insert_own on public.dealers
  for insert with check (owner_id = auth.uid());

drop policy if exists dealers_update_owner_or_admin on public.dealers;
create policy dealers_update_owner_or_admin on public.dealers
  for update using (owner_id = auth.uid() or public.is_admin())
            with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists dealers_delete_admin on public.dealers;
create policy dealers_delete_admin on public.dealers
  for delete using (public.is_admin());


-- ─── dealer_staff ────────────────────────────────────────────────────────────
drop policy if exists dealer_staff_select on public.dealer_staff;
create policy dealer_staff_select on public.dealer_staff
  for select using (
    user_id = auth.uid()
    or public.is_dealer_member(dealer_id)
    or public.is_admin()
  );

drop policy if exists dealer_staff_manage on public.dealer_staff;
create policy dealer_staff_manage on public.dealer_staff
  for all using (
    public.is_admin()
    or exists (
      select 1 from public.dealers d
       where d.id = dealer_staff.dealer_id and d.owner_id = auth.uid()
    )
  ) with check (
    public.is_admin()
    or exists (
      select 1 from public.dealers d
       where d.id = dealer_staff.dealer_id and d.owner_id = auth.uid()
    )
  );


-- ─── service_providers ───────────────────────────────────────────────────────
drop policy if exists sp_public_read on public.service_providers;
create policy sp_public_read on public.service_providers
  for select using (true);

drop policy if exists sp_insert_own on public.service_providers;
create policy sp_insert_own on public.service_providers
  for insert with check (owner_id = auth.uid());

drop policy if exists sp_update_owner_or_admin on public.service_providers;
create policy sp_update_owner_or_admin on public.service_providers
  for update using (owner_id = auth.uid() or public.is_admin())
            with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists sp_delete_admin on public.service_providers;
create policy sp_delete_admin on public.service_providers
  for delete using (public.is_admin());


-- ─── listings ────────────────────────────────────────────────────────────────
drop policy if exists listings_public_or_own on public.listings;
create policy listings_public_or_own on public.listings
  for select using (
    status = 'active'
    or seller_id = auth.uid()
    or (dealer_id is not null and dealer_id = public.user_dealer_id())
    or public.is_admin()
  );

drop policy if exists listings_insert_own on public.listings;
create policy listings_insert_own on public.listings
  for insert with check (seller_id = auth.uid());

drop policy if exists listings_update_owner_or_admin on public.listings;
create policy listings_update_owner_or_admin on public.listings
  for update using (
    seller_id = auth.uid()
    or (dealer_id is not null and dealer_id = public.user_dealer_id())
    or public.is_admin()
  ) with check (
    seller_id = auth.uid()
    or (dealer_id is not null and dealer_id = public.user_dealer_id())
    or public.is_admin()
  );

drop policy if exists listings_delete_owner_or_admin on public.listings;
create policy listings_delete_owner_or_admin on public.listings
  for delete using (
    seller_id = auth.uid()
    or (dealer_id is not null and dealer_id = public.user_dealer_id())
    or public.is_admin()
  );


-- ─── listing_photos / listing_videos  (public read; manage by parent owner) ──
drop policy if exists photos_public_read on public.listing_photos;
create policy photos_public_read on public.listing_photos
  for select using (true);

drop policy if exists photos_manage on public.listing_photos;
create policy photos_manage on public.listing_photos
  for all using (
    public.is_admin()
    or exists (
      select 1 from public.listings l
       where l.id = listing_photos.listing_id
         and (l.seller_id = auth.uid()
              or (l.dealer_id is not null and l.dealer_id = public.user_dealer_id()))
    )
  ) with check (
    public.is_admin()
    or exists (
      select 1 from public.listings l
       where l.id = listing_photos.listing_id
         and (l.seller_id = auth.uid()
              or (l.dealer_id is not null and l.dealer_id = public.user_dealer_id()))
    )
  );

drop policy if exists videos_public_read on public.listing_videos;
create policy videos_public_read on public.listing_videos
  for select using (true);

drop policy if exists videos_manage on public.listing_videos;
create policy videos_manage on public.listing_videos
  for all using (
    public.is_admin()
    or exists (
      select 1 from public.listings l
       where l.id = listing_videos.listing_id
         and (l.seller_id = auth.uid()
              or (l.dealer_id is not null and l.dealer_id = public.user_dealer_id()))
    )
  ) with check (
    public.is_admin()
    or exists (
      select 1 from public.listings l
       where l.id = listing_videos.listing_id
         and (l.seller_id = auth.uid()
              or (l.dealer_id is not null and l.dealer_id = public.user_dealer_id()))
    )
  );


-- ─── saved_listings  (own only) ─────────────────────────────────────────────
drop policy if exists saves_own on public.saved_listings;
create policy saves_own on public.saved_listings
  for all using (user_id = auth.uid())
            with check (user_id = auth.uid());


-- ─── inquiries ───────────────────────────────────────────────────────────────
drop policy if exists inquiries_insert_anyone on public.inquiries;
create policy inquiries_insert_anyone on public.inquiries
  for insert with check (true);

drop policy if exists inquiries_select_party on public.inquiries;
create policy inquiries_select_party on public.inquiries
  for select using (
    buyer_id = auth.uid()
    or seller_id = auth.uid()
    or (dealer_id is not null and dealer_id = public.user_dealer_id())
    or public.is_admin()
  );

drop policy if exists inquiries_update_seller_or_admin on public.inquiries;
create policy inquiries_update_seller_or_admin on public.inquiries
  for update using (
    seller_id = auth.uid()
    or (dealer_id is not null and dealer_id = public.user_dealer_id())
    or public.is_admin()
  ) with check (
    seller_id = auth.uid()
    or (dealer_id is not null and dealer_id = public.user_dealer_id())
    or public.is_admin()
  );


-- ─── partner request inboxes  (financing / insurance / inspection / transport)
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'financing_requests',
    'insurance_requests',
    'inspection_requests',
    'transport_requests'
  ])
  loop
    execute format($pol$
      drop policy if exists %1$s_insert_anyone on public.%1$I;
      create policy %1$s_insert_anyone on public.%1$I
        for insert with check (true);

      drop policy if exists %1$s_select_party on public.%1$I;
      create policy %1$s_select_party on public.%1$I
        for select using (
          user_id = auth.uid()
          or (partner_id is not null
              and partner_id = public.user_service_provider_id())
          or public.is_admin()
        );

      drop policy if exists %1$s_update_partner_or_admin on public.%1$I;
      create policy %1$s_update_partner_or_admin on public.%1$I
        for update using (
          public.is_admin()
          or (partner_id is not null
              and partner_id = public.user_service_provider_id())
        ) with check (
          public.is_admin()
          or (partner_id is not null
              and partner_id = public.user_service_provider_id())
        );
    $pol$, t);
  end loop;
end $$;


-- ─── service_requests ────────────────────────────────────────────────────────
drop policy if exists service_requests_insert_anyone on public.service_requests;
create policy service_requests_insert_anyone on public.service_requests
  for insert with check (true);

drop policy if exists service_requests_select_party on public.service_requests;
create policy service_requests_select_party on public.service_requests
  for select using (
    user_id = auth.uid()
    or (service_provider_id is not null
        and service_provider_id = public.user_service_provider_id())
    or public.is_admin()
  );

drop policy if exists service_requests_update on public.service_requests;
create policy service_requests_update on public.service_requests
  for update using (
    public.is_admin()
    or (service_provider_id is not null
        and service_provider_id = public.user_service_provider_id())
  ) with check (
    public.is_admin()
    or (service_provider_id is not null
        and service_provider_id = public.user_service_provider_id())
  );


-- ─── concierge_requests ──────────────────────────────────────────────────────
drop policy if exists concierge_insert_anyone on public.concierge_requests;
create policy concierge_insert_anyone on public.concierge_requests
  for insert with check (true);

drop policy if exists concierge_select_own_or_admin on public.concierge_requests;
create policy concierge_select_own_or_admin on public.concierge_requests
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists concierge_update_admin on public.concierge_requests;
create policy concierge_update_admin on public.concierge_requests
  for update using (public.is_admin())
            with check (public.is_admin());


-- ─── subscriptions ───────────────────────────────────────────────────────────
-- writes happen via edge functions using the service-role key (which bypasses
-- RLS). End-user roles get read-only access scoped to their org.
drop policy if exists subscriptions_select_owner on public.subscriptions;
create policy subscriptions_select_owner on public.subscriptions
  for select using (
    public.is_admin()
    or (dealer_id is not null and dealer_id = public.user_dealer_id())
    or (service_provider_id is not null
        and service_provider_id = public.user_service_provider_id())
  );


-- ─── payments ────────────────────────────────────────────────────────────────
drop policy if exists payments_select_owner on public.payments;
create policy payments_select_owner on public.payments
  for select using (
    public.is_admin()
    or user_id = auth.uid()
    or (dealer_id is not null and dealer_id = public.user_dealer_id())
    or (service_provider_id is not null
        and service_provider_id = public.user_service_provider_id())
  );


-- ─── featured_listings ───────────────────────────────────────────────────────
drop policy if exists featured_public_read on public.featured_listings;
create policy featured_public_read on public.featured_listings
  for select using (true);


-- ─── fraud_flags  (admin only) ───────────────────────────────────────────────
drop policy if exists fraud_admin_all on public.fraud_flags;
create policy fraud_admin_all on public.fraud_flags
  for all using (public.is_admin())
            with check (public.is_admin());


-- ─── ai_logs  (admin read; anyone insert via edge fn / authed user) ──────────
drop policy if exists ai_logs_insert_any on public.ai_logs;
create policy ai_logs_insert_any on public.ai_logs
  for insert with check (true);

drop policy if exists ai_logs_select_admin on public.ai_logs;
create policy ai_logs_select_admin on public.ai_logs
  for select using (public.is_admin());


-- ─── notifications  (own only) ───────────────────────────────────────────────
drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update using (user_id = auth.uid())
            with check (user_id = auth.uid());

drop policy if exists notifications_delete_own on public.notifications;
create policy notifications_delete_own on public.notifications
  for delete using (user_id = auth.uid() or public.is_admin());


-- ─── blog_posts ──────────────────────────────────────────────────────────────
drop policy if exists blog_public_read on public.blog_posts;
create policy blog_public_read on public.blog_posts
  for select using (is_published = true or public.is_admin());

drop policy if exists blog_admin_all on public.blog_posts;
create policy blog_admin_all on public.blog_posts
  for all using (public.is_admin())
            with check (public.is_admin());


-- ─── market_reports ──────────────────────────────────────────────────────────
drop policy if exists reports_public_read on public.market_reports;
create policy reports_public_read on public.market_reports
  for select using (is_published = true or public.is_admin());

drop policy if exists reports_admin_all on public.market_reports;
create policy reports_admin_all on public.market_reports
  for all using (public.is_admin())
            with check (public.is_admin());


-- ============================================================================
-- 32. STORAGE  (buckets + object RLS)
-- ============================================================================

-- ── buckets ─────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public) values
  ('listings-photos',          'listings-photos',          true),
  ('listings-videos',          'listings-videos',          true),
  ('avatars',                  'avatars',                  true),
  ('dealer-assets',            'dealer-assets',            true),
  ('service-provider-assets',  'service-provider-assets',  true),
  ('documents',                'documents',                false)
on conflict (id) do nothing;


-- ── helpers + path convention ───────────────────────────────────────────────
-- All buckets follow:  <owner-uuid>/<file>   for user-owned objects, and
--                      <dealer-or-provider-uuid>/<file>   for org assets.
-- storage.foldername(name)[1] returns the first path segment.

-- ── listings-photos ─────────────────────────────────────────────────────────
drop policy if exists "listings-photos public read" on storage.objects;
create policy "listings-photos public read" on storage.objects
  for select using (bucket_id = 'listings-photos');

drop policy if exists "listings-photos auth write" on storage.objects;
create policy "listings-photos auth write" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'listings-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (storage.foldername(name))[1] = (public.user_dealer_id())::text
      or public.is_admin()
    )
  );

drop policy if exists "listings-photos auth update" on storage.objects;
create policy "listings-photos auth update" on storage.objects
  for update to authenticated using (
    bucket_id = 'listings-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (storage.foldername(name))[1] = (public.user_dealer_id())::text
      or public.is_admin()
    )
  );

drop policy if exists "listings-photos auth delete" on storage.objects;
create policy "listings-photos auth delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'listings-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (storage.foldername(name))[1] = (public.user_dealer_id())::text
      or public.is_admin()
    )
  );


-- ── listings-videos ─────────────────────────────────────────────────────────
drop policy if exists "listings-videos public read" on storage.objects;
create policy "listings-videos public read" on storage.objects
  for select using (bucket_id = 'listings-videos');

drop policy if exists "listings-videos auth write" on storage.objects;
create policy "listings-videos auth write" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'listings-videos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (storage.foldername(name))[1] = (public.user_dealer_id())::text
      or public.is_admin()
    )
  );

drop policy if exists "listings-videos auth update" on storage.objects;
create policy "listings-videos auth update" on storage.objects
  for update to authenticated using (
    bucket_id = 'listings-videos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (storage.foldername(name))[1] = (public.user_dealer_id())::text
      or public.is_admin()
    )
  );

drop policy if exists "listings-videos auth delete" on storage.objects;
create policy "listings-videos auth delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'listings-videos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (storage.foldername(name))[1] = (public.user_dealer_id())::text
      or public.is_admin()
    )
  );


-- ── avatars  (path: <user-uuid>/...) ────────────────────────────────────────
drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars auth write" on storage.objects;
create policy "avatars auth write" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

drop policy if exists "avatars auth update" on storage.objects;
create policy "avatars auth update" on storage.objects
  for update to authenticated using (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

drop policy if exists "avatars auth delete" on storage.objects;
create policy "avatars auth delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );


-- ── dealer-assets  (path: <dealer-uuid>/...) ────────────────────────────────
drop policy if exists "dealer-assets public read" on storage.objects;
create policy "dealer-assets public read" on storage.objects
  for select using (bucket_id = 'dealer-assets');

drop policy if exists "dealer-assets auth write" on storage.objects;
create policy "dealer-assets auth write" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'dealer-assets'
    and (
      (storage.foldername(name))[1] = (public.user_dealer_id())::text
      or public.is_admin()
    )
  );

drop policy if exists "dealer-assets auth update" on storage.objects;
create policy "dealer-assets auth update" on storage.objects
  for update to authenticated using (
    bucket_id = 'dealer-assets'
    and (
      (storage.foldername(name))[1] = (public.user_dealer_id())::text
      or public.is_admin()
    )
  );

drop policy if exists "dealer-assets auth delete" on storage.objects;
create policy "dealer-assets auth delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'dealer-assets'
    and (
      (storage.foldername(name))[1] = (public.user_dealer_id())::text
      or public.is_admin()
    )
  );


-- ── service-provider-assets  (path: <service-provider-uuid>/...) ────────────
drop policy if exists "sp-assets public read" on storage.objects;
create policy "sp-assets public read" on storage.objects
  for select using (bucket_id = 'service-provider-assets');

drop policy if exists "sp-assets auth write" on storage.objects;
create policy "sp-assets auth write" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'service-provider-assets'
    and (
      (storage.foldername(name))[1] = (public.user_service_provider_id())::text
      or public.is_admin()
    )
  );

drop policy if exists "sp-assets auth update" on storage.objects;
create policy "sp-assets auth update" on storage.objects
  for update to authenticated using (
    bucket_id = 'service-provider-assets'
    and (
      (storage.foldername(name))[1] = (public.user_service_provider_id())::text
      or public.is_admin()
    )
  );

drop policy if exists "sp-assets auth delete" on storage.objects;
create policy "sp-assets auth delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'service-provider-assets'
    and (
      (storage.foldername(name))[1] = (public.user_service_provider_id())::text
      or public.is_admin()
    )
  );


-- ── documents  (private; path: <user-uuid>/...) ─────────────────────────────
drop policy if exists "documents owner read" on storage.objects;
create policy "documents owner read" on storage.objects
  for select to authenticated using (
    bucket_id = 'documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

drop policy if exists "documents auth write" on storage.objects;
create policy "documents auth write" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

drop policy if exists "documents auth update" on storage.objects;
create policy "documents auth update" on storage.objects
  for update to authenticated using (
    bucket_id = 'documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

drop policy if exists "documents auth delete" on storage.objects;
create policy "documents auth delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );


-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
