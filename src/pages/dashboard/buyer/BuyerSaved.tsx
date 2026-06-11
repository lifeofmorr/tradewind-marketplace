import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useSavedListings } from "@/hooks/useSavedListings";
import { usePageParam } from "@/hooks/usePageParam";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { Pagination } from "@/components/ui/pagination";
import { setMeta } from "@/lib/seo";
import { DEMO_DISCLAIMER_TITLE, DEMO_DISCLAIMER_BODY } from "@/lib/demoDisclaimer";
import type { Listing } from "@/types/database";

export default function BuyerSaved() {
  const [page, setPage] = usePageParam();
  const { data, isLoading, isFetching } = useSavedListings(page);
  const saved = data?.saved ?? [];
  useEffect(() => {
    if (data && page > data.pageCount) setPage(data.pageCount);
  }, [data, page, setPage]);
  useEffect(() => { setMeta({ title: "Saved listings", description: "Your saved listings on Tradewind." }); }, []);
  const listings: Listing[] = saved.map((s) => s.listing).filter((l): l is Listing => !!l);
  const hasDemo = listings.some((l) => l.is_demo);
  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow">Buyer · saved</div>
        <h1 className="section-title">Saved listings</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Listings you bookmarked for later. Saves sync across devices when you sign in.
        </p>
      </div>
      {!isLoading && hasDemo && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div className="text-sm leading-relaxed">
            <div className="font-display text-base text-amber-100">{DEMO_DISCLAIMER_TITLE}</div>
            <p className="mt-1 text-amber-200/90">{DEMO_DISCLAIMER_BODY}</p>
          </div>
        </div>
      )}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] skeleton rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <ListingGrid
            listings={listings}
            emptyText="You haven't saved anything yet"
            emptyBody="Tap the heart on any listing to save it for later. Saved listings sync across devices."
            emptyCtaTo="/browse"
            emptyCtaLabel="Browse listings"
          />
          <Pagination
            page={page}
            pageCount={data?.pageCount ?? 1}
            total={data?.total}
            onPageChange={setPage}
            isLoading={isFetching}
          />
        </>
      )}
    </div>
  );
}
