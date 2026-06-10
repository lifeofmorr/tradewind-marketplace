# AI Endpoint Rate Limiting

Protects the AI + outreach edge functions from abuse and runaway LLM cost.

## Components

| Piece | Location |
|-------|----------|
| Counter table + atomic RPC | `supabase/migrations/20260603_edge_rate_limits.sql` |
| Middleware | `supabase/functions/_shared/rate-limit.ts` |
| Applied in | the AI + outreach edge functions (see below) |

## Limits

| Scope | Limit | Window | Keyed by |
|-------|-------|--------|----------|
| `public` | 5 | 10 minutes | client IP |
| `auth` | 20 | 1 hour | user id |
| `admin` | 100 | 1 hour | user id |
| `outreach` | 25 | 1 day | user id (IP fallback) |

Identity is derived automatically by the middleware:

- `enforceAiRateLimit(req, name)` — resolves the caller's JWT. Authenticated →
  `auth` scope keyed per user. Anonymous → `public` scope keyed per IP.
- `enforceAiRateLimit(req, name, { adminScope: true })` — authenticated callers
  get the `admin` scope (100/hr). Used for admin-only AI tools.
- `enforceOutreachRateLimit(req, name)` — `outreach` scope (25/day), keyed per
  user (IP fallback for service-role callers).

Bucket key format: `"<function>:<scope>:<identifier>"`, e.g.
`ai-pricing-estimate:public:203.0.113.5`.

## Covered functions

| Function | Call | Notes |
|----------|------|-------|
| `ai-listing-autopilot` | `enforceAiRateLimit` | auth/public auto |
| `ai-negotiation-assistant` | `enforceAiRateLimit` | auth/public auto |
| `ai-buyer-assistant` | `enforceAiRateLimit` | auth/public auto |
| `ai-concierge-intake` | `enforceAiRateLimit` | auth/public auto |
| `ai-pricing-estimate` | `enforceAiRateLimit` | auth/public auto |
| `ai-listing-generator` | `enforceAiRateLimit` | auth/public auto |
| `ai-fraud-check` | `enforceAiRateLimit` | auth/public auto |
| `classify-outreach-reply` | `enforceAiRateLimit` (adminScope) | admin-only |
| `generate-outreach-message` | `enforceOutreachRateLimit` | 25/day |
| `build-daily-queue` | `enforceOutreachRateLimit` | 25/day (scaling guard) |

**Intentionally excluded:** `inquiry-fraud-check` runs server-to-server with the
service-role key on every inbound inquiry and is not user-triggered; rate
limiting it by IP would throttle the internal pipeline. Non-AI functions
(`stripe-*`, `send-email`, `sitemap`, `vin-decode`, `plaid-link`,
`auction-end`, `partner-quote`, `photo-enhance`) are out of scope.

## How the window works

Fixed window per bucket. `edge_rate_limit_hit(key, limit, window_seconds)`
atomically increments the counter and resets it lazily once the window has
elapsed — no cron/sweeper required. It returns `{ allowed, remaining,
retry_after }`. An over-limit call yields HTTP `429` with `Retry-After` and
`X-RateLimit-*` headers.

Stale rows can be pruned with `select prune_edge_rate_limits();` (optional,
drops counters idle > 1 day).

## Fail-open contract

If the limiter backend is unreachable or unconfigured (`SUPABASE_URL` /
`SUPABASE_SERVICE_ROLE_KEY` unset, RPC error), the request is **allowed** and a
warning is logged. Rationale: the limiter is a cost/abuse guard, **not** an auth
control (auth is enforced separately). A limiter outage must not take down every
AI feature. The trade-off is that a backend outage temporarily removes the cost
ceiling — monitor `[rate-limit]` warnings in function logs.

## Security of the counter table

`public.edge_rate_limits` has RLS enabled with **no policies**, so anon /
authenticated roles cannot read or write it. Only the service-role key (used by
edge functions, bypasses RLS) touches it. The RPCs are `security definer` with
`execute` granted to `service_role` only. The table stores IPs / user ids, so it
must never be client-readable.

## Deploy

1. Apply the migration: `supabase db push` (or `supabase migration up`).
2. Re-deploy the edge functions: `supabase functions deploy`.
3. Confirm `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set as function
   secrets (they already are for existing functions).
