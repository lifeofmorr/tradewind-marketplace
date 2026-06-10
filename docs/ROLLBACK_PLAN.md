# Rollback Plan — TradeWind

**Last reviewed:** 2026-05-26
**Goal:** restore production to a known-good state within **15 minutes** of detecting a regression.

## Decision tree

```
Production broken?
├── Caused by a recent code deploy → A. Vercel rollback
├── Caused by a migration / data shape change → B. DB rollback
├── Caused by a vendor outage (Stripe / Supabase / Anthropic) → C. Vendor-side mitigation
└── Unclear → D. Triage, then choose A / B / C
```

## A. Vercel rollback (most common)

### Option 1 — Vercel UI promote
1. Vercel Dashboard → Deployments → find the last green production deploy.
2. Click **Promote to Production**.
3. Verify live URL within 60s.
4. Notify reporter / team.

### Option 2 — git revert (preferred for audit)
```bash
git checkout main
git pull
git revert <bad-commit-sha> --no-edit
git push origin main
# Vercel auto-deploys the revert
```

Verification:
- Open https://tradewind-marketplace.vercel.app, hard refresh.
- Re-run the failing user path.
- Sign in as admin, check `/admin` loads.

### Option 3 — feature flag (when revert is too broad)
We don't have a feature flag service yet. **Add LaunchDarkly / Vercel Flags only when a flag is actually needed** — premature flagging adds complexity.

For now: toggle behavior via env var + redeploy. Example:
- `VITE_AI_LISTING_AUTOPILOT_ENABLED=false` → hide the autopilot CTA.

## B. Database rollback

### B1. Bad migration applied

**Never re-run an older migration** in reverse — write a **forward-fix migration** instead.

```sql
-- supabase/migrations/<timestamp>_revert_<bad-thing>.sql
-- Forward-fix: undo whatever the bad migration did.
begin;
  -- example: re-drop a column that was added incorrectly
  alter table public.listings drop column if exists bad_column;
commit;
```

Apply: `supabase db push --linked --project-ref qwaotydaazymgnvnfuuj`.

### B2. Bad data write (e.g. admin deleted a row)

1. Identify the row + timestamp via `audit_logs`.
2. If recent (< 7 days): Supabase PITR snapshot to a side project, copy the row back.
3. If older: restore from `pg_dump` archive (see `BACKUP_RECOVERY_PLAN.md`).

### B3. Schema-corrupting migration (rare)

1. Page founder.
2. Restore from PITR to a side project.
3. Promote side project as new live (requires re-pointing Vercel env vars).
4. Post-mortem.

## C. Vendor outage mitigation

### Stripe
- Webhook delivery delay: `webhook_events` dedup means replays are safe; manual replay via Stripe Dashboard.
- API down: surface a maintenance banner via env var + redeploy.

### Supabase (DB or fn)
- Region failure: wait for Supabase to fail over (rare). Status: https://status.supabase.com.
- Local fix: nothing — escalate to vendor.

### Anthropic
- 5xx: edge fn fallback to OpenAI runs automatically.
- Both down: surface "AI temporarily unavailable" message in the UI.

### Plaid
- Sandbox stub already kicks in if creds missing. For prod outage, show banner in Financial Hub.

### Resend
- Email delivery delay: webhook `sendEmail` is fire-and-forget; outages don't break checkout/auction completion.
- For critical (admin) notices: fall back to admin-side polling.

## D. Triage (when cause is unclear)

1. **Read the alert** — what specifically broke?
2. **Tail the logs** — Supabase fn logs, Vercel logs, browser console.
3. **Identify when it started** — correlate to most recent deploy / migration / vendor event.
4. **Bisect by reverting one change at a time** — never bundle reverts unless confident.

## Per-route rollback playbook

| Surface | Quickest rollback |
|---|---|
| Public marketing page | revert PR |
| Listing detail page | revert PR |
| Dashboard | revert PR |
| Stripe checkout | revert PR + Stripe webhook secret confirmation |
| AI workflow | flip env var to disable, revert later |
| Migration | forward-fix migration |
| Edge function | redeploy previous version via `supabase functions deploy <name> --no-verify-jwt` (if applicable) from previous git SHA |

## RTO targets

| Scenario | RTO |
|---|---|
| Code regression | < 5 min |
| Bad migration | < 30 min |
| Single-row recovery | < 15 min |
| Vendor outage | depends on vendor — comms within 15 min |

## Communications during rollback

- **Internal:** ping founder, document timeline in real-time.
- **External (private beta):** post status note on `/trust` page if outage > 10 min.
- **External (public, post-launch):** status page + email blast if user-facing for > 30 min.

## Post-rollback

1. Confirm the regression no longer reproduces.
2. Capture the failing PR / migration in a post-mortem (`docs/postmortems/`).
3. Add a regression test (vitest or Playwright) so the same class of failure can't recur silently.
4. Schedule the real fix in the next release.

## Drill

Practice rollback **quarterly**:
- Pick a non-critical recent commit.
- Revert it on a sandbox branch deployed to a Vercel preview.
- Measure: time to detect, time to revert, time to verify.
- Update RTO targets if measured > targeted.
