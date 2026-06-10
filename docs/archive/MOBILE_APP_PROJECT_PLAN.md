# TradeWind · Mobile App Project Plan

_Last updated: 2026-04-29_

The native client is a **separate project** from this web repo. This file
captures the plan so it can be lifted into the mobile codebase on day one.

## Stack

- **Expo (managed workflow) + React Native + TypeScript strict.**
- **Auth & data:** Supabase JS client, same project + RLS as web.
- **State:** TanStack Query (mirrors web), Zustand for ephemeral UI state.
- **Navigation:** Expo Router (file-based) with a tab + stack hybrid.
- **Styling:** NativeWind so the brass/navy design tokens transfer 1:1.

## Shared types

Lift `src/types/database.ts` into a `@tradewind/types` package (npm
workspace or git submodule). The mobile app imports the same `Listing`,
`Dealer`, `Profile`, `ListingCategory` (including the six new aircraft
values) so server contracts stay in sync.

## Screens (v1)

1. **Browse** — search bar, category chips (boats, autos, aircraft),
   filter sheet, infinite scroll.
2. **Listing Detail** — photo carousel, specs, deal score card, asset
   passport, "Message seller" CTA.
3. **Saved** — saved listings list, swipe-to-remove.
4. **Compare** — up to 4 listings side-by-side (parity with web).
5. **Buyer Dashboard** — saved, requests, messages, financial hub link.
6. **Community** — public threads + buying/selling guides (read-only v1).

## Push notifications (roadmap)

- **v1.1:** Expo push tokens stored on `profiles.push_token`. Server
  triggers via existing `send-email` edge fn extended to fan out via Expo's
  push service. Notification kinds reuse `notification_kind` enum.
- **v1.2:** Per-channel preferences (lead, listing_status, payment, etc.).
- **v1.3:** Rich notifications with photo previews for new listings that
  match a saved search.

## App store requirements

- **iOS:** Apple Developer account ($99/yr), App Store Connect listing,
  age rating, privacy nutrition labels matching `DATA_PRIVACY.md`. Sign-in
  with Apple is required since the app supports email auth.
- **Android:** Play Console account ($25 one-time), data-safety form,
  target API per Play's annual deadline.
- **Both:** privacy policy URL (`/privacy`), data-deletion URL
  (`/delete-my-data`), in-app account deletion flow, support email.
- **Permissions:** camera (listing photos), photo library, push
  notifications, optionally location for "near me" filtering.

## Out of scope for v1

- Seller listing creation (use web for now — saves App Store review pain
  around content moderation).
- Auctions (web-only until bidding UX stabilizes).
- Dealer dashboards.
