// Beta-pipeline tab — extracted verbatim from AdminOutreach.tsx.
import { useMemo } from "react";
import { UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { BETA_OFFER, BETA_STAGES } from "./constants";
import type { BetaPipelineRow, OutreachLead } from "./types";

export function BetaPipelineView({ betaRows, leads, onOpen }: {
  betaRows: BetaPipelineRow[];
  leads: OutreachLead[];
  onOpen: (id: string) => void;
}) {
  const leadMap = useMemo(() => {
    const m = new Map<string, OutreachLead>();
    leads.forEach((l) => m.set(l.id, l));
    return m;
  }, [leads]);

  const grouped = useMemo(() => {
    const g: Record<string, BetaPipelineRow[]> = {};
    BETA_STAGES.forEach((s) => { g[s] = []; });
    betaRows.forEach((b) => { (g[b.stage] ??= []).push(b); });
    return g;
  }, [betaRows]);

  async function advance(row: BetaPipelineRow, next: BetaPipelineRow["stage"]) {
    const { error } = await supabase.from("beta_pipeline").update({ stage: next }).eq("id", row.id);
    if (!error) {
      // best-effort: also update lead flags
      const patch: Partial<OutreachLead> = {};
      if (next === "demo_booked") patch.demo_booked = true;
      if (next === "beta_invited") patch.beta_invited = true;
      if (Object.keys(patch).length > 0) {
        const { error: leadErr } = await supabase.from("outreach_leads").update(patch).eq("id", row.lead_id);
        if (leadErr) console.warn("[outreach] beta pipeline lead flag update failed", leadErr);
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-secondary/30 p-4 text-xs space-y-1">
        <div className="font-medium text-foreground">Beta offer terms</div>
        <ul className="list-disc ml-4 text-muted-foreground space-y-0.5">
          {BETA_OFFER.map((o) => <li key={o}>{o}</li>)}
        </ul>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {BETA_STAGES.map((s) => (
          <div key={s} className="rounded-md border border-border px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.replace(/_/g, " ")}</div>
            <div className="font-mono text-lg">{grouped[s]?.length ?? 0}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {betaRows.length === 0 ? (
          <EmptyState icon={UserPlus} title="No beta pipeline yet" body="When a lead replies positively, add them to the beta pipeline from the lead detail panel." />
        ) : betaRows.map((b) => {
          const idx = BETA_STAGES.indexOf(b.stage);
          // Advance only along the conversion funnel — terminal stages
          // (follow_up_later, not_interested, declined) must be set
          // manually, never via the auto-advance button.
          const lastFunnelIdx = BETA_STAGES.indexOf("paid_candidate");
          const lead = leadMap.get(b.lead_id);
          const nextStage = idx >= 0 && idx < lastFunnelIdx ? BETA_STAGES[idx + 1] : null;
          return (
            <div key={b.id} className="rounded-md border border-border p-3 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-display">{lead?.company ?? "(deleted)"}</div>
                <div className="text-xs text-muted-foreground">
                  {b.stage.replace(/_/g, " ")} · {b.beta_type ?? "—"}
                  {b.demo_date ? ` · demo ${b.demo_date.slice(0, 10)}` : ""}
                </div>
              </div>
              <div className="flex gap-2">
                {nextStage && (
                  <Button size="sm" variant="outline" onClick={() => void advance(b, nextStage)}>
                    Advance → {nextStage.replace(/_/g, " ")}
                  </Button>
                )}
                {lead && <Button size="sm" onClick={() => onOpen(lead.id)}>Open lead</Button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
