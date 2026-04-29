import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Inbox, TrendingUp, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useListings } from "@/hooks/useListings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketPulseCard } from "@/components/market/MarketPulseCard";
import { GrowthCommandCenter } from "@/components/dealer/GrowthCommandCenter";
import { DealerResponseScore } from "@/components/dealer/DealerResponseScore";
import { setMeta } from "@/lib/seo";
import { formatNumber } from "@/lib/utils";
import type { Dealer } from "@/types/database";

export default function DealerDashboard() {
  const { profile } = useAuth();
  const dealerId = profile?.dealer_id ?? undefined;

  useEffect(() => { setMeta({ title: "Dealer dashboard", description: "Inventory, leads, and analytics." }); }, []);

  const { data: dealer } = useQuery({
    queryKey: ["dealer", dealerId],
    enabled: !!dealerId,
    queryFn: async (): Promise<Dealer | null> => {
      if (!dealerId) return null;
      const { data, error } = await supabase.from("dealers").select("*").eq("id", dealerId).maybeSingle();
      if (error) throw error;
      return (data as Dealer | null) ?? null;
    },
  });

  const { data: listings = [] } = useListings({ dealer_id: dealerId, limit: 200 });
  const active = listings.filter((l) => l.status === "active").length;
  const draft = listings.filter((l) => l.status === "draft").length;
  const totalViews = listings.reduce((s, l) => s + (l.view_count ?? 0), 0);
  const totalInquiries = listings.reduce((s, l) => s + (l.inquiry_count ?? 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">Dealer</div>
          <h1 className="font-display text-3xl mt-1">{dealer?.name ?? "Dealership"}</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/dealer/profile">Edit profile</Link></Button>
          <Button asChild><Link to="/seller/listings/new"><Plus className="h-4 w-4" /> New listing</Link></Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active" value={active} />
        <Stat label="Draft" value={draft} />
        <Stat label="Views" value={formatNumber(totalViews)} />
        <Stat label="Inquiries" value={formatNumber(totalInquiries)} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Link to="/dealer/leads" className="rounded-lg border border-border bg-card/60 p-5 hover:border-brass-500/40 transition-colors">
          <Inbox className="h-5 w-5 text-brass-400" />
          <div className="font-display text-base mt-3">Open the inbox</div>
          <p className="text-xs text-muted-foreground mt-1">New leads route here automatically.</p>
        </Link>
        <Link to="/dealer/analytics" className="rounded-lg border border-border bg-card/60 p-5 hover:border-brass-500/40 transition-colors">
          <TrendingUp className="h-5 w-5 text-brass-400" />
          <div className="font-display text-base mt-3">Review analytics</div>
          <p className="text-xs text-muted-foreground mt-1">See what's driving views and inquiries.</p>
        </Link>
        <Link to="/dealer/profile" className="rounded-lg border border-border bg-card/60 p-5 hover:border-brass-500/40 transition-colors">
          <Settings className="h-5 w-5 text-brass-400" />
          <div className="font-display text-base mt-3">Polish your profile</div>
          <p className="text-xs text-muted-foreground mt-1">A complete profile lifts buyer trust.</p>
        </Link>
      </div>
      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <GrowthCommandCenter dealerId={dealerId} listings={listings} />
        <DealerResponseScore dealer={dealer ?? null} listings={listings} />
      </section>
      <section>
        <h2 className="font-display text-xl mb-3">Your inventory pulse</h2>
        <MarketPulseCard scope="dealer" dealerId={dealerId} />
      </section>
      <Card>
        <CardHeader><CardTitle>Subscription</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
          <div>Tier: <span className="font-mono text-brass-400">{dealer?.subscription_tier ?? "starter"}</span></div>
          <div>Status: <span className="font-mono">{dealer?.subscription_status ?? "trialing"}</span></div>
          <Button asChild variant="outline" className="mt-3"><Link to="/pricing">Manage plan</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-3xl mt-1">{value}</div>
    </div>
  );
}
