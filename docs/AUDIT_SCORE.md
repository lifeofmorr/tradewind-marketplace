# PLATFORM AUDIT SCORECARD — All 6 Platforms

**Audit date:** 2026-06-10
**Method:** Independent deep audit of each repo — actual test suites executed, production builds run, typechecks run, `npm audit` checked, git state inspected, live URLs curled. Scores are 0–10, calibrated harshly: 5 = mediocre, 8+ = genuinely strong, 10 = exemplary.

---

## MASTER SCORE MATRIX

| Dimension | AMD | GuardianGrid | TradeWind | Reserved House | LOO | LifeOfTrading |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Code Quality | 4 | 7 | 7 | 7 | **9** | 8 |
| Test Coverage | **0** | 5 | 5 | 4 | 7 | 7 |
| Build Status | **1** | 9 | 9 | 9 | 9 | 8 |
| Deployment | **2** | 6 | 6 | 7 | 8 | **4** |
| Security | 6 | 6 | 7 | 7 | 7 | 8 |
| Accessibility | 5 | 7 | 7 | 7 | 6 | **4** |
| Performance | 6 | 7 | 6 | 8 | 7 | 6 |
| Documentation | 8 | 5 | 5 | 6 | 8 | **9** |
| **OVERALL** | **3** | **6.5** | **6** | **6** | **8** | **7** |

**Portfolio average (overall): ~6.1 / 10**

**Ranking:** 1. LOO (8) · 2. LifeOfTrading (7) · 3. GuardianGrid (6.5) · 4. TradeWind (6) = Reserved House (6) · 6. AMD (3)

> **Note (2026-06-10):** TradeWind's critical findings were remediated the same
> day — see the post-remediation addendum in §3 (re-graded 7.5; matrix above is
> the audit-time snapshot).

---

## CROSS-CUTTING FINDINGS (apply to most or all platforms)

1. **Self-graded "10/10" scorecard documents exist in 5 of 6 repos** (`FINAL_10_OF_10_SCORECARD.md` and variants). None of those self-assessments survive independent audit. They are noise at best and credibility liabilities at worst — this audit recommends deleting them portfolio-wide.
2. **No CI pipeline in 5 of 6 repos.** Only GuardianGrid has GitHub Actions. TradeWind and Reserved House take real Stripe payments with zero automated gating before deploy. Nothing enforces the currently-green test suites.
3. **No ESLint configured in any major repo except LOO.** Typecheck is the only static gate almost everywhere.
4. **Test coverage is consistently shallow relative to surface area.** Tests that exist all pass (719 total tests passing portfolio-wide: GG 145, TW 194, RH 29, LOO 59, LOT 340, AMD 0), but payment-handling Supabase Edge Functions are untested in both marketplaces, most UI is untested everywhere, and there is no E2E coverage except LOO's 6 Playwright tests.
5. **Doc rot:** AI-generated launch reports, "billion-dollar" strategy folders, and readiness theater bury real documentation in GuardianGrid (~548 md files), TradeWind (~140 root-level md files), and others.

---

## 1. AMD — anchor-me-down-growth (anchormedown.com) — OVERALL: 3/10

| Dimension | Score |
|---|:-:|
| Code Quality | 4 |
| Test Coverage | 0 |
| Build Status | 1 |
| Deployment | 2 |
| Security | 6 |
| Accessibility | 5 |
| Performance | 6 |
| Documentation | 8 |
| **OVERALL** | **3** |

**What this actually is:** Not an application. A marketing/strategy workspace for a Shopify store — 12 strategy markdown docs (~190KB, genuinely good) plus 3 Shopify Liquid files. **It is not even a git repository** — `git status` fails; zero version control.

**Evidence:**
- No package.json, no tests, no build system, no CI — nothing tooling-verifiable exists.
- Live site responds (HTTP 200, Shopify-hosted) but is deployed entirely outside this repo.
- The 844-line product-page Liquid template is competently built (escaped output, JSON-LD, aria attributes, lazy/eager image loading). The two CRO snippets are ~97% identical duplicates with conflicting "FINAL" vs "READY-TO-PASTE" naming.
- No hardcoded secrets. Minor self-XSS vector: sticky-ATC bar interpolates product title into `innerHTML`.

