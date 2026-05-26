# BUG TRIAGE BOARD

**Status:** Active (Private Beta)
**Owner:** Don Morrison
**Last reviewed:** 2026-05-26
**Update cadence:** At every bug report (real-time) + weekly QA review (Monday mornings)

---

## CURRENT STATE

| Metric | Value |
|---|---|
| Last known-good commit | `70d8cad` |
| Last full QA pass | 2026-05-26 |
| Open P0 bugs | 0 |
| Open P1 bugs | 0 |
| Open P2 bugs | 0 |
| Open P3 bugs | 0 |
| Open P4 bugs | 0 |
| Incident mode? | NO |

If P0 or P1 count goes non-zero → INCIDENT MODE: pause new beta onboarding until cleared (per `SUPPORT_OPERATIONS.md` §8).

---

## ENTRY FORMAT

Every bug logged here uses this format:

```
### BUG-[YYYY-NNN] [Title]
- **Reported by:** [user email + role, or "internal"]
- **Date:** [YYYY-MM-DD HH:MM]
- **URL:** [where it occurred]
- **Severity:** [P0 / P1 / P2 / P3 / P4]
- **Status:** [new / triaged / in_progress / fix_in_review / resolved / wont_fix / cannot_reproduce]
- **Assignee:** [Don / TBD]
- **Steps to reproduce:**
  1.
  2.
  3.
- **Expected:**
- **Actual:**
- **Workaround:**
- **Resolution commit:** [commit hash when resolved]
- **Notes:**
```

ID format: `BUG-2026-001` (year + zero-padded sequence). Increment per new bug, never reuse.

---

## P0 — CRITICAL (open)

_(none — keep this section empty unless an active P0 exists)_

---

## P1 — HIGH (open)

_(none)_

---

## P2 — MEDIUM (open)

_(none)_

---

## P3 — LOW (open)

_(none)_

---

## P4 — TRIVIAL / ENHANCEMENT (open)

_(none)_

---

## IN PROGRESS

_(none — bugs move here when actively being worked on)_

---

## FIX IN REVIEW

_(none — bugs move here when fix is committed but not yet verified by reporter)_

---

## RECENTLY RESOLVED (last 14 days)

_(none yet — entries get archived after 14 days into the resolved log below)_

---

## RESOLVED LOG (archive — newest first)

_(empty at launch — historical entries go here for institutional memory and pattern-spotting)_

---

## WON'T FIX / DUPLICATE / CANNOT REPRODUCE

_(empty — entries land here with reason captured for transparency)_

---

## OPERATIONAL NOTES

### Triage discipline
- **Every new bug gets a severity within the acknowledge SLA** (see `SUPPORT_OPERATIONS.md` §3).
- Reporter's severity is input, not gospel — owner sets the real severity at triage.
- Bugs with no reproducer get tagged `cannot_reproduce` after 7 days if no further info from reporter; user gets a final ping before that.

### Recurrence prevention
- Every resolved P0 or P1 must have either (a) a regression test, or (b) an explicit note in the entry explaining why a test isn't feasible.
- Postmortem required for every P0 within 48 hours of resolution (`SUPPORT_OPERATIONS.md` §10).

### Aging rules
- Any P2 open > 7 days: review at weekly QA, decide stay / escalate / demote.
- Any P3 open > 30 days: review, decide stay / demote to P4 / wont_fix.
- Any P4 open > 90 days: auto-archive to `wont_fix` unless owner re-prioritizes.

### Pattern spotting
- At every weekly review, scan resolved log for clusters (same component, same flow, same vertical).
- 3+ bugs in the same surface area within 30 days → flag for design review, not just patching.

---

## EXAMPLE ENTRIES (for reference — delete from here once real bugs arrive)

### BUG-EXAMPLE-001 — Save listing button does nothing on iOS Safari
- **Reported by:** demo-buyer@example.com (Buyer)
- **Date:** 2026-05-XX 14:32 ET
- **URL:** https://tradewind-marketplace.vercel.app/boats/[id]
- **Severity:** P2
- **Status:** triaged
- **Assignee:** Don
- **Steps to reproduce:**
  1. Open listing on iOS Safari 17.x
  2. Tap "Save"
  3. Observe no visual change, no persistence
- **Expected:** Heart icon fills, listing appears in Saved list
- **Actual:** No visible change; refresh shows it was NOT saved
- **Workaround:** Use desktop browser
- **Notes:** Touch event handler probably swallowed by parent gesture region. Reproduces in iOS Simulator.

### BUG-EXAMPLE-002 — Dealer CSV import drops rows with embedded commas in description
- **Reported by:** internal (QA)
- **Date:** 2026-05-XX
- **URL:** https://tradewind-marketplace.vercel.app/dashboard/dealer/import
- **Severity:** P1
- **Status:** in_progress
- **Assignee:** Don
- **Steps to reproduce:**
  1. Upload CSV where description field contains `,` inside a quoted string
  2. Importer parses quoted-string boundary incorrectly
  3. Row gets split into two malformed rows
- **Expected:** Quoted commas preserved in description
- **Actual:** Row corruption
- **Workaround:** Strip commas from description before upload (documented in dealer onboarding email)
- **Notes:** Switch CSV parser from naive split to standards-compliant parser (RFC 4180).

**Delete the EXAMPLE entries above when the first real bug lands.**

---

**Board hygiene > board volume. A clean, well-triaged board with 5 bugs is more useful than a chaotic one with 50.**
