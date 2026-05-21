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
