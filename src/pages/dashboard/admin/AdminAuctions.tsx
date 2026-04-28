import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Gavel } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { setMeta } from "@/lib/seo";
import { formatCents, timeAgo } from "@/lib/utils";
import type { Auction, Listing } from "@/types/database";

interface Row extends Auction {
  listing: Pick<Listing, "id" | "title" | "slug"> | null;
}

export default function AdminAuctions() {
  const qc = useQueryClient();
  useEffect(() => { setMeta({ title: "Admin · auctions", description: "All auctions across the marketplace." }); }, []);

  const { data: auctions = [], isLoading } = useQuery({
    queryKey: ["admin-auctions"],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("auctions")
        .select("*, listing:listings(id, title, slug)")
        .order("end_time", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  async function cancel(id: string) {
    if (!window.confirm("Cancel this auction?")) return;
    await supabase.from("auctions").update({ status: "cancelled" }).eq("id", id);
    void qc.invalidateQueries({ queryKey: ["admin-auctions"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Gavel className="h-6 w-6 text-brass-400" />
        <h1 className="font-display text-3xl">Auctions</h1>
      </div>
      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Listing</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Current bid</th>
                <th className="text-right px-4 py-3">Bids</th>
                <th className="text-left px-4 py-3">Ends</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {auctions.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-4 py-3"><Link to={`/auctions/${a.id}`} className="hover:text-brass-400">{a.listing?.title ?? "—"}</Link></td>
                  <td className="px-4 py-3"><Badge variant={a.status === "live" ? "good" : a.status === "cancelled" ? "bad" : a.status === "upcoming" ? "accent" : "default"}>{a.status}</Badge></td>
                  <td className="px-4 py-3 text-right font-mono">{formatCents(a.current_bid_cents ?? a.starting_price_cents)}</td>
                  <td className="px-4 py-3 text-right">{a.bid_count}</td>
                  <td className="px-4 py-3 text-muted-foreground">{timeAgo(a.end_time)}</td>
                  <td className="px-4 py-3 text-right">
                    {(a.status === "live" || a.status === "upcoming") && (
                      <Button size="sm" variant="destructive" onClick={() => { void cancel(a.id); }}>Cancel</Button>
                    )}
                  </td>
                </tr>
              ))}
              {!auctions.length && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No auctions.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
