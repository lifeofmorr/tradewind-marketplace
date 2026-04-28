-- ============================================================================
-- TradeWind · Seed data · 50 demo listings + 5 dealers + 20 service providers
-- ============================================================================
-- Idempotent: every insert uses ON CONFLICT (slug) DO NOTHING.
-- All rows are tagged is_demo=true and either condition='demo' (listings)
-- or carry a [DEMO ...] marker so we can purge them before public launch.
--
-- Owner / seller for every row is the platform founder so RLS lets you edit:
--   6bdb133b-3b62-4c45-89d4-b4f7a259da40
--
-- Apply with:
--   psql "$SUPABASE_DB_URL" -f supabase/seed.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. DEALERS  (5)
-- ----------------------------------------------------------------------------
insert into public.dealers
  (slug, name, description, website, phone, email, city, state,
   primary_category, is_verified, is_featured, owner_id)
values
  ('demo-blue-water-marine',
   'Blue Water Marine [DEMO]',
   '[DEMO DEALER] Charleston-based saltwater specialist. Center consoles, sportfishers, and offshore rigs from 24-50ft. Family owned since 1998.',
   'https://example.com/blue-water-marine',
   '843-555-0142', 'sales@example-bluewater.com',
   'Charleston', 'SC',
   'center_console', true, true,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  ('demo-gulf-coast-yachts',
   'Gulf Coast Yachts [DEMO]',
   '[DEMO DEALER] Naples premier yacht broker. Sport yachts, motoryachts, and convertibles 38-80ft. Authorized Tiara, Pursuit, and Viking dealer.',
   'https://example.com/gulf-coast-yachts',
   '239-555-0188', 'info@example-gulfcoastyachts.com',
   'Naples', 'FL',
   'yacht', true, true,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  ('demo-overland-motors',
   'Overland Motors [DEMO]',
   '[DEMO DEALER] Knoxville off-road and overland specialty dealer. Late-model 4x4 trucks, SUVs, and adventure builds. Lift kits, racks, and recovery gear in-house.',
   'https://example.com/overland-motors',
   '865-555-0173', 'team@example-overlandmotors.com',
   'Knoxville', 'TN',
   'truck', true, true,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  ('demo-precision-exotics',
   'Precision Exotics [DEMO]',
   '[DEMO DEALER] Miami exotic and classic dealer. Porsche, Ferrari, AMG, and pre-1975 American muscle. Concierge delivery anywhere in the continental US.',
   'https://example.com/precision-exotics',
   '305-555-0194', 'concierge@example-precisionexotics.com',
   'Miami', 'FL',
   'exotic', true, true,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  ('demo-lakeside-auto',
   'Lakeside Auto [DEMO]',
   '[DEMO DEALER] Charlotte-area family dealership. Late-model sedans, SUVs, and EVs with full service history. CarFax and pre-purchase inspection on every car.',
   'https://example.com/lakeside-auto',
   '704-555-0119', 'sales@example-lakesideauto.com',
   'Charlotte', 'NC',
   'car', true, false,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40')
on conflict (slug) do nothing;


-- ----------------------------------------------------------------------------
-- 2. SERVICE PROVIDERS  (10 services + 5 transport + 5 lender/insurance = 20)
-- ----------------------------------------------------------------------------
insert into public.service_providers
  (slug, name, category, description, website, phone, email,
   city, state, service_radius_mi, is_verified, is_featured, owner_id)
values
  -- Marine mechanics (2)
  ('demo-coastal-marine-repair',
   'Coastal Marine Repair [DEMO]',
   'marine_mechanic',
   '[DEMO PROVIDER] Mercury, Yamaha, and Volvo certified. Outboards, inboards, and sterndrives. Mobile service across South FL.',
   'https://example.com/coastal-marine-repair',
   '305-555-0211', 'service@example-coastalmarine.com',
   'Miami', 'FL', 75, true, true,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  ('demo-lowcountry-outboards',
   'Lowcountry Outboards [DEMO]',
   'marine_mechanic',
   '[DEMO PROVIDER] Charleston-based mobile outboard service. Mercury Pro and Yamaha Master Tech on staff. Same-week scheduling.',
   'https://example.com/lowcountry-outboards',
   '843-555-0265', 'shop@example-lowcountryob.com',
   'Charleston', 'SC', 60, true, false,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  -- Surveyors / inspectors (2)
  ('demo-tidewater-marine-surveyors',
   'Tidewater Marine Surveyors [DEMO]',
   'inspector_surveyor',
   '[DEMO PROVIDER] SAMS-certified pre-purchase, insurance, and damage surveys. Hull, rigging, and engine analysis. Reports in 48 hours.',
   'https://example.com/tidewater-surveyors',
   '954-555-0237', 'survey@example-tidewatersurvey.com',
   'Fort Lauderdale', 'FL', 200, true, true,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  ('demo-carolina-pre-purchase',
   'Carolina Pre-Purchase Inspections [DEMO]',
   'inspector_surveyor',
   '[DEMO PROVIDER] Mobile vehicle and boat inspections across the Carolinas. ASE master + ABYC certified inspectors. Same-day report.',
   'https://example.com/carolina-prepurchase',
   '704-555-0241', 'inspect@example-carolinapp.com',
   'Charlotte', 'NC', 150, true, false,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  -- Detailers (2)
  ('demo-smoky-mountain-detail',
   'Smoky Mountain Detail [DEMO]',
   'detailer',
   '[DEMO PROVIDER] Ceramic coatings, paint correction, and full reconditioning. Mobile service across East Tennessee.',
   'https://example.com/smoky-mtn-detail',
   '865-555-0254', 'book@example-smokymtndetail.com',
   'Knoxville', 'TN', 80, true, true,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  ('demo-yacht-shine-detailing',
   'Yacht Shine Detailing [DEMO]',
   'detailer',
   '[DEMO PROVIDER] Premium yacht and exotic-car detailing. Marine-grade ceramic, gel-coat restoration, interior protection.',
   'https://example.com/yacht-shine',
   '239-555-0298', 'shine@example-yachtshine.com',
   'Naples', 'FL', 90, true, true,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  -- Auto mechanics (2)
  ('demo-blue-ridge-auto',
   'Blue Ridge Auto Service [DEMO]',
   'auto_mechanic',
   '[DEMO PROVIDER] Independent shop specializing in domestic trucks and SUVs. Engine, suspension, and lift kit installs. ASE certified.',
   'https://example.com/blue-ridge-auto',
   '865-555-0312', 'shop@example-blueridgeauto.com',
   'Knoxville', 'TN', 50, true, false,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  ('demo-piedmont-european',
   'Piedmont European [DEMO]',
   'auto_mechanic',
   '[DEMO PROVIDER] BMW, Mercedes, Porsche, and Audi independent specialist. Bosch-certified diagnostics. Loaner cars available.',
   'https://example.com/piedmont-european',
   '704-555-0327', 'service@example-piedmonteuro.com',
   'Charlotte', 'NC', 40, true, true,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  -- Wrap shop (1)
  ('demo-paradise-wraps',
   'Paradise Wraps [DEMO]',
   'wrap_shop',
   '[DEMO PROVIDER] Full vinyl wraps, color change, paint protection film, and fleet branding. 3M and Avery preferred installer.',
   'https://example.com/paradise-wraps',
   '305-555-0341', 'wraps@example-paradisewraps.com',
   'Miami', 'FL', 60, true, false,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  -- Audio shop (1)
  ('demo-volunteer-audio',
   'Volunteer Audio & Tint [DEMO]',
   'audio_shop',
   '[DEMO PROVIDER] Custom car and marine audio, ceramic tint, dash cams, radar. JL Audio, Focal, and Wet Sounds dealer.',
   'https://example.com/volunteer-audio',
   '865-555-0356', 'install@example-volaudio.com',
   'Knoxville', 'TN', 45, true, false,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  -- Transport partners (5)
  ('demo-east-coast-boat-transport',
   'East Coast Boat Transport [DEMO]',
   'transport',
   '[DEMO PARTNER] Hydraulic trailers up to 50ft. FL/GA/SC/NC routes daily. Shrink-wrap and survey coordination included.',
   'https://example.com/east-coast-boat-transport',
   '954-555-0411', 'dispatch@example-ecbt.com',
   'Pompano Beach', 'FL', 1500, true, true,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  ('demo-interstate-auto-haulers',
   'Interstate Auto Haulers [DEMO]',
   'transport',
   '[DEMO PARTNER] Open and enclosed auto transport, all 48 states. Exotic and classic specialists. $1M cargo insurance.',
   'https://example.com/interstate-auto-haulers',
   '214-555-0432', 'quote@example-interstateauto.com',
   'Dallas', 'TX', 3000, true, true,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  ('demo-southeast-marine-logistics',
   'Southeast Marine Logistics [DEMO]',
   'transport',
   '[DEMO PARTNER] Coastal-state marine logistics. Lift, transport, splash, and storage. Port-to-port quotes within 24 hours.',
   'https://example.com/southeast-marine-logistics',
   '843-555-0447', 'ops@example-semarine.com',
   'Charleston', 'SC', 2000, true, false,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  ('demo-national-vehicle-shipping',
   'National Vehicle Shipping [DEMO]',
   'transport',
   '[DEMO PARTNER] Coast-to-coast enclosed transport. White-glove door-to-door for high-value vehicles. Real-time GPS tracking.',
   'https://example.com/national-vehicle-shipping',
   '310-555-0458', 'concierge@example-nvshipping.com',
   'Los Angeles', 'CA', 4000, true, true,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  ('demo-coastal-carrier-services',
   'Coastal Carrier Services [DEMO]',
   'transport',
   '[DEMO PARTNER] Carolinas-based regional carrier. Trucks, boats up to 32ft, RVs. Weekly Florida and Northeast runs.',
   'https://example.com/coastal-carrier-services',
   '910-555-0463', 'load@example-coastalcarrier.com',
   'Wilmington', 'NC', 1200, true, false,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  -- Lender / insurance partners (5)
  ('demo-seaside-marine-finance',
   'Seaside Marine Finance [DEMO]',
   'lender',
   '[DEMO PARTNER] Marine loans up to $5M. 20-year terms, primary or second-home programs. Pre-approval in under an hour.',
   'https://example.com/seaside-marine-finance',
   '561-555-0511', 'apply@example-seasidefinance.com',
   'Palm Beach', 'FL', 4000, true, true,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  ('demo-trustshield-auto-insurance',
   'TrustShield Auto Insurance [DEMO]',
   'insurance_agent',
   '[DEMO PARTNER] Personal and dealer auto insurance, garage liability, transport coverage. Quote in 5 minutes.',
   'https://example.com/trustshield-auto',
   '615-555-0524', 'quote@example-trustshield.com',
   'Nashville', 'TN', 4000, true, false,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  ('demo-anchor-lending',
   'Anchor Lending [DEMO]',
   'lender',
   '[DEMO PARTNER] Recreational and powersports financing. Boat, RV, and trailer loans. Soft-pull pre-quals.',
   'https://example.com/anchor-lending',
   '843-555-0537', 'loans@example-anchorlending.com',
   'Mt. Pleasant', 'SC', 4000, true, false,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  ('demo-premium-marine-insurance',
   'Premium Marine Insurance [DEMO]',
   'insurance_agent',
   '[DEMO PARTNER] Yacht, sportfish, and high-performance boat insurance. Agreed value, named storm coverage, transit included.',
   'https://example.com/premium-marine-insurance',
   '954-555-0549', 'bind@example-premiummarine.com',
   'Fort Lauderdale', 'FL', 4000, true, true,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40'),

  ('demo-drivewise-auto-loans',
   'DriveWise Auto Loans [DEMO]',
   'lender',
   '[DEMO PARTNER] Auto refi, purchase, and lease buyout loans. Credit-band pricing from 720+ to 580. Decisions in minutes.',
   'https://example.com/drivewise-auto-loans',
   '704-555-0552', 'fund@example-drivewise.com',
   'Charlotte', 'NC', 4000, true, false,
   '6bdb133b-3b62-4c45-89d4-b4f7a259da40')
on conflict (slug) do nothing;


-- ----------------------------------------------------------------------------
-- 3. LISTINGS  (50)
-- ----------------------------------------------------------------------------
-- All listings: condition='demo', is_demo=true, status='active',
-- published_at=now(), seller_id=Don's UUID. Description always carries
-- the [DEMO LISTING] marker so they're filterable post-launch.
-- ----------------------------------------------------------------------------

-- Center consoles (5)
insert into public.listings
  (slug, category, title, description, make, model, year, price_cents,
   condition, city, state, hours, length_ft, engine_count,
   seller_type, seller_id, status, published_at, is_demo)
values
  ('demo-2024-boston-whaler-380-outrage',
   'center_console',
   '2024 Boston Whaler 380 Outrage',
   '[DEMO LISTING] Triple Mercury 400R Verados, full Garmin electronics, SeaKeeper 6, factory hardtop with SureShade. Loaded saltwater fishing platform with under 30 hours.',
   'Boston Whaler', '380 Outrage', 2024, 39900000,
   'demo', 'Charleston', 'SC', 25, 38.0, 3,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2023-grady-white-canyon-376',
   'center_console',
   '2023 Grady-White Canyon 376',
   '[DEMO LISTING] Twin Yamaha XTO 425s, 110 hours, Seakeeper, joystick docking, full tower with Taco outriggers. One owner, fresh service, ready to fish.',
   'Grady-White', 'Canyon 376', 2023, 38500000,
   'demo', 'Naples', 'FL', 110, 37.5, 2,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2022-regulator-31',
   'center_console',
   '2022 Regulator 31',
   '[DEMO LISTING] Twin Yamaha F300s, 220 hours, hardtop with electronics box, dive door, Garmin GPSMAP. Bluewater Carolina build, never offshore in salt.',
   'Regulator', '31', 2022, 32900000,
   'demo', 'Jacksonville', 'FL', 220, 31.0, 2,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2024-yellowfin-36-offshore',
   'center_console',
   '2024 Yellowfin 36 Offshore',
   '[DEMO LISTING] Triple Mercury 400R Verados, only 45 hours. Custom paint, Garmin trio displays, full tower, SeaKeeper. The benchmark for serious offshore.',
   'Yellowfin', '36 Offshore', 2024, 36900000,
   'demo', 'Miami', 'FL', 45, 36.0, 3,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2023-contender-32-st',
   'center_console',
   '2023 Contender 32 ST',
   '[DEMO LISTING] Twin Mercury 350 Verados, 95 hours, hardtop, baitwell, fish boxes, electronics package. Built to chase tuna and sail.',
   'Contender', '32 ST', 2023, 29500000,
   'demo', 'Tampa', 'FL', 95, 32.0, 2,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

-- Yachts (5)
  ('demo-2022-pursuit-os-385-offshore',
   'yacht',
   '2022 Pursuit OS 385 Offshore',
   '[DEMO LISTING] Twin Volvo D6-440s, 180 hours, helm-deck enclosure, Seakeeper 6, generator. Cruising and fishing in equal measure.',
   'Pursuit', 'OS 385', 2022, 59900000,
   'demo', 'Sarasota', 'FL', 180, 38.5, 2,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2014-viking-50-convertible',
   'yacht',
   '2014 Viking 50 Convertible',
   '[DEMO LISTING] MAN V12-1400s, 1,150 hours, Release Marine helm chair, mezzanine, full tower, generator, Seakeeper. Tournament-ready sportfish.',
   'Viking', '50 Convertible', 2014, 115000000,
   'demo', 'Stuart', 'FL', 1150, 50.0, 2,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2018-bertram-45-convertible',
   'yacht',
   '2018 Bertram 45 Convertible',
   '[DEMO LISTING] Caterpillar C18 ACERTs, 850 hours, classic sportfish lines with modern systems. Full tower, mezzanine, generator. Recent bottom job.',
   'Bertram', '45 Convertible', 2018, 89500000,
   'demo', 'Fort Lauderdale', 'FL', 850, 45.0, 2,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2021-tiara-38-lx',
   'yacht',
   '2021 Tiara 38 LX',
   '[DEMO LISTING] Twin Volvo IPS 600s with joystick, 320 hours. Day-boat luxury — wet bar, sun pads, refreshment center, premium audio.',
   'Tiara', '38 LX', 2021, 72500000,
   'demo', 'Naples', 'FL', 320, 38.0, 2,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2017-sea-ray-sundancer-510',
   'yacht',
   '2017 Sea Ray Sundancer 510',
   '[DEMO LISTING] Twin Cummins QSC 8.3s, 540 hours, Zeus pod drives with joystick. Full galley, two staterooms, two heads. Loaded electronics.',
   'Sea Ray', 'Sundancer 510', 2017, 64900000,
   'demo', 'Miami', 'FL', 540, 51.0, 2,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

-- Performance boats (5)
  ('demo-2018-cigarette-41-top-gun',
   'performance_boat',
   '2018 Cigarette 41 Top Gun',
   '[DEMO LISTING] Quad Mercury 400Rs, 380 hours, custom paint, Garmin trio, premium audio. Apex of high-performance offshore.',
   'Cigarette', '41 Top Gun', 2018, 69500000,
   'demo', 'Miami', 'FL', 380, 41.0, 4,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2020-nor-tech-390-sport',
   'performance_boat',
   '2020 Nor-Tech 390 Sport',
   '[DEMO LISTING] Triple Mercury 450R Verados, 220 hours, JL Audio, full custom interior, hardtop, integrated head. Genuine 90+ MPH ride.',
   'Nor-Tech', '390 Sport', 2020, 58500000,
   'demo', 'Key West', 'FL', 220, 39.0, 3,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2017-fountain-38-lightning',
   'performance_boat',
   '2017 Fountain 38 Lightning',
   '[DEMO LISTING] Twin Mercury 700 SCi engines on Bravo XR drives, 410 hours, K-plane trim tabs, premium audio. Iconic Sandman hull.',
   'Fountain', '38 Lightning', 2017, 37900000,
   'demo', 'Stuart', 'FL', 410, 38.0, 2,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2015-donzi-38-zrc',
   'performance_boat',
   '2015 Donzi 38 ZRC',
   '[DEMO LISTING] Twin Mercury 525 EFIs, 520 hours, recent service, custom interior, JL audio. Classic V-bottom with modern systems.',
   'Donzi', '38 ZRC', 2015, 24500000,
   'demo', 'Miami', 'FL', 520, 38.0, 2,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2021-scarab-35-id',
   'performance_boat',
   '2021 Scarab 35 ID',
   '[DEMO LISTING] Triple Rotax 300s, 180 hours, jet propulsion, premium audio, hardtop. Sport, family, and shallow-water capability in one package.',
   'Scarab', '35 ID', 2021, 32500000,
   'demo', 'Charleston', 'SC', 180, 35.0, 3,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

-- Fishing boats (5) — boat category
  ('demo-2019-mako-284-cc',
   'boat',
   '2019 Mako 284 CC',
   '[DEMO LISTING] Twin Mercury 250 Verados, 350 hours, T-top, livewell, Lowrance HDS, trolling motor mount. Inshore-offshore crossover.',
   'Mako', '284 CC', 2019, 8900000,
   'demo', 'Charleston', 'SC', 350, 28.0, 2,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2021-robalo-r242',
   'boat',
   '2021 Robalo R242',
   '[DEMO LISTING] Single Yamaha F300, 160 hours, hardtop, livewell, fishboxes, Garmin 8612. Coastal fishing and family-day blend.',
   'Robalo', 'R242', 2021, 11200000,
   'demo', 'Wilmington', 'NC', 160, 24.0, 1,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2020-cobia-240-cc',
   'boat',
   '2020 Cobia 240 CC',
   '[DEMO LISTING] Yamaha F300, 280 hours, T-top, baitwell, leaning post with rocket launchers. Lowcountry inshore staple.',
   'Cobia', '240 CC', 2020, 9400000,
   'demo', 'Mt. Pleasant', 'SC', 280, 24.0, 1,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2022-sportsman-heritage-231',
   'boat',
   '2022 Sportsman Heritage 231',
   '[DEMO LISTING] Yamaha F250, 95 hours, T-top, livewell, premium audio, Garmin electronics. Lightly used family/fishing platform.',
   'Sportsman', 'Heritage 231', 2022, 7900000,
   'demo', 'Beaufort', 'NC', 95, 23.1, 1,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2018-key-west-219fs',
   'boat',
   '2018 Key West 219FS',
   '[DEMO LISTING] Yamaha F200, 410 hours, T-top, livewell, fishboxes. Affordable bay/nearshore rig with full service history.',
   'Key West', '219FS', 2018, 5200000,
   'demo', 'Tampa', 'FL', 410, 21.9, 1,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

-- Misc boats (5)
  ('demo-2017-bennington-25-ssrx',
   'boat',
   '2017 Bennington 25 SSRX Pontoon',
   '[DEMO LISTING] Yamaha F300 SHO, 180 hours, ESP performance package, premium upholstery, full enclosure, JL Audio. Lake-Norman cruiser.',
   'Bennington', '25 SSRX', 2017, 5800000,
   'demo', 'Cornelius', 'NC', 180, 25.0, 1,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2019-mastercraft-nxt22',
   'boat',
   '2019 MasterCraft NXT22',
   '[DEMO LISTING] Ilmor 6.2L 400hp, 220 hours, Gen 2 Surf System, ZFT3 tower, premium audio. Fresh-water Tellico Lake boat.',
   'MasterCraft', 'NXT22', 2019, 7900000,
   'demo', 'Knoxville', 'TN', 220, 22.0, 1,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2014-catalina-320-sailboat',
   'boat',
   '2014 Catalina 320 Sailboat',
   '[DEMO LISTING] Yanmar 3YM30 diesel with 1,500 hours, in-mast furling, autopilot, refrigeration. Coastal cruiser ready for the Bahamas.',
   'Catalina', '320', 2014, 8900000,
   'demo', 'Charleston', 'SC', 1500, 32.0, 1,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2020-sea-doo-switch-21',
   'boat',
   '2020 Sea-Doo Switch 21',
   '[DEMO LISTING] 230hp Rotax, 65 hours, modular deck system, BRP audio. Trailer included. Lake Wylie play boat.',
   'Sea-Doo', 'Switch 21', 2020, 3400000,
   'demo', 'Lake Wylie', 'SC', 65, 21.0, 1,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2016-beneteau-oceanis-38',
   'boat',
   '2016 Beneteau Oceanis 38',
   '[DEMO LISTING] Yanmar 30hp, 1,100 hours, three-cabin configuration, B&G electronics, recent sails and rigging survey.',
   'Beneteau', 'Oceanis 38', 2016, 9500000,
   'demo', 'Wilmington', 'NC', 1100, 38.0, 1,
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true);


-- Trucks (5)
insert into public.listings
  (slug, category, title, description, make, model, year, price_cents,
   condition, city, state, mileage, drivetrain, fuel_type,
   seller_type, seller_id, status, published_at, is_demo)
values
  ('demo-2023-ford-f-150-lariat',
   'truck',
   '2023 Ford F-150 Lariat 4x4',
   '[DEMO LISTING] 3.5L EcoBoost, FX4 off-road, panoramic roof, B&O audio, 360 cameras. Clean CarFax, one owner, 18k miles.',
   'Ford', 'F-150 Lariat', 2023, 5200000,
   'demo', 'Knoxville', 'TN', 18000, '4WD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2022-ram-1500-limited',
   'truck',
   '2022 RAM 1500 Limited 4x4',
   '[DEMO LISTING] HEMI 5.7L eTorque, air suspension, 12-inch screen, Harman Kardon, panoramic roof, level kit. Loaded with factory tow package.',
   'RAM', '1500 Limited', 2022, 5800000,
   'demo', 'Charlotte', 'NC', 32000, '4WD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2024-chevy-silverado-ltz',
   'truck',
   '2024 Chevrolet Silverado 1500 LTZ',
   '[DEMO LISTING] 6.2L V8, Z71 off-road, leather, sunroof, ventilated seats, super cruise. As-new with 8.5k miles.',
   'Chevrolet', 'Silverado 1500 LTZ', 2024, 6150000,
   'demo', 'Nashville', 'TN', 8500, '4WD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2023-toyota-tacoma-trd-off-road',
   'truck',
   '2023 Toyota Tacoma TRD Off-Road 4x4',
   '[DEMO LISTING] 3.5L V6, locking rear diff, crawl control, JBL audio, bed-mounted toolbox. One owner, full service history.',
   'Toyota', 'Tacoma TRD Off-Road', 2023, 4700000,
   'demo', 'Asheville', 'NC', 22500, '4WD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2022-gmc-sierra-1500-at4',
   'truck',
   '2022 GMC Sierra 1500 AT4',
   '[DEMO LISTING] 6.2L V8, MultiPro tailgate, sunroof, head-up display, Bose, off-road suspension. Charleston tow rig.',
   'GMC', 'Sierra 1500 AT4', 2022, 5400000,
   'demo', 'Charleston', 'SC', 28000, '4WD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

-- SUVs (also under truck category)
  ('demo-2023-jeep-wrangler-rubicon',
   'truck',
   '2023 Jeep Wrangler Unlimited Rubicon',
   '[DEMO LISTING] 3.6L V6, sky-one-touch power top, Rock-Trac transfer case, electronic sway-bar disconnect, leather. Stock and clean.',
   'Jeep', 'Wrangler Unlimited Rubicon', 2023, 4900000,
   'demo', 'Knoxville', 'TN', 14000, '4WD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2022-toyota-4runner-trd-pro',
   'truck',
   '2022 Toyota 4Runner TRD Pro',
   '[DEMO LISTING] FOX shocks, KDSS, JBL audio, Lunar Rock paint, roof basket. Iconic body-on-frame SUV with bulletproof drivetrain.',
   'Toyota', '4Runner TRD Pro', 2022, 5800000,
   'demo', 'Charlotte', 'NC', 22000, '4WD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2023-ford-bronco-outer-banks',
   'truck',
   '2023 Ford Bronco Outer Banks 4-Door',
   '[DEMO LISTING] 2.7L EcoBoost, 4x4 with locking diffs, leather, B&O audio, removable roof and doors. Naples beach build.',
   'Ford', 'Bronco Outer Banks', 2023, 5400000,
   'demo', 'Naples', 'FL', 11500, '4WD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2024-chevy-tahoe-high-country',
   'truck',
   '2024 Chevrolet Tahoe High Country',
   '[DEMO LISTING] 6.2L V8, Magnetic Ride, super cruise, second-row buckets, panoramic roof, rear entertainment. Loaded family flagship.',
   'Chevrolet', 'Tahoe High Country', 2024, 7600000,
   'demo', 'Miami', 'FL', 6500, '4WD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2022-land-rover-defender-110-se',
   'truck',
   '2022 Land Rover Defender 110 SE',
   '[DEMO LISTING] P400 inline-6 mild hybrid, air suspension, leather, Meridian audio, off-road pack. Pangea Green over Acorn.',
   'Land Rover', 'Defender 110 SE', 2022, 7950000,
   'demo', 'Charleston', 'SC', 24000, '4WD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

-- Exotics (5)
  ('demo-2021-porsche-911-carrera-s',
   'exotic',
   '2021 Porsche 911 Carrera S (992)',
   '[DEMO LISTING] PDK, Sport Chrono, sport exhaust, sport seats plus, BOSE. Guards Red over black. 12k pampered miles.',
   'Porsche', '911 Carrera S', 2021, 13500000,
   'demo', 'Miami', 'FL', 12000, 'RWD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2023-bmw-m4-competition',
   'exotic',
   '2023 BMW M4 Competition',
   '[DEMO LISTING] 503hp twin-turbo I6, 8-speed auto, carbon roof, M Carbon Bucket Seats, executive package. Isle of Man Green.',
   'BMW', 'M4 Competition', 2023, 8900000,
   'demo', 'Charlotte', 'NC', 8500, 'RWD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2020-mercedes-amg-gt-c',
   'exotic',
   '2020 Mercedes-AMG GT C',
   '[DEMO LISTING] 4.0L bi-turbo V8, 550hp, AMG Track Pace, Burmester surround, AMG performance seats. Designo Diamond White.',
   'Mercedes-Benz', 'AMG GT C', 2020, 11500000,
   'demo', 'Naples', 'FL', 18000, 'RWD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2022-audi-rs7',
   'exotic',
   '2022 Audi RS7 Sportback',
   '[DEMO LISTING] 4.0L TFSI V8, 591hp, RS dynamic plus pack, B&O Advanced 3D, Nardo Gray. Ceramic-coated and PPF.',
   'Audi', 'RS7 Sportback', 2022, 12900000,
   'demo', 'Miami', 'FL', 14500, 'AWD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2023-corvette-z06',
   'exotic',
   '2023 Chevrolet Corvette Z06',
   '[DEMO LISTING] LT6 5.5L flat-plane V8, 670hp, Z07 performance package, carbon ceramics, carbon wheels. 4,500 miles.',
   'Chevrolet', 'Corvette Z06', 2023, 15900000,
   'demo', 'Tampa', 'FL', 4500, 'RWD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

-- Classics (5)
  ('demo-1967-ford-mustang-fastback',
   'classic',
   '1967 Ford Mustang Fastback',
   '[DEMO LISTING] Restored S-code 390 with 4-speed, Wimbledon White over black Pony interior. Marti Report and full restoration documentation.',
   'Ford', 'Mustang Fastback', 1967, 9500000,
   'demo', 'Knoxville', 'TN', 78500, 'RWD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-1970-chevelle-ss-454',
   'classic',
   '1970 Chevrolet Chevelle SS 454',
   '[DEMO LISTING] LS6 454 with M22 4-speed, Cranberry Red over black, cowl hood, posi rear. Frame-off restoration completed 2019.',
   'Chevrolet', 'Chevelle SS 454', 1970, 14500000,
   'demo', 'Nashville', 'TN', 64000, 'RWD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-1969-camaro-rs-ss',
   'classic',
   '1969 Chevrolet Camaro RS/SS',
   '[DEMO LISTING] 396 big-block, 4-speed, hideaway headlights, Hugger Orange. Numbers-matching engine, full Protect-O-Plate documentation.',
   'Chevrolet', 'Camaro RS/SS', 1969, 12900000,
   'demo', 'Charlotte', 'NC', 89000, 'RWD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-1965-corvette-stingray',
   'classic',
   '1965 Chevrolet Corvette Stingray',
   '[DEMO LISTING] 327/365hp small-block, 4-speed, side-pipes, Nassau Blue. Body-off restoration with NCRS Top Flight award.',
   'Chevrolet', 'Corvette Stingray', 1965, 11500000,
   'demo', 'Miami', 'FL', 92000, 'RWD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-1972-ford-bronco-restomod',
   'classic',
   '1972 Ford Bronco Restomod',
   '[DEMO LISTING] Coyote 5.0L swap, 6-speed auto, modern AC, leather interior, Wilwood disc brakes, locking diffs. Frame-off rebuild, 12.5k miles since.',
   'Ford', 'Bronco', 1972, 18500000,
   'demo', 'Naples', 'FL', 12500, '4WD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

-- Everyday cars (5)
  ('demo-2023-tesla-model-y-long-range',
   'car',
   '2023 Tesla Model Y Long Range',
   '[DEMO LISTING] Dual-motor AWD, 326-mile range, autopilot, premium audio, glass roof. Pearl White over black. One owner, garage kept.',
   'Tesla', 'Model Y Long Range', 2023, 4250000,
   'demo', 'Charlotte', 'NC', 15000, 'AWD', 'electric',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2022-honda-accord-ex-l',
   'car',
   '2022 Honda Accord EX-L',
   '[DEMO LISTING] 1.5L turbo, leather, heated seats, sunroof, Honda Sensing. Clean CarFax, fresh service.',
   'Honda', 'Accord EX-L', 2022, 2850000,
   'demo', 'Asheville', 'NC', 31000, 'FWD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2023-toyota-camry-xse',
   'car',
   '2023 Toyota Camry XSE V6',
   '[DEMO LISTING] 3.5L V6, 301hp, panoramic roof, premium audio, ventilated seats. Wind Chill Pearl over black.',
   'Toyota', 'Camry XSE V6', 2023, 3200000,
   'demo', 'Knoxville', 'TN', 18500, 'FWD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2024-mazda-cx-5-premium',
   'car',
   '2024 Mazda CX-5 Premium AWD',
   '[DEMO LISTING] 2.5L Skyactiv, AWD, leather, Bose audio, head-up display, sunroof. Soul Red over parchment.',
   'Mazda', 'CX-5 Premium', 2024, 3450000,
   'demo', 'Charlotte', 'NC', 9500, 'AWD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true),

  ('demo-2022-hyundai-tucson-sel',
   'car',
   '2022 Hyundai Tucson SEL AWD',
   '[DEMO LISTING] 2.5L, AWD, Hyundai SmartSense, heated seats, dual-zone climate. Remaining factory warranty.',
   'Hyundai', 'Tucson SEL AWD', 2022, 2600000,
   'demo', 'Nashville', 'TN', 35500, 'AWD', 'gasoline',
   'private', '6bdb133b-3b62-4c45-89d4-b4f7a259da40', 'active', now(), true)
on conflict (slug) do nothing;


-- ----------------------------------------------------------------------------
-- 4. Backfill: ensure every demo row carries the is_demo flag.
--    Safe to re-run.
-- ----------------------------------------------------------------------------
update public.listings
   set is_demo = true
 where is_demo = false
   and (condition = 'demo' or description like '%[DEMO LISTING]%');
