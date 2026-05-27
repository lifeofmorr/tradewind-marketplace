-- ─────────────────────────────────────────────────────────────────────────────
-- Beta feedback inbox — 2026-05-28
--
-- Captures product feedback and beta-access requests submitted from the
-- public /feedback form. Anyone (signed in or not) can insert. Only admins
-- can read.
--
-- Idempotent: safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

create table if not exists public.beta_feedback (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  email           text not null,
  company         text,
  role            text,
  vertical        text not null check (vertical in (
                    'marine_dealer', 'yacht_broker', 'auto_dealer',
                    'aircraft_broker', 'service_provider',
                    'lender', 'insurance', 'escrow', 'transport',
                    'buyer', 'other'
                  )),
  tested          text,
  useful          text,
  confusing       text,
  beta_partner    text not null check (beta_partner in ('yes', 'no', 'maybe')),
  feedback_call   text not null check (feedback_call in ('yes', 'no', 'maybe')),
  user_agent      text,
  status          text not null default 'new' check (status in ('new', 'reviewed', 'archived')),
  created_at      timestamptz not null default now()
);

create index if not exists beta_feedback_created_at_idx
  on public.beta_feedback (created_at desc);

create index if not exists beta_feedback_status_idx
  on public.beta_feedback (status);

alter table public.beta_feedback enable row level security;

-- Public insert: anyone can submit feedback (anonymous form on /feedback).
drop policy if exists "Public insert" on public.beta_feedback;
create policy "Public insert" on public.beta_feedback
  for insert with check (true);

-- Admin read only.
drop policy if exists "Admins read" on public.beta_feedback;
create policy "Admins read" on public.beta_feedback
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Admins update" on public.beta_feedback;
create policy "Admins update" on public.beta_feedback
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

commit;
