-- ─────────────────────────────────────────────────────────────────────────────
-- Outreach Autopilot v2 — expand the outreach CRM with follow-ups, replies,
-- activity log, and beta pipeline. Idempotent: safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

-- ── outreach_leads — add missing columns ───────────────────────────────────
alter table public.outreach_leads
  add column if not exists priority int not null default 3
    check (priority between 1 and 5);

alter table public.outreach_leads
  add column if not exists do_not_contact boolean not null default false;

alter table public.outreach_leads
  add column if not exists next_action text;

create index if not exists outreach_leads_priority_idx
  on public.outreach_leads (priority desc)
  where do_not_contact = false;

-- ── outreach_messages — add missing columns ────────────────────────────────
alter table public.outreach_messages
  add column if not exists personalization_note text;

alter table public.outreach_messages
  add column if not exists cta text;

alter table public.outreach_messages
  add column if not exists approved_at timestamptz;

alter table public.outreach_messages
  add column if not exists quality_score int;

alter table public.outreach_messages
  add column if not exists ai_tone_risk_score int;

-- ── outreach_followups ─────────────────────────────────────────────────────
create table if not exists public.outreach_followups (
  id              uuid primary key default gen_random_uuid(),
  lead_id         uuid not null references public.outreach_leads(id) on delete cascade,
  message_id      uuid references public.outreach_messages(id) on delete set null,
  followup_number int  not null default 1,
  due_date        date not null,
  body            text,
  status          text not null default 'due'
                  check (status in ('due', 'sent', 'skipped', 'cancelled')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists outreach_followups_lead_idx
  on public.outreach_followups (lead_id);
create index if not exists outreach_followups_due_idx
  on public.outreach_followups (due_date)
  where status = 'due';

-- ── outreach_replies ───────────────────────────────────────────────────────
create table if not exists public.outreach_replies (
  id                   uuid primary key default gen_random_uuid(),
  lead_id              uuid not null references public.outreach_leads(id) on delete cascade,
  message_id           uuid references public.outreach_messages(id) on delete set null,
  channel              text not null
                       check (channel in ('email', 'linkedin', 'instagram', 'phone', 'voicemail', 'other')),
  reply_text           text not null,
  reply_type           text,
  recommended_response text,
  status               text not null default 'new'
                       check (status in ('new', 'reviewed', 'responded', 'archived')),
  created_at           timestamptz not null default now()
);

create index if not exists outreach_replies_lead_idx   on public.outreach_replies (lead_id);
create index if not exists outreach_replies_status_idx on public.outreach_replies (status);

-- ── outreach_activity_log ──────────────────────────────────────────────────
create table if not exists public.outreach_activity_log (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid references public.outreach_leads(id) on delete cascade,
  action     text not null,
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists outreach_activity_log_lead_idx
  on public.outreach_activity_log (lead_id, created_at desc);

-- ── beta_pipeline ──────────────────────────────────────────────────────────
create table if not exists public.beta_pipeline (
  id                       uuid primary key default gen_random_uuid(),
  lead_id                  uuid not null references public.outreach_leads(id) on delete cascade,
  beta_type                text,
  stage                    text not null default 'interested'
                           check (stage in (
                             'interested', 'demo_booked', 'demo_completed',
                             'beta_invited', 'onboarded', 'paid_candidate', 'declined'
                           )),
  demo_date                timestamptz,
  feedback_notes           text,
  real_listing_candidate   boolean not null default false,
  partner_candidate        boolean not null default false,
  interested_in_paying     boolean not null default false,
  next_step                text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create unique index if not exists beta_pipeline_lead_uniq on public.beta_pipeline (lead_id);
create index if not exists beta_pipeline_stage_idx on public.beta_pipeline (stage);

-- ── updated_at triggers for new tables ─────────────────────────────────────
drop trigger if exists trg_outreach_followups_updated_at on public.outreach_followups;
create trigger trg_outreach_followups_updated_at
  before update on public.outreach_followups
  for each row execute function public.outreach_set_updated_at();

drop trigger if exists trg_beta_pipeline_updated_at on public.beta_pipeline;
create trigger trg_beta_pipeline_updated_at
  before update on public.beta_pipeline
  for each row execute function public.outreach_set_updated_at();

-- ── RLS — admin-only on every new table ────────────────────────────────────
alter table public.outreach_followups    enable row level security;
alter table public.outreach_replies      enable row level security;
alter table public.outreach_activity_log enable row level security;
alter table public.beta_pipeline         enable row level security;

drop policy if exists outreach_followups_admin_all on public.outreach_followups;
create policy outreach_followups_admin_all on public.outreach_followups
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists outreach_replies_admin_all on public.outreach_replies;
create policy outreach_replies_admin_all on public.outreach_replies
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists outreach_activity_log_admin_all on public.outreach_activity_log;
create policy outreach_activity_log_admin_all on public.outreach_activity_log
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists beta_pipeline_admin_all on public.beta_pipeline;
create policy beta_pipeline_admin_all on public.beta_pipeline
  for all using (public.is_admin()) with check (public.is_admin());

commit;
