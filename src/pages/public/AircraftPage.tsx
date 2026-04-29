import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plane, ShieldAlert } from "lucide-react";
import { ListingFilters, type ListingFilterValues } from "@/components/listings/ListingFilters";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { useListings } from "@/hooks/useListings";
import { AIRCRAFT_CATEGORIES, CATEGORIES } from "@/lib/categories";
import { setMeta } from "@/lib/seo";
import type { ListingCategory } from "@/types/database";

interface AircraftPageProps {
  /** Optional category to pre-filter (used by /jets, /helicopters aliases). */
  defaultCategory?: ListingCategory;
  /** Heading override (used by aliases). */
  title?: string;
  eyebrow?: string;
  blurb?: string;
}

export default function AircraftPage({
  defaultCategory,
  title = "Aircraft for sale",
  eyebrow = "aviation",
  blurb = "Pistons to jets — turbine-strong inventory from vetted brokers, dealers, and owner-operators.",
}: AircraftPageProps) {
  const [searchParams] = useSearchParams();
  const initial: ListingFilterValues = {
    search: searchParams.get("q") ?? undefined,
    state: searchParams.get("state") ?? undefined,
    category: defaultCategory,
  };
  const [filters, setFilters] = useState<ListingFilterValues>(initial);

  const aircraftCats = useMemo(
    () => AIRCRAFT_CATEGORIES,
    [],
  );

  useEffect(() => {
    setMeta({
      title,
      description: blurb,
    });
  }, [title, blurb]);

  const { data: listings = [], isLoading } = useListings({
    ...filters,
    categories: filters.category ? undefined : aircraftCats,
    status: "active",
    limit: 80,
    order: "newest",
  });

  const aviationCategoryDefs = useMemo(
    () => CATEGORIES.filter((c) => c.group === "aircraft"),
    [],
  );

  return (
    <div className="container-pad py-12 space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.32em] text-brass-400">
          <Plane className="h-3.5 w-3.5" /> {eyebrow}
        </div>
        <h1 className="font-display text-4xl mt-1">{title}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">{blurb}</p>
      </header>

      <div
        role="note"
        className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm"
      >
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <div className="leading-relaxed text-amber-100/90">
          <span className="font-display text-base text-amber-100">Aviation safety notice.</span>{" "}
          Aircraft details, registration, title, logbooks, maintenance status, and airworthiness
          must be independently verified by qualified aviation professionals before purchase.
          TradeWind does not verify FAA status, airworthiness, or maintenance compliance.
        </div>
      </div>

      <nav aria-label="Aircraft categories" className="flex flex-wrap gap-2">
        <CategoryChip
          active={!filters.category}
          onClick={() => setFilters({ ...filters, category: undefined })}
        >
          All aircraft
        </CategoryChip>
        {aviationCategoryDefs.map((c) => (
          <CategoryChip
            key={c.key}
            active={filters.category === c.key}
            onClick={() => setFilters({ ...filters, category: c.key })}
          >
            {c.label}
          </CategoryChip>
        ))}
      </nav>

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
          emptyText="No aircraft match those filters"
          emptyBody="Try widening price, year, or removing a category — new aircraft are listed weekly."
          emptyCtaTo="/aircraft"
          emptyCtaLabel="See all aircraft"
        />
      )}
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors",
        active
          ? "border-brass-400/60 bg-brass-500/10 text-brass-200"
          : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-brass-500/30",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
