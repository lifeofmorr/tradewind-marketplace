import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, MessageSquareQuote } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Stars } from "@/components/reviews/Stars";
import { setMeta } from "@/lib/seo";
import { timeAgo } from "@/lib/utils";
import type { Review, Dealer, ServiceProvider } from "@/types/database";

interface ReviewWithTarget extends Review {
  dealer: Pick<Dealer, "id" | "name" | "slug"> | null;
  service_provider: Pick<ServiceProvider, "id" | "name" | "slug"> | null;
}

export default function BuyerReviews() {
  const { user } = useAuth();
  const qc = useQueryClient();
  useEffect(() => { setMeta({ title: "My reviews", description: "Reviews you've written on TradeWind." }); }, []);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["my-reviews", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ReviewWithTarget[]> => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, dealer:dealers(id, name, slug), service_provider:service_providers(id, name, slug)")
        .eq("reviewer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ReviewWithTarget[];
    },
  });

  async function remove(id: string) {
    if (!window.confirm("Delete this review?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    void qc.invalidateQueries({ queryKey: ["my-reviews"] });
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">My reviews</h1>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 skeleton rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => {
            const target = r.dealer
              ? { name: r.dealer.name, href: `/dealers/${r.dealer.slug}` }
              : r.service_provider
                ? { name: r.service_provider.name, href: `/services/${r.service_provider.slug}` }
                : null;
            return (
              <article key={r.id} className="rounded-lg border border-border bg-card p-5 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Stars rating={r.rating} />
                    {target && (
                      <Link to={target.href} className="block mt-1 text-sm text-brass-400 hover:underline">{target.name}</Link>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{timeAgo(r.created_at)} ago</span>
                    <Button size="sm" variant="ghost" onClick={() => { void remove(r.id); }}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
                {r.title && <h3 className="font-display text-base leading-snug">{r.title}</h3>}
                {r.body && <p className="text-sm whitespace-pre-wrap text-muted-foreground">{r.body}</p>}
              </article>
            );
          })}
          {!reviews.length && (
            <EmptyState
              icon={MessageSquareQuote}
              title="No reviews yet"
              body="Help future buyers by reviewing dealers and service partners you've worked with."
              cta={{ label: "Browse dealers", to: "/dealers" }}
              secondary={{ label: "Service partners", to: "/services", variant: "outline" }}
            />
          )}
        </div>
      )}
    </div>
  );
}
