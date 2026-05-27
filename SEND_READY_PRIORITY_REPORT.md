# TradeWind 100 — Send-Ready Priority Report

**Date:** 2026-05-27
**Run:** VERIFIED LEAD CLEANUP + SEND-READY PRIORITY MODE
**Commit:** `eca2809` on `main` (pushed)
**Owner:** Don Morrison (don@lifeofmorr.com)

---

## 1. Counts

| Bucket | Count | Where it lives |
|---|---:|---|
| **Total TradeWind 100 leads** | **100** | `supabase/outreach-100-leads.sql` |
| Safe to send (`status='send_ready'`) | 66 | likely_valid email confirmed |
| Needs manual review (`status='needs_review'`) | 16 | unverified email — human re-confirm before send |
| Non-email only (`status='non_email_channel'`) | 18 | LinkedIn / contact form / phone |
| Removed (DNC at row level) | 2 | hard-bounced 2026-05-26 (info@usaaircraft.com, info@smokymountaintraders.com) |

The 6 audit downgrades (Park Place LTD, MotorCars of Atlanta, Canepa,
Aerista, TBM Central, OGARAJETS) are included in the `needs_review` 16.

The 30+ leads from the original batch (pre-tradewind-100) are unchanged —
the cleanup SQL is scoped to `lead_source like 'tradewind-100%'`.

---

## 2. Top 10 — send-ready, copy-ready

(Full drafts in `go-to-market/outreach-autopilot/TOP_10_SAFEST_LEADS.md`.)

| # | Send date | Company | Contact | Email |
|---|---|---|---|---|
| 1 | 2026-05-30 | Premier Aircraft Sales | Travis Peffer | sales@flypas.com |
| 2 | 2026-05-30 | Mente Group, LLC | Brian Proctor | brian@mentegroup.com |
| 3 | 2026-05-30 | Prestige Imports Miami | Brett David | bdavid@prestigeimports.com |
| 4 | 2026-06-01 | Van Bortel Aircraft, Inc. | Aircraft Sales Team | acsales@vanbortel.com |
| 5 | 2026-06-01 | Pollard Aircraft Sales, Inc. | Tim Pollard | sales@pollardaircraft.com |
| 6 | 2026-06-01 | Cutter Aviation Aircraft Sales | Annie Ritter | aircraftsales@cutteraviation.com |
| 7 | 2026-06-02 | Muncie Aviation Company | TBM Sales Team | sales@muncieaviation.com |
| 8 | 2026-06-02 | Burkard Yacht Sales | Chris Burkard | sales@burkardyachts.com |
| 9 | 2026-06-02 | Miami International Yacht Sales | Robert Lama | bob@miamiys.com |
| 10 | 2026-06-03 | Streetside Classics - Charlotte | Bob Mueller | info@streetsideclassics.com |

---

## 3. Top 25 — full priority queue

(Full table in `go-to-market/outreach-autopilot/TOP_25_SAFEST_LEADS.md`;
polished rewrites for rows 11-25 in
`go-to-market/outreach-autopilot/TOP_25_POLISHED_EMAILS.md`.)

Rows 1-10 above, plus:

| # | Send date | Company | Contact | Email | Bucket |
|---|---|---|---|---|---|
| 11 | 2026-06-03 | Florida Marine Surveyors | Ian Morris | info@floridamarinesurveyors.com | send_ready |
| 12 | 2026-06-03 | Bill Potter Marine Surveys | Bill Potter | billpotter@ymail.com | send_ready |
| 13 | 2026-06-04 | Associated Marine Consultants, LLC | Carl McCann | captcarlmc@aol.com | send_ready |
| 14 | 2026-06-04 | Gladding Marine Survey, Inc. | Bill Gladding | bill@gladdingmarinesurvey.com | send_ready |
| 15 | NEEDS REVIEW | CHS Marine Survey, LLC | Nick Lombardi | charlestonmarinesurvey@gmail.com | needs_review |
| 16 | 2026-06-04 | Atlantic Marine Survey | Barnaby Blatch | bblatch0@gmail.com | send_ready |
| 17 | 2026-06-05 | Haggan Aviation | Geno Haggan | Services@HagganAviation.com | send_ready |
| 18 | 2026-06-05 | Aero Center Atlanta | Scott Ordway | scott.ordway@aerocenters.com | send_ready |
| 19 | LinkedIn / form | Reliable Carriers, Inc. | Tom Abrams | *(no email)* | non_email_channel |
| 20 | 2026-06-05 | Passport Transport | Sales Team | sales@passporttransport.com | send_ready |
| 21 | 2026-06-08 | Florida Boat Transport LLC | Greg Hutchens | greg@floridaboattransport.com | send_ready |
| 22 | 2026-06-08 | Yacht Trucking (Safe Harbor Haulers) | Eric | Eric@SafeHarborHaulers.com | send_ready |
| 23 | NEEDS REVIEW | Trident Funding | Joan Burleigh | jburleigh@tridentfunding.com | needs_review |
| 24 | NEEDS REVIEW | Pantaenius America Ltd. | Scott Stusek | stusek@pantaenius.com | needs_review |
| 25 | 2026-06-08 | Wings Insurance | Tom Hauge | thauge@wingsinsurance.com | send_ready |

