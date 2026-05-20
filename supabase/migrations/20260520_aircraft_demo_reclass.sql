-- ============================================================================
-- TradeWind · Reclass Icon A5 demo listing to amphibious/LSA
-- ============================================================================
-- The Icon A5 is an amphibious LSA, not a generic single-engine piston.
-- Spec target distribution: 4 single, 3 twin, 3 turboprop, 2 jet/VLJ, 1 heli,
-- 1 vintage, 1 amphibious/LSA = 15 listings.
--
-- Idempotent: safe to re-run.
-- ============================================================================

update public.listings
   set category = 'aircraft_amphibious'::public.listing_category
 where slug = '2021-icon-a5'
   and category = 'aircraft_single_engine'::public.listing_category;
