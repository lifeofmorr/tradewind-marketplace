import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
      <div className="rounded-lg border border-border bg-card p-6 text-sm">
        <div>Category: <span className="font-mono text-brass-400">{provider?.category ?? "—"}</span></div>
        <div>Verified: <span className="font-mono">{provider?.is_verified ? "yes" : "no"}</span></div>
        <div>Subscription: <span className="font-mono">{provider?.subscription_tier ?? "—"} · {provider?.subscription_status ?? "—"}</span></div>
      </div>
    </div>
  );
}
