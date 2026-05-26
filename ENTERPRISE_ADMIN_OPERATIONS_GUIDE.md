# Enterprise Admin Operations Guide — TradeWind

**Last reviewed:** 2026-05-26
**Audience:** TradeWind admins (`profiles.role = 'admin'`)

This is the day-to-day playbook for running TradeWind from the admin surfaces at `/admin/*`. Every action documented here is audit-logged via `src/lib/audit.ts`.

## Admin pages

| Route | Component | Purpose |
|---|---|---|
| `/admin` | `AdminDashboard.tsx` | KPIs, today's queue depths |
| `/admin/listings` | `AdminListings.tsx` | Approve / reject / re-list / remove listings |
| `/admin/auctions` | `AdminAuctions.tsx` | Watch live auctions, end manually |
| `/admin/users` | `AdminUsers.tsx` | Search users, change role, ban/unban |
| `/admin/requests` | `AdminRequests.tsx` | Financing / insurance / inspection / transport / concierge intake |
| `/admin/fraud` | `AdminFraud.tsx` | Triage `fraud_flags`, `reports` |
| `/admin/payments` | `AdminPayments.tsx` | View payments, subscriptions, refunds |
| `/admin/content` | `AdminContent.tsx` | Moderate community posts, comments |
| `/admin/blog` | `AdminBlog.tsx` | Author and publish blog posts |
| `/admin/market-reports` | `AdminMarketReports.tsx` | Publish market reports |

All routes are gated by `<ProtectedRoute roles={["admin"]}>` and RLS — even with the URL, a non-admin sees an empty data set.

---

## 1. Listing approval / rejection

**Where:** `/admin/listings`

**Workflow:**
1. New listings land with `status = 'pending_review'`.
2. Admin reads the listing detail in-row, including AI summary, deal score, and any flagged signals.
3. Click **Approve** → sets `status = 'active'`, sets `published_at`, fires `listing_approved` email.
4. Click **Reject** → prompts for `rejection_reason` → sets `status = 'rejected'`.
5. Click **Remove** (for live listing) → sets `status = 'removed'`, sets `removed_at`.

**Audit:** every status change inserts an `audit_logs` row with `action = 'listing_status_change'`, `target_id = listing.id`, `metadata = { from, to, reason }`.

---

## 2. Demo vs real inventory

**Where:** `/admin/listings`

- Filter pill: **Demo / Real / All**.
- Demo listings are flagged `is_demo = true` and surfaced with a visible "Demo" pill on the public UI.
- Never delete demo listings — they are seed/showcase data for sales demos.
- To re-flag a real listing as demo (rare): toggle `is_demo` in the row.

---

## 3. Payments

**Where:** `/admin/payments`

- View: all `payments` rows with status, amount, kind, user, linked listing/dealer/sp.
- **Refund:** open the Stripe Dashboard from the row's external link, issue refund there. Webhook updates `payments.status = 'refunded'`. If webhook fails, admin can manually patch the row.
- **Failed payment investigation:** Stripe Dashboard event log → check `payment_intent` ID → cross-ref with `payments.stripe_payment_intent_id`.

---

## 4. Subscriptions

**Where:** `/admin/payments` (Subscriptions tab) + Stripe Customer Portal

- Dealer / service-provider subs are mirrored on the `subscriptions` table and on `dealers.subscription_*` / `service_providers.subscription_*`.
- **Cancel a sub on behalf of a customer:** preferred path is to send them the Customer Portal URL. Admin override is via Stripe Dashboard; the webhook syncs the cancellation back.
- **Comp a free month:** apply a 100% off coupon in Stripe; subscription_status remains `active`.

---

## 5. Partner requests

**Where:** `/admin/requests`

- Tabs: `Financing / Insurance / Inspections / Transport / Concierge`.
- Each request lives in its own table (`financing_requests`, etc.), RLS-restricted.
- Workflow per row: triage → assign partner → mark `quoted` / `completed` / `canceled`.
- For aviation: `aircraft_prebuy_requests` lives separately.
- `partner_quote_requests` is the unified hand-off table; the legacy per-type tables are kept for historical context.

---

## 6. Fraud reports

**Where:** `/admin/fraud`

- `fraud_flags` table: AI-screened inquiries with severity ≥ `high`.
- `reports` table: user-reported listings, posts, messages.
- Workflow:
  1. Open the flag/report → see signals + target.
  2. Click the target (listing/post/user) — view in context.
  3. Decide: dismiss / warn user / remove content / ban user.
- All actions audit-logged.

---

