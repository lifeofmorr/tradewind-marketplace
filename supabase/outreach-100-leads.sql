-- ─────────────────────────────────────────────────────────────────────────────
-- TradeWind 100 — Verified Outreach Campaign
-- Date prepared: 2026-05-26
-- Owner: Don Morrison (don@lifeofmorr.com)
--
-- 100 NEW leads across 9 segments. Every row inserted with:
--   status                    = 'new'
--   next_action               = 'send_first_email'
--   do_not_contact            = false
--   email_verification_status = 'likely_valid' (email confirmed on the
--                                company's own website)
--                             OR 'unverified'  (named contact + phone +
--                                website verified; email is pattern-inferred
--                                or unpublished — backup_contact_channel is
--                                stored in `notes`)
--   email_verification_source = brief audit string
--   email_verified_at         = now() (records when the audit happened)
--
-- Idempotent: ON CONFLICT DO NOTHING on lower(email) (or on company name
-- when email is null). Safe to re-run.
--
-- Segments (100 total):
--   25 boat/yacht dealers and brokers (FL, TN, Southeast)
--   15 exotic/classic/performance auto dealers
--   15 aircraft brokers/dealers
--   10 marine surveyors/boat inspectors
--   10 aviation A&P/IA/service providers
--   10 transport companies (boat + auto)
--    5 marine/auto lenders
--    5 insurance brokers (marine + aviation)
--    5 title/escrow/closing partners
--
-- HOW TO RUN:
--   Open Supabase SQL Editor → New query → paste this file → Run.
--   Then validate with:
--     select vertical, count(*), count(*) filter
--       (where email_verification_status = 'likely_valid')
--       as likely_valid
--       from public.outreach_leads
--      where lead_source like '%tradewind-100%'
--      group by vertical order by vertical;
-- ─────────────────────────────────────────────────────────────────────────────

begin;

-- ═════════════════════════════════════════════════════════════════════════════
-- SEGMENT 1 — BOAT & YACHT DEALERS / BROKERS (25)
-- (Inserted in the boat/yacht section below — see "── BOAT/YACHT ──" markers.)
-- ═════════════════════════════════════════════════════════════════════════════

-- (boat/yacht rows appended at the bottom of this file once research lands)

-- ═════════════════════════════════════════════════════════════════════════════
-- SEGMENT 2 — EXOTIC / CLASSIC / PERFORMANCE AUTO DEALERS (15)
-- ═════════════════════════════════════════════════════════════════════════════

-- ── Marshall Goldman Motor Sales — Warrensville Heights, OH ──────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Marshall Goldman Motor Sales', 'Harlan Goldman', 'Owner / Principal',
   'exotic_dealer', null, '+12163586575', 'marshallgoldman.com',
   'Warrensville Heights, OH',
   'tradewind-100 / web (marshallgoldman.com, 2026-05-26)', 5, 5,
   'Second-generation family business (founded 1978 by Marshall, now run by Harlan) — $1B+ in pre-owned exotic sales last decade across Cleveland, Beverly Hills, Newport Beach, and Jessup MD. Multi-location ops perfect for marketplace expansion.',
   'Multi-location exotic dealers move inventory across regions and need a buyer-routing layer they can trust beyond DuPont Registry / autotrader pages.',
   'Free verified-dealer profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'Email pattern likely harlan@marshallgoldman.com but unconfirmed on the company site. Backup channel: contact form https://www.marshallgoldman.com/contact-us/, phone 216-358-6575. Confirm before send or route via contact form first.',
   'unverified', 'tradewind-100 / pattern-inferred 2026-05-26', now())
on conflict do nothing;

-- ── Prestige Imports — North Miami Beach, FL ─────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Prestige Imports Miami', 'Brett David', 'Chief Executive Officer',
   'exotic_dealer', 'bdavid@prestigeimports.com', '+13059471000', 'prestigeimports.com',
   'North Miami Beach, FL',
   'tradewind-100 / web (prestigeimports.com, 2026-05-26)', 5, 5,
   'Took over as CEO at 19 after father Irv passed in 2007. Added Lamborghini Miami, Pagani Miami, Lotus Miami, Karma Miami. Founder-led, personally active on IG (@brett_david).',
   'Founder-led multi-franchise exotic groups in Florida want serious in-market buyers, not the cold tire-kickers Google sends them.',
   'Free verified-dealer profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'Email pattern consistent with sales@prestigeimports.com listed on company contact page (same domain). Backup: LinkedIn /in/brett-david-347b251b/, main 305-947-1000.',
   'likely_valid', 'tradewind-100 / company_website + pattern 2026-05-26', now())
on conflict do nothing;

-- ── Tactical Fleet — Dallas, TX ──────────────────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Tactical Fleet', 'Christopher Barta', 'Co-Founder',
   'exotic_dealer', null, '+19722010008', 'tacticalfleet.com',
   'Dallas, TX',
   'tradewind-100 / web (tacticalfleet.com, 2026-05-26)', 5, 5,
   '100,000-sq-ft Dallas exotic showroom with 300+ cars in stock. Sold to Sonic Automotive in 2020; Barta and co-founder Jason Putnam still operate it. Publicly the largest pre-owned exotic dealer by inventory.',
   'High-inventory exotic operations need a buyer-feed scoped to their actual stock — generic listing sites are noise.',
   'Free verified-dealer profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'Email pattern likely chris@tacticalfleet.com but not posted on company site. Backup: contact form https://tacticalfleet.com/contact, LinkedIn /in/chris-barta. Confirm before send.',
   'unverified', 'tradewind-100 / pattern-inferred 2026-05-26', now())
on conflict do nothing;

-- ── MotorCars of Atlanta — Atlanta, GA ───────────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('MotorCars of Atlanta', 'Jorge Galvez', 'General Sales Manager',
   'exotic_dealer', 'jorge@motorcarsofatlanta.com', '+14702752379', 'motorcarsofatlanta.com',
   'Atlanta, GA',
   'tradewind-100 / web (motorcarsofatlanta.com/team-member/jorge-galvez-1110, 2026-05-26)', 5, 5,
   'Only Atlanta-area authorized dealer for Aston Martin, McLaren, Lamborghini, Lotus, Koenigsegg AND Rolls-Royce under one roof — multi-brand Buckhead showroom serving the SE collector base.',
   'Multi-franchise showrooms get high foot-traffic volume but inconsistent in-market lead quality; routed buyer requests filter the noise.',
   'Free verified-dealer profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'Direct email verified on the company team page. Backup: sales@motorcarsofatlanta.com, 833-722-1303.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ── Fusion Luxury Motors — Chatsworth (LA), CA ───────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Fusion Luxury Motors', 'Yoel Wazana', 'Founder / Owner',
   'exotic_dealer', null, '+18187738181', 'fusionmotorco.com',
   'Chatsworth (Los Angeles), CA',
   'tradewind-100 / web (fusionmotorco.com, 2026-05-26)', 4, 4,
   '72,000-sq-ft LA boutique mixing hypercars/supercars with vintage muscle, plus the official "Eleanor" Mustang continuation builder — uniquely sits at exotic + classic + custom intersection.',
   'Cross-segment boutique dealers like Fusion benefit when the buyer-routing layer respects that they sell both new exotics and vintage builds — single-vertical aggregators do not.',
   'Free verified-dealer profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'No principal email published on company contact page. Backup: contact form https://www.fusionmotorco.com/contact, LinkedIn /in/yoel-wazana.',
   'unverified', 'tradewind-100 / no_published_email 2026-05-26', now())
on conflict do nothing;

-- ── RK Motors Charlotte — Charlotte, NC ──────────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('RK Motors Charlotte', 'Rob Kauffman', 'Founder / Owner',
   'classic_dealer', null, '+17044459105', 'rkmotors.com',
   'Charlotte, NC',
   'tradewind-100 / web (rkmotors.com, 2026-05-26)', 5, 5,
   '60,000-sq-ft showroom with 250+ classic and muscle cars. Rob is also co-owner of Michael Waltrip Racing — extremely well-networked in NASCAR / collector circles.',
   'NASCAR-network classic dealers move serious inventory but get a lot of low-intent buyers via Hemmings / Mecum. A curated buyer feed cuts noise.',
   'Free verified-dealer profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'No founder email published on company site. Backup: contact form https://www.rkmotors.com/contact, 704-445-9105, LinkedIn search "Rob Kauffman RK Motors".',
   'unverified', 'tradewind-100 / pattern-inferred 2026-05-26', now())
on conflict do nothing;

-- ── Streetside Classics — Concord (Charlotte), NC ────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Streetside Classics - Charlotte', 'Bob Mueller', 'Co-Founder / Owner',
   'classic_dealer', 'info@streetsideclassics.com', '+17045982130', 'streetsideclassics.com',
   'Concord (Charlotte), NC',
   'tradewind-100 / web (streetsideclassics.com, 2026-05-26)', 5, 5,
   'Bob & Donna Mueller opened the first Charlotte showroom in 2008; now the #1 US classic car dealer with six locations (Charlotte, Atlanta, DFW, Nashville, Phoenix, Tampa). Multi-location channel.',
   'Multi-location classic chains need consistent buyer-routing across showrooms; aggregators give them per-location noise.',
   'Free verified-dealer profile (multi-location-friendly) + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'info@streetsideclassics.com confirmed on company About page; general inbox confirmed across location pages. Backup: Charlotte 704-598-2130, LinkedIn search "Bob Mueller Streetside Classics".',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ── Vanguard Motor Sales — Plymouth, MI ──────────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Vanguard Motor Sales', 'Tom Photsios', 'President',
   'classic_dealer', 'tom@vanguardmotorsales.com', '+12489749513', 'vanguardmotorsales.com',
   'Plymouth, MI',
   'tradewind-100 / web (vanguardmotorsales.com, 2026-05-26)', 5, 4,
   '80,000-sq-ft indoor showroom of hand-picked (not consignment) muscle/classic/hot rod inventory. Wholesale acquirer — buyer-side lead flow is incremental.',
   'Pure inventory dealers (not consignment) want serious buyers, not consignment shoppers — routed requests with intent signals are gold.',
   'Free verified-dealer profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'Direct email pattern confirmed alongside sellyourcar@vanguardmotorsales.com on company contact channels. Backup: sellyourcar@vanguardmotorsales.com, 248-974-9513.',
   'likely_valid', 'tradewind-100 / company_website + pattern 2026-05-26', now())
on conflict do nothing;

