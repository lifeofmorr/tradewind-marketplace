/**
 * SEO meta + JSON-LD helpers. Imperative API: setMeta() updates document.head.
 * Wire from page components via useEffect.
 */
import { BRAND } from "./brand";

export interface MetaArgs {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product" | "vehicle";
  jsonLd?: object;
}

const TITLE_SUFFIX = ` — ${BRAND.name}`;

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
  if (!el) {
    const tag = selector.startsWith("link") ? "link" : "meta";
    el = document.createElement(tag) as any;
    document.head.appendChild(el!);
  }
  for (const [k, v] of Object.entries(attrs)) (el as any).setAttribute(k, v);
}

function upsertJsonLd(json: object) {
  const id = "tradewind-jsonld";
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.text = JSON.stringify(json);
}

export function setMeta({ title, description, canonical, ogImage, ogType = "website", jsonLd }: MetaArgs) {
  const fullTitle = title.endsWith(BRAND.name) ? title : title + TITLE_SUFFIX;
  document.title = fullTitle;
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  const canonicalUrl = canonical ?? `https://${BRAND.domain}${path}`;

  upsertMeta('meta[name="description"]', { name: "description", content: description });
  upsertMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle });
  upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
  upsertMeta('meta[property="og:type"]', { property: "og:type", content: ogType });
  upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
  if (ogImage) upsertMeta('meta[property="og:image"]', { property: "og:image", content: ogImage });
  upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: ogImage ? "summary_large_image" : "summary" });
  upsertMeta('link[rel="canonical"]', { rel: "canonical", href: canonicalUrl });
  if (jsonLd) upsertJsonLd(jsonLd);
}

export function listingMeta(listing: {
  title: string; description?: string | null; ai_summary?: string | null;
  category: string; make?: string | null; model?: string | null; year?: number | null;
  price_cents?: number | null; city?: string | null; state?: string | null;
  cover_photo_url?: string | null;
}): MetaArgs {
  const isBoat = ["boat","performance_boat","yacht","center_console"].includes(listing.category);
  const description =
    listing.ai_summary ??
    listing.description?.slice(0, 160) ??
    `${listing.title} for sale on ${BRAND.name}.`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isBoat ? "Product" : "Vehicle",
    name: listing.title,
    description,
    brand: listing.make,
    model: listing.model,
    vehicleModelDate: listing.year,
    offers: listing.price_cents
      ? { "@type": "Offer", priceCurrency: "USD", price: (listing.price_cents / 100).toFixed(2),
          availability: "https://schema.org/InStock" }
      : undefined,
    image: listing.cover_photo_url ?? undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.city ?? undefined,
      addressRegion: listing.state ?? undefined,
      addressCountry: "US",
    },
  };
  return {
    title: listing.title,
    description,
    ogImage: listing.cover_photo_url ?? undefined,
    ogType: "product",
    jsonLd,
  };
}

export function categoryMeta(group: "boat" | "auto", label: string, blurb: string, count?: number): MetaArgs {
  const title = count ? `${count} ${label} for sale` : `${label} for sale`;
  return { title, description: blurb, ogType: "website" };
}

export function dealerMeta(dealer: { name: string; description?: string | null; city?: string | null; state?: string | null; logo_url?: string | null }): MetaArgs {
  const loc = [dealer.city, dealer.state].filter(Boolean).join(", ");
  return {
    title: `${dealer.name}${loc ? ` — ${loc}` : ""}`,
    description: dealer.description ?? `${dealer.name} dealer profile on ${BRAND.name}.`,
    ogImage: dealer.logo_url ?? undefined,
    ogType: "website",
  };
}

export function serviceProviderMeta(p: { name: string; category: string; description?: string | null; city?: string | null; state?: string | null; logo_url?: string | null }): MetaArgs {
  const loc = [p.city, p.state].filter(Boolean).join(", ");
  const cat = p.category.replace("_", " ");
  return {
    title: `${p.name} — ${cat}${loc ? ` in ${loc}` : ""}`,
    description: p.description ?? `${p.name} (${cat}) on ${BRAND.name}.`,
    ogImage: p.logo_url ?? undefined,
    ogType: "website",
  };
}
