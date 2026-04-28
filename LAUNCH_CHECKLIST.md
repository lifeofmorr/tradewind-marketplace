# TradeWind · Launch Checklist

> Phase 0–3 code is complete. Build is green (typecheck + `vite build` pass).
> This file is the runbook for going from "code in repo" to "live, accepting
> real customers." Do these in order. Anything marked **MANUAL** can only be
> done by a human with the relevant account access.

Project facts (from `DEPLOY.md`):
- Repo: https://github.com/lifeofmorr/tradewind-marketplace (`main`)
- Vercel app: https://fervent-proskuriakova-6f629e.vercel.app
- Supabase project ref: `qwaotydaazymgnvnfuuj` (us-east-1)
- Custom domain target: `gotradewind.com`

---

## 0. Audit summary (already verified)

- `npm run typecheck` ✓
- `npm run build` ✓ (one warning: main bundle is 776 kB / 217 kB gz —
  acceptable for launch, optimize post-launch via `manualChunks`).
- No `service_role` / `SERVICE_ROLE` references in `src/` (frontend is anon-key only).
- 28 tables with `enable row level security` across `schema.sql` + `phase3.sql`.
- 48 `storage.objects` policy references covering all 6 buckets.
- 13 edge functions present (`stripe-checkout`, `stripe-webhook`,
  `ai-listing-generator`, `ai-buyer-assistant`, `ai-fraud-check`,
  `ai-pricing-estimate`, `ai-concierge-intake`, `auction-end`,
  `inquiry-fraud-check`, `photo-enhance`, `send-email`, `sitemap`,
  plus `_shared/`).
- App.tsx routes: every lazy import resolves to a real page file. All 6
  role surfaces (buyer, seller, dealer, dealer_staff, service_provider,
  admin) have dashboards behind `ProtectedRoute` + `OnboardingGuard`.

Known gaps — none that block launch. Potential follow-ups:
- Bundle splitting (above).
- `npm audit` reports 4 vulns (2 mod, 2 high) in transitive deps.
  Run `npm audit fix` post-launch; none are exploitable from anon keys.
- Brand domain in `src/lib/brand.ts` is `gotradewind.com` — make sure
  Vercel custom domain matches before sending marketing.

---

## 1. Supabase setup — **MANUAL**

> Most of this is already done on project `qwaotydaazymgnvnfuuj`. Re-do only
> if you're spinning up a new environment.

### 1a. Create project
1. https://supabase.com/dashboard/projects → **New project**
2. Name: `tradewind-marketplace` · Region: `us-east-1` · DB password: save in 1Password
3. Copy **Project URL**, **anon public key**, **service_role key** (never commit)

### 1b. Apply schema + migrations
```bash
export SUPABASE_ACCESS_TOKEN=<your-supabase-pat>
npx supabase link --project-ref qwaotydaazymgnvnfuuj
npx supabase db push --include-all
```
This applies, in order:
- `supabase/migrations/20260101000000_initial.sql` (23 tables, RLS, 6 buckets, storage policies)
- `supabase/migrations/20260101000100_phase3.sql` (auctions, bids, conversations, messages, reviews)
- `supabase/migrations/20260101000200_seed.sql` (sample dealers + listings; no-ops if profiles is empty)

### 1c. Verify storage buckets exist
Dashboard → Storage. Should see:
- `listings-photos` (public)
- `listings-videos` (public)
- `avatars` (public)
- `dealer-assets` (public)
- `service-provider-assets` (public)
- `documents` (private)

### 1d. Auth settings
- Dashboard → Authentication → Providers → **Email**: enable, require confirmation = OFF for launch (turn back on once Resend is verified for `gotradewind.com`)
- Site URL: `https://gotradewind.com` (or current Vercel URL)
- Redirect URLs (whitelist):
  - `https://gotradewind.com/**`
  - `https://fervent-proskuriakova-6f629e.vercel.app/**`
  - `http://localhost:5173/**`

---