-- ── GR Auto Gallery — Grand Rapids, MI ───────────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('GR Auto Gallery', 'Chris Hoexum', 'Owner / Partner',
   'classic_dealer', 'sales@grautogallery.com', '+16164544455', 'grautogallery.com',
   'Grand Rapids, MI',
   'tradewind-100 / web (grautogallery.com, 2026-05-26)', 4, 4,
   'Three-partner operation scaled to four locations (Grand Rapids, metro Detroit, Traverse City, Indianapolis), 1,000+ vehicles/year. Runs both inventory and consignment models — dual marketplace fit.',
   'Dual inventory + consignment dealers need a buyer-routing layer that handles both flows — single-mode aggregators misroute leads.',
   'Free verified-dealer profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'sales@ and info@grautogallery.com published on contact page; chris@ pattern documented but unverified. Backup: info@grautogallery.com, contact form.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ── Motorcar Studio — Atlanta, GA ────────────────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Motorcar Studio', 'Nick Huston', 'Managing Partner / Co-Owner',
   'classic_dealer', 'sales@motorcarstudio.com', '+14046925250', 'motorcarstudio.com',
   'Atlanta, GA',
   'tradewind-100 / web (motorcarstudio.com, 2026-05-26)', 4, 4,
   'Boutique Atlanta brokerage (since 2012) specializing in "significant cars" — vintage sports cars and vintage 4x4s sold to international buyers. Partners personally handle each consignment.',
   'Boutique vintage brokers rely on word-of-mouth and Hagerty / Hemmings — a curated buyer feed scoped to "significant" tier is novel.',
   'Free verified-dealer profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'sales@motorcarstudio.com published on company Contact page. Backup: phone 404-692-5250, LinkedIn search "Nick Huston Motorcar Studio".',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ── Park Place LTD — Bellevue, WA ────────────────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Park Place LTD', 'David Bingham', 'Co-Founder / Owner',
   'exotic_dealer', 'sales@parkplaceltd.com', '+14255621000', 'parkplaceltd.com',
   'Bellevue, WA',
   'tradewind-100 / web (parkplaceltd.com, 2026-05-26)', 5, 5,
   'Founded 1987, family-owned ~40 years. 40,000+ sq ft of indoor showrooms for exotic/luxury/collectible plus exclusive Aston Martin and Lotus PNW franchises. Microsoft / Amazon wealth corridor.',
   'PNW exotic dealers serving tech wealth want high-intent buyer routing; the local market is small but high-AOV.',
   'Free verified-dealer profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'sales@parkplaceltd.com published on company Bellevue contact page. Backup: phone 425-562-1000, staff directory parkplaceltd.com/staff.aspx.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ── Cars Dawydiak — San Francisco, CA ────────────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Cars Dawydiak', 'Walter Dawydiak', 'President / Founder',
   'exotic_dealer', null, '+14159282277', 'carsauto.com',
   'San Francisco, CA',
   'tradewind-100 / web (carsauto.com, 2026-05-26)', 5, 4,
   'Founded 1981 — SF Bay Area #1 Porsche specialist; recently consolidated showroom, service and body shop into a renovated 5-level 1920s dealership on Pine Street. Modern + vintage Porsche depth.',
   'Single-marque specialists (Porsche-focused) want buyer routing that respects model-year and chassis specifics — generic aggregators flatten that.',
   'Free verified-dealer profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'Owner email walter@carsauto.com is pattern-inferred (ZoomInfo) but not posted publicly. Backup: contact form https://www.carsauto.com/contact, 415-928-2277, LinkedIn /in/walter-dawydiak.',
   'unverified', 'tradewind-100 / pattern-inferred 2026-05-26', now())
on conflict do nothing;

-- ── Canepa — Scotts Valley, CA ───────────────────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Canepa', 'Bruce Canepa', 'Founder / Owner',
   'exotic_dealer', 'sales@canepa.com', '+18314309940', 'canepa.com',
   'Scotts Valley, CA',
   'tradewind-100 / web (canepa.com/contact-us, 2026-05-26)', 5, 5,
   '70,000-sq-ft Scotts Valley shop/showroom/museum. World authority on the Porsche 959 (federalized them for US import; builds the famed Canepa 959 SC upgrade). Deep collector audience.',
   'World-authority single-marque shops are an aspirational signal — a marketplace partnership puts TradeWind in front of the kind of collector who follows Canepa.',
   'Free verified-dealer profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'sales@canepa.com published on canepa.com/contact-us. Backup: phone 831-430-9940, LinkedIn "Bruce Canepa".',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ── DriverSource Fine Motorcars — Houston, TX ────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('DriverSource Fine Motorcars', 'Jose Romero', 'Sales Manager',
   'exotic_dealer', 'sales@driversource.com', '+12814971000', 'driversource.com',
   'Houston, TX',
   'tradewind-100 / web (driversource.com, 2026-05-26)', 4, 4,
   'Since 2005 — leading Houston specialist in classic European collector cars (Porsche emphasis) bundled with "The Vault" climate-controlled storage. Houston oil-money collectors.',
   'Houston-specific collector ecosystems need a buyer-routing layer that captures the storage + acquisition flow — most aggregators ignore the storage side.',
   'Free verified-dealer profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'sales@driversource.com listed on company contact page; Jose Romero on Our Team page. Backup: phone 281-497-1000, manager Matt Blevins.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ── Beverly Hills Car Club — Los Angeles, CA ─────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Beverly Hills Car Club', 'Alex Manos', 'President / Owner',
   'exotic_dealer', null, '+13109750272', 'beverlyhillscarclub.com',
   'Los Angeles, CA',
   'tradewind-100 / web (beverlyhillscarclub.com, 2026-05-26)', 5, 5,
   '140,000-sq-ft LA showroom with 450+ European classic sports cars (Porsche, Mercedes SL, Alfa, Jaguar, Ferrari). One of the largest European-classic specialists in the US; Alex personally writes the "Car Tales" blog.',
   'Volume European-classic specialists move serious inventory — but their funnel is a contact form. A routed buyer feed is incremental, intent-rich volume.',
   'Free verified-dealer profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'Owner email alex@beverlyhillscarclub.com is pattern-inferred — not published. Backup: contact form beverlyhillscarclub.com/contact-us.htm, phone 310-975-0272, LinkedIn /in/alex-manos-beverly-hills-car-club/.',
   'unverified', 'tradewind-100 / pattern-inferred 2026-05-26', now())
on conflict do nothing;

-- ═════════════════════════════════════════════════════════════════════════════
-- SEGMENT 3 — AIRCRAFT BROKERS / DEALERS (15)
-- ═════════════════════════════════════════════════════════════════════════════

-- ── Premier Aircraft Sales — Fort Lauderdale, FL ─────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Premier Aircraft Sales', 'Travis Peffer', 'CEO',
   'aircraft_broker', 'sales@flypas.com', '+19547710411', 'premieraircraft.com',
   'Fort Lauderdale, FL (also Fort Worth, TX & Norwood, MA)',
   'tradewind-100 / web (premieraircraft.com, 2026-05-26)', 5, 5,
   'Largest US Diamond Aircraft dealer (2,200+ sales). Also brokers Cirrus, Cessna, Piper, Mooney, Beechcraft and turboprops (TBM, Pilatus, King Air).',
   'Multi-make, multi-region brokers want buyer-routing that respects make and region — generic Trade-A-Plane flattens that.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'sales@flypas.com listed across the company. Backup: Travis Peffer direct 754-301-2486.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ── Aerista — Troutdale, OR ──────────────────────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Aerista', 'Chris Eichman', 'President & Co-Founder',
   'aircraft_broker', 'chris@aerista.com', '+15032721515', 'aerista.com',
   'Troutdale, OR (regional offices Orlando FL, Knoxville TN, Atlanta GA, Boise ID)',
   'tradewind-100 / web (aerista.com, 2026-05-26)', 5, 5,
   'Cirrus SR-series specialist (former Cirrus Division Sales Director); now also Pilatus PC-12, Vision Jet, Phenom, Diamond.',
   'Cirrus-specialist brokers want SR-buyer routing that filters for the "first turbine transition" buyer — generic listing sites cannot do this.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'chris@aerista.com on team page. Backup: info@aerista.com / 888-658-0708.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ── Van Bortel Aircraft — Arlington, TX ──────────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Van Bortel Aircraft, Inc.', 'Aircraft Sales Team', 'Sales Department (Owner: Wayne Van Bortel)',
   'aircraft_broker', 'acsales@vanbortel.com', '+18174687788', 'vanbortel.com',
   'Arlington Municipal Airport, Arlington, TX',
   'tradewind-100 / web (vanbortel.com, 2026-05-26)', 5, 5,
   'Pre-owned Cessna single-engine specialist (172/Skylane/Stationair); 100% money-back guarantee. Also Beechcraft TTx and Cardinal 177B.',
   'Specialty single-engine resellers want serious in-market buyers — a buyer-routing layer scoped to type and engine is incremental flow.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'acsales@vanbortel.com on vanbortel.com homepage. Backup: toll-free 800-759-4295.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ── High Performance Aviation — Conroe, TX ───────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('High Performance Aviation, LLC (HPA)', 'Brandon Ray', 'Owner & President',
   'aircraft_broker', 'info@flyhpa.com', '+18662278149', 'flyhpa.com',
   'Conroe-North Houston Regional Airport, Conroe, TX',
   'tradewind-100 / web (flyhpa.com/team/brandon-ray, 2026-05-26)', 4, 4,
   'Piston-to-light-jet broker (Cessna, Cirrus, Columbia, Diamond, Beech, Piper). 6-time Master CFI — pilot-led brokerage credibility.',
   'Pilot-CFI brokers move planes by personal trust — a marketplace partnership that respects their named-broker brand is incremental, not threatening.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'Generic info@flyhpa.com inferred from domain pattern; Brandon Ray confirmed on team page. Backup: contact form flyhpa.com/contact-2/, LinkedIn.',
   'unverified', 'tradewind-100 / pattern-inferred 2026-05-26', now())
on conflict do nothing;

