import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Gavel, Clock } from "lucide-react";
import { useAuctions } from "@/hooks/useAuctions";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { setMeta } from "@/lib/seo";
import { formatCents } from "@/lib/utils";
import type { AuctionStatus } from "@/types/database";

function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function Countdown({ endsAt }: { endsAt: string }) {
  const now = useNow(1000);
  const ms = useMemo(() => new Date(endsAt).getTime() - now, [endsAt, now]);
  if (ms <= 0) return <span className="font-mono text-xs text-muted-foreground">ended</span>;
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts = d > 0 ? `${d}d ${h}h ${m}m`
    : h > 0 ? `${h}h ${m}m ${sec}s`
    : `${m}m ${sec}s`;
  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs">
      <Clock className="h-3 w-3 text-brass-400" /> {parts}
    </span>
  );
}

export default function AuctionsPage() {
  const [tab, setTab] = useState<AuctionStatus>("live");
  const { data: auctions = [], isLoading } = useAuctions(
    tab === "ended" ? ["ended"] : tab === "upcoming" ? ["upcoming"] : ["live"],
  );
  useEffect(() => { setMeta({ title: "Auctions", description: "Live and upcoming auctions on TradeWind." }); }, []);

  return (
    <div className="container-pad py-12 space-y-8">
      <header className="flex items-center gap-3">
        <Gavel className="h-6 w-6 text-brass-400" />
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">Auctions</div>
          <h1 className="font-display text-4xl mt-1">Live + upcoming</h1>
        </div>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as AuctionStatus)}>
        <TabsList>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="ended">Ended</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {auctions.map((a) => (
                <Link
                  key={a.id}
                  to={`/auctions/${a.id}`}
                  className="rounded-lg border border-border bg-card overflow-hidden hover:border-brass-500/50 transition-colors"
                >
                  <div className="aspect-[16/10] bg-secondary">
                    {a.listing?.cover_photo_url
                      ? <img src={a.listing.cover_photo_url} alt={a.listing.title} className="h-full w-full object-cover" loading="lazy" />
                      : <div className="h-full w-full grid place-items-center text-xs font-mono text-muted-foreground">no photo</div>}
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={a.status === "live" ? "good" : a.status === "upcoming" ? "accent" : "default"}>
                        {a.status}
                      </Badge>
                      {a.status === "live" && <Countdown endsAt={a.end_time} />}
                      {a.status === "upcoming" && <span className="text-xs text-muted-foreground">starts {new Date(a.start_time).toLocaleString()}</span>}
                    </div>
                    <h3 className="font-display text-lg leading-tight truncate">{a.listing?.title ?? "—"}</h3>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-muted-foreground">Current bid</span>
                      <span className="font-mono text-brass-400">{formatCents(a.current_bid_cents ?? a.starting_price_cents)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{a.bid_count} bid{a.bid_count === 1 ? "" : "s"}</div>
                  </div>
                </Link>
              ))}
              {!auctions.length && (
                <div className="col-span-full rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                  No {tab} auctions right now.
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
