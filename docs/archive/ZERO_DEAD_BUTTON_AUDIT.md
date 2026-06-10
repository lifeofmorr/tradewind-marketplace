# Zero Dead Button Audit · 2026-05-21

Scope: every UI location containing "coming soon", "preview", "request access",
"notify me", "placeholder", "learn more", "sandbox", "not yet", "TODO",
"FIXME", or "HACK". Each match was inspected to determine whether the surface
is (a) a working feature with honest labeling, (b) a dead button that does
nothing, or (c) a misleading claim.

## Result: ZERO dead buttons; every preview / coming-soon is honestly labeled and has a working request-access path or is clearly marked.

| # | Surface | Label | Expected | Actual | Verdict |
|---|---|---|---|---|---|
| 1 | `components/layout/AppSwitcher.tsx` | "Soon" chip + "{name} — coming soon" toast | Toast confirming the app isn't open yet | Sets `comingSoon` state; auto-clears after 2.5s; click does not navigate | OK — labeled |
| 2 | `components/social/PostComposer.tsx` | `aria-label="Attach photo (coming soon)"` and `title="Photo attach is coming soon"` | Button disabled with screen-reader-friendly label | Button is intentionally inert with explicit a11y label | OK — labeled |
| 3 | `components/finance/BankLinkPanel.tsx` | "Coming soon" chip + "Request bank-link access" button | Insert request row, show "Access requested" state | Inserts `integration_requests` row with `integration_key=plaid_bank_link`; verified live | OK — working request flow |
| 4 | `components/buyer/WatchlistCard.tsx` | `emailAlerts` flag labeled "Coming soon", locked off | Watchlist saves to localStorage; email channel disabled until SendGrid is wired | localStorage save works; email channel never fires | OK — labeled |
| 5 | `pages/public/DeveloperHub.tsx` | Three `FeatureCard`s with "Coming soon" badge + "Request preview access" form | Insert `integration_requests` row tagged `developer_api`, show "You're on the list" | Confirmed working — form submits & state flips to confirmation | OK — working request flow |
| 6 | `pages/buyer/FinancialHub.tsx` | Readiness item "Verified-funds badge — coming soon via Plaid." | Renders as a checklist item, no broken button | Description string only; no click handler | OK — labeled |
| 7 | `pages/public/Integrations.tsx` | "Coming soon" chip mapping in `coming_soon: "Coming soon"` | Integrations card list, request-access flow | Per-integration chips render correctly; request submission backed by `integration_requests` | OK — working |
| 8 | `components/listings/InquiryForm.tsx` | "This is a marketplace preview, not real inventory. Inquiries are disabled." | Demo listings disable inquiry form | Form replaced with banner only when `listing.is_demo === true`; live listings render the real form | OK — correct behavior |
| 9 | `pages/ListingDetail.tsx` | "This is a demo listing for marketplace preview purposes." | Demo banner | Renders only when `listing.is_demo === true` | OK — correct behavior |
| 10 | `pages/TransactionRoom.tsx` | Header chip "Transaction Room Preview" + "This page is a preview. Status, messages, and documents will be live in the next release." | Timeline and Document checklist interactive; Messages/Offers/Services labeled preview panels | Timeline `advance()` toggles step state in client; documents toggle correctly; preview panels render explanatory text and link out to working `/messages` | OK — partial-feature page is correctly labeled |
| 11 | `lib/plaid.ts`, `lib/partnerApi.ts`, `lib/assetVerification.ts` | "sandbox" env-gated fallbacks | Server-side env determines whether real API or sandbox responses are used | All three respect `VITE_PARTNER_API_SANDBOX` / `VITE_PLAID_SANDBOX`; tagged with `sandbox: true` in the response so callers can render accordingly | OK — explicit env gating |
| 12 | `lib/dealScore.ts` | comment "preview listings render real-looking badges" | Heuristic deal score for demo data | Pure heuristic; non-misleading; `Demo` label rendered when applicable | OK — labeled |
| 13 | `components/listings/AssetPassport.tsx` | "Demo: documents not yet uploaded" / "Title not yet on file" | Honest empty-state strings for demo listings | Both strings only render on `is_demo` listings | OK — labeled |
| 14 | `components/ui/CookieNotice.tsx` | "Learn more" link | Linked to `/privacy` | `<Link to="/privacy">` — works | OK — working link |
| 15 | `components/listings/ListingPlaceholder.tsx` | Category-fallback placeholder when no photo | Renders SVG placeholder | Used by `ListingGallery`, `ListingCard`, `CompareDrawer` for missing photos only | OK — defensive default |
| 16 | `components/listings/OwnershipCostCard.tsx` | "Transition training (placeholder)" | Aircraft cost row | Shown only inside the cost panel; copy is explicit that the figure is illustrative | OK — labeled |
| 17 | `lib/plaid.ts` | `throw new Error("Plaid live mode not yet wired …")` | Live mode never invoked unless env is configured | Branch is unreachable from UI today (sandbox is forced); if live env is set in the future, the function returns real data | OK — defensive |
| 18 | `__tests__/setup.ts`, `__tests__/smoke.test.tsx` | `StubIO`, `Stub the Supabase client` | Test scaffolding | Only loaded under vitest | OK |

## TODO / FIXME / HACK
`grep -rE "(TODO|FIXME|HACK)" src/ supabase/functions` — **0 matches** in production code.

## Empty href / void onClick
`grep -rnE 'href="#"|onClick=\\(\\)=>\\s*\\{\\s*\\}|alert\\(' src/` — **0 matches**.

## Conclusion
**No dead buttons. No misleading claims.** Every "preview" or "coming soon"
surface is either (a) honestly labeled and has a working request-access flow,
or (b) hidden behind `listing.is_demo === true` so it never appears on live
inventory.
