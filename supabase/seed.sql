-- ============================================================================
-- TradeWind · Phase 1P · seed data
-- ============================================================================
-- Sample dealers, service providers, and 8 listings so the homepage and
-- browse views aren't empty in dev.
--
-- Apply with:
--   psql "$SUPABASE_DB_URL" -f supabase/seed.sql
--
-- Idempotent: safe to re-run. Uses ON CONFLICT (slug) DO NOTHING.
-- Listings are seeded with seller_id = first admin (or first profile if no
-- admin yet). If `profiles` is empty, this script no-ops gracefully.
-- ============================================================================

do $$
declare
  seed_owner uuid;
  dealer_one uuid;
  dealer_two uuid;
begin
  select id into seed_owner from public.profiles
    where role = 'admin' order by created_at asc limit 1;
  if seed_owner is null then
    select id into seed_owner from public.profiles order by created_at asc limit 1;
  end if;
  if seed_owner is null then
    raise notice 'No profiles in DB yet — sign up first, then re-run seed.sql.';
    return;
  end if;

  -- ── dealers ──────────────────────────────────────────────────────────────
  insert into public.dealers (
    slug, name, description, owner_id, primary_category, city, state,
    is_verified, is_featured, website, phone, email
  ) values
    ('outpost-marine', 'Outpost Marine',
     'Center-console specialists serving the Gulf coast since 2008.',
     seed_owner, 'center_console', 'Tampa', 'FL', true, true,
     'https://outpostmarine.example', '+1-727-555-0140', 'sales@outpostmarine.example'),
    ('valley-exotics', 'Valley Exotics',
     'Curated Italian and German performance autos. Worldwide delivery.',
     seed_owner, 'exotic', 'Scottsdale', 'AZ', true, true,
     'https://valleyexotics.example', '+1-480-555-0166', 'concierge@valleyexotics.example')
  on conflict (slug) do nothing;

  select id into dealer_one from public.dealers where slug = 'outpost-marine';
  select id into dealer_two from public.dealers where slug = 'valley-exotics';

  -- ── service providers ────────────────────────────────────────────────────
  insert into public.service_providers (
    slug, name, category, description, owner_id, city, state,
    is_verified, website, phone, email
  ) values
    ('atlantic-marine-survey', 'Atlantic Marine Survey', 'inspector_surveyor',
     'SAMS-certified marine surveyors. Pre-purchase, insurance, damage.',
     seed_owner, 'Annapolis', 'MD', true,
     'https://atlanticmarinesurvey.example', '+1-410-555-0188', 'survey@atlanticmarine.example'),
    ('keystone-haulers', 'Keystone Haulers', 'transport',
     'Coast-to-coast yacht and exotic transport. Enclosed and open trailers.',
     seed_owner, 'Pittsburgh', 'PA', true,
     'https://keystonehaulers.example', '+1-412-555-0177', 'dispatch@keystone.example'),
    ('helm-finance', 'Helm Finance', 'lender',
     'Marine and exotic-auto financing partners. Soft pulls, fast decisions.',
     seed_owner, 'Charlotte', 'NC', false,
     'https://helmfinance.example', '+1-704-555-0144', 'apply@helmfinance.example')
  on conflict (slug) do nothing;

  -- ── listings ─────────────────────────────────────────────────────────────
  -- 4 boats, 4 autos. All active. Two featured. Pre-scored so the buyer
  -- detail page (Deal Score / Cost-to-Own / Buy-Ready) renders out of the
  -- box; demo_score_patch.sql does the same for production demo data.
  insert into public.listings (
    slug, category, title, description, ai_summary, make, model, year,
    price_cents, currency, condition, length_ft, hours, engine_count,
    engine_make, engine_hp, mileage, drivetrain, fuel_type,
    city, state, seller_type, seller_id, dealer_id, status,
    is_featured, published_at, view_count, inquiry_count, save_count,
    deal_score, deal_score_label, quality_score, quality_label
  ) values
    ('2022-boston-whaler-320-outrage', 'center_console',
     '2022 Boston Whaler 320 Outrage',
     'Loaded 320 Outrage with twin Mercury V8 Verados, hardtop with rod holders, Garmin GPSMAP 8616 dual screens, Seakeeper 3, hydraulic steering, Lenco trim tabs, fresh service through May.',
     'Lightly used 2022 Boston Whaler 320 Outrage with Seakeeper, twin V8 Verados, and full electronics package.',
     'Boston Whaler', '320 Outrage', 2022,
     32500000, 'USD', 'used', 32.0, 240, 2, 'Mercury', 400,
     null, null, null,
     'Tampa', 'FL', 'dealer', seed_owner, dealer_one, 'active',
     true, now() - interval '2 days', 1280, 14, 41,
     74, 'Fair Deal', 84, 'Strong'),

    ('2024-yellowfin-39-offshore', 'center_console',
     '2024 Yellowfin 39 Offshore',
     'Triple Mercury 600 Verados, full Garmin OneHelm electronics, premium tower, sea-keeper-ready, located in Stuart.',
     'Triple-rigged 2024 Yellowfin 39 — fishing-loaded with the latest Garmin and tower.',
     'Yellowfin', '39 Offshore', 2024,
     78900000, 'USD', 'used', 39.0, 90, 3, 'Mercury', 600,
     null, null, null,
     'Stuart', 'FL', 'dealer', seed_owner, dealer_one, 'active',
     true, now() - interval '5 days', 2104, 22, 78,
     69, 'Fair Deal', 91, 'Premium'),

    ('2018-sea-ray-sundancer-320', 'boat',
     '2018 Sea Ray Sundancer 320',
     'Twin 350 MAG MPI, low hours, generator, AC, immaculate gel, dry-stored. Includes trailer.',
     'Garage-kept 2018 Sea Ray Sundancer 320 with trailer and full service history.',
     'Sea Ray', 'Sundancer 320', 2018,
     16500000, 'USD', 'used', 32.0, 320, 2, 'MerCruiser', 350,
     null, null, null,
     'Sarasota', 'FL', 'private', seed_owner, null, 'active',
     false, now() - interval '12 days', 540, 8, 19,
     71, 'Fair Deal', 78, 'Strong'),

    ('2021-grady-white-canyon-326', 'center_console',
     '2021 Grady-White Canyon 326',
     'Twin Yamaha F300 XCA, factory hardtop, second station, Garmin trio, fresh bottom, washdown.',
     'Loaded 2021 Grady-White Canyon 326 — twin Yamaha 300s, fresh bottom, ready to fish.',
     'Grady-White', 'Canyon 326', 2021,
     27800000, 'USD', 'used', 32.0, 410, 2, 'Yamaha', 300,
     null, null, null,
     'Charleston', 'SC', 'private', seed_owner, null, 'active',
     false, now() - interval '8 days', 770, 11, 22,
     76, 'Fair Deal', 82, 'Strong'),

    ('2023-porsche-911-gt3-touring', 'exotic',
     '2023 Porsche 911 (992) GT3 Touring',
     '6-speed manual, GT Silver / Black leather, PCCB, front-axle lift, full PPF, one owner. Books, two keys, all service Porsche dealer.',
     'One-owner 2023 992 GT3 Touring, 6-speed, PCCB, front-lift, full PPF.',
     'Porsche', '911 GT3 Touring', 2023,
     27500000, 'USD', 'used', null, null, null, null, null,
     7800, 'rwd', 'gas',
     'Scottsdale', 'AZ', 'dealer', seed_owner, dealer_two, 'active',
     true, now() - interval '1 day', 3155, 28, 102,
     86, 'Great Deal', 94, 'Premium'),

    ('2022-ford-f250-tremor-diesel', 'truck',
     '2022 Ford F-250 Tremor 6.7 Powerstroke',
     'Tremor off-road package, 6.7 Powerstroke, factory bedliner, tonneau, leveled on 35s, clean Carfax.',
     'Lightly used 2022 F-250 Tremor 6.7 diesel — leveled on 35s, factory tonneau, clean Carfax.',
     'Ford', 'F-250 Tremor', 2022,
     7800000, 'USD', 'used', null, null, null, null, null,
     22500, '4wd', 'diesel',
     'Charlotte', 'NC', 'private', seed_owner, null, 'active',
     false, now() - interval '4 days', 920, 9, 17,
     81, 'Great Deal', 79, 'Strong'),

    ('1971-chevrolet-chevelle-ss-396', 'classic',
     '1971 Chevrolet Chevelle SS 396 (Restomod)',
     'Frame-off restomod. LS3 swap, Tremec 6-speed, 4-wheel disc, coilovers, AC, leather. Built for cruising and showing.',
     '1971 Chevelle SS restomod — LS3, Tremec 6-speed, coilovers, AC, ready to drive anywhere.',
     'Chevrolet', 'Chevelle SS', 1971,
     14250000, 'USD', 'restored', null, null, null, null, null,
     1200, 'rwd', 'gas',
     'Austin', 'TX', 'private', seed_owner, null, 'active',
     false, now() - interval '15 days', 612, 6, 12,
     63, 'High Price', 80, 'Strong'),

    ('2024-airstream-classic-30rb', 'rv',
     '2024 Airstream Classic 30RB',
     'Like-new Classic 30RB twin axle. Solar pre-wire, Smart Control, leather. Used for one cross-country trip.',
     'Like-new 2024 Airstream Classic 30RB — solar-ready, smart control, premium leather.',
     'Airstream', 'Classic 30RB', 2024,
     19450000, 'USD', 'used', 30.0, null, null, null, null,
     null, null, null,
     'Jackson Hole', 'WY', 'private', seed_owner, null, 'active',
     false, now() - interval '3 days', 458, 4, 13,
     78, 'Fair Deal', 88, 'Strong')
  on conflict (slug) do nothing;

  -- backfill cover_photo_url with a stable Unsplash-style placeholder.
  -- Replace with real storage URLs once photos are uploaded.
  update public.listings
     set cover_photo_url = case category
       when 'center_console' then 'https://images.unsplash.com/photo-1502209524164-acea936639a2?w=1200'
       when 'boat' then 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200'
       when 'yacht' then 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200'
       when 'performance_boat' then 'https://images.unsplash.com/photo-1501761095094-94d36f57edbb?w=1200'
       when 'car' then 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200'
       when 'truck' then 'https://images.unsplash.com/photo-1547038577-da80abbc4f19?w=1200'
       when 'exotic' then 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=1200'
       when 'classic' then 'https://images.unsplash.com/photo-1485463611174-f302f6a5c1c9?w=1200'
       when 'powersports' then 'https://images.unsplash.com/photo-1558981852-426c6c22a060?w=1200'
       when 'rv' then 'https://images.unsplash.com/photo-1601158935942-52255782d322?w=1200'
       else null end
   where cover_photo_url is null
     and slug in (
       '2022-boston-whaler-320-outrage','2024-yellowfin-39-offshore','2018-sea-ray-sundancer-320',
       '2021-grady-white-canyon-326','2023-porsche-911-gt3-touring','2022-ford-f250-tremor-diesel',
       '1971-chevrolet-chevelle-ss-396','2024-airstream-classic-30rb'
     );

  -- ── one sample blog post + market report so /blog and /market-reports
  --    have something even in fresh dev.
  insert into public.blog_posts (slug, title, excerpt, body_md, is_published, published_at)
  values (
    'why-tradewind', 'Why TradeWind',
    'Boats and autos deserve a marketplace that takes them seriously.',
    e'## The opening pitch\n\nMost listings are noisy. Most marketplaces are not designed for the kind of money real boats and real cars cost. TradeWind is built for people who care.',
    true, now()
  ) on conflict (slug) do nothing;

  insert into public.market_reports (slug, title, summary, body_md, category, region, is_published, published_at)
  values (
    'q2-2026-center-console-report', 'Q2 2026 · Center-console market',
    'A snapshot of saltwater center-console pricing across the southeast.',
    e'## Q2 snapshot\n\nUsed 32–39ft center-consoles continued to soften in Q2 2026. Triple-engine boats with sub-200 hours held value best.\n\n### Key drivers\n\n- Hours and engine count dominate pricing\n- Florida and Carolina markets remained the most active\n- Triple-rigged boats commanded a 12% premium over twins',
    'center_console', 'Southeast US', true, now()
  ) on conflict (slug) do nothing;

  -- ── Phase 3 sample data: auctions, conversations, reviews ────────────────

  -- Sample auctions (only created if the auctions table exists — safe-guarded
  -- so you can run this seed before the Phase 3 migration without exploding).
  if to_regclass('public.auctions') is not null then
    -- Live auction on the Yellowfin (ends in 3 days)
    insert into public.auctions (
      listing_id, start_time, end_time,
      starting_price_cents, reserve_price_cents,
      current_bid_cents, bid_count, status
    )
    select id, now() - interval '1 day', now() + interval '3 days',
           70000000, 75000000, 71500000, 3, 'live'
      from public.listings where slug = '2024-yellowfin-39-offshore'
    on conflict do nothing;

    -- Upcoming auction on the GT3 Touring (starts in 2 days)
    insert into public.auctions (
      listing_id, start_time, end_time,
      starting_price_cents, reserve_price_cents, status
    )
    select id, now() + interval '2 days', now() + interval '9 days',
           250000000, 270000000, 'upcoming'
      from public.listings where slug = '2023-porsche-911-gt3-touring'
    on conflict do nothing;
  end if;

  -- Sample reviews on dealers
  if to_regclass('public.reviews') is not null then
    insert into public.reviews (reviewer_id, dealer_id, rating, title, body, is_published)
    select seed_owner, dealer_one, 5,
           'Bought my first center-console here',
           'Outpost handled everything from sea trial to delivery. Smooth.',
           true
    on conflict do nothing;

    insert into public.reviews (reviewer_id, dealer_id, rating, title, body, is_published)
    select seed_owner, dealer_two, 5,
           'GT3 was exactly as described',
           'Walked through the car for 90 minutes. No surprises. PPI checked clean.',
           true
    on conflict do nothing;
  end if;

  -- Sample conversation seeded only if there's a 2nd profile to message with.
  if to_regclass('public.conversations') is not null then
    -- (no-op if only one profile exists; conversations need 2 participants)
    null;
  end if;
end $$;
