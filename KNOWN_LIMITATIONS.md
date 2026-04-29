# Known Limitations — Private Beta

We'd rather you find these listed honestly than discover them mid-flow. Everything here is a known gap that we plan to close before public launch.

## Inventory and content

- **Demo inventory.** A meaningful portion of current listings are seeded demo units, not real for-sale inventory. They're labeled visibly with a "Demo listing" badge. Real dealer inventory will replace them as cohorts come online.
- **Placeholder photography.** About 30% of demo listings use placeholder images. Real listings from beta dealers/sellers always use real photos.
- **Brand and city pages** are auto-generated. Some combinations have light content; we hand-edit the high-traffic ones over time.

## Pricing and signals

- **Cost-to-Own estimates** are for planning only. They're modeled from regional averages and the listing's own specs — they are not a quote and may differ materially from your actual costs.
- **Deal Score** is algorithmic guidance, not an appraisal. It's directionally useful for spotting outliers but should never replace a real survey or inspection.
- **Market Pulse** trends are computed from beta-period inventory — sample size is small. Treat directionally.

## AI features

- **AI-drafted seller offers, dealer follow-ups, and partner-match suggestions** require API keys (Anthropic and/or OpenAI) configured on the Supabase edge environment. If those keys aren't set, the features fall back to deterministic templates rather than personalized output.
- **Concierge / fraud / market-pulse** AI passes are best-effort during beta. Expect occasional empty results when an upstream call fails.

## Communications

- **No transactional email through TradeWind's domain yet.** Emails currently go via Resend's default sender. Recipients may see "from resend.dev" until we cut over to a TradeWind sending domain.
- **No SMS notifications.** All notifications are in-app or email during beta.
- **Message threads** persist, but read-receipts are best-effort.

## Service requests

- **Concierge, financing, insurance, inspection, transport requests** all require an admin pass before routing to a service provider during beta. Auto-routing is enabled for some categories but admin still reviews everything.
- **Partner-match suggestions** are heuristic; admin can override the algorithm and frequently will.

## Payments

- **Stripe is in test mode** during private beta. Any "checkout" runs against the Stripe test environment — no real money moves. We'll cut over to live mode at the start of public launch.
- **Escrow is not built in.** When a beta sale completes, the buyer and seller transact through whatever channel they already trust (cashier's check, bank wire, dealer F&I).
- **Refunds and disputes** during the test-mode period must be initiated in the Stripe test dashboard, not the user-facing app.

## Auctions

- **Auction wrap-up** runs on a manual admin pass during beta. We have a `pg_cron` job designed to automate it; it's not enabled until public launch.
- **Reserve handling** is correct but lightly battle-tested. Admin manually verifies any reserve-not-met outcomes.

## Search and discovery

- **Full-text search** is index-based and works well, but synonyms ("cuddy" vs. "express") and brand variants are still being tuned.
- **Saved-search alerts** are scheduled but not yet sent during beta.

## Accounts and access

- **No multi-tenant** dealer accounts yet — one dealer login per shop. Multi-user dealer access is on the post-launch roadmap.
- **No role switching** mid-session. If you need both buyer and seller flows, sign up twice with different emails. (Yes, this is annoying. We'll fix it.)

## Domain and trust

- **No custom domain yet.** The site lives at the Vercel preview URL during beta. We'll cut to the production domain ahead of public launch.
- **Trust seals and SOC2-style attestations** are not in place. Don't pretend they are.

## Data persistence

- **Demo data may be reset** during beta. Real beta accounts and their listings/inquiries/requests are persistent and never reset; only seeded demo content is touched.
- **Backups** are managed through Supabase's automated backup window. Nothing custom yet.

## Mobile and accessibility

- **Mobile is responsive but not native.** No iOS/Android app during beta.
- **Accessibility** has been pass-tested with axe and manual keyboard navigation; non-trivial gaps likely remain in less-traveled flows.

## Reporting gaps you find

If you hit something that feels broken or surprising and it's not on this list, please tell us. Use `BUG_REPORT_TEMPLATE.md` for fast triage or just email the address in your welcome note.

We update this file as gaps close. The presence of an item here is not an excuse — it's a commitment to fix it.
