-- ─────────────────────────────────────────────────────────────────────────────
-- Outreach Reconciliation — 2026-05-26
--
-- Reconciles the 3 emails that were sent manually from don@lifeofmorr.com
-- today. After this script:
--   - Nashville Yacht Brokers + PSL Yacht Brokers → status=contacted,
--     date_contacted=today, follow_up_date=2026-05-29 (3 business days),
--     next_action='wait_for_reply', outreach_messages row sent, follow-up row
--     due 2026-05-29.
--   - USA Aircraft Brokers → status=bounced, do_not_contact=true (bounced
--     email blacklisted), next_action='research_corrected_contact',
--     outreach_messages row status=bounced. No follow-up created.
--   - One outreach_activity_log row per lead for the audit trail.
--
-- HOW TO RUN:
--   1. First apply the migration that adds the generation_source column:
--        supabase/migrations/20260526_outreach_generation_source.sql
--      (Open Supabase SQL Editor → paste that file → Run.)
--   2. Then open this file → paste → Run.
--   It is idempotent on the messages/log inserts via NOT EXISTS guards, and
--   it scopes everything by lower(email) so re-runs are safe.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

-- ── 1. Update outreach_leads ────────────────────────────────────────────────

-- Nashville Yacht Brokers — delivered
update public.outreach_leads
   set status         = 'contacted',
       date_contacted = current_date,
       follow_up_date = date '2026-05-29',
       next_action    = 'wait_for_reply',
       updated_at     = now()
 where lower(email) = lower('info@nashvilleyachtbrokers.com');

-- PSL Yacht Brokers — delivered
update public.outreach_leads
   set status         = 'contacted',
       date_contacted = current_date,
       follow_up_date = date '2026-05-29',
       next_action    = 'wait_for_reply',
       updated_at     = now()
 where lower(email) = lower('info@pslyachtbrokers.com');

-- USA Aircraft Brokers — bounced
update public.outreach_leads
   set status          = 'bounced',
       date_contacted  = current_date,
       do_not_contact  = true,
       next_action     = 'research_corrected_contact',
       notes           = coalesce(notes || E'\n', '')
                         || '[2026-05-26] info@usaaircraft.com bounced. '
                         || 'Need to find correct contact email or use website form / LinkedIn.',
       updated_at      = now()
 where lower(email) = lower('info@usaaircraft.com');

-- ── 2. Insert outreach_messages (one per lead) ──────────────────────────────

-- Nashville Yacht Brokers — sent
insert into public.outreach_messages
  (lead_id, direction, channel, subject, body, status, approved, approved_at, sent_at, generation_source, meta)
select l.id,
       'outbound',
       'email',
       'TradeWind — quick intro for Nashville Yacht Brokers',
       E'Hey team —\n\nDon Morrison here, founder of TradeWind. We are a marketplace for boats, autos, and aircraft and we are in private beta.\n\nI noticed Nashville Yacht Brokers has a strong inventory across mid-Tennessee — exactly the kind of broker I want on the network early.\n\nWe offer dealers a clean profile, AI-built listing descriptions from your existing photos and notes, and a feed of buyer requests already filtered for your inventory. Free for 60 days during beta. No fee until you see real lead flow.\n\nWould you be open to a quick 10-minute look and giving honest feedback?\n\nIf this is not relevant, no worries — just tell me and I will not follow up.\n\n— Don\nTradeWind',
       'sent',
       true,
       now(),
       now(),
       'manual',
       jsonb_build_object(
         'source', 'manual_send',
         'from_address', 'don@lifeofmorr.com',
         'delivery_status', 'delivered',
         'reconciled_at', now()::text,
         'generation_source', 'manual'
       )
  from public.outreach_leads l
 where lower(l.email) = lower('info@nashvilleyachtbrokers.com')
   and not exists (
     select 1 from public.outreach_messages m
      where m.lead_id = l.id
        and m.channel = 'email'
        and m.direction = 'outbound'
        and m.sent_at::date = current_date
   );

-- PSL Yacht Brokers — sent
insert into public.outreach_messages
  (lead_id, direction, channel, subject, body, status, approved, approved_at, sent_at, generation_source, meta)
select l.id,
       'outbound',
       'email',
       'TradeWind — quick intro for PSL Yacht Brokers',
       E'Hey team —\n\nDon Morrison here, founder of TradeWind. We are a marketplace for boats, autos, and aircraft and we are in private beta.\n\nPSL Yacht Brokers caught my eye on the Treasure Coast side — Port St. Lucie has steady traffic and your inventory mix looks like the kind of brokerage I want on the platform early.\n\nDealers get a clean profile, AI-built listing descriptions from photos and notes, and buyer requests routed to their actual inventory. Free for 60 days during beta. No fee until you see lead flow.\n\nWould you be open to a quick 10-minute look and giving honest feedback?\n\nIf this is not relevant, no worries — just tell me and I will not follow up.\n\n— Don\nTradeWind',
       'sent',
       true,
       now(),
       now(),
       'manual',
       jsonb_build_object(
         'source', 'manual_send',
         'from_address', 'don@lifeofmorr.com',
         'delivery_status', 'delivered',
         'reconciled_at', now()::text,
         'generation_source', 'manual'
       )
  from public.outreach_leads l
 where lower(l.email) = lower('info@pslyachtbrokers.com')
   and not exists (
     select 1 from public.outreach_messages m
      where m.lead_id = l.id
        and m.channel = 'email'
        and m.direction = 'outbound'
        and m.sent_at::date = current_date
   );

