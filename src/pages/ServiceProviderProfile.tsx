import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Globe, Phone, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { ReviewList } from "@/components/reviews/ReviewList";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { Stars } from "@/components/reviews/Stars";
import { setMeta, serviceProviderMeta } from "@/lib/seo";
import type { ServiceProvider } from "@/types/database";

export default function ServiceProviderProfile() {
  const { slug } = useParams<{ slug: string }>();

  const { data: provider, isLoading } = useQuery({
    queryKey: ["service-provider", slug],
    enabled: !!slug,
    queryFn: async (): Promise<ServiceProvider | null> => {
      const { data, error } = await supabase
        .from("service_providers")
        .select("*")
        .eq("slug", slug ?? "")
        .maybeSingle();
      if (error) throw error;
      return (data as ServiceProvider | null) ?? null;
    },
  });

  useEffect(() => {
    if (!provider) return;
    setMeta(serviceProviderMeta(provider));
  }, [provider]);

  if (isLoading) return <div className="container-pad py-16 text-sm text-muted-foreground">Loading…</div>;
  if (!provider) return <div className="container-pad py-16"><h1 className="font-display text-3xl">Provider not found</h1></div>;

  return (
    <div>
      <div className="border-b border-border bg-navy-950/40">
        <div className="container-pad py-12 flex flex-col md:flex-row md:items-center gap-6">
          {provider.logo_url ? (
            <img src={provider.logo_url} alt={provider.name} className="h-20 w-20 rounded-lg object-cover border border-border" />
          ) : (
            <div className="h-20 w-20 rounded-lg bg-secondary grid place-items-center font-display text-2xl">
              {provider.name.slice(0, 1)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono uppercase tracking-[0.32em] text-brass-400">{provider.category.replace("_", " ")}</span>
              {provider.is_verified && <Badge variant="good">Verified</Badge>}
              {provider.is_featured && <Badge variant="accent">Featured</Badge>}
            </div>
            <h1 className="font-display text-4xl mt-1">{provider.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              {provider.rating_count > 0 && (
                <div className="flex items-center gap-2">
                  <Stars rating={provider.rating_avg} size="sm" />
                  <span className="text-xs text-muted-foreground">{provider.rating_avg.toFixed(1)} · {provider.rating_count}</span>
                </div>
              )}
            </div>
            {(provider.city || provider.state) && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" /> {[provider.city, provider.state].filter(Boolean).join(", ")}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            {provider.website && <a href={provider.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground"><Globe className="h-4 w-4" /> Website</a>}
            {provider.phone && <a href={`tel:${provider.phone}`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground"><Phone className="h-4 w-4" /> {provider.phone}</a>}
            {provider.email && <a href={`mailto:${provider.email}`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground"><Mail className="h-4 w-4" /> Email</a>}
          </div>
        </div>
      </div>
      <div className="container-pad py-12 space-y-8">
        {provider.description && (
          <p className="text-muted-foreground max-w-3xl whitespace-pre-wrap">{provider.description}</p>
        )}
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] pt-8 border-t border-border">
          <ReviewList
            serviceProviderId={provider.id}
            ratingAvg={provider.rating_avg}
            ratingCount={provider.rating_count}
          />
          <div className="lg:sticky lg:top-20 lg:self-start">
            <ReviewForm serviceProviderId={provider.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServicesIndex() {
  useEffect(() => {
    setMeta({ title: "Service providers", description: "Vetted marine and auto service partners on TradeWind." });
  }, []);
  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["service-providers"],
    queryFn: async (): Promise<ServiceProvider[]> => {
      const { data, error } = await supabase
        .from("service_providers")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("name");
      if (error) throw error;
      return (data ?? []) as ServiceProvider[];
    },
  });
  return (
    <div className="container-pad py-12 space-y-8">
      <header>
        <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">Services</div>
        <h1 className="font-display text-4xl mt-1">Vetted service partners</h1>
      </header>
      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => (
            <Link key={p.id} to={`/services/${p.slug}`} className="rounded-lg border border-border bg-card p-6 hover:border-brass-500/50">
              <div className="font-mono text-xs uppercase tracking-wider text-brass-400">{p.category.replace("_", " ")}</div>
              <div className="font-display text-lg mt-1">{p.name}</div>
              <div className="text-xs text-muted-foreground">{[p.city, p.state].filter(Boolean).join(", ") || "—"}</div>
              {p.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{p.description}</p>}
            </Link>
          ))}
          {!providers.length && <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">No providers yet.</div>}
        </div>
      )}
    </div>
  );
}
