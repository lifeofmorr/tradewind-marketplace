import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedListingIds, useToggleSave } from "@/hooks/useSavedListings";
import { useNavigate } from "react-router-dom";

interface Props { listingId: string; className?: string }

export function SaveListingButton({ listingId, className }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: ids = [] } = useSavedListingIds();
  const toggle = useToggleSave();
  const saved = ids.includes(listingId);
  const pending = toggle.isPending;

  return (
    <Button
      type="button"
      variant={saved ? "secondary" : "outline"}
      onClick={() => {
        if (!user) { navigate("/login"); return; }
        toggle.mutate({ listing_id: listingId, saved });
      }}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save listing"}
      className={className}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={saved ? "h-4 w-4 fill-brass-500 text-brass-500" : "h-4 w-4"} />
      )}
      {pending ? "Saving…" : saved ? "Saved" : "Save"}
    </Button>
  );
}
