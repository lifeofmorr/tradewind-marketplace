-- ─────────────────────────────────────────────────────────────────────────────
-- Outreach Autopilot — CRM tables for the founder-led outreach system.
--
-- Two tables:
--   outreach_leads     — one row per company/contact we research and message
--   outreach_messages  — every drafted, sent, and received message tied to a lead
--
-- RLS: admin-only. The dashboard at /admin/outreach is the working surface.
-- Non-admins cannot read or write these tables.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

-- ── outreach_leads ──────────────────────────────────────────────────────────
create table if not exists public.outreach_leads (
  id              uuid primary key default gen_random_uuid(),
  company         text not null,
  contact_name    text,
  contact_role    text,
  vertical        text not null,
  email           text,
  phone           text,
  website         text,
  linkedin_url    text,
  instagram_url   text,
  location        text,
  lead_source     text,
  lead_score      int  not null default 3 check (lead_score between 1 and 5),
  personalization_angle text,
  pain_point      text,
  recommended_offer text,
  status          text not null default 'new',
  date_contacted  date,
  follow_up_date  date,
  reply_text      text,
  demo_booked     boolean not null default false,
  beta_invited    boolean not null default false,
  real_listing_candidate boolean not null default false,
  partner_candidate boolean not null default false,
  interested_in_paying text,
  do_not_contact  boolean not null default false,
  notes           text,
  next_action     text,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- case-insensitive uniqueness on email so we never queue a duplicate
create unique index if not exists outreach_leads_email_lower_uniq
  on public.outreach_leads (lower(email))
  where email is not null;

create index if not exists outreach_leads_status_idx     on public.outreach_leads (status);
create index if not exists outreach_leads_vertical_idx   on public.outreach_leads (vertical);
create index if not exists outreach_leads_lead_score_idx on public.outreach_leads (lead_score);
create index if not exists outreach_leads_follow_up_idx  on public.outreach_leads (follow_up_date)
  where do_not_contact = false;

-- ── outreach_messages ───────────────────────────────────────────────────────
create table if not exists public.outreach_messages (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid not null references public.outreach_leads(id) on delete cascade,
  direction     text not null check (direction in ('outbound', 'inbound')),
  channel       text not null check (channel in ('email', 'linkedin', 'instagram', 'phone', 'voicemail')),
  subject       text,
  body          text not null,
  status        text not null default 'drafted'
                check (status in ('drafted', 'approved', 'sent', 'bounced', 'replied', 'failed')),
  approved      boolean not null default false,
  sent_at       timestamptz,
  received_at   timestamptz,
  created_by    uuid references public.profiles(id) on delete set null,
  meta          jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists outreach_messages_lead_idx    on public.outreach_messages (lead_id);
create index if not exists outreach_messages_status_idx  on public.outreach_messages (status);
create index if not exists outreach_messages_sent_at_idx on public.outreach_messages (sent_at desc);

-- ── updated_at triggers ─────────────────────────────────────────────────────
create or replace function public.outreach_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_outreach_leads_updated_at on public.outreach_leads;
create trigger trg_outreach_leads_updated_at
  before update on public.outreach_leads
  for each row execute function public.outreach_set_updated_at();

drop trigger if exists trg_outreach_messages_updated_at on public.outreach_messages;
create trigger trg_outreach_messages_updated_at
  before update on public.outreach_messages
  for each row execute function public.outreach_set_updated_at();

-- ── RLS — admin only ────────────────────────────────────────────────────────
alter table public.outreach_leads    enable row level security;
alter table public.outreach_messages enable row level security;

drop policy if exists outreach_leads_admin_all on public.outreach_leads;
create policy outreach_leads_admin_all on public.outreach_leads
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists outreach_messages_admin_all on public.outreach_messages;
create policy outreach_messages_admin_all on public.outreach_messages
  for all
  using (public.is_admin())
  with check (public.is_admin());

commit;
