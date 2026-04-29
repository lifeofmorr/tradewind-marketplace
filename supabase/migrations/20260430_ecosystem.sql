-- TradeWind Ecosystem: integration interest capture + financial readiness.
-- Backs the Integrations page Connect/Notify buttons and the buyer Financial
-- Hub checklist + bank-link request flow.

-- Integration interest / connection requests
create table if not exists public.integration_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  integration_key text not null, -- e.g. 'salesforce', 'plaid', 'quickbooks'
  integration_name text not null,
  category text not null,
  status text not null default 'requested' check (status in ('requested', 'connected', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists integration_requests_user_idx
  on public.integration_requests (user_id);
create index if not exists integration_requests_key_idx
  on public.integration_requests (integration_key);

-- Financial readiness requests
create table if not exists public.financial_readiness (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pre_approved boolean default false,
  insurance_quoted boolean default false,
  bank_verified boolean default false,
  transport_arranged boolean default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists financial_readiness_user_uidx
  on public.financial_readiness (user_id);

-- RLS
alter table public.integration_requests enable row level security;

drop policy if exists "Users can view own requests" on public.integration_requests;
create policy "Users can view own requests" on public.integration_requests
  for select using (auth.uid() = user_id);

drop policy if exists "Users can create requests" on public.integration_requests;
create policy "Users can create requests" on public.integration_requests
  for insert with check (auth.uid() = user_id);

drop policy if exists "Admins can view all" on public.integration_requests;
create policy "Admins can view all" on public.integration_requests
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

alter table public.financial_readiness enable row level security;

drop policy if exists "Users can manage own readiness" on public.financial_readiness;
create policy "Users can manage own readiness" on public.financial_readiness
  for all using (auth.uid() = user_id);

drop policy if exists "Admins can view all readiness" on public.financial_readiness;
create policy "Admins can view all readiness" on public.financial_readiness
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
