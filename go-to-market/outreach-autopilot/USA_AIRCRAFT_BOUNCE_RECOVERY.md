# USA Aircraft Brokers — Bounce Recovery Pack

**Date:** 2026-05-26
**Lead status:** `bounced` (info@usaaircraft.com rejected today's send)
**DNC applied to:** info@usaaircraft.com only — other addresses are not on DNC

---

## What we know about the company

- **Website:** https://www.usaaircraft.com/
- **Physical address:** 257 Ambert Street, Ste D4, Pensacola, FL 32503
- **Main phones:** (866) 872-2207 · (850) 637-6125
- **LinkedIn company page:** https://linkedin.com/company/usaaircraft/
- **Named brokers visible on site:** Scott Hager, Carlos Cintron, Vaughn, Chris Walls
- **Working alternate emails (per their public site):**
  - `clientsupport@usaaircraft.com` — best general-business alternate
  - `advertising@usaaircraft.com` — would be a partnership-coded inbox; secondary
- **Referral form (public, not for cold outreach):** https://www.usaaircraft.com/agent-referral-lead

The bounced address (`info@`) is almost certainly a misconfigured forwarder or full mailbox. The rest of the domain answers mail, so the domain itself is healthy.

---

## Recommended next move (pick one, do not blast all)

| Rank | Channel | Address / URL | Why |
|------|---------|---------------|-----|
| 1 | Email | `clientsupport@usaaircraft.com` | Listed on their own site as a general inbound channel. Highest chance of a human reading it without feeling spammed. |
| 2 | LinkedIn DM | Search Scott Hager or Carlos Cintron at USA Aircraft Brokers on the company page above | Named brokers; founder-to-founder/owner feel. Best for relationship-building if email path is cold. |
| 3 | Phone | (866) 872-2207 | Only if the email + LinkedIn both go silent after 5–7 days. Use the script below. |
| 4 | Referral form | (do not use) | Public referral form, wrong context, marks us as a low-effort cold lead. |

Recommendation: send the email below to `clientsupport@usaaircraft.com` today (with Don's approval), and queue a LinkedIn connection request to one named broker as a parallel touch.

---

## Draft 1 — Corrected-contact email (`clientsupport@usaaircraft.com`)

```
Subject: correcting an earlier note to USA Aircraft Brokers

Hi —

I sent a note this morning to info@usaaircraft.com that bounced, so I am trying the address listed on your contact page instead. Apologies for the second touch.

I am Don Morrison, founder of TradeWind. We are a marketplace for boats, autos, and aircraft, currently in private beta. The reason I picked your shop: USA Aircraft Brokers carries piston and turbine listings under one roof and has been at it long enough that the broker map page actually means something — that is not the norm.

Brokers on TradeWind get a verified profile, AI-built listing copy from your existing notes and photos, and inbound buyer requests routed to the kinds of aircraft you actually carry. Free for 60 days during beta. No fee until you see real lead flow.

Would you be open to a quick 10-minute look and giving honest feedback? If clientsupport@ is the wrong inbox for this kind of thing, I would also welcome a forward to whichever broker handles new partnerships.

If this is not relevant, no worries — just tell me and I will not follow up.

— Don
TradeWind
don@lifeofmorr.com
```

**Why it is shaped this way**
- Opens by naming the bounce — turns a second touch into a polite correction, not spam.
- Specific observation (broker map + piston/turbine mix) so it does not read as a blast.
- Soft handoff line ("forward to whichever broker handles new partnerships") — gives the recipient a useful action even if they are not the right person.
- Required opt-out line included verbatim.

---

## Draft 2 — LinkedIn connection note (≤300 chars)

> Hi Scott — Don Morrison, founder of TradeWind (marketplace for boats, autos, aircraft). Reached out to USA Aircraft Brokers today via email but the info@ bounced. Hand-picking the first aircraft brokers into private beta. Open to a 10-min look either way?

> Alternate (for Carlos):
> Hi Carlos — Don Morrison, founder of TradeWind. We are building a marketplace for boats, autos, and aircraft and bringing on a small number of broker partners. Saw your name on USA Aircraft Brokers. Worth a quick connect?

---

## Draft 3 — LinkedIn DM (after connect)

```
Thanks for connecting. Short version: TradeWind = verified broker profile + AI-built listing copy + buyer requests routed to the aircraft you actually carry. Free 60-day beta, no fee until real lead flow.

Tried info@usaaircraft.com first today and it bounced, so circling through LinkedIn. Open to a 10-minute look on your own time? If it is not a fit, just say so and I will not bug you again.

— Don
```

---

## Draft 4 — Phone script (≤60 sec, only if email + LinkedIn silent after 5–7 days)

> "Hi, this is Don Morrison — I am the founder of TradeWind, a marketplace for boats, autos, and aircraft. Got 60 seconds?
>
> Quick reason for the call — we are in private beta and bringing on a small number of aircraft brokers. Tried emailing earlier this week but info@ bounced. Wanted to ask who the right person is to talk to about a partner profile.
>
> If now is bad, I can email a one-pager you can look at on your own time. What is the best address?"

---

## Updates to apply in CRM after we send

If we send Draft 1 to `clientsupport@usaaircraft.com` with Don's approval:

1. Set the lead `next_action` to `awaiting_reply_corrected_contact`.
2. Replace `email` on the lead row with `clientsupport@usaaircraft.com`.
   - Keep the bounced address in `notes` so we never queue it again.
3. Insert a new `outreach_messages` row with channel='email', status='sent',
   meta.from_address='don@lifeofmorr.com', meta.bounce_recovery=true.
4. Insert an `outreach_followups` row, due 2026-05-29 (3 business days).
5. Log to `outreach_activity_log` with action='bounce_recovery_sent'.

This SQL is **not** included in `outreach-reconciliation.sql` because none of the recovery messages have been sent yet. Run only after Don approves Draft 1.

```sql
-- Apply ONLY after Don approves and sends Draft 1.
update public.outreach_leads
   set email          = 'clientsupport@usaaircraft.com',
       status         = 'contacted',
       date_contacted = current_date,
       follow_up_date = date '2026-05-29',
       do_not_contact = false,
       next_action    = 'awaiting_reply_corrected_contact',
       notes          = coalesce(notes || E'\n', '')
                        || '[2026-05-26] Switched to clientsupport@usaaircraft.com '
                        || 'after info@ bounced. info@ stays on DNC at the address level.',
       updated_at     = now()
 where company ilike 'USA Aircraft Brokers%';
```
