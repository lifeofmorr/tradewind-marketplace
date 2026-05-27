# TradeWind 100 — Campaign Status

Snapshot prepared 2026-05-26. Owner: Don Morrison (don@lifeofmorr.com).

100 verified leads loaded. Send schedule, follow-ups, compliance and
dashboard are wired. **Nothing sends without manual approval.**

---

## 1. Lead counts by segment

| # | Segment                                            | Vertical(s)                                | Loaded | Target |
|---|----------------------------------------------------|--------------------------------------------|--------|--------|
| 1 | Boat / yacht dealers & brokers                     | `boat_dealer`, `yacht_broker`              | 25     | 25     |
| 2 | Exotic / classic / performance auto dealers        | `exotic_dealer`, `classic_dealer`          | 15     | 15     |
| 3 | Aircraft brokers & dealers                         | `aircraft_broker`                          | 15     | 15     |
| 4 | Marine surveyors / boat inspectors                 | `marine_surveyor`                          | 10     | 10     |
| 5 | Aviation A&P / IA / service providers              | `ap_mechanic`                              | 10     | 10     |
| 6 | Transport companies (boats + autos)                | `transport`                                | 10     | 10     |
| 7 | Marine / auto lenders                              | `lender`                                   |  5     |  5     |
| 8 | Insurance brokers (marine + aviation)              | `insurance`                                |  5     |  5     |
| 9 | Escrow / title / closing partners                  | `escrow_title`                             |  5     |  5     |
|   | **TOTAL**                                          |                                            | **100**| **100**|

Geographic distribution (rough): FL 30, TX 12, NC/SC/GA 13, TN 7, CA 8,
CO/AZ 6, NE corridor 6, MD/OK 6, MI/OH/IN/MO/WA/VA/MA/MN/CT 12. Heavy
SE bias as specified.

---

## 2. Verification status summary

| Status            | Count | Notes |
|-------------------|-------|-------|
| `likely_valid`    | ~73   | Email confirmed on company's own website or authoritative directory. **Eligible for queue auto-pick.** |
| `unverified`      | ~27   | Named contact, phone, website verified; email is pattern-inferred or unpublished. **Backup_contact_channel in `notes`. Manual approval required.** |
| `verified`        | 0     | None yet — promotes to `verified` after first real reply or paid-service confirmation. |
| `bounced` / `invalid` / `do_not_email` | 0 | No carryover from prior batches. |

Run `select email_verification_status, count(*) from public.outreach_leads where lead_source like 'tradewind-100%' group by 1;` after load to confirm.

---

## 3. Send schedule (summary)

Full detail in `30_DAY_SEND_SCHEDULE.md`.

| Week | Window                 | Daily cap | Targeted new sends | Targeted FUs |
|------|------------------------|-----------|--------------------|--------------|
| 1    | 2026-05-26 → 05-31     | 7         | 15                 | 4 (May 29 FUs for existing batch) |
| 2    | 2026-06-01 → 06-07     | 8         | 30                 | 12           |
| 3    | 2026-06-08 → 06-14     | 13        | 35                 | 24           |
| 4    | 2026-06-15 → 06-21     | 15        | 20                 | 40 + COTL    |
| **Σ**|                        |           | **100**            | **~80 + 50 COTL** |

Hard pause triggers: bounce rate > 5%, any 2 bounces in a day, any
unhonored opt-out, postmaster complaint > 0.1%. Full detail in the
30-day file.

---

## 4. First 15 approved-ready leads (Week 1 target)

These are the highest-priority (P=5) leads with a `likely_valid` email
and a named contact — the safest first 15 sends. They span verticals so
Week 1 results validate the campaign across segments, not just one.

| # | Code | Company                                | Vertical          | Contact              | Verification |
|---|------|----------------------------------------|-------------------|----------------------|--------------|
|  1 | E2  | Prestige Imports Miami                  | exotic_dealer     | Brett David          | likely_valid |
|  2 | E4  | MotorCars of Atlanta                    | exotic_dealer     | Jorge Galvez         | likely_valid |
|  3 | E11 | Park Place LTD                          | exotic_dealer     | David Bingham        | likely_valid |
|  4 | E13 | Canepa                                  | exotic_dealer     | Bruce Canepa         | likely_valid |
|  5 | A1  | Premier Aircraft Sales                  | aircraft_broker   | Travis Peffer        | likely_valid |
|  6 | A2  | Aerista                                 | aircraft_broker   | Chris Eichman        | likely_valid |
|  7 | A11 | Mente Group                             | aircraft_broker   | Brian Proctor        | likely_valid |
|  8 | A12 | OGARAJETS                               | aircraft_broker   | Johnny Foster        | likely_valid |
|  9 | S2  | Florida Marine Surveyors                | marine_surveyor   | Ian Morris           | likely_valid |
| 10 | M6  | Haggan Aviation                         | ap_mechanic       | Geno Haggan          | likely_valid |
| 11 | I1  | Gowrie Group / IMIS                     | insurance         | Mark Gargula         | likely_valid |
| 12 | I4  | Wings Insurance                         | insurance         | Tom Hauge            | likely_valid |
| 13 | X5  | Insured Aircraft Title Service          | escrow_title      | Kirk Woford          | likely_valid |
| 14 | B4  | Miami International Yacht Sales         | yacht_broker      | Robert Lama          | likely_valid |
| 15 | B14 | Jeff Brown Yachts (Charleston)          | yacht_broker      | Jeff Brown           | likely_valid |

