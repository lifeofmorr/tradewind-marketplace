# Support Runbook — TradeWind

**Last reviewed:** 2026-05-26
**Audience:** TradeWind admin operators (currently the founder + delegated admins).
**Inbox:** support@gotradewind.com

This runbook is the second-line guide. First line is `BUG_TRIAGE_PROCESS.md` for triage; this document covers **resolution actions**.

## Severity & response

| Sev | Definition | Response | Resolution |
|---|---|---|---|
| P0 | Production down, can't sign in, can't check out, data loss | < 30 min | < 2 h |
| P1 | Feature broken for many | < 4 h | < 24 h |
| P2 | Single user, workaround exists | 1 business day | next release |
| P3 | Cosmetic / nice-to-have | 3 business days | backlog |

## Quick links

- Admin dashboard: https://tradewind-marketplace.vercel.app/admin
- Supabase: https://supabase.com/dashboard/project/qwaotydaazymgnvnfuuj
- Stripe: https://dashboard.stripe.com
- Anthropic: https://console.anthropic.com
- Resend: https://resend.com
- Vercel: https://vercel.com/dashboard

## Common scenarios

### 1. "I can't sign in"

1. Confirm email + password format in support reply.
2. Check `auth.users` row exists for that email.
3. Check `profiles.banned` — if true, explain why or unban.
4. Trigger password reset link via Supabase Dashboard if needed.
5. If reset email never arrives → check Resend dashboard for bounces.

### 2. "I never got the verification email"

1. Resend from Supabase Dashboard → Authentication → user → "Resend invitation".
2. If still missing → check `RESEND_FROM` is on a verified domain.
3. As fallback, manually confirm user in Supabase Dashboard.

### 3. "My listing was rejected — why?"

1. Look up listing: `select rejection_reason from listings where id = $1`.
2. Quote the reason. Suggest fix.
3. If admin error, set `status = 'pending_review'`, clear `rejection_reason`, re-approve.

### 4. "I was charged but no benefit applied" (Stripe race)

1. Stripe Dashboard → find session id → confirm payment completed.
2. Supabase: `select * from payments where stripe_session_id = $1`.
3. If payment row exists but downstream effect didn't fire → run the missing update by hand (e.g. set `is_featured=true`, `featured_until`).
4. Audit log: `action = 'manual_payment_fixup'`, metadata `{ session_id, reason }`.
5. If payment row missing → webhook lost; check Stripe Dashboard event delivery, replay if available.

### 5. "I want a refund"

See `PAYMENT_PRODUCTION_READINESS.md` §5 — refunds happen in Stripe Dashboard. Update `payments.status = 'refunded'` if webhook lags.

### 6. "I want my data deleted"

Direct user to `/delete-my-data` form. Process per `ENTERPRISE_ADMIN_OPERATIONS_GUIDE.md` §11.

### 7. "I got a suspicious inquiry"

1. Check `fraud_flags` — was it AI-flagged?
2. If real fraud → ban inquirer, hide their other messages, audit-log.
3. Email seller with safety reminders + offer assistance.

### 8. "AI fraud false-positive blocked my real inquiry"

1. Pull the `inquiries` row + `fraud_flags` if present.
2. If clearly legit → manually flip the inquiry to `status = 'new'`, set `metadata.manual_clear = true`.
3. Email seller + buyer that the inquiry went through.
4. Tune the AI prompt if pattern repeats (PR + deploy).

### 9. "The site is slow"

1. Vercel analytics → check recent edge response times.
2. Supabase dashboard → DB CPU + connection count.
3. If high → identify hot query via `pg_stat_statements`.
4. If page-specific → identify with browser DevTools waterfall.
5. Communicate to user, queue a perf fix.

### 10. "Stripe webhook is failing"

1. Stripe Dashboard → Developers → Webhooks → endpoint → view recent deliveries.
2. Inspect failing event payload.
3. Tail Supabase fn logs: `supabase functions logs stripe-webhook --linked`.
4. Common causes: missing `STRIPE_WEBHOOK_SECRET` rotation, payload signature drift, DB write timeout.
5. **Never disable signature verify as a "fix"** — investigate root cause.

### 11. "Plaid bank link isn't working"

1. Check Supabase fn logs for `plaid-link`.
2. If sandbox mode (`PLAID_CLIENT_ID` unset), expect the sandbox stub.
3. For production: verify `PLAID_ENV=production`, credentials live, customer not in a Plaid down window.

### 12. "I lost access to my dealership"

1. Verify identity via support email reply-chain.
2. `select * from dealer_staff where user_id = $1` — confirm membership.
3. If admin error, restore membership row.
4. If dealer owner lost access → escalate; identity verification is critical.

## Incident response

Severity P0/P1 → follow `INCIDENT_RESPONSE_PLAN.md`. Key steps:

1. **Acknowledge** publicly within 15 min (Trust Center status note).
2. **Triage**: data integrity → availability → cosmetic.
3. **Mitigate**: rollback (see `ROLLBACK_PLAN.md`) or feature flag.
4. **Communicate**: hourly updates on `/trust`.
5. **Post-mortem** within 5 business days.

## Owners

| Domain | Owner | Backup |
|---|---|---|
| Code / deploys | founder | — |
| Database | founder | — |
| Stripe | founder | — |
| Vendor escalations | founder | — |
| Customer comms | founder | — |

When team > 1, update this table and define a rotation.

## Daily admin login (5 min)

- [ ] Open `/admin` → scan KPI tiles.
- [ ] Open Stripe Dashboard → failed payments + disputes.
- [ ] Open support@ inbox.
- [ ] Open Supabase fn error tab.

## Weekly admin review (30 min)

- [ ] Refund + dispute totals.
- [ ] Pending-review backlog.
- [ ] Audit log skim.
- [ ] Webhook delivery success rate.
- [ ] AI cost rollup (see `OBSERVABILITY_PLAN.md` query).
