# Missing / Partial Features — Build Plan

Companion to `FEATURE_COMPLETION_MATRIX.md`. Items grouped by priority for the private-beta launch.

## Priority A — must-fix before beta

These are either active bugs, trust/safety gaps, or commitments visibly broken in the UI.

| # | Item | What's missing | Build |
|---|---|---|---|
| 62 | DeveloperHub request-access bug | `notes` column missing on `integration_requests`; insert fails | Add `notes text` to `integration_requests`; surface request-access submissions |
| 68 | Report Message | `ReportButton` not wired into `MessageThread.tsx` | Mount per-message report icon |
| 69 | Report Inquiry | `ReportButton` not wired into `SellerInquiries.tsx` | Add report icon per inquiry row |
| 70 | Admin reports queue | `AdminFraud.tsx` shows fraud_flags only | Add "User reports" tab over `reports` table with resolve/dismiss |
| 51 | Community moderation | No admin surface to delete/hide posts/comments | Add Community tab to admin (delete + soft-hide) |
| 49 | Community comments | Table + RLS exist; no compose / list UI | Inline thread on PostCard reading/writing `community_comments` |
| 50 | Community follows | Table + RLS exist; no follow button | Add follow toggle on PostCard author header |
| 65 | Data deletion placeholder | No `/delete-my-data` route | Simple authenticated form that captures a deletion request |
| 55 | Admin integration management | `AdminRequests.tsx` doesn't show `integration_requests` | Add "Integrations" tab to AdminRequests |
| 73 | Stripe webhook idempotency | No `event.id` dedup | Add `webhook_events(event_id)` table + early-out before handler |
| 72 | Admin action logging | No writes to `audit_logs` | Add `logAuditEvent()` helper, fire from listing/fraud/report mutations |
| 66 | Cookie notice | Privacy text mention only | Mount lightweight banner with localStorage dismiss |

## Priority B — quick wins (this sprint)

| # | Item | What's missing | Build |
|---|---|---|---|
| 25 | Smart Negotiation Assistant | OfferBuilderPro lacks AI-suggest fair-range hint | Compute fair-range band client-side from `dealScore` and surface as inline hint |
| 41 | Listing Quality Autopilot | Quality panel exists; no inline live tips while typing | Already covered by `ListingQualityPanel` — verify panel reflects unsaved values |
| 42 | Trust Score System | No composite display | Add `trustScore.ts` helper; show composite in profile header |
| 40 | Video Walkaround | No upload UI in CreateListing | Add `video_url` text input + persist into `listing_videos` |
| 32 | Inventory Import | No CSV import | Stub `/dealer/import` page with template + email-the-team flow |
| 38 | Social Proof | Static demo only | Live "recent activity" rail on homepage (latest listings + community posts) |

## Priority C — defer (out-of-scope for private beta)

| # | Item | Notes |
|---|---|---|
| 22 | Demo-to-Real Conversion | Requires admin tooling; demo listings explicitly labeled |
| 33 | Dealer Website Widget | Embed snippet — needs hosted JS + CORS plan |
| 35 | Match Engine | Recommendation system requires interaction telemetry |
| 58 | Lender dashboard | Reuse service_provider role for now |
| 76, 77, 78 | Validation hardening | Pass through `_shared/validate.ts` and audit during Priority A pass |
| 84 | Rate limiting | Edge function limiter — handled at platform level (Supabase functions free tier limits) |
| 86 | Backup runbook | Capture once production cadence is set |
| 89 | Security tests | Requires Supabase test container |
| 90 | Live prod verification | Add CI gate post-deploy |

---

Steps 3 & 4 of the audit work through Priority A and the in-scope quick wins from Priority B. Priority C items are recorded here so they don't get lost but will not be built in this pass.
