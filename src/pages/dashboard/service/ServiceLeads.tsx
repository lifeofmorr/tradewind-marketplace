import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { setMeta } from "@/lib/seo";
import { timeAgo } from "@/lib/utils";
import type { ServiceRequest, RequestStatus } from "@/types/database";

const STATUS_VARIANT: Record<RequestStatus, "default" | "accent" | "good" | "bad"> = {
  submitted: "accent",
  assigned: "default",
  in_progress: "default",
  quoted: "good",
  completed: "good",
  canceled: "bad",
};

export default function ServiceLeads() {
  const { profile } = useAuth();
  useEffect(() => { setMeta({ title: "Service · leads", description: "Inbound service requests." }); }, []);
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["service-leads", profile?.service_provider_id],
    enabled: !!profile?.service_provider_id,
    queryFn: async (): Promise<ServiceRequest[]> => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .eq("service_provider_id", profile!.service_provider_id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ServiceRequest[];
    },
  });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Leads</h1>
      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <div className="space-y-3">
          {leads.map((q) => (
            <div key={q.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-display text-lg">{q.full_name}</div>
                  <div className="text-xs font-mono text-muted-foreground">{q.email}{q.phone ? ` · ${q.phone}` : ""}</div>
                  <div className="text-xs text-muted-foreground mt-1">{q.service_needed} · {timeAgo(q.created_at)} ago</div>
                </div>
                <Badge variant={STATUS_VARIANT[q.status]}>{q.status}</Badge>
              </div>
              {q.notes && <p className="mt-3 text-sm whitespace-pre-wrap text-muted-foreground">{q.notes}</p>}
            </div>
          ))}
          {!leads.length && (
            <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">No leads yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
