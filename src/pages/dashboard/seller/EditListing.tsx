import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PhotoUploader } from "@/components/listings/PhotoUploader";
import { setMeta } from "@/lib/seo";
import type { Listing, ListingPhoto } from "@/types/database";

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { data: listing, isLoading } = useQuery({
    queryKey: ["seller-listing", id],
    enabled: !!id,
    queryFn: async (): Promise<Listing | null> => {
      const { data, error: e } = await supabase.from("listings").select("*").eq("id", id ?? "").maybeSingle();
      if (e) throw e;
      return (data as Listing | null) ?? null;
    },
  });

  const { data: photos = [] } = useQuery({
    queryKey: ["seller-listing-photos", id],
    enabled: !!id,
    queryFn: async (): Promise<ListingPhoto[]> => {
      const { data, error: e } = await supabase
        .from("listing_photos")
        .select("*")
        .eq("listing_id", id ?? "")
        .order("position", { ascending: true });
      if (e) throw e;
      return (data ?? []) as ListingPhoto[];
    },
  });

  useEffect(() => {
    if (listing) setMeta({ title: `Edit · ${listing.title}`, description: "Edit your listing." });
  }, [listing]);

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!listing) return <div className="text-sm text-muted-foreground">Listing not found.</div>;
  if (listing.seller_id !== user?.id && profile?.role !== "admin") {
    return <div className="text-sm text-muted-foreground">Not your listing.</div>;
  }

  async function save(patch: Partial<Listing>) {
    if (!listing) return;
    setError(null);
    const { error: e } = await supabase.from("listings").update(patch).eq("id", listing.id);
    if (e) { setError(e.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
    void qc.invalidateQueries({ queryKey: ["seller-listing", listing.id] });
    void qc.invalidateQueries({ queryKey: ["listings"] });
  }

  async function submitForReview() {
    await save({ status: "pending_review" });
  }

  async function unpublish() {
    await save({ status: "draft" });
  }

  const current = listing;
  async function persistPhotos(next: { storage_path: string; url: string | null }[]) {
    await supabase.from("listing_photos").delete().eq("listing_id", current.id);
    if (next.length) {
      await supabase.from("listing_photos").insert(next.map((p, i) => ({
        listing_id: current.id,
        storage_path: p.storage_path,
        url: p.url,
        position: i,
        is_cover: i === 0,
      })));
      await save({ cover_photo_url: next[0]?.url ?? null });
    } else {
      await save({ cover_photo_url: null });
    }
    void qc.invalidateQueries({ queryKey: ["seller-listing-photos", current.id] });
  }

  const ownerId = current.dealer_id ?? current.seller_id;

  return (
    <div className="space-y-8 max-w-3xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <Link to="/seller/listings" className="text-xs text-muted-foreground hover:text-foreground">← Listings</Link>
          <h1 className="font-display text-3xl mt-1">{listing.title}</h1>
          <div className="flex items-center gap-2 mt-2"><Badge>{listing.status}</Badge>{listing.is_featured && <Badge variant="accent">Featured</Badge>}</div>
        </div>
        <div className="flex gap-2">
          {listing.status === "draft" && <Button onClick={() => { void submitForReview(); }}>Submit for review</Button>}
          {listing.status === "active" && <Button variant="outline" onClick={() => { void unpublish(); }}>Unpublish</Button>}
        </div>
      </header>

      {saved && <div className="text-xs text-emerald-400 font-mono">saved</div>}
      {error && <div className="text-xs text-red-400 font-mono">{error}</div>}

      <section className="rounded-lg border border-border bg-card p-6 space-y-3">
        <div className="font-display text-xl">Basics</div>
        <div><Label>Title</Label><Input defaultValue={listing.title} onBlur={(e) => { void save({ title: e.target.value }); }} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label>Make</Label><Input defaultValue={listing.make ?? ""} onBlur={(e) => { void save({ make: e.target.value || null }); }} /></div>
          <div><Label>Model</Label><Input defaultValue={listing.model ?? ""} onBlur={(e) => { void save({ model: e.target.value || null }); }} /></div>
          <div><Label>Year</Label><Input type="number" defaultValue={listing.year ?? ""} onBlur={(e) => { void save({ year: e.target.value ? Number(e.target.value) : null }); }} /></div>
        </div>
        <div><Label>Price (USD)</Label><Input type="number" defaultValue={listing.price_cents ? listing.price_cents / 100 : ""} onBlur={(e) => { void save({ price_cents: e.target.value ? Math.round(Number(e.target.value) * 100) : null }); }} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>City</Label><Input defaultValue={listing.city ?? ""} onBlur={(e) => { void save({ city: e.target.value || null }); }} /></div>
          <div><Label>State</Label><Input maxLength={2} defaultValue={listing.state ?? ""} onBlur={(e) => { void save({ state: e.target.value ? e.target.value.toUpperCase() : null }); }} /></div>
        </div>
        <div><Label>Description</Label><Textarea rows={6} defaultValue={listing.description ?? ""} onBlur={(e) => { void save({ description: e.target.value || null }); }} /></div>
      </section>

      <Separator />

      <section className="rounded-lg border border-border bg-card p-6 space-y-3">
        <div className="font-display text-xl">Photos</div>
        <PhotoUploader
          ownerId={ownerId}
          listingId={listing.id}
          initial={photos.map((p) => ({ storage_path: p.storage_path, url: p.url }))}
          onChange={(next) => { void persistPhotos(next); }}
        />
      </section>
    </div>
  );
}
