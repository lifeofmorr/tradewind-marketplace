# Real Listing Onboarding Process

> How TradeWind transitions from demo-only inventory to real seller listings.

---

## Rules for Real Listings

1. **Admin permission required.** No listing goes live without admin approval. The listing status workflow enforces this at the database level — there is no path from `draft` to `active` that bypasses `pending_review`.

2. **Admin review before publishing.** Every submitted listing lands in `/admin/listings` for manual review. Admin sets status to `active` (approved), `rejected` (with reason), or `removed` (fraud/policy violation).

3. **Clear demo vs. real labeling.** The `is_demo` boolean flag on the `listings` table (`boolean, default false`) separates demo inventory from real inventory. Demo listings display a disclaimer overlay sourced from `src/lib/demoDisclaimer.ts`:
   - Card tooltip: "Demo listing — used to preview the TradeWind marketplace experience. Not represented as available inventory."
   - Detail page: title "Demo listing" with body "Used to preview the TradeWind marketplace experience. Not represented as available inventory."

---

## Listing Status Workflow

```
draft → pending_review → active → sold / expired / archived
                       ↘ rejected (with reason)
                       ↘ removed (fraud / policy violation)
```

Database enum (`listing_status`): `draft`, `pending_review`, `active`, `sold`, `expired`, `rejected`, `removed`

| Status           | Who sets it     | What it means                                         |
| ---------------- | --------------- | ----------------------------------------------------- |
| `draft`          | Seller          | Listing created but not submitted for review          |
| `pending_review` | Seller (submit) | Seller clicked "Submit for Review" — awaiting admin   |
| `active`         | Admin           | Approved and publicly visible on the marketplace      |
| `sold`           | Seller or Admin | Transaction completed                                 |
| `expired`        | System          | Listing passed its `expires_at` date                  |
| `rejected`       | Admin           | Did not pass review; `rejection_reason` is set        |
| `removed`        | Admin           | Removed for fraud, policy violation, or seller request |

Key listing fields that track the review lifecycle:
- `rejection_reason` (text) — admin-supplied reason when rejecting
- `reviewed_by` (uuid) — admin who reviewed the listing
- `reviewed_at` (timestamptz) — when the review decision was made
- `published_at` (timestamptz) — when the listing went active

---

## Admin Workflow

1. **Listing submitted:** Seller changes status from `draft` to `pending_review`.
2. **Admin reviews in `/admin/listings`:** Admin-only route (protected by `ProtectedRoute` with `roles={["admin"]}`).
3. **Admin actions:**
   - **Approve** — sets status to `active`, sets `published_at`, sets `reviewed_by` and `reviewed_at`. Listing appears in public search results.
   - **Reject** — sets status to `rejected`, records `rejection_reason`. Seller sees the reason and can edit and resubmit.
   - **Archive / Remove** — sets status to `removed`, sets `removed_at`. Used for policy violations, seller requests, or stale listings.
   - **Report for fraud** — creates a row in `fraud_flags` table with severity level and reason. Admin fraud dashboard at `/admin/fraud` tracks open flags.
4. **Audit trail:** All admin actions log to `audit_logs` table via `logAuditEvent()` in `src/lib/audit.ts`. RLS: any authenticated user can insert; only admins can read.

---

## Intake Checklist for Real Listings

Before approving a listing, the admin verifies:

- [ ] **Seller owns or is authorized to sell the asset** — seller account is authenticated; if dealer, `dealer_id` links to a verified dealer entity
- [ ] **Photos depict the actual unit** (not stock photos) — demo listings use Unsplash stock photos via `demoMediaMap.ts`; real listings must have original seller-provided photos
- [ ] **HIN/VIN/N-number provided where applicable** — `vin_or_hin` field on listings; `registration_number` / `n_number` on `aircraft_specs` for aviation
- [ ] **Price is in USD and reflects actual asking price** — `price_cents` field, `currency` defaults to `USD`
- [ ] **Category correctly selected** — one of the 22 `ListingCategory` enum values (boats, cars, aircraft, etc.)
- [ ] **Description is accurate** — AI-generated descriptions (`ai_summary`) get human review; description should match the actual asset
- [ ] **No prohibited items** — no weapons, stolen property, recalled items, or anything violating Terms of Service
- [ ] **Seller agrees to Terms of Service** — account creation implies ToS acceptance (see `/terms` page)

