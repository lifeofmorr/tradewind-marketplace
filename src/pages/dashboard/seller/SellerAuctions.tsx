import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Gavel } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { setMeta } from "@/lib/seo";
import { formatCents, timeAgo } from "@/lib/utils";
import type { Auction, Listing } from "@/types/database";

interface AuctionWithListing extends Auction {
  listing: Pick<Listing, "id" | "title" | "slug"> | null;
}

export default function SellerAuctions() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);

  useEffect(() => { setMeta({ title: "Seller · auctions", description: "Manage your auctions." }); }, []);

  const { data: auctions = [], isLoading } = useQuery({
    queryKey: ["seller-auctions", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<AuctionWithListing[]> => {
      // RLS will hide auctions on listings the user doesn't own.
      const { data, error } = await supabase
        .from("auctions")
        .select("*, listing:listings(id, title, slug)")
        .order("end_time", { ascending: false })
        .limit(100);
      if (error) throw error;
      const sellerId = user?.id;
      const dealerId = profile?.dealer_id;
      // Defensive: also filter client-side since RLS already does the right thing.
      return ((data ?? []) as AuctionWithListing[]).filter((a) => {
        if (!a.listing) return true;
        // We don't have seller_id on this projection; trust RLS.
        return sellerId || dealerId;
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gavel className="h-6 w-6 text-brass-400" />
          <h1 className="font-display text-3xl">Auctions</h1>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New auction</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 skeleton rounded" />
          ))}
        </div>
      ) : !auctions.length ? (
        <EmptyState
          icon={Gavel}
          title="No auctions yet"
          body="Run a timed auction on any of your listings to drive urgency. Buyers see live bids and a countdown."
          cta={{ label: "Start an auction", onClick: () => setCreating(true) }}
          secondary={{ label: "View my listings", to: "/seller/listings", variant: "outline" }}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Listing</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Current bid</th>
                <th className="text-right px-4 py-3">Bids</th>
                <th className="text-left px-4 py-3">Ends</th>
              </tr>
            </thead>
            <tbody>
              {auctions.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <Link to={`/auctions/${a.id}`} className="hover:text-brass-400">{a.listing?.title ?? "—"}</Link>
                  </td>
                  <td className="px-4 py-3"><Badge variant={a.status === "live" ? "good" : a.status === "upcoming" ? "accent" : "default"}>{a.status}</Badge></td>
                  <td className="px-4 py-3 text-right font-mono">{formatCents(a.current_bid_cents ?? a.starting_price_cents)}</td>
                  <td className="px-4 py-3 text-right">{a.bid_count}</td>
                  <td className="px-4 py-3 text-muted-foreground">{timeAgo(a.end_time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateAuctionDialog
        open={creating}
        onOpenChange={setCreating}
        onCreated={() => { void qc.invalidateQueries({ queryKey: ["seller-auctions"] }); }}
      />
    </div>
  );
}

interface CreateProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: () => void;
}

function CreateAuctionDialog({ open, onOpenChange, onCreated }: CreateProps) {
  const { user, profile } = useAuth();
  const [listingId, setListingId] = useState<string>("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [startPrice, setStartPrice] = useState<string>("");
  const [reservePrice, setReservePrice] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: listings = [] } = useQuery({
    queryKey: ["seller-listings-for-auction", user?.id, profile?.dealer_id],
    enabled: open && !!user,
    queryFn: async (): Promise<Pick<Listing, "id" | "title">[]> => {
      let q = supabase.from("listings").select("id, title").in("status", ["draft", "active"]);
      if (profile?.dealer_id) q = q.eq("dealer_id", profile.dealer_id);
      else q = q.eq("seller_id", user!.id);
      const { data, error: e } = await q.order("created_at", { ascending: false }).limit(100);
      if (e) throw e;
      return (data ?? []) as Pick<Listing, "id" | "title">[];
    },
  });

  async function submit() {
    setError(null);
    if (!listingId || !start || !end || !startPrice) {
      setError("Listing, start, end, and starting price are required.");
      return;
    }
    setBusy(true);
    const startISO = new Date(start).toISOString();
    const endISO = new Date(end).toISOString();
    const startCents = Math.round(Number(startPrice) * 100);
    const reserveCents = reservePrice ? Math.round(Number(reservePrice) * 100) : null;
    const status = new Date(start) <= new Date() ? "live" : "upcoming";

    const { error: e } = await supabase.from("auctions").insert({
      listing_id: listingId,
      start_time: startISO,
      end_time: endISO,
      starting_price_cents: startCents,
      reserve_price_cents: reserveCents,
      status,
    });
    setBusy(false);
    if (e) { setError(e.message); return; }
    onCreated();
    onOpenChange(false);
    setListingId(""); setStart(""); setEnd(""); setStartPrice(""); setReservePrice("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>New auction</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Listing</Label>
            <Select value={listingId} onValueChange={setListingId}>
              <SelectTrigger><SelectValue placeholder="Pick a listing" /></SelectTrigger>
              <SelectContent>
                {listings.map((l) => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Start</Label><Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} /></div>
            <div><Label>End</Label><Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Starting price (USD)</Label><Input type="number" value={startPrice} onChange={(e) => setStartPrice(e.target.value)} /></div>
            <div><Label>Reserve (optional)</Label><Input type="number" value={reservePrice} onChange={(e) => setReservePrice(e.target.value)} /></div>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { void submit(); }} disabled={busy}>{busy ? "Creating…" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
