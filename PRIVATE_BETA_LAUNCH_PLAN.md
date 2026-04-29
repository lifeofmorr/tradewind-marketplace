# Private Beta Launch Plan

A four-week plan from "everything is wired up" to "we're ready for public launch with real inventory." Each week has a clear goal, a small set of new participants, and a definition of done.

## Pre-week 0 (now): launch readiness

Before week 1 begins:
- All items in `MANUAL_SETUP_REQUIRED.md` are completed or explicitly deferred.
- Latest deploy on the production-equivalent Vercel URL is green (typecheck + build pass, smoke walkthrough clean).
- Admin account is created and verified.
- Welcome-note template is drafted (per-cohort: dealer, seller, SP, buyer).

If any of those are missing, finish them before starting week 1.

## Week 1 — Admin solo

**Goal:** prove every flow end-to-end with the founder as the only user.

Activities:
- Don signs up as admin and completes the admin walkthrough.
- Don signs up *separately* as a buyer (different email) and completes `BUYER_BETA_TEST_GUIDE.md`.
- Don signs up as a seller (third email), publishes one real listing, and walks through `SELLER_BETA_ONBOARDING.md`.
- Don signs up as a dealer (fourth email), completes `DEALER_BETA_ONBOARDING.md`, and adds 5 inventory items.
- Don signs up as a service provider (fifth email), completes `SERVICE_PROVIDER_BETA_ONBOARDING.md`.
- Run a real cross-flow scenario: as buyer, save the seller's listing, message the seller, submit a financing request — then as the SP, accept the lead.

Definition of done:
- Every flow completed without a blocker.
- At least 5 bugs filed in the bug template (there will be more, but 5 is the floor).
- All P0 bugs from this week's findings are fixed before week 2.

## Week 2 — First real cohort: 2 dealers + 1 seller

**Goal:** validate the dealer and seller flows with people who aren't us.

Invite list (target):
- 2 dealers — both within driving distance of the founder, both already friendly. Suggest one boat dealer (SC or FL coast) and one auto dealer (TN-area).
- 1 seller — a personal contact selling a high-quality, single unit.

Activities:
- Send each invite with the relevant onboarding doc attached.
- Watch first-day signup completion rates. If a dealer can't get past `/onboarding/dealer` in 30 minutes, the form is too hard — fix.
- Schedule 15-minute calls at end of week with each.

Definition of done:
- All 3 cohort members published live content.
- At least 1 buyer-to-seller message thread exists.
- All P0/P1 bugs from week 2 fixed before week 3.

## Week 3 — Expand: 2 more sellers + 1 service provider

**Goal:** test partner-match and lead-routing under realistic load.

Invite list (target):
- 2 additional sellers — a mix of categories (one boat, one auto if possible).
- 1 service provider — most useful is a marine surveyor or a marine-friendly lender. Their leads exercise the partner-match panel.

Activities:
- Begin generating lightweight buyer demand into the cohort:
  - Post in 1–2 boating/auto enthusiast communities the founder is part of.
  - DM 5–10 personal contacts who are actively shopping.
- Watch the leads inbox for SP and dealers. Confirm the partner-match algorithm is suggesting the right SP for the right request.
- End-of-week check-ins with each new cohort member.

Definition of done:
- At least 1 service request makes it from buyer → admin assignment → SP response.
- At least 5 inquiries flowing across the dealer leads inboxes.
- At least 1 listing has been edited based on dealer-side analytics feedback.

## Week 4 — Feedback synthesis and public-launch prep

**Goal:** consolidate everything we've learned and prepare to open the gates.

Activities:
- One-hour debrief with each beta cohort member. Use a shared question list:
  - Where did you bail or get stuck?
  - What feature did you wish for that wasn't there?
  - What surprised you (good or bad)?
  - Would you recommend TradeWind to a peer? Why / why not?
- Triage every bug filed across the four weeks. Decide: fix before launch, fix in v1.1, or close as won't-fix with rationale.
- Cut over to live Stripe.
- Cut over to the production custom domain.
- Enable `pg_cron` for auction wrap-up.
- Cut over Resend sending domain to `tradewind.tld`.
- Replace remaining demo inventory with real beta-cohort listings (or hide demo listings if not enough real inventory exists yet).
- Draft the public-launch announcement.

Definition of done:
- Public-launch checklist (`LAUNCH_CHECKLIST.md`) is fully green.
- At least 30 real listings live (mix of dealer + seller).
- Zero P0 bugs open. All P1 bugs assigned to a named owner.

## Public launch — Week 5+

**Goal:** open invitations more broadly, monitor for scaling issues, and start measuring acquisition seriously.

This is out of scope for the private-beta plan, but it's the destination. Keep the bar tight — we'd rather slip the public launch by a week than open with broken core flows.

## Cohort selection — recommended first 5

These are the highest-value invite slots during private beta. Each one tests a specific flow under realistic conditions:

1. **Don (admin)** — the operator. Tests every administrative flow.
2. **Coastal boat dealer (SC or FL)** — high-value units, real photos, knows the boat-buyer journey end to end.
3. **Auto dealer (TN-area or wherever Don is local to)** — different category, different buyer profile, different leads inbox cadence.
4. **Marine surveyor (any state)** — exercises inspection request → partner match → SP response.
5. **One personal-seller friend with a boat or specialty car** — tests the seller flow under real "I actually own this" pressure.

Replace any of the above with people you actually know and can call on the phone if something breaks. Trust matters more than category coverage during week 2.

## What success looks like at the end of week 4

- 30+ real listings live.
- 5+ paying-customer-quality buyer leads have been routed.
- Every cohort member would say (in their own words) that it's worth the time.
- We have a concrete punch list for v1.1 — small enough to ship in 30 days post-launch.
