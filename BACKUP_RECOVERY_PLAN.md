# Backup & Recovery Plan — TradeWind

**Database:** Supabase Postgres (project `qwaotydaazymgnvnfuuj`)
**Last reviewed:** 2026-05-26

## Recovery targets

| Tier | RPO | RTO | Method |
|---|---|---|---|
| Catastrophic (region failure) | 24h | 4h | Supabase managed restore from cross-region backup |
| Data corruption (bad migration) | < 1h | 30 min | Supabase PITR roll-back, then forward-fix migration |
| Single-row regret (admin deleted a listing) | seconds | 5 min | Audit-log + admin-side soft-undelete |

## Backup layers

### Layer 1: Supabase managed backups (primary)

- **Daily full backups** retained for **7 days** (Pro plan) or **30 days** (Team plan).
- **Point-in-time recovery (PITR)** — restore to any moment within retention window.
- Restore is **destructive at the project level** — creates a new database state.

> **Action item:** confirm Supabase project tier supports PITR. Upgrade to Pro if not.

### Layer 2: Weekly logical export (defense-in-depth)

Run from a CI job or a dev machine with restricted creds:

```bash
# Run weekly. Output saved to private S3 / encrypted disk.
DUMP_FILE="tradewind-prod-$(date +%Y%m%d).sql.gz"
pg_dump "${SUPA_PROD_DB_URL}" \
  --schema=public \
  --no-owner \
  --no-acl \
  --exclude-table-data='audit_logs' \
  --exclude-table-data='ai_logs' \
  | gzip > "${DUMP_FILE}"
```

Storage policy:
- Encrypted at rest (S3 SSE-KMS or LUKS volume).
- Retention: 90 days rolling.
- Access: bound to a single ops principal — no service-account checkout.

### Layer 3: Migration history in git

The 16 migration files in `supabase/migrations/` are the **schema** backup. Re-applying them rebuilds an empty database to the same shape. **Data** still requires a logical export.

## Recovery runbooks

### A. Restore from PITR (data corruption)

1. **Stop writes.** Toggle Vercel to a maintenance page (or 503) for the affected routes.
2. In Supabase Dashboard → Database → Backups → choose PITR timestamp before the bad event.
3. Confirm **target project** (always production: `qwaotydaazymgnvnfuuj`).
4. Wait for restore (typically 5–20 min).
5. Validate: log into admin dashboard, run smoke queries on `listings`, `payments`, `subscriptions`.
6. Re-enable Vercel traffic.
7. Write a **forward-fix migration** if the original bad migration was structural.
8. Post-mortem (use template in `INCIDENT_RESPONSE_PLAN.md`).

### B. Restore from `pg_dump` (worst-case)

1. Provision a **fresh Supabase project** (do not overwrite live until verified).
2. Apply migrations: `supabase db push --linked` against the new project.
3. Restore data: `gunzip -c tradewind-prod-YYYYMMDD.sql.gz | psql "${NEW_DB_URL}"`.
4. Smoke test against the new project URL.
5. Re-point Vercel `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` to the new project.
6. Update Stripe webhook endpoint URL.
7. Update all edge function secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
8. Audit-log entry + post-mortem.

### C. Single-row recovery (e.g. accidental admin delete)

1. Use Supabase Dashboard SQL editor to query historical state:
   ```sql
   -- If a soft-delete column exists (status='removed'), unflag:
   update listings set status='active' where id='...';
   -- Otherwise, restore via PITR snapshot to a side project and copy the row back.
   ```
2. Audit-log entry.

## Continuity drills

Drill cadence:
- **PITR drill** — every 90 days. Spin up a sandbox project from a PITR point, verify it boots, then tear down.
- **`pg_dump` restore drill** — every 180 days. Restore the latest weekly dump to a fresh project, run smoke tests.

Drill checklist:
- [ ] Backup is readable / restorable.
- [ ] Recovery RTO meets target.
- [ ] No data lost beyond the documented RPO.
- [ ] Documentation in this file still matches the procedure.

## Excluded from backup

- `audit_logs` data (kept short-term; long-term lives in immutable log store if/when added).
- `ai_logs` data (re-derivable from upstream LLM provider logs if needed).
- Storage bucket contents — Supabase Storage has its own backup; for critical media, mirror to S3 via a nightly sync (out of scope here).

## Owners & contacts

| Role | Owner | Contact |
|---|---|---|
| DB lead | TradeWind founder | private |
| Backup ops | TradeWind founder | private |
| Supabase support | Supabase | dashboard ticket + email |

## Audit trail

Every restore creates an `audit_logs` entry:
```ts
logAuditEvent({
  actorId: adminUserId,
  action: "db_restore",
  metadata: { pitr_ts: "...", reason: "...", incident_id: "..." }
})
```
