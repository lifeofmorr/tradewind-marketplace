-- ============================================================================
-- TradeWind · Source-match demo listing photos
-- ============================================================================
-- Earlier demo backfills used Unsplash IDs that load (HTTP 200) but depict the
-- wrong subject — e.g. a yellow VW van for "boat", a coffee cup for
-- "performance_boat", a black pug for "aircraft_helicopter". This script
-- replaces every demo listing's cover photo and listing_photos rows with the
-- hand-verified, category-matched Unsplash CDN URLs defined in
-- src/lib/demoMediaMap.ts.
--
-- Apply with:
--   psql "$SUPABASE_DB_URL" -f supabase/source-match-demo-photos.sql
-- or paste into the Supabase SQL editor (project: qwaotydaazymgnvnfuuj).
--
-- Idempotent: every demo listing's photos are torn down and rebuilt from the
-- verified bank below. Safe to re-run.
-- ============================================================================

begin;

-- Verified photo bank — every URL was visually audited against its category.
-- Keep this in sync with src/lib/demoMediaMap.ts.
with photo_bank(category, idx, url) as (
  values
    -- ── yacht ──────────────────────────────────────────────────────────────
    ('yacht'::public.listing_category, 0, 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&q=80&auto=format&fit=crop'),
    ('yacht', 1, 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1200&q=80&auto=format&fit=crop'),
    ('yacht', 2, 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1200&q=80&auto=format&fit=crop'),
    ('yacht', 3, 'https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?w=1200&q=80&auto=format&fit=crop'),
    ('yacht', 4, 'https://images.unsplash.com/photo-1604737637145-48cc31d160eb?w=1200&q=80&auto=format&fit=crop'),
    ('yacht', 5, 'https://images.unsplash.com/photo-1535024966840-e7424dc2635b?w=1200&q=80&auto=format&fit=crop'),
    ('yacht', 6, 'https://images.unsplash.com/photo-1559385301-0187cb6eff46?w=1200&q=80&auto=format&fit=crop'),
    ('yacht', 7, 'https://images.unsplash.com/photo-1585000962552-70f0a67223d9?w=1200&q=80&auto=format&fit=crop'),

    -- ── center_console ─────────────────────────────────────────────────────
    ('center_console', 0, 'https://images.unsplash.com/photo-1674419404519-54fa8a774aa2?w=1200&q=80&auto=format&fit=crop'),
    ('center_console', 1, 'https://images.unsplash.com/photo-1611610394547-32c20719d266?w=1200&q=80&auto=format&fit=crop'),
    ('center_console', 2, 'https://images.unsplash.com/photo-1589704386820-b055d1b0daf0?w=1200&q=80&auto=format&fit=crop'),
    ('center_console', 3, 'https://images.unsplash.com/photo-1657689808834-88973a6bab9a?w=1200&q=80&auto=format&fit=crop'),
    ('center_console', 4, 'https://images.unsplash.com/photo-1685007823359-cedee642d04d?w=1200&q=80&auto=format&fit=crop'),
    ('center_console', 5, 'https://images.unsplash.com/photo-1617217652842-c2278360d9fd?w=1200&q=80&auto=format&fit=crop'),

    -- ── performance_boat ───────────────────────────────────────────────────
    ('performance_boat', 0, 'https://images.unsplash.com/photo-1615646194267-ecf4380ac001?w=1200&q=80&auto=format&fit=crop'),
    ('performance_boat', 1, 'https://images.unsplash.com/photo-1622082671151-2cbd184f9e60?w=1200&q=80&auto=format&fit=crop'),
    ('performance_boat', 2, 'https://images.unsplash.com/photo-1530478360694-903604e44961?w=1200&q=80&auto=format&fit=crop'),
    ('performance_boat', 3, 'https://images.unsplash.com/photo-1567369244263-8f45293b2178?w=1200&q=80&auto=format&fit=crop'),
    ('performance_boat', 4, 'https://images.unsplash.com/photo-1620326467418-14c39a82ebe3?w=1200&q=80&auto=format&fit=crop'),
    ('performance_boat', 5, 'https://images.unsplash.com/photo-1498528738175-10068e55f9a7?w=1200&q=80&auto=format&fit=crop'),

    -- ── boat (sailboats, pontoons, runabouts, small cruisers) ──────────────
    ('boat', 0, 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1200&q=80&auto=format&fit=crop'),
    ('boat', 1, 'https://images.unsplash.com/photo-1685007823359-cedee642d04d?w=1200&q=80&auto=format&fit=crop'),
    ('boat', 2, 'https://images.unsplash.com/photo-1589704386820-b055d1b0daf0?w=1200&q=80&auto=format&fit=crop'),
    ('boat', 3, 'https://images.unsplash.com/photo-1604737637145-48cc31d160eb?w=1200&q=80&auto=format&fit=crop'),
    ('boat', 4, 'https://images.unsplash.com/photo-1535024966840-e7424dc2635b?w=1200&q=80&auto=format&fit=crop'),

    -- ── car ────────────────────────────────────────────────────────────────
    ('car', 0, 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&q=80&auto=format&fit=crop'),
    ('car', 1, 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80&auto=format&fit=crop'),
    ('car', 2, 'https://images.unsplash.com/photo-1547038577-da80abbc4f19?w=1200&q=80&auto=format&fit=crop'),
    ('car', 3, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1200&q=80&auto=format&fit=crop'),
    ('car', 4, 'https://images.unsplash.com/photo-1601158935942-52255782d322?w=1200&q=80&auto=format&fit=crop'),
    ('car', 5, 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=1200&q=80&auto=format&fit=crop'),

    -- ── truck ──────────────────────────────────────────────────────────────
    ('truck', 0, 'https://images.unsplash.com/photo-1551830820-330a71b99659?w=1200&q=80&auto=format&fit=crop'),
    ('truck', 1, 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=1200&q=80&auto=format&fit=crop'),
    ('truck', 2, 'https://images.unsplash.com/photo-1601252300554-4ad551483bd2?w=1200&q=80&auto=format&fit=crop'),
    ('truck', 3, 'https://images.unsplash.com/photo-1610647929723-a8922852cd44?w=1200&q=80&auto=format&fit=crop'),
    ('truck', 4, 'https://images.unsplash.com/photo-1612057473117-3e16246121e6?w=1200&q=80&auto=format&fit=crop'),
    ('truck', 5, 'https://images.unsplash.com/photo-1657920035552-809ed648bb37?w=1200&q=80&auto=format&fit=crop'),
    ('truck', 6, 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?w=1200&q=80&auto=format&fit=crop'),
    ('truck', 7, 'https://images.unsplash.com/photo-1605504835488-e8c6d37beb43?w=1200&q=80&auto=format&fit=crop'),

    -- ── exotic ─────────────────────────────────────────────────────────────
    ('exotic', 0, 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=80&auto=format&fit=crop'),
    ('exotic', 1, 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=1200&q=80&auto=format&fit=crop'),
    ('exotic', 2, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80&auto=format&fit=crop'),
    ('exotic', 3, 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=1200&q=80&auto=format&fit=crop'),
    ('exotic', 4, 'https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=1200&q=80&auto=format&fit=crop'),
    ('exotic', 5, 'https://images.unsplash.com/photo-1530906358829-e84b2769270f?w=1200&q=80&auto=format&fit=crop'),
    ('exotic', 6, 'https://images.unsplash.com/photo-1611740801331-d8b5d6962822?w=1200&q=80&auto=format&fit=crop'),
    ('exotic', 7, 'https://images.unsplash.com/photo-1566024164372-0281f1133aa6?w=1200&q=80&auto=format&fit=crop'),
    ('exotic', 8, 'https://images.unsplash.com/photo-1617814086906-d847a8bc6fca?w=1200&q=80&auto=format&fit=crop'),
    ('exotic', 9, 'https://images.unsplash.com/photo-1604705528621-81b2755a320b?w=1200&q=80&auto=format&fit=crop'),
    ('exotic', 10, 'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=1200&q=80&auto=format&fit=crop'),

    -- ── classic ────────────────────────────────────────────────────────────
    ('classic', 0, 'https://images.unsplash.com/photo-1584345604325-f5091269a0d1?w=1200&q=80&auto=format&fit=crop'),
    ('classic', 1, 'https://images.unsplash.com/photo-1606942790567-5783bab8d944?w=1200&q=80&auto=format&fit=crop'),
    ('classic', 2, 'https://images.unsplash.com/photo-1615238359019-c8de4242e083?w=1200&q=80&auto=format&fit=crop'),
    ('classic', 3, 'https://images.unsplash.com/photo-1626190288283-5c66aa3ed9ea?w=1200&q=80&auto=format&fit=crop'),
    ('classic', 4, 'https://images.unsplash.com/photo-1629649075111-a5a850107bad?w=1200&q=80&auto=format&fit=crop'),
    ('classic', 5, 'https://images.unsplash.com/photo-1616019459068-4cc6dca4d3a1?w=1200&q=80&auto=format&fit=crop'),
    ('classic', 6, 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=1200&q=80&auto=format&fit=crop'),
    ('classic', 7, 'https://images.unsplash.com/photo-1607535882326-e3bd656233b3?w=1200&q=80&auto=format&fit=crop'),

    -- ── powersports ────────────────────────────────────────────────────────
    ('powersports', 0, 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&q=80&auto=format&fit=crop'),
    ('powersports', 1, 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&q=80&auto=format&fit=crop'),
    ('powersports', 2, 'https://images.unsplash.com/photo-1558981852-426c6c22a060?w=1200&q=80&auto=format&fit=crop'),

    -- ── rv ─────────────────────────────────────────────────────────────────
    ('rv', 0, 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200&q=80&auto=format&fit=crop'),

    -- ── aircraft_single_engine ─────────────────────────────────────────────
    ('aircraft_single_engine', 0, 'https://images.unsplash.com/photo-1690944210909-9a97ba72a50b?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_single_engine', 1, 'https://images.unsplash.com/photo-1593938346024-7ee982d8224b?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_single_engine', 2, 'https://images.unsplash.com/photo-1592805145089-6066b407e342?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_single_engine', 3, 'https://images.unsplash.com/photo-1629233650020-aa014ed76f8d?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_single_engine', 4, 'https://images.unsplash.com/photo-1604285861770-54cb117a3f5a?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_single_engine', 5, 'https://images.unsplash.com/photo-1620473443431-91e48dbebe40?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_single_engine', 6, 'https://images.unsplash.com/photo-1638911810548-b113aee0d89f?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_single_engine', 7, 'https://images.unsplash.com/photo-1586063029643-fd87377743ef?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_single_engine', 8, 'https://images.unsplash.com/photo-1532200624530-cc3d3d0d636c?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_single_engine', 9, 'https://images.unsplash.com/photo-1527354372664-ae0112ab2c41?w=1200&q=80&auto=format&fit=crop'),

    -- ── aircraft_twin_engine ───────────────────────────────────────────────
    ('aircraft_twin_engine', 0, 'https://images.unsplash.com/photo-1522035612764-b0e4ba8915e1?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_twin_engine', 1, 'https://images.unsplash.com/photo-1660968601185-e7414de388f4?w=1200&q=80&auto=format&fit=crop'),

    -- ── aircraft_turboprop ─────────────────────────────────────────────────
    ('aircraft_turboprop', 0, 'https://images.unsplash.com/photo-1522035612764-b0e4ba8915e1?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_turboprop', 1, 'https://images.unsplash.com/photo-1660968601185-e7414de388f4?w=1200&q=80&auto=format&fit=crop'),

    -- ── aircraft_jet ───────────────────────────────────────────────────────
    ('aircraft_jet', 0, 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_jet', 1, 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_jet', 2, 'https://images.unsplash.com/photo-1619659085985-f51a00f0160a?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_jet', 3, 'https://images.unsplash.com/photo-1619652116813-98504fce82d2?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_jet', 4, 'https://images.unsplash.com/photo-1684838200815-36eef38f353c?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_jet', 5, 'https://images.unsplash.com/photo-1684838200888-192e2a163cc9?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_jet', 6, 'https://images.unsplash.com/photo-1616620418290-81a162f05e5d?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_jet', 7, 'https://images.unsplash.com/photo-1566212775038-532d06eda485?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_jet', 8, 'https://images.unsplash.com/photo-1625513123245-fcb02d69ad12?w=1200&q=80&auto=format&fit=crop'),

    -- ── aircraft_helicopter ────────────────────────────────────────────────
    ('aircraft_helicopter', 0, 'https://images.unsplash.com/photo-1607525884336-66ccfac7ab56?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_helicopter', 1, 'https://images.unsplash.com/photo-1495554698253-681539e9ea84?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_helicopter', 2, 'https://images.unsplash.com/photo-1512290472191-eb043dfa96e2?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_helicopter', 3, 'https://images.unsplash.com/photo-1576725386266-5c4b8c63da66?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_helicopter', 4, 'https://images.unsplash.com/photo-1629205163875-8f3d9a17e09e?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_helicopter', 5, 'https://images.unsplash.com/photo-1616899822079-5e40267ebbc4?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_helicopter', 6, 'https://images.unsplash.com/photo-1592569237690-69813b318567?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_helicopter', 7, 'https://images.unsplash.com/photo-1557818673-effec50525e1?w=1200&q=80&auto=format&fit=crop'),

    -- ── aircraft_vintage ───────────────────────────────────────────────────
    ('aircraft_vintage', 0, 'https://images.unsplash.com/photo-1644095267897-39ca7730c094?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_vintage', 1, 'https://images.unsplash.com/photo-1623294603586-db41835b29b6?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_vintage', 2, 'https://images.unsplash.com/photo-1564404085635-c6616adb5ac7?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_vintage', 3, 'https://images.unsplash.com/photo-1564404085675-51992c968514?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_vintage', 4, 'https://images.unsplash.com/photo-1551520133-9e6d5eacaedb?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_vintage', 5, 'https://images.unsplash.com/photo-1564404084712-34061bbf94c9?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_vintage', 6, 'https://images.unsplash.com/photo-1619310274689-cf4973d8e096?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_vintage', 7, 'https://images.unsplash.com/photo-1568554318257-8c930d8fcac0?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_vintage', 8, 'https://images.unsplash.com/photo-1541316515424-047f8eca37d4?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_vintage', 9, 'https://images.unsplash.com/photo-1623294865837-9902b6c97f2f?w=1200&q=80&auto=format&fit=crop'),

    -- ── aircraft_very_light_jet ────────────────────────────────────────────
    ('aircraft_very_light_jet', 0, 'https://images.unsplash.com/photo-1619652116813-98504fce82d2?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_very_light_jet', 1, 'https://images.unsplash.com/photo-1619659085985-f51a00f0160a?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_very_light_jet', 2, 'https://images.unsplash.com/photo-1684838200888-192e2a163cc9?w=1200&q=80&auto=format&fit=crop'),

    -- ── aircraft_experimental ──────────────────────────────────────────────
    ('aircraft_experimental', 0, 'https://images.unsplash.com/photo-1604285861770-54cb117a3f5a?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_experimental', 1, 'https://images.unsplash.com/photo-1593938346024-7ee982d8224b?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_experimental', 2, 'https://images.unsplash.com/photo-1620473443431-91e48dbebe40?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_experimental', 3, 'https://images.unsplash.com/photo-1638911810548-b113aee0d89f?w=1200&q=80&auto=format&fit=crop'),

    -- ── aircraft_amphibious (seaplanes / floatplanes) ──────────────────────
    ('aircraft_amphibious', 0, 'https://images.unsplash.com/photo-1550259979-ffa0383e2b5e?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_amphibious', 1, 'https://images.unsplash.com/photo-1550951428-ed00ffc028d5?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_amphibious', 2, 'https://images.unsplash.com/photo-1518972695-f4e8997efb0d?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_amphibious', 3, 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_amphibious', 4, 'https://images.unsplash.com/photo-1665021657505-3a680c9cf4b3?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_amphibious', 5, 'https://images.unsplash.com/photo-1634158267270-f03b4c17c46f?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_amphibious', 6, 'https://images.unsplash.com/photo-1617868624816-93dddba14d9d?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_amphibious', 7, 'https://images.unsplash.com/photo-1597123377565-fa80c07fe6ea?w=1200&q=80&auto=format&fit=crop'),

    -- ── aircraft_lsa ───────────────────────────────────────────────────────
    ('aircraft_lsa', 0, 'https://images.unsplash.com/photo-1604285861770-54cb117a3f5a?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_lsa', 1, 'https://images.unsplash.com/photo-1592805145089-6066b407e342?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_lsa', 2, 'https://images.unsplash.com/photo-1690944210909-9a97ba72a50b?w=1200&q=80&auto=format&fit=crop'),

    -- ── aircraft_parts ─────────────────────────────────────────────────────
    ('aircraft_parts', 0, 'https://images.unsplash.com/photo-1593938346024-7ee982d8224b?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_parts', 1, 'https://images.unsplash.com/photo-1620473443431-91e48dbebe40?w=1200&q=80&auto=format&fit=crop'),
    ('aircraft_parts', 2, 'https://images.unsplash.com/photo-1532200624530-cc3d3d0d636c?w=1200&q=80&auto=format&fit=crop'),

    -- ── aviation_services ──────────────────────────────────────────────────
    ('aviation_services', 0, 'https://images.unsplash.com/photo-1684838200815-36eef38f353c?w=1200&q=80&auto=format&fit=crop'),
    ('aviation_services', 1, 'https://images.unsplash.com/photo-1619659085985-f51a00f0160a?w=1200&q=80&auto=format&fit=crop'),
    ('aviation_services', 2, 'https://images.unsplash.com/photo-1532200624530-cc3d3d0d636c?w=1200&q=80&auto=format&fit=crop')
),

-- Bucket size per category — used to MOD the rotation.
bucket_sizes as (
  select category, count(*)::int as n from photo_bank group by category
),

-- Number demo listings within each category so we rotate through the bucket.
ordered_demos as (
  select
    l.id,
    l.category,
    l.slug,
    l.title,
    (row_number() over (
      partition by l.category
      order by l.created_at, l.id
    ) - 1)::int as cat_offset
  from public.listings l
  where l.is_demo = true
),

-- Expand each listing to 4 photo positions.
expanded as (
  select
    d.id           as listing_id,
    d.category,
    d.slug,
    d.title,
    pos.position,
    ((d.cat_offset + pos.position) % coalesce(b.n, 1))::int as bank_idx
  from ordered_demos d
  cross join lateral (values (0), (1), (2), (3)) as pos(position)
  left join bucket_sizes b on b.category = d.category
),

photos_to_insert as (
  select
    e.listing_id,
    pb.url,
    e.title,
    e.category,
    e.position
  from expanded e
  join photo_bank pb
    on pb.category = e.category and pb.idx = e.bank_idx
),

-- Wipe existing demo listing photos so we rebuild cleanly.
deleted as (
  delete from public.listing_photos
   where listing_id in (select id from ordered_demos)
  returning listing_id
),

-- Insert the verified photos.
inserted as (
  insert into public.listing_photos
    (listing_id, storage_path, url, alt_text, position, is_cover)
  select
    listing_id,
    url            as storage_path,
    url,
    coalesce(title, category::text || ' photo ' || (position + 1)::text) as alt_text,
    position,
    (position = 0) as is_cover
  from photos_to_insert
  returning listing_id, url, position
),

-- Sync listings.cover_photo_url to the new cover (position 0).
cover_update as (
  update public.listings l
     set cover_photo_url = i.url,
         updated_at = now()
    from inserted i
   where i.listing_id = l.id
     and i.position = 0
  returning l.id
)

select
  (select count(distinct listing_id) from deleted)        as photos_deleted_listings,
  (select count(*) from inserted)                         as photos_inserted,
  (select count(*) from cover_update)                     as covers_updated,
  (select count(*) from public.listings where is_demo)    as total_demo_listings;

commit;

-- Verification query — run after to confirm every demo listing has 4 photos
-- and a non-null cover.
--
-- select category,
--        count(*) as listings,
--        count(*) filter (where cover_photo_url is not null) as with_cover,
--        avg(
--          (select count(*) from public.listing_photos p where p.listing_id = l.id)
--        )::int as avg_photos
--   from public.listings l
--  where is_demo = true
--  group by category
--  order by category;
