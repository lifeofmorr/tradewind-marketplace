import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Gauge, MapPin, Anchor, Car as CarIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useListing } from "@/hooks/useListings";
import { ListingGallery } from "@/components/listings/ListingGallery";
import { InquiryForm } from "@/components/listings/InquiryForm";
import { SaveListingButton } from "@/components/listings/SaveListingButton";
import { StartConversation } from "@/components/messaging/StartConversation";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
    return <div className="container-pad py-16 text-sm text-muted-foreground">Loading…</div>;
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

  return (
    <div className="container-pad py-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        <ListingGallery photos={photos} coverFallback={listing.cover_photo_url} />
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {listing.is_featured && <Badge variant="accent">Featured</Badge>}
            {listing.is_verified && <Badge variant="good">Verified</Badge>}
            <Badge>{listing.category.replace("_", " ")}</Badge>
            {listing.condition && <Badge>{listing.condition}</Badge>}
          </div>
          <h1 className="font-display text-4xl leading-tight">{listing.title}</h1>
          <div className="text-2xl font-mono text-brass-400">{formatCents(listing.price_cents)}</div>
          {(listing.city || listing.state) && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> {[listing.city, listing.state].filter(Boolean).join(", ")}
            </div>
          )}
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

        {listing.ai_summary && (
          <>
            <Separator />
            <section>
              <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">AI summary</div>
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
      </aside>
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
