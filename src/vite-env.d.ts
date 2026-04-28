/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_STRIPE_PRICE_FEATURED_LISTING: string;
  readonly VITE_STRIPE_PRICE_BOOST_LISTING: string;
  readonly VITE_STRIPE_PRICE_DEALER_STARTER: string;
  readonly VITE_STRIPE_PRICE_DEALER_PRO: string;
  readonly VITE_STRIPE_PRICE_DEALER_PREMIER: string;
  readonly VITE_STRIPE_PRICE_SERVICE_PROVIDER: string;
  readonly VITE_STRIPE_PRICE_CONCIERGE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
