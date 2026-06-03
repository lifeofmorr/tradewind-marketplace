# Inbound Pipeline Operations

TradeWind Marketplace — https://tradewind-marketplace.vercel.app
Support: don@lifeofmorr.com

---

## Inbound Channels

### 1. Beta Requests
- **Entry Point:** /beta page
- **Destination:** `site_events` table (`event_type: request_beta_click`)
- **Admin Review:** /admin/beta-inbox

### 2. Feedback
- **Entry Point:** /feedback page
- **Destination:** `site_events` table (`event_type: feedback_submitted`)
- **Attribution:** Tracked
- **Admin Review:** /admin/beta-inbox

### 3. Contact
- **Entry Point:** /contact page
- **Destination:** Email to don@lifeofmorr.com
- **Notes:** Simple email link, no form submission to database

### 4. Support
- **Entry Point:** /support page
- **Destination:** Email to don@lifeofmorr.com
- **Notes:** Lists issue categories and response times

### 5. Listing Inquiries
- **Entry Point:** InquiryForm component on listing detail pages
- **Destination:** `conversations` / `messages` tables
- **Notes:** Buyer-to-seller messaging

### 6. Dealer Onboarding
- **Entry Point:** /signup?role=dealer -> /onboarding/dealer
- **Destination:** `dealers` table
- **Notes:** Multi-step onboarding with subscription selection

### 7. Service Provider Onboarding
- **Entry Point:** /signup?role=service_provider -> /onboarding/service-provider
- **Destination:** `service_providers` table

### 8. Broker/Partner Inquiries
- **Entry Point:** /contact or /dealers-info
- **Destination:** Email
- **Notes:** No dedicated form

### 9. Aircraft Inquiries
- **Entry Point:** Aircraft-specific inquiry forms, pre-buy requests
- **Destination:** `conversations` / `messages` + `service_requests` tables

### 10. Concierge Requests
- **Entry Point:** /concierge
- **Destination:** `service_requests` table (`type: concierge`)
- **Notes:** AI intake chat assistant

### 11. Service Requests
- **Entry Point:** /financing, /insurance, /inspections, /transport
- **Destination:** `service_requests` table
- **Admin Review:** /admin/requests

---

## Pipeline Processing

### site_events
- Fire-and-forget event logging
- Admin reads via SQL or /admin/beta-inbox
- No automated follow-up workflow

### service_requests
- Admin reviews at /admin/requests
- Can approve, reject, or assign to a service provider
- Status tracked through lifecycle

### conversations
- Buyer-seller direct messaging
- No admin intervention unless flagged
- Messages stored in `messages` table linked to `conversations`

### outreach_leads
- Tracked in /admin/outreach
- Follow-up automation for lead nurturing
- Admin manages outreach campaign sequences

---

## Daily Pipeline Review

1. Check /admin/beta-inbox for new feedback
2. Check /admin/requests for new service requests
3. Check /admin/listings for pending review listings
4. Check email (don@lifeofmorr.com) for contact/support inquiries
5. Check /admin/outreach for follow-up queue
