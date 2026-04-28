// GET /functions/v1/sitemap        → sitemap.xml
// GET /functions/v1/sitemap/robots → robots.txt (alternative to public/robots.txt)
//
// Generates a single XML sitemap covering:
//   - core public pages
//   - category pages
//   - active listings
//   - dealer + service-provider profiles
//   - published blog posts + market reports
//   - programmatic SEO routes (states, brands, city × category)
//
// Deploy with --no-verify-jwt:
//   supabase functions deploy sitemap --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPA_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPA_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const APP_URL = (Deno.env.get("APP_URL") ?? "https://gotradewind.com").replace(/\/$/, "");
const admin = createClient(SUPA_URL, SUPA_KEY, { auth: { persistSession: false } });

const CATEGORIES = [
  "boat", "performance_boat", "yacht", "center_console",
  "car", "truck", "exotic", "classic", "powersports", "rv",
];

const STATES: { code: string; slug: string }[] = [
  { code: "AL", slug: "alabama" }, { code: "AK", slug: "alaska" },
  { code: "AZ", slug: "arizona" }, { code: "AR", slug: "arkansas" },
  { code: "CA", slug: "california" }, { code: "CO", slug: "colorado" },
  { code: "CT", slug: "connecticut" }, { code: "DE", slug: "delaware" },
  { code: "FL", slug: "florida" }, { code: "GA", slug: "georgia" },
  { code: "HI", slug: "hawaii" }, { code: "ID", slug: "idaho" },
  { code: "IL", slug: "illinois" }, { code: "IN", slug: "indiana" },
  { code: "IA", slug: "iowa" }, { code: "KS", slug: "kansas" },
  { code: "KY", slug: "kentucky" }, { code: "LA", slug: "louisiana" },
  { code: "ME", slug: "maine" }, { code: "MD", slug: "maryland" },
  { code: "MA", slug: "massachusetts" }, { code: "MI", slug: "michigan" },
  { code: "MN", slug: "minnesota" }, { code: "MS", slug: "mississippi" },
  { code: "MO", slug: "missouri" }, { code: "MT", slug: "montana" },
  { code: "NE", slug: "nebraska" }, { code: "NV", slug: "nevada" },
  { code: "NH", slug: "new-hampshire" }, { code: "NJ", slug: "new-jersey" },
  { code: "NM", slug: "new-mexico" }, { code: "NY", slug: "new-york" },
  { code: "NC", slug: "north-carolina" }, { code: "ND", slug: "north-dakota" },
  { code: "OH", slug: "ohio" }, { code: "OK", slug: "oklahoma" },
  { code: "OR", slug: "oregon" }, { code: "PA", slug: "pennsylvania" },
  { code: "RI", slug: "rhode-island" }, { code: "SC", slug: "south-carolina" },
  { code: "SD", slug: "south-dakota" }, { code: "TN", slug: "tennessee" },
  { code: "TX", slug: "texas" }, { code: "UT", slug: "utah" },
  { code: "VT", slug: "vermont" }, { code: "VA", slug: "virginia" },
  { code: "WA", slug: "washington" }, { code: "WV", slug: "west-virginia" },
  { code: "WI", slug: "wisconsin" }, { code: "WY", slug: "wyoming" },
];

const FEATURED_BRANDS = [
  // boats
  "boston-whaler","grady-white","sea-ray","pursuit","regulator","contender",
  "yellowfin","scout","cobia","robalo","cigarette","nor-tech","mti","seavee",
  // autos
  "ford","chevrolet","toyota","ram","gmc","tesla","bmw","mercedes-benz",
  "porsche","lamborghini","ferrari","mclaren","cadillac","jeep","land-rover",
];

const FEATURED_CITIES: { slug: string }[] = [
  { slug: "miami" }, { slug: "tampa" }, { slug: "fort-lauderdale" },
  { slug: "naples" }, { slug: "annapolis" }, { slug: "newport" },
  { slug: "san-diego" }, { slug: "newport-beach" }, { slug: "seattle" },
  { slug: "lake-of-the-ozarks" }, { slug: "scottsdale" }, { slug: "los-angeles" },
  { slug: "dallas" }, { slug: "houston" }, { slug: "atlanta" },
  { slug: "charlotte" }, { slug: "denver" }, { slug: "chicago" },
  { slug: "new-york" }, { slug: "boston" },
];

