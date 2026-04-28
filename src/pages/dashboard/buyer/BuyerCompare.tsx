import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { X, Anchor, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Listing } from "@/types/database";
import { useCompare } from "@/contexts/CompareContext";
import { Button } from "@/components/ui/button";
import { ListingPlaceholder } from "@/components/listings/ListingPlaceholder";
import { DealScoreBadge } from "@/components/listings/DealScoreBadge";
import { TrustBadgeList } from "@/components/ui/TrustBadge";
import { getListingBadges } from "@/lib/badges";
import { calculateOwnershipCost } from "@/lib/ownershipCost";
import { setMeta } from "@/lib/seo";
import { formatCents, formatNumber } from "@/lib/utils";

const BOAT_CATS = new Set(["boat", "performance_boat", "yacht", "center_console"]);

interface Row {
  label: string;
  values: (string | number | null | undefined)[];
}

export default function BuyerCompare() {
  const { ids, remove, clear } = useCompare();
  useEffect(() => {
    setMeta({ title: "Compare listings", description: "Compare up to three listings side-by-side." });
  }, []);
  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["buyer-compare", ids],
    enabled: ids.length > 0,
    queryFn: async () => {
      if (ids.length === 0) return [];
      const { data, error } = await supabase.from("listings").select("*").in("id", ids);
      if (error) throw error;
      return ids
        .map((id) => (data ?? []).find((l: Listing) => l.id === id))
        .filter(Boolean) as Listing[];
    },
  });

  if (ids.length === 0) {
    return (
      <div className="container-pad py-16 text-center">
        <Anchor className="h-10 w-10 text-brass-400 mx-auto" />
        <div className="font-display text-2xl mt-4">Nothing to compare yet</div>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Browse listings and click <strong>Compare</strong> on up to three to see them side-by-side.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link to="/browse">Browse listings <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    );
  }

  const rows: Row[] = [
    { label: "Year", values: listings.map((l) => l.year) },
    { label: "Make", values: listings.map((l) => l.make) },
    { label: "Model", values: listings.map((l) => l.model) },
    {
      label: "Hours / Mileage",
      values: listings.map((l) =>
        BOAT_CATS.has(l.category)
          ? l.hours != null
            ? `${formatNumber(l.hours)} hrs`
            : null
          : l.mileage != null
          ? `${formatNumber(l.mileage)} mi`
          : null,
      ),
    },
    {
      label: "Length",
      values: listings.map((l) => (l.length_ft != null ? `${l.length_ft} ft` : null)),
    },
    { label: "Engine HP", values: listings.map((l) => l.engine_hp) },
    {
      label: "Location",
      values: listings.map((l) => [l.city, l.state].filter(Boolean).join(", ") || null),
    },
    { label: "Condition", values: listings.map((l) => l.condition) },
    { label: "Title status", values: listings.map((l) => l.title_status) },
    {
      label: "Financing partner",
      values: listings.map((l) => (l.is_finance_partner ? "Yes" : "—")),
    },
    {
      label: "Insurance partner",
      values: listings.map((l) => (l.is_insurance_partner ? "Yes" : "—")),
    },
    {
      label: "Transport partner",
      values: listings.map((l) => (l.is_transport_partner ? "Yes" : "—")),
    },
    {
      label: "Est. monthly cost",
      values: listings.map((l) => {
        if (!l.price_cents) return null;
        const cost = calculateOwnershipCost(l);
        return `${formatCents(Math.round(cost.totalMonthly * 100))}/mo`;
      }),
    },
  ];

  return (
    <div className="container-pad py-10 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow">Side-by-side</div>
          <h1 className="section-title">Compare listings</h1>
        </div>
        <Button variant="outline" size="sm" onClick={clear}>Clear all</Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: ids.length }).map((_, i) => (
            <div key={i} className="aspect-[4/5] skeleton" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <div
            className="grid gap-4 min-w-[720px]"
            style={{ gridTemplateColumns: `160px repeat(${listings.length}, minmax(220px, 1fr))` }}
          >
            {/* Header row */}
            <div />
            {listings.map((listing) => (
              <div key={listing.id} className="glass-card overflow-hidden">
                <div className="aspect-[4/3] bg-secondary relative">
                  {listing.cover_photo_url ? (
                    <img
                      src={listing.cover_photo_url}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ListingPlaceholder category={listing.category} />
                  )}
                  <button
                    onClick={() => remove(listing.id)}
                    className="absolute top-2 right-2 rounded-full bg-background/70 backdrop-blur p-1.5"
                    aria-label="Remove"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="p-3 space-y-2">
                  <Link
                    to={`/listings/${listing.slug}`}
                    className="font-display text-base block truncate hover:text-brass-400"
                  >
                    {listing.title}
                  </Link>
                  <div className="flex items-center justify-between gap-2">
                    <DealScoreBadge listing={listing} size="sm" showLabel />
                    <span className="font-mono text-sm text-brass-400">
                      {formatCents(listing.price_cents)}
                    </span>
                  </div>
                  <TrustBadgeList types={getListingBadges(listing)} max={3} />
                </div>
              </div>
            ))}

            {/* Spec rows */}
            {rows.map((row) => (
              <FragmentRow key={row.label} label={row.label} cols={listings.length}>
                {row.values.map((v, i) => (
                  <div
                    key={i}
                    className="glass-card px-3 py-2 text-sm font-mono min-h-[40px]"
                  >
                    {v ?? <span className="text-muted-foreground">—</span>}
                  </div>
                ))}
              </FragmentRow>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FragmentRow({
  label,
  cols,
  children,
}: {
  label: string;
  cols: number;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="self-center text-xs uppercase tracking-wider text-muted-foreground py-2">
        {label}
      </div>
      {children}
      {/* fill if needed */}
      {Array.from({ length: Math.max(0, cols - (Array.isArray(children) ? children.length : 0)) }).map(
        (_, i) => (
          <div key={`pad-${i}`} />
        ),
      )}
    </>
  );
}
