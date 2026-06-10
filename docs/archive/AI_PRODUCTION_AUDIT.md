# AI Feature Production Audit — TradeWind (Phase 11)

**Date:** 2026-06-03

## Verdict: Keys safe, aviation safeguards present, UI disclaimers present on advisory tools. TWO real gaps: (1) no per-user auth / rate limiting on paid AI endpoints, (2) inconsistent fallbacks. These are public-launch blockers, acceptable-with-monitoring for invited private beta.

## Functions
| Function | Provider | Key server-side | Graceful fallback | Overclaim risk | Auth/rate-limit |
|---|---|---|---|---|---|
| ai-pricing-estimate | Claude Sonnet 4.6 | ✅ | ❌ 500 on fail | High (estimate framed with "comp_count") | ❌ none |
| ai-fraud-check | Sonnet 4.6 | ✅ | partial | High (score reads as verdict) | ❌ none |
| inquiry-fraud-check | Sonnet 4.6 | ✅ | ✅ logs low-sev flag | Med (lead_score persisted) | ✅ service-role webhook |
| ai-negotiation-assistant | Sonnet 4.6 | ✅ | ❌ 500 | Med | ❌ none |
| ai-listing-autopilot | Sonnet 4.6 | ✅ | ❌ 500 | Med | ❌ none |
| ai-listing-generator | Sonnet 4.6 | ✅ | ❌ 500 | Med | ❌ none |
| ai-buyer-assistant | Sonnet 4.6 | ✅ | ✅ local walkaround fallback | Low | ❌ none |
| ai-concierge-intake | Sonnet 4.6 | ✅ | ❌ 500 | Low | ❌ none |
| photo-enhance | placeholder | n/a | ✅ mock | Low | ❌ |
| vin-decode | NHTSA vPIC | n/a | ✅ | Low | ❌ |

## Strengths
- **All API keys server-side** via `Deno.env` (`_shared/anthropic.ts`); none in `src/`.
- **Aviation safeguards baked in:** system prompts instruct the model never to claim airworthiness and to point to A&P/IA pre-buy (`ai-listing-generator:35`, `ai-buyer-assistant:17`); `src/lib/ai.ts` has a hardcoded `localAircraftWalkaround()` fallback with a standing disclaimer.
- **UI disclaimers present** on the advisory tools shown to users: `NegotiationAssistant.tsx:104` and `ListingAutopilot.tsx:130` both render "Advisory only — non-binding."

## Real gaps
1. **No per-user auth or rate limiting** on any AI endpoint. They are reachable with the public anon JWT and call paid Anthropic APIs → cost-drain / abuse vector. `ENTERPRISE_PRODUCTION_AUDIT.md` already acknowledges this. **Add a shared rate limiter (`_shared/ratelimit.ts`) + require an authenticated user for the expensive ones before public launch.**
2. **Inconsistent fallbacks** — most functions return a 500 on AI failure instead of a safe default + disclaimer. Harmless to safety, but degrades UX. Standardize.
3. **Pricing "comp_count"** invites the model to imply it consulted comparables it did not. Recommend dropping `comp_count` and adding an explicit `_disclaimer` to the response. Note: no frontend caller of `ai-pricing-estimate` was found, so user exposure is currently low.
4. **Prompt-injection:** user text is interpolated into fraud-check prompts without delimiting. Wrap user input in tags / strip injection markers. Low real-world impact on Claude 4.6 but worth hardening.

## Blockers
| Item | Severity | Notes |
|---|---|---|
| No rate limiting on paid AI endpoints | Med (private) / High (public) | public-launch blocker |
| Overclaim hardening (comp_count, disclaimers in responses) | Low–Med | before public |
| Keys / aviation safeguards / UI disclaimers | — | ✅ PASS |
