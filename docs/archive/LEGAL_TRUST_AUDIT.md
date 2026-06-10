# Legal / Trust Audit — TradeWind (Phase 9)

**Date:** 2026-06-03

## Verdict: Strong for private beta. One real disclaimer gap found and FIXED this pass. Two roadmap items (DSAR self-serve, counsel sign-off) before full public launch.

## Core pages — present & substantive
| Page | File | Substantive? |
|---|---|---|
| Terms | `src/pages/SimplePages.tsx:271-308` | ✅ marketplace role, no-title-assumption, no-broker-status, AI disclaimer (§5) |
| Privacy | `SimplePages.tsx:310-339` | ✅ collection/use/deletion/cookies/third-party |
| Trust Center | `src/pages/public/TrustCenter.tsx` | ✅ verification, inspections, scam awareness, demo explainer |
| Delete my data | `src/pages/public/DataDeletion.tsx:40-46` | ✅ form writes to `data_deletion_requests`, SLA stated |

## Disclaimer coverage
| Type | Present? | Where |
|---|---|---|
| (a) Demo inventory | ✅ | `demoDisclaimer.ts` + ListingCard badge + `ListingDetail.tsx:112-122` banner + InquiryForm block |
| (b) AI price estimates | ✅ | Terms §5 (`SimplePages.tsx:296-300`); deal-score reasons surfaced |
| (c) Aircraft airworthiness/title/logbook | ✅ **PRESENT** | `ListingDetail.tsx:184-202` — "TradeWind does not verify FAA status, airworthiness, or maintenance compliance" (an earlier draft of this audit wrongly called this missing; it is present and substantive) |
| (d) Financing/insurance/escrow not-a-provider | ✅ **FIXED this pass** | added to `RequestPages.tsx` RequestShell (`:48-56`): "TradeWind is not a lender, insurer, escrow agent, broker, or financial institution…" covers all 5 service forms |
| (e) No guaranteed buyers/sale | ⚠ weak | Terms convey marketplace role; recommend an explicit seller-onboarding line |

## Data-subject rights
- Deletion: ✅ working form → table → manual admin process (`DATA_DELETION_PROCESS.md`).
- Access/portability: ⚠ admin-assisted only; **self-serve DSAR export not built** — fine for private beta, build before EU/public scale.
- Correction/objection: ✅ profile editor + opt-out + admin ban flag.

## Before full public launch
1. Legal counsel sign-off on disclaimer wording (LEGAL_LIVE_READINESS.md flags this).
2. Add explicit "no guaranteed sale volume" to seller onboarding/Terms.
3. Self-serve DSAR + cookie banner + DPA before EU traffic.

**Blockers for private beta:** none remaining after this pass. **For public launch:** counsel sign-off.
