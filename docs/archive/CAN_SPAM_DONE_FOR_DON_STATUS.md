# CAN-SPAM — DONE-FOR-DON STATUS

_Maximum done-for-Don mode · 2026-06-03_

## Verdict: code-complete + client config done; ONE server secret left for Don.

CAN-SPAM (15 U.S.C. §7704) requires every commercial email to carry **(1) an
opt-out mechanism** and **(2) a valid physical postal address**. Both are built.

## What's done

| Piece | Status | Where |
|---|---|---|
| Opt-out line on every email | ✅ built | `appendCanSpamFooter` adds one if the model didn't (`supabase/functions/_shared/outreach-compliance.ts`) |
| Physical address in email footer | ✅ built | same module appends `Tradewind · <address>` for `channel === "email"` |
| Hard gate against non-compliant scaling | ✅ built | `build-daily-queue` refuses to draft email until the address secret is set |
| Confirmed address | ✅ | `790 E Broward Blvd, Fort Lauderdale, FL 33301` |
| Client mirror env var | ✅ **set by Claude** | Vercel Production `VITE_BUSINESS_MAILING_ADDRESS` (drives the admin CAN-SPAM indicator) |
| Admin indicator | ✅ built | `AdminOutreach.tsx` shows green "CAN-SPAM ready" once the client var is present (after redeploy) |

## The ONE thing Don must do (server secret — not via chat)

Set the **server-side** address secret so `build-daily-queue` is unblocked and the
real email footers carry the address:

- **Platform:** Supabase
- **Location:** Dashboard → Project `qwaotydaazymgnvnfuuj` → **Edge Functions → Secrets → Add new secret**
- **Secret name:** `BUSINESS_MAILING_ADDRESS`
- **Value:** `790 E Broward Blvd, Fort Lauderdale, FL 33301`  *(must match the Vercel client var exactly)*

Or via CLI once logged in:
```
supabase secrets set --project-ref qwaotydaazymgnvnfuuj BUSINESS_MAILING_ADDRESS="790 E Broward Blvd, Fort Lauderdale, FL 33301"
```

## Verify
1. `supabase secrets list --project-ref qwaotydaazymgnvnfuuj` shows
   `BUSINESS_MAILING_ADDRESS` present.
2. After the next Vercel redeploy, `/dashboard` → Admin → Outreach shows the green
   **"CAN-SPAM ready"** banner with the address.
3. A drafted outreach **email** ends with the opt-out line + `Tradewind · 790 E
   Broward Blvd, Fort Lauderdale, FL 33301`. (DMs intentionally omit the postal
   address — not subject to CAN-SPAM.)

## Reminder
Do **not** send any outreach as part of this configuration. This only makes the
pipeline *compliant when you choose to send*.
