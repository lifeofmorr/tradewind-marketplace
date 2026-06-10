// E2E smoke tests for the public, unauthenticated surface: home, browse with
// filters + pagination, listing detail, navigation, and the auth gate.
// Supabase REST traffic is intercepted in the browser (see support.ts), so
// these run without a live backend and are fully deterministic.
import { test, expect } from "@playwright/test";
import { mockSupabase } from "./support";

test.beforeEach(async ({ page }) => {
  await mockSupabase(page);
});

test.describe("home page", () => {
  test("renders the hero and primary navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Boats. Autos. Aircraft.");
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();
  });

  test("has a single h1 and a meaningful title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Tradewind/i);
    expect(await page.locator("h1").count()).toBe(1);
  });
});

test.describe("browse + pagination", () => {
  test("lists the first page of 24 with an accessible pagination control", async ({ page }) => {
    await page.goto("/browse");
    await expect(page.getByText("E2E Listing 0")).toBeVisible();
    await expect(page.getByText("E2E Listing 23")).toBeVisible();
    await expect(page.getByText("E2E Listing 24")).toHaveCount(0);

    const nav = page.getByRole("navigation", { name: "Pagination" });
    await expect(nav).toBeVisible();
    await expect(nav).toContainText("Page 1 of 3");
    await expect(nav).toContainText("60 listings");
    await expect(nav.getByRole("button", { name: "Previous page" })).toBeDisabled();
    await expect(nav.getByRole("button", { name: "Next page" })).toBeEnabled();
  });

  test("Next/Previous walk the pages and sync ?page= to the URL", async ({ page }) => {
    await page.goto("/browse");
    const nav = page.getByRole("navigation", { name: "Pagination" });

    await nav.getByRole("button", { name: "Next page" }).click();
    await expect(page.getByText("E2E Listing 24")).toBeVisible();
    await expect(page).toHaveURL(/\/browse\?page=2$/);
    await expect(nav).toContainText("Page 2 of 3");

    await nav.getByRole("button", { name: "Next page" }).click();
    await expect(page.getByText("E2E Listing 48")).toBeVisible();
    await expect(page).toHaveURL(/\/browse\?page=3$/);
    await expect(nav.getByRole("button", { name: "Next page" })).toBeDisabled();

    await nav.getByRole("button", { name: "Previous page" }).click();
    await expect(page).toHaveURL(/\/browse\?page=2$/);
  });

  test("a ?page= deep link and browser back/forward restore the right page", async ({ page }) => {
    await page.goto("/browse?page=3");
    await expect(page.getByText("E2E Listing 48")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Pagination" })).toContainText("Page 3 of 3");

    await page.getByRole("button", { name: "Previous page" }).click();
    await expect(page).toHaveURL(/\/browse\?page=2$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/browse\?page=3$/);
    await expect(page.getByText("E2E Listing 48")).toBeVisible();
  });

  test("changing the search filter resets to page 1", async ({ page }) => {
    await page.goto("/browse?page=3");
    await expect(page.getByText("E2E Listing 48")).toBeVisible();

    await page.getByLabel("Search").fill("whaler");
    await page.getByRole("button", { name: /apply/i }).click();

    await expect(page).toHaveURL(/\/browse$/); // page param cleared
    await expect(page.getByText("E2E Listing 0")).toBeVisible();
    // 3 matching rows → single page → pagination hidden.
    await expect(page.getByRole("navigation", { name: "Pagination" })).toHaveCount(0);
  });
});

test.describe("listing detail", () => {
  test("renders a listing page from its public slug", async ({ page }) => {
    await page.goto("/listings/e2e-listing-5");
    await expect(page.getByRole("heading", { name: "E2E Listing 5" })).toBeVisible();
    await expect(page.getByText("$10,005")).toBeVisible(); // 1_000_500 cents
  });

  test("navigates from a browse card to the listing detail page", async ({ page }) => {
    await page.goto("/browse");
    await page.getByText("E2E Listing 3", { exact: true }).click();
    await expect(page).toHaveURL(/\/listings\/e2e-listing-3$/);
    await expect(page.getByRole("heading", { name: "E2E Listing 3" })).toBeVisible();
  });
});

test.describe("navigation and auth gate", () => {
  test("category browse pages render with the shared pagination", async ({ page }) => {
    await page.goto("/boats");
    await expect(page.getByRole("heading", { name: "Boats for sale" })).toBeVisible();
    await expect(page.getByText("E2E Listing 0")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Pagination" })).toContainText("Page 1 of 3");
  });

  test("the login page renders its form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("auth-gated seller routes redirect anonymous visitors to /login", async ({ page }) => {
    await page.goto("/seller/listings/new");
    await expect(page).toHaveURL(/\/login$/);
  });
});
