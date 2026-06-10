# Performance Final QA · 2026-05-21

## Build output
`npm run build` → built in 4.41s. Key chunks:

| Chunk | Size | Gzipped |
|---|---:|---:|
| `dist/assets/index-BPk5WQYB.js` (eager) | 1,043.93 kB | 296.16 kB |
| `EditListing` (lazy) | 24.00 kB | 6.57 kB |
| `Community` (lazy) | 20.05 kB | 6.68 kB |
| `DealerDashboard` (lazy) | 17.05 kB | 5.25 kB |
| `TradeWindHeroScene` (lazy) | 14.31 kB | 5.64 kB |
| `BuyerDashboard` (lazy) | 13.60 kB | 4.64 kB |
| `FinancialHub` (lazy) | 11.80 kB | 4.11 kB |
| `TransactionRoom` (lazy) | 10.93 kB | 3.64 kB |
| `DealerImport` (lazy) | 10.77 kB | 4.11 kB |
| Admin / dealer / buyer routes (lazy) | 2.9 kB – 9.3 kB | 1.0 – 3.4 kB |

The eager bundle (Home + PublicShell + ListingDetail + Category browse +
SimplePages + auctions + blog + market reports) is **296 KB gzipped**.
That covers the entire public marketplace surface buyers land on. Vite's
default 500 KB chunk warning fires on the ungzipped size — acceptable given
the surface area covered.

## Lazy route count
`grep -c "lazy(" src/App.tsx` → **42 lazy-loaded routes.**

Every dashboard surface (Buyer, Seller, Dealer, Service Provider, Admin) and
every "expansion" surface (Aircraft, Aviation Services, Integrations,
Developer Hub, Community, Data Deletion, Financial Hub, Transaction Room) is
code-split into its own chunk. The first-paint public bundle does not pull
in any dashboard code.

## Image CDN params
Every demo photo URL uses `?w=1200&q=80&auto=format&fit=crop` (127 occurrences
in the source-match script). This means Unsplash serves:
- `w=1200` — 1200px max width (right-size for hero + card grid)
- `q=80` — 80 quality (industry default)
- `auto=format` — AVIF/WebP based on Accept header
- `fit=crop` — center-crop to maintain aspect

Real seller uploads go through Supabase Storage which serves the original
encoding; this is acceptable for beta volume.

## Hot-path responsiveness
- React Query is used to deduplicate and cache server reads across routes.
- `ErrorBoundary` wraps every lazy route so a single bundle failure can't
  white-screen the whole app.
- `PageSpinner` keeps the loading-shell consistent across lazy fallback
  states.

## Conclusion
**Zero performance blockers for private beta.** Eager bundle is 296 KB
gzipped; 42 lazy routes split out dashboards and expansion surfaces. Demo
imagery is right-sized for both card and detail views.

Future work (post-beta, not blocking):
- Split the eager bundle further via `manualChunks` to drop the chunk-size
  warning.
- Consider Cloudflare Images / Vercel Image for buyer-uploaded photos.