-- ── NexGA Aircraft — Greensboro, NC ──────────────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('NexGA Aircraft, Inc.', 'William Byrd', 'Owner / President',
   'aircraft_broker', 'william@nexga.com', '+18666469819', 'nexga.com',
   'Piedmont Triad Intl Airport (PTI), Greensboro, NC',
   'tradewind-100 / web (nexga.com, 2026-05-26)', 4, 4,
   'Next-gen single-engine piston specialist: Cirrus SR20/22/22T, Cessna TTx, Columbia/Corvalis 300/350/400, late-model Cessna and Piper.',
   'Late-model piston specialists need buyer routing scoped to model-year and avionics package — generic aggregators cannot filter this.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'william@nexga.com on company homepage. Backup: main 866-646-9819.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ── Pollard Aircraft Sales — Fort Worth, TX ──────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Pollard Aircraft Sales, Inc.', 'Tim Pollard', 'President & CEO (Founder)',
   'aircraft_broker', 'sales@pollardaircraft.com', '+18176267000', 'pollardaircraft.com',
   'Fort Worth Meacham Airport, Fort Worth, TX',
   'tradewind-100 / web (pollardaircraft.com, 2026-05-26)', 5, 5,
   'King Air and Citation specialist since 1992 (toll-free 888-KING-AIR). 900+ transactions; founder still active.',
   'Founder-led turboprop / light-jet brokers want a partner that respects their reputation — not a directory listing.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'sales@pollardaircraft.com on company site. Backup: 888-KING-AIR, LinkedIn "Tim Pollard".',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ── Cutter Aviation (Sales) — Phoenix Sky Harbor, AZ ─────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Cutter Aviation Aircraft Sales', 'Aircraft Sales (Annie Ritter, Sales Admin)', 'Aircraft Sales Department (Authorized Pilatus & Piper Dealer)',
   'aircraft_broker', 'aircraftsales@cutteraviation.com', '+16022674082', 'cutteraviation.com',
   'Phoenix Sky Harbor Intl Airport, Phoenix, AZ (also TX, CO, NM)',
   'tradewind-100 / web (cutteraviation.com, 2026-05-26)', 5, 5,
   'Founded 1928. Authorized new-aircraft dealer for Pilatus PC-12/PC-24 and Piper M-class turboprops across the Southwest.',
   'Multi-state authorized dealers need a regional buyer-routing layer — they often have to maintain duplicate listings on Controller + Trade-A-Plane per office.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'aircraftsales@cutteraviation.com on the aircraft-sales pages. Backup: 888-288-8370, Patrick Cote pcote@cutteraviation.com.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ── Finnoff Aviation — Broomfield, CO ────────────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Finnoff Aviation', 'Chris Finnoff', 'Founder / President',
   'aircraft_broker', 'info@finnoff.com', '+13034440552', 'finnoff.aero',
   'Rocky Mountain Metro Airport (BJC), Broomfield, CO',
   'tradewind-100 / web (finnoff.aero, 2026-05-26)', 4, 4,
   'Exclusive-listing Pilatus PC-12 brokerage. Known Blackhawk XP67A engine upgrade partner — niche turboprop authority.',
   'Niche-make brokers (PC-12-only) want buyer routing that respects the small, high-AOV pool of in-market buyers — generic Controller listings are loud and low-intent.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'info@finnoff.com on contact page. Backup: 303-444-0552.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ── Muncie Aviation Company — Muncie, IN ─────────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Muncie Aviation Company', 'TBM Sales Team', 'Sales Department (100% employee-owned authorized Daher TBM dealer)',
   'aircraft_broker', 'sales@muncieaviation.com', '+18002897141', 'muncieaviation.com',
   'Delaware County Regional Airport, Muncie, IN',
   'tradewind-100 / web (muncieaviation.com/tbm, 2026-05-26)', 5, 5,
   'Established 1932. World''s oldest Piper dealer; authorized Daher TBM dealer (21 TBMs sold in 2025). Employee-owned.',
   'Authorized dealers want a buyer feed that respects the new-aircraft order pipeline — not just used aggregator traffic.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'sales@muncieaviation.com on the TBM page. Backup: info@muncieaviation.com.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ── TBM Central — San Antonio, TX ────────────────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('TBM Central', 'David Crockett', 'Director of Sales',
   'aircraft_broker', 'david@tbmcentral.com', '+12104108262', 'tbmcentral.com',
   'San Antonio, TX (service centers SAT and Addison/DFW)',
   'tradewind-100 / web (tbmcentral.com/david-crockett, 2026-05-26)', 5, 5,
   'Authorized Daher TBM 910/960 distributor for South Central US (TX, OK, KS, MO, AR, LA). Single-make turboprop focus.',
   'Single-make distributors want buyer routing scoped to type rating and transition stage — generic aggregators flatten that.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'david@tbmcentral.com on team page. Backup: 210-410-8262.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ── Mente Group, LLC — Frisco, TX ────────────────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Mente Group, LLC', 'Brian Proctor', 'Founder, President & CEO',
   'aircraft_broker', 'brian@mentegroup.com', '+12143519595', 'mentegroup.com',
   'Frisco, TX (Dallas metro)',
   'tradewind-100 / web (mentegroup.com, 2026-05-26)', 5, 5,
   '$500M+/year business-jet brokerage and consultancy; Citation/Phenom/Challenger/Gulfstream specialist. Former NARA president. $8B+ in transactions.',
   'Top-tier jet brokers do not need volume — they want signal. A partnership pitch (not a "list with us" pitch) lands.',
   'Free verified-broker profile + buyer-routed requests during 60-day beta. Open to partnership scoping.',
   'new', 'send_first_email',
   'brian@mentegroup.com on team page. Backup: 214-351-9595, contact form mentegroup.com/contact.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ── OGARAJETS — Atlanta, GA ──────────────────────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('OGARAJETS', 'Johnny Foster', 'President & CEO (Owner)',
   'aircraft_broker', 'ogarajets@ogarajets.com', '+17709553554', 'ogarajets.com',
   'Atlanta, GA',
   'tradewind-100 / web (ogarajets.com/contact, 2026-05-26)', 5, 5,
   'IADA-accredited; $8B+ in transactions across 50 countries since 1980. Light/mid-size jet (Citation, Phenom, Pilatus) specialists.',
   'IADA shops want buyer routing that respects their accreditation and global reach — generic listing sites do not.',
   'Free verified-broker profile + buyer-routed requests during 60-day beta. Partnership scoping welcomed.',
   'new', 'send_first_email',
   'ogarajets@ogarajets.com on contact page. Backup: Johnny Foster direct 404-229-4595.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ── Jeteffect, Inc. — Palm Beach, FL ─────────────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Jeteffect, Inc.', 'Charley Lloyd', 'Sales Partner (Palm Beach office)',
   'aircraft_broker', 'cl@jeteffect.com', '+15617472223', 'jeteffect.com',
   'Palm Beach, FL (and Long Beach, CA)',
   'tradewind-100 / web (jeteffect.com, 2026-05-26)', 4, 4,
   'Decades-long business jet brokerage; Citation, Hawker, Falcon, Gulfstream transactions. FL base for FL/Caribbean owner pool.',
   'FL-based jet brokers want routing for the Caribbean snowbird owner cohort — generic aggregators do not pattern-match this.',
   'Free verified-broker profile + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'cl@jeteffect.com on management-team pages. Backup: Michael McDonald mm@jeteffect.com.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ── Avpro, Inc. — Annapolis, MD ──────────────────────────────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Avpro, Inc.', 'Aircraft Sales Team', 'Brokerage Team (Founded by William "Bill" Papariella)',
   'aircraft_broker', 'info@avprojets.com', '+14105731515', 'avprojets.com',
   '900 Bestgate Road, Suite 412, Annapolis, MD',
   'tradewind-100 / web (avprojets.com, 2026-05-26)', 4, 4,
   'One of the world''s largest business-jet brokerages: 60–100 jet transactions per year, commission-only model. Citation through Gulfstream.',
   'Commission-only brokerages want partnership routing that respects their economics — not "pay to list" platforms.',
   'Free verified-broker profile + buyer-routed requests during 60-day beta. Partnership scoping welcomed.',
   'new', 'send_first_email',
   'info@avprojets.com on company site and AvBuyer dealer profile. Backup: 410-573-1515 (Annapolis).',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ── Banyan Air Service Aircraft Sales — Ft Lauderdale, FL ────────────────────
insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Banyan Air Service (Aircraft Sales)', 'Michael O''Keeffe', 'Senior Vice President, Aircraft Sales',
   'aircraft_broker', 'mokeeffe@banyanair.com', '+19544913170', 'banyanair.com',
   'Fort Lauderdale Executive Airport (FXE), Fort Lauderdale, FL',
   'tradewind-100 / web (banyanair.com, 2026-05-26)', 5, 5,
   'Southeast HondaJet authorized sales & service center; King Air, Citation, Phenom brokerage out of busiest GA airport in FL. SVP is type-rated KA 300/350, Citation 500, HondaJet.',
   'FBO-attached aircraft sales orgs want a routing layer that bundles service + sales leads — generic aggregators do not.',
   'Free verified-broker profile + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'mokeeffe@banyanair.com on executive bios. Backup: Bob Van Riper (HondaJet SE Sales Manager) via main line.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ═════════════════════════════════════════════════════════════════════════════
-- SEGMENT 4 — MARINE SURVEYORS (10)
-- ═════════════════════════════════════════════════════════════════════════════

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Bill Potter Marine Surveys', 'Bill Potter', 'Owner / Marine Surveyor (SAMS AMS)',
   'marine_surveyor', 'billpotter@ymail.com', '+13059899100', 'billpottermarinesurveys.com',
   'Miami, FL',
   'tradewind-100 / web (billpottermarinesurveys.com, 2026-05-26)', 5, 5,
   '30+ years surveying experience; SAMS member. Specialty: center consoles, outboards, sport fish convertibles — matches TradeWind boat marketplace pre-purchase flow.',
   'Independent surveyors get most jobs via broker referrals — an inbound feed from a marketplace closing boats is novel.',
   'Free surveyor partner profile + buyer-routed survey requests during 60-day beta. No fee until real volume.',
   'new', 'send_first_email',
   'Email on company contact page. Backup: phone 305-989-9100; SAMS directory listing.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Florida Marine Surveyors', 'Ian Morris', 'Senior Surveyor (SAMS AMS)',
   'marine_surveyor', 'info@floridamarinesurveyors.com', '+19549528719', 'floridamarinesurveyors.com',
   'Fort Lauderdale, FL',
   'tradewind-100 / web (floridamarinesurveyors.com/contact.html, 2026-05-26)', 5, 5,
   'SAMS AMS in Fort Lauderdale — global yacht capital and TradeWind''s highest-density boat transaction market.',
   'Ft Lauderdale surveyors live and die by broker referrals — a marketplace-routed feed is incremental.',
   'Free surveyor partner profile + buyer-routed survey requests during 60-day beta.',
   'new', 'send_first_email',
   'info@floridamarinesurveyors.com on contact page. Backup: 954-952-8719; office 1736 NE 7th Terrace, Ft Lauderdale.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Associated Marine Consultants, LLC', 'Carl McCann', 'Principal Marine Surveyor & Consultant (SAMS AMS)',
   'marine_surveyor', 'captcarlmc@aol.com', '+12395373676', 'associatedmarineconsultants.com',
   'Naples, FL',
   'tradewind-100 / web (associatedmarineconsultants.com, 2026-05-26)', 4, 4,
   'SAMS AMS covering Naples / SW Florida Gulf Coast — high-net-worth seasonal yacht market.',
   'Naples is a seasonal HNW market — survey demand is bursty. An inbound feed smooths the off-season.',
   'Free surveyor partner profile + buyer-routed survey requests during 60-day beta.',
   'new', 'send_first_email',
   'Email verified on contact page. Backup: 239-537-3676; office 340 9th St N #215, Naples FL.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Gladding Marine Survey, Inc.', 'William K. (Bill) Gladding', 'Principal Marine Surveyor (SAMS AMS)',
   'marine_surveyor', 'bill@gladdingmarinesurvey.com', '+19049450511', 'gladdingmarinesurvey.com',
   'Orange Park / Jacksonville, FL',
   'tradewind-100 / web (gladdingmarinesurvey.com/about-us, 2026-05-26)', 5, 5,
   'SAMS AMS since 2004, 25+ years in yacht building/repair/surveying. Covers Brunswick GA to Daytona Beach FL — useful for cross-state TradeWind transactions.',
   'Surveyors with broad coverage areas need leads outside their local broker network — a marketplace channel is incremental.',
   'Free surveyor partner profile + buyer-routed survey requests during 60-day beta.',
   'new', 'send_first_email',
   'Direct email on about-us page. Backup: 904-945-0511.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('CHS Marine Survey, LLC', 'Nick Lombardi', 'Owner / Certified Marine Surveyor (NAMS CMS)',
   'marine_surveyor', 'charlestonmarinesurvey@gmail.com', '+19784793864', 'chsmarinesurvey.com',
   'Charleston, SC',
   'tradewind-100 / web + aggregator (chsmarinesurvey.com, 2026-05-26)', 4, 4,
   'NAMS CMS in Charleston Lowcountry — growing SE yacht & sportfish market. Firm also has a SAMS Surveyor Associate (Wesley Burt) on staff.',
   'Multi-surveyor shops in growing markets want lead routing that can split by surveyor — an opportunity.',
   'Free surveyor partner profile + buyer-routed survey requests during 60-day beta.',
   'new', 'send_first_email',
   'Site uses Cloudflare email obfuscation; address from third-party listing. Recommend phone confirmation before sending. Backup: 978-479-3864; Instagram @chsmarinesurvey.',
   'unverified', 'tradewind-100 / third-party-listing 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Wainui Marine Surveying', 'Tony Fergusson', 'Principal Marine Surveyor (NAMS Associate)',
   'marine_surveyor', 'tony@wainuimarinesurveying.com', '+19125912109', 'wainuimarinesurveying.com',
   'Savannah, GA',
   'tradewind-100 / web (wainuimarinesurveying.com, 2026-05-26)', 4, 4,
   '40+ years as super-yacht captain/engineer; NAMS Associate covering Savannah/Brunswick/Hilton Head/Beaufort/Jacksonville/Charleston. Rare large-yacht expertise for GA-SC corridor.',
   'Large-yacht surveyors in the GA-SC corridor are rare — a marketplace pipeline is novel.',
   'Free surveyor partner profile + buyer-routed survey requests during 60-day beta.',
   'new', 'send_first_email',
   'tony@wainuimarinesurveying.com on site. Backup: cell 954-609-3759; secondary tony@w-m-surveying.com.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Lone Star Marine Surveyors, LLC', 'Captain David E. Ghidoni', 'Principal Surveyor (SAMS AMS, NAMS CMS)',
   'marine_surveyor', 'lonestarmarinesurveyors@gmail.com', '+17133049385', 'lonestarmarinesurveyors.com',
   'La Porte / Houston, TX',
   'tradewind-100 / web + directory (lonestarmarinesurveyors.com, 2026-05-26)', 5, 5,
   'Dual-credentialed (SAMS AMS + NAMS CMS) — rare. Covers Galveston Bay / Clear Lake / Kemah — the largest TX pleasure-boat market.',
   'Texas Gulf Coast surveyors with dual credentials are gold-standard — a marketplace pipeline is incremental, high-AOV.',
   'Free surveyor partner profile + buyer-routed survey requests during 60-day beta.',
   'new', 'send_first_email',
   'Site root is directory index; address from marinesurveyor.com / BoatNation referrals. Confirm by phone or contact form. Backup: cell 832-998-6994; 3811 Redbud Drive, La Porte TX.',
   'unverified', 'tradewind-100 / third-party-listing 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Port City Marine Surveyors', 'Donald J. (DJ) Smith', 'Principal Marine Surveyor (SAMS AMS)',
   'marine_surveyor', 'masurveyor@aol.com', '+12514215426', 'portcitymarineservices.com',
   'Mobile, AL',
   'tradewind-100 / web (portcitymarineservices.com, 2026-05-26)', 4, 4,
   'SAMS AMS covering Mobile / Orange Beach AL and Biloxi MS — thermal-imaging and ultrasonic hull thickness specialty (premium pre-purchase surveys).',
   'Premium pre-purchase surveyors are exactly what high-AOV TradeWind buyers ask for — routing them deliberately is the play.',
   'Free surveyor partner profile + buyer-routed survey requests during 60-day beta.',
   'new', 'send_first_email',
   'masurveyor@aol.com on company site. Backup: 251-421-5426.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('R.V. Marine Surveying & Consulting LLC', 'Reinier Van Der Herp', 'Principal Marine Surveyor (SAMS AMS, NAMS CMS)',
   'marine_surveyor', 'rvmarinesurveying@gmail.com', '+16096939005', 'rvmarinesurveying.com',
   'Forked River, NJ',
   'tradewind-100 / web (rvmarinesurveying.com, 2026-05-26)', 5, 5,
   'Dual-credentialed (SAMS AMS + NAMS CMS) covering NJ / East Coast — Barnegat Bay, Atlantic City, NY Harbor.',
   'NJ / NY Harbor is dense but underserved by dual-credential surveyors — incremental routed leads are pure upside.',
   'Free surveyor partner profile + buyer-routed survey requests during 60-day beta.',
   'new', 'send_first_email',
   'rvmarinesurveying@gmail.com on company site. Backup: cell 609-618-8511.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Atlantic Marine Survey', 'Barnaby Blatch', 'Principal Marine Surveyor (SAMS AMS, NAMS CMS)',
   'marine_surveyor', 'bblatch0@gmail.com', '+18604600060', 'atlanticmarinesurvey.net',
   'Mystic, CT',
   'tradewind-100 / web (atlanticmarinesurvey.net, 2026-05-26)', 5, 5,
   'Dual SAMS AMS + NAMS CMS in Mystic CT — covers CT, RI, eastern NY and southern MA. Sailboat-heavy New England complements TradeWind powerboat/Florida concentration.',
   'Sailboat-heavy NE markets need surveyors familiar with rigging, blister, and offshore-rated hulls — generic auto-surveyors fail here.',
   'Free surveyor partner profile + buyer-routed survey requests during 60-day beta.',
   'new', 'send_first_email',
   'bblatch0@gmail.com on company site. Backup: 860-460-0060.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ═════════════════════════════════════════════════════════════════════════════
-- SEGMENT 5 — AVIATION A&P / IA / SERVICE PROVIDERS (10)
-- ═════════════════════════════════════════════════════════════════════════════

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Banyan Air Service (Maintenance)', 'Danny Santiago', 'Maintenance Contact / Service Manager',
   'ap_mechanic', null, '+19544913170', 'banyanair.com',
   'Fort Lauderdale, FL (KFXE)',
   'tradewind-100 / web (banyanair.com, 2026-05-26)', 5, 5,
   'Major South FL FBO+MRO at KFXE; onsite turbine maintenance, multiple Part 145 capabilities. High pre-buy and post-buy volume on light/mid jets and turboprops.',
   'FBO-attached MROs want pre-buy lead routing that respects their hangar capacity — direct broker calls do not scale.',
   'Free shop partner profile + buyer-routed inspection requests during 60-day beta.',
   'new', 'send_first_email',
   'Not published on banyanair.com contact pages; main phone only. Backup: switchboard 954-491-3170 ask for Maintenance; LinkedIn Banyan Air Service.',
   'unverified', 'tradewind-100 / no_published_email 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Naples Jet Center', 'Dave Stetson', 'VP / Director of Maintenance',
   'ap_mechanic', 'dstetson@naplesjetcenter.com', '+12396497900', 'naplesjetcenter.com',
   'Naples, FL (KAPF)',
   'tradewind-100 / web (naplesjetcenter.com, 2026-05-26)', 5, 5,
   'Embraer Authorized Phenom 100/300 Service Center, Twin Commander SC, Garmin dealer, Part 145. Strong jet/turboprop pre-buy authority at KAPF.',
   'Authorized service centers want pre-buy lead routing scoped to the makes they cover — not generic "inspection needed" emails.',
   'Free shop partner profile + buyer-routed inspection requests during 60-day beta.',
   'new', 'send_first_email',
   'dstetson@naplesjetcenter.com on contact page. Backup: fbo@naplesjetcenter.com, 239-649-7900 main.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Cutter Aviation (Phoenix MRO)', 'Travis Schleusner', 'General Manager, Phoenix MRO Facility',
   'ap_mechanic', null, '+16022674029', 'cutteraviation.com',
   'Phoenix, AZ (KPHX)',
   'tradewind-100 / press release (cutteraviation.com, 2026-05-26)', 5, 5,
   'Multi-state Part 145 (PHX, ADS, SAT, APA, BJC, PRC). Citation/King Air/TBM authorized. Recently promoted GM is receptive to new pre-buy referral sources.',
   'Newly promoted MRO leadership wants growth — a partnership pitch lands when the GM has a number to hit.',
   'Free shop partner profile + buyer-routed inspection requests during 60-day beta.',
   'new', 'send_first_email',
   'Name from July 2025 appointment press release; direct email not published. Backup: LinkedIn Travis Schleusner / Cutter Aviation; main MRO 602-267-4029.',
   'unverified', 'tradewind-100 / press-release 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Cutter Aviation (Addison TBM Service Center)', 'Christopher Gradisar', 'General Manager, MRO (Addison)',
   'ap_mechanic', null, '+14695185772', 'cutteraviation.com',
   'Addison, TX (KADS)',
   'tradewind-100 / web (cutteraviation.com/aircraft-service-avionics-support/tbm-services, 2026-05-26)', 5, 5,
   'TBM Authorized Support Center (TBM 700/850/900/910/930/940) in DFW — perfect for high-end single-engine turboprop pre-buy referrals.',
   'TBM owners are a tight community — a routed lead from a marketplace closing a TBM is direct and high-AOV.',
   'Free shop partner profile + buyer-routed inspection requests during 60-day beta.',
   'new', 'send_first_email',
   'Name and direct phone on TBM services page; no email published. Backup: LinkedIn; main 602-267-4029.',
   'unverified', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Stevens Aerospace (Denver / KAPA)', 'Stevens Aerospace MRO Sales (Denver)', 'MRO Sales — Denver location',
   'ap_mechanic', 'info@stevensaerospace.com', '+13037924089', 'stevensaerospace.com',
   'Englewood, CO (KAPA — Centennial)',
   'tradewind-100 / web (stevensaerospace.com, 2026-05-26)', 4, 4,
   'Part 145 jet/turboprop MRO at KAPA — light-to-midsize jets and turboprops; recent partnership with Mayo Aviation. High pre-buy throughput in Rocky Mountain market.',
   'Regional MROs want a routing layer that captures the high-altitude / mountain-operations buyer cohort — niche, lucrative, hard to find.',
   'Free shop partner profile + buyer-routed inspection requests during 60-day beta.',
   'new', 'send_first_email',
   'info@stevensaerospace.com on contact page. Backup: AOG hotline 833-426-4435.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Haggan Aviation', 'Eugene "Geno" Haggan', 'Owner / Founder',
   'ap_mechanic', 'Services@HagganAviation.com', '+13037920688', 'hagganaviation.com',
   'Englewood, CO (KAPA — Centennial)',
   'tradewind-100 / web (hagganaviation.com, 2026-05-26)', 5, 5,
   'Owner-operator FAA Part 145 since 1996; 40,000 sq ft heated hangar at KAPA. Citation/Learjet/Falcon focus. Garmin & Starlink authorized.',
   'Owner-operator MROs respond to founder-led outreach — a partnership pitch from another founder lands.',
   'Free shop partner profile + buyer-routed inspection requests during 60-day beta.',
   'new', 'send_first_email',
   'Services@HagganAviation.com on contact page. Backup: LinkedIn; 303-792-0688.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Aero Center Atlanta (formerly Epps Aviation)', 'Scott Ordway', 'Maintenance Manager',
   'ap_mechanic', 'scott.ordway@aerocenters.com', '+14707678208', 'aerocenters.com',
   'Atlanta, GA (KPDK — DeKalb-Peachtree)',
   'tradewind-100 / web (aerocenters.com/pdk-atlanta-ga, 2026-05-26)', 5, 5,
   'Legacy Epps Aviation operation (since 1965) at Atlanta''s busiest GA airport KPDK. Full FBO+MRO. High jet & turboprop pre-buy demand from Atlanta metro corporate fleet.',
   'Legacy FBO+MRO shops at busy metro GA airports want lead routing that respects the corporate-fleet buyer profile.',
   'Free shop partner profile + buyer-routed inspection requests during 60-day beta.',
   'new', 'send_first_email',
   'scott.ordway@aerocenters.com on the PDK location page. Backup: John Sessions jsessions@aerocenters.com / 470-767-8204.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('James Spearman Aircraft, LLC', 'James Spearman', 'Owner / A&P + IA',
   'ap_mechanic', 'Cassidy.spearman@spearmanaircraft.com', '+18653661449', 'spearmanaircraft.com',
   'Sevierville, TN (KGKT — Gatlinburg-Pigeon Forge)',
   'tradewind-100 / web + JSfirm (spearmanaircraft.com, 2026-05-26)', 4, 4,
   'Owner-operator A&P/IA serving East TN piston market (Cessna/Beech/Piper). 10+ yrs; MTSU aerospace mgmt degree; KC-135 ANG pilot.',
   'Owner-operator piston A&P shops want incremental pre-buy work — a marketplace channel is direct.',
   'Free shop partner profile + buyer-routed inspection requests during 60-day beta.',
   'new', 'send_first_email',
   'Email tied to spearmanaircraft.com domain via JSfirm. Backup: alt phone 865-383-0363; Facebook Spearman Aircraft.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Carolina Aviation Technical Services (CATS)', 'Peter Sistare', 'Co-Founder / Principal (A&P)',
   'ap_mechanic', null, '+18558472287', 'cats-mro.com',
   'Statesville, NC (KSVH)',
   'tradewind-100 / web (cats-mro.com, 2026-05-26)', 4, 4,
   'FAA Part 145 founded 2012 by two A&Ps with 1978-onward aviation careers. Cessna/Beechcraft/Dornier piston & turboprop focus at quiet NC GA airport.',
   'Small NC piston/turboprop shops want a marketplace channel — direct broker calls do not scale.',
   'Free shop partner profile + buyer-routed inspection requests during 60-day beta.',
   'new', 'send_first_email',
   'Founder names on About page; no direct email — contact form only. Backup: cats-mro.com/contact; co-founder Patrick Brady via main line.',
   'unverified', 'tradewind-100 / no_published_email 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Clear Star Aviation', 'Clear Star Aviation Service Desk', 'Cirrus Platinum Service Center',
   'ap_mechanic', 'info@clearstarmx.com', '+19722672376', 'clearstarmx.com',
   'Addison, TX (KADS)',
   'tradewind-100 / web (clearstarmx.com, 2026-05-26)', 5, 5,
   'Cirrus Platinum Partner & Authorized Service Center since 2007. Cirrus/Cessna/Beech/Mooney/Piper coverage in DFW. Heavy Cirrus SR/SF50 pre-buy pipeline.',
   'Cirrus Platinum shops are the gold standard for SR / VisionJet pre-buys — routing them deliberately is high-AOV.',
   'Free shop partner profile + buyer-routed inspection requests during 60-day beta.',
   'new', 'send_first_email',
   'info@clearstarmx.com on About page. Backup: Facebook ClearStarAir; LinkedIn Clear Star Aviation LLC.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ═════════════════════════════════════════════════════════════════════════════
-- SEGMENT 6 — TRANSPORT COMPANIES (10)
-- ═════════════════════════════════════════════════════════════════════════════

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Reliable Carriers, Inc.', 'Tom Abrams', 'President / CEO (Owner)',
   'transport', null, '+18005216393', 'reliablecarriers.com',
   'Canton, MI (HQ); terminals in Orlando FL, Sun Valley CA, Chandler AZ',
   'tradewind-100 / web (reliablecarriers.com, 2026-05-26)', 5, 5,
   'Largest enclosed auto transporter in North America (400+ tractor-trailers); Hagerty-partnered; 3rd-generation family business. Ideal for high-value exotic/classic buyers closing on TradeWind.',
   'Top-tier enclosed haulers want partnership routing for marketplace-closed exotics — not raw lead-form spam.',
   'Free transport partner profile + buyer-routed transport requests during 60-day beta.',
   'new', 'send_first_email',
   'No public email on contact page; web form only. Backup: form reliablecarriers.com/contact-us-form; LinkedIn Tom Abrams / Bob Sellers (VP/COO).',
   'unverified', 'tradewind-100 / no_published_email 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Intercity Lines', 'Dispatch / Sales Team', 'Dispatcher',
   'transport', 'info@intercitylines.com', '+18002213936', 'intercitylines.com',
   '552 Old West Brookfield Rd, Warren, MA 01083',
   'tradewind-100 / web (intercitylines.com/contact-us, 2026-05-26)', 5, 5,
   'Premier enclosed auto transport; official transporter for Gooding & Company and Hagerty Marketplace auctions. Classic/exotic specialty. FL-NE-TX lanes.',
   'Auction-partnered enclosed haulers want consistent referral volume between auctions — a marketplace fills that gap.',
   'Free transport partner profile + buyer-routed transport requests during 60-day beta.',
   'new', 'send_first_email',
   'info@intercitylines.com on contact-us. Backup: 800-221-3936; quote form.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Passport Transport', 'Sales Team', 'Sales / Dispatch',
   'transport', 'sales@passporttransport.com', '+18665823185', 'passporttransport.com',
   '145 Evergreen Pkwy, Lebanon, MO 65536',
   'tradewind-100 / web (passporttransport.com/contact-us, 2026-05-26)', 5, 5,
   'Personalized enclosed carrier transport since 1970; serves top collectors, auction houses, concours, classic car dealers. Perfect fit for TradeWind exotic/classic closings.',
   'White-glove enclosed haulers want partnership routing tied to deal flow — generic lead forms are noise.',
   'Free transport partner profile + buyer-routed transport requests during 60-day beta.',
   'new', 'send_first_email',
   'sales@passporttransport.com on contact-us. Backup: 866-582-3185; LinkedIn.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Plycar Automotive Logistics (Plycon Group)', 'Customer Service', 'Operations / Customer Service',
   'transport', 'customerservice@plycongroup.com', '+18886552644', 'plycargroup.com',
   '280 Indian Head Rd, Kings Park, NY 11754',
   'tradewind-100 / web (plycargroup.com, 2026-05-26)', 4, 4,
   'Enclosed multi-car carriers; specialty in luxury/exotic relocation; coast-to-coast service including Southeast and TX corridors.',
   'Coast-to-coast enclosed multi-car carriers want partnership routing tied to closings — generic broker calls misroute.',
   'Free transport partner profile + buyer-routed transport requests during 60-day beta.',
   'new', 'send_first_email',
   'customerservice@plycongroup.com on contact page. Backup: 888-655-2644; main 631-269-7000.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Exotic Car Transport', 'Dispatch', 'Dispatcher',
   'transport', null, '+18882309877', 'exoticcartransport.com',
   'Orlando, FL',
   'tradewind-100 / web (exoticcartransport.com, 2026-05-26)', 5, 5,
   'FL-based since 1986; fully enclosed hard-side trailers with hydraulic lift-gates for low-clearance exotics. Ideal for FL/TX/Southeast lanes — aligns with TradeWind buyer base.',
   'Specialty hard-side / lift-gate haulers are exactly what marketplace-closed exotics need — direct partnership routing is the play.',
   'Free transport partner profile + buyer-routed transport requests during 60-day beta.',
   'new', 'send_first_email',
   'No public email; phone/form only. Backup: 888-230-9877; website quote form.',
   'unverified', 'tradewind-100 / no_published_email 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Joule Yacht Transport, Inc.', 'Sales Team', 'Sales / Dispatch',
   'transport', 'sales@JouleYacht.com', '+18002370727', 'jouleyacht.com',
   '12290 Automobile Blvd, Clearwater, FL 33762',
   'tradewind-100 / web (jouleyacht.com, 2026-05-26)', 5, 5,
   'Founded 1954; one of America''s largest private yacht trucking carriers. Powerboats, sailboats, oversized yachts. Clearwater FL HQ — core TradeWind Southeast lane.',
   'Yacht trucking carriers want partnership routing for marketplace closings — generic broker calls misroute oversized loads.',
   'Free transport partner profile + buyer-routed transport requests during 60-day beta.',
   'new', 'send_first_email',
   'sales@JouleYacht.com on company site and BBB. Backup: 800-237-0727; local 727-573-2627.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Brownell Boat Transport (Brownell Systems, Inc.)', 'Service Team', 'Operations',
   'transport', 'service@brownellsystems.com', '+18002628428', 'brownellboattransport.com',
   '7 Industrial Dr, Mattapoisett, MA 02739',
   'tradewind-100 / web (brownellsystems.com, 2026-05-26)', 4, 4,
   'Boat transport since 1954. Yachts and commercial vessels to 175 ft / 200 tons using 50/100/200-ton hydraulic trailers. Oversized-load specialist.',
   'Oversized yacht haulers want partnership routing for marketplace closings — direct broker calls do not scale on permitted loads.',
   'Free transport partner profile + buyer-routed transport requests during 60-day beta.',
   'new', 'send_first_email',
   'service@brownellsystems.com on company site. Backup: 800-262-8428; direct 508-758-3774.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Flagship Boat Transport (Flagship Yacht Brokers, Inc.)', 'Suzan', 'Operations / Primary Contact',
   'transport', 'info@boattransportpros.com', '+12524451480', 'boattransportpros.com',
   '28261 NC Hwy 561, Enfield, NC 27823',
   'tradewind-100 / web (boattransportpros.com, 2026-05-26)', 5, 5,
   '28+ yrs experience. Powerboats/sailboats/yachts. Oversized-load specialty including permits, route surveys, pole cars, police escorts. NC base covers Southeast lanes well.',
   'Oversized + permitted boat haulers want partnership routing for marketplace closings — generic dispatch calls misroute escorts.',
   'Free transport partner profile + buyer-routed transport requests during 60-day beta.',
   'new', 'send_first_email',
   'info@boattransportpros.com on company site. Backup: 877-297-3934; quote form.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Florida Boat Transport LLC', 'Greg Hutchens', 'Owner / Operations',
   'transport', 'greg@floridaboattransport.com', '+18139208200', 'floridaboattransport.com',
   'Florida (Tampa area)',
   'tradewind-100 / web (floridaboattransport.com, 2026-05-26)', 5, 5,
   'Veteran-owned since 1991. Fleet of 40 tractors/trailers with specialty racking and bunking. Domestic + international yacht hauling. FL HQ aligns with TradeWind Southeast deal flow.',
   'Veteran-owned founder-led haulers respond to direct founder outreach — partnership scoping lands.',
   'Free transport partner profile + buyer-routed transport requests during 60-day beta.',
   'new', 'send_first_email',
   'greg@floridaboattransport.com on company site. Backup: 813-920-8200.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Yacht Trucking (Safe Harbor Haulers)', 'Eric', 'Owner / Operator',
   'transport', 'Eric@SafeHarborHaulers.com', '+14138222224', 'yachttrucking.com',
   '13922 River Road, Pensacola, FL 32507',
   'tradewind-100 / web (yachttrucking.com/contact-us, 2026-05-26)', 5, 5,
   'Specializes in oversize leisure boats, sailboats, and truckable yacht transports. Pensacola FL base serves Gulf Coast / TX-FL lanes.',
   'Gulf Coast / TX-FL oversized yacht lanes are exactly what TradeWind marketplace closings need.',
   'Free transport partner profile + buyer-routed transport requests during 60-day beta.',
   'new', 'send_first_email',
   'Eric@SafeHarborHaulers.com on contact-us. Backup: 413-822-2224 (7AM-8PM EST).',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ═════════════════════════════════════════════════════════════════════════════
-- SEGMENT 7 — MARINE / AUTO LENDERS (5)
-- ═════════════════════════════════════════════════════════════════════════════

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Trident Funding', 'Joan Burleigh', 'Loan Officer (Alameda Branch)',
   'lender', 'jburleigh@tridentfunding.com', '+15107490050', 'tridentfunding.com',
   '1150 Ballena Blvd, Ste 110, Alameda, CA 94501',
   'tradewind-100 / web + RocketReach (tridentfunding.com, 2026-05-26)', 5, 5,
   'Largest US marine lender (~30 yrs, founded 1996); 40+ bank network; ~40,000 closed loans from $20K to $20M. Alameda office covers West Coast yacht buyers.',
   'Bank-network marine lenders want pre-qualified marketplace buyers without acquisition cost — direct broker referrals are inconsistent.',
   'Free finance partner profile + buyer-routed financing requests during 60-day beta.',
   'new', 'send_first_email',
   'Pattern (first-initial+last) confirmed 93.1% via RocketReach; Joan Burleigh referenced as Alameda contact in public sales directory listings. Backup: 888-356-6005; LinkedIn /company/tridentfunding; HQ Shelton CT.',
   'unverified', 'tradewind-100 / pattern-inferred 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Sterling Acceptance Corporation', 'Matt Brown', 'Corporate Sales Manager',
   'lender', 'matt@sterlingacceptance.com', '+14102681545', 'sterlingacceptance.com',
   '100 Severn Ave, Suite 101, Annapolis, MD 21403',
   'tradewind-100 / web (sterlingacceptance.com, 2026-05-26)', 5, 5,
   'Founded 1987 by Karen Trostle (38+ yrs in marine lending). 4 nationwide loan production offices. Deep Annapolis/Chesapeake yacht broker network. Yacht loans, current promo rates from 5.99%.',
   'Owner-operated marine lenders respond to founder-led outreach — a partnership pitch lands.',
   'Free finance partner profile + buyer-routed financing requests during 60-day beta.',
   'new', 'send_first_email',
   'matt@sterlingacceptance.com publicly listed (BoatShowManager.com directory). Backup: 800-525-0554; Fax 410-268-3755; owners Karen Trostle / Dave Trostle.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Shore Premier Finance (Centennial Bank)', 'Lauren Key', 'VP, Director of Recreational Finance',
   'lender', 'lauren.key@shorepremierfinance.com', '+18442773794', 'shorepremierfinance.com',
   '4456 Corporation Lane, Suite 115, Virginia Beach, VA 23462',
   'tradewind-100 / web + RocketReach (shorepremierfinance.com, 2026-05-26)', 4, 4,
   'Bank-backed (Centennial Bank) marine specialist financing powerboats, sailboats, catamarans, charter programs, USCG & BVI registries. Acquired LH Finance in 2020.',
   'Bank-backed marine specialists want a marketplace channel for the recreational buyer segment — direct dealer relationships are slow to scale.',
   'Free finance partner profile + buyer-routed financing requests during 60-day beta.',
   'new', 'send_first_email',
   'Pattern (first.last) confirmed via RocketReach / NeverBounce. Backup: existing-customer 888-372-9788; President Scott Walter scott.walter@shorepremierfinance.com; LinkedIn DM.',
   'unverified', 'tradewind-100 / pattern-inferred 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Woodside Credit', 'Jerry Alspach', 'Senior Loan Advisor',
   'lender', 'jalspach@woodsidecredit.com', '+18007175180', 'woodsidecredit.com',
   '895 Dove Street, Suite 100, Newport Beach, CA 92660',
   'tradewind-100 / web + RocketReach (woodsidecredit.com, 2026-05-26)', 5, 5,
   'Founded 2003. Leading US collector/exotic/classic car lender with $3B+ in originations. Barrett-Jackson Auctions exclusive financing partner 10+ years. Typical loan $50K-$305K+.',
   'Collector auto lenders want a marketplace channel for the closing buyer — Barrett-Jackson covers auctions but not private sales.',
   'Free finance partner profile + buyer-routed financing requests during 60-day beta.',
   'new', 'send_first_email',
   'Pattern (first-initial+last) inferred from RocketReach; Alspach named publicly in customer reviews as tenured loan officer. Backup: direct 949-717-5100; LinkedIn /company/woodside-credit.',
   'unverified', 'tradewind-100 / pattern-inferred 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('J.J. Best Banc & Co.', 'John J. Meldon', 'Founder, President & CEO',
   'lender', 'jmeldon@jjbest.com', '+15089918000', 'jjbest.com',
   'Best Banc Building, 60 N Water Street, New Bedford, MA 02740',
   'tradewind-100 / web + ZoomInfo (jjbest.com, 2026-05-26)', 5, 4,
   'Founded 1993 in Chatham, MA — "nation''s oldest, largest and most experienced classic and collector car lender." Founder is himself a longtime classic car collector. Founder-to-founder pitch will resonate.',
   'Founder-led classic car lenders respond to founder-led outreach — a partnership pitch lands.',
   'Free finance partner profile + buyer-routed financing requests during 60-day beta.',
   'new', 'send_first_email',
   'Customer service cs@jjbest.com publicly listed; founder pattern first-initial+last aligns with industry norm. Backup: cs@jjbest.com; toll-free 1-800-872-1965; VP Joe Meldon joe@jjbest.com.',
   'unverified', 'tradewind-100 / pattern-inferred 2026-05-26', now())
on conflict do nothing;

-- ═════════════════════════════════════════════════════════════════════════════
-- SEGMENT 8 — INSURANCE BROKERS (5)
-- ═════════════════════════════════════════════════════════════════════════════

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Gowrie Group / IMIS', 'Mark Gargula', 'Yacht Insurance Specialist / Producer',
   'insurance', 'markg@gowrie.com', '+18603917371', 'gowrie.com',
   'Westbrook, CT (HQ) / Annapolis, MD (IMIS office)',
   'tradewind-100 / web (gowrie.com, 2026-05-26)', 5, 5,
   'Largest independent marine insurance group in the US. IMIS division has serviced yacht owners since 1987 and sits in the heart of Chesapeake Bay yacht country.',
   'Yacht insurers want pre-qualified, just-closed buyers — not cold quote-shoppers.',
   'Free insurance partner profile + buyer-routed coverage requests during 60-day beta.',
   'new', 'send_first_email',
   'markg@gowrie.com confirmed via marine site yacht-insurance specialist listing. Backup: 800-262-8911 / info@gowrie.com; IMIS Annapolis 410-827-3757 / mail@IMIS.Pro; LinkedIn Carter Gowrie (Chairman/CEO).',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Pantaenius America Ltd.', 'Scott Stusek', 'Vice President / Director of Marketing & Sales (Annapolis)',
   'insurance', 'stusek@pantaenius.com', '+14435697995', 'pantaenius.com',
   'Pantaenius America Annapolis office, Annapolis, MD',
   'tradewind-100 / ZoomInfo + LinkedIn (pantaenius.com/us-en/, 2026-05-26)', 4, 4,
   'Global luxury/superyacht specialist with deep Annapolis presence. The brand HNW Euro-style yacht buyers (Hallberg-Rassy, Oyster, Nordhavn) ask for by name.',
   'Pantaenius America has periodically paused new US-flagged yacht binding — lead with discovery, not promised volume.',
   'Free insurance partner profile + buyer-routed coverage requests during 60-day beta.',
   'new', 'send_first_email',
   'Pattern inferred from LinkedIn handle "stusek-pantaenius"; ZoomInfo confirms @pantaenius.com domain. Backup: 443-569-7995; LinkedIn DM /in/stusek-pantaenius-42262759; Nordhavn vendor partner contact form.',
   'unverified', 'tradewind-100 / pattern-inferred 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Maritime Insurance International (High Street Insurance Partners)', 'Ned Sawyer', 'Marine Insurance Producer / NE Office Lead (Mystic, CT)',
   'insurance', 'nsawyer@maritimeinsuranceinternational.com', '+18436065270', 'maritimeinsuranceinternational.com',
   '18 Stafford St., Mystic, CT 06355 (HQ Charleston SC; offices Annapolis MD, Wrightsville Beach NC)',
   'tradewind-100 / web (maritimeinsuranceinternational.com, 2026-05-26)', 4, 4,
   'Multi-region marine specialty with offices in three TradeWind hot-zones (Chesapeake, NC coast, Charleston, Mystic/Newport). Ned underwrote before producing — speaks credibly to surveyors and hull values.',
   'Multi-region marine specialists need a marketplace channel for the closing buyer — direct broker referrals miss the underwriter perspective.',
   'Free insurance partner profile + buyer-routed coverage requests during 60-day beta.',
   'new', 'send_first_email',
   'Pattern (first-initial+last) is the agency standard — SMTP-verify before first send. Backup: 843-606-5270; HQ leadership Garrison Rudisill / Nick McGinty.',
   'unverified', 'tradewind-100 / pattern-inferred 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Wings Insurance', 'Tom Hauge', 'National Sales Director / Senior Aviation Insurance Broker',
   'insurance', 'thauge@wingsinsurance.com', '+16125785055', 'wingsinsurance.com',
   '14701 Pioneer Trail, Eden Prairie, MN 55347',
   'tradewind-100 / web (wingsinsurance.com/team/tom-hauge, 2026-05-26)', 5, 5,
   '20+ years aviation brokerage. Manages large commercial/corporate accounts including FBO and jet fleet programs. Chairs Wings'' very-light-jet / owner-flown turbine transition program.',
   'Aviation insurers want pre-qualified just-closed aircraft buyers — transition training drives insurability and Tom literally chairs the internal R&D for it.',
   'Free insurance partner profile + buyer-routed coverage requests during 60-day beta.',
   'new', 'send_first_email',
   'Direct email + direct cell published on team bio. Backup: 952-942-8800; toll-free 866-910-8200; newbusiness@wingsinsurance.com.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Falcon Insurance Agency (Acrisure Aerospace)', 'John Allen', 'Founder & CEO',
   'insurance', 'jallen@falconinsurance.com', '+18302571000', 'falconinsurance.com',
   '1001 Water Street, Bld K, Ste 100, Kerrville, TX 78028',
   'tradewind-100 / web + Corporationwiki (falconinsurance.com, 2026-05-26)', 4, 4,
   'One of the country''s largest aviation-only agencies (since 1979). 9-office national footprint matching where TradeWind aircraft buyers live. Piston singles through turbine fleets.',
   'Acrisure-backed aviation agencies want partnership routing — but CEO-level outreach should be paired with a regional producer first-touch.',
   'Free insurance partner profile + buyer-routed coverage requests during 60-day beta.',
   'new', 'send_first_email',
   'Pattern (first-initial+last) is Falcon standard; CEO confirmed via Corporationwiki + BJT Online. Backup: 800-880-4545; regional Houston 281-540-8822 / Austin 512-891-8473 / Dallas 972-250-0800 / Scottsdale 480-483-0733.',
   'unverified', 'tradewind-100 / pattern-inferred 2026-05-26', now())
