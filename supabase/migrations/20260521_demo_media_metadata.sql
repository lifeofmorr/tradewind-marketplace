-- ─────────────────────────────────────────────────────────────────────────────
-- Demo media metadata
--
-- Adds attribution and demo-marker columns to listing_photos so we can:
--   * Identify which photos are demo (Unsplash) vs. real seller uploads.
--   * Track license terms per photo for audit / takedown response.
--   * Filter demo media out of real-listing flows (analytics, indexing, etc.).
--
-- After applying this migration, the companion script
-- `supabase/realistic-demo-descriptions.sql` should be run to backfill the
-- 65 demo listing descriptions with dealer-grade narratives.
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

ALTER TABLE public.listing_photos
  ADD COLUMN IF NOT EXISTS image_source   text,
  ADD COLUMN IF NOT EXISTS image_license  text,
  ADD COLUMN IF NOT EXISTS is_demo_media  boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.listing_photos.image_source
  IS 'Origin of the image. e.g. ''unsplash'', ''seller_upload'', ''dealer_feed''.';
COMMENT ON COLUMN public.listing_photos.image_license
  IS 'License terms governing reuse. e.g. ''unsplash-free'', ''proprietary'', ''cc-by-4.0''.';
COMMENT ON COLUMN public.listing_photos.is_demo_media
  IS 'TRUE when the photo is part of the demo inventory (not a real seller upload).';

CREATE INDEX IF NOT EXISTS listing_photos_is_demo_media_idx
  ON public.listing_photos(is_demo_media) WHERE is_demo_media;

CREATE INDEX IF NOT EXISTS listing_photos_image_source_idx
  ON public.listing_photos(image_source) WHERE image_source IS NOT NULL;

-- Backfill: every photo currently attached to an is_demo listing is, by
-- definition, demo media. The previous source-match pass populated all 260
-- demo photos from Unsplash, so the license is uniform.
UPDATE public.listing_photos lp
SET    image_source  = 'unsplash',
       image_license = 'unsplash-free',
       is_demo_media = true
FROM   public.listings l
WHERE  lp.listing_id = l.id
  AND  l.is_demo = true;

COMMIT;
