# Compliance and Opt-Out Rules

This is the part of the system we never break. Outreach that violates these rules damages the brand, the deliverability, and the trust of the few people we are trying to reach.

---

## What we will do

- Contact **public business decision-makers** at **business addresses** for business purposes
- Send messages from **Don's named identity** with a working reply-to
- Identify TradeWind as a real company with a working website (`https://tradewind-marketplace.vercel.app`) and physical address in the email footer once configured
- Include the **exact opt-out line** on every cold message:
  > If this is not relevant, no worries — just tell me and I will not follow up.
- **Honor opt-outs immediately** — same day, both in the CRM and in the sender's address book
- Keep an **auditable record** of every message sent (`outreach_messages` table)
- Cap volume at **25/day**
- Send during recipient-local **business hours**, **Mon–Thu**

---

## What we will never do

- **No mass blast.** Same exact body sent to 50 leads = banned.
- **No scraped personal addresses.** Personal Gmail/Yahoo addresses obtained from data-broker lists are not allowed.
- **No fake claims.** We do not say "thousands of dealers," "X% conversion," "$Y in transactions," or any number we cannot defend.
- **No fake urgency.** No "URGENT", "last chance", "expires tonight."
- **No fake reply chains.** No "Re:" without a real prior thread.
- **No false familiarity.** No "great to meet you the other day" or "as I mentioned" if it never happened.
- **No impersonation.** Always sent from Don's identity. Never "the TradeWind team" on cold outreach.
- **No automated DMs** on LinkedIn or Instagram via unauthorized tools (against platform ToS, and obvious to the recipient).
- **No purchasing email lists.** Period.
- **No re-adding** anyone who said remove/stop/not interested.
- **No contact with minors, personal cell numbers harvested from public records, or anyone outside their business role.**

---

## The opt-out line — exact wording

Every cold outbound email must contain this exact string, on the second-to-last line before the signature:

> If this is not relevant, no worries — just tell me and I will not follow up.

Server-side enforcement (Tier 2 / Tier 3 sends):

```
if (!body.includes("If this is not relevant, no worries — just tell me and I will not follow up.")) {
  reject("missing opt-out line");
}
```

For LinkedIn/IG DMs and voicemails, the equivalent line is:
- LinkedIn / IG: "If it's a no, just say so — I won't follow up."
- Voicemail: "If it's not the right fit, no worries — just shoot me a quick email."

---

## What counts as an opt-out

Any of these, even one word, triggers `Do Not Contact = Yes`:

- "stop"
- "remove me"
- "unsubscribe"
- "take me off"
- "do not contact"
- "not interested"
- "no thanks"
- "please don't email again"
- A blank reply with subject "remove"
- A reply from their assistant requesting removal

**Action on opt-out (same day):**

1. Set `Do Not Contact? = Yes` in CRM
2. Cancel all pending follow-ups
3. Send the brief acknowledgment from Reply Template #17:
   > Hey [First] — done, you're off the list and I won't email again. Sorry for the noise. — Don
4. Never re-add. Not on a "new vertical," not "by accident," not in 6 months.

---

## What counts as a negative reply (not a hard opt-out)

These are "not now" — still respect the no, but the contact stays in CRM with a future date:

- "Maybe later" → `Status = Replied · Later`, set `Follow Up Date` to their specified window
- "Wrong person" → log; re-route to the right person if they provided
- "We use X already" → log objection; consider for nurture after 90 days
- "Talk to me in Q[N]" → set `Follow Up Date` to first day of that quarter

If no specific date is provided, default `Follow Up Date` to today + 90 days.

---

## Public-business-contact rule

Before adding a lead to the CRM, confirm:

- The contact's role is **public** (listed on company website / LinkedIn / industry directory)
- The email is the **business contact** (on company domain, footer, or directory)
- The phone is the **office line**, not a personal cell
- The LinkedIn / IG account is **business-active** (recent posts, business content)

If the contact's email or number was found on a data broker site without confirmation on the public record, **do not add them**.

---

## Volume caps

- **Per day:** 25 outbound cold messages total (across all channels)
- **Per lead:** maximum 4 outbound emails — Email 1, FU1, FU2, Final close-the-loop. After that, never.
- **Per company:** at most 2 different contacts cold-emailed within 30 days. Don't blast the same company.
- **Per IP / domain:** Resend rate limits enforce per-domain, per-hour caps. We don't try to circumvent.

---

## Duplicate prevention

The `outreach_leads` table has a unique constraint on `email` (case-insensitive). A second add attempt fails. Manual override only after Don confirms the original was archived in error.

A lead that was contacted and replied "Not interested" is **never** re-added under a different vertical, a different campaign, a different anything.

---

## Daily review (Don, 5 min/morning)

Before sending today's queue:

- [ ] Skim the queue for any banned words
- [ ] Verify the opt-out line is present on each row
- [ ] Spot-check 3 random rows — is the personalization observation real, or vague?
- [ ] Confirm no row's contact is on the DNC list
- [ ] Confirm total ≤ 25

If any check fails, fix before sending. If you can't fix it, do not send that row.

---

## Incident response

If a recipient escalates (replies with a complaint, files a spam report, threatens legal):

1. **Stop all sends to that domain immediately.** Update `Do Not Contact = Yes` on every contact at that company.
2. **Acknowledge within 24 hours** with a sincere, plain-English apology. No legal templates.
3. **Log the incident** in `Notes` with date, recipient, what happened.
4. **Review what triggered it** — voice, volume, frequency, personalization quality — and update the rules if a pattern shows up.
5. **Never argue.** If they're upset, the answer is "sorry, you're off the list, won't happen again."

The cost of one apology is small. The cost of a spam report on the sending domain is enormous.

---

## What we tell people if they ask "how did you get my info"

Honest, short answer:

> Public business listings — I found you through [their directory / website / industry membership]. Email was on your contact page.

If we got their info anywhere we can't say out loud, we shouldn't have used it. Audit the source list.
