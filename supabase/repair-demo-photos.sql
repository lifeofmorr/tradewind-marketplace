-- ============================================================================
-- TradeWind · Repair broken Unsplash photo URLs
-- ============================================================================
-- The first round of demo photo backfill (supabase/backfill-demo-photos.sql)
-- and the seed cover defaults (supabase/seed.sql) used several Unsplash photo
-- IDs that have since been removed from images.unsplash.com and now return
-- 404. The card and gallery components hide the <img> on error and fall back
-- to the gradient placeholder, which is why some demo listings still look
-- bare even after the backfill ran.
--
-- This script swaps each known-broken image URL with a working, category-
-- appropriate replacement, both in `listings.cover_photo_url` and in the
-- `listing_photos` table (url AND storage_path — the backfill mirrored the
-- URL into storage_path as a hack since storage_path is NOT NULL).
--
-- Apply with:
--   psql "$SUPABASE_DB_URL" -f supabase/repair-demo-photos.sql
-- or paste into the Supabase SQL editor.
--
-- Idempotent: re-running is a no-op once all rows are repaired.
-- ============================================================================

with replacements(broken_id, fixed_id) as (
  values
    -- demoMediaMap.ts — confirmed 404 on images.unsplash.com:
    ('photo-1558618666-fcd25c85f82e', 'photo-1502209524164-acea936639a2'), -- center_console[3]
    ('photo-1597701981029-69da8bbd5c62', 'photo-1544551763-77ef2d0cfc6c'), -- center_console[4]
    ('photo-1575994532957-773da2e09efd', 'photo-1501761095094-94d36f57edbb'), -- performance_boat[1]
    ('photo-1570991404394-e01de1e6f4a6', 'photo-1469854523086-cc02fe5d8800'), -- boat[0]
    ('photo-1533473359331-2969b64c911c', 'photo-1494976388531-d1058494cdd8'), -- car[2] / truck[4]
    ('photo-1549317661-bd32c8ce0abe',   'photo-1502877338535-766e1452684a'), -- car[3] / exotic[4]
    ('photo-1525609004556-c46c6c5104b8', 'photo-1553440569-bcc63803a83d'), -- exotic[2]
    ('photo-1517846693597-15a1620c8e60', 'photo-1558981852-426c6c22a060'), -- powersports[2]

    -- seed.sql original cover defaults — also 404:
    ('photo-1527431016772-49a972b56e7c', 'photo-1469854523086-cc02fe5d8800'), -- seed boat
    ('photo-1532779550027-cc7195a458a4', 'photo-1601158935942-52255782d322')  -- seed rv
)

-- Repair listings.cover_photo_url
, fix_listings as (
  update public.listings l
     set cover_photo_url = replace(l.cover_photo_url, r.broken_id, r.fixed_id),
         updated_at = now()
    from replacements r
   where l.cover_photo_url like '%' || r.broken_id || '%'
   returning l.id
)

-- Repair listing_photos.url
, fix_photo_url as (
  update public.listing_photos p
     set url = replace(p.url, r.broken_id, r.fixed_id)
    from replacements r
   where p.url is not null
     and p.url like '%' || r.broken_id || '%'
   returning p.id
)

-- Repair listing_photos.storage_path (backfill mirrored URL into storage_path)
, fix_photo_storage as (
  update public.listing_photos p
     set storage_path = replace(p.storage_path, r.broken_id, r.fixed_id)
    from replacements r
   where p.storage_path like '%' || r.broken_id || '%'
   returning p.id
)

select
  (select count(*) from fix_listings)      as listings_cover_repaired,
  (select count(*) from fix_photo_url)     as photos_url_repaired,
  (select count(*) from fix_photo_storage) as photos_storage_repaired;
