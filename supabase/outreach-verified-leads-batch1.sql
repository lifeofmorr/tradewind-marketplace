-- ─────────────────────────────────────────────────────────────────────────────
-- Verified Lead Batch 1 — Phase 6 of Bounce Control + Verified Outreach Mode.
-- Date prepared: 2026-05-26
--
-- 5 NEW leads that pass the new email-verification gate:
--   email_verification_status = 'likely_valid'
--   (each address was confirmed on the company's own website OR on a
--    public, company-controlled profile page on 2026-05-26.)
--
-- Southeast / Florida / Tennessee mix, varied verticals, no info@ generic
-- inboxes — every row targets a named decision-maker.
--
-- Mix:
--   - Yacht broker (St. Pete, FL):     1
--   - Aircraft broker (Sarasota, FL):  1
--   - Classic auto dealer (Nashville): 1
--   - Marine surveyor (Jupiter, FL):   1
--   - Marine surveyor (Nokomis, FL):   1
--
-- These rows DO NOT trigger any sends. They land as status='new',
-- next_action='send_first_email'. Don approves on the dashboard before the
-- daily queue picks them up.
--
-- HOW TO RUN (after Phase 3 migration is applied):
--   Supabase SQL Editor → paste → Run. Idempotent on lower(email).
-- ─────────────────────────────────────────────────────────────────────────────

begin;

-- ── 1. Tampa Yacht Sales — Shane Faunce — St. Petersburg, FL ───────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Tampa Yacht Sales', 'Shane Faunce', 'President & Yacht Broker', 'yacht_broker',
   'shane@tampayachtsales.com', '+17276475557', 'tampayachtsales.com',
   'St. Petersburg, FL',
   'website (tampayachtsales.com/profile/shane-faunce, 2026-05-26)', 5, 5,
   'Founder-operated brokerage since 2002; ~200 sales career; St. Pete waterfront office at 360 Central Ave matches our Florida boat lead-flow corridor.',
   'A 20+ year founder-led brokerage has long-tail inventory and repeat clients that benefit from a curated buyer feed instead of generic listing aggregators.',
   'Free verified-broker profile + AI listing copy + filtered buyer requests during 60-day beta. No fee until real lead flow.',
   'new', 'send_first_email',
   'Direct email verified on the broker''s own profile page on tampayachtsales.com (2026-05-26). Shane is identified as President & Yacht Broker per his profile copy ("over 20 years in the boating business; started in 2002").',
   'likely_valid', 'company_website_profile_page_2026-05-26', now())
on conflict do nothing;

-- ── 2. International Aircraft Marketing & Sales — James Perkins — Sarasota ─
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('International Aircraft Marketing & Sales',
   'James Perkins', 'President & Co-Owner', 'aircraft_broker',
   'james@intlams.com', '+19417268953', 'intlams.com',
   'Sarasota, FL',
   'website (intlams.com/company, 2026-05-26)', 5, 5,
   'Global aircraft brokerage and acquisition firm out of Sarasota — co-owner-operated with a named senior sales team. Matches our Southeast aircraft-broker target profile.',
   'Multi-broker shops with public team pages need a buyer-feed channel that does not require every broker to maintain their own aggregator listings.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta. No fee until real lead flow.',
   'new', 'send_first_email',
   'Direct email and phone verified on the company''s own "Company" page on 2026-05-26. James and Celia Perkins are listed as co-owners (President and Executive President). Paired with the Sarasota geographic fit.',
   'likely_valid', 'company_website_company_page_2026-05-26', now())
on conflict do nothing;