## 2. Stripe setup — **MANUAL**

### 2a. Create the 7 products in **test mode** first
https://dashboard.stripe.com/test/products → **+ Add product** for each:

| Product name              | Price  | Type         |
| ------------------------- | ------ | ------------ |
| Featured listing (30d)    | $49    | One-off      |
| Boost listing (7d)        | $19    | One-off      |
| Dealer · Starter          | $99/mo | Subscription |
| Dealer · Pro              | $249/mo| Subscription |
| Dealer · Premier          | $599/mo| Subscription |
| Service partner           | $79/mo | Subscription |
| Concierge engagement      | $499   | One-off      |

For all subscriptions: 14-day free trial. USD. No tax (configure later).

After each product is created, copy its `price_…` ID — you'll paste 7 of them in step 4.

### 2b. Webhook endpoint
Stripe Dashboard → Developers → Webhooks → **Add endpoint**:
- URL: `https://qwaotydaazymgnvnfuuj.supabase.co/functions/v1/stripe-webhook`
- Events: `checkout.session.completed`, `customer.subscription.created`,
  `customer.subscription.updated`, `customer.subscription.deleted`,
  `charge.refunded`
- Copy the signing secret (`whsec_…`) — pasted in step 3.

### 2c. Live mode (do this only when ready to take real money)
Repeat 2a + 2b in https://dashboard.stripe.com/products and use the live
`price_…` and `whsec_…` values. Swap test for live in env vars.

---

## 3. Supabase secrets — **MANUAL**

```bash
export SUPABASE_ACCESS_TOKEN=<your-supabase-pat>
npx supabase@latest secrets set --project-ref qwaotydaazymgnvnfuuj \
  STRIPE_SECRET_KEY=sk_test_... \
  STRIPE_WEBHOOK_SECRET=whsec_... \
  ANTHROPIC_API_KEY=sk-ant-... \
  OPENAI_API_KEY=sk-... \
  RESEND_API_KEY=re_... \
  RESEND_FROM='TradeWind <hello@gotradewind.com>' \
  STRIPE_PRICE_FEATURED_LISTING=price_... \
  STRIPE_PRICE_BOOST_LISTING=price_... \
  STRIPE_PRICE_DEALER_STARTER=price_... \
  STRIPE_PRICE_DEALER_PRO=price_... \
  STRIPE_PRICE_DEALER_PREMIER=price_... \
  STRIPE_PRICE_SERVICE_PROVIDER=price_... \
  STRIPE_PRICE_CONCIERGE=price_... \
  APP_URL=https://gotradewind.com
```

Verify with `npx supabase@latest secrets list --project-ref qwaotydaazymgnvnfuuj`.

---

## 4. Edge function deployment

All 12 functions (already deployed per `DEPLOY.md`, re-run if you change code):

```bash
npx supabase functions deploy stripe-checkout         --project-ref qwaotydaazymgnvnfuuj
npx supabase functions deploy stripe-webhook          --project-ref qwaotydaazymgnvnfuuj --no-verify-jwt
npx supabase functions deploy ai-listing-generator    --project-ref qwaotydaazymgnvnfuuj
npx supabase functions deploy ai-buyer-assistant      --project-ref qwaotydaazymgnvnfuuj
npx supabase functions deploy ai-fraud-check          --project-ref qwaotydaazymgnvnfuuj
npx supabase functions deploy ai-pricing-estimate     --project-ref qwaotydaazymgnvnfuuj
npx supabase functions deploy ai-concierge-intake     --project-ref qwaotydaazymgnvnfuuj
npx supabase functions deploy inquiry-fraud-check     --project-ref qwaotydaazymgnvnfuuj --no-verify-jwt
npx supabase functions deploy send-email              --project-ref qwaotydaazymgnvnfuuj
npx supabase functions deploy photo-enhance           --project-ref qwaotydaazymgnvnfuuj
npx supabase functions deploy sitemap                 --project-ref qwaotydaazymgnvnfuuj --no-verify-jwt
npx supabase functions deploy auction-end             --project-ref qwaotydaazymgnvnfuuj
```