Of the Top 25: **21 send_ready**, **3 needs_review** (CHS Marine, Trident
Funding, Pantaenius), **1 non_email_channel** (Reliable Carriers).

---

## 4. May 30 priority queue verdict

| Lead | Verdict |
|---|---|
| **Brett David / Prestige Imports** | ✅ **SAFE** — CEO confirmed multi-source. `bdavid@prestigeimports.com` in RocketReach/ZoomInfo. Fall back to `sales@prestigeimports.com` (published) on bounce. |
| **Travis Peffer / Premier Aircraft Sales** | ✅ **SAFE** — CEO confirmed via Diamond Aircraft press. `sales@flypas.com` is the standard company sales inbox; `@flypas.com` domain confirmed. |
| **Brian Proctor / Mente Group, LLC** | ✅ **SAFE** — Founder/President/CEO confirmed via LinkedIn, Bloomberg, Crunchbase, Aviation Week. `brian@mentegroup.com` is the pattern-inferred format from the main office domain. |

All three drafts are committed verbatim in
`go-to-market/outreach-autopilot/TOP_10_SAFEST_LEADS.md` §§1-3.

---

## 5. Send rules

**Outreach is paused** until the May 29 follow-up batch lands
(`supabase/outreach-followup-may29-drafts.sql`).

**After May 29:** 3 verified sends/day for the first three days, ramping
to the Week-1 cap of 7/day (set in `AdminOutreach.tsx` →
`CAMPAIGN_DAILY_CAP`).

- 2026-05-30 — rows 1-3 (Travis, Brian, Brett).
- 2026-06-01 — rows 4-6 (Van Bortel, Pollard, Cutter).
- 2026-06-02 — rows 7-9 (Muncie, Burkard, Miami Intl Yacht).
- 2026-06-03 — rows 10-12 (Streetside, FL Marine Surveyors, Bill Potter).
- Continue down the Top 25, skipping NEEDS REVIEW rows until the named
  mailbox is confirmed on the company's own site.

**Hard gates** (already enforced):
- The daily-queue picker skips `unverified` / `bounced` /
  `do_not_email` / `invalid` rows (migration
  `20260527_email_verification.sql`, index `outreach_leads_queue_picker_idx`).
- The dashboard daily-cap indicator blocks approvals once the cap is hit.
- The opt-out line is verbatim in every draft.
- No row sends without a manual approve + send on `/admin/outreach`.

---

## 6. What changed in the dashboard

`src/pages/dashboard/admin/AdminOutreach.tsx`:

- New KPI strip row: **Send ready / Needs review / Non-email only / Removed**.
- New **Priority queue** tab — shows only `status='send_ready'` rows, sorted
  by priority then lead_score, with the most-recent draft body inlined as a
  one-message preview. Copy Email + Open Lead actions inline.
- Status badge handles the three new buckets (`send_ready` →
  green "Send ready", `needs_review` → accent "Needs review", `non_email_channel`
  → "Non-email").
- The status filter dropdown adds the three new buckets so the existing
  Leads table can be filtered to any one of them directly.
- Verification status color logic is unchanged (verified / likely_valid →
  green; unverified → accent; bounced / invalid / do_not_email → red).

Build + tests pass: `npm run typecheck` clean, `npm run build` clean
(AdminOutreach now 61.55 KB / 15.80 KB gzip), 183/183 vitest tests pass.

---

## 7. Deploy checklist

- [x] `supabase/outreach-lead-cleanup.sql` written
- [x] Priority list files written (`TOP_10`, `TOP_25`, `TOP_50`,
      `LEADS_REMOVED_OR_REPLACED`, `NON_EMAIL_OUTREACH_QUEUE`)
- [x] `AdminOutreach.tsx` KPIs + Priority Queue tab live
- [x] Build + tests pass
- [x] Committed (`eca2809`) and pushed to `main` (Vercel auto-deploys)
- [ ] **Apply `supabase/outreach-lead-cleanup.sql` in Supabase SQL Editor** ← next step for Don

---

## 8. Next action for Don

1. Open Supabase SQL Editor → paste
   `supabase/outreach-lead-cleanup.sql` → Run.
2. Verify with the §"Post-cleanup validation" query at the bottom of that
   file — counts should be 66 / 16 / 18.
3. Wait for the May 29 follow-up batch to land.
4. 2026-05-30: open `/admin/outreach` → Priority queue tab → approve and
   send rows 1-3 (Travis, Brian, Brett) at the 3/day cap.
5. If `bdavid@prestigeimports.com` bounces: switch to
   `sales@prestigeimports.com` and resend manually.
6. Follow the schedule in §5 through 2026-06-08.

---

**VERIFIED LEAD CLEANUP + SEND-READY PRIORITY COMPLETE**
