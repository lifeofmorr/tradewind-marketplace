# TradeWind Marketplace — Live Funnel Tracking

Conversion funnel event tracking for https://tradewind-marketplace.vercel.app. All events flow through `trackEvent()` into the `site_events` table in Supabase.

---

## Top of Funnel

### 1. Beta Page Views
- **Event:** `trackEvent('beta_page_view')`
- **Trigger:** /beta page mount
- **Data captured:** Attribution from URL parameters, referrer, landing page

### 2. Feedback Page Views
- **Event:** Implicit via `feedback_submit` events
- **Trigger:** User reaches the /feedback page and submits
- **Note:** No standalone page view event; presence inferred from submission events

### 3. Listing Detail Views
- **Event:** `trackEvent('listing_detail_view')`
- **Trigger:** Aircraft listing detail page view
- **Data captured:** Listing metadata (aircraft type, price range, listing ID)

---

## Mid Funnel

### 4. Request Beta Click
- **Event:** `trackEvent('request_beta_click')`
- **Trigger:** Beta CTA button click
- **Indicates:** Active interest in beta program access

### 5. Feedback Submissions
- **Event:** `trackEvent('feedback_submitted')`
- **Trigger:** Feedback form submission confirmed
- **Data captured:** Full form data + attribution context

### 6. Book Call Click
- **Event:** `trackEvent('book_call_click')`
- **Trigger:** Calendly booking link click
- **Indicates:** High-intent lead ready for direct conversation

### 7. Contact Form Submit
- **Event:** `trackEvent('contact_form_submit')`
- **Trigger:** Contact form submission
- **Indicates:** General inquiry or support request

### 8. Support Page View
- **Event:** `trackEvent('support_page_view')`
- **Trigger:** /support page mount
- **Indicates:** User seeking help or information

---

## Bottom Funnel

### 9. Dealer CTA Click
- **Event:** `trackEvent('dealer_cta_click')`
- **Trigger:** Dealer signup or pricing CTA click
- **Indicates:** Dealer considering platform subscription

### 10. Service CTA Click
- **Event:** `trackEvent('service_cta_click')`
- **Trigger:** Service provider signup CTA click
- **Indicates:** Service provider evaluating platform

### 11. Aircraft CTA Click
- **Event:** `trackEvent('aircraft_cta_click')`
- **Trigger:** Aircraft-specific action CTA click
- **Indicates:** Buyer or seller taking action on a specific listing

### 12. Pricing Page View
- **Event:** `trackEvent('pricing_page_view')`
- **Trigger:** /pricing page mount
- **Indicates:** Active evaluation of paid plans

### 13. Payment Attempt
- **Event:** `trackEvent('payment_attempt')`
- **Trigger:** Checkout flow initiated
- **Indicates:** Conversion in progress

### 14. Payment Complete
- **Event:** `trackEvent('payment_complete')`
- **Trigger:** Checkout success confirmed
- **Indicates:** Conversion achieved

---

## Attribution

All events are enriched with attribution data before insert into `site_events`.

### UTM Parameters
- `utm_source` — Traffic source (e.g., google, linkedin, newsletter)
- `utm_medium` — Marketing medium (e.g., cpc, email, social)
- `utm_campaign` — Campaign name
- `utm_term` — Paid search keyword
- `utm_content` — Ad variant or content identifier

### Additional Attribution
- `lead_id` — From outreach links, ties events to specific outreach leads
- `referrer` — HTTP referrer captured on page load
- `landing_page` — First page visited in the session

### Persistence
- Attribution data is persisted in `sessionStorage` across page navigation.
- Once captured from URL parameters on landing, attribution follows the user through the entire session.
- All subsequent events inherit the original attribution context.

---

## Querying Funnel Data

### Event Volume by Type
```sql
SELECT event_type, count(*)
FROM site_events
GROUP BY event_type
ORDER BY count(*) DESC;
```

### Events in Last 7 Days
```sql
SELECT event_type, count(*)
FROM site_events
WHERE created_at > now() - interval '7 days'
GROUP BY event_type
ORDER BY count(*) DESC;
```

### Filter by Campaign
```sql
SELECT event_type, count(*)
FROM site_events
WHERE metadata->>'utm_campaign' = 'campaign_name'
GROUP BY event_type;
```

### Daily Funnel by Source
```sql
SELECT
  date_trunc('day', created_at) AS day,
  metadata->>'utm_source' AS source,
  event_type,
  count(*)
FROM site_events
WHERE created_at > now() - interval '30 days'
GROUP BY day, source, event_type
ORDER BY day DESC, count(*) DESC;
```

### Conversion Path for a Session
```sql
SELECT event_type, created_at, metadata
FROM site_events
WHERE metadata->>'session_id' = 'SESSION_ID_HERE'
ORDER BY created_at;
```

### Admin Access
- Supabase dashboard SQL editor for ad-hoc queries
- /admin/beta-inbox for feedback review and lead management

---

## Not Yet Tracked (Future Enhancement)

- **Signup completion rate** — track each step of the signup flow
- **Listing creation funnel** — start, draft, submit, approved stages
- **Search-to-view conversion** — how many searches lead to listing detail views
- **Time on listing page** — engagement depth metric
- **Return visitor frequency** — repeat visit tracking across sessions
