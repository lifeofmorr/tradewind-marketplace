# TradeWind · Launch Checklist

A copy-pasteable, top-to-bottom guide to taking TradeWind from "code in
GitHub" to "first paying dealer." Tick boxes as you go.

**Already true** (from prior deploy session):
- [x] Repo: https://github.com/lifeofmorr/tradewind-marketplace
- [x] App live: https://fervent-proskuriakova-6f629e.vercel.app
- [x] Supabase project: https://supabase.com/dashboard/project/qwaotydaazymgnvnfuuj
- [x] Schema applied (3 migrations)
- [x] All 12 edge functions deployed
- [x] Vercel envs `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` set

What follows assumes you're starting from there.

---

## 0. One-time tooling

```bash
brew install gh supabase/tap/supabase
npm i -g vercel
```

Confirm:

```bash
gh auth status
vercel whoami
SUPABASE_ACCESS_TOKEN=<your-pat> npx -y supabase@latest projects list
```

---

## 1. Stripe (the ONLY thing keeping payments dark)

**1a. Create products + prices**

Open https://dashboard.stripe.com/test/products. Create 7 products. Mirror
[PRICING.md](./PRICING.md) exactly:

| Kind | Name | Type | Price |
| ---- | ---- | ---- | ----- |
| `featured_listing` | Featured listing (30d) | Payment | $49 |
| `boost_listing` | Boost listing (7d) | Payment | $19 |
| `dealer_starter` | Dealer · Starter | Subscription | $99/mo |
| `dealer_pro` | Dealer · Pro | Subscription | $249/mo |
| `dealer_premier` | Dealer · Premier | Subscription | $599/mo |
| `service_pro` | Service partner | Subscription | $79/mo |
| `concierge` | Concierge engagement | Payment | $499 |

Copy each `price_…` id.

**1b. Push the secret keys + price IDs to Supabase**

```bash
export SUPABASE_ACCESS_TOKEN=<your-pat>

npx -y supabase@latest secrets set --project-ref qwaotydaazymgnvnfuuj \
  STRIPE_SECRET_KEY=sk_test_... \
  STRIPE_PRICE_FEATURED_LISTING=price_... \
  STRIPE_PRICE_BOOST_LISTING=price_... \
  STRIPE_PRICE_DEALER_STARTER=price_... \
  STRIPE_PRICE_DEALER_PRO=price_... \
  STRIPE_PRICE_DEALER_PREMIER=price_... \
  STRIPE_PRICE_SERVICE_PROVIDER=price_... \
  STRIPE_PRICE_CONCIERGE=price_... \
  APP_URL=https://fervent-proskuriakova-6f629e.vercel.app
```

**1c. Create the Stripe webhook**

Stripe Dashboard → Developers → Webhooks → Add endpoint:

- URL: `https://qwaotydaazymgnvnfuuj.supabase.co/functions/v1/stripe-webhook`
- Events: `checkout.session.completed`,
  `customer.subscription.created`,
  `customer.subscription.updated`,
  `customer.subscription.deleted`,
  `charge.refunded`

Copy the signing secret (`whsec_...`).

```bash
npx -y supabase@latest secrets set --project-ref qwaotydaazymgnvnfuuj \
  STRIPE_WEBHOOK_SECRET=whsec_...
```

**1d. Push the matching `VITE_STRIPE_*` envs to Vercel**

```bash
for v in VITE_STRIPE_PUBLISHABLE_KEY VITE_STRIPE_PRICE_FEATURED_LISTING \
         VITE_STRIPE_PRICE_BOOST_LISTING VITE_STRIPE_PRICE_DEALER_STARTER \
         VITE_STRIPE_PRICE_DEALER_PRO VITE_STRIPE_PRICE_DEALER_PREMIER \
         VITE_STRIPE_PRICE_SERVICE_PROVIDER VITE_STRIPE_PRICE_CONCIERGE; do
  vercel env add "$v" production    # paste each value when prompted
done
vercel --prod --yes                  # rebuild
```

- [ ] Stripe products created
- [ ] Webhook endpoint created
- [ ] Supabase secrets set
- [ ] Vercel envs set + redeployed

---

## 2. AI + email keys

```bash
npx -y supabase@latest secrets set --project-ref qwaotydaazymgnvnfuuj \
  ANTHROPIC_API_KEY=sk-ant-... \
  OPENAI_API_KEY=sk-... \
  RESEND_API_KEY=re_... \
  RESEND_FROM='TradeWind <hello@gotradewind.com>'
```

