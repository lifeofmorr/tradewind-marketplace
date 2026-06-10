import type { Page, Route } from "@playwright/test";

export const TOTAL_LISTINGS = 60;
export const PAGE_SIZE = 24;

export function makeListing(i: number) {
  return {
    id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
    slug: `e2e-listing-${i}`,
    title: `E2E Listing ${i}`,
    description: "Deterministic test listing served by the e2e route mock.",
    ai_summary: null,
    category: "boat",
    status: "active",
    price_cents: 1_000_000 + i * 100,
    currency: "USD",
    year: 2020,
    make: "Boston Whaler",
    model: `Model ${i}`,
    city: "Miami",
    state: "FL",
    cover_photo_url: null,
    video_url: null,
    condition: null,
    length_ft: 32,
    hours: 250,
    engine_count: 2,
    engine_hp: 300,
    engine_make: null,
    hull_material: null,
    mileage: null,
    drivetrain: null,
    fuel_type: null,
    transmission: null,
    exterior_color: null,
    is_demo: false,
    is_featured: false,
    is_premium: false,
    seller_id: "00000000-0000-4000-8000-00000000aaaa",
    seller_type: "private",
    dealer_id: null,
    view_count: 12,
    inquiry_count: 1,
    deal_score: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    published_at: "2026-01-01T00:00:00.000Z",
  };
}

function fulfillJson(route: Route, body: unknown, headers: Record<string, string> = {}) {
  return route.fulfill({
    status: 200,
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

/**
 * Intercepts every Supabase REST call the SPA makes and serves a
 * deterministic in-memory dataset of TOTAL_LISTINGS active listings.
 * Pagination semantics mirror PostgREST: `offset`/`limit` query params and a
 * `content-range` header carrying the exact count.
 */
export async function mockSupabase(page: Page, opts: { total?: number } = {}) {
  const total = opts.total ?? TOTAL_LISTINGS;

  // The cookie banner overlays the footer; acknowledge it up front.
  await page.addInitScript(() => {
    window.localStorage.setItem("tw_cookie_ack_v1", "1");
  });

  await page.route("**/rest/v1/**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const table = url.pathname.split("/rest/v1/")[1]?.split("?")[0] ?? "";
    const accept = req.headers()["accept"] ?? "";
    const wantsObject = accept.includes("vnd.pgrst.object");

    if (table === "listings") {
      const slugFilter = url.searchParams.get("slug");
      if (slugFilter?.startsWith("eq.")) {
        const slug = slugFilter.slice(3);
        const match = Array.from({ length: total }, (_, i) => makeListing(i)).find((l) => l.slug === slug);
        if (wantsObject) {
          if (match) return fulfillJson(route, match);
          return route.fulfill({
            status: 406,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ code: "PGRST116", message: "0 rows" }),
          });
        }
        return fulfillJson(route, match ? [match] : []);
      }

      const search = url.searchParams.get("or") ?? "";
      // The browse search filter narrows to a small fixed subset so the
      // filters-reset-page test has a deterministic result set.
      const effectiveTotal = search.includes("ilike") ? 3 : total;
      const offset = Number(url.searchParams.get("offset") ?? "0");
      const limit = Number(url.searchParams.get("limit") ?? String(PAGE_SIZE));
      if (offset >= effectiveTotal && effectiveTotal > 0) {
        return route.fulfill({
          status: 416,
          headers: { "content-type": "application/json", "content-range": `*/${effectiveTotal}` },
          body: JSON.stringify({ code: "PGRST103", message: "Requested range not satisfiable" }),
        });
      }
      const end = Math.min(offset + limit, effectiveTotal);
      const rows = [];
      for (let i = offset; i < end; i++) rows.push(makeListing(i));
      return fulfillJson(route, rows, {
        "content-range": `${offset}-${Math.max(offset, end - 1)}/${effectiveTotal}`,
      });
    }

    // Everything else (photos, reviews, dealers, …): empty result set.
    return fulfillJson(route, wantsObject ? {} : []);
  });

  // Auth/storage/functions endpoints — never let them escape to the network.
  await page.route("**/auth/v1/**", (route) =>
    fulfillJson(route, { error: "e2e: auth disabled" }),
  );
  await page.route("**/functions/v1/**", (route) =>
    fulfillJson(route, { error: "e2e: functions disabled" }),
  );
}