The `--no-verify-jwt` flag is required for endpoints called by Stripe,
crawlers, and DB webhooks (no Supabase JWT to verify).

---

## 5. Vercel deployment — **MANUAL**

### 5a. Env vars (production)
```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
vercel env add VITE_STRIPE_PRICE_FEATURED_LISTING production
vercel env add VITE_STRIPE_PRICE_BOOST_LISTING production
vercel env add VITE_STRIPE_PRICE_DEALER_STARTER production
vercel env add VITE_STRIPE_PRICE_DEALER_PRO production
vercel env add VITE_STRIPE_PRICE_DEALER_PREMIER production
vercel env add VITE_STRIPE_PRICE_SERVICE_PROVIDER production
vercel env add VITE_STRIPE_PRICE_CONCIERGE production
vercel --prod --yes
```

### 5b. Custom domain
- Vercel → Project → Domains → add `gotradewind.com` and `www.gotradewind.com`
- Add the DNS records Vercel shows you at your registrar.
- Once live, update Supabase secret: `APP_URL=https://gotradewind.com`
  and the Supabase Auth Site URL.

### 5c. `vercel.json` rewrites
Already wired: `/sitemap.xml` → the deployed sitemap edge function.
If you change project ref, `sed -i '' 's/qwaotydaazymgnvnfuuj/<new-ref>/' vercel.json`.

---

## 6. Promote yourself to admin — **MANUAL**

1. Go to https://gotradewind.com/signup (or current Vercel URL)
2. Sign up with `YOU@example.com`, role = **Buyer**
3. Confirm email if confirmation is on
4. Supabase Dashboard → SQL editor:
   ```sql
   update profiles set role = 'admin' where email = 'YOU@example.com';
   ```
5. Sign out and back in — you'll land on `/admin`.

`AuthContext.signUp` explicitly rejects `role = 'admin'`, so the only path
to admin is via SQL. This is intentional.

---

## 7. Seed data — **MANUAL**

`supabase/seed.sql` populates 2 dealers, 2 service providers, 8 listings,
2 auctions, 2 reviews, blog post, and a market report. It needs an
existing profile to attribute records to.

```bash
# After step 6 (you have an admin profile):
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
# OR paste it in the SQL editor.
```

The script picks the first admin profile (or first profile if no admin)
as `seller_id`. Idempotent — safe to re-run.

---

## 8. Database webhook for inquiry-fraud-check — **MANUAL**

Supabase Dashboard → **Database → Webhooks** → **Create a new hook**:
- Name: `inquiry-fraud-check`
- Table: `public.inquiries`
- Events: **Insert**
- Type: HTTP Request → POST
- URL: `https://qwaotydaazymgnvnfuuj.supabase.co/functions/v1/inquiry-fraud-check`
- HTTP Headers: `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`

This auto-screens every new inquiry with Claude and writes results to
`fraud_flags`. Visible in `/admin/fraud`.

---

## 9. pg_cron for auction-end — **MANUAL**

In SQL editor (replace `<service-role-key>` with the actual JWT):

```sql
-- One-time: enable pg_cron (Supabase has it pre-installed, just needs role)
create extension if not exists pg_cron with schema extensions;

select cron.schedule('auction-end', '*/5 * * * *', $$
  select net.http_post(
    url := 'https://qwaotydaazymgnvnfuuj.supabase.co/functions/v1/auction-end',
    headers := jsonb_build_object('Authorization', 'Bearer <service-role-key>')
  )
$$);
```

Verify: `select * from cron.job;` should show `auction-end` running every 5 min.

---

## 10. Live testing checklist

Walk through each of these in the deployed app, in order. Each line is one
manual smoke test — check it off as you go.

