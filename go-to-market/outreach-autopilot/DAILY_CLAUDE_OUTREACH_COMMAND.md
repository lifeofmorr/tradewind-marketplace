# Daily Claude Outreach Command

The exact prompt Don pastes into Claude each day to run the outreach autopilot. Copy from the triple-backtick block, paste verbatim, hit send.

---

## The prompt

```
You are running TradeWind outreach for Don Morrison today. TradeWind is a private-beta marketplace covering boats, autos, and aircraft, plus services, lenders, insurance, escrow, and transport. Live at https://tradewind-marketplace.vercel.app.

Read these files before doing anything:
- go-to-market/outreach-autopilot/HUMAN_VOICE_RULES.md
- go-to-market/outreach-autopilot/PERSONALIZATION_ENGINE.md
- go-to-market/outreach-autopilot/OUTREACH_SEQUENCE_LIBRARY.md
- go-to-market/outreach-autopilot/LEAD_SCORING_MODEL.md
- go-to-market/outreach-autopilot/EMAIL_AUTOMATION_WORKFLOW.md
- go-to-market/outreach-autopilot/COMPLIANCE_AND_OPT_OUT_RULES.md
- go-to-market/outreach-autopilot/OUTREACH_CRM_TEMPLATE.csv
- go-to-market/outreach-autopilot/DAILY_SEND_QUEUE.csv

Then do this:

1. Open OUTREACH_CRM_TEMPLATE.csv. Pick 10–20 leads scored 4 or 5 with Status = New or empty First Message. Bias 60% to Score 5.

2. For each picked lead, do 3 minutes of research using their website / LinkedIn / Instagram / industry directory. Update the Personalization Angle, Pain Point, and Recommended Offer columns if needed.

3. Draft Email 1 in Don's voice using OUTREACH_SEQUENCE_LIBRARY.md as the structural starting point, but rewrite to match the specific observation. Never paste a sequence verbatim — that's the skeleton, not the message. Verify the message passes the 10-second smell test in HUMAN_VOICE_RULES.md before saving.

4. Write the message into DAILY_SEND_QUEUE.csv with Status = Draft and Approved? = No. Fill all relevant columns: Date, Priority, Company, Contact, Vertical, Channel, Subject, Message, Personalization Note, CTA, Follow Up Due (= today + 3 days), Next Action.

5. For any lead already at Status = Sent with no Reply and Follow Up Due <= today, draft the appropriate follow-up (FU1, FU2, or Final close-the-loop based on sequence stage). Put each follow-up into DAILY_SEND_QUEUE.csv as a separate row.

6. Print a short summary at the end:
   - How many new Email 1 drafts written
   - How many follow-up drafts written
   - Any leads that should be downgraded or marked Do Not Contact (and why)
   - Any leads that should be promoted to Score 5 because new research changed the picture
   - The exact first action Don should take when he opens his computer in 10 minutes

Hard rules — never break:

- Every outbound message ends with the exact opt-out line: "If this is not relevant, no worries — just tell me and I will not follow up."
- Never use any banned word from HUMAN_VOICE_RULES.md.
- One specific observation per message, not a template.
- Never email a lead with Do Not Contact = Yes.
- Never queue more than 25 messages total today.
- Sign off "— Don, TradeWind". Never "the TradeWind team."
- Subjects: lowercase, 3–6 words, no emoji, no "Re:" unless real prior thread.

If anything is unclear, default to the lower-volume / more-conservative choice. We are optimizing for replies and trust, not send count.
```

---

## When to run it

- **Best time:** 1:30 PM your time, after the morning's replies are handled.
- **Frequency:** once per business day, Mon–Thu. Fridays are for reply handling and demos, not new sends.
- **Skip days:** holidays, the week of a major industry show, any day Don is on a sales call.

---

## What to do after Claude runs

1. Open `DAILY_SEND_QUEUE.csv` (or `/admin/outreach` once Tier 2 is live).
2. Read each draft. Edit any sentence that doesn't sound like Don.
3. Flip `Approved? = Yes` for the ones you'll send.
4. Send each approved message (either from Gmail or via the dashboard send action).
5. Mark `Sent? = Yes` and confirm `Follow Up Due` is set 3 days out.

---

## Variant prompts

### "Top up replies only" (when send queue is healthy)

```
Run the outreach loop for today, but only handle follow-ups and reply triage. Do not draft new Email 1s. Same files, same rules.
```

### "Refill from research" (when CRM is thin)

```
Run lead research for today. Find 15 new leads across all verticals using LEAD_RESEARCH_ENGINE.md. Add them to OUTREACH_CRM_TEMPLATE.csv with score, personalization angle, pain point, and recommended offer. Do not draft messages yet — surface the list and I'll pick which ones go into tomorrow's queue.
```

### "Reply triage" (when 5+ replies stack up)

```
Read all rows in OUTREACH_CRM_TEMPLATE.csv where Reply column has text but Status hasn't been moved past Replied. For each one, identify the reply type from REPLY_HANDLING_SYSTEM.md (1–18), draft the matching response edited to mirror their wording, and update the suggested Status. Surface a list — I'll send.
```
