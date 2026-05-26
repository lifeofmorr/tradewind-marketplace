# TradeWind Outreach Autopilot — System Overview

A founder-led, human-voiced outreach system that finds the right leads, scores them, researches them, personalizes a message, queues sends, tracks follow-ups, handles replies, books demos, converts to beta, and tracks who pays. It is operated by **Don Morrison** (morrisondon89@gmail.com) with Claude as the working partner.

---

## What this system does, end to end

1. **Find leads** across every TradeWind vertical:
   - Boat dealers, yacht brokers
   - Auto dealers (mainstream, exotic, classic)
   - Aircraft brokers and aviation service providers (A&P, IA, avionics, MROs)
   - Marine surveyors, mechanics, transport
   - Lenders, marine/auto/aviation insurance, escrow & title
   - Buyer-side advisors and concierge buyers

2. **Score them 1–5** so we always work the highest-ROI leads first.

3. **Research each one** — what they sell, who runs it, what their digital footprint looks like, where the gap is that TradeWind fills.

4. **Personalize the message** — pull one specific observation per lead. Never a template blast.

5. **Write outreach** in Don's voice: short, plain English, no SaaS buzzwords, honest about beta status.

6. **Create a daily send queue** with channel (email / LinkedIn / Instagram / phone), subject line, message body, CTA.

7. **Track follow-ups** — first email, +3 days, +7 days, +14 days close-the-loop.

8. **Handle replies** with 18 mapped response templates that always move toward demo, feedback, beta, or partnership.

9. **Book demos** — qualifying questions, calendar link, pre-demo notes, post-demo follow-up.

10. **Convert to beta** — free 60-day program, free profile, free first 10 listings, early pricing lock, no fee until lead flow proven.

11. **Track objections, feedback, paying-customer signals** so we keep learning what actually closes.

---

## Operating principles

- **Sounds like Don wrote it.** Every message. No AI tells. See `HUMAN_VOICE_RULES.md`.
- **Public business contacts only.** No scraped personal data, no spam, no fake claims. See `COMPLIANCE_AND_OPT_OUT_RULES.md`.
- **Founder-led.** Don approves before send. The system drafts; Don ships.
- **One thing per message.** A specific observation → a small ask. Not five things.
- **Beta-honest.** We say "we are in private beta" and "I am building this" — no fake traction.
- **Stop on no.** Negative reply or opt-out flips Do Not Contact = true. Period.
- **Cap volume.** 10–25 sends/day max in Mode B. Quality over reach.

---

## The 17-part file index

| # | File | Purpose |
|---|---|---|
| 1 | `OUTREACH_AUTOPILOT_OVERVIEW.md` | This file. |
| 2 | `HUMAN_VOICE_RULES.md` | Don's voice — what to write, what to never write. |
| 3 | `LEAD_RESEARCH_ENGINE.md` | How to find leads in every vertical + data to collect. |
| 3b | `OUTREACH_CRM_TEMPLATE.csv` | CRM schema. |
| 4 | `LEAD_SCORING_MODEL.md` | 1–5 scoring rubric. |
| 5 | `PERSONALIZATION_ENGINE.md` | Message structure + angle library. |
| 6 | `OUTREACH_SEQUENCE_LIBRARY.md` | 13 vertical-specific sequences. |
| 7 | `DAILY_SEND_QUEUE.csv` | The daily working queue. |
| 8 | `EMAIL_AUTOMATION_WORKFLOW.md` | Mode A (draft+approve) and Mode B (controlled send). |
| 9 | `REPLY_HANDLING_SYSTEM.md` | 18 reply types → templates. |
| 10 | `DEMO_BOOKING_SYSTEM.md` | Reply → qualify → demo → follow-up. |
| 11 | `BETA_CONVERSION_SYSTEM.md` | The 60-day beta offer + onboarding. |
| 12 | `AUTOMATION_WORKFLOWS.md` | Minimum / Better / Best automation tiers. |
| 13 | Admin Outreach Dashboard | In-app — `/admin/outreach`. |
| 14 | `DAILY_CLAUDE_OUTREACH_COMMAND.md` | The daily Claude prompt. |
| 15 | `FIRST_30_READY_TO_SEND_EXAMPLES.md` | 30 starter messages. |
| 16 | `COMPLIANCE_AND_OPT_OUT_RULES.md` | What we will and will not do. |
| 17 | Build verification | `npm run typecheck`, `npm run build`, `npx vitest run`. |

---

## The daily loop (what Don actually does)

```
Morning (15 min):
  1. Open /admin/outreach
  2. Read overnight replies — handle with REPLY_HANDLING_SYSTEM templates
  3. Approve / edit today's queued drafts
  4. Hit send (or mark sent if sending outside the app)

Afternoon (15 min):
  5. Run DAILY_CLAUDE_OUTREACH_COMMAND.md prompt to refill the queue
  6. Review new drafts, flag anything that doesn't feel right
  7. Note any new objections or signals → feed back into voice rules

End of week (30 min):
  8. Review demo bookings, beta invites, paying-customer signals
  9. Cull the do-not-contact list, archive cold leads
 10. Adjust scoring / personalization based on what's actually converting
```

---

## Definition of done for this system

- 30+ leads in the CRM, scored, with personalization angles written
- 30 ready-to-send drafts in the send queue
- Admin Outreach Dashboard live at `/admin/outreach`
- Don can run the whole loop himself in under 30 min/day
- Every message that goes out sounds like a human wrote it for that specific company
