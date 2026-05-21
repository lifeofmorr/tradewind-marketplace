// Demo photo URLs by listing category.
//
// Sourced from Unsplash's public CDN — stable, royalty-free under the Unsplash
// License, suitable for demo/development use without an API key. Each URL points
// directly at images.unsplash.com so it can be referenced from the database
// without re-uploading anything to Supabase Storage.
//
// Every photo here was hand-verified against its category — boat photos are
// actually boats, helicopter photos are actually helicopters, etc. Do not add
// IDs without first downloading the thumbnail and checking what it depicts.
//
// Used by scripts/backfill-demo-photos.ts and supabase/backfill-demo-photos.sql
// to populate listing_photos rows for is_demo = true listings.

import type { ListingCategory } from "@/types/database";

const UNSPLASH = "https://images.unsplash.com";
const PARAMS = "w=1200&q=80&auto=format&fit=crop";

const u = (id: string) => `${UNSPLASH}/${id}?${PARAMS}`;

export const demoMediaMap: Record<ListingCategory, string[]> = {
  // Luxury motor yachts and superyachts.
  yacht: [
    u("photo-1567899378494-47b22a2ae96a"),
    u("photo-1569263979104-865ab7cd8d13"),
    u("photo-1605281317010-fe5ffe798166"),
    u("photo-1528154291023-a6525fabe5b4"),
    u("photo-1604737637145-48cc31d160eb"),
    u("photo-1535024966840-e7424dc2635b"),
    u("photo-1559385301-0187cb6eff46"),
    u("photo-1585000962552-70f0a67223d9"),
  ],
  // Saltwater outboard center-console fishing boats.
  center_console: [
    u("photo-1674419404519-54fa8a774aa2"),
    u("photo-1611610394547-32c20719d266"),
    u("photo-1589704386820-b055d1b0daf0"),
    u("photo-1657689808834-88973a6bab9a"),
    u("photo-1685007823359-cedee642d04d"),
    u("photo-1617217652842-c2278360d9fd"),
  ],
  // Go-fast / offshore performance boats and powerboats.
  performance_boat: [
    u("photo-1615646194267-ecf4380ac001"),
    u("photo-1622082671151-2cbd184f9e60"),
    u("photo-1530478360694-903604e44961"),
    u("photo-1567369244263-8f45293b2178"),
    u("photo-1620326467418-14c39a82ebe3"),
    u("photo-1498528738175-10068e55f9a7"),
  ],
  // Generic boat bucket — sailboats, pontoons, runabouts, small cruisers.
  boat: [
    u("photo-1540946485063-a40da27545f8"),
    u("photo-1685007823359-cedee642d04d"),
    u("photo-1589704386820-b055d1b0daf0"),
    u("photo-1604737637145-48cc31d160eb"),
    u("photo-1535024966840-e7424dc2635b"),
  ],
  // Everyday sedans, SUVs, EVs.
  car: [
    u("photo-1502877338535-766e1452684a"),
    u("photo-1494976388531-d1058494cdd8"),
    u("photo-1547038577-da80abbc4f19"),
    u("photo-1580273916550-e323be2ae537"),
    u("photo-1601158935942-52255782d322"),
    u("photo-1609521263047-f8f205293f24"),
  ],
  // Pickup trucks and rugged 4x4s.
  truck: [
    u("photo-1551830820-330a71b99659"),
    u("photo-1559416523-140ddc3d238c"),
    u("photo-1601252300554-4ad551483bd2"),
    u("photo-1610647929723-a8922852cd44"),
    u("photo-1612057473117-3e16246121e6"),
    u("photo-1657920035552-809ed648bb37"),
    u("photo-1605893477799-b99e3b8b93fe"),
    u("photo-1605504835488-e8c6d37beb43"),
  ],
  // Supercars and high-performance autos.
  exotic: [
    u("photo-1544636331-e26879cd4d9b"),
    u("photo-1553440569-bcc63803a83d"),
    u("photo-1503376780353-7e6692767b70"),
    u("photo-1503736334956-4c8f8e92946d"),
    u("photo-1519245659620-e859806a8d3b"),
    u("photo-1530906358829-e84b2769270f"),
    u("photo-1611740801331-d8b5d6962822"),
    u("photo-1566024164372-0281f1133aa6"),
    u("photo-1617814086906-d847a8bc6fca"),
    u("photo-1604705528621-81b2755a320b"),
    u("photo-1514316454349-750a7fd3da3a"),
  ],
  // Vintage/muscle cars, restomods.
  classic: [
    u("photo-1584345604325-f5091269a0d1"),
    u("photo-1606942790567-5783bab8d944"),
    u("photo-1615238359019-c8de4242e083"),
    u("photo-1626190288283-5c66aa3ed9ea"),
    u("photo-1629649075111-a5a850107bad"),
    u("photo-1616019459068-4cc6dca4d3a1"),
    u("photo-1489824904134-891ab64532f1"),
    u("photo-1607535882326-e3bd656233b3"),
  ],
  // Motorcycles, PWCs, side-by-sides.
  powersports: [
    u("photo-1568772585407-9361f9bf3a87"),
    u("photo-1558981403-c5f9899a28bc"),
    u("photo-1558981852-426c6c22a060"),
  ],
  // Travel trailers and motorhomes.
  rv: [
    u("photo-1523987355523-c7b5b0dd90a7"),
  ],
  // Single-engine piston aircraft — Cessna 172/182, Cirrus, Diamond, Piper.
  aircraft_single_engine: [
    u("photo-1690944210909-9a97ba72a50b"),
    u("photo-1593938346024-7ee982d8224b"),
    u("photo-1592805145089-6066b407e342"),
    u("photo-1629233650020-aa014ed76f8d"),
    u("photo-1604285861770-54cb117a3f5a"),
    u("photo-1620473443431-91e48dbebe40"),
    u("photo-1638911810548-b113aee0d89f"),
    u("photo-1586063029643-fd87377743ef"),
    u("photo-1532200624530-cc3d3d0d636c"),
    u("photo-1527354372664-ae0112ab2c41"),
  ],
  // Twin-engine piston / cabin-class aircraft.
  aircraft_twin_engine: [
    u("photo-1522035612764-b0e4ba8915e1"),
    u("photo-1660968601185-e7414de388f4"),
  ],
  // Turboprops — King Air, PC-12, TBM.
  aircraft_turboprop: [
    u("photo-1522035612764-b0e4ba8915e1"),
    u("photo-1660968601185-e7414de388f4"),
  ],
  // Business / private jets.
  aircraft_jet: [
    u("photo-1474302770737-173ee21bab63"),
    u("photo-1540962351504-03099e0a754b"),
    u("photo-1619659085985-f51a00f0160a"),
    u("photo-1619652116813-98504fce82d2"),
    u("photo-1684838200815-36eef38f353c"),
    u("photo-1684838200888-192e2a163cc9"),
    u("photo-1616620418290-81a162f05e5d"),
    u("photo-1566212775038-532d06eda485"),
    u("photo-1625513123245-fcb02d69ad12"),
  ],
  // Helicopters.
  aircraft_helicopter: [
    u("photo-1607525884336-66ccfac7ab56"),
    u("photo-1495554698253-681539e9ea84"),
    u("photo-1512290472191-eb043dfa96e2"),
    u("photo-1576725386266-5c4b8c63da66"),
    u("photo-1629205163875-8f3d9a17e09e"),
    u("photo-1616899822079-5e40267ebbc4"),
    u("photo-1592569237690-69813b318567"),
    u("photo-1557818673-effec50525e1"),
  ],
  // Vintage / warbird aircraft.
  aircraft_vintage: [
    u("photo-1644095267897-39ca7730c094"),
    u("photo-1623294603586-db41835b29b6"),
    u("photo-1564404085635-c6616adb5ac7"),
    u("photo-1564404085675-51992c968514"),
    u("photo-1551520133-9e6d5eacaedb"),
    u("photo-1564404084712-34061bbf94c9"),
    u("photo-1619310274689-cf4973d8e096"),
    u("photo-1568554318257-8c930d8fcac0"),
    u("photo-1541316515424-047f8eca37d4"),
    u("photo-1623294865837-9902b6c97f2f"),
  ],
  // Very light jets — Phenom 100, Mustang, Eclipse.
  aircraft_very_light_jet: [
    u("photo-1619652116813-98504fce82d2"),
    u("photo-1619659085985-f51a00f0160a"),
    u("photo-1684838200888-192e2a163cc9"),
  ],
  // Experimental / kit-built piston aircraft.
  aircraft_experimental: [
    u("photo-1604285861770-54cb117a3f5a"),
    u("photo-1593938346024-7ee982d8224b"),
    u("photo-1620473443431-91e48dbebe40"),
    u("photo-1638911810548-b113aee0d89f"),
  ],
  // Float / amphibious aircraft (seaplanes).
  aircraft_amphibious: [
    u("photo-1550259979-ffa0383e2b5e"),
    u("photo-1550951428-ed00ffc028d5"),
    u("photo-1518972695-f4e8997efb0d"),
    u("photo-1512100356356-de1b84283e18"),
    u("photo-1665021657505-3a680c9cf4b3"),
    u("photo-1634158267270-f03b4c17c46f"),
    u("photo-1617868624816-93dddba14d9d"),
    u("photo-1597123377565-fa80c07fe6ea"),
  ],
  // Light-sport aircraft (LSA).
  aircraft_lsa: [
    u("photo-1604285861770-54cb117a3f5a"),
    u("photo-1592805145089-6066b407e342"),
    u("photo-1690944210909-9a97ba72a50b"),
  ],
  // Aircraft parts and components.
  aircraft_parts: [
    u("photo-1593938346024-7ee982d8224b"),
    u("photo-1620473443431-91e48dbebe40"),
    u("photo-1532200624530-cc3d3d0d636c"),
  ],
  // Aviation services / FBO / ramp ops.
  aviation_services: [
    u("photo-1684838200815-36eef38f353c"),
    u("photo-1619659085985-f51a00f0160a"),
    u("photo-1532200624530-cc3d3d0d636c"),
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
