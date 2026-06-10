# SUPPORT OPERATIONS

**Phase:** Founder-led support during private beta.
**Primary inbox:** morrisondon89@gmail.com
**Future inbox:** support@gotradewind.com (post-domain cutover)
**Owner:** Don Morrison

---

## 1. SUPPORT CHANNELS (during beta)

| Channel | Use For | Response SLA |
|---|---|---|
| Email (morrisondon89@gmail.com) | All beta support, bug reports, account issues | 4 hours business day, 24 hours weekend |
| In-app "Report Bug" button | Bug reports (preferred — auto-captures context) | Tied to severity SLA below |
| In-app feedback widget | Feature feedback, suggestions | 48 hours (acknowledge, not necessarily action) |
| Private Slack (optional, see beta plan) | Real-time questions during business hours | Best-effort within business hours |
| Founder calls (scheduled) | Onboarding, deep dives, escalations | Booked via Calendly or direct email |

**No public-facing support form yet.** All inbound flows through email or in-app — keeps beta scope manageable.

---

## 2. BUG REPORT FORMAT

When a user emails or fills the in-app form, capture (or ensure auto-capture):

```
TITLE: [short, action-oriented — "Save listing button does nothing on iOS Safari"]
REPORTED BY: [user email + role]
DATE / TIME: [ISO timestamp]
URL: [full URL where bug occurred]
USER AGENT: [browser, OS, device — auto-captured by in-app form]
STEPS TO REPRODUCE:
  1.
  2.
  3.
EXPECTED:
ACTUAL:
SCREENSHOT / VIDEO: [attached or linked]
SEVERITY: [P0 / P1 / P2 / P3 / P4 — see section 3]
WORKAROUND (if any):
```

If the report is missing fields, reply within SLA acknowledging receipt and asking for the missing info. Never let a report sit unacknowledged.

---

## 3. SEVERITY LEVELS

| Severity | Definition | Examples | Response SLA | Resolution Target |
|---|---|---|---|---|
| **P0 — Critical** | Site down, data loss, security breach, payment failure affecting all users | Site returns 500 globally, user data leaked, Stripe webhook failures losing transactions, admin account compromised | Acknowledge ≤ 30 min, status update every hour, all-hands focus | ≤ 4 hours |
| **P1 — High** | Core flow broken for many users, no workaround | Cannot create listing, cannot log in, AI Concierge errors for all users, dealer dashboard blank | Acknowledge ≤ 2 hours | ≤ 24 hours |
| **P2 — Medium** | Important feature broken for some users OR workaround exists | One vertical's filter misbehaves, one dealer's CSV import fails on edge case, OG preview wrong on one route | Acknowledge ≤ 8 hours | ≤ 7 days |
| **P3 — Low** | Minor bug, cosmetic, or rare edge case | Typo, slight layout issue on uncommon screen size, slow load on one page (not failing) | Acknowledge ≤ 48 hours | Best effort within 30 days |
| **P4 — Trivial / Enhancement** | Polish, nice-to-have, suggestions | Color preference, copy tweak, optional feature ask | Acknowledge ≤ 1 week | Backlog — no commitment |

**Severity-assignment rule:** Owner assigns severity at triage. Reporter's severity is treated as input, not gospel. A user calling a typo "P0" gets a kind acknowledgment and reassignment to P3/P4.

---

## 4. RESPONSE TIME TARGETS — SUMMARY

| Severity | Acknowledge | First Update | Resolve |
|---|---|---|---|
| P0 | 30 min | Every 1 hr until resolved | 4 hr |
| P1 | 2 hr | Every 4 hr until resolved | 24 hr |
| P2 | 8 hr | Daily | 7 days |
| P3 | 48 hr | Weekly | 30 days |
| P4 | 1 week | None required | Backlog |

Business hours = 8am–8pm Eastern, Mon–Fri. Outside hours, double the acknowledge SLA for P2–P4. P0 and P1 stay 24/7 during beta.

---

## 5. ESCALATION PATH

During beta, single-tier escalation (everything ladders to Don). Post-beta, this expands.

