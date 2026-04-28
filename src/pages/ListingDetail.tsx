import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Calendar, Gauge, MapPin, Anchor, Car as CarIcon, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useListing } from "@/hooks/useListings";
import { ListingGallery } from "@/components/listings/ListingGallery";
import { InquiryForm } from "@/components/listings/InquiryForm";
import { SaveListingButton } from "@/components/listings/SaveListingButton";
import { StartConversation } from "@/components/messaging/StartConversation";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrustBadgeList } from "@/components/ui/TrustBadge";
import { DealScoreCard } from "@/components/listings/DealScoreBadge";
import { OwnershipCostCard } from "@/components/listings/OwnershipCostCard";
import { BuyReadyChecklist } from "@/components/listings/BuyReadyChecklist";
import { getListingBadges } from "@/lib/badges";
import { formatCents, formatNumber } from "@/lib/utils";
import { listingMeta, setMeta } from "@/lib/seo";
import type { ListingPhoto } from "@/types/database";

const BOAT_CATS = new Set(["boat", "performance_boat", "yacht", "center_console"]);

export default function ListingDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: listing, isLoading } = useListing(slug);
  const { user } = useAuth();

  const { data: photos = [] } = useQuery({
    queryKey: ["listing-photos", listing?.id],
    enabled: !!listing,
    queryFn: async (): Promise<ListingPhoto[]> => {
      if (!listing) return [];
      const { data, error } = await supabase
        .from("listing_photos")
        .select("*")
        .eq("listing_id", listing.id)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ListingPhoto[];
    },
  });

  useEffect(() => {
    if (!listing) return;
    setMeta(listingMeta({
      title: listing.title,
      description: listing.description,
      ai_summary: listing.ai_summary,
      category: listing.category,
      make: listing.make,
      model: listing.model,
      year: listing.year,
      price_cents: listing.price_cents,
      city: listing.city,
      state: listing.state,
      cover_photo_url: listing.cover_photo_url,
    }));
  }, [listing]);

  if (isLoading) {
    return (
      <div className="container-pad py-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <div className="aspect-[16/10] skeleton rounded-xl" />
          <div className="h-8 w-2/3 skeleton" />
          <div className="h-4 w-1/3 skeleton" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 skeleton" />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-32 skeleton rounded-xl" />
          <div className="h-48 skeleton rounded-xl" />
        </div>
      </div>
    );
  }
  if (!listing) {
    return (
      <div className="container-pad py-16 text-center">
        <h1 className="font-display text-3xl">Listing not found</h1>
        <p className="text-muted-foreground mt-2">It may have been removed or sold.</p>
      </div>
    );
  }

  const isBoat = BOAT_CATS.has(listing.category);
  const badges = getListingBadges(listing);

  return (
    <div className="container-pad py-10 space-y-6">
      {listing.is_demo && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div className="text-sm leading-relaxed">
            <div className="font-display text-base text-amber-100">Demo listing</div>
            <p className="mt-1 text-amber-200/90">
              This is a demo listing for marketplace preview purposes. It does not represent
              real available inventory.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <ListingGallery
            photos={photos}
            coverFallback={listing.cover_photo_url}
            category={listing.category}
          />
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge>{listing.category.replace("_", " ")}</Badge>
              {listing.condition && <Badge>{listing.condition}</Badge>}
              {listing.year && <Badge>{listing.year}</Badge>}
            </div>
            <h1 className="font-display text-4xl leading-tight">{listing.title}</h1>
            <div className="text-2xl font-mono text-brass-400">{formatCents(listing.price_cents)}</div>
            {(listing.city || listing.state) && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {[listing.city, listing.state].filter(Boolean).join(", ")}
              </div>
            )}
            <TrustBadgeList types={badges} size="md" className="pt-1" />
          </header>

          <Separator />

          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <Spec icon={Calendar} label="Year"  value={listing.year ?? "—"} />
            <Spec icon={isBoat ? Anchor : CarIcon} label="Make" value={listing.make ?? "—"} />
            <Spec icon={isBoat ? Anchor : CarIcon} label="Model" value={listing.model ?? "—"} />
            {isBoat ? (
              <>
                <Spec icon={Gauge} label="Length" value={listing.length_ft != null ? `${listing.length_ft} ft` : "—"} />
                <Spec icon={Gauge} label="Hours"  value={listing.hours != null ? formatNumber(listing.hours) : "—"} />
                <Spec icon={Gauge} label="Engines" value={listing.engine_count != null ? `${listing.engine_count}× ${listing.engine_make ?? ""}`.trim() : "—"} />
                <Spec icon={Gauge} label="HP/engine" value={listing.engine_hp ?? "—"} />
                <Spec icon={Gauge} label="Hull" value={listing.hull_material ?? "—"} />
              </>
            ) : (
              <>
                <Spec icon={Gauge} label="Mileage" value={listing.mileage != null ? `${formatNumber(listing.mileage)} mi` : "—"} />
                <Spec icon={Gauge} label="Drivetrain" value={listing.drivetrain ?? "—"} />
                <Spec icon={Gauge} label="Fuel" value={listing.fuel_type ?? "—"} />
                <Spec icon={Gauge} label="Trans" value={listing.transmission ?? "—"} />
                <Spec icon={Gauge} label="Color" value={listing.exterior_color ?? "—"} />
              </>
            )}
          </section>

          {!listing.is_demo && <DealScoreCard listing={listing} />}

          {listing.ai_summary && (
            <>
              <Separator />
              <section>
                <div className="eyebrow">AI summary</div>
                <p className="mt-2 text-sm leading-relaxed">{listing.ai_summary}</p>
              </section>
            </>
          )}

          {listing.description && (
            <>
              <Separator />
              <section>
                <h2 className="font-display text-2xl">Description</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {listing.description}
                </p>
              </section>
            </>
          )}

          {/* Trust + safety notice */}
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-sm">
                <div className="font-display text-base">Buy with confidence</div>
                <p className="text-muted-foreground mt-1 leading-relaxed">
                  Always verify title, HIN/VIN, and matching numbers before purchase. Never wire
                  funds, send crypto, or pay outside the platform. Use a TradeWind concierge or
                  bonded F&I office for high-value deals.
                </p>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <SaveListingButton listingId={listing.id} className="w-full" />
          {user && user.id !== listing.seller_id && (
            <StartConversation
              otherId={listing.seller_id}
              listingId={listing.id}
              label="Message seller"
              variant="outline"
              className="w-full"
            />
          )}
          <InquiryForm listing={listing} />
          {!listing.is_demo && <OwnershipCostCard listing={listing} />}
          {user && !listing.is_demo && <BuyReadyChecklist listing={listing} />}
        </aside>
      </div>
    </div>
  );
}

function Spec({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="font-display text-lg mt-1">{value}</div>
    </div>
  );
}