**Top issues:**
1. **CRITICAL: The repo's own P0 — fabricated social proof — is still live on anchormedown.com.** Verified today via curl: "5,000+ customers", "Trusted by 500+ customers", and the Math.random fake-viewers widget are all in production HTML. The repo's own README calls this an FTC §5 liability (real lifetime revenue ~$262). The fix was written June 9 and never deployed.
2. Not a git repository — no history, no branches, every file effectively uncommitted.
3. No deployment path: the fix requires manual paste into the Shopify theme editor (a prior automation attempt failed).
4. Duplicate "final" files risk the wrong one being deployed.

---

## 2. GuardianGrid — guardiangrid-os (web-chi-navy-14.vercel.app) — OVERALL: 6.5/10

| Dimension | Score |
|---|:-:|
| Code Quality | 7 |
| Test Coverage | 5 |
| Build Status | 9 |
| Deployment | 6 |
| Security | 6 |
| Accessibility | 7 |
| Performance | 7 |
| Documentation | 5 |
| **OVERALL** | **6.5** |

**Stack:** TypeScript npm-workspaces monorepo — Fastify 4 + Postgres/PostGIS + Zod API, React 18 + Vite 5 SPA, 3 shared packages, Docker Compose for local infra.

**Evidence:**
- **Build/typecheck: clean across all 5 workspaces.** **Tests: 145/145 pass** in <10s, including real RLS-enforcement tests against PGlite and audit hash-chain tests.
- Strong security architecture: DB-level FORCE ROW LEVEL SECURITY with transaction-local GUCs, JWT auth that rejects tenant-less tokens, fail-closed prod secrets. Strong CSP/HSTS headers on Vercel.
- `npm audit`: **11 vulnerabilities (1 critical, 5 high)** — the high ones are runtime (fastify 4.x DoS/validation-bypass/host-spoofing, fast-uri path traversal).
- ~94k LOC with only 18 `: any`, zero TODO/FIXME — but no ESLint anywhere, and monolith files up to 1,519 lines.
- 153 aria attributes, skip links in all 5 layout shells, dedicated a11y scan script.

**Top issues:**
1. **28 modified + 7 untracked files sitting uncommitted on main — including the flagship FORCE RLS migration (033) and its tests.** The repo's headline security guarantee is not committed or deployed.
2. **The live Vercel deployment is a facade**: `VITE_API_BASE_URL` is empty, so the entire site runs on synthetic client-side mock data with no backend connected — while dozens of in-repo docs claim "PRODUCTION LIVE."
3. Runtime dependency vulnerabilities (fastify 4.x highs) unremediated.
4. 548 markdown files of generated launch/"billion-dollar"/compliance theater drown the genuinely good README; self-scored SOC2/security claims for a mock-data demo.
5. 145 tests for 43 API route modules and ~80 pages — most surface untested; no E2E, no coverage reporting, no ESLint.

---

## 3. TradeWind — tradewind-marketplace (tradewind-marketplace.vercel.app) — OVERALL: 6/10

| Dimension | Score |
|---|:-:|
| Code Quality | 7 |
| Test Coverage | 5 |
| Build Status | 9 |
| Deployment | 6 |
| Security | 7 |
| Accessibility | 7 |
| Performance | 6 |
| Documentation | 5 |
| **OVERALL** | **6** |

**Stack:** Vite 5 + React 18 + strict TypeScript SPA, Tailwind/shadcn, TanStack Query, backed entirely by Supabase (Auth, Postgres+RLS, Storage, 21 Deno Edge Functions), Stripe Checkout, Sentry.

