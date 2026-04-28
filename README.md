# TradeWind
The AI-powered marketplace for boats, autos, dealers, and serious buyers.

> Phase 0 scaffold complete. Phase 1 fleshes out auth, listings, dashboards, AI, and Stripe.

## Quickstart
1. Clone and install
   ```bash
   git clone <repo> tradewind-marketplace
   cd tradewind-marketplace
   npm install
   ```

2. Env
   ```bash
   cp .env.local.example .env.local
   ```

3. Run
   ```bash
   npm run dev          # http://localhost:5173
   ```

Full quickstart (Supabase, edge functions, Stripe, secrets) is finalized in Phase 1O.

## Creating an admin user
Admin signup is intentionally NOT exposed in the UI. To make yourself an admin:
1. Sign up normally as a buyer (or any role) at `/signup`.
2. Open Supabase → SQL editor → run:
   ```sql
   update profiles set role = 'admin' where email = 'YOUR_EMAIL';
   ```
3. Sign out and sign back in. You'll land on `/admin`.

## Roles
- `buyer` · `seller` · `dealer` · `dealer_staff` · `service_provider` · `admin`

## Phase plan
- **Phase 0** — scaffold (this commit): config, base lib, brand single-source, placeholder route.
- **Phase 1** — MVP: auth + onboarding (dealer/service_provider), listings + photos, dashboards, admin approval, Stripe featured + dealer + service + concierge payments, AI listing generator, request inboxes, public dealer + service-provider profiles.
- **Phase 2** — fraud-check live, programmatic SEO, transactional email, photo enhancer.
- **Phase 3** — auctions, in-app messaging, reviews, market reports, mobile.

## License
Proprietary. © TradeWind 2026.
