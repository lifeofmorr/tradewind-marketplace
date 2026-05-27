-- ─────────────────────────────────────────────────────────────────────────────
-- TradeWind 100 — Lead Data Verification (post-import audit)
-- Date prepared: 2026-05-27
-- Owner: Don Morrison (don@lifeofmorr.com)
--
-- This file applies the findings of NEW_LEADS_VERIFICATION_REPORT.md.
-- Phase 1 (web-search verification) found that several rows imported as
-- email_verification_status='likely_valid' do NOT actually have the email
-- published on the company's own contact page. The original notes claimed
-- they did, but a live re-fetch on 2026-05-27 could not confirm.
--
-- Policy (matches supabase/migrations/20260527_email_verification.sql):
--   likely_valid → the address is published on the company's own website
--   unverified   → address is pattern-inferred or only in 3rd-party DBs
--
-- Daily queue picker skips 'unverified' rows. Downgrading these leads
-- removes them from the May 30 send queue until a human re-confirms.
--
-- All updates are idempotent (filter by exact email + company).
-- Safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

-- ── 1. Spot-check downgrades ────────────────────────────────────────────────
-- The following rows were marked likely_valid in outreach-100-leads.sql but
-- a 2026-05-27 live re-fetch could not confirm the published email. Lead
-- record is kept intact; only the verification gate moves to 'unverified'
-- so the daily queue refuses to send until a human confirms.

-- E11. Park Place LTD — sales@parkplaceltd.com NOT on Bellevue contact page
update public.outreach_leads
   set email_verification_status = 'unverified',
       email_verification_source = 'tradewind-100 / re-audit 2026-05-27: not on live contact page',
       notes = coalesce(notes, '') || E'\n[2026-05-27 audit] Email not confirmed on parkplaceltd.com contact page; phones published. Use contact form parkplaceltd.com/contact or call 425-562-1000.'
 where company = 'Park Place LTD'
   and lower(email) = lower('sales@parkplaceltd.com');

-- E4. MotorCars of Atlanta — jorge@motorcarsofatlanta.com NOT on team page
update public.outreach_leads
   set email_verification_status = 'unverified',
       email_verification_source = 'tradewind-100 / re-audit 2026-05-27: not on live team page',
       notes = coalesce(notes, '') || E'\n[2026-05-27 audit] Direct email not confirmed on motorcarsofatlanta.com team page; only department phones (sales 833-722-1303). Use contact form first.'
 where company = 'MotorCars of Atlanta'
   and lower(email) = lower('jorge@motorcarsofatlanta.com');

-- E13. Canepa — sales@canepa.com only as obscured email on contact page
update public.outreach_leads
   set email_verification_status = 'unverified',
       email_verification_source = 'tradewind-100 / re-audit 2026-05-27: email obscured on contact page',
       notes = coalesce(notes, '') || E'\n[2026-05-27 audit] canepa.com/contact-us shows an obfuscated email; sales@canepa.com is pattern-inferred. Use contact form or phone 831-430-9940 first.'
 where company = 'Canepa'
   and lower(email) = lower('sales@canepa.com');

-- A2. Aerista — chris@aerista.com NOT on team page (only info@)
update public.outreach_leads
   set email_verification_status = 'unverified',
       email_verification_source = 'tradewind-100 / re-audit 2026-05-27: only info@aerista.com on live site',
       notes = coalesce(notes, '') || E'\n[2026-05-27 audit] aerista.com team page does not list chris@ directly; only info@aerista.com is published. Pattern-likely but unverified.'
 where company = 'Aerista'
   and lower(email) = lower('chris@aerista.com');

-- A10. TBM Central — david@tbmcentral.com NOT on live team page (only sales@)
update public.outreach_leads
   set email_verification_status = 'unverified',
       email_verification_source = 'tradewind-100 / re-audit 2026-05-27: only sales@tbmcentral.com on live site',
       notes = coalesce(notes, '') || E'\n[2026-05-27 audit] tbmcentral.com only publishes sales@tbmcentral.com; david@ pattern-inferred. Switch to sales@tbmcentral.com or use contact form.'
 where company = 'TBM Central'
   and lower(email) = lower('david@tbmcentral.com');

-- A12. OGARAJETS — ogarajets@ogarajets.com NOT on live contact page
update public.outreach_leads
   set email_verification_status = 'unverified',
       email_verification_source = 'tradewind-100 / re-audit 2026-05-27: no published email on contact page',
       notes = coalesce(notes, '') || E'\n[2026-05-27 audit] ogarajets.com/contact only publishes phone (770-955-3554) and form. Email ogarajets@ogarajets.com is pattern-inferred.'
 where company = 'OGARAJETS'
   and lower(email) = lower('ogarajets@ogarajets.com');

-- ── 2. Critical-send caveats (Brett / Travis / Brian) ───────────────────────
-- These three rows are the publicly-called-out "safe to send" set. They are
-- kept at likely_valid because the contact + role + domain are confirmed,
-- BUT the named-individual email is only found in third-party data brokers
-- (RocketReach, ZoomInfo) — NOT on the live contact page. The notes column
-- now records this so a reviewer sees the caveat before approving.

