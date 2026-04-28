# TradeWind · Deploy status + remaining work

## ✓ Live now

- **App** — https://fervent-proskuriakova-6f629e.vercel.app
- **Repo** — https://github.com/lifeofmorr/tradewind-marketplace (`main`)
- **Supabase** — https://supabase.com/dashboard/project/qwaotydaazymgnvnfuuj
  Region us-east-1 · Org `donmondemorrison@gmail.com's Org`
- **Schema** — 3 migrations applied
  (`20260101000000_initial.sql`, `…_phase3.sql`, `…_seed.sql`)
- **Edge functions** — 12/12 deployed:
  `stripe-checkout`, `stripe-webhook` (no-jwt), `ai-listing-generator`,
  `ai-buyer-assistant`, `ai-fraud-check`, `ai-pricing-estimate`,
  `ai-concierge-intake`, `inquiry-fraud-check` (no-jwt), `send-email`,
  `photo-enhance`, `sitemap` (no-jwt), `auction-end`
- **Vercel envs (production)** — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **vercel.json** — wires `/sitemap.xml` to the deployed sitemap function

## ⏸ What still needs Don

### 1. Stripe (no payments work yet)

Create the 7 prices in https://dashboard.stripe.com/test/products
(see [PRICING.md](./PRICING.md) for the table).

```bash
export SUPABASE_ACCESS_TOKEN=<your-supabase-pat>
npx supabase@latest secrets set --project-ref qwaotydaazymgnvnfuuj \
  STRIPE_SECRET_KEY=sk_test_... \
  STRIPE_WEBHOOK_SECRET=whsec_... \
  STRIPE_PRICE_FEATURED_LISTING=price_... \
  STRIPE_PRICE_BOOST_LISTING=price_... \
  STRIPE_PRICE_DEALER_STARTER=price_... \
  STRIPE_PRICE_DEALER_PRO=price_... \
  STRIPE_PRICE_DEALER_PREMIER=price_... \
  STRIPE_PRICE_SERVICE_PROVIDER=price_... \
  STRIPE_PRICE_CONCIERGE=price_... \
  APP_URL=https://fervent-proskuriakova-6f629e.vercel.app
```

Then add the matching `VITE_STRIPE_*` vars to Vercel:

```bash
for v in VITE_STRIPE_PUBLISHABLE_KEY VITE_STRIPE_PRICE_FEATURED_LISTING \
         VITE_STRIPE_PRICE_BOOST_LISTING VITE_STRIPE_PRICE_DEALER_STARTER \
         VITE_STRIPE_PRICE_DEALER_PRO VITE_STRIPE_PRICE_DEALER_PREMIER \
         VITE_STRIPE_PRICE_SERVICE_PROVIDER VITE_STRIPE_PRICE_CONCIERGE; do
  vercel env add "$v" production    # paste each value when prompted
done
vercel --prod --yes                  # rebuild with the new envs
```

Webhook endpoint in Stripe Dashboard:
`https://qwaotydaazymgnvnfuuj.supabase.co/functions/v1/stripe-webhook`
Events: `checkout.session.completed`,
`customer.subscription.{created,updated,deleted}`, `charge.refunded`.
Copy the signing secret into `STRIPE_WEBHOOK_SECRET` above.

### 2. AI + email keys

```bash
npx supabase@latest secrets set --project-ref qwaotydaazymgnvnfuuj \
  ANTHROPIC_API_KEY=sk-ant-... \
  OPENAI_API_KEY=sk-... \
  RESEND_API_KEY=re_... \
  RESEND_FROM='TradeWind <hello@gotradewind.com>'
```

### 3. DB webhook for fraud-check (auto-screen every inquiry)

Supabase Dashboard → **Database → Webhooks**:
- Name `inquiry-fraud-check`
- Table `public.inquiries` · Event `INSERT`
- POST → `https://qwaotydaazymgnvnfuuj.supabase.co/functions/v1/inquiry-fraud-check`
- Header `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`

### 4. pg_cron schedule for auction finalizer

In the SQL editor (replace `<service-role-key>` with your service-role JWT):

```sql
select cron.schedule('auction-end', '*/5 * * * *', $$
  select net.http_post(
    url := 'https://qwaotydaazymgnvnfuuj.supabase.co/functions/v1/auction-end',
    headers := jsonb_build_object('Authorization', 'Bearer <service-role-key>')
  )
$$);
```

### 5. Custom domain (optional)

Vercel Dashboard → Project → Domains → add `gotradewind.com`. Then update
`APP_URL` in Supabase secrets to match.

### 6. Promote yourself to admin

Sign up at https://fervent-proskuriakova-6f629e.vercel.app/signup as a
buyer, then in the Supabase SQL editor:

