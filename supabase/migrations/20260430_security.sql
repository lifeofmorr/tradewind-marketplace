-- TradeWind Security: audit log, user reports, buyer readiness/verification.

-- Audit log for sensitive admin actions
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  target_type text, -- 'listing', 'profile', 'payment', etc.
  target_id uuid,
  metadata jsonb default '{}',
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_actor_idx on public.audit_logs(actor_id);
create index if not exists audit_logs_action_idx on public.audit_logs(action);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);

alter table public.audit_logs enable row level security;

drop policy if exists "Admins only" on public.audit_logs;
create policy "Admins only" on public.audit_logs for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "System insert" on public.audit_logs;
create policy "System insert" on public.audit_logs for insert with check (true);

-- User-submitted reports (listings, messages, posts, users, reviews)
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id),
  target_type text not null check (target_type in ('listing', 'message', 'post', 'user', 'review')),
  target_id uuid not null,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists reports_target_idx on public.reports(target_type, target_id);
create index if not exists reports_status_idx on public.reports(status);
create index if not exists reports_reporter_idx on public.reports(reporter_id);

alter table public.reports enable row level security;

drop policy if exists "Users create reports" on public.reports;
create policy "Users create reports" on public.reports for insert
  with check (auth.uid() = reporter_id);

drop policy if exists "Users view own reports" on public.reports;
create policy "Users view own reports" on public.reports for select
  using (auth.uid() = reporter_id);

drop policy if exists "Admins view reports" on public.reports;
create policy "Admins view reports" on public.reports for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Admins update reports" on public.reports;
create policy "Admins update reports" on public.reports for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Buyer readiness / verification fields on profiles
alter table public.profiles
  add column if not exists buyer_readiness_score int default 0;

alter table public.profiles
  add column if not exists verification_level text default 'unverified'
  check (verification_level in (
    'unverified', 'contact_verified', 'business_verified',
    'document_verified', 'tradewind_verified'
  ));