---

## How Demo Listings Are Different

| Aspect              | Demo Listing                          | Real Listing                        |
| ------------------- | ------------------------------------- | ----------------------------------- |
| `is_demo` flag      | `true`                                | `false`                             |
| Photos              | Unsplash stock photos (`demoMediaMap.ts`, `source-match-demo-photos.sql`) | Seller-provided originals |
| Disclaimer          | Overlay badge: "Demo listing"         | No overlay                          |
| Inquiry forms       | Still functional (for testing)        | Routed to actual seller             |
| Status              | Typically `active` (seeded directly)  | Must go through `pending_review`    |
| Search visibility   | Visible but marked as demo            | Visible as real inventory           |
| Admin review        | Not required (seeded by migrations)   | Required before going active        |

Demo listings exist to preview the marketplace experience. They are populated by SQL seed files (`supabase/seed.sql`, `supabase/realistic-demo-descriptions.sql`) and use curated Unsplash photos mapped in `src/lib/demoMediaMap.ts`.

---

## First Real Listing Process

### Step 1: Seller creates account
- Seller signs up via `/signup`
- Profile created with default role `buyer`
- Role changed to `seller` (or `dealer` if dealer onboarding is complete) — role changes require admin action via `profiles_guard_admin_fields` trigger

### Step 2: Seller creates listing
- Seller navigates to listing creation (seller dashboard, requires `seller` / `dealer` / `dealer_staff` / `admin` role)
- Fills in required fields: title, category, description, price, photos, location
- Listing saved as `status = 'draft'`
- Seller can edit freely while in draft

### Step 3: Seller submits for review
- Seller clicks "Submit for Review"
- Status changes to `pending_review`
- Admin notification sent (admin notifications table, `20260528_admin_notifications.sql`)

### Step 4: Admin reviews
- Admin sees listing in `/admin/listings` queue
- Runs through intake checklist above
- AI fraud check score evaluated (`fraud_check` AI workflow in `src/lib/ai.ts`)
- Admin approves, rejects (with reason), or flags for fraud

### Step 5: Listing goes live
- On approval: status set to `active`, `published_at` set
- Listing appears in public search, category pages, and home page
- Seller notified of approval

---

## Admin Review Criteria

### Fraud Check Score
- AI fraud check runs via `ai-fraud-check` edge function (workflow type `fraud_check`)
- Returns a `FraudVerdict` with severity and reasoning
- Fraud flags stored in `fraud_flags` table with severity levels: `low`, `medium`, `high`, `critical`
- Admin fraud dashboard at `/admin/fraud` shows all open flags
- Aircraft listings get additional fraud warnings (missing logbooks, suspicious pricing, etc.)

### Photo Quality
- Minimum: photos must depict the actual asset
- No stock photos on real listings (stock photos are reserved for `is_demo = true`)
- Photos should show exterior, interior, engine bay / helm where applicable
- For aircraft: panel shots, logbook pages encouraged

### Description Accuracy
- AI-generated descriptions (`ai_summary`) must be reviewed by a human
- Claims about condition, features, and history must be verifiable
- Year, make, model must match photo evidence

### Price Reasonableness
- AI pricing estimate available via `pricing_estimate` workflow
- Deal score computed by `src/lib/dealScore.ts` — extreme outliers flagged
- Price must be in cents (`price_cents`), displayed as USD

### Asset Verification Status
- Verification requests tracked in `asset_verifications` table
- Types: `vin`, `hin`, `title`, `registration`, `lien`, `inspection`
- Statuses: `pending`, `in_progress`, `verified`, `failed`, `expired`
- Currently operates in sandbox mode (`VITE_PARTNER_API_SANDBOX=true`) — sandbox auto-verifies after 2 seconds
- RLS tightened via `20260520_tighten_asset_verifications_rls.sql`: only listing owner, active-listing viewers, and admins can see verification details