## 7. Ban / unban users

**Where:** `/admin/users`

**Banning:**
1. Search by email or name.
2. Open user → click **Ban** → confirm.
3. Trigger sets `profiles.banned = true`.
4. Effect: `ProtectedRoute` redirects banned user to `/` on next request; their existing session is invalidated on next auth event.
5. `audit_logs` row: `action = 'user_banned'`, `target_id = user.id`, `metadata = { reason }`.

**Unbanning:** same flow, click **Unban**.

> **Role escalation safety:** admin can change another user's role and ban state. The `profiles_guard_admin_fields` trigger blocks self-modification by non-admins, but admins can grant role normally. Audit log captures every change.

---

## 8. Audit logs

**Where:** Supabase Dashboard SQL editor (no admin UI page yet)

```sql
-- Today's admin actions
select created_at, actor_id, action, target_type, target_id, metadata
from audit_logs
where created_at >= current_date
order by created_at desc;

-- Find all role escalations
select * from audit_logs where action = 'role_change';

-- Find all bans this week
select * from audit_logs
where action = 'user_banned'
  and created_at >= now() - interval '7 days';
```

RLS: read access restricted to admins.

---

## 9. Community moderation

**Where:** `/admin/content`

- Lists recent `community_posts` and `community_comments`.
- Filter by `reports` count.
- Actions: **Hide** (admin-only view of hidden posts), **Delete**, **Warn user**, **Ban user**.
- Audit-logged.

---

## 10. Integration requests

**Where:** `/admin/requests` → Integrations tab

- `integration_requests` table — developer hub submissions.
- Workflow: triage → respond via email → mark `approved` / `rejected`.
- Auto-respond template lives in `send-email` fn.

---

## 11. Data deletion requests

**Where:** `/admin/requests` → Data Deletion tab

- `data_deletion_requests` table (`20260430_ecosystem.sql`).
- SLA: process within 30 days (GDPR-style).
- Workflow:
  1. Verify identity via email reply-to.
  2. Export user data (if requested for portability).
  3. Run delete-cascade SQL:
     ```sql
     -- delete user-scoped rows; profile last
     delete from saved_listings where user_id = $1;
     delete from inquiries where user_id = $1;
     -- ... per request
     delete from profiles where id = $1;
     delete from auth.users where id = $1;
     ```
  4. Mark request as `processed` with `processed_at`.
  5. Email user confirmation.
  6. Audit log entry.

---

## 12. Aircraft reports

**Where:** `/admin/listings` filtered to aviation categories + `aircraft_prebuy_requests` in `/admin/requests`

- Aircraft listings get extra fields via `aircraft_specs` (joined on `listing_id`).
- Prebuy requests are routed to A&P / IA partners.
- Safety disclaimer audit: confirm `aviationSafety.ts` advice is present on all aircraft listing pages.

---

## 13. Concierge

**Where:** `/admin/requests` → Concierge tab

- `concierge_requests` table — buyer-paid white-glove service.
- Triggered by Stripe checkout (`kind = "concierge"`) which sets `paid = true`.
- Admin manually assigns a concierge owner, tracks status to `completed`.

---

## 14. Disputes

**Stripe disputes:**
1. Webhook fires `charge.dispute.created` → admin email alert.
2. Admin gathers evidence: listing screenshots, message history (`messages`), audit log entries, payment row.
3. Submit evidence in Stripe Dashboard.
4. Track outcome via webhook → `payments.metadata`.

**User-to-user disputes (inquiries / sales):**
1. Either party emails support → triage into `reports` table.
2. Admin reviews `messages`, listing, and payment context.
3. Decision: mediate, refund (above), ban, or no-action.
4. Audit log entry.

---

## Daily admin checklist (15 min)

- [ ] `/admin` dashboard — read KPI tiles.
- [ ] Check pending-review listing count → process FIFO.
- [ ] Check fraud queue → triage high-severity first.
- [ ] Skim audit log for unusual admin actions.
- [ ] Stripe Dashboard → failed payments, disputes.
- [ ] Supabase Dashboard → fn error rate, DB CPU.
- [ ] Email inbox: support@gotradewind.com.

## Weekly admin checklist

- [ ] Run quarterly compliance metric query (count of audit events, deletion requests SLA).
- [ ] Review subscription cancel-reason distribution.
- [ ] Confirm webhook delivery success rate ≥ 99.5%.
- [ ] Skim community posts for moderation drift.
- [ ] Verify `pg_dump` backup ran (see `BACKUP_RECOVERY_PLAN.md`).
