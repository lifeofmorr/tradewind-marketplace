# TradeWind Marketplace — Live Monitoring Plan

Production monitoring systems for https://tradewind-marketplace.vercel.app (React/Vite + Supabase + Stripe).

---

## site_events Table

Anonymous insert RLS policy allows public writes; only admin roles can read. All client-side analytics flow through this single table.

**Event types tracked:**

| Event | Trigger |
|---|---|
| `beta_page_view` | /beta page mount |
| `request_beta_click` | Beta CTA button click |
| `feedback_submit` | Feedback form submission initiated |
| `feedback_submitted` | Feedback form submission confirmed |
| `book_call_click` | Calendly booking link click |
| `listing_detail_view` | Aircraft listing detail page view |
| `contact_form_submit` | Contact form submission |
| `support_page_view` | /support page mount |
| `dealer_cta_click` | Dealer signup/pricing CTA click |
| `service_cta_click` | Service provider signup CTA click |
| `aircraft_cta_click` | Aircraft-specific action CTA click |
| `pricing_page_view` | /pricing page mount |
| `payment_attempt` | Checkout flow initiated |
| `payment_complete` | Checkout success confirmed |

**Metadata includes:** UTM attribution (source, medium, campaign, term, content), session_id, lead_id.

**Admin access:** Query via Supabase dashboard SQL editor or the /admin/beta-inbox interface.

---

## beta_feedback

- Submissions originate from the /feedback page.
- Admin review happens in /admin/beta-inbox with full attribution tracking.
- Pipeline stages support lead management workflows (tracking progression from submission through follow-up).

---

## outreach

- **outreach_leads** and **outreach_campaigns** tables store lead and campaign data.
- Follow-up automation handled via Supabase edge functions.
- Admin dashboard at /admin/outreach for campaign management and lead status.

---

## Payment Webhook Logs

- Stripe webhook events are processed by a Supabase edge function.
- Payment records are stored in the `payments` table.
- Admin monitoring available at /admin/payments.
- Webhook signature verification ensures event authenticity.

---

## AI Errors

- Edge function invocations for AI workflows (listing descriptions, search, etc.) may fail.
- Currently logged to edge function logs, viewable in the Supabase dashboard.
- No client-side error aggregation beyond browser console.
- No structured alerting on AI failures at this time.

---

## Admin Notifications

Migration `20260528_admin_notifications.sql` defines the notification system.

**Notification types:**

- New listing pending review
- New user signup
- Payment received
- Fraud flag triggered
- Support request
- Beta feedback submitted

---

## Sentry Setup

- `VITE_SENTRY_DSN` env var exists but is currently empty.
- `telemetry.ts` has Sentry integration code prepared and ready to activate.
- **To enable:** Set `VITE_SENTRY_DSN` in Vercel environment variables to a valid Sentry DSN.
- **Skip if no Sentry account** — this is not blocking for beta launch.

Once enabled, Sentry will capture:
- Unhandled exceptions
- Console errors
- Performance traces
- Source maps for readable stack traces (requires uploading source maps during build)

---

## What to Monitor Daily

1. **site_events** — New beta signups, feedback submissions, CTA click volume.
2. **Admin dashboard** — Pending listings, unread feedback, fraud alerts.
3. **Stripe dashboard** — Payment activity, failed charges, disputes.
4. **Vercel** — Deployment status, function logs, errors.
5. **Supabase** — Edge function logs, database health, storage usage.

---

## Alert Thresholds (Manual Until Sentry)

| Condition | Response Time |
|---|---|
| Any payment failure | Check immediately |
| Any fraud flag | Review within 4 hours |
| Site down | Vercel status page + manual check |
| Database error spike | Check Supabase dashboard |
| Edge function failure rate > 5% | Investigate within 1 hour |
| Unusual traffic spike | Verify not abuse, check rate limits |

---

## Escalation Path

1. Check Vercel deployment logs for build/runtime errors.
2. Check Supabase dashboard for edge function failures and database issues.
3. Check Stripe dashboard for payment and webhook issues.
4. If Sentry is enabled, review error groupings and stack traces.
5. For persistent issues, check Supabase connection pool and rate limits.
