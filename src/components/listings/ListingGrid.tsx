import type { Listing } from "@/types/database";
import { ListingCard } from "./ListingCard";
import { useSavedListingIds, useToggleSave } from "@/hooks/useSavedListings";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  listings: Listing[];
  emptyText?: string;
  showSave?: boolean;
}

export function ListingGrid({ listings, emptyText = "No listings yet.", showSave = true }: Props) {
  const { user } = useAuth();
  const { data: savedIds = [] } = useSavedListingIds();
  const toggle = useToggleSave();

  if (!listings.length) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((l) => {
        const saved = savedIds.includes(l.id);
        return (
          <ListingCard
            key={l.id}
            listing={l}
            saved={saved}
            onToggleSave={
              showSave && user
                ? () => toggle.mutate({ listing_id: l.id, saved })
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
