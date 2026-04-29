# TradeWind Admin — Daily Operations

The daily playbook for whoever is running TradeWind day-to-day during the private beta. Plan ~30 minutes per day, more if volume picks up. Work top to bottom.

## Morning pass (15 min)

### 1. Pending listings — `/admin` listings tab
- Approve listings that look real and complete.
- Reject listings that are spam, miscategorized, or missing required fields. Use the rejection reason field so the seller knows why.
- **Target: every pending listing reviewed within 2 hours of submission.**

### 2. New inquiries — spam check
- Skim the inquiries that came in overnight from `/admin` or the Supabase `inquiries` table.
- Flag obvious spam (link-stuffed messages, unrelated text, repeat offenders) and remove the sender if needed.
- Real inquiries don't need action from admin — just confirm the seller / dealer received them.

### 3. Fraud flags
- Open the Fraud Flags panel. Investigate any new flags.
- For confirmed fraud: disable the user, hide the listing, document the case in your ops log.
- For false positives: clear the flag and note why so we can tune the heuristics.

## Midday pass (10 min)

### 4. Concierge requests
- Review new concierge requests in `/admin/requests`.
- Use **Partner Match** to suggest a dealer or service provider for each request.
- Reach out personally for high-value requests until the auto-match is trustworthy.
- **Target: respond to every concierge request within 24 hours.**

### 5. Financing requests
- Same flow as concierge — match to a partner or hand-respond.
- If financing partners aren't onboarded yet, reply with a "we're connecting you with a partner this week" note.

### 6. Payment activity
- Glance at `/admin/payments` (or Stripe test-mode dashboard).
- Confirm subscriptions activated correctly and refunds were processed.
- Investigate any failed charges before they snowball.

## Afternoon pass (5 min)

### 7. Marketplace health score
- Check the Market Pulse card on the admin dashboard.
- Sanity-check the trend lines: new listings, new signups, inquiries sent.
- If a metric crashes, dig into what changed (deploy? migration? outage?).

### 8. Partner assignments
- Make sure every open request has a partner assigned or a clear reason it doesn't.
- If a partner hasn't responded to an assignment in 24 hours, reassign.

### 9. Demo vs. real
- Use the demo / real filter on `/admin` listings. Make sure new real listings aren't getting buried under demo data.
- If real volume is growing, plan to retire demo listings in batches.

## Response time targets

| Action | Target |
|---|---|
| Approve / reject pending listing | < 2 hours |
| Respond to concierge request | < 24 hours |
| Respond to financing request | < 24 hours |
| Investigate fraud flag | < 4 hours |
| Resolve user-reported bug | < 48 hours |

## Escalation

- **Outage or critical bug:** stop the daily routine, fix or revert. Check the Vercel deploy log and Supabase logs.
- **Suspected security issue:** rotate the affected secret, audit access logs, document the incident.
- **Payment dispute:** handle in Stripe first, then update the user's account state.

## End-of-day note

Keep a one-line ops log per day: how many listings approved, how many requests handled, anything notable. This becomes the basis for weekly reports to investors / partners and helps spot trends early.
