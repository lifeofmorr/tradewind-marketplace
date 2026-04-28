import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Info, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { matchPartners, type MatchRequest } from "@/lib/partnerMatch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ServiceProvider } from "@/types/database";

interface RequestRow {
  id: string;
  state?: string | null;
  partner_id?: string | null;
}

interface Props {
  request: RequestRow;
  table: "financing_requests" | "insurance_requests" | "inspection_requests" | "transport_requests" | "service_requests";
  category: MatchRequest["category"];
}

export function PartnerMatchPanel({ request, table, category }: Props) {
  const qc = useQueryClient();
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignedTo, setAssignedTo] = useState<string | null>(request.partner_id ?? null);
  const [error, setError] = useState<string | null>(null);

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["service-providers-all"],
    queryFn: async (): Promise<ServiceProvider[]> => {
      const { data, error } = await supabase
        .from("service_providers")
        .select("*")
        .limit(500);
      if (error) throw error;
      return (data ?? []) as ServiceProvider[];
    },
  });

  const matches = useMemo(
    () => matchPartners({ category, state: request.state ?? null }, providers),
    [providers, category, request.state],
  );

  async function assign(providerId: string) {
    setAssigningId(providerId);
    setError(null);
    try {
      const { error } = await supabase
        .from(table)
        .update({ partner_id: providerId, status: "assigned", updated_at: new Date().toISOString() })
        .eq("id", request.id);
      if (error) throw error;
      setAssignedTo(providerId);
      void qc.invalidateQueries({ queryKey: ["admin-req"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not assign");
    } finally {
      setAssigningId(null);
    }
  }

  if (isLoading) return <div className="text-xs text-muted-foreground mt-2">Matching partners…</div>;
  if (!matches.length) return <div className="text-xs text-muted-foreground mt-2">No partner matches yet.</div>;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-brass-400 font-mono">
        <Sparkles className="h-3 w-3" /> Top partner matches
      </div>
      {matches.map((m) => {
        const isAssigned = assignedTo === m.provider.id;
        return (
          <div
            key={m.provider.id}
            className={`flex items-center justify-between gap-3 rounded border px-3 py-2 text-sm ${
              isAssigned ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-secondary/20"
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display">{m.provider.name}</span>
                {m.provider.is_verified && <Badge variant="good">Verified</Badge>}
                {m.provider.is_featured && <Badge variant="accent">Featured</Badge>}
                <span className="text-[10px] text-muted-foreground" title={m.reasons.join(" · ")}>
                  <Info className="inline h-3 w-3" /> {m.reasons.slice(0, 2).join(" · ")}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {[m.provider.city, m.provider.state].filter(Boolean).join(", ")} · score {m.score}
              </div>
            </div>
            <Button
              size="sm"
              variant={isAssigned ? "outline" : "default"}
              disabled={assigningId === m.provider.id || isAssigned}
              onClick={() => { void assign(m.provider.id); }}
            >
              {isAssigned ? <><Check className="h-3 w-3 mr-1" /> Assigned</> : assigningId === m.provider.id ? "Assigning…" : "Assign"}
            </Button>
          </div>
        );
      })}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
