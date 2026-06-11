// Follow-ups tab — extracted verbatim from AdminOutreach.tsx.
import { useMemo } from "react";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { todayIso } from "./badges";
import type { OutreachFollowup, OutreachLead } from "./types";

export function FollowupsView({ followups, leads, onOpen }: {
  followups: OutreachFollowup[];
  leads: OutreachLead[];
  onOpen: (id: string) => void;
}) {
  const leadMap = useMemo(() => {
    const m = new Map<string, OutreachLead>();
    leads.forEach((l) => m.set(l.id, l));
    return m;
  }, [leads]);

  if (followups.length === 0) {
    return <EmptyState icon={Calendar} title="No follow-ups due" body="Follow-ups appear here as soon as draft messages are approved." />;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="text-left px-4 py-3">Due</th>
            <th className="text-left px-4 py-3">Company</th>
            <th className="text-left px-4 py-3">#</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {followups.map((f) => {
            const lead = leadMap.get(f.lead_id);
            const overdue = f.due_date <= todayIso();
            return (
              <tr key={f.id} className="border-t border-border hover:bg-secondary/40">
                <td className={`px-4 py-3 font-mono text-xs ${overdue ? "text-brass-400" : ""}`}>{f.due_date}</td>
                <td className="px-4 py-3">{lead?.company ?? "(deleted)"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">#{f.followup_number}</td>
                <td className="px-4 py-3"><Badge>{f.status}</Badge></td>
                <td className="px-4 py-3 text-right">
                  {lead && <Button size="sm" variant="outline" onClick={() => onOpen(lead.id)}>Open lead</Button>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
