# AI Final QA · 2026-05-21

## Edge functions audited
- `ai-listing-generator` — seller-side draft generator
- `ai-buyer-assistant` — buyer concierge chat
- `ai-fraud-check` — inquiry fraud screen
- `ai-pricing-estimate` — comp-derived price band
- `ai-concierge-intake` — structured concierge intake JSON
- `ai-listing-autopilot` — listing-quality advisor
- `ai-negotiation-assistant` — buyer/seller negotiation coach
- `_shared/anthropic.ts` — Claude Sonnet 4.6 wrapper with OpenAI fallback

## Aircraft context (fix made today)
The boat/auto AI prompts were category-aware but **silently fell back to
boat/auto rationale when given an aircraft category**. As of this pass:

| Function | Fix |
|---|---|
| `ai-listing-generator` | System prompt now enumerates the 10 aircraft categories, calls out aviation-specific copy (total time / SMOH, avionics, AD/SB, damage history) and the **mandatory A&P/IA pre-buy reminder**. |
| `ai-pricing-estimate` | Added aviation drivers (TT, SMOH, avionics, damage history, annual currency) to the system prompt and `Total time (hrs)` label for aircraft inputs. |
| `ai-concierge-intake` | Category enum extended to include all aircraft categories. |
| `ai-fraud-check` | Added aircraft-specific fraud signals (refusing escrow, refusing pre-buy, missing N-number, same-day wire). |
| `ai-buyer-assistant` | Added aviation discovery pattern (mission profile, runway constraints, IFR vs VFR) and the A&P/IA reminder. |
| `ai-listing-autopilot` | Already category-agnostic — passes the category through verbatim, works for aircraft. |
| `ai-negotiation-assistant` | Already category-agnostic — works for aircraft. |

## Client-side aviation safety
`src/lib/ai.ts` defines `localAircraftWalkaround()` which produces a
deterministic A&P-grade walkaround script even when the AI edge function is
unreachable. The Walkaround panel (`AircraftWalkaroundCard.tsx`) catches edge
function errors and falls back to this local copy — so aviation-safety content
**never silently degrades**. A static `AIRCRAFT_FRAUD_WARNINGS` list backs the
inquiry UI as a belt-and-braces complement to the AI fraud check.

## Error handling
Every function:
1. Catches JSON parse failure → 400 `Invalid JSON`.
2. Catches missing required fields → 400 with a specific message.
3. Catches `callLLM` failure → 500 with the underlying message.
4. Cleans markdown fences from JSON output via `parseJSON()` in `_shared/anthropic.ts`.

The `callLLM` wrapper tries Anthropic first, then falls back to OpenAI if
`OPENAI_API_KEY` is set. If neither key is configured, the function throws a
clear "No LLM API key configured" error rather than returning garbage.

## Secret exposure
`grep -rE "SERVICE_ROLE_KEY|ANTHROPIC_API_KEY|OPENAI_API_KEY|STRIPE_SECRET_KEY" supabase/functions/` returns only:
- `Deno.env.get(…)` reads
- Error strings that name the env var (e.g. `"STRIPE_SECRET_KEY not configured"`) but never the value
- Header sets (`x-api-key`, `Authorization`) that are server-side only

No function returns the key in a response body or echoes it to a client.

## Conclusion
**Zero AI blockers.** Aircraft awareness has been added across all
category-dependent AI prompts. Aviation-safety content has graceful local
fallback. Errors are caught and degrade to actionable messages, never to
silent garbage.
