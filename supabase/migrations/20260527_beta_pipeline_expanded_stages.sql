-- 20260527_beta_pipeline_expanded_stages.sql
--
-- Expands the allowed beta_pipeline.stage values to support the full
-- reply-to-demo conversion funnel. The original v2 migration restricted
-- stage to seven values; the conversion playbook needs five additional
-- stages so /admin/outreach can represent the actual pipeline:
--
--   interested            — replied positively, demo not yet booked
--   wants_demo            — asked for a demo, no time confirmed yet
--   demo_booked           — demo on the calendar
--   demo_completed        — demo happened
--   beta_invited          — beta invite sent
--   beta_onboarded        — signed up + first meaningful action done
--   real_listing_candidate — willing to list real inventory
--   partner_candidate     — fit for partner / integration
--   paid_candidate        — verbally indicated pay-after-beta interest
--   follow_up_later       — wants to revisit later
--   not_interested        — explicit no
--   declined              — opted out / DNC
--
-- Existing rows with stage='onboarded' are migrated to 'beta_onboarded'
-- as part of this change to keep the vocabulary consistent.

begin;

-- Drop the old CHECK so we can rewrite it. The constraint name follows
-- Postgres's auto-naming convention (table_column_check). We use IF EXISTS
-- to keep this migration safe to re-run.
alter table public.beta_pipeline
  drop constraint if exists beta_pipeline_stage_check;

-- Migrate legacy 'onboarded' rows to the new 'beta_onboarded' label
-- before the new CHECK runs.
update public.beta_pipeline
  set stage = 'beta_onboarded'
  where stage = 'onboarded';

-- Add the expanded CHECK.
alter table public.beta_pipeline
  add constraint beta_pipeline_stage_check
  check (stage in (
    'interested',
    'wants_demo',
    'demo_booked',
    'demo_completed',
    'beta_invited',
    'beta_onboarded',
    'real_listing_candidate',
    'partner_candidate',
    'paid_candidate',
    'follow_up_later',
    'not_interested',
    'declined'
  ));

commit;
