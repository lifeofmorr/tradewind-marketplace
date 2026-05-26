# Production Deployment Checklist — TradeWind

**Last reviewed:** 2026-05-26

The end-to-end "ship to production" checklist for enterprise private beta. Every box is a manual confirmation before the gate.

> **Companion docs:** `RELEASE_CHECKLIST.md` (per-PR), `ROLLBACK_PLAN.md`, `ENVIRONMENT_STRATEGY.md`, `PAYMENT_PRODUCTION_READINESS.md`, `BACKUP_RECOVERY_PLAN.md`.

---

## A. Vercel

### Project + branch
- [ ] Vercel project `tradewind-marketplace` exists in the correct org.
- [ ] `Production` branch = `main`.
- [ ] Preview deploys enabled on every branch.
- [ ] Custom domain `gotradewind.com` (and `www`) attached.
- [ ] DNS A/AAAA/CNAME records confirmed in registrar.
- [ ] TLS auto-managed by Vercel, valid for primary + `www` + apex.

### Build
- [ ] Build command: `npm run build`.
- [ ] Output dir: `dist`.
- [ ] Node version: 20 (default LTS).
- [ ] Build succeeds on a clean clone.
- [ ] `vercel.json` reviewed: rewrites + headers in place.

### Environment variables (Production scope)
- [ ] `VITE_SUPABASE_URL=https://qwaotydaazymgnvnfuuj.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_…`
- [ ] `VITE_STRIPE_PRICE_*` (7 SKUs, all `price_live_…`)
- [ ] `VITE_GOOGLE_MAPS_API_KEY` (optional)
- [ ] `VITE_SENTRY_DSN` (when wired)
- [ ] `VITE_ENV_NAME=production`

### Headers (verified in `vercel.json`)
- [ ] `X-Frame-Options: DENY`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
- [ ] `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- [ ] `Cross-Origin-Opener-Policy: same-origin`
- [ ] `Content-Security-Policy` (Stripe / Plaid / Supabase / Google Fonts)

### Domain
- [ ] HTTPS works for `gotradewind.com` + `www.gotradewind.com`.
- [ ] `http://` → `https://` 301.
- [ ] `www.` → apex (or apex → `www.`, pick one, redirect the other).
- [ ] `gotradewind.com/sitemap.xml` proxies to Supabase function.

### Rollback
- [ ] Last 5 production deploys retained.
- [ ] Promote-to-prod permission limited to founder.

---

## B. Supabase (production project `qwaotydaazymgnvnfuuj`)

### Project
- [ ] Plan tier: Pro (or higher) for PITR.
- [ ] Region: closest to majority of customers (currently US-East).
- [ ] Storage buckets created: `listing-photos`, `listing-videos`, `avatars`, `aircraft-docs`.

### Schema + migrations
- [ ] All 16 migrations applied (`supabase migration list --linked`).
- [ ] `supabase db diff --linked` shows no pending drift.
- [ ] `schema.sql` matches live.

### RLS
- [ ] 46 tables have RLS enabled.
- [ ] 137 policies present.
- [ ] No `USING (true)` policies.
- [ ] `profiles_guard_admin_fields` trigger present and tested.

### Storage policies
- [ ] Listing photo bucket: public read, authenticated write to own listing.
- [ ] Avatars: public read, owner write.
- [ ] Documents (aircraft): scoped read.

### Function deployments (17 active)
- [ ] `stripe-checkout` deployed.
- [ ] `stripe-webhook` deployed `--no-verify-jwt`.
- [ ] `sitemap` deployed `--no-verify-jwt`.
- [ ] `send-email`, `plaid-link`, `partner-quote`, `auction-end` deployed.
- [ ] `ai-buyer-assistant`, `ai-concierge-intake`, `ai-fraud-check`, `ai-listing-autopilot`, `ai-listing-generator`, `ai-negotiation-assistant`, `ai-pricing-estimate` deployed.
- [ ] `inquiry-fraud-check`, `vin-decode`, `photo-enhance` deployed.

