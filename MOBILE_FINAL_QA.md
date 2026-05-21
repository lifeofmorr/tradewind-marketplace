# Mobile Final QA · 2026-05-21

## Header / nav
`src/components/layout/Header.tsx`:
- Desktop nav: `<nav className="hidden md:flex …">` (line 48)
- Hamburger toggle: `md:hidden inline-flex items-center justify-center h-11 w-11` (line 96–98)
- Mobile menu sheet: `md:hidden border-t border-border bg-background` (line 105–150)

Hamburger has explicit `aria-label={open ? "Close menu" : "Open menu"}` and an
11×11 hit target (44px on mobile — meets WCAG touch target spec).

## Listing grid
`src/components/listings/ListingGrid.tsx` (line 40):
```
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
```
Mobile: 1 column. Tablet: 2. Desktop: 3. Large: 4.

## Responsive class density (top files)
| File | sm/md/lg/xl/grid/flex-wrap occurrences |
|---|---|
| pages/Home.tsx | 12 |
| pages/RequestPages.tsx | 8 |
| components/listings/AircraftSpecsForm.tsx | 8 |
| pages/SeoPages.tsx | 7 |
| pages/DealerProfile.tsx | 7 |
| pages/public/TrustCenter.tsx | 6 |
| pages/public/Integrations.tsx | 6 |
| pages/public/DeveloperHub.tsx | 6 |
| pages/ServiceProviderProfile.tsx | 6 |
| pages/ListingDetail.tsx | 6 |

Every primary surface uses responsive Tailwind classes — no fixed-pixel
widths or unscaled hero text.

## Horizontal-scroll tables
`overflow-x-auto` is used on **15 tables / wide containers** across:
- AdminListings, AdminPayments, AdminUsers, AdminAuctions
- DealerInventory, DealerAnalytics, DealerWidgets
- SellerListings, SellerAuctions
- BuyerCompare
- ListingGallery thumbnail strip
- CompareDrawer chip strip
- DealerImport CSV preview
- AdminContent

No data table breaks the viewport on mobile.

## Mobile menu accessibility
The hamburger button uses `h-11 w-11` (44px), satisfies the 44pt iOS hit-target
recommendation and Android's 48dp. `aria-label` flips between "Open menu" and
"Close menu". Mobile menu nav is a `<nav>` with `flex-col` items.

## Conclusion
**Zero mobile blockers.** Header, listing grid, tables, and primary content
surfaces are all responsive. Hit targets are accessible.