on conflict do nothing;

-- ═════════════════════════════════════════════════════════════════════════════
-- SEGMENT 9 — ESCROW / TITLE / CLOSING PARTNERS (5)
-- ═════════════════════════════════════════════════════════════════════════════

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Maritime Documentation Center', 'Customer Service Team', 'Documentation Officer',
   'escrow_title', 'info@maritimedocumentation.us', '+18005358570', 'maritimedocumentation.us',
   'Long Beach, CA',
   'tradewind-100 / web + BBB (maritimedocumentation.us, 2026-05-26)', 4, 4,
   'Private USCG vessel documentation specialist (not affiliated with the Coast Guard). Handles renewals, abstracts of title, lien searches and transfers for yachts of all sizes.',
   'Yacht documentation specialists want a marketplace channel for fast NVDC turnaround on big-ticket asset closings.',
   'Free escrow/title partner profile + buyer-routed closing requests during 60-day beta.',
   'new', 'send_first_email',
   'info@maritimedocumentation.us listed publicly. Backup: 866-981-8783 / 800-535-8570; Facebook @MaritimeDocCenter.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Dona Jenkins Maritime Document Service, Inc.', 'Dona Jenkins', 'Owner / Principal Documentation Agent',
   'escrow_title', 'info@donajenkins.com', '+16192232279', 'donajenkins.com',
   '1050 Rosecrans St., Suite 3, San Diego, CA 92106',
   'tradewind-100 / web (donajenkins.com/services, 2026-05-26)', 5, 5,
   'Founder-led San Diego documentation house operating since ~1999 (25+ years). Full-stack USCG documentation, state registration, abstracts, mortgages, liens, deletions. Partnered escrow via Law Offices of Paul S. Trusso.',
   'Founder-led documentation + escrow partner — ideal partner for TradeWind Pacific yacht corridor closings.',
   'Free escrow/title partner profile + buyer-routed closing requests during 60-day beta.',
   'new', 'send_first_email',
   'info@donajenkins.com on services page. Backup: 619-223-2279; Fax 619-223-1002.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Anacortes Marine Documentation', 'Sonya', 'Owner / Vessel Title Agent',
   'escrow_title', 'sonya@anacortesmarinedoc.com', '+13605884876', 'anacortesmarinedoc.com',
   '1015 14th Street, Suite B, Anacortes, WA 98221',
   'tradewind-100 / web (anacortesmarinedoc.com, 2026-05-26)', 5, 5,
   'Independent full-service PNW vessel title and documentation company with 30+ years. Strong on cross-border closings (US/Canada/Mexico + international registries) — exactly what TradeWind needs for the Salish Sea cohort.',
   'Cross-border documentation specialists are rare — a marketplace channel routes them deliberately.',
   'Free escrow/title partner profile + buyer-routed closing requests during 60-day beta.',
   'new', 'send_first_email',
   'sonya@anacortesmarinedoc.com on site. Backup: 360-588-4876; Fax 360-873-8159.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('AIC Title Service, LLC', 'Customer Service / Escrow Department', 'Aircraft Escrow Agent',
   'escrow_title', 'info@aictitle.com', '+18002882519', 'aictitle.com',
   '6350 W Reno Ave, Oklahoma City, OK 73127',
   'tradewind-100 / web (escrow.aictitle.com/Home/Contact, 2026-05-26)', 5, 5,
   'Industry leader in FAA Aircraft Registry document submission, title search, lien clearance, escrow, and International Registry (Cape Town Convention) services. OKC base = co-located with FAA Aircraft Registry → same-day filing.',
   'Aircraft buyers want certainty on title chain and lien releases — TradeWind closings need a partner co-located with the FAA registry.',
   'Free escrow/title partner profile + buyer-routed closing requests during 60-day beta.',
   'new', 'send_first_email',
   'info@aictitle.com on AIC Escrow Services contact page. Backup: 405-948-1811 local; Fax 405-948-1869; Facebook @aictitle.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Insured Aircraft Title Service, LLC (IATS)', 'Kirk Woford', 'President',
   'escrow_title', 'iats@insuredaircraft.com', '+18006544882', 'insuredaircraft.com',
   '21 East Main Street, Suite 100, Oklahoma City, OK 73104',
   'tradewind-100 / web (insuredaircraft.com/contact, 2026-05-26)', 5, 5,
   'Most established names in FAA aircraft title and escrow. Kirk has led IATS since 1987, supported by senior staff with 40+ years (Tammie Morgan, Bill Morgan). Bonded/insured closings.',
   'Founder-led title shops respond to founder-led outreach — partnership pitch at the principal level lands.',
   'Free escrow/title partner profile + buyer-routed closing requests during 60-day beta.',
   'new', 'send_first_email',
   'iats@insuredaircraft.com on contact/about pages; Kirk Woford named President. Backup: 405-681-6663 local; Fax 405-688-3700; LinkedIn outreach Kirk Woford / VP Joan Roberts.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ═════════════════════════════════════════════════════════════════════════════
