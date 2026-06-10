# Data Privacy

How TradeWind handles user data during the private beta.

## What we collect

- **Account data**: email, name, phone (optional), city/state, role
- **Profile data**: avatar, dealer/service-provider details if applicable
- **Listing data**: vehicle/boat specs, photos, location, asking price
- **Activity**: saved listings, inquiries, requests, messages, view counts
- **Payments**: Stripe customer + subscription IDs (no card numbers)
- **Logs**: AI workflow inputs/outputs (admin-only) for QA and abuse review

We do **not** collect SSN, drivers' license numbers, or background-check data.

## Where data lives

- **Database**: Supabase PostgreSQL, hosted in **us-east-1**
- **File storage**: Supabase Storage, same region
- **Auth**: Supabase Auth (JWTs)
- **Payments**: Stripe (PCI-DSS Level 1) — TradeWind never stores card or
  bank credentials
- **Email**: transactional via Supabase / Postmark — no third-party tracking
  pixels

All data in transit uses TLS 1.2+. Storage encryption at rest via Supabase
defaults.

## PII minimization

- Buyer phone numbers are optional everywhere except concierge intake
- Inquiry emails surface to the seller only after the buyer sends a message
- Demo / seeded users carry fake names and never link to real accounts
- Photos uploaded to listings are EXIF-stripped (GPS coordinates removed) at
  ingest time

## Data deletion

A user can request account deletion by emailing **privacy@gotradewind.com**.
We will:
1. Acknowledge within 3 business days
2. Anonymize the user's profile (replace name/email with `deleted-user-{id}`)
3. Retain inquiries and offers for the counterparty's audit needs but strip
   PII from buyer-side rows
4. Confirm completion within 30 days

A self-serve deletion flow is on the roadmap for the public launch.

## CCPA / GDPR readiness

The private beta is invite-only and US-resident only, so CCPA applies for CA
users. We honor the four CCPA rights (know, delete, opt-out of sale,
non-discrimination). We **do not sell** user data.

GDPR readiness work scheduled for public launch:
- DPA with sub-processors (Supabase, Stripe, Postmark) — drafts in legal
  review
- Cookie consent banner for EU traffic
- Data Subject Access Request (DSAR) self-service portal
- DPO contact in privacy policy

Questions: **privacy@gotradewind.com**.
