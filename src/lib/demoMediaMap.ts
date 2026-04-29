// Demo photo URLs by listing category.
//
// Sourced from Unsplash's public CDN — stable, royalty-free under the Unsplash
// License, suitable for demo/development use without an API key. Each URL points
// directly at images.unsplash.com so it can be referenced from the database
// without re-uploading anything to Supabase Storage.
//
// Used by scripts/backfill-demo-photos.ts and supabase/backfill-demo-photos.sql
// to populate listing_photos rows for is_demo = true listings.

import type { ListingCategory } from "@/types/database";

const UNSPLASH = "https://images.unsplash.com";
const PARAMS = "w=800&q=80&auto=format&fit=crop";

const u = (id: string) => `${UNSPLASH}/${id}?${PARAMS}`;

export const demoMediaMap: Record<ListingCategory, string[]> = {
  yacht: [
    u("photo-1567899378494-47b22a2ae96a"),
    u("photo-1540946485063-a40da27545f8"),
    u("photo-1569263979104-865ab7cd8d13"),
    u("photo-1544551763-46a013bb70d5"),
    u("photo-1605281317010-fe5ffe798166"),
  ],
  center_console: [
    u("photo-1544551763-77ef2d0cfc6c"),
    u("photo-1559494007-9f5847c49d94"),
    u("photo-1590523277543-a94d2e4eb00b"),
    u("photo-1502209524164-acea936639a2"),
    u("photo-1544551763-77ef2d0cfc6c"),
  ],
  performance_boat: [
    u("photo-1510707577719-ae7c14805e3a"),
    u("photo-1501761095094-94d36f57edbb"),
    u("photo-1562281302-809108fd533c"),
    u("photo-1544551763-46a013bb70d5"),
    u("photo-1605281317010-fe5ffe798166"),
  ],
  boat: [
    u("photo-1469854523086-cc02fe5d8800"),
    u("photo-1507525428034-b723cf961d3e"),
    u("photo-1540946485063-a40da27545f8"),
    u("photo-1569317002804-ab77bcf1bce4"),
    u("photo-1559494007-9f5847c49d94"),
  ],
  car: [
    u("photo-1494976388531-d1058494cdd8"),
    u("photo-1502877338535-766e1452684a"),
    u("photo-1494976388531-d1058494cdd8"),
    u("photo-1502877338535-766e1452684a"),
    u("photo-1503376780353-7e6692767b70"),
  ],
  truck: [
    u("photo-1559416523-140ddc3d238c"),
    u("photo-1580273916550-e323be2ae537"),
    u("photo-1609521263047-f8f205293f24"),
    u("photo-1494976388531-d1058494cdd8"),
    u("photo-1547038577-da80abbc4f19"),
  ],
  exotic: [
    u("photo-1544636331-e26879cd4d9b"),
    u("photo-1503376780353-7e6692767b70"),
    u("photo-1553440569-bcc63803a83d"),
    u("photo-1502877338535-766e1452684a"),
    u("photo-1544636331-e26879cd4d9b"),
  ],
  classic: [
    u("photo-1489824904134-891ab64532f1"),
    u("photo-1552519507-da3b142c6e3d"),
    u("photo-1514316454349-750a7fd3da3a"),
    u("photo-1504215680853-026ed2a45def"),
    u("photo-1494976388531-d1058494cdd8"),
  ],
  powersports: [
    u("photo-1558981403-c5f9899a28bc"),
    u("photo-1568772585407-9361f9bf3a87"),
    u("photo-1558981852-426c6c22a060"),
  ],
  rv: [
    u("photo-1523987355523-c7b5b0dd90a7"),
    u("photo-1533873984035-25970ab07461"),
    u("photo-1601158935942-52255782d322"),
  ],
  aircraft_single_engine: [
    u("photo-1540962351504-03099e0a754b"),
    u("photo-1542296332-2e4473faf563"),
    u("photo-1522199755839-a2bacb67c546"),
    u("photo-1499063078284-f78f7d89616a"),
    u("photo-1505764706515-aa95265c5abc"),
  ],
  aircraft_twin_engine: [
    u("photo-1531642765602-5cae8bbbf285"),
    u("photo-1546069901-d5bfd2cbfb1f"),
    u("photo-1517849845537-4d257902454a"),
    u("photo-1593618998160-e34014e67546"),
    u("photo-1581262208435-41726149a759"),
  ],
  aircraft_turboprop: [
    u("photo-1474302770737-173ee21bab63"),
    u("photo-1542296332-2e4473faf563"),
    u("photo-1522199755839-a2bacb67c546"),
    u("photo-1505764706515-aa95265c5abc"),
    u("photo-1517400508447-f8dd518b86db"),
  ],
  aircraft_jet: [
    u("photo-1474302770737-173ee21bab63"),
    u("photo-1517400508447-f8dd518b86db"),
    u("photo-1515378791036-0648a3ef77b2"),
    u("photo-1521587760476-6c12a4b040da"),
    u("photo-1584433144859-1fc3ab64a957"),
  ],
  aircraft_helicopter: [
    u("photo-1556388158-158ea5ccacbd"),
    u("photo-1542296332-2e4473faf563"),
    u("photo-1505764706515-aa95265c5abc"),
    u("photo-1517849845537-4d257902454a"),
    u("photo-1499063078284-f78f7d89616a"),
  ],
  aircraft_vintage: [
    u("photo-1559128010-7c1ad6e1b6a5"),
    u("photo-1531642765602-5cae8bbbf285"),
    u("photo-1546069901-d5bfd2cbfb1f"),
    u("photo-1521587760476-6c12a4b040da"),
    u("photo-1517849845537-4d257902454a"),
  ],
};

/**
 * Picks N image URLs for a listing, rotating through the category bucket so
 * that listings in the same category don't all share the same cover photo.
 *
 * @param category - listing category
 * @param offset - listing's position within its category (0-based) used to rotate
 * @param count - how many photos to return (default 4)
 */
export function pickDemoPhotos(
  category: ListingCategory,
  offset: number,
  count = 4,
): string[] {
  const bucket = demoMediaMap[category] ?? demoMediaMap.boat;
  const out: string[] = [];
  for (let i = 0; i < Math.min(count, bucket.length); i++) {
    out.push(bucket[(offset + i) % bucket.length]);
  }
  return out;
}
