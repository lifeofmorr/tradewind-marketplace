import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Gavel, ChevronLeft } from "lucide-react";
import { useAuction, useBids } from "@/hooks/useAuctions";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ListingGallery } from "@/components/listings/ListingGallery";
import { Countdown } from "@/pages/Auctions";
import { setMeta } from "@/lib/seo";
import { formatCents, timeAgo } from "@/lib/utils";
import { createNotification } from "@/hooks/useNotifications";
import type { ListingPhoto } from "@/types/database";

export default function AuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: auction, isLoading } = useAuction(id);
  const { data: bids = [], refetch: refetchBids } = useBids(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [bidAmount, setBidAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: photos = [] } = useQuery({
    queryKey: ["auction-photos", auction?.listing_id],
    enabled: !!auction?.listing_id,
    queryFn: async (): Promise<ListingPhoto[]> => {
      const { data, error: e } = await supabase
        .from("listing_photos")
        .select("*")
        .eq("listing_id", auction!.listing_id)
        .order("position", { ascending: true });
      if (e) throw e;
      return (data ?? []) as ListingPhoto[];
    },
  });

  useEffect(() => {
    if (!auction?.listing) return;
    setMeta({
      title: `Auction · ${auction.listing.title}`,
      description: `Live auction on TradeWind for ${auction.listing.title}.`,
    });
  }, [auction]);

  // Realtime: subscribe to new bids on this auction
  useEffect(() => {
    if (!id) return;
    const channel = supabase.channel(`auction:${id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "bids", filter: `auction_id=eq.${id}` },
        () => {
          void refetchBids();
          void qc.invalidateQueries({ queryKey: ["auction", id] });
        })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [id, refetchBids, qc]);

  if (isLoading) return <div className="container-pad py-16 text-sm text-muted-foreground">Loading…</div>;
  if (!auction || !auction.listing) return <div className="container-pad py-16"><h1 className="font-display text-3xl">Auction not found</h1></div>;

  const currentBid = auction.current_bid_cents ?? auction.starting_price_cents;
  const minNext = currentBid + 100; // require at least +$1
  const ended = new Date(auction.end_time).getTime() <= Date.now();
  const canBid = !ended && (auction.status === "live" || auction.status === "upcoming") && !!user;

  async function placeBid() {
    if (!user) { navigate("/login"); return; }
    if (!auction) return;
    setError(null);
    const cents = Math.round(Number(bidAmount) * 100);
    if (!Number.isFinite(cents) || cents < minNext) {
      setError(`Bid must be at least ${formatCents(minNext)}`);
      return;
    }
    setBusy(true);
    const { error: e } = await supabase.from("bids").insert({
      auction_id: auction.id, bidder_id: user.id, amount_cents: cents,
    });
    setBusy(false);
    if (e) { setError(e.message); return; }
    setBidAmount("");
    void refetchBids();
    void qc.invalidateQueries({ queryKey: ["auction", auction.id] });

    // Notify the seller their auction has a new bid.
    if (auction.listing) {
      void createNotification({
        user_id: auction.listing.seller_id,
        kind: "system",
        title: "New bid on your auction",
        body: `${formatCents(cents)} on ${auction.listing.title}.`,
        link: `/auctions/${auction.id}`,
      });
    }
  }

  return (
    <div className="container-pad py-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        <Link to="/auctions" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-3 w-3" /> Back to auctions
        </Link>
        <ListingGallery photos={photos} coverFallback={auction.listing.cover_photo_url} />
        <header>
          <div className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-brass-400" />
            <Badge variant={auction.status === "live" ? "good" : auction.status === "upcoming" ? "accent" : "default"}>{auction.status}</Badge>
            {auction.status === "live" && <Countdown endsAt={auction.end_time} />}
          </div>
          <h1 className="font-display text-4xl mt-2 leading-tight">{auction.listing.title}</h1>
        </header>

        <Separator />

        {auction.listing.description && (
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{auction.listing.description}</p>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Current bid</div>
            <div className="font-display text-3xl text-brass-400 mt-1">{formatCents(currentBid)}</div>
            <div className="text-xs text-muted-foreground mt-1">{auction.bid_count} bid{auction.bid_count === 1 ? "" : "s"}</div>
          </div>
          <div className="text-xs text-muted-foreground">
            <div>Starts: <span className="font-mono text-foreground">{new Date(auction.start_time).toLocaleString()}</span></div>
            <div>Ends: <span className="font-mono text-foreground">{new Date(auction.end_time).toLocaleString()}</span></div>
          </div>
          {canBid ? (
            <div className="space-y-2">
              <Label htmlFor="bid">Your bid (USD)</Label>
              <Input
                id="bid"
                type="number"
                min={(minNext / 100).toFixed(0)}
                step={1}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={(minNext / 100).toFixed(0)}
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <Button onClick={() => { void placeBid(); }} disabled={busy} className="w-full">
                {busy ? "Placing…" : `Place bid · min ${formatCents(minNext)}`}
              </Button>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              {!user ? <>You must <Link to="/login" className="text-brass-400">log in</Link> to bid.</>
                : ended ? "This auction has ended."
                : null}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-6 space-y-3">
          <div className="font-display text-lg">Bid history</div>
          {bids.length === 0 ? (
            <div className="text-xs text-muted-foreground">No bids yet.</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {bids.map((b) => (
                <li key={b.id} className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{b.bidder_id.slice(0, 8)}{b.is_winning && " · winning"}</span>
                  <span className="font-mono text-brass-400">{formatCents(b.amount_cents)}</span>
                  <span className="text-xs text-muted-foreground">{timeAgo(b.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