const STATIC_PAGES = [
  "/", "/browse", "/categories", "/dealers", "/services",
  "/about", "/contact", "/blog", "/market-reports", "/auctions",
  "/pricing", "/sell", "/sell-my-boat", "/sell-my-car",
  "/financing", "/insurance", "/inspections", "/transport", "/concierge",
  "/terms", "/privacy", "/trust",
  "/brands", "/by-state", "/by-city",
];

function urlTag(loc: string, lastmod?: string, priority = 0.7): string {
  const parts = [`<loc>${loc}</loc>`];
  if (lastmod) parts.push(`<lastmod>${lastmod}</lastmod>`);
  parts.push(`<priority>${priority.toFixed(1)}</priority>`);
  return `<url>${parts.join("")}</url>`;
}

async function buildSitemap(): Promise<string> {
  const urls: string[] = [];

  for (const p of STATIC_PAGES) {
    urls.push(urlTag(`${APP_URL}${p}`, undefined, p === "/" ? 1.0 : 0.6));
  }
  for (const c of CATEGORIES) {
    urls.push(urlTag(`${APP_URL}/categories/${c}`, undefined, 0.7));
  }

  // Active listings
  const { data: listings } = await admin
    .from("listings")
    .select("slug, updated_at")
    .eq("status", "active")
    .limit(50000);
  for (const l of listings ?? []) {
    const row = l as { slug: string; updated_at: string };
    urls.push(urlTag(`${APP_URL}/listings/${row.slug}`, row.updated_at.slice(0, 10), 0.9));
  }

  // Dealers
  const { data: dealers } = await admin.from("dealers").select("slug, updated_at").limit(5000);
  for (const d of dealers ?? []) {
    const row = d as { slug: string; updated_at: string };
    urls.push(urlTag(`${APP_URL}/dealers/${row.slug}`, row.updated_at.slice(0, 10), 0.7));
  }

  // Service providers
  const { data: providers } = await admin.from("service_providers").select("slug, updated_at").limit(5000);
  for (const p of providers ?? []) {
    const row = p as { slug: string; updated_at: string };
    urls.push(urlTag(`${APP_URL}/services/${row.slug}`, row.updated_at.slice(0, 10), 0.6));
  }

  // Blog + market reports
  const { data: posts } = await admin.from("blog_posts").select("slug, updated_at").eq("is_published", true);
  for (const p of posts ?? []) {
    const row = p as { slug: string; updated_at: string };
    urls.push(urlTag(`${APP_URL}/blog/${row.slug}`, row.updated_at.slice(0, 10), 0.5));
  }
  const { data: reports } = await admin.from("market_reports").select("slug, updated_at").eq("is_published", true);
  for (const r of reports ?? []) {
    const row = r as { slug: string; updated_at: string };
    urls.push(urlTag(`${APP_URL}/market-reports/${row.slug}`, row.updated_at.slice(0, 10), 0.5));
  }

  // Programmatic SEO
  for (const s of STATES) {
    urls.push(urlTag(`${APP_URL}/boats-for-sale-in-${s.slug}`, undefined, 0.6));
  }
  for (const b of FEATURED_BRANDS) {
    urls.push(urlTag(`${APP_URL}/${b}-for-sale`, undefined, 0.6));
  }
  for (const c of CATEGORIES) {
    for (const city of FEATURED_CITIES) {
      urls.push(urlTag(`${APP_URL}/${c}-in-${city.slug}`, undefined, 0.5));
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
}

function robotsTxt(): string {
  return `User-agent: *
Allow: /

Sitemap: ${APP_URL}/sitemap.xml
`;
}

Deno.serve(async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  if (url.pathname.endsWith("/robots") || url.pathname.endsWith("/robots.txt")) {
    return new Response(robotsTxt(), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  try {
    const xml = await buildSitemap();
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (e) {
    return new Response(`error: ${(e as Error).message}`, { status: 500 });
  }
});
