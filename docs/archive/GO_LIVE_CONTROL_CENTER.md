# GO-LIVE CONTROL CENTER

**Status:** ENTERPRISE GO-LIVE OPERATIONS MODE
**Owner:** Don Morrison (morrisondon89@gmail.com)
**Last Updated:** 2026-05-26
**Mode:** Private Beta — Controlled Launch

---

## 1. ENVIRONMENT STATUS

### Production
| Item | Status | Details |
|---|---|---|
| Production URL | LIVE | https://tradewind-marketplace.vercel.app |
| Production Branch | ACTIVE | `main` (Vercel auto-deploys on push) |
| GitHub Repository | ACTIVE | https://github.com/lifeofmorr/tradewind-marketplace |
| Custom Domain | PENDING | See `DOMAIN_LAUNCH_CHECKLIST.md` (target: `gotradewind.com`) |
| SSL | AUTO | Vercel-managed |
| CDN | ACTIVE | Vercel global edge |

### Staging
| Item | Status | Details |
|---|---|---|
| Staging URL | NONE | Not yet provisioned — beta runs against production with `demo`-labeled data |
| Recommended Next | TODO | Create Vercel preview branch `staging` once first real listings are added |

### Supabase
| Item | Status | Details |
|---|---|---|
| Project ID | ACTIVE | `qwaotydaazymgnvnfuuj` |
| Database | HEALTHY | Postgres 15, RLS enabled across all user tables |
| Auth | ACTIVE | Email + magic link |
| Storage | ACTIVE | Listing media, asset passport docs |
| Edge Functions | 17 ACTIVE | See section 4 below |
| Backups | AUTO | Supabase managed daily snapshots |

### Stripe
| Item | Status | Details |
|---|---|---|
| Mode | TEST | All 7 products configured in test mode |
| Test Products | 7 ACTIVE | Buyer Concierge, Dealer Pro, Dealer Premium, Service Provider, Aircraft Brokerage, Listing Boost, Transaction Fee |
| Webhooks | CONFIGURED | Pointing at production edge function |
| Live Mode | NOT YET | Flip after first paying customer signs LOI — see `LIVE_DATA_POLICY.md` |

### AI Providers
| Provider | Role | Status | Notes |
|---|---|---|---|
| Anthropic Claude | PRIMARY | ACTIVE | Used for AI Concierge, Deal Score, Asset Passport summaries, listing assist |
| OpenAI GPT | FALLBACK | ACTIVE | Auto-failover if Claude returns error or quota exhaustion |
| Rate Limits | ENFORCED | Per-user throttling at edge layer |

---

## 2. ADMIN & SUPPORT

| Item | Status | Details |
|---|---|---|
| Primary Admin | Don Morrison | morrisondon89@gmail.com |
| Admin Dashboard | LIVE | `/admin` route, role-gated |
| Support Inbox | morrisondon89@gmail.com | Direct founder support during beta |
| Dedicated Support Email | TODO | `support@gotradewind.com` after domain live |
| Status Page | TODO | Optional — defer until 25+ active users |

---

## 3. VENDOR-DEPENDENT ITEMS (NOT YET WIRED TO LIVE PROVIDERS)

These are surfaced in the UI as "Request Access" / "Coming Soon" gates. Do NOT remove these gates without a live contract.

| Capability | Provider Class | Status | Action Required |
|---|---|---|---|
| Bank verification | Plaid | REQUEST-ACCESS UI | Negotiate contract; flip to live keys |
| VIN history | Carfax / AutoCheck / NMVTIS | REQUEST-ACCESS UI | Partner contract |
| Boat HIN lookup | BoatHistoryReport | REQUEST-ACCESS UI | Partner contract |
| Aircraft history | AircraftBlueBook / VRef | REQUEST-ACCESS UI | Partner contract |
| Escrow | Escrow.com / 3rd-party EFM | REQUEST-ACCESS UI | Compliance review + contract |
| Title transfer | DMS partners | REQUEST-ACCESS UI | State-by-state DMS access |
| Insurance quotes | Boat/Auto/Aircraft carriers | REQUEST-ACCESS UI | Aggregator deal |
| Financing | Marine/Auto/Aviation lenders | REQUEST-ACCESS UI | Lender network |
| Transport | Uship / specialty haulers | REQUEST-ACCESS UI | API or referral deal |
| Inspection | Pre-buy survey networks | REQUEST-ACCESS UI | Network agreements |

**Rule:** Never claim a vendor integration is "live" in any sales material until the gate is removed from the UI.

---

## 4. EDGE FUNCTIONS (17 ACTIVE)

All 17 deployed to Supabase Edge runtime. All have RLS-aware auth.

