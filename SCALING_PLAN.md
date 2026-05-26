# Scaling Plan — TradeWind

**Last reviewed:** 2026-05-26
**Posture:** designed for **10k MAU / 100k listings / 1k req/min** as the next milestone. Beyond that, the plan calls for vertical Supabase upgrade + targeted caching, not a re-architecture.

## Current capacity envelope (assumed conservative)

| Tier | Capacity | Bottleneck |
|---|---|---|
| Vercel Hobby/Pro | 100GB BW, ~1M edge req/mo | static assets — non-issue |
| Supabase Pro | ~500 concurrent DB conns | DB pool, read replicas |
| Anthropic | per-key TPS | per-workflow rate limit |
| Stripe | unbounded | n/a |

## Read scaling

1. **Indexes are in place** (`PERFORMANCE_AUDIT.md`).
2. **React Query caches** at 30s `staleTime` → buyer browsing has minimal repeat queries.
3. **Public listing pages** are SPA-rendered today. Roadmap:
   - **Static prerender top categories** (boats / autos / aircraft + per-state) via Vercel edge / ISR-style approach, refresh every 30 min. This drops 80% of read load.
   - **Supabase read replica** in same region — read pages route through replica.
4. **Sitemap** is regenerated via edge fn (`/sitemap.xml` → `supabase/functions/sitemap`). Add 1h CDN cache once we have >1k listings.

## Write scaling

- **Listing creates** are seller-rate-limited (max 1 per 30s — implicit via UI guards). DB can handle 1000s/min.
- **Inquiries** are gated by the AI fraud check edge function — already async fallback if AI is slow.
- **Messages** are append-only; conversation index already covers fetch.

## AI scaling

- Anthropic + OpenAI fallback already wired (`_shared/anthropic.ts`).
- Per-workflow daily cost cap (NOT YET ENFORCED — open item): query `ai_logs` on insert via trigger and reject if today's spend > $X for the user.
- Heavy AI workflows (listing autopilot, negotiation) are admin/seller-initiated — naturally rate-limited by humans.

## Edge function scaling

- Supabase functions are stateless Deno isolates — they scale horizontally automatically.
- Single hot path is `stripe-webhook` — webhooks are bursty but always ≤ Stripe's emission rate. The HMAC verify + DB upsert path is ~50ms.

## Storage scaling

- Listing photos: Supabase Storage with public read for active listings. Move to image CDN + AVIF transcoding when bucket exceeds ~5 GB.
- Video clips: Supabase Storage. Migrate to Mux or Cloudflare Stream once seller adoption justifies cost.

## Stress test plan (pre-public-launch)

1. **k6 / Artillery** load test against staging:
   - 500 concurrent users browsing `/`, `/browse`, `/listings/:slug` for 10 min.
   - Watch DB CPU + connection pool + p95 latency.
   - Target: p95 < 500ms, error rate < 0.1%.
2. **AI burst test** — 100 concurrent inquiries → verify Anthropic 429 fallback to OpenAI works.
3. **Webhook flood** — replay 100 Stripe events in 30s via Stripe CLI → verify `webhook_events` dedup + no double-insert in `payments`.

## Caching plan

| Layer | What | Where | TTL |
|---|---|---|---|
| Vercel edge | static assets | automatic | immutable |
| Vercel rewrites | `/sitemap.xml` proxy | edge | 1 hr (add in `vercel.json` once live) |
| React Query | client state | browser | 30s |
| Supabase | DB query plan cache | DB | n/a |
| Future: read replica | listing list/detail | DB | n/a |
| Future: CDN-cached listing pages | static-rendered HTML | edge | 30 min |

## Failure modes & graceful degradation

| Failure | Degraded behavior | User impact |
|---|---|---|
| Anthropic down | OpenAI fallback (`callLLM` retries) | none if OpenAI key set |
| Stripe down | checkout button shows error; no orphaned writes | "try again later" |
| Plaid down | Financial Hub shows sandbox stub if creds missing, else error message | non-blocking, optional flow |
| Supabase fn cold start | first call slow ~1.5s | minor latency spike |
| DB at conn limit | queries queue, then timeout | UI shows retry banner |
| CDN miss on hero image | fall back to lower-res `data:` placeholder via intersection observer | minor blur during paint |

## Roadmap — next milestones

| When | Capacity goal | Change |
|---|---|---|
| **Now → 1k MAU** | current setup | no change |
| **1k → 10k MAU** | current setup + warning alerts | enable Supabase fn alerts, Vercel analytics |
| **10k → 50k MAU** | Supabase Team plan | upgrade DB plan, add read replica |
| **50k+ MAU** | static prerender hot pages | edge cache for `/browse`, `/listings/:slug`; revisit hero scene size |
| **100k+ MAU** | dedicated infra | consider self-hosted Postgres or Supabase Enterprise |

## Open scaling items (not launch-blocking)

- [ ] Add daily per-user AI cost cap trigger.
- [ ] Add Vercel CDN cache header to `/sitemap.xml` rewrite.
- [ ] Configure manual chunks split for main bundle.
- [ ] Define synthetic uptime monitor (Pingdom / UptimeRobot).
- [ ] Document on-call rotation when team exceeds 1 person.
