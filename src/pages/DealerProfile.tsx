import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Globe, Phone, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { useListings } from "@/hooks/useListings";
import { Badge } from "@/components/ui/badge";
import { ReviewList } from "@/components/reviews/ReviewList";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { Stars } from "@/components/reviews/Stars";
import { dealerMeta, setMeta } from "@/lib/seo";
import type { Dealer } from "@/types/database";

export default function DealerProfile() {
  const { slug } = useParams<{ slug: string }>();

  const { data: dealer, isLoading } = useQuery({
    queryKey: ["dealer", slug],
    enabled: !!slug,
    queryFn: async (): Promise<Dealer | null> => {
      const { data, error } = await supabase
        .from("dealers")
        .select("*")
        .eq("slug", slug ?? "")
        .maybeSingle();
      if (error) throw error;
      return (data as Dealer | null) ?? null;
    },
  });

  const { data: listings = [] } = useListings({
    dealer_id: dealer?.id,
    status: "active",
    limit: 60,
    order: "newest",
  });

  useEffect(() => {
    if (!dealer) return;
    setMeta(dealerMeta(dealer));
  }, [dealer]);

  if (isLoading) return <div className="container-pad py-16 text-sm text-muted-foreground">Loading…</div>;
  if (!dealer) return <div className="container-pad py-16"><h1 className="font-display text-3xl">Dealer not found</h1></div>;

  return (
    <div>
      <div className="border-b border-border bg-navy-950/40">
        <div className="container-pad py-12 flex flex-col md:flex-row md:items-center gap-6">
          {dealer.logo_url ? (
            <img src={dealer.logo_url} alt={dealer.name} className="h-20 w-20 rounded-lg object-cover border border-border" />
          ) : (
            <div className="h-20 w-20 rounded-lg bg-secondary grid place-items-center font-display text-2xl">
              {dealer.name.slice(0, 1)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono uppercase tracking-[0.32em] text-brass-400">Dealer</span>
              {dealer.is_verified && <Badge variant="good">Verified</Badge>}
              {dealer.is_featured && <Badge variant="accent">Featured</Badge>}
            </div>
            <h1 className="font-display text-4xl mt-1">{dealer.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              {dealer.rating_count > 0 && (
                <div className="flex items-center gap-2">
                  <Stars rating={dealer.rating_avg} size="sm" />
                  <span className="text-xs text-muted-foreground">{dealer.rating_avg.toFixed(1)} · {dealer.rating_count}</span>
                </div>
              )}
            </div>
            {(dealer.city || dealer.state) && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" /> {[dealer.city, dealer.state].filter(Boolean).join(", ")}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            {dealer.website && <a href={dealer.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground"><Globe className="h-4 w-4" /> Website</a>}
            {dealer.phone && <a href={`tel:${dealer.phone}`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground"><Phone className="h-4 w-4" /> {dealer.phone}</a>}
            {dealer.email && <a href={`mailto:${dealer.email}`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground"><Mail className="h-4 w-4" /> Email</a>}
          </div>
        </div>
      </div>
      <div className="container-pad py-12 space-y-8">
        {dealer.description && (
          <p className="text-muted-foreground max-w-3xl whitespace-pre-wrap">{dealer.description}</p>
        )}
        <h2 className="font-display text-2xl">Inventory</h2>
        <ListingGrid listings={listings} emptyText="No active listings yet." />

        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] pt-8 border-t border-border">
          <ReviewList
            dealerId={dealer.id}
            ratingAvg={dealer.rating_avg}
            ratingCount={dealer.rating_count}
          />
          <div className="lg:sticky lg:top-20 lg:self-start">
            <ReviewForm dealerId={dealer.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DealersIndex() {
  useEffect(() => {
    setMeta({ title: "Dealers", description: "Verified boat and auto dealers on TradeWind." });
  }, []);
  const { data: dealers = [], isLoading } = useQuery({
    queryKey: ["dealers"],
    queryFn: async (): Promise<Dealer[]> => {
      const { data, error } = await supabase.from("dealers").select("*").order("is_featured", { ascending: false }).order("name");
      if (error) throw error;
      return (data ?? []) as Dealer[];
    },
  });
  return (
    <div className="container-pad py-12 space-y-8">
      <header>
        <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">Dealers</div>
        <h1 className="font-display text-4xl mt-1">Verified dealers</h1>
      </header>
      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dealers.map((d) => (
            <Link key={d.id} to={`/dealers/${d.slug}`} className="rounded-lg border border-border bg-card p-6 hover:border-brass-500/50">
              <div className="flex items-center gap-3">
                {d.logo_url ? (
                  <img src={d.logo_url} alt={d.name} className="h-10 w-10 rounded object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded bg-secondary grid place-items-center font-display">{d.name.slice(0, 1)}</div>
                )}
                <div>
                  <div className="font-display text-lg">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{[d.city, d.state].filter(Boolean).join(", ") || "—"}</div>
                </div>
              </div>
              {d.description && <p className="text-xs text-muted-foreground mt-3 line-clamp-3">{d.description}</p>}
            </Link>
          ))}
          {!dealers.length && <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">No dealers yet.</div>}
        </div>
      )}
    </div>
  );
}
