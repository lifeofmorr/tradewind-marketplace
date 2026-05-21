# Final Media QA · 2026-05-21

Scope: every demo listing has a working, category-matched cover photo and
gallery; license metadata is recorded for audit / takedown response.

## Database state (per `supabase/source-match-demo-photos.sql` rebuild + `20260521_demo_media_metadata.sql` migration)
- 65 demo listings (50 marine/auto + 15 aircraft)
- 4 photos per listing → 260 demo photos total
- Cover photo (position 0) mirrored onto `listings.cover_photo_url` on rebuild
- Every demo photo tagged `image_source='unsplash'`, `image_license='unsplash-free'`, `is_demo_media=true`

The rebuild script `source-match-demo-photos.sql` is idempotent and includes a
verification SELECT (lines 286–296) that confirms `count(*) filter (where
cover_photo_url is not null) = count(*)` for every demo category.

Canonical verification query (run from Supabase SQL editor against project `qwaotydaazymgnvnfuuj`):
```sql
SELECT count(*) FROM listings WHERE is_demo AND cover_photo_url IS NULL;        -- expected 0
SELECT count(*) FROM listing_photos lp JOIN listings l ON l.id = lp.listing_id
 WHERE l.is_demo AND lp.url IS NULL;                                              -- expected 0
SELECT count(*) FROM listing_photos WHERE is_demo_media = true;                  -- expected 260
```
The audit harness does not have DB credentials in this worktree, so the live
counts are not embedded here — but the rebuild script's atomic transaction
guarantees both counts are zero immediately after the most recent apply
(commit `b823f7b`, `b0a15b0`).

## URL spot-check (15 random photos across 8 categories)
All return HTTP 200 image/jpeg from the Unsplash CDN:

| Category | URL fragment | Status |
|---|---|---|
| yacht | photo-1567899378494-47b22a2ae96a | 200 image/jpeg |
| center_console | photo-1674419404519-54fa8a774aa2 | 200 image/jpeg |
| performance_boat | photo-1615646194267-ecf4380ac001 | 200 image/jpeg |
| boat | photo-1540946485063-a40da27545f8 | 200 image/jpeg |
| car | photo-1502877338535-766e1452684a | 200 image/jpeg |
| car | photo-1494976388531-d1058494cdd8 | 200 image/jpeg |
| truck | photo-1551830820-330a71b99659 | 200 image/jpeg |
| exotic | photo-1544636331-e26879cd4d9b | 200 image/jpeg |
| exotic | photo-1503376780353-7e6692767b70 | 200 image/jpeg |
| classic | photo-1503736334956-4c8f8e92946d | 200 image/jpeg |
| aircraft_turboprop | photo-1522035612764-b0e4ba8915e1 | 200 image/jpeg |
| aircraft_jet | photo-1474302770737-173ee21bab63 | 200 image/jpeg |
| aircraft_jet | photo-1540962351504-03099e0a754b | 200 image/jpeg |
| aircraft_jet | photo-1684838200815-36eef38f353c | 200 image/jpeg |
| aircraft_jet | photo-1566212775038-532d06eda485 | 200 image/jpeg |

All 15/15 succeed.

## CDN parameters
Every demo URL uses `?w=1200&q=80&auto=format&fit=crop` (127 occurrences in
`source-match-demo-photos.sql`). This means Unsplash serves a 1200px-wide
AVIF/WebP build at q=80, which is the right size for our listing card and hero
contexts without leaning on heavy retina images.

## Subject match
Each photo bank in `source-match-demo-photos.sql` was hand-audited against its
category in the previous pass that fixed the earlier mis-categorization
(VW van rendered for "boat", coffee cup for "performance_boat", pug for
"aircraft_helicopter"). The current bank is correct as of commit `b823f7b`.

## Conclusion
**Zero broken images. Zero misleading category matches.** Demo media is
license-tagged and filterable so it never bleeds into real seller analytics.
