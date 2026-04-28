import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { ListingFilters, type ListingFilterValues } from "@/components/listings/ListingFilters";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { useListings } from "@/hooks/useListings";
import { CATEGORIES } from "@/lib/categories";
import { categoryMeta, setMeta } from "@/lib/seo";
import type { ListingCategory } from "@/types/database";

export default function CategoryPage() {
  const { category } = useParams<{ category?: string }>();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("q") ?? undefined;

  const def = useMemo(() => CATEGORIES.find((c) => c.key === category), [category]);

  const [filters, setFilters] = useState<ListingFilterValues>({
    category: def?.key as ListingCategory | undefined,
    search: initialSearch,
  });

  useEffect(() => {
    if (!def) return;
    setMeta(categoryMeta(def.group, def.label, def.blurb));
  }, [def]);

  const { data: listings = [], isLoading } = useListings({
    ...filters,
    status: "active",
    limit: 60,
    order: "newest",
  });

  if (category && !def) return <Navigate to="/categories" replace />;

  return (
    <div className="container-pad py-12 space-y-8">
      <header>
        <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">
          {def ? def.group : "marketplace"}
        </div>
        <h1 className="font-display text-4xl mt-1">{def ? def.label : "All categories"}</h1>
        {def && <p className="text-muted-foreground mt-2">{def.blurb}</p>}
      </header>
      <ListingFilters value={filters} onChange={setFilters} />
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] skeleton rounded-xl" />
          ))}
        </div>
      ) : (
        <ListingGrid
          listings={listings}
          emptyText="No listings match those filters"
          emptyBody="Try a wider price range, a different state, or browse all categories."
          emptyCtaTo="/browse"
          emptyCtaLabel="Browse all"
        />
      )}
    </div>
  );
}

export function CategoriesIndex() {
  useEffect(() => {
    setMeta({ title: "Browse by category", description: "Boats, cars, trucks, exotics, and more." });
  }, []);
  return (
    <div className="container-pad py-12">
      <h1 className="font-display text-4xl">Browse by category</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => (
          <a key={c.key} href={`/categories/${c.key}`} className="block rounded-lg border border-border bg-card p-6 hover:border-brass-500/50">
            <div className="font-mono text-xs uppercase tracking-wider text-brass-400">{c.group}</div>
            <div className="font-display text-2xl mt-1">{c.label}</div>
            <div className="text-sm text-muted-foreground mt-1">{c.blurb}</div>
          </a>
        ))}
      </div>
    </div>
  );
}

export function BrowsePage() {
  const [searchParams] = useSearchParams();
  const featuredOnly = searchParams.get("featured") === "1";
  const initial: ListingFilterValues = {
    search: searchParams.get("q") ?? undefined,
    state: searchParams.get("state") ?? undefined,
  };
  const [filters, setFilters] = useState<ListingFilterValues>(initial);
  useEffect(() => {
    setMeta({
      title: featuredOnly ? "Featured listings" : "Browse listings",
      description: featuredOnly
        ? "Hand-picked featured listings on TradeWind."
        : "All active boats and autos on TradeWind.",
    });
  }, [featuredOnly]);
  const { data: listings = [], isLoading } = useListings({
    ...filters,
    is_featured: featuredOnly ? true : undefined,
    status: "active",
    limit: 80,
    order: "newest",
  });
  return (
    <div className="container-pad py-12 space-y-8">
      <header>
        <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">{featuredOnly ? "Featured" : "Browse"}</div>
        <h1 className="font-display text-4xl mt-1">{featuredOnly ? "Featured listings" : "All listings"}</h1>
        {featuredOnly && (
          <p className="text-muted-foreground mt-2 text-sm">
            Promoted by sellers and dealers — surfaced first across the marketplace.
          </p>
        )}
      </header>
      <ListingFilters value={filters} onChange={setFilters} />
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] skeleton rounded-xl" />
          ))}
        </div>
      ) : (
        <ListingGrid
          listings={listings}
          emptyText={featuredOnly ? "No featured listings right now" : "No listings match those filters"}
          emptyBody={featuredOnly ? "Check back soon — sellers feature new inventory daily." : "Try widening your search or removing a filter."}
          emptyCtaTo="/browse"
          emptyCtaLabel="Browse all"
        />
      )}
    </div>
  );
}
