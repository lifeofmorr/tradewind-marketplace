/**
 * Backfill listing_photos rows for demo listings.
 *
 * Pulls every is_demo = true listing, and for any that has zero photos, inserts
 * 4 category-appropriate Unsplash CDN URLs from src/lib/demoMediaMap.ts. Also
 * sets listings.cover_photo_url so card views render without an extra join.
 *
 * Idempotent — listings that already have photos are skipped.
 *
 * Usage:
 *   SUPABASE_URL=https://<ref>.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
 *   npx tsx scripts/backfill-demo-photos.ts
 *
 * Service role key is required because the listing_photos RLS policy only
 * allows the listing owner to insert. The service role bypasses RLS.
 */

import { createClient } from "@supabase/supabase-js";
import { demoMediaMap, pickDemoPhotos } from "../src/lib/demoMediaMap";
import type { ListingCategory } from "../src/types/database";

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Missing env. Set SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const PHOTOS_PER_LISTING = 4;

type DemoListing = {
  id: string;
  category: ListingCategory;
  title: string | null;
  cover_photo_url: string | null;
};

async function main() {
  const { data: listings, error } = await supabase
    .from("listings")
    .select("id, category, title, cover_photo_url")
    .eq("is_demo", true)
    .order("category, created_at");

  if (error) {
    console.error("Failed to fetch demo listings:", error.message);
    process.exit(1);
  }

  const demos = (listings ?? []) as DemoListing[];
  console.log(`Found ${demos.length} demo listings.`);

  // Group by category so we can rotate through each bucket and avoid every
  // listing in a category sharing the same cover image.
  const byCategory = new Map<ListingCategory, DemoListing[]>();
  for (const l of demos) {
    const arr = byCategory.get(l.category) ?? [];
    arr.push(l);
    byCategory.set(l.category, arr);
  }

  let inserted = 0;
  let skipped = 0;
  let coverUpdated = 0;

  for (const [category, group] of byCategory) {
    if (!demoMediaMap[category]) {
      console.warn(`No demoMediaMap entry for category "${category}" — skipping.`);
      continue;
    }

    for (let i = 0; i < group.length; i++) {
      const listing = group[i];

      const { count, error: countErr } = await supabase
        .from("listing_photos")
        .select("id", { count: "exact", head: true })
        .eq("listing_id", listing.id);

      if (countErr) {
        console.error(`  count error for ${listing.id}:`, countErr.message);
        continue;
      }

      if ((count ?? 0) > 0) {
        skipped++;
        continue;
      }

      const urls = pickDemoPhotos(category, i, PHOTOS_PER_LISTING);
      const rows = urls.map((url, position) => ({
        listing_id: listing.id,
        storage_path: url, // external CDN — store URL in both fields
        url,
        alt_text: listing.title ?? `${category} photo ${position + 1}`,
        position,
        is_cover: position === 0,
      }));

      const { error: insertErr } = await supabase
        .from("listing_photos")
        .insert(rows);

      if (insertErr) {
        console.error(`  insert error for ${listing.id}:`, insertErr.message);
        continue;
      }
      inserted += rows.length;

      if (!listing.cover_photo_url || listing.cover_photo_url !== urls[0]) {
        const { error: updateErr } = await supabase
          .from("listings")
          .update({ cover_photo_url: urls[0] })
          .eq("id", listing.id);
        if (updateErr) {
          console.error(`  cover update error for ${listing.id}:`, updateErr.message);
        } else {
          coverUpdated++;
        }
      }
    }
  }

  console.log("");
  console.log("Backfill complete:");
  console.log(`  photos inserted: ${inserted}`);
  console.log(`  listings already had photos (skipped): ${skipped}`);
  console.log(`  cover_photo_url updates: ${coverUpdated}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
