-- Tighten asset_verifications RLS.
-- The original "Verifications public read" policy used `USING (true)`, which
-- exposed every verification row to any authenticated request. Verifications
-- can reference seller-side documents (title research, escrow status) that
-- should not be world-readable.
--
-- New policy: a verification row is visible if the linked listing is active
-- (so buyers can see passport status on listings they're browsing), OR the
-- caller is the listing's seller/dealer, OR the caller is an admin.

DROP POLICY IF EXISTS "Verifications public read" ON public.asset_verifications;

CREATE POLICY "Verifications visibility" ON public.asset_verifications
  FOR SELECT USING (
    -- Anyone can see verifications on a publicly-active listing
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = asset_verifications.listing_id
        AND l.status = 'active'
    )
    -- Seller / dealer staff can see verifications on their own listings
    OR EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = asset_verifications.listing_id
        AND l.seller_id = auth.uid()
    )
    -- The requester themselves can always see what they requested
    OR requested_by = auth.uid()
    -- Admins see everything
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
