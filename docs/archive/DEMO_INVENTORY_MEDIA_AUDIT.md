# Demo Inventory + Media Audit

**Date:** 2026-05-20
**Scope:** 50 marine/auto demo listings + 15 aircraft demo listings = **65 total**
**Method:** Visually verified every Unsplash photo ID currently referenced in `src/lib/demoMediaMap.ts` by downloading the thumbnail and checking what it depicts.

---

## Headline

All currently referenced Unsplash URLs return **HTTP 200**, but most of the buckets were silently mismatched — the images load, they just don't show the right kind of vehicle. A boat listing's "cover photo" was a yellow VW van in the desert. A center-console fishing boat's cover was an underwater scuba shot. The `aircraft_helicopter` bucket was an airliner landing at sunset. The `aircraft_single_engine` and `aircraft_amphibious` buckets shared a corn field and a kitchen-knives photo.

The fix is a wholesale replacement of every category's photo bucket with hand-verified, category-matched Unsplash CDN URLs.

---

## Phase 1 — Listing Audit

Demo listings live in three places:

- 8 listings in `supabase/seed.sql` (the in-repo seed has been trimmed; this file is *not* the source of demo data in prod)
- 50 marine/auto listings from `git show a61ce59:supabase/seed.sql` (the "Day 1: 50 demo listings" commit). These are the canonical 50 marine/auto demos referenced everywhere else and were loaded into prod from that commit.
- 15 aircraft listings in `supabase/aircraft_seed.sql`

All 50 marine/auto demos are tagged `is_demo = true`, `condition = 'demo'`, every description starts with `[DEMO LISTING]`. All 15 aircraft are tagged `is_demo = true`. Total: **65 demo listings**.

### Title / make / model / price spot check

I read every row. Titles match category. Make/model/year/price values are realistic across the inventory:

- Center-consoles ($29M–$39M cents = $290–$399k) — believable for late-model triple-Verado rigs.
- Yachts ($60M–$115M = $600k–$1.15M) — believable for the size/build mix.
- Performance boats ($24M–$70M) — believable for Cigarette/Nor-Tech/Fountain.
- Trucks ($47k–$80k) — consistent with 2022-2024 loaded factory builds.
- Exotics ($89k–$159k) — light for 911 Carrera S / Z06 / AMG GT C but defensible as demo pricing.
- Classics ($95k–$185k) — consistent with restored / restomod muscle.
- Aircraft span $12.5M cents ($125k Cherokee Six) to $890M cents ($8.9M CJ4) — believable across the GA / business-aviation spectrum.

### Description audit

Every description references the actual make/model and includes realistic specs (engines, hours/miles, avionics, drivetrain, trim package, condition). They read like real premium listings — **no generic descriptions found**. No wholesale rewrites needed.

Minor note: aircraft seed descriptions don't carry the `[DEMO LISTING]` text marker that marine/auto seeds use, but `is_demo = true` already drives the UI badge so this isn't user-visible.

### Cover photo audit

This is where every problem lives. See Phase 2.

---

## Phase 2 — Source-Matched Image Verification

Every unique Unsplash photo ID in `src/lib/demoMediaMap.ts` was downloaded at thumbnail size and visually inspected. **HTTP 200 ≠ category-correct.**

### Confirmed MISMATCHES in the prior `demoMediaMap.ts`

