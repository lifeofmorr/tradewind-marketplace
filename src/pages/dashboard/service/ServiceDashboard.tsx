import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Inbox, Star, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { setMeta } from "@/lib/seo";
import type { ServiceProvider } from "@/types/database";

export default function ServiceDashboard() {
  const { profile } = useAuth();
  const spId = profile?.service_provider_id ?? undefined;

  useEffect(() => { setMeta({ title: "Service · dashboard", description: "Service provider workspace." }); }, []);

  const { data: provider } = useQuery({
    queryKey: ["service-provider", spId],
    enabled: !!spId,
    queryFn: async (): Promise<ServiceProvider | null> => {
      if (!spId) return null;
      const { data, error } = await supabase.from("service_providers").select("*").eq("id", spId).maybeSingle();
      if (error) throw error;
      return (data as ServiceProvider | null) ?? null;
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">Service partner</div>
          <h1 className="font-display text-3xl mt-1">{provider?.name ?? "Service business"}</h1>
        </div>
        <Button asChild variant="outline"><Link to="/service/profile">Edit profile</Link></Button>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Link to="/service/leads" className="rounded-lg border border-border bg-card/60 p-5 hover:border-brass-500/40 transition-colors">
          <Inbox className="h-5 w-5 text-brass-400" />
          <div className="font-display text-base mt-3">Open requests</div>
          <p className="text-xs text-muted-foreground mt-1">New buyer requests routed to your category.</p>
        </Link>
        <Link to="/service/profile" className="rounded-lg border border-border bg-card/60 p-5 hover:border-brass-500/40 transition-colors">
          <Settings className="h-5 w-5 text-brass-400" />
          <div className="font-display text-base mt-3">Edit your profile</div>
          <p className="text-xs text-muted-foreground mt-1">Verified profiles get priority in routing.</p>
        </Link>
        <Link to="/pricing" className="rounded-lg border border-border bg-card/60 p-5 hover:border-brass-500/40 transition-colors">
          <Star className="h-5 w-5 text-brass-400" />
          <div className="font-display text-base mt-3">Manage plan</div>
          <p className="text-xs text-muted-foreground mt-1">Upgrade for priority placement.</p>
        </Link>
      </div>
      <div className="rounded-lg border border-border bg-card p-6 text-sm space-y-1">
        <div className="font-display text-base mb-2">Account</div>
        <div>Category: <span className="font-mono text-brass-400">{provider?.category ?? "—"}</span></div>
        <div>Verified: <span className="font-mono">{provider?.is_verified ? "yes" : "pending — submit credentials to support"}</span></div>
        <div>Subscription: <span className="font-mono">{provider?.subscription_tier ?? "trial"} · {provider?.subscription_status ?? "active"}</span></div>
      </div>
    </div>
  );
}
