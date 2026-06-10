# LIVE DATA POLICY

**Effective:** Immediately (Private Beta launch)
**Owner:** Don Morrison
**Audience:** Founder, beta users, future team members, partners

This document defines what is allowed, what is required, and what is prohibited regarding data, claims, listings, media, and integrations on TradeWind during private beta and continuing into public launch.

**Core principle:** If we wouldn't be comfortable defending it in front of a buyer, a regulator, or a journalist, we don't do it.

---

## 1. DEMO LISTINGS

| Rule | Detail |
|---|---|
| All demo listings MUST be labeled `[DEMO]` in the title or have a clear visual demo badge | No exceptions. Buyer must never confuse a demo with a real inventory item. |
| Demo listings may use stock-grade photography only if rights are confirmed | Source-matched, dealer-grade demo photography is preferred (see commit `b0a15b0`). |
| Demo listings must not include real seller names, real phone numbers, or real serial numbers / HINs / N-numbers / VINs | Use clearly fabricated identifiers (e.g., `DEMO-001`, `N123DEMO`). |
| Demo listings should be visually obvious as demo at every surface (card, detail page, OG preview, search results) | Verify on every release. |
| When real inventory volume exceeds demo volume, demo listings should be reviewed for retirement | Don't let demos accumulate forever. Currently 65 demo listings; cap stays unless deliberately raised. |
| Demo listings may be excluded from search indexability (`noindex`) | Decision-pending — see `DOMAIN_LAUNCH_CHECKLIST.md` §7. |

---

## 2. REAL LISTINGS

| Rule | Detail |
|---|---|
| Real listings require owner / dealer / broker approval before publish | No copying from third-party platforms without explicit permission. |
| Dealer-submitted listings go live after admin moderation pass during beta | Post-beta: automated fraud-screen + selective human review. |
| Private-seller listings always require human moderation (during beta) | Higher fraud risk; founder reviews each one. |
| Listings must include: accurate year/make/model, accurate condition, at least one real photo, accurate location | Missing-info listings are flagged, not published, and the seller is contacted. |
| Sellers attest at submission: "I represent that I own this asset OR have the seller's authorization to list it" | Attestation logged. False attestation = account suspension. |
| Any listing flagged by fraud-screen edge function gets human review within 24 hours | No auto-publish if score above threshold. |

---

## 3. MEDIA / PHOTOGRAPHY RIGHTS

| Rule | Detail |
|---|---|
| Listing photos must be owned by the seller OR the seller must have explicit permission to use them | Seller attests at upload. |
| No scraping or copying photos from other platforms (BoatTrader, Controller, AutoTrader, DuPont Registry, BringATrailer, etc.) | Even for demo seeding. Use stock-rights-cleared OR commissioned OR seller-supplied only. |
| Watermarks from other platforms must NEVER appear on TradeWind listings | Auto-detection added to moderation queue; manual rejection enforced. |
| If a third party requests takedown of a photo claiming infringement | Take down within 24 hours, contact uploader, document in `BUG_TRIAGE_BOARD.md` under a `legal` tag. Follow DMCA process. |
| Editorial / marketing photography (homepage hero, blog imagery, social) must be either owned, licensed, or commissioned | Maintain a `MEDIA_LICENSES.md` (optional) ledger if licensing volume grows. |

---

## 4. DEALER INVENTORY IMPORT

| Rule | Detail |
|---|---|
| Dealers may import their OWN inventory via CSV or DMS feed | Authorized by the dealer's onboarding agreement. |
| TradeWind will NEVER scrape, ingest, or copy another dealer's inventory without their explicit written permission | This applies even if data is publicly visible elsewhere. |
| If a dealer requests a competitor's inventory be imported on their behalf, request explicit chain-of-authorization first | If unverifiable, decline. |
| Imported listings carry the dealer's attribution; original-source URL retained internally for traceability | Audit-logged. |
| Imported listings still go through fraud-screen and moderation | No exception for "trusted" dealers in beta. |

---

## 5. USER-SUBMITTED CONTENT MODERATION

| Rule | Detail |
|---|---|
| All user-submitted listings, profile content, reviews, and messages flow through moderation | During beta: human-reviewed. Post-beta: AI pre-screen + human review of flagged. |
| Prohibited content: stolen-asset listings, weapons of any kind, anything illegal under federal or applicable state law, hate speech, harassment | Removal + account suspension on first offense. |
| Listing descriptions must not include phone numbers or external links during beta | Prevents off-platform fraud + scraping evasion. |
| Profile bios must be truthful; false credential claims (e.g., "FAA-certified" when not) are grounds for suspension | Verifiable claims required for broker/SP credentials. |
| Reviews must be from verified transactions (post-beta) — during beta, all reviews are admin-moderated | No "fake five-star" seeding, ever. |

---

## 6. AIRCRAFT LISTING COMPLIANCE

Aviation listings carry regulatory exposure that boats and autos do not. **Treat every aircraft listing as if FAA may read it.**

| Rule | Detail |
|---|---|
| Aircraft listings must not contain claims that violate FAR Part 91/135 advertising rules | Listing editor includes a compliance check that flags prohibited language. |
| Phrases like "ferry permit available," "as-is, no PPI required," or "no airworthiness inspection needed" are flagged for broker review | Not auto-blocked, but reviewed. |
| Logbook claims must be substantiated by uploaded logbook excerpts | Required field for any listing claiming "complete logs since new." |
| Damage history claims ("no damage history") require broker attestation | Logged. |
| Total time, engine SMOH, prop SMOH, avionics package — must be accurate as of listing date | Stale data > 30 days triggers a "refresh required" badge on the listing. |
| Brokers must hold appropriate state and federal credentials | Captured at broker onboarding. |
| TradeWind does not act as a broker, dealer, escrow agent, or appraiser | Disclaimers visible on every aircraft listing detail page and in the footer. |

