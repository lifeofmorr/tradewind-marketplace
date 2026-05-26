-- ─────────────────────────────────────────────────────────────────────────────
-- Outreach Next Batch — 10 new leads, prepared 2026-05-26
--
-- Every row in this file uses an email that was sourced directly from the
-- company's own website unless explicitly noted in the row's `notes`. None
-- of the 10 duplicate the existing 20 leads (different domains).
--
-- Mix (vs. the requested mix):
--   - Yacht / boat brokers (Southeast):  3   ✓
--   - Classic / exotic auto dealers:     1   ⚠ (only 1 verified; see note below)
--   - Aircraft brokers:                  2   ✓
--   - Service providers (surveyor x2, transport x1): 3   ✓ (1 over)
--   - Lender / insurance / escrow:       1   ✓
--   - TOTAL:                             10
--
-- ⚠ Exotic auto dealer slot: Marino Performance Motors (West Palm Beach) is
--   a strong candidate but their direct email could not be verified from the
--   company's own pages — only via third-party data aggregators. Rather than
--   send to an unverified address, this batch leaves the exotic slot at 1.
--   See the "candidate (NOT inserted)" block at the bottom of this file for
--   the research breadcrumb so Don can verify and insert manually later.
--
-- All rows are inserted with status='new', next_action='send_first_email',
-- do_not_contact=false. ON CONFLICT DO NOTHING by lower(email) — safe to
-- re-run.
--
-- HOW TO RUN:
--   Open Supabase SQL Editor → New query → paste this file → Run.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

-- ── 1. Preferred Yachts — St. Petersburg, FL ────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes)
values
  ('Preferred Yachts', 'Joe', 'Owner / Lead Broker', 'yacht_broker',
   'joe@preferredyachts.com', '+17275272800', 'preferredyachts.com',
   'St. Petersburg, FL',
   'website (preferredyachts.com/contact-us, 2026-05-26)', 4, 4,
   'Full-service brokerage since 1984 out of Harborage Marina — long-standing Southeast presence and CPYB / IYBA credentials displayed on their team page.',
   'A 40+ year independent brokerage likely has long-tail inventory and repeat-client deal flow that would benefit from a curated buyer feed instead of generic listing sites.',
   'Free profile + AI listing copy + filtered buyer requests during 60-day beta.',
   'new', 'send_first_email',
   'Verified contact email on the company''s own contact page on 2026-05-26.')
on conflict do nothing;

-- ── 2. Fillingham Yacht Sales — St. Petersburg, FL ──────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes)
values
  ('Fillingham Yacht Sales', 'Sales Team', 'Brokerage', 'yacht_broker',
   'sales@fillinghamyachts.com', '+17274605687', 'fillinghamyachts.com',
   'St. Petersburg, FL',
   'website (fillinghamyachts.com, 2026-05-26)', 4, 4,
   '200 Beach Drive NE storefront with a small named broker team (Rob, Micki, Mike, Al Lima visible on the site) — boutique presence in downtown St. Pete.',
   'Boutique brokerages with named brokers usually compete on relationship, not search volume — a curated buyer-request feed would meet them where they already work.',
   'Free profile during beta, AI listing copy from existing photos, no fee until real lead flow.',
   'new', 'send_first_email',
   'Verified sales@ email on the company site on 2026-05-26.')
on conflict do nothing;

-- ── 3. Yacht Experts of Tampa Bay (J Brothers redirect) — Tampa, FL ────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes)
values
  ('Yacht Experts of Tampa Bay', 'Michael', 'Lead Broker', 'yacht_broker',
   'info@yachtexpertstampabay.com', '+17272282627', 'yachtexpertstampabay.com',
   'Tampa, FL',
   'website (yachtexpertstampabay.com, 2026-05-26)', 3, 3,
   'Tampa Bay coverage spanning Tampa, St. Pete, Clearwater, Sarasota — broad regional footprint with a single-broker feel from the testimonials.',
   'Regional one-broker shops are the highest-leverage early adopters for a buyer-request feed — every routed lead matters.',
   'Free profile + AI listing copy + buyer-request feed for 60 days, no fee until real lead flow.',
   'new', 'send_first_email',
   'jbrothersyachtsales.com 301-redirects to this domain. Verified email on the company site on 2026-05-26.')