| Trigger | Escalation |
|---|---|
| P0 reported | Don is notified immediately (email + SMS + Slack). |
| P0 not acknowledged within 30 min | Auto-escalate to Don's SMS (set up email forwarding rule with priority filter). |
| Security incident (suspected breach, leaked data, role escalation, payment tampering) | Don immediate. Follow incident response in `DATA_PRIVACY.md`. Lock down affected accounts. Audit log review. |
| Stripe dispute or chargeback | Don within 1 business day. Respond to dispute within Stripe's deadline (usually 7–10 days). |
| Legal/compliance inquiry (DMCA, FTC, state DOI, FAA, USCG, etc.) | Don immediate. Acknowledge with "we received your inquiry, will respond within 5 business days." Then consult counsel before substantive response. |
| Press inquiry | Don. Coordinate with sales/comms posture in `SALES_ENABLEMENT_PACKAGE.md`. |
| User threatens churn over support issue | Don personally takes the next message. |

---

## 6. WEEKLY QA REVIEW

**When:** Every Monday morning, before any other work.

**Inputs:**
- All open bugs in `BUG_TRIAGE_BOARD.md`
- All feedback from the week (in-app widget + email + Slack)
- Edge function error rates from Supabase dashboard
- Stripe error / dispute log
- Anthropic + OpenAI quota / error reports
- Vercel deployment health
- Any P0/P1 incidents from the week

**Outputs:**
- Reprioritized bug board (close fixed, escalate stale, demote no-longer-relevant)
- Weekly beta digest email to all users (what shipped, what's next, how to give feedback)
- Updated `GO_LIVE_CONTROL_CENTER.md` if any gates moved
- Identified themes from the week to feed into product priorities

**Cadence:** 60–90 minutes weekly. Non-negotiable during beta.

---

## 7. KNOWN ISSUE TRACKING

Public-facing or beta-user-facing "known issues" list maintained in-app at `/help/known-issues` (or in beta Slack `#announcements`).

Each entry:
- Issue title
- Symptom user might see
- Workaround (if any)
- Status: investigating / fix in progress / fix scheduled / resolved
- ETA

Update at every weekly QA review.

---

## 8. KNOWN-GOOD STATE / KNOWN-BAD STATE

Track these in `BUG_TRIAGE_BOARD.md` headers so anyone reading the board has context:

- **Last known-good commit:** `70d8cad` (as of 2026-05-26)
- **Last full QA pass:** 2026-05-26 (per `FINAL_QA_REPORT.md`)
- **Open P0 bugs:** 0
- **Open P1 bugs:** 0

If P0/P1 counts go non-zero, the beta is in INCIDENT MODE — pause new user onboarding until cleared.

---

## 9. USER COMMUNICATIONS DURING INCIDENT (P0/P1)

Template for site-down email:

> Subject: TradeWind — service interruption update
>
> [Time], [Date]
>
> We're investigating an issue affecting [specific area / all users]. The team is on it.
>
> Status: [investigating / fix in progress / monitoring after fix]
> Impact: [what's affected]
> Workaround: [if any]
> Next update: [time]
>
> We'll send another update no later than [time]. You can reply to this email if you have additional context.
>
> — Don

Send at: detection, every hour during, on resolution. Be specific. Never spin. Users respect honesty.

---

## 10. POST-INCIDENT REVIEW (after every P0)

Within 48 hours of resolution:

1. Write a brief postmortem (in `BUG_TRIAGE_BOARD.md` or separate `POSTMORTEMS/` folder):
   - Timeline: detection → triage → mitigation → resolution
   - Root cause
   - Why it wasn't caught earlier
   - What we changed (code, process, monitoring)
   - What we owe users (refund, communication, etc.)
2. Send users a follow-up: what happened, what we did, what we changed. Plain language.
3. Add a regression test or monitor to prevent recurrence.
4. Update `GO_LIVE_CONTROL_CENTER.md` if a gate needs to move.

---

## 11. SUPPORT METRICS (review weekly)

Track in a simple spreadsheet:

- Total bug reports this week
- New bugs by severity (P0/P1/P2/P3/P4)
- Bugs closed this week
- Average acknowledge time per severity
- Average resolve time per severity
- User satisfaction proxies: replies thanking us, replies escalating, churn signals

If acknowledge SLA misses happen twice in a week at any severity, that's a process problem, not a one-off — fix the process before the next incident.

---

**Support during beta IS the product. Every well-handled ticket buys forgiveness for the next bug. Every dropped ticket costs a beta user.**
