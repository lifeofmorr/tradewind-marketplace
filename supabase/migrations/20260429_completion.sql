-- TradeWind Completion Audit (2026-04-29).
-- Schema gaps surfaced by the feature-completion audit:
--   1. integration_requests.notes column (DeveloperHub form was inserting a
--      column that did not exist — every developer-API request was failing).
--   2. webhook_events idempotency table (Stripe retries a webhook on any
--      non-2xx; without dedup we double-insert payments + featured rows).
--   3. community_posts.hidden flag for moderation.
--   4. data_deletion_requests table for /delete-my-data submissions.

-- 1. notes column on integration_requests ------------------------------------

alter table public.integration_requests
  add column if not exists notes text;

-- 2. webhook_events for idempotent Stripe handling ---------------------------

create table if not exists public.webhook_events (
  id text primary key,                         -- Stripe event.id (evt_…)
  type text not null,
  processed_at timestamptz not null default now()
);

alter table public.webhook_events enable row level security;

drop policy if exists "Admins read webhook events" on public.webhook_events;
create policy "Admins read webhook events" on public.webhook_events
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 3. moderation flag on community_posts --------------------------------------

alter table public.community_posts
  add column if not exists hidden boolean not null default false;

create index if not exists community_posts_hidden_idx
  on public.community_posts (hidden) where hidden = true;

-- 4. reports.target_type — allow 'inquiry' so sellers can flag spam inquiries.
-- Drop and re-add the check; data is preserved.

alter table public.reports drop constraint if exists reports_target_type_check;
alter table public.reports add constraint reports_target_type_check
  check (target_type in ('listing', 'message', 'post', 'user', 'review', 'inquiry'));

-- 5. data_deletion_requests --------------------------------------------------

create table if not exists public.data_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  email text not null,
  reason text,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed', 'rejected')),
  notes text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists data_deletion_requests_user_idx
  on public.data_deletion_requests (user_id);
create index if not exists data_deletion_requests_status_idx
  on public.data_deletion_requests (status);

alter table public.data_deletion_requests enable row level security;

drop policy if exists "Users insert deletion request" on public.data_deletion_requests;
create policy "Users insert deletion request" on public.data_deletion_requests
  for insert with check (
    auth.uid() = user_id or user_id is null
  );

drop policy if exists "Users read own deletion requests" on public.data_deletion_requests;
create policy "Users read own deletion requests" on public.data_deletion_requests
  for select using (
    auth.uid() = user_id
  );

drop policy if exists "Admins manage deletion requests" on public.data_deletion_requests;
create policy "Admins manage deletion requests" on public.data_deletion_requests
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
