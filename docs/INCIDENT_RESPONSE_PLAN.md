# Incident Response Plan

How TradeWind responds when something breaks in production.

## Severity levels

| Level | Definition                                                   | Target response | Target resolution |
|-------|--------------------------------------------------------------|-----------------|-------------------|
| **P0** | Site down, payments broken, data exposure, or auth bypass    | 15 min          | 4 h               |
| **P1** | Major feature broken (listings, inquiries, dashboards)       | 1 h             | 24 h              |
| **P2** | Minor feature degraded, single-page error, slow performance  | 1 business day  | 1 week            |
| **P3** | Cosmetic, copy, or low-impact regression                     | Next sprint     | Backlogged        |

## Response team

- **Incident lead** — first responder. Owns comms and decisions.
- **Engineer on call** — diagnoses + fixes. Single name, rotating weekly.
- **Comms lead (P0/P1)** — handles user updates and partner outreach.
- **Founder / exec sponsor** — looped in immediately on P0.

## Communication plan

- **Internal**: `#incidents` Slack channel, paging via PagerDuty for P0/P1.
- **Status page**: `status.gotradewind.com` updated within 30 min for P0.
- **User comms**: in-app banner + email for P0 affecting auth or payments.
- **Partner comms**: dealer/service-provider email for P1+ affecting their
  inbox or payouts.

## Rollback procedures

1. Identify the deploy that introduced the regression (Vercel deploy log).
2. Promote the previous Vercel build to production via dashboard.
3. If schema migrated, run reverse-migration from `supabase/migrations`.
4. Verify smoke tests pass against the rolled-back build.
5. Post-rollback: lock main branch until fix merges with a passing CI run.

## Post-incident review

Required for every P0 and P1. Within 5 business days:
- Timeline (detection → mitigation → resolution)
- Root cause (technical + organizational)
- Customer impact (users affected, revenue at risk)
- Action items with owners and due dates
- Filed in `docs/postmortems/` (no blame, public to the team)
