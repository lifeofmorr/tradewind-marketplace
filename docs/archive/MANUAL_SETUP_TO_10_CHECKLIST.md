# Manual Setup to 10 Checklist

**Purpose:** Every action Don must do personally in external dashboards. These cannot be automated by AI — they require login credentials and manual verification.

**Status key:** ⬜ Not started · 🟡 In progress · ✅ Done · 🚫 Decided not to do

---

## 1. Sentry — Error Monitoring

**Why:** Without Sentry, you're flying blind. Every error a beta user hits is invisible to you.

| # | Action | Status | Notes |
|---|---|---|---|
| 1.1 | Go to https://sentry.io → Create account (or log in) | ⬜ | Free tier covers beta easily |
| 1.2 | Create a new project: Platform = React, name = `tradewind-marketplace` | ⬜ | |
| 1.3 | Copy the DSN (looks like `https://xxx@xxx.ingest.sentry.io/xxx`) | ⬜ | |
| 1.4 | Vercel → Project → Settings → Environment Variables → Add `VITE_SENTRY_DSN` = the DSN | ⬜ | Set for Production environment |
| 1.5 | Redeploy (Vercel → Deployments → Redeploy) | ⬜ | Picks up new env var |
| 1.6 | Visit the live site → Open browser console → Verify no Sentry errors | ⬜ | |
| 1.7 | In Sentry → Alerts → Create alert for "new issue" → Email notification | ⬜ | Get notified when something breaks |

**Time estimate:** 15 minutes
**Impact:** Monitoring goes from 3/10 to 6/10

---

## 2. Stripe — Live Mode Activation

**Why:** Can't charge real money in test mode. Required before any paying customer.

### 2a. Stripe Account Verification

| # | Action | Status | Notes |
|---|---|---|---|
| 2a.1 | Stripe Dashboard → Settings → Business details → Complete all fields | ⬜ | Legal name, address, tax ID |
| 2a.2 | Stripe Dashboard → Settings → Bank account → Add payout bank account | ⬜ | Where revenue goes |
| 2a.3 | Verify identity (Stripe will prompt — usually takes 1–2 business days) | ⬜ | May need photo ID + selfie |
| 2a.4 | Wait for "Your account is active" email | ⬜ | Cannot proceed until verified |

### 2b. Create Live Products & Prices

| # | Product | Price | Type | Status |
|---|---|---|---|---|
| 2b.1 | Featured Listing (30d) | $79 one-off | Payment | ⬜ |
| 2b.2 | Boost Listing (7d) | $29 one-off | Payment | ⬜ |
| 2b.3 | Dealer Starter | $149/mo | Subscription | ⬜ |
| 2b.4 | Dealer Pro | $499/mo | Subscription | ⬜ |
| 2b.5 | Dealer Premier | $1,499/mo | Subscription | ⬜ |
| 2b.6 | Service Provider | $89/mo | Subscription | ⬜ |
| 2b.7 | Concierge Engagement | $499 one-off | Payment | ⬜ |

**For subscriptions:** Set billing period = Monthly. Add 14-day free trial.
**Important:** Copy each `price_xxx` ID — you'll need all 7.

### 2c. Live Webhook