**Evidence:**
- **Build: clean in 3.5s; strict typecheck: clean. Tests: 194/194 pass** in 3.6s — but all are pure-lib/logic tests; zero coverage of the 21 edge functions (including payments) and virtually all UI. Playwright plan written, never installed.
- Live site returns 200 with strong headers (CSP, HSTS). Git in sync with origin, last commit today.
- Security fundamentals good: server-side Stripe price IDs (no client tampering), timing-safe webhook HMAC verification, 23 RLS tables / 71 policies, rate-limited AI endpoints, no secrets in source.
- `npm audit`: 7 vulnerabilities (2 high, dev-side). Zero `: any`, zero console.log, zero TODO across 197 files — but one 2,296-line monolith (`AdminOutreach.tsx`) and no ESLint.
- 66 aria attributes, skip links in both shells, 16/16 images have alt, Radix primitives.

**Top issues:**
1. **No CI at all** — a live payment-handling site with nothing gating deploys on tests/typecheck/build.
2. **Stripe webhook replay vulnerability**: signature verification omits timestamp-tolerance, so a captured webhook can be replayed indefinitely.
3. 21 payment/AI edge functions completely untested; no component or E2E coverage.
4. ~140 root-level self-audit markdown files ("10/10" claims this audit does not corroborate) bury real docs; README still advertises a stale deploy URL.
5. No pagination on browse queries (hard caps of 60–80 fetched at once); `useConversations` pulls up to 5,000 message rows client-side; no image resizing/srcset.

### Post-remediation update — 2026-06-10 (after the critical findings were fixed)

The critical findings above were remediated and verified the same day. Scores
below are re-graded on the same harsh calibration; the audit-time scores in
the matrix are left untouched as the historical record.

| Dimension | Audit | Now | What changed |
|---|:-:|:-:|---|
| Code Quality | 7 | 7 | Unchanged — `AdminOutreach.tsx` monolith and missing ESLint remain. |
| Test Coverage | 5 | 7 | 252/252 passing (was 194). 58 new tests cover the payment edge functions at the request level: webhook (signature verify, replay rejection, idempotent dedup, every handled event type), checkout (auth, ownership 403s, fail-closed env gate, Stripe session params), billing portal, readiness. The other 17 AI/utility edge functions, all UI, and E2E remain untested — that is what keeps this a 7. |
| Build Status | 9 | 9 | Still clean (typecheck + production build re-verified). |
| Deployment | 6 | 7 | GitHub Actions CI added: typecheck + full test suite + production build on every push/PR, plus `deno check` of the payment functions under the real edge runtime's compiler. Custom domain still unresolved; deploys themselves still manual. |
| Security | 7 | 8 | **Replay window closed**: webhook signature verification now enforces Stripe's recommended 5-minute timestamp tolerance (tested, including the captured-payload replay case). Multiple `v1` signatures (secret rolls) handled. `npm audit` dev-side vulns remain. |
| Accessibility | 7 | 7 | Re-audited; no remaining static gaps (the flagged empty-`alt` thumbnail is the correct pattern inside an aria-labeled button). No score change without an assistive-tech pass. |
| Performance | 6 | 6 | Unchanged — browse pagination, `useConversations` row pull, and image srcset issues remain. |
| Documentation | 5 | 5 | `docs/FINAL_10_OF_10_SCORECARD.md` deleted per this audit's recommendation. The remaining ~140 root-level doc-rot files still bury the real docs. |
| **OVERALL** | **6** | **7.5** | The payment-critical risk profile is fixed; what remains is breadth (UI/E2E tests, perf, doc cleanup), not correctness. |

Also added in the remediation pass: a `stripe-portal` edge function (Stripe
Billing Portal session — auth + ownership-checked, same fail-closed env gate
as checkout). The audit expected a customer-portal endpoint and the repo had
none, leaving subscribers no way to manage billing.

**What a real 9–10 requires (not claimed until done):** component/E2E coverage
of checkout and dashboard flows, tests for the 17 remaining edge functions,
ESLint, browse pagination, doc-rot purge, resolved domain + monitored deploys.

---

