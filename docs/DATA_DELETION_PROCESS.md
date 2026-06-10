# Data Deletion Process

TradeWind Marketplace — https://tradewind-marketplace.vercel.app
Support: don@lifeofmorr.com

---

## Request Channels

1. **/delete-my-data form** (DataDeletion page) — submits to Supabase
2. **Email** to don@lifeofmorr.com
3. **In-app account deletion** (future -- from dashboard settings)

---

## Process

### 1. Receive Request
- Acknowledge within 48 hours

### 2. Verify Identity
- Confirm email matches account on file
- If request via email, verify sender address matches registered account

### 3. Scope Deletion

**Data to delete:**
- Profile data (name, email, phone, avatar)
- Listings (all drafts, active, and sold)
- Listing photos (Supabase storage)
- Conversations and messages
- Saved listings / watchlist
- Reviews written by user
- Service requests submitted
- Site events / tracking data

**Data to retain (anonymized):**
- Payment/transaction records (legal requirement)
- Fraud flags (security requirement)
- Aggregated analytics (no PII)

### 4. Execute Deletion
- Delete via Supabase admin dashboard or SQL
- Remove photos from Supabase storage buckets
- Anonymize retained records (replace PII with placeholder values)

### 5. Confirm Completion
- Confirm to user within 30 days of request
- Document the deletion in admin audit log

---

## GDPR/CCPA Notes

- TradeWind does not operate in EU yet -- GDPR compliance is optional but followed as good practice
- CCPA applies if California users exist
- Right to deletion honored regardless of jurisdiction
- Right to data export: admin can export user data from Supabase on request
