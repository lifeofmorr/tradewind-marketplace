# Live Operations Manual

TradeWind Marketplace — https://tradewind-marketplace.vercel.app
Support: don@lifeofmorr.com

---

## Daily Operations

1. **Check admin dashboard** (/admin) for overview metrics
2. **Review pending listings** (/admin/listings) — approve or reject
3. **Review beta inbox** (/admin/beta-inbox) — respond to feedback
4. **Review service requests** (/admin/requests) — triage and route
5. **Check fraud alerts** (/admin/fraud) — investigate flagged items
6. **Monitor payments** (/admin/payments) — check for failed charges
7. **Process outreach follow-ups** (/admin/outreach) — send scheduled messages
8. **Respond to support emails** (don@lifeofmorr.com)

---

## Weekly Operations

1. **Review analytics:** site_events funnel data, conversion rates
2. **Review Stripe dashboard:** revenue, subscriptions, chargebacks
3. **Review Supabase dashboard:** database health, storage usage, edge function errors
4. **Review Vercel dashboard:** deployment health, function invocations
5. **Write/publish blog post** or market report if content ready
6. **Review outreach campaign performance**
7. **Update demo listings** if needed (refresh photos, descriptions)

---

## Emergency Operations

### 1. Site Down
- Check Vercel status (https://www.vercel-status.com/)
- Check Supabase status (https://status.supabase.com/)
- Rollback deployment if needed via Vercel dashboard
- Notify users via email if extended outage

### 2. Payment Failure
- Check Stripe dashboard for failed charges
- Check edge function logs in Supabase
- Notify affected user with explanation and timeline
- Retry or manually process if appropriate

### 3. Security Incident
- Freeze deployments immediately
- Review RLS policies in Supabase
- Check for data exposure via access logs
- Notify affected users
- Document incident timeline and remediation

### 4. Fraud Detection
- Review flagged items at /admin/fraud
- Ban user if confirmed fraud
- Remove associated listings
- Document incident for records

### 5. Data Breach
- Follow incident response plan (see INCIDENT_RESPONSE_PLAN.md)
- Notify affected users within 72 hours
- Review access logs and identify scope
- Engage legal counsel if necessary
- File required regulatory notifications