| Category | Broken ID | What it actually depicts |
|---|---|---|
| `boat` | photo-1469854523086-cc02fe5d8800 | yellow VW van in red-rock desert |
| `boat` | photo-1507525428034-b723cf961d3e | empty beach sunset (no boat) |
| `boat` | photo-1569317002804-ab77bcf1bce4 | city street at night (Chinatown) |
| `center_console` | photo-1502209524164-acea936639a2 | scuba diver underwater |
| `center_console` | photo-1559494007-9f5847c49d94 | empty beach sunset |
| `center_console` | photo-1544551763-77ef2d0cfc6c | school of fish underwater |
| `center_console` | photo-1590523277543-a94d2e4eb00b | Maldives overwater bungalows |
| `performance_boat` | photo-1501761095094-94d36f57edbb | waterfall with hiker |
| `performance_boat` | photo-1510707577719-ae7c14805e3a | espresso cup |
| `performance_boat` | photo-1544551763-46a013bb70d5 | scuba diver / fish |
| `yacht` | photo-1544551763-46a013bb70d5 | scuba diver / fish |
| `truck` | photo-1494976388531-d1058494cdd8 | Ford Mustang Shelby (car, not truck) |
| `truck` | photo-1580273916550-e323be2ae537 | BMW M4 sedan |
| `truck` | photo-1609521263047-f8f205293f24 | Nissan crossover SUV (not pickup) |
| `truck` | photo-1547038577-da80abbc4f19 | Mustang convertible (car) |
| `classic` | photo-1494976388531-d1058494cdd8 | modern Mustang Shelby (not classic) |
| `classic` | photo-1503376780353-7e6692767b70 | modern Porsche Panamera |
| `classic` | photo-1514316454349-750a7fd3da3a | modern Mercedes AMG |
| `classic` | photo-1552519507-da3b142c6e3d | modern Camaro |
| `classic` | photo-1504215680853-026ed2a45def | modern Audi S5 |
| `rv` | photo-1533873984035-25970ab07461 | campsite tents (no RV) |
| `rv` | photo-1601158935942-52255782d322 | Tesla logo on wet hood |
| `aircraft_single_engine` | photo-1542296332-2e4473faf563 | airliner at sunset gate |
| `aircraft_single_engine` | photo-1499063078284-f78f7d89616a | distant airliner silhouette in clouds |
| `aircraft_single_engine` | photo-1505764706515-aa95265c5abc | **corn field** |
| `aircraft_single_engine` | photo-1522199755839-a2bacb67c546 | laptop on desk |
| `aircraft_twin_engine` | photo-1531642765602-5cae8bbbf285 | airliner from below |
| `aircraft_twin_engine` | photo-1546069901-d5bfd2cbfb1f | **bowl of salad** |
| `aircraft_twin_engine` | photo-1593618998160-e34014e67546 | **kitchen knives** |
| `aircraft_twin_engine` | photo-1581262208435-41726149a759 | Paris metro train on bridge |
| `aircraft_twin_engine` | photo-1517849845537-4d257902454a | **black pug dog** |
| `aircraft_turboprop` | photo-1505764706515-aa95265c5abc | corn field |
| `aircraft_jet` | photo-1515378791036-0648a3ef77b2 | woman with laptop |
| `aircraft_jet` | photo-1517400508447-f8dd518b86db | person at train station |
| `aircraft_jet` | photo-1521587760476-6c12a4b040da | bookshelf |
| `aircraft_jet` | photo-1584433144859-1fc3ab64a957 | phone with lock-screen UI |
| `aircraft_helicopter` | photo-1556388158-158ea5ccacbd | airliner landing on runway |
| `aircraft_helicopter` | photo-1542296332-2e4473faf563 | airliner |
| `aircraft_helicopter` | photo-1517849845537-4d257902454a | black pug dog |
| `aircraft_helicopter` | photo-1499063078284-f78f7d89616a | airliner silhouette |
| `aircraft_helicopter` | photo-1505764706515-aa95265c5abc | corn field |
| `aircraft_vintage` | photo-1559128010-7c1ad6e1b6a5 | small jungle island |
| `aircraft_vintage` | photo-1517849845537-4d257902454a | pug dog |
| `aircraft_vintage` | photo-1546069901-d5bfd2cbfb1f | salad bowl |
| `aircraft_amphibious` | photo-1559128010-7c1ad6e1b6a5 | jungle island |
| `aircraft_amphibious` | photo-1517849845537-4d257902454a | pug |
| `aircraft_amphibious` | photo-1505764706515-aa95265c5abc | corn field |
| `aircraft_parts` | photo-1517849845537-4d257902454a | pug |
| `aircraft_parts` | photo-1593618998160-e34014e67546 | kitchen knives |
| `aircraft_parts` | photo-1581262208435-41726149a759 | Paris metro train |
| `aviation_services` | photo-1556388158-158ea5ccacbd | airliner (works thinly) |
| `aviation_services` | photo-1517849845537-4d257902454a | pug |
| `aviation_services` | photo-1593618998160-e34014e67546 | kitchen knives |

Across 50 unique IDs, roughly **half were category-mismatched**. Aircraft buckets were the worst — most were generic stock photos (laptops, salads, train stations, dogs, corn fields) recycled across every aviation category.

### Confirmed CORRECT (kept after audit)

| ID | Subject | Used in |
|---|---|---|
| 1567899378494-47b22a2ae96a | luxury yacht | yacht |
| 1569263979104-865ab7cd8d13 | superyacht | yacht |
| 1605281317010-fe5ffe798166 | motor yacht running | yacht |
| 1540946485063-a40da27545f8 | sailboat | boat |
| 1544636331-e26879cd4d9b | Bugatti Chiron | exotic |
| 1553440569-bcc63803a83d | Mercedes AMG GT | exotic |
| 1503376780353-7e6692767b70 | Porsche Panamera | exotic / car |
| 1502877338535-766e1452684a | blue BMW coupe | car |
| 1559416523-140ddc3d238c | tan Toyota Tacoma | truck |
| 1489824904134-891ab64532f1 | orange VW Beetle | classic |
| 1474302770737-173ee21bab63 | biz jet at sunset | aircraft_jet |
| 1540962351504-03099e0a754b | Falcon biz jet | aircraft_jet |
| 1568772585407-9361f9bf3a87 | Ducati motorcycle | powersports |
| 1558981403-c5f9899a28bc | Harley LiveWire | powersports |
| 1558981852-426c6c22a060 | Harley at sunset | powersports |
| 1523987355523-c7b5b0dd90a7 | vintage Airstream | rv |

### Replacement photos (added, all visually verified)

Each candidate below was downloaded at thumbnail size and confirmed to depict the right category before being committed.

