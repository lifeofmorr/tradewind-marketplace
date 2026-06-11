// Daily-queue tab: bulk approval + draft cards — extracted verbatim from AdminOutreach.tsx.
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Instagram, Linkedin, Mail, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { checkMessageQuality } from "@/lib/outreach/messageQuality";
import { formatInstagramDM, formatLinkedInDM } from "@/lib/outreach/csvImport";
import { priorityBadge } from "./badges";
import type { OutreachLead, OutreachMessage } from "./types";

export function QueueView({ drafts, leads, onOpen, onCopy }: {
  drafts: OutreachMessage[];
  leads: OutreachLead[];
  onOpen: (id: string) => void;
  onCopy: (text: string, label?: string) => void;
}) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkMsg, setBulkMsg] = useState<string | null>(null);

  const leadMap = useMemo(() => {
    const m = new Map<string, OutreachLead>();
    leads.forEach((l) => m.set(l.id, l));
    return m;
  }, [leads]);

  // Only "drafted" rows are approve-eligible.
  const eligible = useMemo(() => drafts.filter((d) => d.status === "drafted"), [drafts]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllEligible() {
    setSelected(new Set(eligible.map((m) => m.id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function approveSelected() {
    if (selected.size === 0) return;
    setBulkBusy(true);
    setBulkMsg(null);
    const ids = Array.from(selected);
    const { error } = await supabase
      .from("outreach_messages")
      .update({ status: "approved", approved: true, approved_at: new Date().toISOString() })
      .in("id", ids);
    setBulkBusy(false);
    if (error) {
      setBulkMsg(`Bulk approve failed: ${error.message}`);
      return;
    }
    setBulkMsg(`Approved ${ids.length} draft${ids.length === 1 ? "" : "s"}.`);
    setSelected(new Set());
    void qc.invalidateQueries({ queryKey: ["outreach-drafts"] });
  }

  if (drafts.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Queue is empty"
        body='Click "Build today’s queue" to draft messages for the top 10 highest-priority leads.'
      />
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs bg-secondary/30 border border-border rounded-md px-3 py-2">
        <span className="text-muted-foreground">
          Selected: <span className="font-mono text-foreground">{selected.size}</span> / {eligible.length} eligible
        </span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={selectAllEligible} disabled={eligible.length === 0}>
            Select all
          </Button>
          <Button size="sm" variant="outline" onClick={clearSelection} disabled={selected.size === 0}>
            Clear
          </Button>
          <Button size="sm" onClick={() => void approveSelected()} disabled={selected.size === 0 || bulkBusy}>
            <CheckCircle2 className="h-3 w-3" /> {bulkBusy ? "Approving…" : `Approve Selected (${selected.size})`}
          </Button>
        </div>
      </div>
      {bulkMsg && (
        <div role="status" className="text-xs text-emerald-300 px-1">{bulkMsg}</div>
      )}
      {drafts.map((m) => {
        const lead = leadMap.get(m.lead_id);
        if (!lead) return null;
        return (
          <DraftCard
            key={m.id}
            message={m}
            lead={lead}
            onOpen={onOpen}
            onCopy={onCopy}
            selected={selected.has(m.id)}
            onToggle={() => toggle(m.id)}
            selectable={m.status === "drafted"}
          />
        );
      })}
    </div>
  );
}

function DraftCard({ message, lead, onOpen, onCopy, selected, onToggle, selectable }: {
  message: OutreachMessage;
  lead: OutreachLead;
  onOpen: (id: string) => void;
  onCopy: (text: string, label?: string) => void;
  selected?: boolean;
  onToggle?: () => void;
  selectable?: boolean;
}) {
  const quality = checkMessageQuality(message.body);
  const risk = message.ai_tone_risk_score ?? quality.ai_tone_risk_score;
  const riskBadge = risk >= 50
    ? <Badge variant="bad">AI risk {risk}</Badge>
    : risk >= 25
      ? <Badge variant="accent">AI risk {risk}</Badge>
      : <Badge variant="good">AI risk {risk}</Badge>;

  return (
    <div className={`rounded-md border p-4 space-y-2 bg-background ${selected ? "border-brass-500/60 ring-1 ring-brass-500/30" : "border-border"}`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3">
          {selectable && (
            <input
              type="checkbox"
              checked={!!selected}
              onChange={onToggle}
              aria-label={`Select draft for ${lead.company}`}
              className="mt-1.5"
            />
          )}
          <div>
            <div className="font-display">{lead.company}</div>
            <div className="text-xs text-muted-foreground">
              {lead.contact_name ?? "—"} · {lead.vertical} · {message.channel}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {priorityBadge(lead.priority)}
          {riskBadge}
          <Badge>{message.status}</Badge>
        </div>
      </div>
      {message.subject && (
        <div className="text-xs"><span className="text-muted-foreground">Subject:</span> {message.subject}</div>
      )}
      <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed rounded bg-secondary/40 p-3 max-h-56 overflow-y-auto">
        {message.body}
      </pre>
      {quality.issues.length > 0 && (
        <div className="text-[11px] text-amber-400 flex items-start gap-1">
          <AlertTriangle className="h-3 w-3 mt-0.5" />
          <span>{quality.issues.join(" · ")}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button size="sm" variant="outline" onClick={() => onCopy(
          message.subject ? `Subject: ${message.subject}\n\n${message.body}` : message.body,
          "Email copied",
        )}>
          <Mail className="h-3 w-3" /> Copy email
        </Button>
        <Button size="sm" variant="outline" onClick={() => onCopy(formatLinkedInDM(message.body), "LinkedIn DM copied")}>
          <Linkedin className="h-3 w-3" /> Copy LinkedIn DM
        </Button>
        <Button size="sm" variant="outline" onClick={() => onCopy(formatInstagramDM(message.body), "Instagram DM copied")}>
          <Instagram className="h-3 w-3" /> Copy Instagram DM
        </Button>
        <Button size="sm" variant="outline" disabled title="Connect Gmail API to enable">
          Create Gmail draft
        </Button>
        <Button size="sm" onClick={() => onOpen(lead.id)}>Open lead</Button>
      </div>
    </div>
  );
}
