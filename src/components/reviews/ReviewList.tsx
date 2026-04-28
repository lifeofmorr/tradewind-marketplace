import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ReviewCard } from "./ReviewCard";
import { Stars } from "./Stars";
import type { Review, Profile } from "@/types/database";

interface Props {
  dealerId?: string | null;
  serviceProviderId?: string | null;
  ratingAvg: number;
  ratingCount: number;
}

interface ReviewWithReviewer extends Review {
  reviewer: Pick<Profile, "id" | "full_name"> | null;
}

export function ReviewList({ dealerId, serviceProviderId, ratingAvg, ratingCount }: Props) {
  const key = dealerId ? ["reviews", "dealer", dealerId] : ["reviews", "sp", serviceProviderId];
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: key,
    enabled: !!(dealerId || serviceProviderId),
    queryFn: async (): Promise<ReviewWithReviewer[]> => {
      let q = supabase.from("reviews")
        .select("*, reviewer:profiles!reviews_reviewer_id_fkey(id, full_name)")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(50);
      if (dealerId) q = q.eq("dealer_id", dealerId);
      else if (serviceProviderId) q = q.eq("service_provider_id", serviceProviderId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as ReviewWithReviewer[];
    },
  });

  return (
    <section className="space-y-4">
      <header className="flex items-end justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">Reviews</div>
          <div className="flex items-center gap-3 mt-1">
            <div className="font-display text-3xl">{ratingAvg ? ratingAvg.toFixed(1) : "—"}</div>
            <Stars rating={ratingAvg} size="md" />
            <span className="text-sm text-muted-foreground">{ratingCount} review{ratingCount === 1 ? "" : "s"}</span>
          </div>
        </div>
      </header>
      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              reviewerName={r.reviewer?.full_name ?? "Member"}
            />
          ))}
          {!reviews.length && (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No reviews yet. Be the first.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
