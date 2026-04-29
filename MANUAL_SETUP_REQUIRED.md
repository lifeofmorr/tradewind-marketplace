# Manual Setup Required Before Private Beta

This is the operator's checklist. Everything here lives outside of the codebase — it's environment, secrets, infrastructure, or third-party config that has to be done by hand before the first beta cohort arrives.

Treat each item as gating. Don't ship beta invitations until every box below is either checked or explicitly accepted as a known gap.

## Secrets and API keys

### Anthropic API key (for AI seller-offer drafts and dealer follow-ups)
- Generate from https://console.anthropic.com.
- Add as a Supabase secret:
  ```
  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
  ```
- Used by: edge functions that draft offers and follow-ups.

### OpenAI API key (used by select market-pulse / concierge passes)
- Generate from https://platform.openai.com/api-keys.
- Add as a Supabase secret:
  ```
  supabase secrets set OPENAI_API_KEY=sk-...
  ```

### Resend API key (transactional email)
- Generate from https://resend.com/api-keys.
- Add as a Supabase secret:
  ```
  supabase secrets set RESEND_API_KEY=re_...
  ```
- Verify the sending domain inside Resend if you want emails to come from `@tradewind.tld` instead of the default Resend sender.

### Stripe keys (test mode for beta, live for launch)
- Beta: keep `STRIPE_SECRET_KEY=sk_test_...` and `STRIPE_WEBHOOK_SECRET=whsec_...` configured.
- Confirm both are set as Supabase secrets and as Vercel project env vars (the public publishable key lives on the frontend).

## Edge functions

Re-deploy after any change to secrets or function code:
```
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
supabase functions deploy send-email
supabase functions deploy ai-offer-draft
supabase functions deploy ai-follow-up
supabase functions deploy ai-partner-match
supabase functions deploy ai-market-pulse
supabase functions deploy fraud-check
supabase functions deploy auction-end
```

If a function isn't in this repo's `supabase/functions` directory, it doesn't need deploying. Run `supabase functions list` to verify what's actually present.

## Database migrations

Apply all pending migrations:
```
supabase db push
```

The two migrations most likely to be missed:
- `offer_drafts` table (for the offer builder).
- `advantage` columns on listings (for TradeWind Advantage badges).
- Priority-2 migration at `supabase/migrations/20260101000500_priority2.sql`.

After push, sanity-check by opening Supabase Studio → Table editor and confirming each new table/column exists.

## RLS and CORS

- Verify Row Level Security is enabled on every table (Supabase Studio → Authentication → Policies). The migration set should have done this; sanity-check anyway.
- Set `ALLOWED_ORIGINS` on Supabase project settings to include:
  - The Vercel preview URL used during beta.
  - The eventual production custom domain (if known).
  - Any localhost ports in use during dev.

## Supabase webhooks

- **Fraud check webhook.** Database webhook on `listings` insert/update → calls the `fraud-check` edge function. Configure in Supabase Studio → Database → Webhooks.

## Cron jobs

- **Auction wrap-up.** `pg_cron` schedule that calls the `auction-end` function every 5 minutes. SQL example:
  ```sql
  select cron.schedule('auction-end-tick', '*/5 * * * *',
    $$ select net.http_post(
      url := 'https://[project].functions.supabase.co/auction-end',
      headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'))
    ) $$);
  ```
- Disabled by default during beta (admin handles wrap-up manually). Enable before public launch.

## Domain and DNS

- **Custom domain on Vercel** — connect the production domain in Vercel project settings. Add the required CNAME / A records at your DNS provider.
- **Email sending domain** in Resend — add SPF, DKIM, DMARC records once the domain is locked in.
- **Stripe verified domain** for Apple Pay/Google Pay — add the production domain in Stripe Dashboard → Settings → Payment methods → Apple Pay → Add domain.

## Vercel environment

- Ensure all `VITE_*` public env vars are set in Vercel for both Preview and Production:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_STRIPE_PUBLISHABLE_KEY`
  - any feature flags you've added.
- Promote the latest Preview to Production once all of the above is verified.

## One-time admin setup

- Create the admin account by signing up normally, then in Supabase Studio update `profiles.role = 'admin'` for that user.
- Confirm `/admin` loads and all 10 admin sub-routes render.

## Smoke test before sending invites

Run through the buyer + seller + dealer + SP + admin flows yourself. The `BUYER_BETA_TEST_GUIDE.md` walkthrough is a good script. If anything errors, fix before inviting anyone.

## Done?

Only when every section above is either checked or has an explicit "deferred — known gap" note in writing should you send the first beta invitation.
