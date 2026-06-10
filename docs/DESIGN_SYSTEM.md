# TradeWind Design System

## Palette

| Token | Hex | Use |
|---|---|---|
| Navy 950 | `#0a1628` | Primary background |
| Navy 800 | `#0f2238` | Secondary surfaces |
| Navy 700 | `#1a3454` | Hover surfaces, gradients |
| Brass 500 | `#c9a84c` | Accent, CTAs, links |
| Brass 400 | `#e6c478` | Hover, gradient highlight |
| Ivory | `#f5f0e8` | Used in selection + brand voice; Tailwind `foreground` |

Tailwind exposes these as `navy-{700,800,900,950}` and `brass-{400,500,700}`.
HSL CSS variables (`--background`, `--foreground`, etc.) live in `src/index.css`
and follow the shadcn convention.

## Typography

- **Display:** Fraunces (serif, expressive headlines)
- **Sans:** Inter (UI, body)
- **Mono:** IBM Plex Mono (eyebrows, scores, tracking labels)

Heading scale relies on `font-display` + Tailwind sizes (`text-5xl`–`text-7xl` for
hero, `text-3xl`/`text-4xl` for section titles).

## Spacing & Container

- `container-pad` utility = Tailwind container with `px-6 md:px-8`.
- 1320px max width on `2xl` breakpoint.
- Sections use `py-16` to `py-20` desktop; hero uses `py-24 lg:py-36`.

## Shadows & Depth

- `--shadow-soft`: subtle card lift (`var(--shadow-soft)`).
- `--shadow-lift`: hover lift on `lift-card`.
- `--shadow-glow`: brass ring glow on `brass-glow`.

## Component classes (in `src/index.css`)

- `.glass-card` — backdrop-blur glassmorphism with subtle border.
- `.glass-card-elevated` — same but stronger lift.
- `.lift-card` — translate-up + shadow-lift on hover. Reduced-motion safe.
- `.brass-glow` — adds brass-tinted ring on hover.
- `.btn-glow` — sweep-shine animation for primary CTAs.
- `.eyebrow` — mono uppercase brass label, the recurring "kicker" pattern.
- `.section-title` + `.section-title-underline` — display heading + brass underline.
- `.skeleton` — shimmering loading placeholder.
- `.chip` — generic small ring-bordered pill.

## Utilities

- `.hero-glow` — multi-radial-gradient hero backdrop.
- `.text-brass-gradient` — animated brass gradient text fill.
- `.depth-3d` / `.depth-3d-inner` — micro-3D card transform on hover.
- `.divider-brass` — dotted brass divider line.
- `animate-float`, `animate-pulse-glow` — slow ambient motion.

## Animation

- **framer-motion** drives scroll-reveal via `<Reveal>` (`src/components/ui/Reveal.tsx`).
- **react-intersection-observer** triggers reveal once per section.
- All animations honor `prefers-reduced-motion: reduce` (CSS media query in `index.css`
  + `useReducedMotion` in Reveal).

## Image policy

- Always provide a `<ListingPlaceholder>` fallback when `cover_photo_url` is null
  (per Phase 0 audit). The placeholder uses a category-specific lucide icon over a
  navy radial gradient.
- All `<img>` tags inside cards have `loading="lazy"`.

## Loading states

- `<div class="skeleton" />` for inline skeletons.
- ListingDetail shows a structured skeleton while loading.

## Mobile

- Container gutters scale with `px-6 md:px-8`.
- Grids cascade `sm:grid-cols-2 lg:grid-cols-{3,4,5}`.
- Hero text scales `text-5xl md:text-7xl`.
- ListingDetail collapses to single column below `lg`.
- CompareDrawer is `fixed inset-x-0 bottom-0` and never blocks scrolling.
