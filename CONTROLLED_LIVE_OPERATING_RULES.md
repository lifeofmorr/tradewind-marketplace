# CONTROLLED LIVE — OPERATING RULES

> Generated: 2026-06-03
> These rules govern the **controlled live** phase. They are operational
> guardrails, not code. The codebase already enforces the hard ones (Stripe
> fail-closed, CAN-SPAM 409 gate, AI rate limits); these rules cover the human
> decisions the code cannot make.

## Hard rules (do not break)

1. **Start with private beta users only.** No public launch, no paid acquisition. Invite-only.
2. **Manually approve every real listing.** No real listing goes live without human review (see `REAL_LISTING_APPROVAL_SOP.md`).
3. **Do not claim real marketplace liquidity yet.** No "thousands of listings," "active buyers," or volume claims that aren't true.
4. **Do not claim guaranteed leads.** No "guaranteed buyers/leads" language anywhere.
5. **Do not claim live escrow / financing / insurance integrations** unless that specific integration is actually activated and verified. Keep the existing "we do not provide / independent verification required" disclaimers.
6. **Keep demo listings labeled "demo."** The `DEMO_DISCLAIMER` (`src/lib/demoDisclaimer.ts`) must remain visible on every demo asset. Never present demo data as real inventory.
7. **Keep Stripe in TEST mode** until live keys + all 7 live prices are verified and `/admin/payments/live-readiness` is all-green. Do not process real payments before that.
8. **Do not scale outreach until the mailing address is configured** (both `VITE_BUSINESS_MAILING_ADDRESS` and server `BUSINESS_MAILING_ADDRESS`). The `build-daily-queue` function returns 409 until then — do not work around it.
9. **Send at most 3 verified emails/day at first.** Each one human-reviewed before send. No automated/bulk sending. Ramp only after deliverability + replies look healthy.
10. **All data is synthetic demo data** until real, approved listings exist. No connection to real government/registry systems. No certification claims.

## Operating cadence

11. **Log all support and beta feedback.** Capture every `/contact`, `/support`, and `/feedback` submission; triage in `/admin/beta-inbox`.
12. **Review admin notifications daily.** Check beta inbox, inquiries, fraud flags, and (if live) payment events at least once per day.
13. **Human review required before any outreach send.** No message leaves without a person approving the copy, the recipient, and confirming the recipient is not on the DNC list.
14. **Honor opt-outs immediately.** Any reply asking to stop → mark `do_not_contact` before the next queue build.

## Aviation & high-value asset rules

15. **Aviation disclaimers must stay visible** (`src/lib/aviationSafety.ts`): Tradewind does not verify FAA status, airworthiness, title, escrow, logbooks, AD/SB, insurance, or financing — independent verification by qualified professionals required.
16. **Service partner disclaimers must stay visible** — partners are independent third parties; Tradewind introduces, it does not provide the service or guarantee outcomes.

## Escalation / stop conditions

17. **Stop outreach immediately** if: spam complaints appear, a deliverability warning fires, or the mailing address/opt-out footer is found missing on a sent message.
18. **Stop payments immediately** (revert `STRIPE_MODE`/`VITE_STRIPE_MODE` to `test`) if `/admin/payments/live-readiness` ever shows non-green or a webhook signature failure is observed.
19. **Do not auto-switch Stripe to live, do not auto-send email, do not fake configuration.** Every live transition is a deliberate human action with verification.

## Promotion criteria (controlled live → broader launch)

Only widen access when ALL hold:
- Stripe live-readiness all-green and at least one successful live test transaction reconciled.
- Mailing address configured; outreach footer + opt-out verified on real sends.
- Sentry receiving production errors; no unresolved P0s.
- Real listings approved through the SOP; demo data clearly separated.
- Support inbox monitored with acceptable response times.