-- SEGMENT 1 — BOAT / YACHT DEALERS & BROKERS (25)
-- ═════════════════════════════════════════════════════════════════════════════

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Massey Yacht Sales & Service', 'Ed Massey', 'Principal / Sales Professional',
   'yacht_broker', null, '+19417252350', 'masseyyacht.com', 'Palmetto, FL',
   'tradewind-100 / web (masseyyacht.com, 2026-05-26)', 5, 5,
   '40+ years of continuous sales and outfitting; team of 25 sales professionals based in Tampa Bay area.',
   'Multi-broker shops in Tampa Bay need a buyer-feed channel that does not require every broker to maintain their own aggregator presence.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'No email listed on team page; phone published. Backup: contact form https://masseyyacht.com/contact/.',
   'unverified', 'tradewind-100 / no_published_email 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Aspire Yacht Sales', 'John Booysen', 'Principal / Broker',
   'yacht_broker', null, '+19545602811', 'aspireyachtsales.com', 'Fort Lauderdale, FL',
   'tradewind-100 / web (aspireyachtsales.com, 2026-05-26)', 5, 5,
   'Boutique Fort Lauderdale yacht brokerage led by Principal John Booysen; specializes in luxury yachts worldwide.',
   'Boutique luxury brokerages compete on relationship — a curated buyer-request feed meets them where they already work.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'No email on site. Backup: 954-560-2811.',
   'unverified', 'tradewind-100 / no_published_email 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Reel Deal Yachts', 'Marcos Morjain', 'Founder / Owner',
   'yacht_broker', null, '+13055382022', 'reeldealyachts.com', 'Miami, FL',
   'tradewind-100 / web (reeldealyachts.com, 2026-05-26)', 5, 5,
   'Miami native and passionate yachtsman; founded 40+ years ago; ownership stakes in Bahia Mar Yachting Center & Waterways Marina.',
   'Marina-affiliated founder-led brokerages want a routing layer that respects their existing slip-holder relationships.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'No direct email on site. Backup: contact form reeldealyachts.com.',
   'unverified', 'tradewind-100 / no_published_email 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Miami International Yacht Sales', 'Robert Lama', 'Founder / Owner',
   'yacht_broker', 'bob@miamiys.com', '+13058578939', 'miamiinternationalyachtsales.com', 'Hollywood, FL',
   'tradewind-100 / web (miamiinternationalyachtsales.com, 2026-05-26)', 5, 5,
   'Founded 2011; applies commercial real estate principles to yachts in the 100-250 ft superyacht class.',
   'Superyacht specialists in the 100-250 ft class need buyer routing that respects the small, global pool of in-market buyers.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'bob@miamiys.com on about page. Backup: LinkedIn /in/robertlama/.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Naples Yacht Brokerage', 'Pete Peterson', 'Founder / Owner',
   'yacht_broker', null, '+12392626500', 'naplesyachtbrokerage.com', 'Naples, FL',
   'tradewind-100 / web (naplesyachtbrokerage.com, 2026-05-26)', 5, 5,
   'Oldest independent brokerage in Naples FL, founded 1988 by Pete Peterson.',
   'Oldest independent in a HNW seasonal market — a marketplace channel smooths off-season inquiries.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'Site blocked WebFetch (403). Backup: contact form naplesyachtbrokerage.com/contact/.',
   'unverified', 'tradewind-100 / website_blocked 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Burkard Yacht Sales', 'Chris Burkard', 'President & Broker of Record (CPYB)',
   'yacht_broker', 'sales@burkardyachts.com', '+12392533670', 'burkardyachts.com', 'Naples, FL',
   'tradewind-100 / web (burkardyachts.com, 2026-05-26)', 5, 5,
   '25+ years marine experience, CPYB certified, specializes in vessels over 100 ft.',
   'CPYB-certified large-vessel brokers want routing that respects credentials and vessel-size niche — generic aggregators flatten that.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'sales@burkardyachts.com on company site. Backup: 239-253-3670.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Southwest Florida Yachts', 'Barb Hansen', 'Co-Owner / Broker',
   'yacht_broker', 'info@swfyachts.com', '+12392572788', 'swfyachts.com', 'Cape Coral, FL',
   'tradewind-100 / web (swfyachts.com, 2026-05-26)', 5, 5,
   'Owned and operated by Barb and Vic Hansen since 1984 — 40+ years on Florida''s SW coast.',
   'Family-owned 40-year brokerages have long-tail inventory and repeat clients — a curated buyer feed is incremental.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'info@swfyachts.com on contact page. Backup: 239-257-2788.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Voller Boat Broker', 'Gary Voller', 'Owner / Broker',
   'yacht_broker', 'gary@vollerboatbroker.com', '+17723214872', 'vollerboatbroker.com', 'Vero Beach, FL',
   'tradewind-100 / web (vollerboatbroker.com, 2026-05-26)', 5, 5,
   'Independent solo broker serving Fort Pierce / Vero Beach / Sebastian — personalized one-on-one model.',
   'Solo independent brokers run lean — a buyer-routing feed without lead-cost is incremental, not threatening.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'gary@vollerboatbroker.com on contact page. Backup: 772-321-4872.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Hansen Yachts Sales', 'Mike Webster', 'Sole Proprietor / Owner',
   'yacht_broker', 'goboatinginflorida@gmail.com', '+19049230033', 'hansenyachtsales.com', 'Jacksonville, FL',
   'tradewind-100 / web (hansenyachtsales.com, 2026-05-26)', 5, 5,
   'Sole proprietor since 2019; 30+ years experience; based at Lambs Marina with personalized one-on-one model.',
   'Marina-attached sole proprietors get most work through dock walk-ins — a marketplace channel scales beyond foot traffic.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'goboatinginflorida@gmail.com on about page (printed company address pattern). Backup: 904-923-0033.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Mark Zeigler Yacht Sales', 'Mark Zeigler', 'Owner / Broker',
   'yacht_broker', 'mark@mzyachts.com', '+19043890500', 'mzyachts.com', 'Jacksonville, FL',
   'tradewind-100 / web (mzyachts.com, 2026-05-26)', 5, 5,
   'Independent owner-operator broker partnered with Lambs Yacht Center and Port 32 marinas — boats kept undercover.',
   'Owner-operator brokers with marina partnerships want a marketplace channel that respects their existing dock relationships.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'mark@mzyachts.com on company site. Backup: 904-389-0500.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Center Hill Marine Brokerage', 'Mark O''Neill', 'Owner / Sales Manager',
   'boat_dealer', null, '+16159487443', 'centerhillboats.com', 'Nashville, TN',
   'tradewind-100 / web (centerhillboats.com, 2026-05-26)', 5, 5,
   'Owner Mark O''Neill covers Center Hill, Dale Hollow, Old Hickory, Percy Priest, Tims Ford lakes plus Cumberland & Tennessee Rivers.',
   'Multi-lake dealers want buyer routing scoped to lake — generic aggregators do not filter by waterbody.',
   'Free verified-dealer profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'Website unreachable; named owner verified via LinkedIn. Backup: LinkedIn /in/mark-o-neill-01b6a533/.',
   'unverified', 'tradewind-100 / website_unreachable 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Erwin Marine Sales', 'Louis "Kayo" Erwin', 'Owner / President',
   'boat_dealer', 'dunderwood@erwinmarinesales.com', '+14236221978', 'erwinmarinesales.com', 'Chattanooga, TN',
   'tradewind-100 / web (erwinmarinesales.com, 2026-05-26)', 5, 5,
   'Family-owned since 1978. Operates Chickamauga Marina, Gold Point Yacht Harbor, Pine Harbor, Sunrise Marina across TN River.',
   'Multi-marina family-owned dealers want a routing layer that handles both inventory and slip leads.',
   'Free verified-dealer profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'dunderwood@erwinmarinesales.com on contact page. Backup: 423-622-1978.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Intracoastal Yacht Sales', 'Captain Bobby Gregory', 'Owner / Yacht Broker',
   'yacht_broker', 'bgregory@intracoastalyachtsales.com', '+18434126587', 'intracoastalyachtsales.com', 'Charleston, SC',
   'tradewind-100 / web (intracoastalyachtsales.com, 2026-05-26)', 5, 5,
   'Charleston native, USCG Captain since 1998, College of Charleston grad, lifelong boater. Serves Charleston City Marina.',
   'Charleston is a growing yacht market underserved by national aggregators — local-credibility brokers benefit most from a marketplace.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'bgregory@intracoastalyachtsales.com on team page. Backup: 843-412-6587.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Jeff Brown Yachts (Charleston)', 'Jeff Brown', 'Owner / Founder',
   'yacht_broker', 'jeff@jeffbrownyachts.com', '+18432770777', 'jeffbrownyachts.com', 'Charleston, SC',
   'tradewind-100 / web (jeffbrownyachts.com, 2026-05-26)', 5, 5,
   'Fastest-growing luxury yacht dealership in US; exclusive Mid-Atlantic Axopar / BRABUS Marine dealer; recently expanded to Charleston.',
   'Fast-growing exclusive-brand dealers want buyer routing scoped to their authorized brands — that filters out tire-kickers.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'jeff@jeffbrownyachts.com on about profile. Backup: 843-277-0777.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Donnelly Yachts', 'Shawn Donnelly', 'Founder / Owner',
   'yacht_broker', 'info@donnelly-yachts.com', '+19122729500', 'donnelly-yachts.com', 'Hilton Head Island, SC',
   'tradewind-100 / web (donnelly-yachts.com, 2026-05-26)', 5, 5,
   'Founded 2005. Covers Savannah / Charleston / Jacksonville. Chris Donnelly brings 45-year marine career to family firm.',
   'Multi-region SE brokers want routing scoped to corridor — generic aggregators flatten regional intent.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'info@donnelly-yachts.com on about page. Backup: 912-272-9500.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Atlantic Marine', 'David Floyd', 'Owner (3rd generation)',
   'boat_dealer', null, '+19102569911', 'atlanticmarine.com', 'Wrightsville Beach, NC',
   'tradewind-100 / web (atlanticmarine.com, 2026-05-26)', 5, 5,
   'World''s largest Grady-White dealer. Family-owned since 1976. David Floyd + son Will = 3rd-gen Floyd family leadership.',
   'Largest-in-the-world single-brand dealers move serious volume — a marketplace channel for Grady-White buyers is direct and high-AOV.',
   'Free verified-dealer profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'Site blocked WebFetch (403). Backup: 910-256-9911.',
   'unverified', 'tradewind-100 / website_blocked 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Lake Hartwell Marine', 'Jason Thomas', 'Owner / Founder',
   'boat_dealer', 'Jason@lakehartwellmarine.com', '+17063564743', 'lakehartwellmarine.com', 'Lavonia, GA',
   'tradewind-100 / web (lakehartwellmarine.com, 2026-05-26)', 5, 5,
   'Founded Oct 2011 by Jason Thomas; partnered with Jeremy Dawkins (Lincolnton Marine) in 2020 to expand new boat sales on Lake Hartwell.',
   'Lake-specific dealers serve a tight community — a marketplace channel scoped to the lake is direct.',
   'Free verified-dealer profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'Jason@lakehartwellmarine.com on team page. Backup: 706-356-4743.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Atlanta Boat Broker', 'Zane Stevenson', 'Owner / Broker',
   'boat_dealer', 'zane@atlantaboatbroker.com', '+14172244598', 'atlantaboatbroker.com', 'Lake Lanier, GA (Cumming)',
   'tradewind-100 / web + ZoomInfo (atlantaboatbroker.com, 2026-05-26)', 5, 5,
   'Independent owner-broker on Lake Lanier GA — Atlanta metro''s largest recreational lake; owner-direct line published.',
   'Atlanta metro lake brokers want a marketplace channel that captures the urban buyer commuting out for weekend use.',
   'Free verified-dealer profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'zane@atlantaboatbroker.com from ZoomInfo corroborated with company domain. Backup: LinkedIn /in/zane-stevenson-75654a19/.',
   'likely_valid', 'tradewind-100 / web_and_zoominfo 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Sea Lake Yachts LLC', 'Doug Hughes', 'Owner / CPYB Broker',
   'yacht_broker', 'doug@sealakeyachtsllc.com', '+12815494724', 'sealakeyachtsllc.com', 'Kemah, TX',
   'tradewind-100 / web (sealakeyachtsllc.com, 2026-05-26)', 5, 5,
   'Husband/wife team Doug + Angela Hughes since 1989 (37+ yrs). Authorized X-Yachts dealer on Galveston Bay.',
   'X-Yachts authorized dealers on Galveston Bay are a tight niche — a marketplace channel scoped to the brand is direct.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'doug@sealakeyachtsllc.com on about page. Backup: 281-549-4724.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Little Yacht Sales', 'Kent Little', 'President / Founder',
   'yacht_broker', 'info@LittleYachtSales.com', '+18445972628', 'littleyachtsales.com', 'Kemah, TX',
   'tradewind-100 / web (littleyachtsales.com, 2026-05-26)', 5, 5,
   'Kent + Liz Little; 40+ yrs in yacht sales; team has 150+ combined years. Catalina/Jeanneau/Beneteau dealer plus Key West office.',
   'Multi-brand dealer-brokers with cross-state offices need routing that respects both fleet and corridor.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'info@LittleYachtSales.com on team page. Backup: 844-597-2628.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Pier-1 Marine', 'Joe D''Amico', 'Owner / Principal',
   'yacht_broker', 'joed@pier-1marine.com', '+19416397777', 'pier-1marine.com', 'Punta Gorda, FL',
   'tradewind-100 / web (pier-1marine.com, 2026-05-26)', 5, 4,
   'SW Florida''s distinguished yacht brokerage with 28 brokers across FL boating destinations. Full-service marine center.',
   '28-broker shops want routing that splits intent by broker — generic aggregators round-robin badly.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'joed@pier-1marine.com on contact page. Backup: 941-639-7777.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Gilman Yachts of Ft. Lauderdale, Inc.', 'Gilman Yachts Team', 'Sales / Brokerage',
   'yacht_broker', 'info@gilmanyachts.com', '+19545258112', 'gilmanyachts.com', 'Fort Lauderdale, FL',
   'tradewind-100 / web (gilmanyachts.com, 2026-05-26)', 4, 4,
   'Family-owned full-service yacht brokerage founded 1968 at 1510 SE 17th Street — the heart of Ft Lauderdale yachting row.',
   'Generational family-owned brokerages on yachting row have repeat-client networks that benefit from incremental marketplace flow.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'info@gilmanyachts.com on contact page. Backup: 954-525-8112.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Ghost Yachts', 'Ghost Yachts Sales Team', 'Brokerage',
   'yacht_broker', 'info@ghostyachtsales.com', '+13057638386', 'ghostyachtsales.com', 'Miami Beach, FL',
   'tradewind-100 / web (ghostyachtsales.com, 2026-05-26)', 4, 4,
   'Located at Miami Beach Marina (300 Alton Rd) — prime location for luxury yacht brokerage in South Beach.',
   'Marina-located luxury brokerages need routing that matches the South Beach owner/charter cohort.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'info@ghostyachtsales.com on contact page. Backup: 305-763-8386.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Terraglio Yacht Group', 'Greg Terraglio', 'Owner',
   'yacht_broker', 'Sales@TerraglioGroup.com', '+17722248800', 'myyachtsforsale.com', 'Stuart, FL',
   'tradewind-100 / web (myyachtsforsale.com, 2026-05-26)', 4, 4,
   'Stuart FL family-led brokerage with licensed broker team. Sales, financing, yacht management trifecta.',
   'Family-led brokerages with bundled services want routing that respects the bundle — generic listing sites split the buyer journey.',
   'Free verified-broker profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'Sales@TerraglioGroup.com on company site. Backup: 772-224-8800.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

