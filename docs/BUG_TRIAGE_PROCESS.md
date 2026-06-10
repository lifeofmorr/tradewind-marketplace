# Bug Triage Process — TradeWind

**Last reviewed:** 2026-05-26
**Audience:** Admin triagers + engineering.

## Lifecycle

```
Reported → Triaged → Assigned → In Progress → Verified → Closed
                ↓
            Deferred → Backlog
```

## Step 1: intake

Bugs arrive via:
- `BUG_REPORT_TEMPLATE.md` (email from beta testers)
- `support@gotradewind.com` (general inbox)
- `/contact` form on the marketing site
- Internal QA / engineering
- Sentry (once wired)

For every report, capture:
- **Reporter** + contact
- **Date / time**
- **URL / route**
- **Browser / device**
- **Steps to reproduce**
- **Expected** vs **actual** behavior
- **Screenshot / video** (if visual)
- **User id / email** (so we can correlate with `audit_logs`)

## Step 2: severity (SLA)

| Sev | Criteria | Response | Resolution |
|---|---|---|---|
| **P0** | Production down, data loss, security incident, can't sign in, can't pay | < 30 min | < 2 h or rollback |
| **P1** | Feature broken for many; financial flow misbehaving but not down | < 4 h | < 24 h |
| **P2** | One user affected; clear workaround; non-blocking | < 1 business day | next release |
| **P3** | Cosmetic, polish, copy nit, "nice to have" | < 3 business days | backlog |

If unsure, **escalate up one tier**, not down.

## Step 3: priority (ranking inside a tier)

Independent of severity. Used to order the backlog within a sev tier.

| Priority | Criteria |
|---|---|
| **P1** | Affects >25% of users OR blocks revenue flow |
| **P2** | Affects 5–25% of users OR enterprise customer pain |
| **P3** | <5% users, minor pain |
| **P4** | Polish / nit |

## Step 4: assignment

- P0: founder pages immediately. Drop other work.
- P1: founder picks up; coordinate with affected vendor support if needed.
- P2/P3: queue into next release per `RELEASE_CHECKLIST.md`.

## Step 5: reproduction

Before any code change:
- Confirm repro steps work on **staging** (Vercel preview pointed at staging Supabase).
- If can't repro → ask reporter for more info OR mark as "cannot reproduce" with date.
- Capture failing state in a screenshot/screencap.

## Step 6: root cause vs symptom

When the temptation is "just patch the broken UI":
- Read the failing code path end-to-end.
- Check `audit_logs` for related actions.
- Decide: is this a bug in the visible code, or a deeper data/RLS/auth issue?
- Address the **root cause**. A bandaid that hides the real issue gets logged as tech-debt.

Default policy: **no `--no-verify` hook bypasses**, **no `console.error` suppression as a fix**.

## Step 7: fix

- Branch from `main` (or `staging` if a feature branch is in flight).
- Write the smallest possible diff that fixes the cause.
- Add a vitest test that fails before the fix and passes after.
- Update relevant docs if behavior changed.

## Step 8: deploy

Follow `RELEASE_CHECKLIST.md`. P0 fixes may skip the staging soak (founder approval required); P1+ always soak ≥ 30 min on staging.

## Step 9: verify

- Engineering verifies on staging.
- Reporter (or QA proxy) verifies on production after deploy.
- Mark issue closed only after reporter confirmation or 48h timeout with positive smoke test.

## Step 10: post-mortem (P0/P1)

For every P0 and any P1 that took longer than its SLA:

- **What broke?** (1 paragraph)
- **Who was affected?** (counts, durations)
- **What was the root cause?** (1 paragraph)
- **How did we detect it?** (alerts vs user report)
- **What did we change?** (code, process, monitoring)
- **What did we learn?** (one or two durable principles)

Post-mortem lives under `docs/postmortems/YYYY-MM-DD-<slug>.md` (create on first incident).

## Bug categories

| Tag | Owner | Notes |
|---|---|---|
| `auth` | founder | Always P1+ |
| `payments` | founder | Always P1+ |
| `data-integrity` | founder | Always P0 |
| `ui` | founder | Sev varies |
| `ai` | founder | Often P2 — fallback path usually works |
| `performance` | founder | Track separately in `PERFORMANCE_AUDIT.md` |
| `accessibility` | founder | P2 minimum |
| `legal` | founder + counsel | Escalate immediately |
| `vendor-outage` | founder | Coordinate with Stripe/Supabase/Anthropic/Resend |

## Anti-patterns to avoid

- Closing a bug because the reporter went silent — verify and document.
- Bumping severity down to fit the backlog — fix capacity, not severity.
- Patching the UI to hide a data bug.
- Skipping the staging soak on a "small" change.
- Marking "won't fix" without acknowledging the user.

## Metrics

Weekly:
- New bugs in week (count, by severity)
- Closed in week (count, by severity)
- Median time-to-respond (per tier)
- Median time-to-fix (per tier)
- SLA breach count

If breaches climb, that's a capacity signal — staff up or descope features before adding more.
