# 30-Day Send Schedule — TradeWind 100 Campaign

Campaign: **TradeWind 100** (100 verified leads, 9 verticals, Southeast bias).
Prepared: 2026-05-26. Owner: Don Morrison (don@lifeofmorr.com).
Status: **drafts only — nothing sends without manual approval.**

---

## Goal

Get 100 verified leads through a first-touch + 2-follow-up sequence in ~30
days while staying under a **5% bounce rate** and **0 opt-out violations**.

Estimated outcomes (based on the existing 6-send sample — 4 delivered, 2
bounced before verification gate, 0 replies yet):

| Outcome             | Target | Floor |
|---------------------|--------|-------|
| Delivered           | ≥ 95   | ≥ 90  |
| Bounce rate         | ≤ 5%   | ≤ 10% |
| Reply rate (any)    | ≥ 8%   | ≥ 5%  |
| Positive replies    | ≥ 4    | ≥ 2   |
| Demos booked        | ≥ 3    | ≥ 1   |
| Beta invitations    | ≥ 2    | ≥ 1   |

If we hit the floor on bounce but blow past it on replies, we keep going.
If we hit the ceiling on bounce, we **stop and re-verify** (see Hard pause
rules at the bottom).

---

## Cadence by week

All sends are **manually approved** on /admin/outreach. No queue builder
auto-sends. "X/day" = drafts created and shown for approval; Don decides
which actually leave the building.

### Week 1 — 2026-05-26 → 2026-05-31 (the warm-up week)

The platform is fresh off a 33% bounce day. Goal: prove the verified-lead
gate works at low volume, learn the inbox warm-up rhythm.

| Day        | New sends | Follow-ups | Notes |
|------------|-----------|------------|-------|
| Mon 05-26  | 0         | 0          | Lead research / SQL load only. |
| Tue 05-27  | 3         | 0          | First touch, P=5 only. Verified addresses only. |
| Wed 05-28  | 3         | 0          | P=5 / P=4 mix. |
| Thu 05-29  | 3         | **4**      | FU1 for the 4 May-26 delivered sends. |
| Fri 05-30  | 3         | 0          | Light Friday. |
| Sat 05-31  | 3         | 0          | Optional — skip if any bounces hit Friday. |
| **Total**  | **15**    | **4**      | Hard cap. |

**Gate to Week 2:** must show ≥ 14 of 15 delivered (≤ 1 bounce) and zero
opt-out language in replies.

### Week 2 — 2026-06-01 → 2026-06-07

Conditional ramp. Default to 5/day if Week 1 gate clears.

| Day        | New sends | Follow-ups | Notes |
|------------|-----------|------------|-------|
| Mon 06-01  | 5         | 3 (FU1 Wk1 day 3 senders) | |
| Tue 06-02  | 5         | 3                          | |
| Wed 06-03  | 5         | 3                          | |
| Thu 06-04  | 5         | 3                          | |
| Fri 06-05  | 5         | 0                          | |
| Sat 06-06  | 5         | 0                          | Optional. |
| Sun 06-07  | 0         | 0                          | Catch-up day only. |
| **Total**  | **30**    | **12**                     | |

**Gate to Week 3:** bounce rate stays ≤ 5% and at least one reply (any
sentiment) by end of Week 2.

### Week 3 — 2026-06-08 → 2026-06-14

If clean, expand to 5–7/day. Start sending FU2 for Week 1 senders.

| Day        | New sends | Follow-ups | Notes |
|------------|-----------|------------|-------|
| Mon 06-08  | 7         | 3 FU1 + 3 FU2 | |
| Tue 06-09  | 7         | 3 FU1 + 3 FU2 | |
| Wed 06-10  | 7         | 3 FU1 + 3 FU2 | |
| Thu 06-11  | 7         | 3 FU1 + 3 FU2 | |
| Fri 06-12  | 7         | 3 FU1         | |
| Sat 06-13  | 0         | 0             | Hold — review replies. |
| Sun 06-14  | 0         | 0             | |
| **Total**  | **35**    | **24**        | |

### Week 4 — 2026-06-15 → 2026-06-21

Send remaining 20 new leads and finish the FU sequence.

| Day        | New sends | Follow-ups | Notes |
|------------|-----------|------------|-------|
| Mon 06-15  | 5         | 5 FU1 + 5 FU2 | |
| Tue 06-16  | 5         | 5 FU1 + 5 FU2 | |
| Wed 06-17  | 5         | 5 FU1 + 5 FU2 | |
| Thu 06-18  | 5         | 5 FU1 + 5 FU2 | |
| Fri 06-19  | 0         | Close-the-loop on Wk1/Wk2 silence | |
| Sat 06-20  | 0         | 0             | |
| Sun 06-21  | 0         | 0             | Campaign wrap retrospective. |
| **Total**  | **20**    | **40 + COTL** | |

---

## Volume reconciliation

| Bucket           | Count |
|------------------|-------|
| New first-touch  | 100   |
| FU1 sent         | ~90 (excludes bounces + early replies) |
| FU2 sent         | ~70 (excludes FU1 replies) |
| Close-the-loop   | ~50 (founder-discretion) |
| **Total emails** | **~310** over ~25 send days |

---

## Daily cap enforcement

The admin dashboard shows **"Daily limit: X/Y sent today"**. Hard caps:

| Week | Daily cap (new + FU combined) |
|------|--------------------------------|
| 1    | 7                              |
| 2    | 8                              |
| 3    | 13                             |
| 4    | 15                             |

If the daily cap is hit, the **Approve** button on remaining drafts is
disabled until midnight local. Don can override only with explicit click-
through (`Override daily cap`).

---

## Hard pause rules — STOP sending immediately if any of these fire

The system **must** auto-pause and flag a red banner on /admin/outreach
when any of these conditions are met. No new approvals possible until Don
acknowledges and clears.

| Trigger                                                          | Action                                                                  |
|------------------------------------------------------------------|-------------------------------------------------------------------------|
| Bounce rate > 5% over rolling 7-day window                       | Pause all new sends. Re-verify next 10 leads before resuming.           |
| Any 2 bounces in a single day                                    | Pause for the day. Inspect the bounced rows; fix the verification gate. |
| Any opt-out language in a reply ("stop", "unsubscribe", "remove me", "do not contact") not honored within 24h | Critical incident. Manual review by Don before resuming any sends.      |
| Gmail / Yahoo postmaster shows spam complaint > 0.1%             | Pause 7 days. Re-warm with 3/day at P=5 only.                            |
| Reply rate < 2% after 30 sends                                   | Soft pause. Review subject lines + first 2 sentences.                    |
| Any single day with 0 deliveries                                 | Investigate SPF/DKIM/DMARC.                                              |

---

## What kicks off Week 1 Tue 05-27

The first 3 sends are picked **manually** from the top-priority verified
leads in the 100-lead batch — P=5, fresh likely_valid email, named
contact. See `100_LEAD_CAMPAIGN_STATUS.md` for the exact list.

---

## Reporting cadence

- **Daily**: Don checks /admin/outreach KPI strip (bounce rate, replies, queue).
- **End of week**: Snapshot stats in this file's "Week N actuals" section
  (to be appended in-flight).
- **End of campaign**: Full retrospective in `100_LEAD_CAMPAIGN_STATUS.md`.
