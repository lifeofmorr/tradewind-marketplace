# TradeWind

The AI-powered marketplace for boats, autos, dealers, and serious buyers.

> Phase 0–3 complete and **live**:
> - **App**: https://fervent-proskuriakova-6f629e.vercel.app
> - **Supabase project**: https://supabase.com/dashboard/project/qwaotydaazymgnvnfuuj
> - **Repo**: https://github.com/lifeofmorr/tradewind-marketplace
>
> Stripe + AI keys are still placeholders — see [DEPLOY.md](./DEPLOY.md)
> for what's left.

---

## Stack (locked)

- React 18 · Vite · TypeScript (strict) · Tailwind CSS · shadcn/ui · lucide-react
- react-router-dom v6 · @tanstack/react-query · react-hook-form + zod
- Supabase (Auth · Postgres + RLS · Storage · Edge Functions)
- Stripe Checkout + webhook
- Anthropic Claude (`claude-sonnet-4-6`) with OpenAI fallback
- Path alias `@/* → ./src/*`

---

## Quickstart (local)

```bash
npm install
cp .env.local.example .env.local   # fill in Supabase + Stripe keys
npm run dev                        # http://localhost:5173
```

`bash setup.sh` does the same plus optional GitHub repo creation.

### Backend setup

1. **Create a Supabase project** → https://supabase.com/dashboard/projects.
   Region: closest to you. Keep Anon and service-role keys handy.

2. **Apply the schema** (Phase 1A):
   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/schema.sql
   ```
   or via the Supabase CLI:
   ```bash
   supabase db push --include-all
   ```

3. **Phase 3 schema** (auctions, messaging, reviews):
   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/migrations/phase3.sql
   ```

4. **Optional seed data**:
   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/seed.sql
   ```

4. **Storage buckets** are created by `schema.sql`:
   `listings-photos`, `listings-videos`, `avatars`,
   `dealer-assets`, `service-provider-assets`, `documents` (private).

5. **Stripe products** — see [`PRICING.md`](./PRICING.md). Create the 7 prices,
   drop `price_…` ids into both `.env.local` and `supabase secrets set`.

6. **Edge functions** — deploy from `supabase/functions/`:
   ```bash
   # Phase 1
   supabase functions deploy ai-listing-generator
   supabase functions deploy ai-buyer-assistant
   supabase functions deploy ai-fraud-check
   supabase functions deploy ai-pricing-estimate
   supabase functions deploy ai-concierge-intake
   supabase functions deploy stripe-checkout
   supabase functions deploy stripe-webhook --no-verify-jwt

   # Phase 2
   supabase functions deploy inquiry-fraud-check --no-verify-jwt
   supabase functions deploy send-email
   supabase functions deploy photo-enhance
   supabase functions deploy sitemap --no-verify-jwt

   # Phase 3
   supabase functions deploy auction-end
   ```

   For `auction-end`, schedule with pg_cron every 5 minutes:
   ```sql
   select cron.schedule('auction-end', '*/5 * * * *', $$
     select net.http_post(
       url := 'https://YOUR-PROJECT.supabase.co/functions/v1/auction-end',
       headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'))
     )
   $$);
   ```

   Required secrets:
   ```bash
   supabase secrets set \
     ANTHROPIC_API_KEY=sk-ant-... \
     OPENAI_API_KEY=sk-... \
     RESEND_API_KEY=re_... \
     RESEND_FROM='TradeWind <hello@gotradewind.com>' \
     STRIPE_SECRET_KEY=sk_test_... \
     STRIPE_WEBHOOK_SECRET=whsec_... \
     STRIPE_PRICE_FEATURED_LISTING=price_... \
     STRIPE_PRICE_BOOST_LISTING=price_... \
     STRIPE_PRICE_DEALER_STARTER=price_... \
     STRIPE_PRICE_DEALER_PRO=price_... \
     STRIPE_PRICE_DEALER_PREMIER=price_... \
     STRIPE_PRICE_SERVICE_PROVIDER=price_... \
     STRIPE_PRICE_CONCIERGE=price_... \
     APP_URL=https://gotradewind.com
   ```

7. **Stripe webhook endpoint** in the Stripe Dashboard:
   `https://YOUR-PROJECT.supabase.co/functions/v1/stripe-webhook`

