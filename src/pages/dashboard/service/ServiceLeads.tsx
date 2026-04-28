import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Inbox } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
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
      <div>
        <div className="eyebrow">Service · leads</div>
        <h1 className="section-title">Inbound requests</h1>
        <p className="text-sm text-muted-foreground mt-2">Buyer requests routed to your category and region.</p>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 skeleton rounded-lg" />
          ))}
        </div>
      ) : !leads.length ? (
        <EmptyState
          icon={Inbox}
          title="No requests yet"
          body="When buyers submit a financing, insurance, inspection, transport, or concierge request that matches your category and region, it appears here."
          cta={{ label: "Edit your profile", to: "/service/profile" }}
        />
      ) : (
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
        </div>
      )}
    </div>
  );
}
