import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useListings } from "@/hooks/useListings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card>
        <CardHeader><CardTitle>Subscription</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
          <div>Tier: <span className="font-mono text-brass-400">{dealer?.subscription_tier ?? "—"}</span></div>
          <div>Status: <span className="font-mono">{dealer?.subscription_status ?? "—"}</span></div>
          <Button asChild variant="outline" className="mt-3"><Link to="/pricing">Upgrade</Link></Button>
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