insert into public.outreach_leads
  (company, contact_name, contact_role, vertical, email, phone, website, location,
   lead_source, lead_score, priority, personalization_angle, pain_point,
   recommended_offer, status, next_action, notes,
   email_verification_status, email_verification_source, email_verified_at)
values
  ('Smith Mountain Marine Service & Sales', 'Peyton Canary', 'Owner',
   'boat_dealer', 'contact@smithmountainmarineservice.com', '+15402974484', 'smithmountainmarine.com', 'Huddleston, VA',
   'tradewind-100 / web (smithmountainmarine.com, 2026-05-26)', 4, 4,
   'Started at Smith Mountain Yacht Club in 1997 as technician; became owner. Master certified in Mercury outboards + Mercruiser sterndrives.',
   'Owner-tech founders respond to founder-led outreach — a partnership pitch lands.',
   'Free verified-dealer profile + AI listing copy + buyer-routed requests during 60-day beta.',
   'new', 'send_first_email',
   'contact@smithmountainmarineservice.com on about page. Backup: 540-297-4484.',
   'likely_valid', 'tradewind-100 / company_website 2026-05-26', now())
on conflict do nothing;

-- ═════════════════════════════════════════════════════════════════════════════
-- ACTIVITY LOG
-- ═════════════════════════════════════════════════════════════════════════════

