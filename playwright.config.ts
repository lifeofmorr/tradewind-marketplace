import { defineConfig, devices } from "@playwright/test";

// E2E smoke tests for the public, unauthenticated surface. The dev server is
// started with VITE_SUPABASE_URL pointed at the app's own origin so the tests
// can intercept Supabase REST traffic with page.route() — no live backend,
// no credentials, fully deterministic (see e2e/support.ts).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:5174",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npx vite --port 5174 --strictPort",
    url: "http://localhost:5174",
    reuseExistingServer: !process.env.CI,
    timeout: 90_000,
    env: {
      VITE_SUPABASE_URL: "http://localhost:5174",
      VITE_SUPABASE_ANON_KEY: "e2e-anon-key",
    },
  },
});
