// Automated accessibility gate: axe-core scans of the main public routes,
// failing the suite on any WCAG 2.0/2.1 A or AA violation. Runs against the
// same mocked-Supabase dev server as the smoke tests (see support.ts), so
// listing grids, pagination, and detail pages are populated and scanned in
// their real rendered state.
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mockSupabase } from "./support";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

const ROUTES: { path: string; ready: (page: import("@playwright/test").Page) => Promise<void> }[] = [
  { path: "/", ready: async (page) => { await page.getByRole("heading", { level: 1 }).waitFor(); } },
  { path: "/browse", ready: async (page) => { await page.getByText("E2E Listing 0").waitFor(); } },
  { path: "/boats", ready: async (page) => { await page.getByText("E2E Listing 0").waitFor(); } },
  { path: "/aircraft", ready: async (page) => { await page.getByText("E2E Listing 0").waitFor(); } },
  { path: "/listings/e2e-listing-5", ready: async (page) => { await page.getByRole("heading", { name: "E2E Listing 5" }).waitFor(); } },
  { path: "/pricing", ready: async (page) => { await page.getByRole("heading", { level: 1 }).waitFor(); } },
  { path: "/login", ready: async (page) => { await page.getByLabel(/email/i).waitFor(); } },
];

test.beforeEach(async ({ page }) => {
  await mockSupabase(page);
});

for (const route of ROUTES) {
  test(`axe: ${route.path} has no WCAG A/AA violations`, async ({ page }) => {
    await page.goto(route.path);
    await route.ready(page);

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

    const summary = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.slice(0, 5).map((n) => `${n.target.join(" ")} :: ${n.html}`),
    }));
    expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
  });
}
