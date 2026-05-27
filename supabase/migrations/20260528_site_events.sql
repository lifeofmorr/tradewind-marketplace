-- ─────────────────────────────────────────────────────────────────────────────
-- Lightweight site events — 2026-05-28
--
-- Append-only telemetry table for product conversion events fired from the
-- public site (e.g. beta_page_view, request_beta_click, feedback_submit,
-- book_call_click, listing_detail_view). Anyone (signed in or not) can
-- insert. Only admins can read.
--
-- This is intentionally minimal — heavy product analytics belong in a real
-- analytics tool. This table exists so the founder can answer
-- "how many beta clicks did we get this week?" without standing up a
-- separate provider before May 29.
--
-- Idempotent: safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

create table if not exists public.site_events (
  id          uuid primary key default gen_random_uuid(),
  event_type  text not null,
  metadata    jsonb not null default '{}'::jsonb,
  session_id  text,
  created_at  timestamptz not null default now()
);

create index if not exists site_events_event_type_idx
  on public.site_events (event_type, created_at desc);

create index if not exists site_events_created_at_idx
  on public.site_events (created_at desc);

alter table public.site_events enable row level security;

drop policy if exists "Public insert" on public.site_events;
create policy "Public insert" on public.site_events
  for insert with check (
    event_type is not null
    and length(event_type) <= 64
  );

drop policy if exists "Admins read" on public.site_events;
create policy "Admins read" on public.site_events
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

commit;