| # | Action | Status | Notes |
|---|---|---|---|
| 2c.1 | Stripe → Developers → Webhooks → Add endpoint (LIVE mode) | ⬜ | |
| 2c.2 | URL: `https://qwaotydaazymgnvnfuuj.supabase.co/functions/v1/stripe-webhook` | ⬜ | |
| 2c.3 | Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded` | ⬜ | |
| 2c.4 | Copy the webhook signing secret (`whsec_xxx`) | ⬜ | |

### 2d. Set Live Keys

| # | Where | Key | Status |
|---|---|---|---|
| 2d.1 | Vercel env vars (Production) | `VITE_STRIPE_PUBLISHABLE_KEY` = `pk_live_xxx` | ⬜ |
| 2d.2 | Vercel env vars (Production) | All 7 `VITE_STRIPE_PRICE_*` with live `price_xxx` IDs | ⬜ |
| 2d.3 | Supabase Secrets | `STRIPE_SECRET_KEY` = `sk_live_xxx` | ⬜ |
| 2d.4 | Supabase Secrets | `STRIPE_WEBHOOK_SECRET` = `whsec_xxx` | ⬜ |
| 2d.5 | Supabase Secrets | All 7 `STRIPE_PRICE_*` with live `price_xxx` IDs | ⬜ |

### 2e. Flip the Switch

| # | Action | Status | Notes |
|---|---|---|---|
| 2e.1 | Vercel → Add `VITE_STRIPE_MODE` = `live` | ⬜ | **Do NOT do this until 2a–2d are complete** |
| 2e.2 | Supabase → `supabase secrets set STRIPE_MODE=live` | ⬜ | Both client AND server must agree |
| 2e.3 | Redeploy on Vercel | ⬜ | |
| 2e.4 | Visit `/admin/payments/live-readiness` → Verify green status | ⬜ | |
| 2e.5 | Test with a real $1 charge (create a test product, charge yourself, refund) | ⬜ | Proves the full loop works |

**Time estimate:** 45–60 minutes (plus 1–2 days for identity verification)
**Impact:** Payments goes from 5/10 to 8/10

---

## 3. Custom Domain

**Why:** `tradewind-marketplace.vercel.app` doesn't inspire buyer/dealer confidence.

| # | Action | Status | Notes |
|---|---|---|---|
| 3.1 | Decide on domain: `gotradewind.com` or alternative | ⬜ | Check availability on Namecheap/GoDaddy |
| 3.2 | Purchase domain | ⬜ | ~$12/year |
| 3.3 | Vercel → Project → Settings → Domains → Add domain | ⬜ | |
| 3.4 | Update DNS records per Vercel instructions (usually CNAME or A record) | ⬜ | |
| 3.5 | Wait for SSL certificate (automatic, usually <10 min) | ⬜ | |
| 3.6 | Verify site loads on new domain | ⬜ | |
| 3.7 | Update `APP_URL` in Supabase secrets to new domain | ⬜ | For email links |
| 3.8 | Update Stripe webhook URL if domain changed | ⬜ | If using domain-based URL |
| 3.9 | Update Supabase Auth redirect URLs to include new domain | ⬜ | |

**Time estimate:** 20 minutes (plus DNS propagation, up to 48h)
**Impact:** Deployment goes from 7/10 to 8/10. Traction/credibility improvement.

---

## 4. Calendar Booking Link

**Why:** Eliminates scheduling back-and-forth for demo calls.

| # | Action | Status | Notes |
|---|---|---|---|
| 4.1 | Sign up for Calendly (free) or Cal.com (free) | ⬜ | |
| 4.2 | Create a 15-minute event type: "TradeWind Demo" | ⬜ | |
| 4.3 | Set available hours (e.g., Mon–Fri, 9am–5pm ET) | ⬜ | |
| 4.4 | Add the booking link to outreach email templates | ⬜ | |
| 4.5 | Set `VITE_FEEDBACK_CALL_URL` in Vercel to the booking link | ⬜ | Referenced in feedback page |
| 4.6 | Test: book a slot yourself to verify confirmation email arrives | ⬜ | |

**Time estimate:** 10 minutes
**Impact:** Outreach conversion improvement. Removes friction from "interested" replies.

---

## 5. Support Email

**Why:** `don@lifeofmorr.com` as support email is unprofessional for a marketplace.

| # | Action | Status | Notes |
|---|---|---|---|
| 5.1 | Create Gmail: `support@gotradewind.com` (or `tradewindsupport@gmail.com` if no custom domain yet) | ⬜ | |
| 5.2 | Set up email forwarding to your personal inbox | ⬜ | So you don't miss anything |
| 5.3 | Vercel → Add `VITE_BUSINESS_SUPPORT_EMAIL` = the new email | ⬜ | |
| 5.4 | Supabase → Update `RESEND_FROM` to use the new email (if using custom domain) | ⬜ | For transactional emails |
| 5.5 | Redeploy | ⬜ | |
| 5.6 | Verify the footer/contact page shows the new email | ⬜ | |

**Time estimate:** 10 minutes
**Impact:** Support goes from 5/10 to 6/10. Professional appearance.

---

## 6. Google Search Console

**Why:** Know if anyone can actually find you in search.

| # | Action | Status | Notes |
|---|---|---|---|
| 6.1 | Go to https://search.google.com/search-console | ⬜ | |
| 6.2 | Add property → URL prefix → your domain | ⬜ | |
| 6.3 | Verify ownership (usually HTML meta tag or DNS TXT record) | ⬜ | |
| 6.4 | Submit sitemap URL: `https://[your-domain]/sitemap.xml` | ⬜ | |
| 6.5 | Check back in 1 week for initial crawl data | ⬜ | |

**Time estimate:** 10 minutes
**Impact:** SEO goes from 6/10 to 7/10. Visibility into search performance.

---

## 7. Basic Analytics

**Why:** Know if anyone visits the site at all.

| # | Action | Status | Notes |
|---|---|---|---|
| 7.1 | Vercel Analytics is built-in — enable it: Project → Analytics → Enable | ⬜ | Free on Hobby plan |
| 7.2 | Or: set up Google Analytics (GA4) — create property, add measurement ID | ⬜ | Alternative |
| 7.3 | Verify pageview data appears after 24h | ⬜ | |

**Time estimate:** 5 minutes
**Impact:** Monitoring goes from 3/10 to 5/10.

---

## Priority Order

Do these in order. Each one unlocks the next level.

| Priority | Item | Time | Unlocks |
|---|---|---|---|
| 1 | Sentry (#1) | 15 min | Error visibility |
| 2 | Support email (#5) | 10 min | Professional appearance |
| 3 | Calendar link (#4) | 10 min | Demo booking |
| 4 | Analytics (#7) | 5 min | Traffic visibility |
| 5 | Custom domain (#3) | 20 min + wait | Credibility |
| 6 | Google Search Console (#6) | 10 min | SEO visibility |
| 7 | Stripe live (#2) | 60 min + wait | Revenue capability |

**Total hands-on time: ~2 hours.** Stripe verification may add 1–2 business days of waiting.

---

## Verification After All Items Complete

Once everything above is done, verify:

- [ ] Visit your custom domain → site loads with SSL
- [ ] Trigger a JS error → Sentry alert received
- [ ] Send test email to support address → arrives in your inbox
- [ ] Click calendar link → can book a slot
- [ ] Visit `/admin/payments/live-readiness` → all green
- [ ] Google Search Console → sitemap submitted, no errors
- [ ] Vercel Analytics → shows pageviews
- [ ] Footer shows correct support email and mailing address
