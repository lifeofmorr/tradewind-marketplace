-- ─────────────────────────────────────────────────────────────────────────────
-- Outreach Bounce Cleanup + Status Reconciliation — 2026-05-26
--
-- Reconciles outreach state after the 6 sends from 2026-05-26:
--   - 4 delivered  → status='contacted',  next_action='follow_up_may_29'
--   - 2 bounced    → status='bounced',    do_not_contact=false (the company
--                     is still a valid target; the *email address* is bad).
--
-- This file IS idempotent: every UPDATE scopes by a stable identifier
-- (lower(email) or company name) and every activity-log INSERT is guarded
-- by NOT EXISTS on (lead_id, action, today).
--
-- PRE-REQ:
--   - supabase/migrations/20260527_email_verification.sql has been applied
--     (adds email_verification_status, invalid_email_address, etc.). This
--     file does NOT depend on those columns — they are backfilled in the
--     migration itself — but you should apply the migration before running
--     the verified-leads queue.
--
-- BOUNCE RECOVERY FINDINGS (Phase 2 research):
--   USA Aircraft Brokers (usaaircraft.com)
--     - Main phone:  +1 (866) 872-2207 / (850) 637-6125
--     - Address:     257 Ambert Street, Ste D4, Pensacola, FL 32503
--     - LinkedIn:    https://linkedin.com/company/usaaircraft/
--     - Named brokers (public site): Scott Hager, Carlos Cintron, Vaughn, Chris Walls
--     - Working alternate inboxes (listed on usaaircraft.com):
--         clientsupport@usaaircraft.com   ← RECOMMENDED next channel
--         advertising@usaaircraft.com     ← partnership-coded, secondary
--     - Recommended next channel: clientsupport@usaaircraft.com
--       (paired with a LinkedIn connect to Scott Hager or Carlos Cintron).
--     - See go-to-market/outreach-autopilot/USA_AIRCRAFT_BOUNCE_RECOVERY.md
--
--   Smoky Mountain Traders (smokymountaintraders.com)
--     - Storefront:  2520 S Carver Rd, Maryville, TN
--     - Vertical:    Classic / muscle car dealer (60s–70s muscle, street rods).
--                    IN-vertical for TradeWind (collector autos).
--     - Owner:       Keith Bledsoe
--     - Phone:       +1 (865) 988-8088
--     - Working alternate inbox (per public listings):
--         sales@smtclassics.com   ← RECOMMENDED next channel
--     - Contact form: https://www.smokymountaintraders.com/contact
--     - Recommended next channel: sales@smtclassics.com (different domain,
--       but it's the published business email — likely their CRM/lead
--       inbox). Paired with a phone call to Keith Bledsoe if email is
--       silent for 5–7 days.
--     - See go-to-market/outreach-autopilot/SMOKY_MOUNTAIN_BOUNCE_RECOVERY.md
-- ─────────────────────────────────────────────────────────────────────────────

begin;

-- ── 1. DELIVERED — set up for May 29 follow-up ──────────────────────────────

-- Nashville Yacht Brokers
update public.outreach_leads
   set status         = 'contacted',
       follow_up_date = date '2026-05-29',
       next_action    = 'follow_up_may_29',
       updated_at     = now()
 where lower(email) = lower('info@nashvilleyachtbrokers.com');

-- PSL Yacht Brokers
update public.outreach_leads
   set status         = 'contacted',
       follow_up_date = date '2026-05-29',
       next_action    = 'follow_up_may_29',
       updated_at     = now()
 where lower(email) = lower('info@pslyachtbrokers.com');

-- Flagship Marine Survey (Steve Heinrich)
update public.outreach_leads
   set status         = 'contacted',
       follow_up_date = date '2026-05-29',
       next_action    = 'follow_up_may_29',
       updated_at     = now()
 where lower(email) = lower('steve@flagshipmarinesurvey.com');

-- Carolina Aircraft (lookup by company name — email not in seed files)
update public.outreach_leads
   set status         = 'contacted',
       follow_up_date = date '2026-05-29',
       next_action    = 'follow_up_may_29',
       updated_at     = now()
 where company ilike 'Carolina Aircraft%';

-- ── 2. BOUNCED — keep the lead, kill the address ───────────────────────────
--
-- Per spec: do_not_contact=false. The bounce is at the address level, not
-- the company level. The bad address itself is still recorded in the lead's
-- `email` column for audit, and is also copied into
-- `invalid_email_address` by the email-verification migration so that the
-- queue can refuse to send to it again.

