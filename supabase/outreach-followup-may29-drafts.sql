-- ─────────────────────────────────────────────────────────────────────────────
-- Follow-up Drafts for 2026-05-29 — Phase 5 of Bounce Control + Verified
-- Outreach Mode.
--
-- Creates 4 follow-up `outreach_messages` rows (status='drafted', approved=false)
-- for the 4 leads that received and delivered the first email on 2026-05-26:
--
--   1. Nashville Yacht Brokers       info@nashvilleyachtbrokers.com
--   2. PSL Yacht Brokers             info@pslyachtbrokers.com
--   3. Flagship Marine Survey        steve@flagshipmarinesurvey.com
--   4. Carolina Aircraft             (lookup by company name)
--
-- Rules enforced:
--   - DRAFTS ONLY. status='drafted', approved=false, sent_at=null. Nothing
--     leaves the building until Don approves on the admin dashboard.
--   - Don't draft if a reply has already been received (outreach_replies row
--     exists for this lead).
--   - Don't draft if the lead is opted out (do_not_contact=true) or marked
--     do_not_email at the verification layer.
--   - Don't draft if a follow-up draft already exists for this lead on this
--     date (idempotent — safe to re-run).
--   - Mirror the outreach_followups row to due_date=2026-05-29 / status='due'
--     and link both rows via outreach_followups.message_id.
--
-- NOTE on schema: outreach_messages.status CHECK allows
-- ('drafted','approved','sent','bounced','replied','failed'). The spec used
-- 'draft' colloquially — the persisted value is 'drafted' to satisfy the
-- constraint.
--
-- NOTE on subjects: the first-touch subjects we have a record of are
-- "TradeWind — quick intro for <Company>". For Flagship and Carolina the
-- send was manual and the exact subject was not logged, so we use the same
-- pattern. If the actual subject differed, the only consequence is the
-- "Re:" thread header — easy to correct in the dashboard before approve.
--
-- HOW TO RUN:
--   1. Apply 20260527_email_verification.sql first (Phase 3 migration).
--   2. Apply outreach-bounce-cleanup.sql (Phase 1).
--   3. Open Supabase SQL Editor → paste this file → Run.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

-- The follow-up body is identical across all 4 leads per spec.
-- We capture it as a CTE so the per-lead INSERTs stay readable.
with followup as (
  select
    'Re: TradeWind — quick intro for '::text as subject_prefix,
    E'Hey — quick follow-up.\n\n'
    || 'I''m not trying to pitch a finished public marketplace. I''m looking '
    || 'for a few sharp operators to pressure-test TradeWind before we open '
    || 'it wider.' || E'\n\n'
    || 'If you''re open to it, I''d value 10 minutes of honest feedback.'
    || E'\n\n'
    || E'— Don\n\n'
    || 'If this is not relevant, no worries — just tell me and I will not '
    || 'follow up.' as body
),

-- ── Target leads: the 4 delivered from 2026-05-26 ──────────────────────────
targets as (
  select l.id, l.company, l.email, l.do_not_contact,
         l.email_verification_status
    from public.outreach_leads l
   where (
            lower(l.email) in (
              lower('info@nashvilleyachtbrokers.com'),
              lower('info@pslyachtbrokers.com'),
              lower('steve@flagshipmarinesurvey.com')
            )
         or l.company ilike 'Carolina Aircraft%'
         )
),

-- ── Eligibility filter ─────────────────────────────────────────────────────
-- A lead is eligible for the May 29 follow-up only if:
--   - do_not_contact = false
--   - no reply has come in yet (no row in outreach_replies for this lead)
--   - email_verification_status is not in ('bounced','invalid','do_not_email')
eligible as (
  select t.*
    from targets t
   where t.do_not_contact = false
     and t.email_verification_status not in ('bounced', 'invalid', 'do_not_email')
     and not exists (
       select 1 from public.outreach_replies r where r.lead_id = t.id
     )
),

-- ── Skip leads that already have a follow-up draft staged for 2026-05-29 ──
not_already_drafted as (
  select e.*
    from eligible e
   where not exists (
     select 1 from public.outreach_messages m
      where m.lead_id   = e.id
        and m.direction = 'outbound'
        and m.channel   = 'email'
        and m.status    = 'drafted'
        and (m.meta->>'followup_number') = '1'
   )
),

-- ── Insert the follow-up drafts ────────────────────────────────────────────
inserted_msgs as (
  insert into public.outreach_messages
    (lead_id, direction, channel, subject, body, status, approved,
     generation_source, personalization_note, cta, meta)
  select
    n.id,
    'outbound',
    'email',
    (select subject_prefix from followup) || n.company,
    (select body from followup),
    'drafted',
    false,
    'manual',
    'Follow-up #1 — May 29, 3 business days after first-touch on 2026-05-26.',
    'Honest 10 minutes of feedback.',
    jsonb_build_object(
      'followup_number',     1,
      'due_date',            '2026-05-29',
      'first_touch_date',    '2026-05-26',
      'phase',               'bounce-control-may-29',
      'send_rules',          jsonb_build_object(
        'skip_if_reply',     true,
        'skip_if_opted_out', true,
        'require_approval',  true
      )
    )
   from not_already_drafted n
  returning id, lead_id
)

-- ── Mirror into outreach_followups (status='due', due_date=2026-05-29) ─────
insert into public.outreach_followups
  (lead_id, message_id, followup_number, due_date, body, status)
select i.lead_id,
       i.id,
       1,
       date '2026-05-29',
       (select body from followup),
       'due'
  from inserted_msgs i
 where not exists (
   select 1 from public.outreach_followups f
    where f.lead_id         = i.lead_id
      and f.followup_number = 1
      and f.status          = 'due'
 );

-- ── Activity log per drafted follow-up ─────────────────────────────────────
insert into public.outreach_activity_log (lead_id, action, metadata)
select m.lead_id,
       'followup_drafted',
       jsonb_build_object(
         'followup_number', 1,
         'due_date',        '2026-05-29',
         'message_id',      m.id,
         'phase',           'bounce-control-may-29'
       )
  from public.outreach_messages m
 where (m.meta->>'phase') = 'bounce-control-may-29'
   and (m.meta->>'followup_number') = '1'
   and m.status = 'drafted'
   and not exists (
     select 1 from public.outreach_activity_log a
      where a.lead_id  = m.lead_id
        and a.action   = 'followup_drafted'
        and (a.metadata->>'phase') = 'bounce-control-may-29'
   );

commit;

-- ── Verification (run after the commit) ───────────────────────────────────
-- Expected: 4 rows. status=drafted, approved=false, sent_at IS NULL,
-- subject begins with "Re: TradeWind".
--
-- select l.company, m.subject, m.status, m.approved,
--        m.meta->>'followup_number' as followup_number,
--        m.meta->>'due_date'        as due_date
--   from public.outreach_messages m
--   join public.outreach_leads    l on l.id = m.lead_id
--  where m.meta->>'phase' = 'bounce-control-may-29'
--  order by l.company;
