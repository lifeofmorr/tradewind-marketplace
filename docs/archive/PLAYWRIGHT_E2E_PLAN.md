# Playwright E2E Plan — TradeWind

**Last reviewed:** 2026-05-26
**Status:** plan only — no Playwright code shipped yet. Add when entering public-beta phase.

Vitest covers component + unit tests (66/66 passing). Playwright will cover the user-visible flows that need a real browser, real DOM, and real network roundtrips.

## Setup

```bash
npm i -D @playwright/test
npx playwright install --with-deps chromium
mkdir e2e
```

Add to `package.json`:
```jsonc
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

Add `playwright.config.ts`:
```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
  ],
});
```

## Test scenarios (priority order)

### P0 — must pass before each release

1. **Anonymous browse** — home → category page → listing detail → contact form opens.
2. **Signup happy path** — buyer signs up → confirms via email link (stubbed in test mode) → lands on `/`.
3. **Login & logout** — existing user signs in → sees correct dashboard nav → signs out.
4. **Banned user lockout** — seed a banned user → attempt login → redirected to `/`.
5. **Admin route gating** — non-admin user navigates to `/admin` → redirected to `/`.
6. **Listing creation** — seller signs in → creates listing → submitted for review.
7. **Featured checkout (TEST mode)** — seller clicks "Promote" → Stripe Checkout test card → returns to success page → `listings.is_featured = true`.
8. **Dealer subscription (TEST mode)** — dealer signs up → checks out Starter → returns to dealer dashboard.

### P1 — should pass on each release

9. Inquiry submission + AI fraud screen invocation.
10. Buyer saves listing → appears in `/buyer/saved`.
11. Dealer CSV import (small valid file).
12. Service-provider lead receipt.
13. Concierge request flow.
14. Aircraft search filters by category.
15. Auctions: place bid, end auction (via cron stub).

### P2 — nice to have

16. Programmatic SEO pages render correct titles/meta.
17. Sitemap.xml is reachable.
18. Trust Center + Data Deletion form submission.
19. Community: create post → comment → like.
20. Mobile viewport: nav menu, hero section legible at 375×667.

## Auth helpers

Stub Supabase Auth with test users seeded in staging.

```ts
// e2e/helpers/auth.ts
import { Page } from "@playwright/test";

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(buyer|seller|dealer|admin)/);
}
```

## Stripe test mode

Use the Stripe TEST card `4242 4242 4242 4242` + any future expiry + any CVC. Use `playwright-stripe` helper or hand-write fills against `js.stripe.com` iframe.

## CI integration

Add to GitHub Actions (when CI is wired):
```yaml
- run: npm ci
- run: npx playwright install --with-deps chromium
- run: npm run test:e2e
  env:
    E2E_BASE_URL: ${{ steps.preview.outputs.url }}
```

Run E2E against the Vercel preview deploy URL — this gives confidence the real bundled app works, not just dev mode.

## Data hygiene

- E2E tests run against the **staging Supabase project**, never production.
- Test users live in a `e2e_` email prefix → easy to mass-delete weekly.
- Test listings flagged `is_demo = true` so they never leak to public surfaces.

## Open items before E2E goes live

- [ ] Wire CI (GitHub Actions or similar).
- [ ] Decide preview-vs-production target for nightly E2E.
- [ ] Add `playwright-stripe` or hand-write Stripe iframe fills.
- [ ] Define data-reset hook so E2E doesn't leave orphans.
