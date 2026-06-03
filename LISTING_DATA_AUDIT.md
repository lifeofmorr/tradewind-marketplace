# Demo / Real Listing Data Audit — TradeWind (Phase 10)

**Date:** 2026-06-03

## Verdict: Demo inventory is correctly flagged, badged, disclaimed, and inquiry-blocked. PASS.

## Inventory
- **65 demo listings**: 50 marine/auto (`supabase/seed.sql`) + 15 aircraft (`supabase/aircraft_seed.sql`). All rows set `is_demo = true`; marine/auto descriptions begin `[DEMO LISTING]`; `condition='demo'`.
- Media metadata added (`20260521_demo_media_metadata.sql`): `image_source='unsplash'`, `image_license='unsplash-free'`, `is_demo_media=true`. `DEMO_INVENTORY_MEDIA_AUDIT.md` records 260 photos, all HTTP 200.

## Demo flag actually renders to users — verified
| Surface | Behavior | Evidence |
|---|---|---|
| Listing card | `Demo` TrustBadge | `ListingCard.tsx:52` |
| Listing detail | amber banner with canonical copy | `ListingDetail.tsx:112-122` |
| Inquiry form | **disabled** + demo message, links to live listings | `InquiryForm.tsx:71-80` |
| Trust Center | public "why you'll see Demo badges" section | `TrustCenter.tsx:123-138` |

## Aircraft accuracy
- Aircraft listings additionally render the aviation safety notice (`ListingDetail.tsx:184-202`).

## Findings
- No demo listing can receive a real inquiry (form hard-blocks on `is_demo`). ✅
- Schema has the `is_demo` column populated in seeds. ✅
- **Recommendation:** before "live business," confirm production DB either keeps demo inventory clearly badged alongside real listings, or filters demo out of primary browse once real inventory exists. Decide the policy explicitly (see `LIVE_DATA_POLICY.md`).

**Blockers:** none.