-- USA Aircraft Brokers
update public.outreach_leads
   set status          = 'bounced',
       do_not_contact  = false,
       next_action     = 'research_corrected_contact',
       notes           = 'info@usaaircraft.com bounced - needs corrected contact. '
                         || 'Recommended next channel: clientsupport@usaaircraft.com '
                         || '+ LinkedIn DM to Scott Hager or Carlos Cintron. '
                         || 'See USA_AIRCRAFT_BOUNCE_RECOVERY.md.',
       updated_at      = now()
 where lower(email) = lower('info@usaaircraft.com');

-- Smoky Mountain Traders
update public.outreach_leads
   set status          = 'bounced',
       do_not_contact  = false,
       next_action     = 'research_corrected_contact',
       notes           = 'info@smokymountaintraders.com bounced - needs corrected contact. '
                         || 'Classic muscle car dealer in Maryville TN, in-vertical for TradeWind. '
                         || 'Recommended next channel: sales@smtclassics.com '
                         || '(published business email, different domain) or phone '
                         || '(865) 988-8088 to owner Keith Bledsoe. '
                         || 'See SMOKY_MOUNTAIN_BOUNCE_RECOVERY.md.',
       updated_at      = now()
 where lower(email) = lower('info@smokymountaintraders.com');

-- ── 3. Activity log — one entry per lead ────────────────────────────────────

-- Delivered: log follow-up scheduling
insert into public.outreach_activity_log (lead_id, action, metadata)
select l.id,
       'follow_up_scheduled',
       jsonb_build_object(
         'delivery_status', 'delivered',
         'follow_up_date',  '2026-05-29',
         'reconciled_at',   now()::text,
         'phase',           'bounce-cleanup-2026-05-26'
       )
  from public.outreach_leads l
 where (lower(l.email) in (
          lower('info@nashvilleyachtbrokers.com'),
          lower('info@pslyachtbrokers.com'),
          lower('steve@flagshipmarinesurvey.com')
        ) or l.company ilike 'Carolina Aircraft%')
   and not exists (
     select 1 from public.outreach_activity_log a
      where a.lead_id = l.id
        and a.action  = 'follow_up_scheduled'
        and a.created_at::date = current_date
   );

-- Bounced: log the bounce + recovery research
insert into public.outreach_activity_log (lead_id, action, metadata)
select l.id,
       'bounce_recorded',
       jsonb_build_object(
         'bounced_address', l.email,
         'next_channel',
            case
              when lower(l.email) = lower('info@usaaircraft.com')
                then 'clientsupport@usaaircraft.com + LinkedIn DM'
              when lower(l.email) = lower('info@smokymountaintraders.com')
                then 'sales@smtclassics.com + phone (865) 988-8088 (Keith Bledsoe)'
              else 'unknown'
            end,
         'recovery_doc',
            case
              when lower(l.email) = lower('info@usaaircraft.com')
                then 'USA_AIRCRAFT_BOUNCE_RECOVERY.md'
              when lower(l.email) = lower('info@smokymountaintraders.com')
                then 'SMOKY_MOUNTAIN_BOUNCE_RECOVERY.md'
              else null
            end,
         'reconciled_at', now()::text,
         'phase',         'bounce-cleanup-2026-05-26'
       )
  from public.outreach_leads l
 where lower(l.email) in (
         lower('info@usaaircraft.com'),
         lower('info@smokymountaintraders.com')
       )
   and not exists (
     select 1 from public.outreach_activity_log a
      where a.lead_id = l.id
        and a.action  = 'bounce_recorded'
        and a.created_at::date = current_date
   );

-- ── 4. Verification: confirm the 6 expected rows are in the right state ────
--
-- Run this select after the commit. Expected rows: 6.
-- Expected status mix: 4 contacted, 2 bounced.
--
-- select company, status, next_action, follow_up_date, do_not_contact
--   from public.outreach_leads
--  where lower(email) in (
--          lower('info@nashvilleyachtbrokers.com'),
--          lower('info@pslyachtbrokers.com'),
--          lower('steve@flagshipmarinesurvey.com'),
--          lower('info@usaaircraft.com'),
--          lower('info@smokymountaintraders.com')
--        )
--     or company ilike 'Carolina Aircraft%'
--  order by status, company;

commit;
