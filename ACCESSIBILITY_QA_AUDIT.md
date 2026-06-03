# Accessibility QA Audit — TradeWind (Phase 14)

**Date:** 2026-06-03

## Verdict: Good foundation, WCAG 2.1 AA not formally verified. PARTIAL.

## Strengths
- **Form labels:** inputs paired with `<Label htmlFor>` (FeedbackPage, RequestPages), with linked error messages.
- **Icon buttons labeled:** mobile menu (`aria-label`/`aria-expanded`, `Header.tsx:98-100`), messages (`:69`), notification bell (`NotificationBell.tsx:21`), app switcher (`:88-89`).
- **Landmarks:** `<nav aria-label="…">` on category nav (`AircraftPage.tsx:71`), `<main>` wrapper, heading hierarchy h1→h2→h3 on Home and pages.
- Demo/aviation/disclaimer blocks use `role="status"`/`role="note"`.

## Gaps (none blocking)
- Decorative images use `alt=""` (ListingGallery, CompareDrawer, PostCard) — technically valid; add `role="presentation"` for clarity where decorative.
- **Not verified this pass:** color-contrast ratios (dark glass theme), focus-trap/restore in modals/drawers, full keyboard traversal, visible focus rings on all interactive elements.

## Recommendation
Run axe/Lighthouse a11y + a manual keyboard-only pass on: header nav, listing detail, inquiry/feedback/request forms, admin tables, and dialogs. Fix any contrast failures from the dark theme. Acceptable to launch a controlled beta and close these in parallel.

| Area | Verdict |
|---|---|
| Form labels | ✅ |
| Icon-button labels | ✅ (spot-checked) |
| Landmarks/headings | ✅ |
| Contrast / focus mgmt / keyboard | ⚠ unverified — audit before public |
