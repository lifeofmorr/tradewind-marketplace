# Observability Plan — TradeWind

**Last reviewed:** 2026-05-26

Observability is split across three planes:

1. **Application errors** — frontend & edge functions
2. **Business events** — payments, AI calls, audit trail
3. **Infrastructure** — Vercel, Supabase, Stripe, vendor APIs

## 1. Application errors

### Frontend
- **ErrorBoundary** at top level (`src/main.tsx`) catches React render errors.
- **Per-lazy-route ErrorBoundary** via `<L>` wrapper (`src/App.tsx`).
- **Telemetry shim** at `src/lib/telemetry.ts`:
  - `initTelemetry()` called from `main.tsx`.
  - `captureException(err, ctx)` invoked from `ErrorBoundary.componentDidCatch`.
  - Reads `VITE_SENTRY_DSN`. **If DSN is absent, the module is a no-op** (build does not break).
- **To wire Sentry** (when ready):
  1. `npm i @sentry/react`
  2. Set `VITE_SENTRY_DSN` in Vercel (separate DSN per env).
  3. Uncomment the `Sentry.init` + `Sentry.captureException` calls in `telemetry.ts` (clearly marked with `// When Sentry is wired:`).
  4. Optionally enable `@sentry/react`'s `BrowserTracing` for perf.

### Edge functions
- All 17 functions use `console.error` / `console.warn`. Logs are visible in Supabase Dashboard → Functions → Logs.
- **Stripe webhook** logs:
  - signature verify failures
  - DB insert errors
  - email send failures (swallowed but logged)
- **AI fns** log token usage + provider fallback events.

To centralize: pipe edge function logs to Logflare (Supabase has a built-in connector) or stream via the Supabase Realtime channel into a long-term store.

## 2. Business events

| Event | Captured in | Schema |
|---|---|---|
| Admin action (status change, refund, role grant, ban/unban) | `audit_logs` | `actor_id`, `action`, `target_type`, `target_id`, `metadata` |
| Payment | `payments` | `user_id`, `amount_cents`, `status`, `stripe_session_id`, `stripe_payment_intent_id` |
| Subscription lifecycle | `subscriptions` | `tier`, `status`, `current_period_*`, `cancel_at_period_end` |
| Webhook receipt | `webhook_events` | dedup by `event_id` |
| AI call | `ai_logs` | `workflow`, `tokens_in`, `tokens_out`, `cost_cents` |
| Inquiry fraud verdict | `fraud_flags` (when severity ≥ high) | `severity`, `signals`, `inquiry_id` |
| User-submitted report | `reports` | `reporter_id`, `target_type`, `target_id`, `reason` |

## 3. Infrastructure dashboards

| Surface | Where | What to watch |
|---|---|---|
| Vercel | dashboard.vercel.app | Build status, deploy time, edge errors, response times |
| Supabase | dashboard.supabase.com | DB connections, query latency, fn invocations, fn errors |
| Stripe | dashboard.stripe.com | Live events, failed payments, disputes, payout schedule |
| Anthropic | console.anthropic.com | Token usage, error rate per model |
| OpenAI (fallback) | platform.openai.com | Token usage, error rate |
| Resend | resend.com | Delivery, bounce, complaint rate |
| Plaid (when live) | dashboard.plaid.com | Link success rate, errors |

## 4. Production alerting checklist

Configure (manual, in each vendor dashboard):

### Supabase
- [ ] Email alert on DB CPU > 80% for 10 min
- [ ] Email alert on fn error rate > 5% in 5 min window
- [ ] Email alert on DB connection saturation

### Vercel
- [ ] Deployment failure → email + Slack
- [ ] 500 error rate > 2% in 5 min → email

### Stripe
- [ ] Failed payments per day > 5 → email
- [ ] New dispute → email immediately
- [ ] Refund > $X → email

### Sentry (once wired)
- [ ] New issue type → Slack
- [ ] Issue spike (>10 in 1 min) → page

### Custom (DB-side)
- [ ] Daily admin email summarizing yesterday's: new listings, new users, payments, refunds, fraud flags, audit events.

## 5. Tracing for AI calls

Already captured in `ai_logs`. Daily dashboard query:

```sql
select workflow,
       count(*) as calls,
       sum(tokens_in) as in_tok,
       sum(tokens_out) as out_tok,
       sum(cost_cents) / 100.0 as cost_usd,
       avg(extract(epoch from (finished_at - created_at))) as avg_seconds
from ai_logs
where created_at >= now() - interval '24 hours'
group by workflow
order by cost_usd desc;
```

## 6. Customer-impacting signals

The single most important alert is **"buyers can't check out."** Wire this by:

1. Synthetic check (uptime-monitor) hitting `/pricing` and a known `/listings/:slug` every 5 min.
2. Stripe webhook delivery dashboard — confirm `2xx` rate ≥ 99.5%.
3. Daily Supabase query for orphaned `payments` rows (status pending > 1h) — should always be zero.

## 7. Data privacy in logs

- **Do not log PII** beyond user_id, email (already in payments).
- Strip request bodies from log lines before they reach long-term storage.
- Audit log `metadata` jsonb is admin-only via RLS.
- Customer messages (`messages` table) are **never** logged outside the DB.

## 8. Verdict

| Item | Status |
|---|---|
| Top-level ErrorBoundary | ✅ |
| Per-route ErrorBoundary | ✅ |
| Sentry-ready shim (no-op without DSN) | ✅ |
| Edge fn logging | ✅ |
| Audit log table + helper | ✅ |
| Webhook dedup table | ✅ |
| AI usage logging | ✅ |
| Sentry actually wired | ⚙ MS (env var + uncomment) |
| Production alerts in vendor dashboards | ⚙ MS |

Observability is **production ready for private beta**. Sentry wiring is the one outstanding code-side enhancement and is a 10-line change once a DSN is provisioned.
