-- Backfill listing_photos for is_demo = true listings.
--
-- Pure-SQL alternative to scripts/backfill-demo-photos.ts. Paste into the
-- Supabase SQL editor (project: qwaotydaazymgnvnfuuj) and run. Mirrors the URL
-- bucket in src/lib/demoMediaMap.ts.
--
-- Idempotent — listings that already have any rows in listing_photos are
-- skipped, so it's safe to re-run.

with photo_bank as (
  select * from (values
    -- (category, idx-within-bucket, url)
    ('yacht'::public.listing_category, 0, 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80&auto=format&fit=crop'),
    ('yacht', 1, 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&q=80&auto=format&fit=crop'),
    ('yacht', 2, 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&q=80&auto=format&fit=crop'),
    ('yacht', 3, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80&auto=format&fit=crop'),
    ('yacht', 4, 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&q=80&auto=format&fit=crop'),

    ('center_console', 0, 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800&q=80&auto=format&fit=crop'),
    ('center_console', 1, 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=800&q=80&auto=format&fit=crop'),
    ('center_console', 2, 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=800&q=80&auto=format&fit=crop'),
    ('center_console', 3, 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80&auto=format&fit=crop'),
    ('center_console', 4, 'https://images.unsplash.com/photo-1597701981029-69da8bbd5c62?w=800&q=80&auto=format&fit=crop'),

    ('performance_boat', 0, 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=800&q=80&auto=format&fit=crop'),
    ('performance_boat', 1, 'https://images.unsplash.com/photo-1575994532957-773da2e09efd?w=800&q=80&auto=format&fit=crop'),
    ('performance_boat', 2, 'https://images.unsplash.com/photo-1562281302-809108fd533c?w=800&q=80&auto=format&fit=crop'),
    ('performance_boat', 3, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80&auto=format&fit=crop'),
    ('performance_boat', 4, 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&q=80&auto=format&fit=crop'),

    ('boat', 0, 'https://images.unsplash.com/photo-1570991404394-e01de1e6f4a6?w=800&q=80&auto=format&fit=crop'),
    ('boat', 1, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&auto=format&fit=crop'),
    ('boat', 2, 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&q=80&auto=format&fit=crop'),
    ('boat', 3, 'https://images.unsplash.com/photo-1569317002804-ab77bcf1bce4?w=800&q=80&auto=format&fit=crop'),
    ('boat', 4, 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=800&q=80&auto=format&fit=crop'),

    ('car', 0, 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80&auto=format&fit=crop'),
    ('car', 1, 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80&auto=format&fit=crop'),
    ('car', 2, 'https://images.unsplash.com/photo-1533473359331-2969b64c911c?w=800&q=80&auto=format&fit=crop'),
    ('car', 3, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0abe?w=800&q=80&auto=format&fit=crop'),
    ('car', 4, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&auto=format&fit=crop'),

    ('truck', 0, 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80&auto=format&fit=crop'),
    ('truck', 1, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80&auto=format&fit=crop'),
    ('truck', 2, 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80&auto=format&fit=crop'),
    ('truck', 3, 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80&auto=format&fit=crop'),
    ('truck', 4, 'https://images.unsplash.com/photo-1533473359331-2969b64c911c?w=800&q=80&auto=format&fit=crop'),

    ('exotic', 0, 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80&auto=format&fit=crop'),
    ('exotic', 1, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&auto=format&fit=crop'),
    ('exotic', 2, 'https://images.unsplash.com/photo-1525609004556-c46c6c5104b8?w=800&q=80&auto=format&fit=crop'),
    ('exotic', 3, 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80&auto=format&fit=crop'),
    ('exotic', 4, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0abe?w=800&q=80&auto=format&fit=crop'),

    ('classic', 0, 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&q=80&auto=format&fit=crop'),
    ('classic', 1, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80&auto=format&fit=crop'),
    ('classic', 2, 'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=800&q=80&auto=format&fit=crop'),
    ('classic', 3, 'https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=800&q=80&auto=format&fit=crop'),
    ('classic', 4, 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80&auto=format&fit=crop')
  ) as t(category, idx, url)
),

-- Demo listings that currently have no photos. Number them within their
-- category so we can rotate through the photo bank.
candidates as (
  select
    l.id,
    l.category,
    l.title,
    (row_number() over (
      partition by l.category
      order by l.created_at, l.id
    ) - 1) as cat_offset
  from public.listings l
  where l.is_demo = true
    and not exists (
      select 1 from public.listing_photos p where p.listing_id = l.id
    )
),

-- For each listing, expand to 4 rows (positions 0..3) and join against the
-- photo bank. The bank has 5 entries per category, so MOD 5 keeps us in range
-- and rotates start position by cat_offset, varying covers across listings.
expanded as (
  select
    c.id           as listing_id,
    c.title,
    c.category,
    pos.position,
    ((c.cat_offset + pos.position) % 5) as bank_idx
  from candidates c
  cross join lateral (values (0), (1), (2), (3)) as pos(position)
),

photos_to_insert as (
  select
    e.listing_id,
    b.url,
    e.title,
    e.category,
    e.position
  from expanded e
  join photo_bank b
    on b.category = e.category and b.idx = e.bank_idx
),

inserted as (
  insert into public.listing_photos
    (listing_id, storage_path, url, alt_text, position, is_cover)
  select
    listing_id,
    url            as storage_path, -- external CDN; mirror URL into storage_path
    url,
    coalesce(title, category::text || ' photo ' || (position + 1)::text) as alt_text,
    position,
    (position = 0) as is_cover
  from photos_to_insert
  returning listing_id, url, position
)

-- Sync listings.cover_photo_url to the freshly inserted cover photo so card
-- views render without an extra join.
update public.listings l
set    cover_photo_url = i.url,
       updated_at = now()
from   inserted i
where  i.listing_id = l.id
  and  i.position = 0;

-- Quick verification query — run after the script to confirm coverage.
-- select category,
--        count(*) filter (where exists (
--          select 1 from public.listing_photos p where p.listing_id = l.id
--        )) as with_photos,
--        count(*) as total
-- from public.listings l
-- where l.is_demo = true
-- group by category
-- order by category;
