# Outreach Production Audit — TradeWind (Phase 6)

**Date:** 2026-06-03 · **No emails were sent during this audit.**

## Verdict: SAFE. Sending is human-gated; no auto-sender exists. One CAN-SPAM gap to close before mass send.

## Data model & counts
- Tables: `outreach_leads`, `outreach_messages`, `outreach_followups`, `outreach_replies`, `outreach_activity_log`, `beta_pipeline` (`20260526_outreach_autopilot.sql` + `_v2`).
- Per `SEND_READY_PRIORITY_REPORT.md`: **100 leads** total → **66 send_ready** (verified/likely_valid), 16 needs_review, 18 non-email channel, 2 removed (hard-bounced). (Task brief said "130+/65"; the committed reports show 100/66 — the lower, verified numbers are what the data actually supports.)

## Is sending paused / is there a kill-switch? — SAFE BY DESIGN
- **No function auto-sends.** `send-email` is a transactional endpoint that must be explicitly invoked; there is **no cron** in `supabase/functions/*` that queries approved messages and sends them.
- `build-daily-queue` only **drafts** messages with `status='drafted', approved=false` (`:243`), and **hard-filters** to `email_verification_status in ('verified','likely_valid')` and `do_not_contact=false` (`:113-116`). Bounced/invalid/DNC addresses can never be drafted.
- Every send requires manual admin approval in `AdminOutreach.tsx` (`:1298-1309`); UI enforces a daily cap of 7 (`CAMPAIGN_DAILY_CAP`, `:237,569`) — soft (UI-level) cap.
- Opt-out/negative replies auto-set `do_not_contact=true` and cancel follow-ups (`classify-outreach-reply/index.ts:150-177`).

## CAN-SPAM — WARNING
| Requirement | Status |
|---|---|
| Real from/reply-to | ✅ `TradeWind <hello@gotradewind.com>` / support@ (`send-email:26,109`) |
| Opt-out honored | ✅ immediate via `do_not_contact` |
| Opt-out language | ✅ text line in template |
| **Physical postal address** | ❌ **MISSING** in footer (`send-email:107-110`) |
| Unsubscribe link | ⚠ text-only (acceptable for 1:1 founder mail, add link before bulk) |

**Action before any mass send:** add a physical business address line to the email footer.

## Quality gates — PASS
- Banned-phrase list + tone/quality scoring (`generate-outreach-message:62-187`); deterministic fallback template if AI fails (`build-daily-queue:210-233`, `_shared/outreach-fallback.ts`). Fallback voice rules are unit-tested (`src/__tests__/fallbackMessageGenerator.test.ts`).

## Blockers
| Item | Severity | Status |
|---|---|---|
| Auto-send without approval | — | ✅ does not exist |
| CAN-SPAM physical address | Medium | ⛔ add before mass send |
| Daily cap is UI-only | Low | consider DB-level hard cap |
