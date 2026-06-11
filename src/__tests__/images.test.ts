// Tests for the responsive-image URL helpers (free-tier srcset pipeline).
import { describe, it, expect, vi, afterEach } from "vitest";
import { getImageUrl, buildSrcSet, SRCSET_WIDTHS } from "@/lib/images";

const UNSPLASH = "https://images.unsplash.com/photo-abc123?w=1200&q=80&auto=format&fit=crop";
const STORAGE = "https://example.supabase.co/storage/v1/object/public/listings-photos/u1/l1/photo.jpg";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getImageUrl", () => {
  it("rewrites Unsplash URLs to the requested width", () => {
    const out = new URL(getImageUrl(UNSPLASH, 400)!);
    expect(out.hostname).toBe("images.unsplash.com");
    expect(out.searchParams.get("w")).toBe("400");
    expect(out.searchParams.get("auto")).toBe("format");
  });

  it("leaves Supabase storage URLs untouched while transforms are not enabled", () => {
    expect(getImageUrl(STORAGE, 400)).toBe(STORAGE);
  });

  it("rewrites Supabase storage URLs to the render endpoint when the flag is on", () => {
    vi.stubEnv("VITE_SUPABASE_IMAGE_TRANSFORMS", "1");
    const out = new URL(getImageUrl(STORAGE, 400)!);
    expect(out.pathname).toContain("/storage/v1/render/image/public/listings-photos/");
    expect(out.searchParams.get("width")).toBe("400");
  });

  it("returns unknown hosts and junk unchanged", () => {
    expect(getImageUrl("https://cdn.example.com/a.jpg", 400)).toBe("https://cdn.example.com/a.jpg");
    expect(getImageUrl("not a url", 400)).toBe("not a url");
    expect(getImageUrl(null, 400)).toBeNull();
  });
});

describe("buildSrcSet", () => {
  it("builds a width-described srcset for resizable hosts", () => {
    const srcset = buildSrcSet(UNSPLASH)!;
    const entries = srcset.split(", ");
    expect(entries).toHaveLength(SRCSET_WIDTHS.length);
    for (const [i, w] of SRCSET_WIDTHS.entries()) {
      expect(entries[i].endsWith(` ${w}w`)).toBe(true);
      expect(new URL(entries[i].split(" ")[0]).searchParams.get("w")).toBe(String(w));
    }
  });

  it("returns undefined for hosts that cannot resize (no useless one-entry srcset)", () => {
    expect(buildSrcSet(STORAGE)).toBeUndefined();
    expect(buildSrcSet("https://cdn.example.com/a.jpg")).toBeUndefined();
    expect(buildSrcSet(null)).toBeUndefined();
  });
});