---

## 7. FINANCIAL / TRANSACTIONAL CLAIMS

| Rule | Detail |
|---|---|
| Do not claim TradeWind offers escrow until integrated escrow goes live | Currently gated as "Request Access" — keep that gate until contracts are signed (Escrow.com, IAT, Aero-Space Reports, etc.). |
| Do not claim TradeWind offers financing until lender network is live | Currently gated. Same rule. |
| Do not claim TradeWind offers insurance until insurer network is live | Currently gated. |
| AI Deal Score, True Cost Calculator, and Pre-Buy Inspector outputs MUST be labeled "estimate" / "advisory" — NEVER "appraisal" or "guarantee" | Disclaimers visible on each tool's output panel. |
| Stripe billing during beta is in TEST MODE only | No live charges until first paying customer signs LOI + opts in to live billing. |
| Transaction fee (1%, capped at $5K) is disclosed before any transaction begins | No surprise fees. |

---

## 8. PARTNER INTEGRATIONS — REQUEST-ACCESS RULE

These vendor integrations are surfaced in the UI as "Request Access" / "Coming Soon" and may NOT be marketed as live until a contract is signed:

- Plaid (bank verification)
- Carfax / AutoCheck / NMVTIS (vehicle history)
- BoatHistoryReport (HIN lookup)
- AircraftBlueBook / VRef (aircraft valuation)
- Escrow.com / Insured Aircraft Title / Aero-Space Reports (escrow)
- DealerSocket / vAuto / other DMS (inventory feeds)
- Uship and specialty haulers (transport)
- Marine / auto / aviation lenders (financing)
- Specialty insurers (boat / auto / aircraft)
- Pre-buy survey networks (inspection)

**Rule:** The gate disappears from the UI ONLY after the contract is signed. Sales material follows the UI — if the gate is there, the sales pitch reflects "request-access partner," never "integrated partner."

This is the most important rule in this document. Violating it once erodes trust permanently.

---

## 9. AI OUTPUT POLICY

| Rule | Detail |
|---|---|
| Anthropic Claude is primary, OpenAI GPT is fallback | Failover automatic; user never sees which provider answered. |
| AI outputs that influence purchasing decisions (Deal Score, True Cost, Pre-Buy) are clearly labeled as estimates | See §7. |
| User-supplied content (listing descriptions, chat messages, uploaded docs) passed to LLMs must go through prompt-injection guards | Validated at edge function layer. |
| Personal data (full name, email, phone, address) is NOT sent to LLM unless the user explicitly included it in their own message | Strip from system context. |
| AI Concierge conversations are stored per-user and never shared, sold, or used to train external models | Capture this commitment in the in-app privacy notice. |
| Hallucinated outputs (made-up specs, prices, comparables) are bugs — report via `BUG_TRIAGE_BOARD.md` with the prompt and the bad output | P1 if affecting purchase decisions; P2 otherwise. |

---

## 10. DATA OWNERSHIP & PORTABILITY

| Rule | Detail |
|---|---|
| Users own their data | Listings, messages, saved items, profile info — exportable by user request. |
| Dealers own their inventory data | If a dealer leaves, they get their inventory + lead history exported. We retain anonymized aggregates only. |
| TradeWind does not sell user data to third parties | Period. Commitment captured in privacy notice. |
| TradeWind does not allow data brokers, marketing tools, or AI training partners to access user data without explicit per-user opt-in | Same. |
| Account deletion request: data purged from production within 30 days, backups age out within 90 days | Aligned with GDPR / CCPA principles even though most users will be US-based. |

---

## 11. SECURITY & ACCESS

| Rule | Detail |
|---|---|
| Service-role / admin keys never shipped to client | Verified in Auth & Access Control Audit. |
| Row-Level Security enforced on all user tables | Verified. |
| No user can self-escalate role (verified in commit `9fdc2db`) | Role changes are admin-only and audit-logged. |
| All admin actions logged via `admin-audit-log` edge function | Retained indefinitely during beta. |
| Suspected security incident: lock affected accounts, audit log review, notify Don immediately | See `SUPPORT_OPERATIONS.md` §5. |
| Secrets rotated annually OR within 48 hours of suspected compromise | Calendar reminder set. |

---

## 12. DISPUTES & TAKEDOWNS

| Type | Process |
|---|---|
| Listing inaccuracy reported by buyer | Within 48 hours: contact seller, request correction or remove listing. |
| Stolen-asset claim (third party claims asset is theirs) | Listing taken down within 24 hours, asset frozen pending documentation review. |
| DMCA / copyright claim on photo | Take down within 24 hours, contact uploader, document. |
| Defamation claim (in review or message content) | Hide content within 24 hours pending review, consult counsel before reinstating or removing permanently. |
| Regulatory notice (FAA, USCG, FTC, state DOI, state DMV) | Acknowledge within 24 hours, substantive response within 5 business days after counsel consultation. |

---

## 13. POLICY REVIEW

This document is reviewed:
- At every weekly QA review (Monday) — quick scan, flag anything stale.
- Quarterly — formal review with full update.
- Immediately following any incident that surfaces an unaddressed policy gap.

Changes are committed to git with a clear commit message; users are notified of material changes via email and in-app notice.

---

**This policy is not bureaucracy. It is the operational expression of "we are an honest marketplace." Every shortcut taken here is paid back with interest in customer trust.**
