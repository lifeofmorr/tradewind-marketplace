-- ─────────────────────────────────────────────────────────────────────────────
-- Admin notifications — 2026-05-28
--
-- An in-app notification feed for the founder + admins. Used by the
-- inbound beta conversion system: when a /feedback submission lands,
-- a trigger inserts a row here so the operator sees it in the admin
-- shell without having to refresh the beta inbox by hand.
--
-- Read/update are admin-only via RLS. Inserts are typically performed
-- by triggers (which run as table owner and bypass RLS), but the
-- INSERT policy also permits admins to write notifications by hand if
-- they want to drop a manual note for themselves.
--
-- Idempotent: safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

create table if not exists public.admin_notifications (
  id         uuid primary key default gen_random_uuid(),
  type       text not null,
  title      text not null,
  message    text,
  metadata   jsonb not null default '{}'::jsonb,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists admin_notifications_created_at_idx
  on public.admin_notifications (created_at desc);

create index if not exists admin_notifications_unread_idx
  on public.admin_notifications (read_at) where read_at is null;

create index if not exists admin_notifications_type_idx
  on public.admin_notifications (type);

alter table public.admin_notifications enable row level security;

drop policy if exists "Admins read notifications" on public.admin_notifications;
create policy "Admins read notifications" on public.admin_notifications
  for select using (public.is_admin());

drop policy if exists "Admins update notifications" on public.admin_notifications;
create policy "Admins update notifications" on public.admin_notifications
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins insert notifications" on public.admin_notifications;
create policy "Admins insert notifications" on public.admin_notifications
  for insert with check (public.is_admin());

drop policy if exists "Admins delete notifications" on public.admin_notifications;
create policy "Admins delete notifications" on public.admin_notifications
  for delete using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- Trigger: every new beta_feedback row drops an admin_notifications row.
-- Runs with SECURITY DEFINER so the public (anon) insert into
-- beta_feedback can still produce the admin-side notification while
-- the table itself is RLS-protected to admins.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.notify_admin_on_beta_feedback()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
  v_message text;
begin
  v_title := 'New beta feedback from ' || coalesce(new.name, 'someone');
  v_message :=
    coalesce(new.company, '—') ||
    ' · ' || coalesce(new.vertical, 'unknown') ||
    ' · beta_partner=' || coalesce(new.beta_partner, '?') ||
    ' · call=' || coalesce(new.feedback_call, '?');

  insert into public.admin_notifications (type, title, message, metadata)
  values (
    'feedback_submitted',
    v_title,
    v_message,
    jsonb_build_object(
      'feedback_id', new.id,
      'name', new.name,
      'email', new.email,
      'company', new.company,
      'role', new.role,
      'vertical', new.vertical,
      'beta_partner', new.beta_partner,
      'feedback_call', new.feedback_call,
      'lead_id', new.lead_id,
      'utm_source', new.utm_source,
      'utm_medium', new.utm_medium,
      'utm_campaign', new.utm_campaign,
      'referrer', new.referrer,
      'landing_page', new.landing_page
    )
  );
  return new;
end;
$$;

drop trigger if exists beta_feedback_admin_notify on public.beta_feedback;
create trigger beta_feedback_admin_notify
  after insert on public.beta_feedback
  for each row
  execute function public.notify_admin_on_beta_feedback();

commit;