Each draft is in `100_EMAIL_DRAFTS.md` §2 under the same code.

---

## 5. The exact first 3 Don should send after the May 29 follow-ups

May 29 (Thu) is the FU1 send day for the 4 existing batch-1 likely_valid
contacts (Tampa Yacht Sales, Nashville Yacht Brokers, PSL Yacht Brokers,
Flagship Marine Survey). After those 4 follow-ups go out, Don's first 3
**new** sends from the TradeWind 100 should be:

### #1 — Brett David, Prestige Imports Miami (E2)

- **Verification:** `likely_valid` (bdavid@prestigeimports.com on About page).
- **Subject:** `routed buyers for the showroom`
- **Why first:** founder-led, multi-franchise, FL — anchor a Florida
  exotic / classic reply.
- Full body in `100_EMAIL_DRAFTS.md` §2.1 / E2.

### #2 — Travis Peffer, Premier Aircraft Sales (A1)

- **Verification:** `likely_valid` (sales@flypas.com).
- **Subject:** `routed buyers for {specialty}` — interpolate
  "multi-make multi-region single & turboprop" or "Diamond / Cirrus".
- **Why second:** largest US Diamond dealer + multi-make + multi-region
  — exactly the aircraft profile worth getting on early.
- Full body in `100_EMAIL_DRAFTS.md` §2.2 / A1.

### #3 — Brian Proctor, Mente Group (A11)

- **Verification:** `likely_valid` (brian@mentegroup.com on team page).
- **Subject:** `quick aircraft broker question`
- **Why third:** top-tier business-jet brokerage, former NARA president
  — a positive reply here is partnership-level signal, not just a beta
  signup. Worth pairing with the Premier Aircraft send to learn whether
  TradeWind reads as a tool (Premier) or a partnership opportunity
  (Mente).
- Full body in `100_EMAIL_DRAFTS.md` §2.2 / A11.

After these three (and the 4 FU1s), Don pauses, reads inbox response
patterns, then queues E4 / E11 / A2 for Friday May 30. The full Week 1
plan is in `30_DAY_SEND_SCHEDULE.md`.

---

## 6. Campaign rules — the short version

1. **Drafts only.** No auto-sends. Every approval is Don's call.
2. **From:** `Don Morrison <don@lifeofmorr.com>`. Reply-to same.
3. **Verification gate.** Only `likely_valid` and `verified` are
   queue-eligible. `unverified` requires manual override per send.
4. **Daily cap.** Enforced by the dashboard. Week-1 cap = 7.
5. **Opt-out instantly.** Any opt-out phrase in a reply → `do_not_contact`
   + cancel all queued FUs + send one-line acknowledgement.
6. **Bounce gate.** Any hard bounce → mark address `bounced`, cancel
   FUs, do not retry. Bounce rate > 5% rolling 7d → hard pause.
7. **One specific observation per email.** From `personalization_angle`.
   No generic "I noticed your business" openings.
8. **One ask per email.** Reply / 10-min call / link. Not "let's hop on
   a quick chat to explore…".
9. **Opt-out line on every cold send and every FU except COTL.**

---

## 7. Files in this campaign

| File                                                 | Purpose                                        |
|------------------------------------------------------|------------------------------------------------|
| `supabase/outreach-100-leads.sql`                    | 100-lead load. Idempotent. Run via SQL Editor. |
| `go-to-market/outreach-autopilot/100_EMAIL_DRAFTS.md` | 100 personalized drafts + non-email channels. |
| `go-to-market/outreach-autopilot/30_DAY_SEND_SCHEDULE.md` | Weekly cadence + hard-pause rules.         |
| `go-to-market/outreach-autopilot/FOLLOWUP_SEQUENCES.md` | FU1 / FU2 / COTL templates + stop rules.    |
| `go-to-market/outreach-autopilot/100_EMAIL_COMPLIANCE_CHECKLIST.md` | Per-send + per-week compliance.   |
| `go-to-market/outreach-autopilot/100_LEAD_CAMPAIGN_STATUS.md` | This file.                                |

---

## 8. Dashboard surface area (Phase 7)

`/admin/outreach` now shows:

- **Campaign: TradeWind 100** badge in the header.
- **Total leads N / 100** badge next to it.
- **Daily limit X / Y sent today** indicator (with cap-reached banner
  when the cap is hit).
- **8-tile campaign KPI strip:** Total leads, Verified, Queued, Sent,
  Replies, Positive, Demos, Beta invited.
- **6-tile deliverability KPI strip:** Delivered, Bounced, Bounce rate
  (with warn/bad tones), Unverified, Follow-ups due, DNC.
- **Verification filter** in the Filters bar (any / verified /
  likely_valid / unverified / bounced / invalid / do_not_email).
- **Approve Selected (N)** bulk action in the Queue tab, with checkbox
  selection per draft + Select all / Clear helpers.

---

## 9. Pre-launch sign-off

Don checks the 6 boxes in `100_EMAIL_COMPLIANCE_CHECKLIST.md` §"Pre-launch
sign-off". When all are checked, the first 3 sends in §5 go out (after
the May 29 FU1s for the existing 4).