on conflict do nothing;

-- ── 4. Maple Motors — Hendersonville, TN (classic) ──────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes)
values
  ('Maple Motors', 'Jim Fites', 'Owner', 'classic_dealer',
   'maplemotors@aol.com', '+16158224444', 'maplemotors.com',
   'Hendersonville, TN',
   'website (maplemotors.com, 2026-05-26)', 4, 4,
   'Family-owned classic/custom/hot-rod dealer in Hendersonville for 27+ years — Tennessee local, founder still active (Jim Fites).',
   'Classic dealers often rely on word-of-mouth and Hemmings — a buyer-request feed scoped to classics is novel and easy to evaluate.',
   'Free profile during beta + AI-built listing copy from existing photos + national buyer routing for classics, no fee until real flow.',
   'new', 'send_first_email',
   'Owner name and email verified on the company site (and BBB) on 2026-05-26. AOL address — verify before sending to confirm it is still monitored.')
on conflict do nothing;

-- ── 5. Lone Mountain Aircraft — Vandalia, OH + Knoxville TN sales ──────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes)
values
  ('Lone Mountain Aircraft', 'Mark Rogers', 'CEO', 'aircraft_broker',
   'info@lonemtn.com', '+18885663686', 'lonemountainaircraft.com',
   'Vandalia, OH (HQ) — Knoxville TN sales presence (Mark Egan)',
   'website (lonemountainaircraft.com/contact-team, 2026-05-26)', 4, 4,
   'Late-model piston and light turbine specialists with regional sales reps across the country, including a Knoxville rep — exactly the buyer-routing profile we want on the network.',
   'A multi-region sales team needs a lead-routing layer per region; right now they likely depend on Controller / Trade-A-Plane.',
   'Free verified-broker profile during beta + AI listing copy + buyer-request feed by region, no fee until real flow.',
   'new', 'send_first_email',
   'info@lonemtn.com verified on the company team page on 2026-05-26. CEO Mark Rogers is publicly listed; default the first email to info@, then route to mark@lonemtn.com on follow-up if no reply.')
on conflict do nothing;

-- ── 6. Altivation Aircraft — Colorado + western Florida ────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes)
values
  ('Altivation Aircraft', 'Sales Team', 'Brokerage', 'aircraft_broker',
   'info@altivationaircraft.com', '+18778840359', 'altivationaircraft.com',
   'Colorado + western Florida',
   'website (altivationaircraft.com, 2026-05-26)', 4, 4,
   'Owner-flown piston / turboprop / business-jet brokerage with a Florida presence — small enough to talk to the principal, big enough to actually move planes.',
   'Owner-flown aircraft buyers are exactly the audience that asks "who do I trust" — a curated marketplace with verified broker profiles is a real fit.',
   'Free verified-broker profile during beta + AI listing copy + buyer feed across boats/autos/aircraft, no fee until real flow.',
   'new', 'send_first_email',
   'info@ verified on the company site on 2026-05-26; sales@altivationaircraft.com also documented in their public materials and works as a fallback.')
on conflict do nothing;

-- ── 7. Flagship Marine Survey — St. Petersburg, FL ──────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes)
values
  ('Flagship Marine Survey', 'Steve Heinrich', 'Principal Marine Surveyor (SAMS AMS)', 'marine_surveyor',
   'steve@flagshipmarinesurvey.com', '+17152550515', 'flagshipmarinesurvey.com',
   'St. Petersburg, FL',
   'website (flagshipmarinesurvey.com/contact-us, 2026-05-26)', 5, 5,
   'SAMS AMS principal covering Tampa Bay including Clearwater, Sarasota, Bradenton — the geographic spine for our Florida boat lead flow.',
   'Independent surveyors get most leads via broker referrals and forums; an inbound feed from a marketplace closing real boats is novel.',
   'Free surveyor partner profile + buyer-routed survey requests during beta, no fee until real volume.',
   'new', 'send_first_email',
   'Verified named-broker email on the company contact page on 2026-05-26. SAMS AMS credential confirmed on the site.')
on conflict do nothing;