1. `ai-concierge` — AI buyer chat
2. `asset-passport-generator` — Vehicle/vessel/aircraft summary
3. `deal-score` — Pricing intelligence
4. `true-cost-calculator` — Total cost of ownership
5. `offer-builder` — Structured offer drafting
6. `pre-buy-inspector` — Inspection checklist generator
7. `listing-assist` — AI-assisted listing creation
8. `dealer-import` — CSV/feed inventory import
9. `stripe-webhook` — Payment events
10. `stripe-checkout` — Checkout session creation
11. `transaction-room` — Buyer/seller secure room
12. `notification-dispatcher` — Email/in-app notifications
13. `fraud-screen` — Listing risk scoring
14. `lead-router` — Service provider lead distribution
15. `sitemap` — Dynamic sitemap generation
16. `og-image` — Open Graph image rendering
17. `admin-audit-log` — Admin action audit trail

---

## 5. INVENTORY STATUS

| Item | Count | Status |
|---|---|---|
| Demo Listings | 65 | All clearly labeled `[DEMO]` in UI |
| Real Listings | 0 | First real listings via private beta dealer onboarding |
| Aircraft Vertical | COMPLETE | Full UI, search, detail, broker tools |
| Boat Vertical | COMPLETE | |
| Auto Vertical | COMPLETE | |
| Exotic/Classic | COMPLETE | Subset of auto vertical |

---

## 6. LAUNCH APPROVAL CHECKLIST — 10 GATES

All 10 gates must be GREEN before private beta invitations are sent.

| # | Gate | Status | Verified By | Date |
|---|---|---|---|---|
| 1 | No critical (P0) bugs | PASS | Final QA Report | 2026-05-26 |
| 2 | No high-priority (P1) bugs | PASS | Final QA Report | 2026-05-26 |
| 3 | No dead buttons (every CTA leads somewhere) | PASS | UI completeness audit | 2026-05-26 |
| 4 | No broken images (all listing media loads) | PASS | Demo Inventory Media Audit | 2026-05-26 |
| 5 | No fake integrations (all unwired vendors gated) | PASS | Enterprise Production Audit | 2026-05-26 |
| 6 | No exposed secrets (env vars, API keys, service role) | PASS | Auth & Access Control Audit | 2026-05-26 |
| 7 | No payment blockers (Stripe test flow end-to-end) | PASS | Stripe checkout dry run | 2026-05-26 |
| 8 | No AI blockers (primary + fallback both respond) | PASS | AI Final QA | 2026-05-26 |
| 9 | No security blockers (RLS enforced, no role-escalation paths) | PASS | Auth audit + self-escalation fix `9fdc2db` | 2026-05-26 |
| 10 | No unclear demo claims (every demo asset labeled, no live-claim copy on unwired features) | PASS | Live Data Policy review | 2026-05-26 |

**OVERALL STATUS: ALL 10 GATES PASS — CLEARED FOR PRIVATE BETA**

---

## 7. DAILY OPERATIONAL CHECKS (during beta)

Owner: Don Morrison. Run every morning during active beta.

- [ ] Vercel deployment health (last deploy green)
- [ ] Supabase dashboard — no auth errors, no edge function failures > 1%
- [ ] Stripe dashboard — no failed webhooks
- [ ] Anthropic + OpenAI usage within quota
- [ ] Admin inbox: any new beta applications?
- [ ] Bug triage board: any new P0/P1 reports?
- [ ] Beta feedback inbox: any responses needing acknowledgment?

---

## 8. KILL-SWITCH / ROLLBACK

If a critical issue is detected post-launch:

1. **Soft kill:** Disable new signups via Supabase auth settings, leave site read-only.
2. **Hard kill:** Roll back deployment in Vercel dashboard to last known good (one-click).
3. **DB rollback:** Supabase point-in-time restore (last 7 days) — use only if data corruption confirmed.
4. **Notify:** Email all active beta users within 1 hour with status + ETA.

Last known good deploy: commit `70d8cad` (enterprise production readiness pass — 14 phases).

---

## 9. ESCALATION CONTACTS

| Issue | Contact | Channel |
|---|---|---|
| Site down | Vercel status page + Don | Vercel dashboard |
| DB issue | Supabase support + Don | Supabase dashboard |
| Payment issue | Stripe support + Don | Stripe dashboard |
| AI provider outage | Anthropic + OpenAI status pages | Auto-fallback handles primary→secondary |
| Security incident | Don (sole admin) | Immediate — see incident response in `DATA_PRIVACY.md` |

---

**CONTROL CENTER CERTIFIED: TradeWind is cleared for Enterprise Private Beta Launch.**