## 4. Reserved House — the-reserved-house (the-reserved-house.vercel.app) — OVERALL: 6/10

| Dimension | Score |
|---|:-:|
| Code Quality | 7 |
| Test Coverage | 4 |
| Build Status | 9 |
| Deployment | 7 |
| Security | 7 |
| Accessibility | 7 |
| Performance | 8 |
| Documentation | 6 |
| **OVERALL** | **6** |

**Stack:** npm-workspaces monorepo — React 18 + Vite 6 + TS SPA (react-router 7, framer-motion, zod), Supabase backend (Postgres+RLS, 4 Deno Edge Functions for Stripe/leads), plus an Expo React Native app.

**Evidence:**
- **Build: clean in 2.9s; mobile typecheck: clean. Tests: 29/29 pass** in 316ms — but all four test files are client-side lib helpers; the Stripe checkout/webhook edge functions (manual HMAC crypto code) have zero tests.
- Git fully clean on main, last commit today. Live site 200 with good security headers and immutable asset caching. No CI.
- Security solid for its size: constant-time webhook HMAC verification, server-side amount bounds and type whitelist, RLS hardening migration, no committed secrets, no eval/dangerouslySetInnerHTML.
- `npm audit`: **22 vulnerabilities (1 critical, 12 high)** — all dev/build-time (vitest, expo/xmldom/tar chains) but unaddressed. Wildcard CORS on all edge functions; no CSP header.
- Real a11y effort: skip link, semantic landmarks, aria-expanded/controls/current — but zero focus management on route change.
- All 17 non-home routes lazy-loaded; ~102KB gzip main bundle.

**Top issues:**
1. **No CI** for a platform taking real payments.
2. **Payment-critical edge functions completely untested** — 29 tests cover only client lib helpers.
3. No ESLint; two god-files (`Admin.tsx` 749 lines, mobile `App.tsx` 552 lines).
4. 22 npm audit vulns unremediated; wildcard CORS; no CSP.
5. Founder's personal admin email hardcoded as auth-gate fallback in the shipped public JS bundle (RLS is the real gate, but it leaks the address and is brittle).

---

## 5. LOO — life-of-opportunity (job application engine) — OVERALL: 8/10

| Dimension | Score |
|---|:-:|
| Code Quality | 9 |
| Test Coverage | 7 |
| Build Status | 9 |
| Deployment | 8 |
| Security | 7 |
| Accessibility | 6 |
| Performance | 7 |
| Documentation | 8 |
| **OVERALL** | **8** |

**Best-engineered platform in the portfolio.**

**Stack:** React 19 + TS + Vite 8 + Tailwind 4 frontend; Supabase (Postgres+RLS, Edge Functions, pg_cron); long-running Node/Playwright "AutoApply" worker with adapters for 7 ATS platforms.

**Evidence:**
- **Tests: 53/53 unit pass + 6/6 Playwright E2E pass** (mock Greenhouse/Lever forms, EEO handling, CAPTCHA detection without bypass). Build, worker build, and ESLint (the only repo with lint!) all clean. **npm audit: 0 vulnerabilities.**
- ~7,100 LOC, zero TODO/any/console.log in src, largest file 388 lines, clean adapter architecture, zod-validated env.
- Full deploy pipeline: Playwright Docker image (non-root, HEALTHCHECK, tini), render.yaml, vercel.json, GitHub Actions CI + deploy, pg_cron. 30 RLS policies; no secrets committed; dist bundle verified clean.
- Good automation etiquette: rate limits, daily/per-company caps, consecutive-failure failsafe, never bypasses CAPTCHA/MFA.

