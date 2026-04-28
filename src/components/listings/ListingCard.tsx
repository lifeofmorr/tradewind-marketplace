import { Link } from "react-router-dom";
import { useState } from "react";
import { Heart, MapPin, GitCompare } from "lucide-react";
import type { Listing } from "@/types/database";
import { ListingPlaceholder } from "@/components/listings/ListingPlaceholder";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { DealScoreBadge } from "@/components/listings/DealScoreBadge";
import { getListingBadges } from "@/lib/badges";
import { useCompare } from "@/contexts/CompareContext";
import { formatCents, formatNumber, cn } from "@/lib/utils";

interface Props {
  listing: Listing;
  saved?: boolean;
  onToggleSave?: () => void;
}

const BOAT_CATS = new Set(["boat", "performance_boat", "yacht", "center_console"]);

export function ListingCard({ listing, saved, onToggleSave }: Props) {
  const isBoat = BOAT_CATS.has(listing.category);
  const badges = getListingBadges(listing);
  const compare = useCompare();
  const inCompare = compare.has(listing.id);
  const compareDisabled = !inCompare && compare.isFull;
  const [imgFailed, setImgFailed] = useState(false);

  // We deliberately exclude `demo` and `featured` from the chip list — those are shown as overlay chips
  const chipBadges = badges.filter((b) => b !== "demo" && b !== "featured" && b !== "premium");

  return (
    <div className="group glass-card lift-card brass-glow overflow-hidden transition-all">
      <Link to={`/listings/${listing.slug}`} className="block">
        <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
          {listing.cover_photo_url && !imgFailed ? (
            <img
              src={listing.cover_photo_url}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <ListingPlaceholder category={listing.category} />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent pointer-events-none" />

          {/* Top-left chips: demo / featured / premium */}
          <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
            {listing.is_demo && <TrustBadge type="demo" />}
            {listing.is_featured && <TrustBadge type="featured" />}
            {listing.is_premium && <TrustBadge type="premium" />}
          </div>

          {/* Top-right action chips */}
          <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5">
            {onToggleSave && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave(); }}
                className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-background/70 backdrop-blur hover:bg-background/90 transition-colors"
                aria-label={saved ? "remove from saved" : "save listing"}
                aria-pressed={!!saved}
              >
                <Heart className={saved ? "h-4 w-4 fill-brass-500 text-brass-500" : "h-4 w-4"} />
              </button>
            )}
          </div>

          {/* Bottom-left deal score */}
          {!listing.is_demo && (
            <div className="absolute bottom-2 left-2">
              <DealScoreBadge listing={listing} size="sm" />
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <Link to={`/listings/${listing.slug}`} className="min-w-0 flex-1">
            <h3 className="font-display text-lg leading-tight truncate hover:text-brass-300 transition-colors">
              {listing.title}
            </h3>
          </Link>
          <div className="text-brass-400 font-mono text-sm shrink-0">
            {formatCents(listing.price_cents)}
          </div>
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

        {chipBadges.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {chipBadges.slice(0, 3).map((b) => (
              <TrustBadge key={b} type={b} showLabel={false} />
            ))}
          </div>
        )}

        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); compare.toggle({ id: listing.id }); }}
            disabled={compareDisabled}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-mono uppercase tracking-[0.18em] border transition-colors",
              inCompare
                ? "border-brass-500/50 bg-brass-500/10 text-brass-300"
                : "border-border text-muted-foreground hover:border-brass-500/40 hover:text-foreground",
              compareDisabled && "opacity-40 cursor-not-allowed",
            )}
            aria-pressed={inCompare}
          >
            <GitCompare className="h-3 w-3" />
            {inCompare ? "In compare" : "Compare"}
          </button>
        </div>
      </div>
    </div>
  );
}