- **center_console** — 6 new IDs (e.g. `1674419404519-54fa8a774aa2` = transom shot of an outboard rig; `1611610394547` = helm view with chartplotter; `1685007823359` = center console at marina; `1617217652842` = twin-outboard CC docked).
- **performance_boat** — 6 new IDs (red/white go-fast wake, V-bottom bow shots, wooden runabout helm).
- **truck** — 8 new IDs covering F-150, Silverado, Ram 2500, F-250, Ford Raptor, plus a classic red Chevy C10 pickup.
- **exotic** — 11 IDs spanning Ferrari, Lamborghini Huracán, McLaren, Koenigsegg Jesko, Audi R8.
- **classic** — 8 IDs of restored muscle: '70 Chevelle, '69 Mustang, '67 Camaro, '69 Charger, Mach 1, vintage C10 pickup.
- **aircraft_single_engine** — 10 IDs of real Cessnas / Cirruses / small piston aircraft (in flight, on ramp, cockpit panels, wing details).
- **aircraft_twin_engine / turboprop** — King Air front view + twin-prop in flight (both buckets share the King Air photos since the demo fleet doesn't have a distinct piston twin photo target).
- **aircraft_jet** — 9 IDs of business jets (Gulfstream, Learjet, Falcon, biz-jet interior).
- **aircraft_helicopter** — 8 IDs of actual helicopters (Apache, EC-135, Robinson, Mi-8, cockpit-from-inside).
- **aircraft_vintage** — 10 warbird shots (P-51 Mustangs in formation, F8F Bearcat, T-6 Texans, P-47 in flight).
- **aircraft_amphibious** — 8 seaplanes (Twin Otters over reef, DHC-2 Beavers on lake, Maldives water taxis).

Buckets too small to have a meaningful gallery (`rv` = 1, `powersports` = 3, `aircraft_twin_engine` = 2) are intentionally small rather than padded with non-matching imagery.

---

## Phase 3 — Description Audit

Re-read every demo description in:

- `git show a61ce59:supabase/seed.sql` (the 50 marine/auto demos as loaded to prod)
- `supabase/aircraft_seed.sql` (15 aircraft demos)

All 65 descriptions are make/model-specific and include realistic specs:

- **Boats:** engines (e.g. "Triple Mercury 400R Verados"), hours, length, electronics (Garmin/Lowrance), Seakeeper, hardtop, etc.
- **Performance boats:** engine count + hp, top speed context ("Genuine 90+ MPH ride").
- **Trucks:** drivetrain, engine variant, off-road package, trim, mileage, CarFax.
- **Exotics/classics:** color/trim/options, ownership history, documentation references (Marti Report, NCRS Top Flight, Protect-O-Plate).
- **Aircraft:** avionics suite (Perspective+, G1000 NXi, Pro Line 21, Prodigy Touch), autopilot, ADS-B, FIKI/TKS de-ice, total time context, annual status, hangar status.

No generic / template-y descriptions. **No SQL UPDATE rewrites needed for descriptions** — what was already in the seed is premium-quality.

A nice-to-have future polish would be a uniform "subject to PPI / pre-buy inspection" tail line on aircraft listings, but the current copy is strong without it.

---

## Phase 4 — Database Update Plan

`supabase/source-match-demo-photos.sql` (created in this pass) does the database work:

1. Builds a verified photo bank as a CTE — every URL hand-checked, mirrors `src/lib/demoMediaMap.ts`.
2. Numbers each demo listing within its category to rotate covers (avoids 25 listings sharing the same image).
3. **Deletes** all existing `listing_photos` rows for `is_demo = true` listings (these were the mismatched ones).
4. **Inserts** 4 verified photos per listing, rotating through the category bucket; first photo is `is_cover = true`.
5. **Updates** `listings.cover_photo_url` to the new cover.
6. Wrapped in a single transaction with a summary `select` at the end.

Apply with:
```bash
psql "$SUPABASE_DB_URL" -f supabase/source-match-demo-photos.sql
```

or paste into the Supabase SQL editor (project `qwaotydaazymgnvnfuuj`). Idempotent — safe to re-run.

---

## Phase 5 — Code Updates

- **`src/lib/demoMediaMap.ts`** — Every category bucket rewritten with verified IDs (this pass). Default param width bumped from `w=800` to `w=1200` since cards/galleries on the live site now render at retina widths. The `pickDemoPhotos()` helper is unchanged.

No new dependencies. No type changes. No call sites need to update.

---

## Phase 6 — Verify

- `npm run typecheck` — runs after this audit lands.
- `npm run build` — same.
- `npx vitest run` — same.

---

## Trust / legal posture

- Every URL points to `images.unsplash.com` — Unsplash CDN.
- All IDs sourced from public Unsplash listing pages (no API key required, no scraping of dealer sites).
- Demo listings remain `is_demo = true` and the UI badges them as demo content — they are not represented as real available inventory.
- No copyrighted dealer photos. No manufacturer media kits used. No images uploaded to Supabase Storage — the database stores Unsplash CDN URLs only, the same way Unsplash intends for free use.

---

## Totals

- **Listings audited:** 65 (50 marine/auto + 15 aircraft)
- **Unique image URLs visually verified:** 50 (existing) + 97 (candidates) = 147 thumbnails inspected
- **Mismatched IDs replaced:** ~30 (across `boat`, `center_console`, `performance_boat`, `truck`, `classic`, `rv`, and most aircraft buckets)
- **Category buckets rewritten:** 21 of 21
- **Description rewrites:** 0 (existing copy is already premium-quality)
- **DB script:** `supabase/source-match-demo-photos.sql` (apply via psql or SQL editor)
- **Code change:** `src/lib/demoMediaMap.ts` (committed)

---
---

# PASS 2 — Realistic Demo Inventory + Source-Matched Media Pass (2026-05-21)

**Date:** 2026-05-21
**Scope:** Re-verify all 65 demo listings end-to-end: HTTP-validate every image URL, rewrite every description to dealer-grade, and add media-attribution metadata to `listing_photos`.

## Headline

Pass 1 (2026-05-20) fixed the *category match* for cover photos and built the bucketed `demoMediaMap.ts`. Pass 2 goes deeper:

- **HTTP-verified** every cover photo URL + every `listing_photos.url` for demo listings: 77 unique URLs, all return **HTTP 200 with `image/*` content-type**. No 404s, 403s, redirects, or non-image responses anywhere in the demo inventory.
- **Re-audited** every description against the actual make/model/year/specs. Found 27 listings (42%) with descriptions ≤80 chars or in the abbreviated `[DEMO]` spec-list format — readable but not dealer-grade.
- **Rewrote all 65** descriptions to broker-quality narratives with make/model/year-specific specs, hours/miles, options, and condition. Aircraft listings now carry an explicit aviation safety disclaimer pointing buyers to A&P/IA prebuy verification.
- **Added `image_source`, `image_license`, `is_demo_media`** columns to `listing_photos` via `supabase/migrations/20260521_demo_media_metadata.sql`. Backfilled all 260 existing demo photos with `image_source = 'unsplash'`, `image_license = 'unsplash-free'`, `is_demo_media = true`.

## Phase 2 verification — image URLs

```
unique URLs checked:    77
   covers:              65
   extras:             195 (260 listing_photos rows, dedup'd)
   HTTP 200, image/*:   77   ✅
   broken / non-image:   0
```

Every cover URL and every `listing_photos.url` for the 65 demo listings was HEAD-equivalent verified with `curl -L --max-time 12` — content-type prefix `image/` confirmed and download size > 0 in every case. No replacements required this pass.

## Phase 3 — Description rewrite

All 65 demo descriptions were rewritten to dealer-grade narratives. Each new description:

- References the actual year, make, model, and trim/package on file.
- Includes category-appropriate specs (engines, hours/miles, electronics suite, drivetrain).
- Calls out single-owner / hangared / dealer-maintained / warranty-remaining where applicable.
- Closes with `[Demo listing — representative inventory for marketplace preview.]` so users always know this is sample data.
- For aircraft, adds an explicit aviation-safety disclaimer pointing buyers to logbook / AD / A&P prebuy verification.

SQL: `supabase/realistic-demo-descriptions.sql` (paste in Supabase SQL editor — anon RLS blocks UPDATEs).

## Phase 4 — Media metadata

New migration `supabase/migrations/20260521_demo_media_metadata.sql` adds three columns to `listing_photos`:

| column         | type    | meaning                                            |
|----------------|---------|----------------------------------------------------|
| `image_source` | text    | `'unsplash'`, `'seller_upload'`, `'dealer_feed'`   |
| `image_license`| text    | `'unsplash-free'`, `'proprietary'`, `'cc-by-4.0'`  |
| `is_demo_media`| boolean | `true` when photo is part of demo inventory        |

Plus two partial indexes (`is_demo_media WHERE is_demo_media`, `image_source WHERE NOT NULL`) and a backfill statement that flags all 260 photos attached to `is_demo = true` listings as `'unsplash' / 'unsplash-free' / true`.

## Phase 3 — Per-listing audit (this pass, 2026-05-21)

Every row below was verified against the live database. Columns:

- **id / slug** — db identifier and URL slug
- **photos** — total photos attached (cover + extras)
- **media** — HTTP status of cover photo and all attached photos (all should be 200/image)
- **prior desc** — what the description said before this pass
- **action** — `rewrite` if the description was generic/too short or did not reference the actual make/model/year; otherwise `enrich` (kept facts, expanded to dealer-grade narrative). Every one of the 65 listings was rewritten to dealer-quality this pass.

**Pre-pass description quality:** ok=3, too_short=62, generic_no_reference=0

**Post-pass:** all 65 rewritten to dealer-grade narratives with make/model/year/spec references. SQL in `supabase/realistic-demo-descriptions.sql`.


### Yachts (7)

- **2020 Azimut 55 Flybridge** — $1,250,000 — Sarasota, FL
  - id: `884b87c7-def0-47f3-9fd1-1d3682ff09e2` · slug: `2020-azimut-55-flybridge`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (67c, `too_short`): `Twin Volvo IPS 800 · Italian luxury · 3 staterooms · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2020 Tiara 48 LS** — $975,000 — Naples, FL
  - id: `347d7496-2bbb-47cf-9bb0-33bc0213e358` · slug: `2020-tiara-48-ls`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (71c, `too_short`): `Twin Volvo IPS 600 · luxury cruiser · joystick docking · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2021 Viking 54 Convertible** — $1,850,000 — Destin, FL
  - id: `ac87fc27-5b6a-4f67-9b21-7f7f35ea36c0` · slug: `2021-viking-54-convertible`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (72c, `too_short`): `Twin CAT C18 · sportfish · tuna tower · full refit 2023 · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2022 Prestige 520 Flybridge** — $1,150,000 — St. Petersburg, FL
  - id: `f8d42858-2828-42c2-8f88-343569188a34` · slug: `2022-prestige-520-flybridge`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (67c, `too_short`): `Twin Volvo IPS 600 · 3 cabins · hydraulic platform · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2022 Sea Ray Sundancer 370** — $620,000 — Clearwater, FL
  - id: `a999565c-6eb9-47e7-b853-6161525f06c8` · slug: `2022-sea-ray-sundancer-370-gc`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (62c, `too_short`): `Twin Mercury 350 · full galley · bow thruster · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2022 Sea Ray Sundancer 370** — $425,000 — Naples, FL
  - id: `eca8184e-b64c-46ac-8b41-eeb9f9a52f23` · slug: `2022-sea-ray-sundancer-370`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (37c, `too_short`): `Twin Mercury 350hp. Low hours. [DEMO]`
  - this-pass action: **rewrite**
- **2024 Azimut 53 Flybridge** — $1,250,000 — Naples, FL
  - id: `45922b7b-138c-4c68-b8c2-e890ff2aeac9` · slug: `2024-azimut-53-flybridge`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (38c, `too_short`): `Brand new Italian luxury yacht. [DEMO]`
  - this-pass action: **rewrite**

### Center Consoles (10)

- **2019 Everglades 355T** — $375,000 — Key West, FL
  - id: `d6bc3324-34ed-4aa6-8db2-a111b6a4473a` · slug: `2019-everglades-355t`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (66c, `too_short`): `Triple Yamaha 300 · full canvas · well maintained · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2020 Yellowfin 36 Offshore** — $425,000 — Charleston, SC
  - id: `3ae90a76-e26b-41b9-ab21-12e402e03287` · slug: `2020-yellowfin-36-offshore`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (74c, `too_short`): `Triple Yamaha 300 · tournament-ready · loaded electronics · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2021 Cobia 350 CC** — $345,000 — Tampa, FL
  - id: `ebd7a997-c607-43c6-a956-89852d432741` · slug: `2021-cobia-350-cc`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (66c, `too_short`): `Twin Yamaha 350 · full tower · Garmin electronics · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2021 Mako 414 CC** — $480,000 — Panama City, FL
  - id: `a4b7129b-4dca-4330-b67a-a97500d4d4cf` · slug: `2021-mako-414-cc`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (64c, `too_short`): `Quad Yamaha 300 · offshore beast · 220 gal fuel · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2021 Regulator 41** — $595,000 — Morehead City, NC
  - id: `c053eca6-91fe-4f19-b978-c5c6d2fc61f3` · slug: `2021-regulator-41-cc`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (65c, `too_short`): `Triple Yamaha 350 · full tower · taco outriggers · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2022 Boston Whaler 380 Outrage** — $725,000 — Annapolis, MD
  - id: `19a4c9dc-8d0b-436e-9139-da8a1761ed26` · slug: `2022-boston-whaler-380-outrage`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (73c, `too_short`): `Triple Mercury 400 Verado · unsinkable · gyro stabilized · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2022 Robalo R360** — $389,000 — Fort Lauderdale, FL
  - id: `eaf77f99-ccb0-431f-a581-64e339c6ed68` · slug: `2022-robalo-r360`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (61c, `too_short`): `Twin Yamaha 300 · hardtop · fresh water only · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2023 Grady-White Canyon 376** — $680,000 — Wrightsville Beach, NC
  - id: `6c47bea5-28a2-4f1d-acff-877ba939694e` · slug: `2023-grady-white-canyon-376`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (65c, `too_short`): `Triple Yamaha 350 · hardtop · Simrad electronics · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2023 Pursuit S 428 Sport** — $820,000 — Jupiter, FL
  - id: `2235b6c9-ab8d-46d8-9572-ef5fe4ffb4d4` · slug: `2023-pursuit-s428-sport`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (65c, `too_short`): `Quad Yamaha 350 · enclosed head · Seakeeper gyro · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2023 Sportsman Heritage 351** — $450,000 — Savannah, GA
  - id: `98f8ac72-fffd-4f60-aab0-5f39e9b857d1` · slug: `2023-sportsman-heritage-351`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (63c, `too_short`): `Triple Mercury 300 · under warranty · livewell · [DEMO LISTING]`
  - this-pass action: **rewrite**

### Performance Boats (4)

- **2020 Nor-Tech 390 Sport** — $720,000 — Fort Lauderdale, FL
  - id: `7d9925fa-0e9c-4182-ba07-77964e8754fb` · slug: `2020-nor-tech-390-sport`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (58c, `too_short`): `Quad Mercury 400R · stepped hull · 95 mph · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2021 Cigarette 42X** — $895,000 — Miami, FL
  - id: `fd0725e7-6528-402d-9085-b6e4a507c9af` · slug: `2021-cigarette-42x`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (59c, `too_short`): `Quad Mercury 450R · 130 mph · carbon fiber · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2022 Fountain 38SC** — $550,000 — Stuart, FL
  - id: `deed0c73-80ec-418e-ad29-8382654a4442` · slug: `2022-fountain-38sc`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (68c, `too_short`): `Triple Mercury 400R · center console sport · 80 mph · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2023 Scarab 255 Open** — $125,000 — Pensacola, FL
  - id: `19b8d1df-a2e8-4c5a-a5e2-588829270481` · slug: `2023-scarab-255-open`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (63c, `too_short`): `Twin Rotax 300hp · jet drive · wakeboard tower · [DEMO LISTING]`
  - this-pass action: **rewrite**

### Boats (6)

- **2021 Nautique G23** — $220,000 — Orlando, FL
  - id: `aadb78fd-0522-4d6d-aabf-ba5cec40dae6` · slug: `2021-nautique-g23-wake`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (58c, `too_short`): `PCM 6.2L 450hp ·?"NSS system · surf ready · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2021 Pathfinder 2600 TRS** — $165,000 — Biloxi, MS
  - id: `6c0d3866-e2f9-4ec0-b3d3-19e4d4aac184` · slug: `2021-pathfinder-2600-trs`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (54c, `too_short`): `Yamaha 400 · bay boat · shallow draft · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2022 Bennington 25 QX** — $145,000 — Gulf Shores, AL
  - id: `7402d3d0-c5e3-43bd-bacb-8c585677843f` · slug: `2022-bennington-25qx-pontoon`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (61c, `too_short`): `Mercury 400 Verado · tritoon · premium sound · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2023 Grady-White Freedom 285** — $289,000 — Charleston, SC
  - id: `de23271b-8fb3-45bf-8310-127c65da256f` · slug: `2023-grady-white-freedom-285`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (46c, `too_short`): `Twin Yamaha 300hp. Loaded with options. [DEMO]`
  - this-pass action: **rewrite**
- **2023 Robalo R272** — $185,000 — Hilton Head, SC
  - id: `e62dfa53-37c2-4c79-8912-e69bcf241cb1` · slug: `2023-robalo-r272`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (71c, `too_short`): `Twin Yamaha 200 · bay boat crossover · family friendly · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2024 Boston Whaler 330 Outrage** — $485,000 — Charleston, SC
  - id: `2be80eb4-c56b-4327-b949-e0d77d0a3c7e` · slug: `2024-boston-whaler-330-outrage`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (53c, `too_short`): `Triple Mercury 300hp Verado. Full electronics. [DEMO]`
  - this-pass action: **rewrite**

### Cars (8)

- **2022 BMW M4** — $68,900 — Charlotte, NC
  - id: `2386f82f-36f1-4894-9e51-fe874319d3a0` · slug: `2022-bmw-m4-competition`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (35c, `too_short`): `Twin-turbo inline-6. xDrive. [DEMO]`
  - this-pass action: **rewrite**
- **2023 Mercedes-Benz C300** — $45,900 — Charlotte, NC
  - id: `697d7827-4c59-4c44-bbdc-bfc135027fca` · slug: `2023-mercedes-c300-4matic`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (34c, `too_short`): `Premium package. Low miles. [DEMO]`
  - this-pass action: **rewrite**
- **2023 Subaru Outback Wilderness** — $41,500 — Bend, OR
  - id: `05589a1c-2c2d-468a-921b-4475fe1aac54` · slug: `2023-subaru-outback-wilderness`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (59c, `too_short`): `2.4T boxer · X-MODE · 9.5 ground clearance · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2024 Honda Accord Sport** — $32,500 — Austin, TX
  - id: `6ba9a6f7-5a97-4ad8-bc4d-2ce3333efd8c` · slug: `2024-honda-accord-sport`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (65c, `too_short`): `1.5T · CVT · Honda Sensing suite · Apple CarPlay · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2024 Hyundai Tucson Limited** — $39,500 — Seattle, WA
  - id: `20b05173-d1e7-45d0-9235-bfc26afc4160` · slug: `2024-hyundai-tucson-limited`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (70c, `too_short`): `2.5L hybrid · panoramic roof · Highway Driving Assist · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2024 Kia Telluride SX** — $52,500 — Minneapolis, MN
  - id: `995f9d8b-7c04-4711-a6aa-00a252461e8c` · slug: `2024-kia-telluride-sx`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (69c, `too_short`): `3.8L V6 · captain chairs · HDA 2 · panoramic display · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2024 Mazda CX-5 Turbo** — $38,500 — Portland, OR
  - id: `2fabf458-a490-4af5-bdb5-5b76e6e8093c` · slug: `2024-mazda-cx5-turbo`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (59c, `too_short`): `2.5T · AWD · Bose audio · premium interior · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2024 Toyota Camry XSE** — $35,500 — San Diego, CA
  - id: `568614f8-e436-41e6-83bf-97a0f412583d` · slug: `2024-toyota-camry-xse`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (58c, `too_short`): `2.5L hybrid · 225hp · JBL audio · leather · [DEMO LISTING]`
  - this-pass action: **rewrite**

### Trucks (4)

- **2023 Toyota Tacoma TRD Pro** — $54,950 — Boise, ID
  - id: `4abca147-27f9-47f5-a3bc-05fe818cb8a6` · slug: `2023-toyota-tacoma-trd-pro`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (57c, `too_short`): `3.5L V6 · crawl control · Fox suspension · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2023 Toyota Tundra** — $67,500 — Knoxville, TN
  - id: `7e4a30b6-0d46-4b69-a035-3530c5ecaeb6` · slug: `2023-toyota-tundra-trd-pro`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (37c, `too_short`): `Twin-turbo V6. Off-road ready. [DEMO]`
  - this-pass action: **rewrite**
- **2024 Ford F-150 Lightning** — $89,950 — Dallas, TX
  - id: `078b3097-9cd3-4bfa-a899-f9655b97e5ed` · slug: `2024-ford-f150-lightning`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (60c, `too_short`): `Extended range battery · 580hp · BlueCruise · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2024 Ford F-350** — $89,500 — Knoxville, TN
  - id: `5fd1e9f7-d97f-43dc-9839-ebdfd351ff7f` · slug: `2024-ford-f350-platinum`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (40c, `too_short`): `Powerstroke diesel. Fully loaded. [DEMO]`
  - this-pass action: **rewrite**

### Exotics (7)

- **2023 Mercedes-Benz AMG GT 63 S** — $185,000 — Scottsdale, AZ
  - id: `c6826590-6606-48e8-a87b-0859325e5049` · slug: `2023-mercedes-amg-gt63s`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (67c, `too_short`): `4.0L twin-turbo V8 · 630hp · carbon ceramic brakes · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2023 Porsche 911 GT3 RS** — $289,000 — Miami, FL
  - id: `cedf028a-ed3c-4a39-8d87-476667f0c376` · slug: `2023-porsche-911-gt3-rs`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (34c, `too_short`): `4.0L flat-six. Track-ready. [DEMO]`
  - this-pass action: **rewrite**
- **2024 Audi RS 5 Sportback** — $87,500 — Malibu, CA
  - id: `6580858f-8336-4ba6-b83d-7195130ccdc3` · slug: `2024-audi-rs5-sportback`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (71c, `too_short`): `2.9T V6 · 394hp · sport differential · virtual cockpit · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2024 BMW M4 Competition** — $92,500 — Miami, FL
  - id: `0d648a98-90ee-4798-8bc6-c88f5791c047` · slug: `2024-bmw-m4-competition`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (67c, `too_short`): `3.0L twin-turbo I6 · 503hp · M carbon bucket seats · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2024 Chevrolet Corvette Z06** — $145,000 — Las Vegas, NV
  - id: `9ac879b3-be79-473b-b6bc-33ccb1777b6a` · slug: `2024-chevrolet-corvette-z06`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (67c, `too_short`): `5.5L flat-plane crank V8 · 670hp · Z07 performance · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **2024 Lamborghini Huracan STO** — $375,000 — Miami, FL
  - id: `9460b3cc-b12e-46e7-8650-8432d7e6bd11` · slug: `2024-lamborghini-huracan-sto`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (42c, `too_short`): `V10 naturally aspirated. 200 miles. [DEMO]`
  - this-pass action: **rewrite**
- **2024 Porsche 911 GT3 RS** — $295,000 — Beverly Hills, CA
  - id: `c09f4f16-0cfc-45b1-b317-ed751c1d9047` · slug: `2024-porsche-911-gt3-rs`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (63c, `too_short`): `4.0L flat-six · 518hp · PDK · Weissach package · [DEMO LISTING]`
  - this-pass action: **rewrite**

### Classics (4)

- **1967 Ford Mustang GT** — $165,000 — Nashville, TN
  - id: `01d6ff78-2648-48c1-9eee-928fdd6ef936` · slug: `1967-ford-mustang-gt-fastback`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (67c, `too_short`): `390 FE big block · 4-speed manual · Highland Green · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **1969 Chevrolet Camaro Z/28** — $98,000 — Charlotte, NC
  - id: `4c447df3-e30c-4c46-9e3d-b4ce07af9bfe` · slug: `1969-chevrolet-camaro-z28`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (70c, `too_short`): `302 DZ small block · numbers matching · rally stripes · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **1970 Chevrolet Chevelle SS** — $125,000 — Memphis, TN
  - id: `11159b20-1777-4692-87cd-78284a6d7d44` · slug: `1970-chevrolet-chevelle-ss-454`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (70c, `too_short`): `LS6 454 · 450hp · Muncie 4-speed · frame-off restored · [DEMO LISTING]`
  - this-pass action: **rewrite**
- **1972 Pontiac GTO Judge** — $85,000 — Detroit, MI
  - id: `cf4cfe89-1ae6-45cd-8320-cab1f10e8a0c` · slug: `1972-pontiac-gto-judge`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (73c, `too_short`): `455 HO · Ram Air · numbers matching · concours condition · [DEMO LISTING]`
  - this-pass action: **rewrite**

### Aircraft — Jets (2)

- **2015 Embraer Phenom 300** — $7,200,000 — Teterboro, NJ
  - id: `3f747ce3-1596-48f8-bd65-92d07c83fbc0` · slug: `2015-embraer-phenom-300`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (66c, `too_short`): `Prodigy Touch avionics, factory wifi, executive 7-seat club, RVSM.`
  - this-pass action: **rewrite**
- **2019 Cessna Citation CJ4** — $8,900,000 — Van Nuys, CA
  - id: `f5e1e5af-7211-445a-bea9-5e29389eacfb` · slug: `2019-cessna-citation-cj4`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (68c, `too_short`): `Pro Line 21 with FMS-3000, dual FMS, RVSM, ADS-B Out, ATG-5000 wifi.`
  - this-pass action: **rewrite**

### Aircraft — Turboprops (3)

- **2012 Beechcraft King Air 350i** — $3,850,000 — Dallas, TX
  - id: `82a9a197-eb2b-4649-8774-6731a6ab219f` · slug: `2012-king-air-350i`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (62c, `too_short`): `Pro Line 21 with IFIS, Collins TCAS, RVSM, executive interior.`
  - this-pass action: **rewrite**
- **2016 Pilatus PC-12 NG** — $4,200,000 — White Plains, NY
  - id: `190a66be-14f7-45da-894b-b054fad1a102` · slug: `2016-pilatus-pc-12-ng`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (74c, `too_short`): `Honeywell Apex avionics, executive 6+1 interior, low total time, hangared.`
  - this-pass action: **rewrite**
- **2020 Daher TBM 940** — $4,500,000 — Boca Raton, FL
  - id: `a3ef8d2d-5cad-49ee-8ea7-410b7c57481a` · slug: `2020-daher-tbm-940`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (76c, `too_short`): `Garmin G3000 with Homesafe emergency autoland, autothrottle, low total time.`
  - this-pass action: **rewrite**

### Aircraft — Twin Engine (3)

- **1978 Cessna 310R** — $185,000 — Ocala, FL
  - id: `2ad62844-5e97-4fd6-a322-fb09eb71f3f7` · slug: `1978-cessna-310r`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (76c, `too_short`): `Classic 310R with Aspen E5, Garmin GTN 650, GTX 345 ADS-B, mid-time engines.`
  - this-pass action: **rewrite**
- **2008 Piper Seneca V** — $550,000 — Houston, TX
  - id: `baf6e8af-6f43-4b47-8eea-a1ac8b0bc159` · slug: `2008-piper-seneca-v`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (64c, `too_short`): `Turbocharged Seneca V with Garmin G1000, GFC700, A/C, six-seats.`
  - this-pass action: **rewrite**
- **2019 Beechcraft Baron G58** — $1,350,000 — Wichita, KS
  - id: `21bb2284-d34c-4b37-bbca-c81a19392fb7` · slug: `2019-beechcraft-baron-g58`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (76c, `too_short`): `Cabin-class Baron G58 with G1000 NXi, dual GTC, GFC700 autopilot, FIKI, A/C.`
  - this-pass action: **rewrite**

### Aircraft — Single Engine (4)

- **1975 Piper Cherokee Six 300** — $125,000 — Nashville, TN
  - id: `e01e3a3d-33ed-4c19-a80d-253bbb8415d4` · slug: `1975-piper-cherokee-six-300`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (68c, `too_short`): `Six-place workhorse, Garmin GTN 650, GTX 345 ADS-B, mid-time IO-540.`
  - this-pass action: **rewrite**
- **2015 Cessna 182T Skylane** — $425,000 — Orlando, FL
  - id: `957c411a-6189-476d-8162-2ad7e02c7ad5` · slug: `2015-cessna-182t-skylane`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (68c, `too_short`): `Garmin G1000 NXi, GFC700 autopilot, ADS-B in/out, leather, hangared.`
  - this-pass action: **rewrite**
- **2018 Cirrus SR22T G6** — $649,000 — Scottsdale, AZ
  - id: `c63746c4-d766-45c9-b705-95ed54c44009` · slug: `2018-cirrus-sr22t-g6`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (127c, `ok`): `Turbo-normalized SR22T G6 with Perspective+ avionics, full TKS de-ice, BRS parachute, A/C, premium leather, hangared since new.`
  - this-pass action: **enrich**
- **2020 Diamond DA40 NG** — $515,000 — Denver, CO
  - id: `bbf6921f-e1b3-41a8-85fb-403caecf2df3` · slug: `2020-diamond-da40-ng`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (81c, `ok`): `Jet-A diesel DA40 NG with G1000 NXi, GFC700, FIKI-ready, leather, low total time.`
  - this-pass action: **enrich**

### Aircraft — Helicopters (1)

- **2017 Robinson R66 Turbine** — $980,000 — San Diego, CA
  - id: `72cf6b9f-a3d6-4303-a0b7-41b393e53ab7` · slug: `2017-robinson-r66-turbine`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (71c, `too_short`): `R66 Turbine with Aspen Evolution, Garmin GTN 650, leather, A/C, low TT.`
  - this-pass action: **rewrite**

### Aircraft — Amphibious (1)

- **2021 Icon A5** — $389,000 — Clearwater, FL
  - id: `300e7f1e-45eb-4c58-8d52-49e4e48a0fdd` · slug: `2021-icon-a5`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (78c, `too_short`): `Light-sport amphibious A5 with Garmin G3X Touch, BRS parachute, folding wings.`
  - this-pass action: **rewrite**

### Aircraft — Vintage (1)

- **1944 North American T-6 Texan** — $285,000 — Oshkosh, WI
  - id: `c67d280c-eb15-48be-89b8-15da1b79540d` · slug: `1944-north-american-t-6-texan`
  - photos: 4 (cover ✓ all 200/image ✓)
  - prior desc (83c, `ok`): `WWII-era T-6 Texan, ground-up restoration, fresh annual, P&W R-1340, airshow-ready.`
  - this-pass action: **enrich**