### Function secrets (production)
- [ ] `STRIPE_SECRET_KEY=sk_live_…`
- [ ] `STRIPE_WEBHOOK_SECRET=whsec_live_…`
- [ ] `STRIPE_PRICE_*` (7 SKUs, live)
- [ ] `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`
- [ ] `APP_URL=https://gotradewind.com`
- [ ] `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL=claude-sonnet-4-6`
- [ ] `OPENAI_API_KEY` + `OPENAI_FALLBACK_MODEL` (fallback)
- [ ] `RESEND_API_KEY`, `RESEND_FROM` (verified domain)
- [ ] `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV=production` (when live)
- [ ] `ALLOWED_ORIGINS=https://gotradewind.com,https://www.gotradewind.com`

### Backups
- [ ] PITR enabled, retention ≥ 7 days.
- [ ] Weekly `pg_dump` cron set up + tested restore (`BACKUP_RECOVERY_PLAN.md`).
- [ ] Drill scheduled quarterly.

### Cron
- [ ] `auction-end` registered via pg_cron every 5 min:
  ```sql
  select cron.schedule('auction-end', '*/5 * * * *',
    $$ select net.http_post(
         url := 'https://qwaotydaazymgnvnfuuj.supabase.co/functions/v1/auction-end',
         headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key', true))
       ) $$);
  ```

---

## C. Stripe

- [ ] Live mode activated (business verification complete).
- [ ] 7 products created in Live mode.
- [ ] 7 prices created and copied into Vercel + Supabase secrets.
- [ ] Webhook endpoint in Live mode: `https://qwaotydaazymgnvnfuuj.supabase.co/functions/v1/stripe-webhook`.
- [ ] Webhook events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`, `charge.dispute.created`, `invoice.payment_failed`.
- [ ] Webhook signing secret copied to `STRIPE_WEBHOOK_SECRET` (Supabase secrets).
- [ ] Customer Portal configured: cancel allowed, payment update allowed, address update allowed.
- [ ] Tax settings configured (Stripe Tax or manual).
- [ ] Dispute notification email enabled.
- [ ] Failed payment retry policy reviewed.

---

## D. AI

- [ ] Anthropic billing in good standing.
- [ ] Anthropic spend cap set ($X/mo).
- [ ] OpenAI billing in good standing (fallback).
- [ ] `ai_logs` insert path verified end-to-end.
- [ ] Fallback path tested by temporarily killing Anthropic key (in staging).

---

## E. Monitoring

- [ ] Supabase alerts: DB CPU, fn error rate, connection saturation → email.
- [ ] Vercel alerts: deploy failures, 500 spikes → email.
- [ ] Stripe alerts: failed payments, disputes → email.
- [ ] Sentry (when wired): DSN set, ingestion confirmed.
- [ ] Synthetic uptime check (Pingdom / UptimeRobot) on `/`, `/login`, sample `/listings/:slug`.

---

## F. Audit + audit logs

- [ ] `audit_logs` table reachable, admin-readable.
- [ ] `logAuditEvent()` invoked from every admin mutation path.
- [ ] Daily audit log digest query bookmarked.

---

## Pre-flight cutover (when flipping LIVE)

1. Run final smoke test on staging (TEST mode) — see `RELEASE_CHECKLIST.md`.
2. Swap in Vercel **Production** env vars (live Stripe keys + price IDs).
3. Swap in Supabase **production** secrets (live Stripe keys, webhook secret, AI keys, Plaid prod if applicable).
4. Trigger one fresh deploy on Vercel (re-deploy with new env).
5. Trigger one fresh function redeploy on Supabase (to pick up secrets):
   ```bash
   for fn in stripe-checkout stripe-webhook send-email plaid-link partner-quote auction-end \
             ai-buyer-assistant ai-concierge-intake ai-fraud-check ai-listing-autopilot \
             ai-listing-generator ai-negotiation-assistant ai-pricing-estimate \
             inquiry-fraud-check vin-decode photo-enhance sitemap; do
     supabase functions deploy "$fn" --project-ref qwaotydaazymgnvnfuuj
   done
   ```
6. Run a **live-mode** small test purchase (founder card, $0.50 boost).
7. Confirm webhook arrived, `payments` row inserted, `listings.is_featured = true`.
8. Refund the test in Stripe Dashboard.
9. Announce go-live internally.

---

## Sign-off

- [ ] Engineer (founder): __________________ date __________
- [ ] Admin / Ops (founder): _______________ date __________
- [ ] Legal review noted (counsel): ________ date __________

Until all three boxes are checked, **do not enable live Stripe mode**.