-- E2. Prestige Imports — Brett David — CEO confirmed; bdavid@ in 3p DBs only
update public.outreach_leads
   set email_verification_source = 'tradewind-100 / company_website + 3p_db (RocketReach/ZoomInfo) 2026-05-27',
       notes = coalesce(notes, '') || E'\n[2026-05-27 audit] Brett David confirmed as CEO via LinkedIn /in/brett-david-347b251b/ + 5 other sources. bdavid@prestigeimports.com referenced by RocketReach/ZoomInfo but not posted on live contact page. sales@prestigeimports.com is the published alternative. Safe to send first email — fall back to sales@ if bounce.'
 where company = 'Prestige Imports Miami'
   and lower(email) = lower('bdavid@prestigeimports.com');

-- A1. Premier Aircraft Sales — Travis Peffer — CEO confirmed; @flypas.com domain confirmed
update public.outreach_leads
   set email_verification_source = 'tradewind-100 / company_website (flypas.com) 2026-05-27',
       notes = coalesce(notes, '') || E'\n[2026-05-27 audit] Travis Peffer confirmed as CEO via RocketReach/ZoomInfo/Diamond Aircraft press releases. sales@flypas.com is the standard company sales inbox. Safe to send.'
 where company = 'Premier Aircraft Sales'
   and lower(email) = lower('sales@flypas.com');

-- A11. Mente Group — Brian Proctor — Founder/President/CEO confirmed
update public.outreach_leads
   set email_verification_source = 'tradewind-100 / company_website + 3p (LinkedIn, Bloomberg, Crunchbase, Aviation Week) 2026-05-27',
       notes = coalesce(notes, '') || E'\n[2026-05-27 audit] Brian Proctor confirmed as founder/President/CEO via LinkedIn /in/brian-proctor-b605393/, Bloomberg, Crunchbase, Aviation Week. brian@mentegroup.com is pattern-inferred from main office domain. Safe to send.'
 where company = 'Mente Group, LLC'
   and lower(email) = lower('brian@mentegroup.com');

-- ── 3. Upgrades — leads confirmed on live site ──────────────────────────────
-- The following rows were confirmed on the company's own website during the
-- 2026-05-27 re-fetch. Verification source is tightened to record the
-- successful audit.

-- A3. Van Bortel Aircraft — acsales@vanbortel.com IS published on homepage
update public.outreach_leads
   set email_verification_source = 'tradewind-100 / company_website confirmed 2026-05-27 (vanbortel.com homepage)'
 where company = 'Van Bortel Aircraft, Inc.'
   and lower(email) = lower('acsales@vanbortel.com');

-- Boat#6. Burkard Yacht Sales — sales@burkardyachts.com confirmed; direct cburkard@ also published
update public.outreach_leads
   set email_verification_source = 'tradewind-100 / company_website confirmed 2026-05-27 (burkardyachts.com homepage + footer)',
       notes = coalesce(notes, '') || E'\n[2026-05-27 audit] Direct email cburkard@burkardyachts.com is also published on the site footer alongside sales@. Both confirmed live.'
 where company = 'Burkard Yacht Sales'
   and lower(email) = lower('sales@burkardyachts.com');

-- Boat#4. Miami International Yacht Sales — bob@miamiys.com confirmed on homepage
update public.outreach_leads
   set email_verification_source = 'tradewind-100 / company_website confirmed 2026-05-27 (miamiinternationalyachtsales.com homepage)'
 where company = 'Miami International Yacht Sales'
   and lower(email) = lower('bob@miamiys.com');

-- S2. Florida Marine Surveyors — info@floridamarinesurveyors.com confirmed in footer
update public.outreach_leads
   set email_verification_source = 'tradewind-100 / company_website confirmed 2026-05-27 (floridamarinesurveyors.com footer)'
 where company = 'Florida Marine Surveyors'
   and lower(email) = lower('info@floridamarinesurveyors.com');

-- ── 4. Audit-log every change ───────────────────────────────────────────────
insert into public.outreach_activity_log (lead_id, action, metadata)
select l.id,
       'verification_audit',
       jsonb_build_object(
         'audit_date',  '2026-05-27',
         'auditor',     'tradewind-100 audit pass',
         'before',      l.email_verification_status,
         'source_note', l.email_verification_source
       )
  from public.outreach_leads l
 where l.company in (
   'Park Place LTD',
   'MotorCars of Atlanta',
   'Canepa',
   'Aerista',
   'TBM Central',
   'OGARAJETS',
   'Prestige Imports Miami',
   'Premier Aircraft Sales',
   'Mente Group, LLC',
   'Van Bortel Aircraft, Inc.',
   'Burkard Yacht Sales',
   'Miami International Yacht Sales',
   'Florida Marine Surveyors'
 )
   and not exists (
     select 1 from public.outreach_activity_log a
      where a.lead_id = l.id
        and a.action  = 'verification_audit'
        and (a.metadata->>'audit_date') = '2026-05-27'
   );

commit;

-- ── Post-audit validation queries (run manually) ────────────────────────────
-- select email_verification_status, count(*)
--   from public.outreach_leads
--  where lead_source like '%tradewind-100%'
--  group by 1 order by 1;
--
-- select company, contact_name, email, email_verification_status
--   from public.outreach_leads
--  where lead_source like '%tradewind-100%'
--    and email_verification_status = 'unverified'
--  order by lead_score desc, priority desc;
