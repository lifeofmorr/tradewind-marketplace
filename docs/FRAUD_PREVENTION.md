# Fraud Prevention

How TradeWind protects buyers, sellers, and partners during the private beta.

## Layers of defense

### 1. Reporting (live)

Every listing, dealer, and service-provider page has a `ReportButton`. Reports
land in `fraud_flags` with a severity (`low`–`critical`) and the reporter's
context. Admin reviewers triage in `/admin/fraud`.

### 2. AI fraud screening (edge function)

The `fraud-check` edge function runs on listing publish:
- Scans title + description for known scam phrases (off-platform contact,
  wire-only, unrealistic price)
- Cross-references VIN/HIN against duplicate-listing database
- Flags listings whose price is &gt;40% below the market median for that
  category and year
- Outputs to `ai_logs` (workflow=`fraud_check`) and inserts a `fraud_flags`
  row when severity ≥ medium

### 3. Demo listing warnings

Listings with `is_demo=true` render a yellow banner on the detail page and a
"Demo" badge in cards. Buyers cannot send inquiries on demo listings. This
prevents confusion during seeded-data demos and partner walkthroughs.

### 4. Off-platform payment warnings

The inquiry form, offer builder, and dealer follow-up assistant all surface a
non-binding-offer disclaimer plus a warning to never wire funds outside of
TradeWind escrow. Every transactional surface repeats this.

### 5. Admin moderation queue

`/admin/fraud` shows unresolved flags grouped by severity. Admins can:
- View the linked listing / inquiry / user
- Resolve with a note (kept on the row for audit)
- Ban the user (`profiles.banned=true`) which blocks login
- Remove the listing (`status=removed`) which immediately unlists it

### 6. `fraud_flags` schema

Every flag carries:
- Subject (`listing_id`, `user_id`, `inquiry_id` — at least one)
- Severity, reason, reporter_id (nullable for system-generated)
- Resolution audit trail (`resolved_by`, `resolved_at`, `resolution`)

## Operating cadence

- Daily: admin reviews open critical/high flags
- Weekly: ops reviews medium/low flags, checks for false-positive patterns
- Per release: fraud-keyword list updated based on the past month's incidents
