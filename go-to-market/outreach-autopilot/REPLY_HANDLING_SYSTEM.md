# Reply Handling System

Every reply gets routed to one of 18 types. Each type has a template response designed to move the conversation toward demo, feedback, beta, partner, or clean close. Replies are handled by Don personally. Templates are starting points — edit the first sentence to match what they actually said.

---

## How to use this file

1. Read the reply.
2. Pick the closest type below.
3. Open the matching template, paste it, edit the first sentence to mirror their wording.
4. Send.
5. Update the lead status in `/admin/outreach`.

---

## 1. Interested — "Tell me more"

**Goal:** book a 10-min demo or send the 1-pager.

```
Hey [First] —

Awesome. Two ways we can do this:

1. I send you a private profile preview link so you can poke at it for 5 minutes on your own time.
2. We do a 10-minute Zoom — I show you the dealer/broker side, you tell me what's missing.

Either works. Which do you prefer?

— Don
```

Status → `Replied · Interested`.

---

## 2. Wants more info / a 1-pager

```
Hey [First] —

Short version below, full link at the bottom.

— TradeWind is a marketplace for boats, autos, and aircraft.
— [Their role] gets a verified profile, AI listing copy, and buyer requests filtered to their inventory/service.
— Private beta. Free 60 days. No fee until you see lead flow.

One-pager: [link]

If you want a 10-minute walk-through, I have [day/time] or [day/time] open.

— Don
```

Status → `Replied · Sent Info`.

---

## 3. Wants a demo

```
Hey [First] —

Great. Quick three questions before we hop on, so I can tailor the demo:

1. How many [boats / cars / aircraft / jobs] do you typically have live at any time?
2. Where do most of your buyers find you today?
3. What's the #1 thing about your current setup that costs you the most time?

After that, grab a slot here: [calendar link]

— Don
```

Status → `Demo Booked? = Yes` after they pick a time.

---

## 4. Asks pricing

```
Hey [First] —

Honest answer: free during beta. After beta we plan to charge per-listing for dealers and a referral fee model for service partners. Final pricing isn't locked yet — beta dealers get early pricing lock, meaning whatever rate you start on, that's your rate.

Want me to walk you through what beta looks like in 10 minutes?

— Don
```

Status → `Replied · Pricing`.

---

## 5. Asks if listings are real

```
Hey [First] —

Fair question. We're in private beta — most of what's live right now is seed inventory we built to make the marketplace feel real for early dealers. Every listing is flagged in the system, and we convert seed listings to real ones only when a verified dealer claims them.

The dealers we're onboarding right now are real, and their listings will be marked Verified Real once they're up.

Want me to send you a private view that shows the dealer side?

— Don
```

Status → `Replied · Vetting`.

---

## 6. Asks if buyers are real

```
Hey [First] —

Direct answer: real buyers are signing up daily, mostly through search. The first cohort of buyers is small — call it hundreds, not thousands. I'd rather tell you that than oversell.

What I can promise: every buyer request that gets routed to you will be a real human who searched for inventory matching what you sell. No bots, no purchased leads.

Worth a 10-min look?

— Don
```

Status → `Replied · Vetting`.

---

## 7. How does this compare to BoatTrader / YachtWorld?

```
Hey [First] —

Two real differences:

1. AI-built listing copy and summaries from your existing photos and notes — saves the 20-min-per-listing write-up.
2. We route buyer requests to you based on what you actually have, not what they paid to be visible for.

I'm not trying to replace BoatTrader/YachtWorld day one — I'm trying to be the second place dealers list, then earn the right to be the first.

Want a 10-min walk-through?

— Don
```

Status → `Replied · Competitor Q`.

---

## 8. How does this compare to Controller / Trade-A-Plane?

```
Hey [First] —

Two real differences:

1. AI-built listing summaries from your existing writeups + spec sheets — saves time on the long-form description.
2. We route buyer inquiries by mission and budget, not by who paid for the top of the page.

I'm not trying to replace Controller day one — I'm trying to be the second place brokers list and earn the right to be the first.

Want a 10-min walk-through?

— Don
```

Status → `Replied · Competitor Q`.

---

## 9. How does this compare to AutoTrader / Cars.com?

```
Hey [First] —

Two real differences:

1. AI listing copy from your photos and notes — instead of typing each one or paying for a feed.
2. Buyer requests filtered to your actual inventory, not bought leads.

Day one I'm not trying to replace AutoTrader — I'm trying to be the second place you list and earn it from there.

Want a 10-min walk-through?

— Don
```

