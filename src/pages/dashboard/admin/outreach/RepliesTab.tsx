// Replies tab — extracted verbatim from AdminOutreach.tsx.
import { useMemo } from "react";
import { Copy, MessageSquareReply } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { OutreachLead, OutreachReply } from "./types";

export function RepliesView({ replies, leads, onOpen, onCopy }: {
  replies: OutreachReply[];
  leads: OutreachLead[];
  onOpen: (id: string) => void;
  onCopy: (text: string, label?: string) => void;
}) {
  const leadMap = useMemo(() => {
    const m = new Map<string, OutreachLead>();
    leads.forEach((l) => m.set(l.id, l));
    return m;
  }, [leads]);

  if (replies.length === 0) {
    return <EmptyState icon={MessageSquareReply} title="No replies yet" body="Paste a reply on a lead and classify it — recommendations appear here." />;
  }
  return (
    <div className="space-y-3">
      {replies.map((r) => {
        const lead = leadMap.get(r.lead_id);
        return (
          <div key={r.id} className="rounded-md border border-border p-3 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-sm font-display">{lead?.company ?? "(deleted)"}</div>
              <div className="flex gap-2 items-center text-xs">
                <Badge>{r.channel}</Badge>
                {r.reply_type && <Badge variant="accent">{r.reply_type}</Badge>}
                <span className="text-muted-foreground">{r.created_at.slice(0, 10)}</span>
              </div>
            </div>
            <pre className="text-xs whitespace-pre-wrap font-sans line-clamp-4 bg-secondary/40 p-2 rounded">{r.reply_text}</pre>
            {r.recommended_response && (
              <div className="text-xs space-y-1">
                <div className="text-muted-foreground uppercase tracking-wider text-[10px]">Recommended response</div>
                <pre className="whitespace-pre-wrap font-sans bg-emerald-500/5 border border-emerald-500/20 rounded p-2">
                  {r.recommended_response}
                </pre>
                <Button size="sm" variant="outline" onClick={() => onCopy(r.recommended_response ?? "", "Response copied")}>
                  <Copy className="h-3 w-3" /> Copy response
                </Button>
              </div>
            )}
            {lead && <Button size="sm" onClick={() => onOpen(lead.id)}>Open lead</Button>}
          </div>
        );
      })}
    </div>
  );
}
