import { Link } from "react-router-dom";
import { Heart, MapPin } from "lucide-react";
import type { Listing } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { ListingPlaceholder } from "@/components/listings/ListingPlaceholder";
import { formatCents, formatNumber } from "@/lib/utils";

interface Props {
  listing: Listing;
  saved?: boolean;
  onToggleSave?: () => void;
}

const BOAT_CATS = new Set(["boat", "performance_boat", "yacht", "center_console"]);

export function ListingCard({ listing, saved, onToggleSave }: Props) {
  const isBoat = BOAT_CATS.has(listing.category);
  return (
    <Link
      to={`/listings/${listing.slug}`}
      className="group block rounded-lg border border-border bg-card overflow-hidden hover:border-brass-500/50 transition-colors"
    >
      <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
        {listing.cover_photo_url ? (
          <img
            src={listing.cover_photo_url}
            alt={listing.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
          />
        ) : (
          <ListingPlaceholder category={listing.category} />
        )}
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
          {listing.is_demo && (
            <span className="inline-flex items-center rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm">
              Demo
            </span>
          )}
          {listing.is_featured && <Badge variant="accent">Featured</Badge>}
        </div>
        {onToggleSave && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onToggleSave(); }}
            className="absolute top-2 right-2 rounded-full bg-background/60 backdrop-blur p-2"
            aria-label={saved ? "remove from saved" : "save listing"}
          >
            <Heart className={saved ? "h-4 w-4 fill-brass-500 text-brass-500" : "h-4 w-4"} />
          </button>
        )}
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-lg leading-tight truncate">{listing.title}</h3>
          <div className="text-brass-400 font-mono text-sm shrink-0">{formatCents(listing.price_cents)}</div>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span>{listing.year ?? "—"}</span>
          <span>·</span>
          <span>{listing.make ?? listing.category}</span>
          {isBoat && listing.length_ft != null && (<><span>·</span><span>{listing.length_ft}ft</span></>)}
          {!isBoat && listing.mileage != null && (<><span>·</span><span>{formatNumber(listing.mileage)} mi</span></>)}
        </div>
        {(listing.city || listing.state) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {[listing.city, listing.state].filter(Boolean).join(", ")}
          </div>
        )}
      </div>
    </Link>
  );
}
