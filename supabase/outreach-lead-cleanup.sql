-- ─────────────────────────────────────────────────────────────────────────────
-- TradeWind 100 — Send-Ready Cleanup
-- Date prepared: 2026-05-27
-- Owner: Don Morrison (don@lifeofmorr.com)
--
-- Applies the verified lead audit (NEW_LEADS_VERIFICATION_REPORT.md) to the
-- workflow `status` column so the dashboard can sort leads into four buckets:
--
--   send_ready          — likely_valid email on file. Safe to draft and queue.
--   needs_review        — pattern-inferred or post-audit downgrade. Human must
--                         confirm the address before drafting.
--   non_email_channel   — no public email. Use LinkedIn / contact form / phone.
--   (do_not_contact=t)  — bounced or otherwise off-limits at the row level.
--
-- We do NOT change the `email_verification_status` column here — that audit
-- is owned by supabase/outreach-lead-verification.sql which already ran.
-- This file only re-shapes the workflow status so the priority queue view
-- on /admin/outreach can lock the daily queue to send_ready leads.
--
-- Scope: the TradeWind 100 batch (lead_source like 'tradewind-100%').
--        The original 30+ batch is untouched.
--
-- Idempotent: every UPDATE re-asserts the target state. Safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

-- ── 1. send_ready — likely_valid email, ready to draft ──────────────────────
-- 66 rows from the audit: every tradewind-100 lead with email present whose
-- email_verification_status is 'likely_valid' after the 2026-05-27 audit pass.
update public.outreach_leads
   set status = 'send_ready'
 where lead_source like 'tradewind-100%'
   and email is not null
   and email_verification_status = 'likely_valid'
   and do_not_contact = false
   and status in ('new', 'send_ready');

-- ── 2. needs_review — email present but unverified ──────────────────────────
-- 16 rows: pattern-inferred addresses, including the 6 post-audit downgrades
-- (Park Place LTD, MotorCars of Atlanta, Canepa, Aerista, TBM Central,
-- OGARAJETS). Human review must confirm the mailbox before any draft.
update public.outreach_leads
   set status = 'needs_review'
 where lead_source like 'tradewind-100%'
   and email is not null
   and email_verification_status = 'unverified'
   and do_not_contact = false
   and status in ('new', 'needs_review');

-- ── 3. non_email_channel — no public email; LinkedIn / form / phone only ─────
-- 18 rows: contact form-only sites and shops that publish phones only.
update public.outreach_leads
   set status = 'non_email_channel',
       next_action = coalesce(
         nullif(next_action, 'send_first_email'),
         'send_linkedin_or_form'
       )
 where lead_source like 'tradewind-100%'
   and email is null
   and do_not_contact = false
   and status in ('new', 'non_email_channel');

-- ── 4. Defensive do-not-contact on the two prior bounces ────────────────────
-- 2026-05-26 sent two info@ addresses that hard-bounced. The address itself
-- is already marked bounced/invalid by 20260527_email_verification.sql; this
-- statement makes sure do_not_contact is true on the row so the queue picker
-- and the dashboard list both exclude them by default.
update public.outreach_leads
   set do_not_contact = true,
       notes = coalesce(notes, '') ||
               E'\n[2026-05-27 cleanup] Hard-bounced 2026-05-26. Address marked invalid.'
 where lower(email) in (
   lower('info@usaaircraft.com'),
   lower('info@smokymountaintraders.com')
 )
   and do_not_contact = false;

-- ── 5. Audit log — record the cleanup pass ──────────────────────────────────
insert into public.outreach_activity_log (lead_id, action, metadata)
select l.id,
       'send_ready_cleanup',
       jsonb_build_object(
         'cleanup_date', '2026-05-27',
         'new_status',   l.status,
         'verification', l.email_verification_status,
         'has_email',    l.email is not null
       )
  from public.outreach_leads l
 where l.lead_source like 'tradewind-100%'
   and not exists (
     select 1 from public.outreach_activity_log a
      where a.lead_id = l.id
        and a.action  = 'send_ready_cleanup'
        and (a.metadata->>'cleanup_date') = '2026-05-27'
   );

commit;

-- ── Post-cleanup validation queries (run manually) ──────────────────────────
-- select status, count(*)
--   from public.outreach_leads
--  where lead_source like 'tradewind-100%'
--  group by 1 order by 1;
--
-- -- expected:
-- --   send_ready        66
-- --   needs_review      16
-- --   non_email_channel 18
--
-- -- and zero non-tradewind-100 rows touched:
-- select count(*) from public.outreach_leads
--  where status in ('send_ready','needs_review','non_email_channel')
--    and (lead_source is null or lead_source not like 'tradewind-100%');