### Auth + roles
- [ ] Sign up as buyer → land on `/buyer`
- [ ] Sign up as seller → land on `/seller`
- [ ] Sign up as dealer → redirected to `/onboarding/dealer` (OnboardingGuard)
- [ ] Complete dealer onboarding → land on `/dealer`
- [ ] Sign up as service provider → redirected to `/onboarding/service-provider`
- [ ] Complete SP onboarding → land on `/service`
- [ ] SQL-promote to admin → log out + back in → land on `/admin`

### Listings
- [ ] As seller, `/seller/listings/new` → fill form, AI listing generator returns title/description, submit
- [ ] Upload 3+ photos via `PhotoUploader` (Supabase Storage write succeeds)
- [ ] Listing appears on homepage and `/categories/<cat>`
- [ ] Open `/listings/<slug>` → gallery, dealer/seller card, Save button work
- [ ] Save listing → appears in `/buyer/saved`

### Inquiries + fraud
- [ ] As anon visitor on `/listings/<slug>` → submit `InquiryForm`
- [ ] Inquiry appears in `/seller/inquiries` (or `/dealer/leads`)
- [ ] Inquiry triggers DB webhook → row appears in `fraud_flags` table
- [ ] Admin sees flagged items at `/admin/fraud`

### Auctions
- [ ] As seller, `/seller/auctions` → create auction tied to a listing
- [ ] Auction appears at `/auctions` and `/auctions/:id`
- [ ] As buyer (different account), place a bid
- [ ] Wait until `ends_at` → pg_cron fires `auction-end` → status flips to `ended`, winner notified

### Messaging
- [ ] As buyer on a listing → `StartConversation` button creates a thread
- [ ] Both parties see it at `/messages` and `/messages/:id`
- [ ] Realtime update — open both browsers, send a message, other side updates

### Reviews
- [ ] As buyer who's contacted a dealer, `/buyer/reviews` → leave 5★ review
- [ ] Review appears on `/dealers/:slug` profile

### Request flows (5 types)
- [ ] `/financing` → submit (lands in `financing_requests` + admin sees)
- [ ] `/insurance` → submit
- [ ] `/inspections` → submit
- [ ] `/transport` → submit
- [ ] `/concierge` → AI intake (uses `ai-concierge-intake`) → Stripe checkout for $499

### Stripe checkout (test cards)
- [ ] Featured listing — pay $49 with `4242 4242 4242 4242`, exp any future, CVC any
- [ ] Dealer Starter subscription — $99/mo, 14-day trial confirmation
- [ ] Concierge — $499 one-off
- [ ] Failed card — `4000 0000 0000 0002` returns to `/checkout/cancel`
- [ ] Webhook events arrive (Stripe Dashboard → Webhooks → recent events green)
- [ ] `payments` and `subscriptions` tables in Supabase show the rows

### Admin
- [ ] `/admin/listings` shows all listings, can approve/unpublish
- [ ] `/admin/users` shows roles
- [ ] `/admin/payments` shows the Stripe events you just made
- [ ] `/admin/blog` create a post, it appears on `/blog`
- [ ] `/admin/market-reports` create a report, appears on `/market-reports`

### SEO
- [ ] `/sitemap.xml` returns XML (via vercel.json rewrite)
- [ ] `/by-state` and `/boats-for-sale-in-:state` render
- [ ] `/brands` and `/:brand-for-sale` render
- [ ] View source: each page has `<title>`, `<meta name="description">`, OG tags from `src/lib/seo.ts`

---

## 11. Dealer onboarding — what they see

1. Sign up at `/signup`, pick **Dealer** → email confirmation if enabled
2. First login auto-redirects to `/onboarding/dealer` (the OnboardingGuard
   checks `dealers.id is null` and bounces them in)
3. Form: dealership name, slug, phone, address, website, logo upload
4. On submit → row inserted in `dealers` (status `pending` if you've enabled
   admin approval — otherwise live immediately)
5. They land on `/dealer` (dashboard) showing 0 inventory
6. Add inventory at `/dealer/inventory` (re-uses CreateListing flow)
7. Subscribe at `/pricing` → Stripe checkout → row in `subscriptions`
8. Public profile is `/dealers/<slug>`

