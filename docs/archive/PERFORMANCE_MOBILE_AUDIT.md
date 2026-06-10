# Performance / Mobile Audit — TradeWind (Phase 12)

**Date:** 2026-06-03

## Verdict: Acceptable. One real perf concern (1MB main chunk). Mobile UX is solid.

## Bundle
- Dashboards + premium pages are lazy-loaded (`React.lazy` in `src/App.tsx`) — good. Per-page chunks are small (2–61 KB).
- **Main `index` chunk: 1,060 KB (gzip ~300 KB)** — heavy. Drivers: framer-motion (pervasive), Radix UI primitives (all eager), Supabase SDK, eager public pages. `vite.config.ts` defines **no `manualChunks`**.
- `TradeWindHeroScene` (3D) is correctly lazy-loaded and **disabled on mobile / reduced-motion**.

**Recommendation (WARNING, not blocker):** add `build.rollupOptions.output.manualChunks` to split vendor (framer-motion, radix, supabase) from app code; consider lighter animation for non-critical surfaces. Run Lighthouse mobile before public launch.

## Mobile
- Mobile nav drawer with `aria-expanded` (`Header.tsx:94-102`); desktop nav hidden under `md`.
- Touch targets ≥44px (`h-11 w-11`). Responsive grid patterns throughout (`grid-cols-1 md:… lg:…`); **no fixed `w-[1200px]`-style traps found** → no obvious horizontal scroll.
- Images use `object-cover` + `loading="lazy"` in several places; 3D disabled on mobile.

## Status
| Area | Verdict |
|---|---|
| Code-splitting (dashboards) | ✅ |
| Main chunk size | ⚠ 1MB — optimize before public scale |
| Mobile nav / touch targets | ✅ |
| Horizontal scroll | ✅ none found |
| Reduced-motion / mobile 3D off | ✅ |
