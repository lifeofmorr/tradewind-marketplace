# TradeWind — Setup (do this once)

## What's already done for you
- Git repo initialized with `main` branch and one commit (`Phase 0: TradeWind scaffold`)
- Full Phase 0 scaffold (configs, brand, libs, AuthContext stub, placeholder route)
- `setup.sh` automates the rest

## What you do (15 minutes)

### Step 1 — Move the folder onto your Mac
Open Finder → drag `tradewind-marketplace/` from your Cowork outputs folder into `~/Code/` (or wherever you keep code).

### Step 2 — Run setup
```bash
cd ~/Code/tradewind-marketplace
bash setup.sh
```
This runs `npm install`, validates git, creates a private GitHub repo (via `gh`) and pushes, runs typecheck + build, and prints next steps.

If you don't have `gh` installed:
```bash
brew install gh
gh auth login
```

### Step 3 — Create the four remote services
While `setup.sh` runs, open these tabs and create accounts/projects:

| Service | URL | What you need |
|---|---|---|
| Supabase | https://supabase.com/dashboard/projects | New project · grab Project URL + anon key + service_role key |
| Stripe | https://dashboard.stripe.com/test/products | Create the 7 products + prices · grab pk + sk + webhook secret |
| Anthropic | https://console.anthropic.com/settings/keys | Create one API key |
| Vercel | https://vercel.com/new | Import your GitHub repo |

### Step 4 — Fill `.env.local`
```bash
nano .env.local
# Paste:
#   VITE_SUPABASE_URL
#   VITE_SUPABASE_ANON_KEY
#   VITE_STRIPE_PUBLISHABLE_KEY
#   VITE_STRIPE_PRICE_* (the 7 price ids)
```

### Step 5 — Confirm dev server runs
```bash
npm run dev
# Visit http://localhost:5173 — you'll see the TradeWind splash
```

### Step 6 — Start Claude Code on this directory
```bash
claude
```
Paste the contents of `../tradewind-claude-code-prompt.md` (or wherever you saved it) as the first message. Claude Code will detect Phase 0 is done and start at Phase 1A (the database schema).

### Step 7 — When Claude Code generates `supabase/schema.sql`
Either paste into Supabase SQL editor manually, or:
```bash
brew install supabase/tap/supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

### Step 8 — Set the Supabase secrets (after Claude Code generates edge functions)
```bash
supabase secrets set \
  STRIPE_SECRET_KEY=sk_test_... \
  STRIPE_WEBHOOK_SECRET=whsec_... \
  ANTHROPIC_API_KEY=sk-ant-... \
  STRIPE_PRICE_FEATURED_LISTING=price_... \
  STRIPE_PRICE_BOOST_LISTING=price_... \
  STRIPE_PRICE_DEALER_STARTER=price_... \
  STRIPE_PRICE_DEALER_PRO=price_... \
  STRIPE_PRICE_DEALER_PREMIER=price_... \
  STRIPE_PRICE_SERVICE_PROVIDER=price_... \
  STRIPE_PRICE_CONCIERGE=price_...
```

### Step 9 — Deploy edge functions and wire the Stripe webhook
After Claude Code completes Phase 1K:
```bash
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
supabase functions deploy ai-listing-generator
supabase functions deploy ai-buyer-assistant
supabase functions deploy ai-fraud-check
supabase functions deploy ai-pricing-estimate
supabase functions deploy ai-concierge-intake
```

Then in Stripe Dashboard → Developers → Webhooks → Add endpoint:
```
https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook
```
Listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Copy the signing secret back into Supabase secrets as `STRIPE_WEBHOOK_SECRET`.

### Step 10 — Promote yourself to admin (after first signup)
Sign up at `/signup` as a buyer, then in Supabase SQL editor:
```sql
update profiles set role = 'admin' where email = 'YOUR_EMAIL';
```
Sign out and back in — you'll land on `/admin`.

---

## What I (Claude in Cowork) cannot do for you
I can't sign in to your accounts, create paid services, or push to your GitHub. The five things you must do yourself:

1. Sign up for Supabase, Stripe, Anthropic, Vercel, and GitHub.
2. Authenticate `gh auth login` on your Mac.
3. Authorize `supabase login` on your Mac.
4. Paste the API keys into `.env.local` and Supabase secrets.
5. Click through the Stripe product/price creation UI.

Everything else is automated by `setup.sh`, the Claude Code prompt, and the schema/edge-function code Claude Code will generate.
