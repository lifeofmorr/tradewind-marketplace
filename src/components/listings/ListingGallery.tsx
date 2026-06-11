import { useState } from "react";
import type { ListingCategory, ListingPhoto } from "@/types/database";
import { ListingPlaceholder } from "@/components/listings/ListingPlaceholder";
import { cn } from "@/lib/utils";
import { buildSrcSet, getImageUrl } from "@/lib/images";

interface Props {
  photos: ListingPhoto[];
  coverFallback?: string | null;
  category?: ListingCategory;
}

interface GalleryPhoto { id: string; url: string }

export function ListingGallery({ photos, coverFallback, category }: Props) {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const list: GalleryPhoto[] = photos.length
    ? photos.map((p) => ({ id: p.id, url: p.url ?? p.storage_path }))
    : (coverFallback ? [{ id: "cover", url: coverFallback }] : []);

  if (!list.length) {
    return (
      <div className="aspect-[16/9] rounded-lg overflow-hidden">
        <ListingPlaceholder category={category ?? "car"} label="No photos yet" />
      </div>
    );
  }
  const current = list[Math.min(active, list.length - 1)];
  const currentFailed = failed.has(current.id);
  return (
    <div className="space-y-3">
      <div className="aspect-[16/9] bg-secondary rounded-lg overflow-hidden">
        {currentFailed ? (
          <ListingPlaceholder category={category ?? "car"} label="Photo unavailable" />
        ) : (
          <img
            src={getImageUrl(current.url, 1200) ?? current.url}
            srcSet={buildSrcSet(current.url)}
            sizes="(min-width: 1024px) 66vw, 100vw"
            alt={`Photo ${active + 1} of ${list.length}`}
            width={1200}
            height={675}
            className="h-full w-full object-cover"
            decoding="async"
            onError={() => setFailed((prev) => new Set(prev).add(current.id))}
          />
        )}
      </div>
      {list.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Photo gallery"
        >
          {list.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Show photo ${i + 1} of ${list.length}`}
              onClick={() => setActive(i)}
              className={cn(
                "h-16 w-24 shrink-0 rounded overflow-hidden border-2 focus:outline-none focus:ring-2 focus:ring-brass-500",
                i === active ? "border-brass-500" : "border-transparent",
              )}
            >
              <img
                src={getImageUrl(p.url, 400) ?? p.url}
                alt=""
                width={96}
                height={64}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