Status → `Replied · Competitor Q`.

---

## 10. Asks about aircraft (general curiosity)

```
Hey [First] —

Yes — aircraft is live. We cover jets, turboprops, pistons, and helicopters. Brokers and service shops both have profiles. Buyer inquiries are filtered by category and mission profile.

If you've got a specific question, just send it. Otherwise I can ship a private link to look at the aircraft section.

— Don
```

Status → `Replied · Info`.

---

## 11. Asks about escrow / financing

```
Hey [First] —

Both are part of the platform.

Financing: pre-qual on listing pages, lender partner per category (marine, aviation, specialty auto). Buyers can request a quote in one click.

Escrow / title: we're partnering with one preferred escrow per category to handle closings cleanly.

If financing or escrow is what's keeping a deal stuck right now, tell me which one and I can show you how it works.

— Don
```

Status → `Replied · Info`.

---

## 12. Not interested

```
Hey [First] —

All good. Marking you off the list. If you ever want to take another look, my email is in this thread.

Best,
Don
```

Status → `Do Not Contact? = Yes`. Done.

---

## 13. Follow up later / wrong timing

```
Hey [First] —

No problem. I'll come back to you in [their specified window — Q3, after the show, in 60 days]. Putting a calendar reminder on it now.

— Don
```

Status → `Replied · Later` and `Follow Up Date` = their specified window.

---

## 14. Wants to list (real listing candidate)

```
Hey [First] —

Excellent. Easiest path:

1. I send you a private invite link to claim your dealer profile.
2. You can either upload listings manually or send me a CSV / link to your existing inventory feed and I'll get the first 10 imported.
3. Once you're happy with the profile, we flip it live.

Want me to send the invite link now?

— Don
```

Status → `Real Listing Candidate? = Yes`, `Beta Invited? = Yes`.

---

## 15. Wants partnership (service / lender / insurance / escrow / transport)

```
Hey [First] —

Great. Let's make it real. A 20-minute call this week to align on:

1. What we route to you (lead profile, geo, type)
2. What you commit to on response time
3. What you do for our buyers (rate, service level, anything exclusive)

I have [day/time] or [day/time] open. Pick one and I'll send the calendar invite.

— Don
```

Status → `Partner Candidate? = Yes`, schedule partnership call.

---

## 16. Referral — they're pointing me to someone else

```
Hey [First] —

Really appreciate the intro. Mind if I CC you on the email, or do you want to forward it yourself?

If you're forwarding, here's the one-line version you can use:

"Hey [Their Contact] — meet Don, he's building TradeWind, a marketplace covering [vertical]. Worth 10 min."

Thanks again.

— Don
```

Status → log the referral, send to the new contact same-day.

---

## 17. Asks to be removed

```
Hey [First] —

Done — you're off the list and I won't email again. Sorry for the noise.

— Don
```

Status → `Do Not Contact? = Yes`. Done. Never re-add.

---

## 18. Auto-reply / OOO

No action. Wait until their return date + 1 business day, then resend the original.

If the OOO mentions a different contact, optionally redirect:

```
Subject: redirected from [First]'s OOO

Hey [Other Contact] —

Reaching out because [First] is out and the OOO pointed to you. Original note below — happy to circle back to [First] when they're back, or chat with you now.

[Original email body]

— Don
```

---

## Routing summary

| Reply type | New status | Move toward |
|---|---|---|
| 1 Interested | Replied · Interested | Demo |
| 2 More info | Replied · Sent Info | 1-pager → Demo |
| 3 Wants demo | Demo Booked | Demo |
| 4 Pricing | Replied · Pricing | Beta invite |
| 5 Listings real? | Replied · Vetting | Honest answer → Demo |
| 6 Buyers real? | Replied · Vetting | Honest answer → Demo |
| 7-9 Competitor Q | Replied · Competitor Q | Differentiate → Demo |
| 10 Aircraft Q | Replied · Info | Info → Demo |
| 11 Escrow/Financing | Replied · Info | Info → Demo |
| 12 Not interested | DNC | Close |
| 13 Later | Replied · Later | Park, follow up |
| 14 Wants to list | Beta Invited | Onboarding |
| 15 Partnership | Partner Candidate | Partner call |
| 16 Referral | (logged) | New thread |
| 17 Remove me | DNC | Close |
| 18 OOO | (unchanged) | Resend later |