**Manual approval (recommended for first 30 days)**:
Admin goes to `/admin/users` (or query `dealers` directly), flips
`is_approved = true`. This stops spam dealers from going live.

---

## 12. Seller onboarding — what they see

Sellers don't need approval — they're individuals listing one boat/car.
1. Sign up, pick **Seller** → land on `/seller`
2. Click "Create listing" → `/seller/listings/new`
3. Choose category, fill basic info; optionally hit "Generate with AI" to
   draft title + description from year/make/model/condition
4. Upload photos (the `photo-enhance` function can clean them up — wired
   but optional)
5. Publish → listing is live at `/listings/<slug>`
6. Inquiries land in `/seller/inquiries`; messages in `/messages`
7. Optionally pay $49 for Featured (30 days) or $19 for Boost (7 days)

---

## 13. Service provider onboarding — what they see

1. Sign up, pick **Service Provider** → redirected to
   `/onboarding/service-provider`
2. Form: company name, slug, service categories (mechanic / surveyor /
   detailer / etc.), service area, hours, certifications, photos
3. Submit → row in `service_providers`
4. Land on `/service` (dashboard)
5. Subscribe at $79/mo → activates lead routing
6. Inbound: when a buyer submits an inspection/transport/service request
   in their service area + category, lead routes to `/service/leads`
7. Public profile at `/services/<slug>`

---

## 14. First-100-listings plan

Cold-start chicken-and-egg: dealers won't pay if there are no buyers,
buyers won't show up if there are no listings. Solve listings first.

### Approach
1. **Seed personally (week 1, 20 listings)**: scrape your own network —
   friends with boats, your local marina, dealers you already know. Offer
   to list their inventory free for 90 days.
2. **Free-tier dealer pull (week 2, 30 listings)**: contact 50 small boat
   dealers in your state. Free Starter plan for 6 months in exchange for
   uploading min 5 inventory items. Their existing photos + descriptions —
   AI listing generator only used when they want to refresh.
3. **Auto bootstrap (week 3, 30 listings)**: same play with auto dealers
   in 1–2 metros. Used-car dealers respond well to "free leads."
4. **Private sellers (week 4, 20 listings)**: Craigslist + Facebook
   Marketplace cross-posters. Reach out via DM with "list it on TradeWind
   too — AI writes the ad for you, free."
5. **Editorial seeding**: 5 staff-curated "featured" listings on the
   homepage carousel even if they're sourced from public dealer feeds.
   Makes the place look alive.

### Quality bar (gate first 100)
- Every listing has 5+ photos
- Every listing has a real price (no "POA" / "call for price")
- Every listing has location (state at minimum)
- Description is at least 200 chars
- Reject obviously fake/duplicate listings before they go live

Run `/admin/listings` filtered to `status = 'pending'` once a day.

---

## 15. Day-of-launch checklist (the morning of)

- [ ] Switch Stripe from test → live mode (re-create products, update secrets + Vercel envs)
- [ ] Turn on email confirmation in Supabase Auth (Resend domain verified for `gotradewind.com`)
- [ ] Smoke test: full buyer signup → submit inquiry → verify email lands
- [ ] Smoke test: full dealer signup → onboarding → checkout → webhook fires
- [ ] DNS for `gotradewind.com` resolves to Vercel (check `dig gotradewind.com`)
- [ ] HTTPS certificate active (no Vercel "issuing" status)
- [ ] `/sitemap.xml` returns XML, submit to Google Search Console
- [ ] Set up basic uptime monitor (Better Uptime free tier or UptimeRobot)
- [ ] Vercel + Supabase + Stripe billing alerts enabled (Slack / email)
- [ ] Backup plan: bookmark `psql $SUPABASE_DB_URL` so you can hotfix data
- [ ] On-call rotation: at minimum, you reading email every 2h day-1