8. **Database webhook for fraud-check** (Phase 2A) — Dashboard → Database → Webhooks:
   - Name: `inquiry-fraud-check`
   - Table: `public.inquiries`, Events: `INSERT`
   - HTTP method: `POST`
   - URL: `https://YOUR-PROJECT.supabase.co/functions/v1/inquiry-fraud-check`
   - Headers: `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`

9. **Sitemap rewrite** (Phase 2C) — proxy `/sitemap.xml` to the sitemap edge function.
   Add to `vercel.json`:
   ```json
   {
     "rewrites": [
       { "source": "/sitemap.xml", "destination": "https://YOUR-PROJECT.supabase.co/functions/v1/sitemap" }
     ]
   }
   ```

### Frontend deploy (Vercel)

```bash
vercel link
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
# …all VITE_STRIPE_PRICE_* etc.
vercel deploy --prod
```

`vercel.json` is not needed; Vite output is auto-detected.

---

## Roles

`buyer · seller · dealer · dealer_staff · service_provider · admin`

Signup form exposes `buyer / seller / dealer / service_provider`.
**`admin` is intentionally not selectable** — promote yourself in SQL after signup:

```sql
update profiles set role = 'admin' where email = 'YOU@example.com';
```

`handle_new_user()` also demotes any `admin` value passed via `raw_user_meta_data` at signup.

---

## Routes

| Surface  | Notable paths |
| -------- | ------------- |
| Public   | `/`, `/browse`, `/categories`, `/categories/:c`, `/listings/:slug`, `/dealers`, `/dealers/:slug`, `/services`, `/services/:slug`, `/concierge`, `/financing`, `/insurance`, `/inspections`, `/transport`, `/blog`, `/market-reports`, `/pricing`, `/about`, `/contact`, `/terms`, `/privacy`, `/trust`, `/auctions`, `/sell`, `/sell-my-boat`, `/sell-my-car`, `/checkout/success`, `/checkout/cancel` |
| Auth     | `/login`, `/signup` |
| Onboard  | `/onboarding/dealer`, `/onboarding/service-provider` |
| Buyer    | `/buyer`, `/buyer/saved`, `/buyer/requests` |
| Seller   | `/seller`, `/seller/listings`, `/seller/listings/new`, `/seller/listings/:id`, `/seller/inquiries` |
| Dealer   | `/dealer`, `/dealer/inventory`, `/dealer/leads`, `/dealer/analytics`, `/dealer/profile` |
| Service  | `/service`, `/service/leads`, `/service/profile` |
| Admin    | `/admin`, `/admin/listings`, `/admin/users`, `/admin/requests`, `/admin/fraud`, `/admin/payments`, `/admin/content` |

---

## Phase plan

- **Phase 0** — scaffold (config, brand, lib, types).
- **Phase 1** — MVP: auth + onboarding, listings, dashboards, admin moderation,
  Stripe one-offs + subscriptions, AI workflow stubs, partner request inboxes,
  vetted dealer + service-provider profiles.
- **Phase 2** (this commit) — fraud-check live in production loop, programmatic SEO
  routes (`/boats-for-sale-in-:state`, `/:brand-for-sale`, `/:category-in-:city`),
  XML sitemap edge function + robots.txt, transactional email via Resend,
  AI photo-enhancer stub, full admin payments table, code-split dashboards.
- **Phase 3** (this commit) — auctions (`auctions` + `bids` tables, real-time
  bid updates, seller + admin management, scheduled auction-end edge function),
  in-app messaging (`conversations` + `messages` with realtime subscriptions
  + unread badges in header and sidebar), reviews (1–5 stars on dealers + service
  providers with auto-recalculated rating aggregates), full blog + market
  report surfaces (detail pages + admin CRUD with markdown rendering),
  notification bell in header. Schema lives in `supabase/migrations/phase3.sql`
  (additive, idempotent, includes `alter publication supabase_realtime` for
  realtime enrolment).
- **Phase 4** — production deployment polish + native mobile (Expo).

---

## License

Proprietary. © TradeWind 2026.
