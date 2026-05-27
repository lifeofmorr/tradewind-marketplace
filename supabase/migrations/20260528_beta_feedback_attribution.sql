-- ─────────────────────────────────────────────────────────────────────────────
-- Beta feedback — attribution + workflow status expansion (2026-05-28)
--
-- Adds attribution columns to beta_feedback so we can tie /feedback
-- submissions back to the outreach campaign that drove them, and
-- expands the status check constraint so admins can move rows through
-- the conversion workflow:
--
--   new → reviewed → interested → demo_requested → beta_invited
--   (or → not_a_fit / archived)
--
-- Idempotent: safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

alter table public.beta_feedback
  add column if not exists lead_id      uuid references public.outreach_leads(id) on delete set null,
  add column if not exists utm_source   text,
  add column if not exists utm_medium   text,
  add column if not exists utm_campaign text,
  add column if not exists utm_term     text,
  add column if not exists utm_content  text,
  add column if not exists referrer     text,
  add column if not exists landing_page text;

create index if not exists beta_feedback_lead_id_idx
  on public.beta_feedback (lead_id);

create index if not exists beta_feedback_utm_campaign_idx
  on public.beta_feedback (utm_campaign);

-- Expand the status check to cover the inbound conversion workflow.
do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'beta_feedback_status_check'
  ) then
    alter table public.beta_feedback drop constraint beta_feedback_status_check;
  end if;
end$$;

alter table public.beta_feedback
  add constraint beta_feedback_status_check
  check (status in (
    'new',
    'reviewed',
    'interested',
    'demo_requested',
    'beta_invited',
    'not_a_fit',
    'archived'
  ));

commit;
