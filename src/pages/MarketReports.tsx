import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MarketReportCard } from "@/components/market/MarketReportCard";
import { setMeta } from "@/lib/seo";
import type { MarketReport } from "@/types/database";

export default function MarketReports() {
  useEffect(() => { setMeta({ title: "Market reports", description: "TradeWind market reports — boat and auto categories." }); }, []);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["market-reports"],
    queryFn: async (): Promise<MarketReport[]> => {
      const { data, error } = await supabase
        .from("market_reports").select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return (data ?? []) as MarketReport[];
    },
  });

  return (
    <div className="container-pad py-16 space-y-8">
      <header>
        <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">Market reports</div>
        <h1 className="font-display text-4xl mt-1">Where the market is going.</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">Quarterly category reports — center consoles, exotics, RVs, and more.</p>
      </header>
      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => <MarketReportCard key={r.id} report={r} />)}
          {!reports.length && (
            <div className="col-span-full rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              First report ships soon.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