```sql
update profiles set role = 'admin' where email = 'YOU@example.com';
```

Sign out and back in. You'll land on `/admin`.

---

## Original runbook (reference)

The original step-by-step (gh login → supabase create → vercel deploy) is
preserved below — most of it has been executed, but it's useful for
re-deploying to a different environment later.

---

## 1. GitHub

```bash
# Authenticate gh once
gh auth login                         # pick GitHub.com, HTTPS, login with browser

# From inside the worktree:
cd ~/Code/tradewind-marketplace/.claude/worktrees/fervent-proskuriakova-6f629e

# Option A — push the worktree branch and open a PR
gh repo create tradewind-marketplace --public --source=. --remote=origin --push

# Option B — flatten onto main first, then push
git branch -m claude/fervent-proskuriakova-6f629e main
gh repo create tradewind-marketplace --public --source=. --remote=origin --push
```

## 2. Supabase

```bash
# Authenticate
npx supabase login                     # opens browser

# Create the project (writes the ref to a local config)
npx supabase projects create tradewind-marketplace \
  --org-id default \
  --db-password "$(openssl rand -base64 24)" \
  --region us-east-1

# Link the local repo to it
npx supabase link --project-ref <project-ref-from-create-output>

# Apply schema + Phase 3 migration + seed
npx supabase db push --include-all     # uses supabase/schema.sql + migrations
psql "$SUPABASE_DB_URL" -f supabase/migrations/phase3.sql
psql "$SUPABASE_DB_URL" -f supabase/seed.sql

# Storage buckets (also created by schema.sql; CLI form is optional)
for b in listings-photos listings-videos avatars dealer-assets service-provider-assets; do
  npx supabase storage create "$b" --public
done
npx supabase storage create documents

# Push secrets (fill in real values first)
npx supabase secrets set \
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

# Deploy edge functions
npx supabase functions deploy stripe-checkout
npx supabase functions deploy stripe-webhook        --no-verify-jwt
npx supabase functions deploy ai-listing-generator
npx supabase functions deploy ai-buyer-assistant
npx supabase functions deploy ai-fraud-check
npx supabase functions deploy ai-pricing-estimate
npx supabase functions deploy ai-concierge-intake
npx supabase functions deploy inquiry-fraud-check   --no-verify-jwt
npx supabase functions deploy send-email
npx supabase functions deploy photo-enhance
npx supabase functions deploy sitemap               --no-verify-jwt
npx supabase functions deploy auction-end

# Show project URL + anon key (for .env.local + Vercel envs)
npx supabase status
```

## 3. .env.local

Fill in the file Claude already created:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
VITE_STRIPE_PRICE_FEATURED_LISTING=price_...
VITE_STRIPE_PRICE_BOOST_LISTING=price_...
VITE_STRIPE_PRICE_DEALER_STARTER=price_...
VITE_STRIPE_PRICE_DEALER_PRO=price_...
VITE_STRIPE_PRICE_DEALER_PREMIER=price_...
VITE_STRIPE_PRICE_SERVICE_PROVIDER=price_...
VITE_STRIPE_PRICE_CONCIERGE=price_...
```

## 4. Update vercel.json

Replace `YOUR-PROJECT.supabase.co` with your real project ref:

```bash
sed -i '' 's/YOUR-PROJECT/<your-project-ref>/' vercel.json
```

## 5. Vercel

```bash
# Authenticate (opens browser)
vercel login

# Deploy
vercel --prod
# When prompted: framework = Vite, build = npm run build, output = dist

# Add env vars (or use the dashboard)
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
# ...repeat for each VITE_STRIPE_* var
```

## 6. Stripe webhook + database webhook

Once deployed:

- **Stripe Dashboard → Developers → Webhooks**
  Endpoint: `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`
  Events: `checkout.session.completed`, `customer.subscription.{created,updated,deleted}`, `charge.refunded`
  Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

- **Supabase Dashboard → Database → Webhooks**
  Name: `inquiry-fraud-check` · Table: `public.inquiries` · Event: `INSERT`
  POST to `https://<project-ref>.supabase.co/functions/v1/inquiry-fraud-check`
  Header: `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`

- **pg_cron → schedule auction-end every 5 minutes**
  ```sql
  select cron.schedule('auction-end', '*/5 * * * *', $$
    select net.http_post(
      url := 'https://<project-ref>.supabase.co/functions/v1/auction-end',
      headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'))
    )
  $$);
  ```

## 7. Promote yourself to admin

Sign up via the deployed UI as a buyer, then in Supabase SQL editor:

```sql
update profiles set role = 'admin' where email = 'YOU@example.com';
```

Sign out and back in.
