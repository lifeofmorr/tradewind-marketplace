# Gmail Reply Operations — TradeWind Outreach

**Owner:** Don Morrison
**Date:** 2026-05-27
**Inbox:** don@lifeofmorr.com

---

## Label Structure

Create these labels in Gmail. Nest them under a `TradeWind` parent for a clean sidebar.

```
TradeWind/
  Replies          ← every inbound reply lands here first
  Interested       ← replied positively, has not booked yet
  Demo Booked      ← calendar link sent or call confirmed
  Follow Up Later  ← "check back in Q3", "busy now", "ping me in 30 days"
  Not Interested   ← politely declined, no ask to remove
  DNC              ← "remove me", "unsubscribe", or any complaint
  Bounced          ← hard bounce, address is dead
```

### Label workflow

1. New reply arrives → apply `TradeWind/Replies`
2. Triage within 24 hours → apply the appropriate sub-label
3. Remove `TradeWind/Replies` once triaged (keep only the sub-label)
4. `DNC` and `Bounced` never get removed — they're permanent suppression flags
5. Update CRM status in `/admin/outreach` to match (see `CRM_REPLY_UPDATE_RULES.md`)

---

## Canned Reply Templates

Save these as Gmail canned responses (Settings → Advanced → Canned Responses).

Template names match the `ReplyTemplateKey` enum in `src/lib/outreach/replyTemplates.ts`.

---

### 1. interested — Interested, book a quick demo

**Subject:** Quick 10-min walkthrough?

```
Appreciate it. I can show you the useful parts in 10 minutes — listings,
buyer requests, deal rooms, and the dealer/broker side.

What's better for you, tomorrow or Thursday?

— Don
```

---

### 2. wants_info — Wants more info before committing

**Subject:** Quick TradeWind primer

```
Happy to send over more. Short version: TradeWind is a private marketplace
for boats, autos, and aircraft, with deal rooms, buyer requests, and a
service-partner side built in. Free for beta partners through public launch.

If a 10-minute call is easier than reading, I can show you the parts that
matter to your operation. Tomorrow or Thursday work?

— Don
```

---

### 3. wants_demo — Wants a demo

**Subject:** Booking your TradeWind demo

```
Glad to. The walkthrough is 10 minutes — I'll show your vertical's listing
flow, the buyer-request side, and the deal room.

Tomorrow or Thursday? I can do mornings or after 3pm Pacific.

— Don
```

---

### 4. asks_pricing — Asks about pricing

**Subject:** TradeWind beta pricing

```
Honest answer: beta partners pay nothing through public launch. After that,
we'll lock in an early-adopter rate that's well below the public price for
anyone who used the platform during beta.

The point of the beta is to find out what's actually worth paying for, not
to test a price point. Want a 10-minute walkthrough? Tomorrow or Thursday?

— Don
```

---

### 5. asks_if_live — Asks if the platform is live

**Subject:** TradeWind status

```
It's live and running in private beta. Real listings, real deal rooms, real
buyer requests — just restricted to invited partners right now.

You'd get full access as a beta partner: your listings on the platform, the
ability to respond to buyer requests in your vertical, and early input on
what gets built next.

Worth 10 minutes? I can show you the live platform.

— Don
```

---

### 6. not_interested — Not interested (polite decline)

**Subject:** (no subject change needed — use thread subject)

```
Understood — appreciate the honest reply.

If anything changes or you hear of someone who might be a good fit, I'd
welcome the intro.

— Don
```

---

### 7. follow_up_later — Follow up later

**Subject:** (no subject change needed)

```
Makes sense. I'll circle back then.

If anything shifts before that, you know where to find me.

— Don
```

---

### 8. remove_me — Remove me / unsubscribe

**Subject:** (no subject change needed)

```
Done — removing you now. You won't hear from me again.

— Don
```

*(Apply DNC label. Do not reply further. Update CRM immediately.)*

---

### 9. wants_to_list — Wants to list on the platform

**Subject:** Getting you set up on TradeWind

```
Great. I can walk you through the listing flow in 10 minutes and get your
account set up on the call — boats, autos, and aircraft all supported.

What's your best time tomorrow or Thursday?

— Don
```

---

### 10. default_interested — Default interested reply with beta link

**Subject:** TradeWind beta access

```
Appreciate you reaching out.

Here's the beta page with a quick overview and access request:
https://tradewindmarket.com/beta

If a call is easier, you can book 10 minutes here:
[CALENDAR_LINK]

Either works — just let me know what you'd find most useful.

— Don
```

*(Replace [CALENDAR_LINK] with your Cal.com or Calendly URL once configured.)*

---

## Daily Triage Checklist

- [ ] Open `TradeWind/Replies` — process every unread reply
- [ ] Apply sub-label (Interested / Demo Booked / Follow Up Later / Not Interested / DNC / Bounced)
- [ ] Reply within 24 hours to all Interested and Demo Booked threads
- [ ] Update `/admin/outreach` CRM status (see `CRM_REPLY_UPDATE_RULES.md`)
- [ ] Add DNC contacts to suppression list before next send