**Top issues:**
1. **Real PII committed**: owner's full name, email, phone, and complete employment history in seed files and e2e specs. Fine while private; must be scrubbed before the repo is ever shared.
2. **Production has never run for real**: render.yaml pins `DRY_RUN_MODE=true` and `DAILY_APPLICATION_LIMIT=1` — the core value proposition (live auto-submission) is unverified, and 4 of 7 ATS adapters (Workday, iCIMS, SmartRecruiters, custom) have zero tests.
3. **Dead LLM plumbing**: Anthropic/OpenAI keys wired through env/deploy configs but no code calls them — "generation" is template assembly, which the docs partially obscure.
4. 605KB monolithic JS bundle, no route splitting.
5. README claims a daily cap of 100; deployment pins it at 1.

---

## 6. LifeOfTrading — lifeoftrading-hft (HFT quant bot) — OVERALL: 7/10

| Dimension | Score |
|---|:-:|
| Code Quality | 8 |
| Test Coverage | 7 |
| Build Status | 8 |
| Deployment | 4 |
| Security | 8 |
| Accessibility | 4 |
| Performance | 6 |
| Documentation | 9 |
| **OVERALL** | **7** |

**Stack:** TypeScript monorepo (Node 20, strict tsc project references, node:test) — 10 packages (TradeLocker/GatesFX adapter, strategy/risk/compliance/goal engines, execution gateway), Fastify operator API, Next.js dashboard, optional Rust tick-fanout sidecar, Postgres+Redis via docker-compose.

**Evidence:**
- **Tests: 340/340 pass in 786ms** across 48 files (risk, compliance, gateway, wire parsing, API contract). `tsc -b` clean across all 11 project references. Rust sidecar (1,316 lines) unverifiable locally — no cargo toolchain installed.
- Genuinely strong real-money safety architecture: boots DISARMED, ARMED_FULL requires confirmation phrase, kill switch checked synchronously, 10x leverage hard cap with no override, fail-closed on engine errors, SHA-256 + timingSafeEqual API auth, credential redaction in error paths, config loader rejects placeholder secrets.
- Documentation is exemplary — architecture, live-trading safety, setup guides, and a 90-day plan doc that honestly computes its own probability of ruin.
- **Git history is a single commit dated today.** No CI, no lint, never deployed beyond local Docker, and by all evidence has never run against a live or demo venue.

**Top issues:**
1. **Zero backtesting infrastructure.** Seven strategies, none validated against historical data; the paper simulator self-describes as having no partial fills, slippage, or rejections. For a system intended to trade real money this is the single biggest gap.
2. **Double-order risk on ambiguous venue failures**: the execution gateway frees its idempotency slot on any placement error — including client timeouts where the venue may have accepted the order — and retries mint a fresh `clientOrderId`, defeating venue-side dedup. No reconciliation step exists.
3. One-commit history, no CI, no lint — nothing enforces the currently-green gates.
4. **"HFT" in name only**: market data arrives via 750ms REST polling; the venue's socket API is unimplemented and the Rust low-latency core is optional and unverified.
5. Operator dashboard (kill switch, arming controls) has essentially zero accessibility — 3 aria attributes total.

---

## PORTFOLIO-LEVEL RECOMMENDATIONS (priority order)

1. **AMD: deploy the social-proof fix today.** Live FTC §5 exposure is the only legal-risk item in the portfolio. Then `git init` the repo.
2. **GuardianGrid: commit the RLS migration and the 28 modified files** on main before anything is lost.
3. **Add CI to every repo that deploys** (TradeWind and Reserved House first — they handle payments). A single GitHub Actions workflow running test + typecheck + build is a one-hour job each.
4. **Fix the TradeWind webhook replay window** (add Stripe timestamp tolerance) and **the LifeOfTrading idempotency/reconciliation gap** before any live trading.
5. **Delete the self-graded "10/10" scorecards portfolio-wide** and prune the generated doc sprawl — they actively mislead.
6. **Run `npm audit fix`** in GuardianGrid (runtime fastify highs) and Reserved House (22 vulns).
7. **LOO: scrub PII from seed/test files** before any visibility change, then run a supervised live (non-dry-run) batch to validate the core loop.

---

*Generated by independent multi-agent audit, 2026-06-10. All test counts, build results, audit numbers, and live-site checks were actually executed, not estimated.*
