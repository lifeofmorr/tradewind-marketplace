-- TradeWind full-completion migration:
-- transactions, partner quote requests, asset verifications,
-- dealer widgets, dealer import logs, listings.video_url.

-- ─── Transactions ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  buyer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'inquiry'
    CHECK (status IN ('inquiry','offer','inspection','financing','insurance','transport','closing','completed','cancelled')),
  offer_amount_cents int,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS transactions_buyer_idx ON public.transactions (buyer_id);
CREATE INDEX IF NOT EXISTS transactions_seller_idx ON public.transactions (seller_id);
CREATE INDEX IF NOT EXISTS transactions_listing_idx ON public.transactions (listing_id);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view" ON public.transactions;
CREATE POLICY "Participants can view" ON public.transactions
  FOR SELECT USING (auth.uid() IN (buyer_id, seller_id));

DROP POLICY IF EXISTS "Buyers can create" ON public.transactions;
CREATE POLICY "Buyers can create" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Participants can update" ON public.transactions;
CREATE POLICY "Participants can update" ON public.transactions
  FOR UPDATE USING (auth.uid() IN (buyer_id, seller_id));

DROP POLICY IF EXISTS "Admins manage all transactions" ON public.transactions;
CREATE POLICY "Admins manage all transactions" ON public.transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── Partner quote requests ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.partner_quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  partner_type text NOT NULL
    CHECK (partner_type IN ('lender','insurance','transport','inspector','escrow','title_verification')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','sent','quoted','accepted','declined','expired')),
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS partner_quote_requests_user_idx ON public.partner_quote_requests (user_id);
CREATE INDEX IF NOT EXISTS partner_quote_requests_listing_idx ON public.partner_quote_requests (listing_id);

ALTER TABLE public.partner_quote_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Own quote requests" ON public.partner_quote_requests;
CREATE POLICY "Own quote requests" ON public.partner_quote_requests
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins see all quote requests" ON public.partner_quote_requests;
CREATE POLICY "Admins see all quote requests" ON public.partner_quote_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── Asset verifications ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.asset_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  verification_type text NOT NULL
    CHECK (verification_type IN ('vin','hin','title','registration','lien','inspection')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','in_progress','verified','failed','expired')),
  provider text,
  result jsonb DEFAULT '{}'::jsonb,
  requested_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS asset_verifications_listing_idx ON public.asset_verifications (listing_id);

ALTER TABLE public.asset_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Verifications public read" ON public.asset_verifications;
CREATE POLICY "Verifications public read" ON public.asset_verifications
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Verifications auth create" ON public.asset_verifications;
CREATE POLICY "Verifications auth create" ON public.asset_verifications
  FOR INSERT WITH CHECK (auth.uid() = requested_by);

DROP POLICY IF EXISTS "Verifications admin manage" ON public.asset_verifications;
CREATE POLICY "Verifications admin manage" ON public.asset_verifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── Dealer widgets ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dealer_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  widget_type text NOT NULL
    CHECK (widget_type IN ('inventory','lead_capture','finance_request')),
  config jsonb DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS dealer_widgets_dealer_idx ON public.dealer_widgets (dealer_id);

ALTER TABLE public.dealer_widgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dealer owns widgets" ON public.dealer_widgets;
CREATE POLICY "Dealer owns widgets" ON public.dealer_widgets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.dealers WHERE id = dealer_id AND owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admin manage widgets" ON public.dealer_widgets;
CREATE POLICY "Admin manage widgets" ON public.dealer_widgets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── Dealer import logs ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.import_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  filename text NOT NULL,
  total_rows int NOT NULL DEFAULT 0,
  imported int NOT NULL DEFAULT 0,
  skipped int NOT NULL DEFAULT 0,
  errors int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing','completed','failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS import_logs_dealer_idx ON public.import_logs (dealer_id);

ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dealer owns import logs" ON public.import_logs;
CREATE POLICY "Dealer owns import logs" ON public.import_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.dealers WHERE id = dealer_id AND owner_id = auth.uid())
  );

-- ─── listings.video_url (single canonical video link) ───────────────────────
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS video_url text;
