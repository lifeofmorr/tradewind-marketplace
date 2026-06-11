// Priority-queue tab — extracted verbatim from AdminOutreach.tsx.
import { useMemo } from "react";
import { Mail, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { priorityBadge, scoreBadge, statusBadge, verificationBadge } from "./badges";
import type { OutreachLead, OutreachMessage } from "./types";

// ── priority queue view ─────────────────────────────────────────────────────
//
// Shows only the send-ready slice of the lead table (status='send_ready'),
// sorted by priority then lead_score then updated_at, with a one-message
// preview for each row. The preview is the most-recent drafted/approved
// outreach_messages row tied to that lead (if any) — otherwise a short
// "no draft yet" placeholder so the operator knows to build today's queue.
//
// Source documents:
//   go-to-market/outreach-autopilot/TOP_10_SAFEST_LEADS.md
//   go-to-market/outreach-autopilot/TOP_25_SAFEST_LEADS.md
//   go-to-market/outreach-autopilot/TOP_25_POLISHED_EMAILS.md

export function PriorityQueueView({ leads, drafts, onOpen, onCopy }: {
  leads: OutreachLead[];
  drafts: OutreachMessage[];
  onOpen: (id: string) => void;
  onCopy: (text: string, label?: string) => void;
}) {
  const sendReady = useMemo(() => {
    return leads
      .filter((l) => l.status === "send_ready" && !l.do_not_contact)
      .sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        if (b.lead_score !== a.lead_score) return b.lead_score - a.lead_score;
        return (b.updated_at ?? "").localeCompare(a.updated_at ?? "");
      });
  }, [leads]);

  // Index of most-recent drafted/approved message per lead_id, for the preview.
  const previewByLead = useMemo(() => {
    const m = new Map<string, OutreachMessage>();
    drafts.forEach((d) => {
      const existing = m.get(d.lead_id);
      if (!existing || d.created_at > existing.created_at) m.set(d.lead_id, d);
    });
    return m;
  }, [drafts]);

  if (sendReady.length === 0) {
    return (
      <EmptyState
        icon={Send}
        title="No send-ready leads"
        body='Run supabase/outreach-lead-cleanup.sql to bucket leads, then they will appear here in priority order.'
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-xs text-emerald-200 flex items-start gap-2">
        <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          <div className="font-display text-foreground">Priority queue</div>
          <div className="opacity-90">
            {sendReady.length} send-ready lead{sendReady.length === 1 ? "" : "s"} sorted by
            priority. Use the daily-cap indicator above before approving — no email goes out
            without a manual approve + send on the dashboard.
          </div>
        </div>
      </div>
      {sendReady.map((l) => {
        const preview = previewByLead.get(l.id);
        return (
          <PriorityQueueRow
            key={l.id}
            lead={l}
            preview={preview}
            onOpen={onOpen}
            onCopy={onCopy}
          />
        );
      })}
    </div>
  );
}

function PriorityQueueRow({ lead, preview, onOpen, onCopy }: {
  lead: OutreachLead;
  preview: OutreachMessage | undefined;
  onOpen: (id: string) => void;
  onCopy: (text: string, label?: string) => void;
}) {
  return (
    <div className="rounded-md border border-border p-4 space-y-2 bg-background">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="font-display">{lead.company}</div>
          <div className="text-xs text-muted-foreground">
            {lead.contact_name ?? "—"}
            {lead.contact_role ? ` · ${lead.contact_role}` : ""}
            {" · "}{lead.vertical}
            {lead.email ? ` · ${lead.email}` : ""}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {priorityBadge(lead.priority)}
          {scoreBadge(lead.lead_score)}
          {verificationBadge(lead)}
          {statusBadge(lead)}
        </div>
      </div>
      {lead.personalization_angle && (
        <div className="text-xs text-muted-foreground italic line-clamp-2">
          {lead.personalization_angle}
        </div>
      )}
      {preview ? (
        <>
          {preview.subject && (
            <div className="text-xs">
              <span className="text-muted-foreground">Subject:</span> {preview.subject}
            </div>
          )}
          <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed rounded bg-secondary/40 p-3 max-h-40 overflow-y-auto">
            {preview.body}
          </pre>
        </>
      ) : (
        <div className="text-xs text-muted-foreground italic px-1">
          No draft yet — click "Build today's queue" above to draft one.
        </div>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        {preview && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCopy(
              preview.subject ? `Subject: ${preview.subject}\n\n${preview.body}` : preview.body,
              "Email copied",
            )}
          >
            <Mail className="h-3 w-3" /> Copy email
          </Button>
        )}
        <Button size="sm" onClick={() => onOpen(lead.id)}>Open lead</Button>
      </div>
    </div>
  );
}
