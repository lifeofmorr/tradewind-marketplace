# TradeWind Production Readiness

**Date:** 2026-05-20
**Snapshot after this QA pass.**

---

## Readiness Summary

| Dimension | Status |
|---|---|
| Functional completeness | ✅ Ready for controlled private beta across boats, autos, aircraft |
| Build & tests | ✅ typecheck clean · 53/53 vitest · build 2.5s |
| Security posture | ✅ Hardened this pass (JWT on edge fns, tighter RLS, CSP) |
| Observability | ✅ `audit_logs` table + admin-action logging |
| Legal / privacy | ✅ Terms, Privacy, Data-deletion all live with real content |
| Mobile | ✅ Responsive layouts; BuyerCompare needs refinement (not blocking) |
| Performance | ⚠️ Bundle 1.04 MB main chunk — works fine on broadband, optimization recommended for mobile networks |
| External dependencies | ⚠️ Plaid in sandbox; partner quote APIs simulated |

---

## What's production-ready right now

- **All public routes** render real content with proper demo labels, filters, and CTAs
- **All role dashboards** (buyer, seller, dealer, service provider, admin) backed by real Supabase queries
- **AI tools** (Listing Autopilot, Negotiation, Deal Score, Fraud, Concierge Intake) hit real Claude edge functions
- **Aircraft vertical** at full parity: 10-category browse, full spec panel, asset passport with FAA disclaimers, true-cost-to-own, pre-buy flow, 11 aviation service categories, 10-step transaction timeline
- **Stripe**: signature-verified webhook with idempotency table
- **Admin moderation**: listings approve/reject/convert/duplicate, user ban, fraud queue, content/blog/market-reports CMS
- **Auctions**: live/upcoming/ended tabs with countdown logic
- **SEO**: programmatic pages for state, brand, city × category; sitemap edge function

---

## Environment requirements for production

These need to be set on Vercel + Supabase for full functionality:

```
# Supabase Edge Function secrets
SUPABASE_URL                 # already set
SUPABASE_ANON_KEY            # already set
SUPABASE_SERVICE_ROLE_KEY    # already set (server-only)
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
ANTHROPIC_API_KEY            # required for AI edge fns
PLAID_CLIENT_ID              # optional — falls back to sandbox
PLAID_SECRET                 # optional — falls back to sandbox
PLAID_ENV                    # sandbox | development | production
ALLOWED_ORIGINS              # comma-separated CORS allowlist (optional)

# Vercel
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_STRIPE_PUBLISHABLE_KEY
VITE_PLAID_CLIENT_ID         # optional — gates the live Plaid panel
```

---

## Deploy checklist (this pass)

1. Commit the changes on `claude/hungry-wiles-3fda56`
2. Merge / push to `main` → Vercel auto-deploys frontend
3. Deploy two updated edge functions:
   ```
   npx supabase functions deploy plaid-link --project-ref qwaotydaazymgnvnfuuj
   npx supabase functions deploy partner-quote --project-ref qwaotydaazymgnvnfuuj
   ```
4. Apply the RLS migration:
   ```
   npx supabase db push --project-ref qwaotydaazymgnvnfuuj
   ```
5. Confirm CSP header is present on a production response:
   ```
   curl -I https://tradewind-marketplace.vercel.app/ | grep -i content-security-policy
   ```

---

## Day-2 ops

- **Monitoring:** Supabase logs (edge fn invocations + errors), Vercel analytics, Stripe webhook delivery
- **Incident response:** see `INCIDENT_RESPONSE_PLAN.md` and `FRAUD_PREVENTION.md`
- **Daily admin tasks:** see `ADMIN_DAILY_OPERATIONS.md`
- **Beta onboarding:** see `BUYER_BETA_TEST_GUIDE.md`, `SELLER_BETA_ONBOARDING.md`, `DEALER_BETA_ONBOARDING.md`, `SERVICE_PROVIDER_BETA_ONBOARDING.md`

---

## Recommended next 30 days

Sorted by leverage, not effort:

1. **Bundle split** — `manualChunks` for framer-motion + react-hook-form + Radix — drops main chunk ~25%
2. **TransactionRoom persistence** — buyers expect their closing checklist to follow them across devices
3. **Buyer Assistant UI surface** — edge fn deployed, just needs a CTA on ListingDetail
4. **First live partner integration** — pick one of {lender, insurance, transport} and replace sandbox stub end-to-end
5. **Mobile pass on BuyerCompare** — reflow to card mode on phones
6. **Independent security review** — pentest against admin + edge fn surfaces before any sizable public push
