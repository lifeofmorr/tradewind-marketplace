import { useEffect } from "react";
import { useSavedListings } from "@/hooks/useSavedListings";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { setMeta } from "@/lib/seo";
import type { Listing } from "@/types/database";

export default function BuyerSaved() {
  const { data: saved = [], isLoading } = useSavedListings();
  useEffect(() => { setMeta({ title: "Saved listings", description: "Your saved listings on TradeWind." }); }, []);
  const listings: Listing[] = saved.map((s) => s.listing).filter((l): l is Listing => !!l);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Saved</h1>
      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <ListingGrid listings={listings} emptyText="You haven't saved anything yet." />
      )}
    </div>
  );
}
