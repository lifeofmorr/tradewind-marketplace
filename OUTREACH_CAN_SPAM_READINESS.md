# Outreach CAN-SPAM Readiness

Cold email outreach must comply with CAN-SPAM (15 U.S.C. §7704). The two
hard requirements for every commercial email are:

1. **A clear opt-out mechanism.**
2. **A valid physical postal address of the sender.**

This change makes both enforceable and blocks scaled email outreach until the
postal address is configured.

## What was wired

| Requirement | Where |
|-------------|-------|
| Physical address env (server) | `BUSINESS_MAILING_ADDRESS` function secret |
| Physical address env (client) | `VITE_BUSINESS_MAILING_ADDRESS` (for the dashboard indicator) |
| Compliance helper | `supabase/functions/_shared/outreach-compliance.ts` |
| **Scaling block** | `build-daily-queue` returns `409` for email when the address is unset |
| Email footer (address + opt-out) | `appendCanSpamFooter()` applied to every drafted email body |
| Opt-out line in copy | already enforced in `generate-outreach-message` prompt + `outreach-fallback` |
| Transactional email footer | `send-email` appends the address when configured |
| Dashboard indicator | `ComplianceBanner` on `/admin/outreach` (green = ready, red = blocked) |

## How the block works

`build-daily-queue` is the mechanism that *scales* outreach (drafts the daily
batch). Before drafting any **email** batch it calls `canSpamReady()`:

```
if (channel === "email" && !canSpamReady()) → 409, nothing drafted
```

So it is impossible to scale non-compliant email: with no address, the queue
builder refuses to run. LinkedIn/Instagram DMs are exempt (not commercial email
under CAN-SPAM) and are not blocked.

## The footer

`appendCanSpamFooter(body, channel)` (email only):

- adds the opt-out line if the generated copy didn't already include one
  (the model is prompted to, and the fallback templates always do — this is a
  belt-and-suspenders guard), and
- appends the physical postal address:

  ```
  —
  TradeWind · <BUSINESS_MAILING_ADDRESS>
  ```

DM channels are returned unchanged.

## Configuring it

1. Choose a valid physical address — a real mailing address, a CMRA, or a
   registered PO box are all acceptable under CAN-SPAM.
2. Set the server secret:
   ```
   supabase secrets set --project-ref qwaotydaazymgnvnfuuj \
     BUSINESS_MAILING_ADDRESS="TradeWind, 123 Example St, Suite 100, City ST 00000"
   ```
3. Set the client var in Vercel (Production): `VITE_BUSINESS_MAILING_ADDRESS`
   (same value) so the dashboard shows "CAN-SPAM ready".
4. Re-deploy edge functions + frontend.
5. Confirm `/admin/outreach` shows the green "CAN-SPAM ready" banner and that a
   freshly drafted email carries the address footer.

## Operator checklist before scaling outreach

- [ ] `BUSINESS_MAILING_ADDRESS` set (server) — queue builder runs
- [ ] `VITE_BUSINESS_MAILING_ADDRESS` set (client) — dashboard green
- [ ] Opt-out honored: negative replies stop follow-ups (existing behavior)
- [ ] DNC leads excluded from queues (existing behavior)
- [ ] Verified/likely-valid contacts only (existing deliverability gate)

## What is intentionally NOT done

- **No outreach is sent.** This change only gates and footers drafts; sending
  remains a manual, per-message approval step.
- DM channels are not given a postal footer (would be non-compliant-looking spam
  and CAN-SPAM doesn't apply to them).
