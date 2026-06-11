// Responsive-image URL helpers — no paid vendor required.
//
// Three URL families appear in listing photos:
//
// 1. images.unsplash.com (all current demo/production photos): supports
//    `w=` / `q=` / `auto=format` query params natively and free — we rewrite
//    them per requested width.
// 2. Supabase Storage public object URLs (`/storage/v1/object/public/…`,
//    used once sellers upload real photos): Supabase's image transformation
//    (`/render/image/public/…?width=`) is a paid-plan feature. As of
//    2026-06-10 this project has zero storage-hosted photos, so transform
//    availability cannot be verified against a real object — the rewrite is
//    therefore gated behind VITE_SUPABASE_IMAGE_TRANSFORMS=1 and off by
//    default. Flip the flag once the plan supports it (verify with any
//    uploaded object: /storage/v1/render/image/public/<bucket>/<path>?width=100).
// 3. Anything else: returned untouched (no srcset benefit, but no breakage).

const DEFAULT_QUALITY = 75;

/** Standard widths used for listing-card / gallery srcsets. */
export const SRCSET_WIDTHS = [400, 800, 1200] as const;

function isUnsplash(url: URL): boolean {
  return url.hostname === "images.unsplash.com";
}

function isSupabasePublicObject(url: URL): boolean {
  return url.pathname.includes("/storage/v1/object/public/");
}

function supabaseTransformsEnabled(): boolean {
  return import.meta.env.VITE_SUPABASE_IMAGE_TRANSFORMS === "1";
}

/**
 * Returns a URL serving the image at (approximately) the requested width,
 * when the host supports free resizing — otherwise the original URL.
 */
export function getImageUrl(raw: string | null | undefined, width: number): string | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return raw;
  }
  if (isUnsplash(url)) {
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(DEFAULT_QUALITY));
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    return url.toString();
  }
  if (isSupabasePublicObject(url) && supabaseTransformsEnabled()) {
    url.pathname = url.pathname.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
    url.searchParams.set("width", String(width));
    url.searchParams.set("quality", String(DEFAULT_QUALITY));
    return url.toString();
  }
  return raw;
}

/**
 * Builds a `srcset` string for the standard widths, or undefined when the
 * host can't resize (a one-entry srcset is just noise).
 */
export function buildSrcSet(
  raw: string | null | undefined,
  widths: readonly number[] = SRCSET_WIDTHS,
): string | undefined {
  if (!raw) return undefined;
  const first = getImageUrl(raw, widths[0] ?? 400);
  if (first === raw) return undefined; // host doesn't support resizing
  return widths.map((w) => `${getImageUrl(raw, w)} ${w}w`).join(", ");
}
