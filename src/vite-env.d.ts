/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_STRIPE_MODE: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_STRIPE_PRICE_FEATURED_LISTING: string;
  readonly VITE_STRIPE_PRICE_BOOST_LISTING: string;
  readonly VITE_STRIPE_PRICE_DEALER_STARTER: string;
  readonly VITE_STRIPE_PRICE_DEALER_PRO: string;
  readonly VITE_STRIPE_PRICE_DEALER_PREMIER: string;
  readonly VITE_STRIPE_PRICE_SERVICE_PROVIDER: string;
  readonly VITE_STRIPE_PRICE_CONCIERGE: string;
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_ENV_NAME: string;
  readonly VITE_BUSINESS_MAILING_ADDRESS: string;
  readonly VITE_BUSINESS_NAME: string;
  readonly VITE_BUSINESS_SUPPORT_EMAIL: string;
  readonly VITE_FEEDBACK_CALL_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