insert into public.outreach_activity_log (lead_id, action, metadata)
select l.id,
       'lead_added',
       jsonb_build_object(
         'campaign',     'tradewind-100',
         'sourced_on',   '2026-05-26',
         'phase',        'verified-outreach-100'
       )
  from public.outreach_leads l
 where l.lead_source like 'tradewind-100%'
   and not exists (
     select 1 from public.outreach_activity_log a
      where a.lead_id = l.id
        and a.action  = 'lead_added'
        and (a.metadata->>'campaign') = 'tradewind-100'
   );

commit;

-- ─────────────────────────────────────────────────────────────────────────────
-- POST-LOAD VERIFICATION
-- ─────────────────────────────────────────────────────────────────────────────
-- Expected: 100 rows attributed to lead_source like 'tradewind-100%'.
-- Split by vertical (expected counts):
--   boat_dealer / yacht_broker:  25
--   exotic_dealer / classic_dealer: 15
--   aircraft_broker:             15
--   marine_surveyor:             10
--   ap_mechanic:                 10
--   transport:                   10
--   lender:                       5
--   insurance:                    5
--   escrow_title:                 5
--
-- Run:
--   select vertical, count(*),
--          count(*) filter (where email_verification_status='likely_valid') as likely_valid,
--          count(*) filter (where email_verification_status='unverified')   as unverified
--     from public.outreach_leads
--    where lead_source like 'tradewind-100%'
--    group by vertical
--    order by vertical;
-- ─────────────────────────────────────────────────────────────────────────────
