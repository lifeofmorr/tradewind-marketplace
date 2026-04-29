# Admin Daily Operations Playbook

This is the day-to-day runbook for the TradeWind admin during private beta. Skim it once, then return to it daily.

## Daily checklist (15 minutes)

Run through these every morning. Most days nothing actionable will appear; that's fine.

1. **Sign in** at `/login` and land on `/admin`.
2. **Review the dashboard cards.** Note any spikes in pending listings, fraud flags, payments, or service requests.
3. **Listings queue** — `/admin/listings`
   - Approve any new submissions that are valid (clear photos, sane price, real-looking description).
   - Reject obvious junk with a reason in the rejection note.
   - Flag anything suspicious for fraud review.
4. **Service requests** — `/admin/requests`
   - Triage new financing, insurance, inspection, transport, and concierge requests.
   - Use the partner-match panel to suggest a service provider, or assign manually.
   - Update status as items move (new → assigned → in_progress → completed).
5. **Fraud signals** — `/admin/fraud`
   - Review any auto-flagged items (price/zip/email anomalies).
   - Approve, reject, or escalate.
6. **Payments** — `/admin/payments`
   - Confirm all Stripe webhook events posted today are accounted for.
   - Investigate any "failed" or "disputed" entries.
7. **Auctions** — `/admin/auctions`
   - Verify any auctions that ended overnight resolved cleanly (winning bid recorded, seller notified).
   - Manually finalize anything stuck.
8. **Users** — `/admin/users` (only when needed)
   - Promote a verified dealer/SP if they completed onboarding.
   - Suspend or remove bad-actor accounts.

## Weekly tasks (Mondays)

- Pull `/admin/dashboard` headline metrics and log them in a spreadsheet (signups, listings, leads, requests, GMV).
- Review the previous week's bug reports (see `BUG_REPORT_TEMPLATE.md`).
- Triage Linear/issue tracker items with the engineer (or yourself, if solo).
- Send the beta cohort a one-paragraph update: what shipped, what's coming, any known issues.

## Quick reference: where to look for what

| If you need to… | Go to |
| --- | --- |
| Approve/reject a listing | `/admin/listings` |
| Find a buyer's profile | `/admin/users` (search by email) |
| See all open service requests | `/admin/requests` |
| Read fraud-flag context | `/admin/fraud` |
| Confirm a Stripe payment | `/admin/payments` |
| Edit homepage or landing copy | `/admin/content` |
| Publish a blog post | `/admin/blog` |
| Publish a market report | `/admin/market-reports` |
| Manually run an auction wrap-up | `/admin/auctions` |

## Escalation paths

- **Critical bug (site down, payments broken):** roll back the Vercel deployment, post in the beta cohort thread, file a `BUG_REPORT_TEMPLATE.md` against the production deploy.
- **Data issue (a listing/user looks wrong):** screenshot, do not delete; flag for engineering review.
- **Trust/fraud incident:** suspend the user, hide affected listings, capture every URL and screenshot before any cleanup.
- **Stripe issue:** check the Stripe Dashboard first — it's the source of truth, our admin view is a mirror.

## What NOT to do

- Do not edit production data directly in Supabase Studio unless you've made a backup.
- Do not delete a listing/request that a user is actively contesting — change status to `disputed` and resolve through messaging.
- Do not approve listings with placeholder photos for live cohort members. Demo seed data is the exception.
- Do not hand out admin role. There is exactly one admin during private beta.

## Daily success bar

A clean day looks like: queue empty by noon, no fraud flags pending overnight, all Stripe events reconciled, at least one personal note sent to a beta cohort member.
