# Bug-Fix Lockdown — Private Beta

Date: 2026-04-29
Branch: `claude/amazing-allen-82657d`

Final status of the audit + fixes performed before private beta. No new
features added during this pass — only bug fixes, error handling, smoke
tests, and empty-state polish.

## Master bug list

| # | Severity | Area | Status | Notes |
|---|----------|------|--------|-------|
| 1 | High | Resilience | Fixed | No global React error boundary — any thrown render error blanked the app. Added `src/components/ui/ErrorBoundary.tsx` and wrapped both the app shell (in `main.tsx`) and every lazy-loaded route surface (`L` wrapper in `App.tsx`). |
| 2 | High | Admin moderation | Fixed | `AdminListings.setStatus` ignored the Supabase update error — silent failure if RLS or schema rejected the change. Now surfaces the error inline at the top of the moderation queue. |
| 3 | Medium | Messaging | Fixed | `MessageThread.onSubmit` cleared the draft and awaited send without a try/catch. A failed send dropped the user's text and showed nothing. Now restores the draft on failure and renders an inline error banner. |
| 4 | Medium | UX | Fixed | `SellerAuctions` empty state was a single table row (`No auctions yet.`) with no CTA. Replaced with the `EmptyState` component including a "Start an auction" primary CTA and a "View my listings" secondary. Loading state was a single line; now uses skeleton rows for consistency with the rest of the dashboard. |
| 5 | Low | Tests | Fixed | Smoke coverage was limited to 5 page-render tests. Added two test files: `lib.test.ts` (unit tests for `formatCents`/`formatNumber`/`slugify`/`cn`/`calculateDealScore`/`calculateListingQuality`/`calculateOwnershipCost` — 26 cases) and `routes.test.tsx` (route protection + form validation — 4 cases). |
| 6 | Verified clean | Routes | OK | `/dealers/:slug` and `/services/:slug` exist (`App.tsx:115` / `App.tsx:118`) — both pages handle loading + not-found states with copy. |
| 7 | Verified clean | Empty states | OK | `SellerInquiries`, `BuyerRequests`, `BuyerSaved`, `Messages` (`ConversationList`), `AdminListings` already render proper `EmptyState` or dashed-card empty UIs with CTAs. |
| 8 | Verified clean | Mobile nav | OK | `Header.tsx` hamburger uses public NAV_LINKS only (correct — public shell). `DashboardShell.tsx` mobile drawer is role-aware via `NAV_BY_ROLE`, including the messages unread-count badge. |
| 9 | Verified clean | Admin approval | OK (with fix #2) | Approval flow: `setStatus("active")` updates `status`, `published_at`, `reviewed_at`, then triggers the `send-email` edge function for the seller. Logic was correct; the missing piece was error surfacing — now fixed. |
| 10 | Verified clean | Console pollution | OK | `grep` for `console.log`/`console.debug`/`debugger` returned zero hits in `src/`. The only remaining `console.warn`/`console.error` calls are intentional (auth init failure and the new ErrorBoundary diagnostic). |
| 11 | Verified clean | TODO/FIXME | OK | `grep` for `TODO`/`FIXME`/`XXX`/`HACK` returned zero hits in `src/`. |
| 12 | Verified clean | Auth guards | OK | `ProtectedRoute` redirects unauthenticated → `/login`, banned profiles → `/`, and role-mismatched users → `/`. Verified by new route-protection tests (admin and seller surfaces). |
| 13 | Verified clean | Form validation | OK | Login + Signup use `react-hook-form` + `zodResolver` with field-level error messages. Verified by new `routes.test.tsx` validation tests. |

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | ✅ passes (no errors) |
| `npm run build` | ✅ passes (chunks emitted; large-bundle warning is pre-existing, not regressed) |
| `npx vitest run` | ✅ 3 files, 31 tests, all passing (was 1 file / 5 tests) |

## Files changed

```
src/components/ui/ErrorBoundary.tsx         (new)
src/__tests__/lib.test.ts                   (new)
src/__tests__/routes.test.tsx               (new)
src/main.tsx                                (wrap app in ErrorBoundary)
src/App.tsx                                 (wrap lazy Suspense in ErrorBoundary)
src/pages/dashboard/admin/AdminListings.tsx (surface update errors)
src/pages/dashboard/seller/SellerAuctions.tsx (proper EmptyState + skeleton)
src/components/messaging/MessageThread.tsx  (catch send failures, inline error)
BUG_FIX_LOCKDOWN.md                         (this file)
```

## Bugs still open

None blocking private beta. Remaining items are scope-creep (`vite build`
warns about a 966 KB main chunk — code-splitting is already partial; further
chunking is a perf task, not a bug) and would belong in a separate PR.