-- ── 8. Taylor Marine Surveying & Consulting — Tampa, FL ─────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes)
values
  ('Taylor Marine Surveying & Consulting, LLC', 'Lee Taylor', 'Principal Surveyor (NAMS-CMS, SAMS-AMS, ABYC)', 'marine_surveyor',
   'yacht.surveyor.fla@gmail.com', '+18884540017', 'taylormarinesurveying.com',
   'Tampa / Sarasota Bay, FL',
   'website (taylormarinesurveying.com/About.html, 2026-05-26)', 4, 4,
   'Holds both NAMS-CMS and SAMS-AMS — rare double credential. Long-time Tampa / Sarasota surveyor.',
   'Solo surveyors with both credentials are the gold standard but get found by accident — a marketplace can route to them deliberately.',
   'Free surveyor partner profile + buyer-routed survey requests during beta, no fee until real volume.',
   'new', 'send_first_email',
   'Verified email on the company About page on 2026-05-26. Address is a gmail handle but it is the address printed on the company''s own site.')
on conflict do nothing;

-- ── 9. US Boat Transport Inc. — Lake Helen, FL ──────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes)
values
  ('US Boat Transport Inc.', 'Operations Team', 'Transport Operator', 'transport',
   'usboattransport68@yahoo.com', '+13862280006', 'usboattransportinc.com',
   'Lake Helen, FL (Daytona / DeLand / Orlando service area)',
   'website (usboattransportinc.com/contact.html, 2026-05-26)', 3, 3,
   '25+ years moving boats throughout the Southeast — exactly the transport partner we need when marketplace deals close and need a hauler.',
   'Independent transporters operate on direct calls and Facebook groups — a routed-deal feed from a marketplace is incremental volume they did not have to chase.',
   'Free transport partner profile + buyer-routed transport requests during beta, no fee until real volume.',
   'new', 'send_first_email',
   'Verified yahoo address on the company contact page on 2026-05-26. Older domain / informal email — confirm reply latency before scaling outreach.')
on conflict do nothing;

-- ── 10. Intercoastal Financial Group (BoatLoan.com) — Vero Beach, FL ────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes)
values
  ('Intercoastal Financial Group (BoatLoan.com)', 'Chris Berkeley', 'Loan Specialist', 'lender',
   'cberkeley@boatloan.com', '+17725598588', 'boatloan.com',
   'Vero Beach, FL',
   'public web (BoatLoan.com / forum mention referencing Chris Berkeley), 2026-05-26', 3, 3,
   'Established marine lender (boatloan.com confirmed as Intercoastal Financial Group) — Vero Beach base, Southeast focus, recreational marine specialty.',
   'Marine lenders want serious in-market buyers; a marketplace that surfaces real "I am about to buy" intent is a higher-quality lead than a Google form.',
   'Free partner profile + routed financing inquiries during beta, no fee until real deal flow.',
   'new', 'send_first_email',
   'cberkeley@boatloan.com was sourced from public listings (boating forum referencing him). Confirm the address still answers before sending; if not, fall back to the company''s main 888-690-5626 line.')
on conflict do nothing;

commit;

-- ── Verification ────────────────────────────────────────────────────────────
-- select company, vertical, email, lead_score, priority, status, next_action
--   from public.outreach_leads
--  where created_at::date = current_date
--  order by lead_score desc, priority desc;

-- ─────────────────────────────────────────────────────────────────────────────
-- CANDIDATE — NOT INSERTED (needs email verification first)
--
-- Marino Performance Motors — West Palm Beach, FL — exotic_dealer
--   Phone: 561-296-7989
--   Address: 4190 Okeechobee Blvd, West Palm Beach, FL 33409
--   Founder: Greg Marino (2010). Operating Partner: Gil Courchene.
--   Domain alias: marinopm.com (used internally per third-party aggregators).
--   Email pattern: third-party sources document {first}@marinopm.com (e.g.
--   Dolores@marinopm.com, J@marinopm.com) but their own website does not
--   publicly list any email. Before inserting, Don should either:
--     (a) submit the website contact form to surface a real reply-to
--         (https://www.marinoperformancemotors.com/contact-marino-performance-motors-in-west-palm-beach-fl/),
--     (b) DM Greg Marino on LinkedIn, or
--     (c) call 561-296-7989 ext 111 (Alejandro) to ask the right sales inbox.
--   Once verified, add an INSERT block here with vertical='exotic_dealer'
--   and lead_score=4.
-- ─────────────────────────────────────────────────────────────────────────────