-- USA Aircraft Brokers — bounced
insert into public.outreach_messages
  (lead_id, direction, channel, subject, body, status, approved, approved_at, sent_at, generation_source, meta)
select l.id,
       'outbound',
       'email',
       'TradeWind — quick intro for USA Aircraft Brokers',
       E'Hey team —\n\nDon Morrison here, founder of TradeWind. We are a marketplace for boats, autos, and aircraft and we are in private beta.\n\nUSA Aircraft Brokers stood out — turbine and piston listings under one roof is rare and you have been at it a while.\n\nBrokers on TradeWind get a verified profile, AI-built listing copy, and inbound buyer requests routed to inventory they actually carry. Free for 60 days during beta. No fee until you see real lead flow.\n\nWould you be open to a quick 10-minute look and giving honest feedback?\n\nIf this is not relevant, no worries — just tell me and I will not follow up.\n\n— Don\nTradeWind',
       'bounced',
       true,
       now(),
       now(),
       'manual',
       jsonb_build_object(
         'source', 'manual_send',
         'from_address', 'don@lifeofmorr.com',
         'delivery_status', 'bounced',
         'bounce_reason', 'mailbox_rejected_or_invalid',
         'reconciled_at', now()::text,
         'generation_source', 'manual'
       )
  from public.outreach_leads l
 where lower(l.email) = lower('info@usaaircraft.com')
   and not exists (
     select 1 from public.outreach_messages m
      where m.lead_id = l.id
        and m.channel = 'email'
        and m.direction = 'outbound'
        and m.sent_at::date = current_date
   );

-- ── 3. Create follow-ups for the 2 delivered emails (due 2026-05-29) ────────

insert into public.outreach_followups
  (lead_id, message_id, followup_number, due_date, status)
select l.id,
       m.id,
       1,
       date '2026-05-29',
       'due'
  from public.outreach_leads l
  join public.outreach_messages m
    on m.lead_id = l.id
   and m.channel = 'email'
   and m.direction = 'outbound'
   and m.status = 'sent'
 where lower(l.email) in (
         lower('info@nashvilleyachtbrokers.com'),
         lower('info@pslyachtbrokers.com')
       )
   and not exists (
     select 1 from public.outreach_followups fu
      where fu.lead_id = l.id
        and fu.status = 'due'
   );

-- ── 4. Activity log entries ─────────────────────────────────────────────────

insert into public.outreach_activity_log (lead_id, action, metadata)
select l.id,
       'email_sent_reconciled',
       jsonb_build_object(
         'channel', 'email',
         'delivery_status', 'delivered',
         'from_address', 'don@lifeofmorr.com',
         'reconciled_on', current_date::text
       )
  from public.outreach_leads l
 where lower(l.email) in (
         lower('info@nashvilleyachtbrokers.com'),
         lower('info@pslyachtbrokers.com')
       )
   and not exists (
     select 1 from public.outreach_activity_log a
      where a.lead_id = l.id
        and a.action = 'email_sent_reconciled'
        and a.created_at::date = current_date
   );

insert into public.outreach_activity_log (lead_id, action, metadata)
select l.id,
       'email_bounced',
       jsonb_build_object(
         'channel', 'email',
         'delivery_status', 'bounced',
         'from_address', 'don@lifeofmorr.com',
         'bounced_address', 'info@usaaircraft.com',
         'next_step', 'research_corrected_contact',
         'reconciled_on', current_date::text
       )
  from public.outreach_leads l
 where lower(l.email) = lower('info@usaaircraft.com')
   and not exists (
     select 1 from public.outreach_activity_log a
      where a.lead_id = l.id
        and a.action = 'email_bounced'
        and a.created_at::date = current_date
   );

commit;

-- ── 5. Verification queries (run these after the commit) ────────────────────
-- select company, email, status, date_contacted, follow_up_date, next_action, do_not_contact
--   from public.outreach_leads
--  where lower(email) in (
--    lower('info@nashvilleyachtbrokers.com'),
--    lower('info@pslyachtbrokers.com'),
--    lower('info@usaaircraft.com')
--  );
--
-- select l.company, m.channel, m.status, m.sent_at, m.subject
--   from public.outreach_messages m
--   join public.outreach_leads l on l.id = m.lead_id
--  where m.sent_at::date = current_date
--  order by m.sent_at desc;
--
-- select l.company, fu.followup_number, fu.due_date, fu.status
--   from public.outreach_followups fu
--   join public.outreach_leads l on l.id = fu.lead_id
--  where fu.status = 'due'
--  order by fu.due_date;
