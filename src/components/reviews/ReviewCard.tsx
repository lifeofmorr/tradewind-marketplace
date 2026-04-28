import { Stars } from "./Stars";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";
import type { Review } from "@/types/database";

interface Props {
  review: Review;
  reviewerName?: string;
}

export function ReviewCard({ review, reviewerName }: Props) {
  return (
    <article className="rounded-lg border border-border bg-card p-5 space-y-2">
      <div className="flex items-center justify-between">
        <Stars rating={review.rating} />
        <span className="text-xs text-muted-foreground">{timeAgo(review.created_at)} ago</span>
      </div>
      {review.title && <h3 className="font-display text-lg leading-snug">{review.title}</h3>}
      {review.body && <p className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">{review.body}</p>}
      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
        <span>{reviewerName ?? "Member"}</span>
        {review.is_verified_purchase && <Badge variant="good">verified buyer</Badge>}
      </div>
    </article>
  );
}
