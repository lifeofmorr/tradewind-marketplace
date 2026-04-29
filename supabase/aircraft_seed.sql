-- ============================================================================
-- TradeWind · Aircraft seed data
-- ============================================================================
-- 15 demo aircraft listings spanning singles, twins, turboprops, jets,
-- helicopters, vintage, and amphibious aircraft.
--
-- Run AFTER:
--   supabase/migrations/20260101000000_initial.sql
--   supabase/migrations/20260430_aircraft.sql      (extends listing_category)
--
-- Apply with:
--   psql "$SUPABASE_DB_URL" -f supabase/aircraft_seed.sql
--
-- Idempotent: ON CONFLICT (slug) DO NOTHING. Safe to re-run.
-- After seeding, run supabase/demo_score_patch.sql to populate deal/quality
-- scores and supabase/backfill-demo-photos.sql to attach Unsplash photos.
-- ============================================================================

do $$
declare
  seed_owner uuid;
  v_listing_id uuid;
begin
  select id into seed_owner from public.profiles
    where role = 'admin' order by created_at asc limit 1;
  if seed_owner is null then
    select id into seed_owner from public.profiles order by created_at asc limit 1;
  end if;
  if seed_owner is null then
    raise notice 'aircraft_seed: no profiles in DB yet — sign up first, then re-run.';
    return;
  end if;

  -- ── 15 aircraft listings ─────────────────────────────────────────────────
  -- Note: seats/range/cruise/useful_load live on aircraft_specs (inserted
  -- below), not on the listings table.
  insert into public.listings (
    slug, category, title, description, ai_summary,
    make, model, year, price_cents, currency, condition,
    city, state,
    seller_type, seller_id, status,
    is_demo, is_featured, published_at,
    deal_score, deal_score_label, quality_score, quality_label
  )
  select * from (values
    -- ── 4 single-engine piston ──────────────────────────────────────────
    ('2018-cirrus-sr22t-g6', 'aircraft_single_engine'::public.listing_category,
     '2018 Cirrus SR22T G6',
     'Turbo-normalized SR22T G6 with Perspective+ avionics, full TKS de-ice, BRS parachute, A/C, premium leather, hangared since new. Logs complete, ADS-B in/out, autopilot.',
     'Hangared 2018 Cirrus SR22T G6 — Perspective+, TKS de-ice, A/C, full logs.',
     'Cirrus', 'SR22T G6', 2018,
     64900000, 'USD', 'used',
     'Scottsdale', 'AZ',
     'private', seed_owner, 'active',
     true, true, now() - interval '3 days',
     null, null, null, null),

    ('2015-cessna-182t-skylane', 'aircraft_single_engine'::public.listing_category,
     '2015 Cessna 182T Skylane',
     'Garmin G1000 NXi, GFC700 autopilot, ADS-B in/out, leather, hangared. Annual fresh, mid-time engine, no damage history.',
     'Hangared 2015 Cessna 182T with G1000 NXi, GFC700, fresh annual.',
     'Cessna', '182T Skylane', 2015,
     42500000, 'USD', 'used',
     'Orlando', 'FL',
     'private', seed_owner, 'active',
     true, false, now() - interval '6 days',
     null, null, null, null),

    ('1975-piper-cherokee-six-300', 'aircraft_single_engine'::public.listing_category,
     '1975 Piper Cherokee Six 300',
     'Six-place workhorse, Garmin GTN 650, GTX 345 ADS-B, mid-time IO-540, fresh annual, club seating, great hauler.',
     '1975 Piper Cherokee Six 300 — six-place, GTN 650, ADS-B, mid-time IO-540.',
     'Piper', 'Cherokee Six 300', 1975,
     12500000, 'USD', 'used',
     'Nashville', 'TN',
     'private', seed_owner, 'active',
     true, false, now() - interval '11 days',
     null, null, null, null),

    ('2020-diamond-da40-ng', 'aircraft_single_engine'::public.listing_category,
     '2020 Diamond DA40 NG',
     'Jet-A diesel DA40 NG with G1000 NXi, GFC700, FIKI-ready, leather, low total time, hangared. Burns ~5 gph at altitude.',
     '2020 Diamond DA40 NG — diesel, G1000 NXi, low-time, hangared.',
     'Diamond', 'DA40 NG', 2020,
     51500000, 'USD', 'used',
     'Denver', 'CO',
     'private', seed_owner, 'active',
     true, true, now() - interval '2 days',
     null, null, null, null),

    -- ── 3 twin-engine piston ────────────────────────────────────────────
    ('2019-beechcraft-baron-g58', 'aircraft_twin_engine'::public.listing_category,
     '2019 Beechcraft Baron G58',
     'Cabin-class Baron G58 with G1000 NXi, dual GTC, GFC700 autopilot, FIKI, A/C, club seating, leather, fresh annual.',
     '2019 Baron G58 — G1000 NXi, FIKI, A/C, club seats.',
     'Beechcraft', 'Baron G58', 2019,
     135000000, 'USD', 'used',
     'Wichita', 'KS',
     'dealer', seed_owner, 'active',
     true, true, now() - interval '4 days',
     null, null, null, null),

    ('2008-piper-seneca-v', 'aircraft_twin_engine'::public.listing_category,
     '2008 Piper Seneca V',
     'Turbocharged Seneca V with Garmin G1000, GFC700, A/C, six-seats, mid-time engines, hangared, fresh annual.',
     '2008 Piper Seneca V — Garmin G1000, A/C, six seats.',
     'Piper', 'Seneca V', 2008,
     55000000, 'USD', 'used',
     'Houston', 'TX',
     'private', seed_owner, 'active',
     true, false, now() - interval '9 days',
     null, null, null, null),

    ('1978-cessna-310r', 'aircraft_twin_engine'::public.listing_category,
     '1978 Cessna 310R',
     'Classic 310R with Aspen E5, Garmin GTN 650, GTX 345 ADS-B, mid-time engines, no damage history, original logs since new.',
     '1978 Cessna 310R — Aspen E5, GTN 650, mid-time engines.',
     'Cessna', '310R', 1978,
     18500000, 'USD', 'used',
     'Ocala', 'FL',
     'private', seed_owner, 'active',
     true, false, now() - interval '14 days',
     null, null, null, null),

    -- ── 3 turboprops ────────────────────────────────────────────────────
    ('2016-pilatus-pc-12-ng', 'aircraft_turboprop'::public.listing_category,
     '2016 Pilatus PC-12 NG',
     'Honeywell Apex avionics, executive 6+1 interior, low total time, hangared, fresh phase inspection, FIKI, RVSM, all factory upgrades.',
     '2016 Pilatus PC-12 NG — Apex avionics, executive interior, hangared.',
     'Pilatus', 'PC-12 NG', 2016,
     420000000, 'USD', 'used',
     'White Plains', 'NY',
     'dealer', seed_owner, 'active',
     true, true, now() - interval '5 days',
     null, null, null, null),

    ('2012-king-air-350i', 'aircraft_turboprop'::public.listing_category,
     '2012 King Air 350i',
     'Pro Line 21 with IFIS, Collins TCAS, RVSM, executive interior with belted lavatory, fresh inspections, low-time PT6A engines.',
     '2012 King Air 350i — Pro Line 21, RVSM, executive interior.',
     'Beechcraft', 'King Air 350i', 2012,
     385000000, 'USD', 'used',
     'Dallas', 'TX',
     'dealer', seed_owner, 'active',
     true, false, now() - interval '7 days',
     null, null, null, null),

    ('2020-daher-tbm-940', 'aircraft_turboprop'::public.listing_category,
     '2020 Daher TBM 940',
     'Garmin G3000 with Homesafe emergency autoland, autothrottle, low total time, full factory paint and interior, hangared.',
     '2020 TBM 940 — G3000, Homesafe autoland, low-time, hangared.',
     'Daher', 'TBM 940', 2020,
     450000000, 'USD', 'used',
     'Boca Raton', 'FL',
     'private', seed_owner, 'active',
     true, true, now() - interval '1 day',
     null, null, null, null),

    -- ── 2 jets ──────────────────────────────────────────────────────────
    ('2019-cessna-citation-cj4', 'aircraft_jet'::public.listing_category,
     '2019 Cessna Citation CJ4',
     'Pro Line 21 with FMS-3000, dual FMS, RVSM, ADS-B Out, Aircell ATG-5000 wifi, low total time, fresh Doc 5 inspection, single-pilot certified.',
     '2019 Citation CJ4 — Pro Line 21, ATG-5000 wifi, single-pilot.',
     'Cessna', 'Citation CJ4', 2019,
     890000000, 'USD', 'used',
     'Van Nuys', 'CA',
     'dealer', seed_owner, 'active',
     true, true, now() - interval '2 days',
     null, null, null, null),

    ('2015-embraer-phenom-300', 'aircraft_jet'::public.listing_category,
     '2015 Embraer Phenom 300',
     'Prodigy Touch avionics, factory wifi, executive 7-seat club, RVSM, fresh inspections, sub-2,000 total time.',
     '2015 Phenom 300 — Prodigy Touch, wifi, low-time, executive interior.',
     'Embraer', 'Phenom 300', 2015,
     720000000, 'USD', 'used',
     'Teterboro', 'NJ',
     'dealer', seed_owner, 'active',
     true, false, now() - interval '8 days',
     null, null, null, null),

    -- ── 1 helicopter ────────────────────────────────────────────────────
    ('2017-robinson-r66-turbine', 'aircraft_helicopter'::public.listing_category,
     '2017 Robinson R66 Turbine',
     'R66 Turbine with Aspen Evolution, Garmin GTN 650, leather, A/C, low TT, popouts, fresh annual, no damage history.',
     '2017 R66 Turbine — Aspen Evolution, GTN 650, A/C, low-time.',
     'Robinson', 'R66 Turbine', 2017,
     98000000, 'USD', 'used',
     'San Diego', 'CA',
     'private', seed_owner, 'active',
     true, true, now() - interval '3 days',
     null, null, null, null),

    -- ── 1 vintage / warbird ─────────────────────────────────────────────
    ('1944-north-american-t-6-texan', 'aircraft_vintage'::public.listing_category,
     '1944 North American T-6 Texan',
     'WWII-era T-6 Texan, ground-up restoration, fresh annual, P&W R-1340, original specs, airshow-ready, hangared. FAA limited category.',
     '1944 T-6 Texan — restored, R-1340, airshow-ready, hangared.',
     'North American', 'T-6 Texan', 1944,
     28500000, 'USD', 'restored',
     'Oshkosh', 'WI',
     'private', seed_owner, 'active',
     true, true, now() - interval '6 days',
     null, null, null, null),

    -- ── 1 amphibious ────────────────────────────────────────────────────
    ('2021-icon-a5', 'aircraft_single_engine'::public.listing_category,
     '2021 Icon A5',
     'Light-sport amphibious A5 with Garmin G3X Touch, BRS parachute, folding wings, trailer, low total time. SLSA certified.',
     '2021 Icon A5 — amphibious LSA, G3X Touch, BRS, folding wings.',
     'Icon', 'A5', 2021,
     38900000, 'USD', 'used',
     'Clearwater', 'FL',
     'private', seed_owner, 'active',
     true, false, now() - interval '4 days',
     null, null, null, null)
  ) as t(
    slug, category, title, description, ai_summary,
    make, model, year, price_cents, currency, condition,
    city, state,
    seller_type, seller_id, status,
    is_demo, is_featured, published_at,
    deal_score, deal_score_label, quality_score, quality_label
  )
  on conflict (slug) do nothing;

  -- ── aircraft_specs detail rows ────────────────────────────────────────
  -- Linked by slug → listing_id. Each spec row carries the aviation-specific
  -- detail used by the listing detail page and asset passport.
  with link as (
    select id, slug from public.listings
    where slug in (
      '2018-cirrus-sr22t-g6','2015-cessna-182t-skylane','1975-piper-cherokee-six-300',
      '2020-diamond-da40-ng','2019-beechcraft-baron-g58','2008-piper-seneca-v',
      '1978-cessna-310r','2016-pilatus-pc-12-ng','2012-king-air-350i',
      '2020-daher-tbm-940','2019-cessna-citation-cj4','2015-embraer-phenom-300',
      '2017-robinson-r66-turbine','1944-north-american-t-6-texan','2021-icon-a5'
    )
  )
  insert into public.aircraft_specs (
    listing_id, n_number, total_time_hours, airframe_hours, engine_hours,
    smoh_hours, tbo_hours, logbooks_complete, annual_inspection_date,
    airworthiness_status, avionics_suite, ads_b, autopilot,
    seats, range_nm, cruise_speed_ktas, useful_load_lbs, hangared
  )
  select id,
    case slug
      when '2018-cirrus-sr22t-g6'           then 'N822TC'
      when '2015-cessna-182t-skylane'       then 'N512SK'
      when '1975-piper-cherokee-six-300'    then 'N75PC6'
      when '2020-diamond-da40-ng'           then 'N40DNG'
      when '2019-beechcraft-baron-g58'      then 'N58BBN'
      when '2008-piper-seneca-v'            then 'N508SV'
      when '1978-cessna-310r'               then 'N310RR'
      when '2016-pilatus-pc-12-ng'          then 'N12PNG'
      when '2012-king-air-350i'             then 'N350KI'
      when '2020-daher-tbm-940'             then 'N940TB'
      when '2019-cessna-citation-cj4'       then 'N4CCJ'
      when '2015-embraer-phenom-300'        then 'N300EP'
      when '2017-robinson-r66-turbine'      then 'N66RBT'
      when '1944-north-american-t-6-texan'  then 'N44TX6'
      when '2021-icon-a5'                   then 'N21IA5'
    end,
    case slug
      when '2018-cirrus-sr22t-g6'           then 1180
      when '2015-cessna-182t-skylane'       then 1620
      when '1975-piper-cherokee-six-300'    then 5400
      when '2020-diamond-da40-ng'           then 720
      when '2019-beechcraft-baron-g58'      then 1240
      when '2008-piper-seneca-v'            then 2400
      when '1978-cessna-310r'               then 4800
      when '2016-pilatus-pc-12-ng'          then 2150
      when '2012-king-air-350i'             then 3920
      when '2020-daher-tbm-940'             then 580
      when '2019-cessna-citation-cj4'       then 1080
      when '2015-embraer-phenom-300'        then 1860
      when '2017-robinson-r66-turbine'      then 980
      when '1944-north-american-t-6-texan'  then 7800
      when '2021-icon-a5'                   then 240
    end,
    case slug
      when '2018-cirrus-sr22t-g6'           then 1180
      when '2015-cessna-182t-skylane'       then 1620
      when '1975-piper-cherokee-six-300'    then 5400
      when '2020-diamond-da40-ng'           then 720
      when '2019-beechcraft-baron-g58'      then 1240
      when '2008-piper-seneca-v'            then 2400
      when '1978-cessna-310r'               then 4800
      when '2016-pilatus-pc-12-ng'          then 2150
      when '2012-king-air-350i'             then 3920
      when '2020-daher-tbm-940'             then 580
      when '2019-cessna-citation-cj4'       then 1080
      when '2015-embraer-phenom-300'        then 1860
      when '2017-robinson-r66-turbine'      then 980
      when '1944-north-american-t-6-texan'  then 7800
      when '2021-icon-a5'                   then 240
    end,
    case slug
      when '2018-cirrus-sr22t-g6'           then 1180
      when '2015-cessna-182t-skylane'       then 720
      when '1975-piper-cherokee-six-300'    then 920
      when '2020-diamond-da40-ng'           then 720
      when '2019-beechcraft-baron-g58'      then 620
      when '2008-piper-seneca-v'            then 880
      when '1978-cessna-310r'               then 540
      when '2016-pilatus-pc-12-ng'          then 2150
      when '2012-king-air-350i'             then 1820
      when '2020-daher-tbm-940'             then 580
      when '2019-cessna-citation-cj4'       then 1080
      when '2015-embraer-phenom-300'        then 1860
      when '2017-robinson-r66-turbine'      then 980
      when '1944-north-american-t-6-texan'  then 480
      when '2021-icon-a5'                   then 240
    end,
    null, -- smoh_hours
    case slug
      when '2018-cirrus-sr22t-g6'           then 2000
      when '2015-cessna-182t-skylane'       then 2000
      when '1975-piper-cherokee-six-300'    then 2000
      when '2020-diamond-da40-ng'           then 1800
      when '2019-beechcraft-baron-g58'      then 1700
      when '2008-piper-seneca-v'            then 1800
      when '1978-cessna-310r'               then 1700
      when '2016-pilatus-pc-12-ng'          then 3500
      when '2012-king-air-350i'             then 3600
      when '2020-daher-tbm-940'             then 3600
      when '2019-cessna-citation-cj4'       then 4000
      when '2015-embraer-phenom-300'        then 4000
      when '2017-robinson-r66-turbine'      then 2200
      when '1944-north-american-t-6-texan'  then 1200
      when '2021-icon-a5'                   then 1500
    end,
    true, -- logbooks_complete
    (now() - interval '4 months')::date,
    'standard',
    case slug
      when '2018-cirrus-sr22t-g6'           then 'Cirrus Perspective+ (Garmin)'
      when '2015-cessna-182t-skylane'       then 'Garmin G1000 NXi'
      when '1975-piper-cherokee-six-300'    then 'Garmin GTN 650 + GTX 345'
      when '2020-diamond-da40-ng'           then 'Garmin G1000 NXi'
      when '2019-beechcraft-baron-g58'      then 'Garmin G1000 NXi'
      when '2008-piper-seneca-v'            then 'Garmin G1000'
      when '1978-cessna-310r'               then 'Aspen E5 + Garmin GTN 650'
      when '2016-pilatus-pc-12-ng'          then 'Honeywell Primus Apex'
      when '2012-king-air-350i'             then 'Rockwell Collins Pro Line 21 IFIS'
      when '2020-daher-tbm-940'             then 'Garmin G3000'
      when '2019-cessna-citation-cj4'       then 'Rockwell Collins Pro Line 21'
      when '2015-embraer-phenom-300'        then 'Garmin Prodigy Touch'
      when '2017-robinson-r66-turbine'      then 'Aspen Evolution + GTN 650'
      when '1944-north-american-t-6-texan'  then 'Round-dial vintage panel'
      when '2021-icon-a5'                   then 'Garmin G3X Touch'
    end,
    true, -- ads_b
    case slug
      when '2018-cirrus-sr22t-g6'           then 'Garmin GFC700'
      when '2015-cessna-182t-skylane'       then 'Garmin GFC700'
      when '1975-piper-cherokee-six-300'    then 'STEC 55X'
      when '2020-diamond-da40-ng'           then 'Garmin GFC700'
      when '2019-beechcraft-baron-g58'      then 'Garmin GFC700'
      when '2008-piper-seneca-v'            then 'Garmin GFC700'
      when '1978-cessna-310r'               then 'STEC 55X'
      when '2016-pilatus-pc-12-ng'          then 'Honeywell APS-65'
      when '2012-king-air-350i'             then 'Collins APS-85'
      when '2020-daher-tbm-940'             then 'Garmin GFC 700 + Homesafe'
      when '2019-cessna-citation-cj4'       then 'Collins APS-3000'
      when '2015-embraer-phenom-300'        then 'Garmin GFC 3000'
      when '2017-robinson-r66-turbine'      then null
      when '1944-north-american-t-6-texan'  then null
      when '2021-icon-a5'                   then null
    end,
    case slug
      when '2018-cirrus-sr22t-g6'           then 5
      when '2015-cessna-182t-skylane'       then 4
      when '1975-piper-cherokee-six-300'    then 6
      when '2020-diamond-da40-ng'           then 4
      when '2019-beechcraft-baron-g58'      then 6
      when '2008-piper-seneca-v'            then 6
      when '1978-cessna-310r'               then 6
      when '2016-pilatus-pc-12-ng'          then 9
      when '2012-king-air-350i'             then 11
      when '2020-daher-tbm-940'             then 6
      when '2019-cessna-citation-cj4'       then 9
      when '2015-embraer-phenom-300'        then 8
      when '2017-robinson-r66-turbine'      then 5
      when '1944-north-american-t-6-texan'  then 2
      when '2021-icon-a5'                   then 2
    end,
    case slug
      when '2018-cirrus-sr22t-g6'           then 1021
      when '2015-cessna-182t-skylane'       then 915
      when '1975-piper-cherokee-six-300'    then 700
      when '2020-diamond-da40-ng'           then 940
      when '2019-beechcraft-baron-g58'      then 1480
      when '2008-piper-seneca-v'            then 828
      when '1978-cessna-310r'               then 1100
      when '2016-pilatus-pc-12-ng'          then 1845
      when '2012-king-air-350i'             then 1806
      when '2020-daher-tbm-940'             then 1730
      when '2019-cessna-citation-cj4'       then 2165
      when '2015-embraer-phenom-300'        then 1971
      when '2017-robinson-r66-turbine'      then 350
      when '1944-north-american-t-6-texan'  then 750
      when '2021-icon-a5'                   then 427
    end,
    case slug
      when '2018-cirrus-sr22t-g6'           then 213
      when '2015-cessna-182t-skylane'       then 145
      when '1975-piper-cherokee-six-300'    then 145
      when '2020-diamond-da40-ng'           then 154
      when '2019-beechcraft-baron-g58'      then 202
      when '2008-piper-seneca-v'            then 188
      when '1978-cessna-310r'               then 196
      when '2016-pilatus-pc-12-ng'          then 280
      when '2012-king-air-350i'             then 312
      when '2020-daher-tbm-940'             then 330
      when '2019-cessna-citation-cj4'       then 451
      when '2015-embraer-phenom-300'        then 453
      when '2017-robinson-r66-turbine'      then 110
      when '1944-north-american-t-6-texan'  then 145
      when '2021-icon-a5'                   then 95
    end,
    case slug
      when '2018-cirrus-sr22t-g6'           then 1235
      when '2015-cessna-182t-skylane'       then 1100
      when '1975-piper-cherokee-six-300'    then 1620
      when '2020-diamond-da40-ng'           then 940
      when '2019-beechcraft-baron-g58'      then 1690
      when '2008-piper-seneca-v'            then 1450
      when '1978-cessna-310r'               then 1850
      when '2016-pilatus-pc-12-ng'          then 4400
      when '2012-king-air-350i'             then 5145
      when '2020-daher-tbm-940'             then 1442
      when '2019-cessna-citation-cj4'       then 4080
      when '2015-embraer-phenom-300'        then 3260
      when '2017-robinson-r66-turbine'      then 1190
      when '1944-north-american-t-6-texan'  then 1100
      when '2021-icon-a5'                   then 430
    end,
    true -- hangared
  from link
  on conflict (listing_id) do nothing;

  -- ── cover_photo_url backfill ─────────────────────────────────────────
  -- A first-slot Unsplash image keyed off the new aircraft categories so
  -- the marketplace grid is not blank pre-photo-upload.
  update public.listings
     set cover_photo_url = case category
       when 'aircraft_single_engine' then 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1200&q=80&auto=format&fit=crop'
       when 'aircraft_twin_engine'   then 'https://images.unsplash.com/photo-1531642765602-5cae8bbbf285?w=1200&q=80&auto=format&fit=crop'
       when 'aircraft_turboprop'     then 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=1200&q=80&auto=format&fit=crop'
       when 'aircraft_jet'           then 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=1200&q=80&auto=format&fit=crop'
       when 'aircraft_helicopter'    then 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1200&q=80&auto=format&fit=crop'
       when 'aircraft_vintage'       then 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1200&q=80&auto=format&fit=crop'
       else cover_photo_url end
   where cover_photo_url is null
     and category in (
       'aircraft_single_engine','aircraft_twin_engine','aircraft_turboprop',
       'aircraft_jet','aircraft_helicopter','aircraft_vintage'
     );

  raise notice 'aircraft_seed: 15 aircraft listings + specs seeded.';
end $$;