-- ── 3. Nashville Speed Shop — Adam Rottero — Nashville, TN ─────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Nashville Speed Shop', 'Adam Rottero', 'Owner', 'classic_auto_dealer',
   'adam@nashvillespeedshop.com', '+16159694561', 'nashvillespeedshop.com',
   'Nashville, TN',
   'website + multi-aggregator (nashvillespeedshop.com/aboutus + Cars.com + BBB profile, 2026-05-26)', 4, 4,
   'Owner-operated muscle / speed shop dealer in Nashville — same Middle-TN classic-auto corridor as Maple Motors and Smoky Mountain Traders. Adam is named publicly across dealer aggregators.',
   'Owner-operated classic dealers post to multiple aggregators (Cars.com, Classics on Autotrader, Facebook Marketplace) — a single profile that routes filtered buyer requests is a real time-saver.',
   'Free dealer profile + AI listing copy from photos and notes + buyer-routed requests during 60-day beta. No fee until real lead flow.',
   'new', 'send_first_email',
   'Direct named-owner email confirmed across Cars.com, ContactOut, and the dealer''s own About page on 2026-05-26. Backed up by phone (615-969-4561) and physical address (5209 Pennsylvania Ave, Nashville TN 37209) — multiple third-party agreements.',
   'likely_valid', 'multi_source_company_site_and_aggregators_2026-05-26', now())
on conflict do nothing;

-- ── 4. Stem to Stern Marine Surveying — Butch Immediato — Jupiter, FL ──────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Stem to Stern Marine Surveying, LLC',
   'Ross "Butch" Immediato, Jr.', 'Principal Surveyor (SAMS AMS #1066)', 'marine_surveyor',
   'butcheye@gmail.com', '+15619192990', 'stemtosternsurvey.com',
   'Jupiter, FL',
   'website (stemtosternsurvey.com, 2026-05-26)', 5, 5,
   'SAMS AMS #1066 principal on the Treasure Coast / Palm Beach corridor — east-coast complement to our existing west-coast surveyor leads (Flagship, Taylor). Covers Jupiter / Stuart / Palm Beach feeder geography.',
   'Independent surveyors get most jobs via broker referrals; an inbound feed from a marketplace closing real boats is novel and the work is well-paid.',
   'Free surveyor partner profile + buyer-routed survey requests during 60-day beta. No fee until real volume.',
   'new', 'send_first_email',
   'Email and phone verified on the surveyor''s own website on 2026-05-26. Gmail address but it IS the published business address on the company site — meets the deliverability rule for company-published personal-domain addresses. SAMS AMS credential #1066 visible on the site footer.',
   'likely_valid', 'company_website_2026-05-26', now())
on conflict do nothing;

-- ── 5. Williamson Marine Surveyors — Joseph M. Williamson — Nokomis, FL ────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Williamson Marine Surveyors LLC',
   'Joseph M. Williamson', 'Accredited Marine Surveyor (SAMS #737)', 'marine_surveyor',
   'joewillsurvey@gmail.com', '+18136411001', 'joewillsurvey.com',
   'Nokomis, FL',
   'website (joewillsurvey.com/location-info, 2026-05-26)', 4, 4,
   'SAMS-credentialed (#737) surveyor on the Sarasota / Venice / Charlotte Harbor stretch — covers the gap between our Tampa Bay and Naples surveyor coverage.',
   'Solo SAMS surveyors are the gold standard for buyer confidence but rely on broker phone calls; an inbound buyer-survey-request channel is novel.',
   'Free surveyor partner profile + buyer-routed survey requests during 60-day beta. No fee until real volume.',
   'new', 'send_first_email',
   'Email and phone verified on the surveyor''s own location-info page on 2026-05-26. Address is a gmail handle but it is the address printed on the company''s own site (same pattern as Taylor Marine Surveying in batch 1). SAMS #737 credential visible on the site.',
   'likely_valid', 'company_website_2026-05-26', now())
on conflict do nothing;

-- ── Activity log ───────────────────────────────────────────────────────────
insert into public.outreach_activity_log (lead_id, action, metadata)
select l.id,
       'lead_added',
       jsonb_build_object(
         'batch',          'verified-leads-batch-1',
         'verification',   'likely_valid',
         'sourced_on',     '2026-05-26',
         'phase',          'bounce-control-verified-outreach'
       )
  from public.outreach_leads l
 where lower(l.email) in (
   lower('shane@tampayachtsales.com'),
   lower('james@intlams.com'),
   lower('adam@nashvillespeedshop.com'),
   lower('butcheye@gmail.com'),
   lower('joewillsurvey@gmail.com')
 )
   and not exists (
     select 1 from public.outreach_activity_log a
      where a.lead_id = l.id
        and a.action  = 'lead_added'
        and (a.metadata->>'batch') = 'verified-leads-batch-1'
   );

commit;