For Resend, you also need to verify the sending domain (`gotradewind.com`)
in the Resend dashboard — they'll give you DKIM/SPF records to add to your
DNS. Until that's done, send-from defaults to a Resend test address.

- [ ] Anthropic key set
- [ ] OpenAI key set (fallback)
- [ ] Resend key set
- [ ] Resend domain verified

---

## 3. Database webhook for fraud-screening

Supabase Dashboard → Database → Webhooks → Create a new webhook:

- Name: `inquiry-fraud-check`
- Table: `public.inquiries`
- Events: `INSERT`
- Method: `POST`
- URL: `https://qwaotydaazymgnvnfuuj.supabase.co/functions/v1/inquiry-fraud-check`
- HTTP headers:
  - `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`
  - `Content-Type: application/json`

Get the service-role key from Settings → API → "service_role".

- [ ] DB webhook created and live

---

## 4. pg_cron schedule for auction finalization

Supabase Dashboard → SQL Editor:

```sql
-- enable extensions if not already on
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- schedule auction-end every 5 minutes
select cron.schedule('auction-end', '*/5 * * * *', $$
  select net.http_post(
    url := 'https://qwaotydaazymgnvnfuuj.supabase.co/functions/v1/auction-end',
    headers := jsonb_build_object('Authorization', 'Bearer <SERVICE_ROLE_KEY>')
  )
$$);

-- verify
select * from cron.job;
```

- [ ] pg_cron + pg_net extensions enabled
- [ ] Job scheduled

---

## 5. Auth config

Supabase Dashboard → Authentication → Providers:

- [ ] Email provider enabled (default)
- [ ] "Confirm email" disabled for test, or enabled with a real SMTP/Resend
      sender — the Supabase default sender works but is flagged by some
      email providers.

Authentication → URL Configuration:

- [ ] Site URL: `https://fervent-proskuriakova-6f629e.vercel.app` (or your
      custom domain)
- [ ] Redirect URLs allow-list includes the same.

---

## 6. Custom domain (optional but recommended)

Vercel Dashboard → Project → Domains → Add `gotradewind.com`. Copy the
DNS records to your registrar.

Then update `APP_URL` in Supabase secrets:

```bash
npx -y supabase@latest secrets set --project-ref qwaotydaazymgnvnfuuj \
  APP_URL=https://gotradewind.com
```

And add it to Supabase Auth's allowed redirect URLs.

- [ ] Domain DNS pointed
- [ ] Vercel SSL provisioned
- [ ] APP_URL secret updated
- [ ] Auth redirect allow-list updated

---

## 7. Promote yourself to admin

Sign up at the live URL with your real email as **role = buyer**, then in
the Supabase SQL Editor:

```sql
update profiles set role = 'admin' where email = 'YOU@example.com';
```

Sign out, sign back in. You'll land on `/admin`.

- [ ] Personal admin account live

---

## 8. Storage bucket sanity

The schema creates 6 buckets, but verify in the dashboard:

Supabase Dashboard → Storage. You should see:

- `listings-photos` (public)
- `listings-videos` (public)
- `avatars` (public)
- `dealer-assets` (public)
- `service-provider-assets` (public)
- `documents` (private)

If any are missing, the schema's `insert into storage.buckets` block didn't
fire — re-run that block from `supabase/migrations/20260101000000_initial.sql`.

- [ ] All 6 buckets present
- [ ] First 5 are public, `documents` is private

---

## 9. Live testing checklist

Walk through each flow with a real browser, test card `4242 4242 4242 4242`.

### Buyer flow

- [ ] Sign up as buyer → email confirmation if enabled → land on `/buyer`
- [ ] Browse `/categories/center_console` — listings appear
- [ ] Open any listing → photos render → "Save" works
- [ ] Submit an inquiry → seller receives email (after Resend domain verified)
- [ ] DB webhook auto-screens for fraud, scores the inquiry
- [ ] Send a message via "Message seller" → real-time delivery
- [ ] Place a bid on a live auction → real-time update on auction page
- [ ] Submit a financing request → email confirmation
- [ ] Submit a concierge request → triggers Stripe checkout for $499 → confirm

### Seller flow

- [ ] Sign up as seller → land on `/seller`
- [ ] Create listing → upload 3 photos → submit for review
- [ ] Admin approves it → seller receives "Your listing is live" email
- [ ] Listing appears at `/listings/<slug>`

