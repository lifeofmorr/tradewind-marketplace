import { Search } from "lucide-react";
import type { Listing } from "@/types/database";
import { ListingCard } from "./ListingCard";
import { useSavedListingIds, useToggleSave } from "@/hooks/useSavedListings";
import { useAuth } from "@/contexts/AuthContext";
import { EmptyState } from "@/components/ui/EmptyState";

interface Props {
  listings: Listing[];
  emptyText?: string;
  emptyBody?: string;
  emptyCtaTo?: string;
  emptyCtaLabel?: string;
  showSave?: boolean;
}

export function ListingGrid({
  listings,
  emptyText = "No listings yet",
  emptyBody = "Try adjusting your filters or browse a different category.",
  emptyCtaTo = "/browse",
  emptyCtaLabel = "Browse all",
  showSave = true,
}: Props) {
  const { user } = useAuth();
  const { data: savedIds = [] } = useSavedListingIds();
  const toggle = useToggleSave();

  if (!listings.length) {
    return (
      <EmptyState
        icon={Search}
        title={emptyText}
        body={emptyBody}
        cta={{ label: emptyCtaLabel, to: emptyCtaTo }}
      />
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
