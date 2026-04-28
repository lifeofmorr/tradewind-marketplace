import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { X, GitCompare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Listing } from "@/types/database";
import { useCompare, COMPARE_MAX } from "@/contexts/CompareContext";
import { Button } from "@/components/ui/button";
import { ListingPlaceholder } from "@/components/listings/ListingPlaceholder";
import { formatCents } from "@/lib/utils";

export function CompareDrawer() {
  const { ids, remove, clear } = useCompare();

  const { data: listings = [] } = useQuery<Listing[]>({
    queryKey: ["compare-drawer", ids],
    enabled: ids.length > 0,
    staleTime: 60_000,
    queryFn: async () => {
      if (ids.length === 0) return [];
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .in("id", ids);
      if (error) throw error;
      // preserve add order
      return ids
        .map((id) => (data ?? []).find((l: Listing) => l.id === id))
        .filter(Boolean) as Listing[];
    },
  });

  if (ids.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none">
      {/* Spacer so fixed bar doesn't cover viewport-bottom CTAs */}
      <div aria-hidden className="h-2" />
      <div className="container-pad pb-4 pointer-events-auto">
        <div className="glass-card-elevated p-3 md:p-4 flex items-center gap-3 md:gap-4 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <GitCompare className="h-4 w-4 text-brass-400" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Compare {ids.length}/{COMPARE_MAX}
            </span>
          </div>

          <div className="flex flex-1 gap-2 overflow-x-auto -mx-1 px-1">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="relative flex items-center gap-2 rounded-lg border border-border bg-card/60 px-2 py-1.5 min-w-[170px]"
              >
                <div className="h-9 w-12 overflow-hidden rounded shrink-0 bg-secondary">
                  {listing.cover_photo_url ? (
                    <img
                      src={listing.cover_photo_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ListingPlaceholder category={listing.category} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs truncate">{listing.title}</div>
                  <div className="text-[11px] text-brass-400 font-mono">
                    {formatCents(listing.price_cents)}
                  </div>
                </div>
                <button
                  onClick={() => remove(listing.id)}
                  className="ml-1 rounded p-1 hover:bg-secondary"
                  aria-label="Remove from compare"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <button
              onClick={clear}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
            <Button asChild size="sm" disabled={ids.length < 2}>
              <Link to="/buyer/compare">Compare</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