### Dealer flow

- [ ] Sign up as dealer → forced into `/onboarding/dealer`
- [ ] Fill dealer info → dealers row + dealer_staff(owner) created
- [ ] Land on `/dealer` — see the dealer dashboard
- [ ] Subscribe to Dealer Pro via `/pricing` → Stripe Checkout → webhook
      flips dealer.subscription_tier + dealer.subscription_status
- [ ] Create dealer-owned listing → publishes via admin → appears on
      `/dealers/<slug>`

### Service provider flow

- [ ] Sign up as service_provider → forced into `/onboarding/service-provider`
- [ ] Fill details → service_providers row created → land on `/service`
- [ ] Subscribe to Service Pro → webhook flips status
- [ ] Profile is reachable at `/services/<slug>`

### Admin flow

- [ ] Approve a pending listing → seller email fires
- [ ] Resolve a fraud flag → notes save → status flips to resolved
- [ ] Refund a payment in Stripe → webhook fires → payments row updates
- [ ] Publish a blog post via `/admin/blog`
- [ ] Publish a market report via `/admin/market-reports`
- [ ] Cancel an auction via `/admin/auctions`

### Auctions

- [ ] As seller, create an auction starting in 1 minute, ending in 1 hour
- [ ] As another browser/buyer, place a bid
- [ ] Verify real-time updates on both sides
- [ ] Verify pg_cron's `auction-end` finalizes the auction at end_time
- [ ] Winner gets notification + email

### Reviews

- [ ] As buyer, leave a 5-star review on a dealer
- [ ] Dealer's `rating_avg` and `rating_count` recompute live
- [ ] Owner notified

### SEO

- [ ] `/sitemap.xml` returns valid XML (verify with `curl -i`)
- [ ] `/boats-for-sale-in-florida` renders with breadcrumb JSON-LD
- [ ] `/porsche-for-sale` renders
- [ ] `/center_console-in-miami` renders

---

## 10. Operational hygiene

- [ ] Set up Resend webhook (bounces, complaints) → keep your sender
      reputation clean
- [ ] Add Sentry (or equivalent) for client-side errors. The free tier
      covers this stage.
- [ ] Set up a UptimeRobot ping on the homepage + `/sitemap.xml`
- [ ] Set up Stripe Radar rules — block obvious card-testing attempts
- [ ] Daily Supabase backup is on by default (free tier: 7 days).
      Verify in Database → Backups.

---

## 11. First 100 listings plan

Cold marketplaces are dead marketplaces. The site needs ~100 listings
before any buyer treats it as real. Two paths run in parallel:

### Path A — your network (week 1)
- Personally onboard 5 dealers you already know. Offer first 6 months free.
- For each dealer, white-glove import their inventory: ask for a CSV/PDF
  of current stock, write the listings yourself with the AI generator.
- Target: 5 dealers × ~10 listings = 50 listings.

### Path B — high-quality private sellers (week 2)
- Scrape 50 craigslist/Facebook listings in 2-3 metros (Florida, Arizona,
  North Carolina). Reach out to each owner with the script in
  CUSTOMER_ACQUISITION_PLAYBOOK.md.
- Offer to handle listing creation for free. Use the AI generator.
- Convert ~20% — that's your remaining 50 listings.

### KPIs to watch (week 1-4)
- Active listings count (target: 100 by week 2)
- Inquiry-to-listing ratio (healthy: 0.8+ in month one)
- Buyer signups (target: 50/week organic from SEO + outreach)
- Time-to-first-message (target: < 48h)

---

## 12. Day-1 admin tasks

Right after going live:

- [ ] Run a test transaction end-to-end (Featured listing $49)
- [ ] Verify the receipt email lands in your inbox
- [ ] Plant 5 seed reviews on your top 5 partner dealers
- [ ] Plant 1 blog post + 1 market report
- [ ] Add 10 truly featured listings (set is_featured=true manually for
      visual density on the homepage)
- [ ] Pin /sitemap.xml to Google Search Console → submit for indexing
- [ ] Pin to Bing Webmaster Tools too — boomers actually use Bing

---

## 13. Smoke tests in CI (TODO)

These don't exist yet, but a Phase 4 follow-up should add:

- [ ] Playwright tests covering signup → list → save → message → checkout
- [ ] Vitest unit tests for the AI lib + utils
- [ ] GitHub Actions: typecheck + build on every PR

For launch, manual smoke testing per Section 9 is enough.
