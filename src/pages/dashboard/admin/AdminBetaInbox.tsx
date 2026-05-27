import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Inbox,
  CheckCircle2,
  Copy,
  Calendar,
  UserCheck,
  CircleSlash,
  Sparkles,
  Mail,
  ExternalLink,
  Bell,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { logAuditEvent } from "@/lib/audit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { setMeta } from "@/lib/seo";
import {
  REPLY_TEMPLATES,
  REPLY_TEMPLATE_ORDER,
  formatReplyForClipboard,
  type ReplyTemplateKey,
} from "@/lib/outreach/replyTemplates";

// ── types ────────────────────────────────────────────────────────────────────

type BetaFeedbackStatus =
  | "new"
  | "reviewed"
  | "interested"
  | "demo_requested"
  | "beta_invited"
  | "not_a_fit"
  | "archived";

interface BetaFeedback {
  id: string;
  name: string;
  email: string;
  company: string | null;
  role: string | null;
  vertical: string;
  tested: string | null;
  useful: string | null;
  confusing: string | null;
  beta_partner: "yes" | "no" | "maybe";
  feedback_call: "yes" | "no" | "maybe";
  status: BetaFeedbackStatus;
  lead_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_page: string | null;
  user_agent: string | null;
  created_at: string;
}

interface OutreachLeadLite {
  id: string;
  company: string;
  contact_name: string | null;
  vertical: string;
  email: string | null;
  personalization_angle: string | null;
  pain_point: string | null;
  recommended_offer: string | null;
  priority: number;
}

const STATUS_OPTIONS: { value: BetaFeedbackStatus | "all"; label: string }[] = [
  { value: "all", label: "Any status" },
  { value: "new", label: "New / unreviewed" },
  { value: "reviewed", label: "Reviewed" },
  { value: "interested", label: "Interested" },
  { value: "demo_requested", label: "Demo requested" },
  { value: "beta_invited", label: "Beta invited" },
  { value: "not_a_fit", label: "Not a fit" },
  { value: "archived", label: "Archived" },
];

const CALL_OPTIONS = [
  { value: "all", label: "Any call interest" },
  { value: "yes", label: "Wants a call" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "No call" },
];

function statusBadge(s: BetaFeedbackStatus) {
  switch (s) {
    case "new":
      return <Badge variant="accent">New</Badge>;
    case "reviewed":
      return <Badge>Reviewed</Badge>;
    case "interested":
      return <Badge variant="good">Interested</Badge>;
    case "demo_requested":
      return <Badge variant="good">Demo requested</Badge>;
    case "beta_invited":
      return <Badge variant="accent">Beta invited</Badge>;
    case "not_a_fit":
      return <Badge variant="bad">Not a fit</Badge>;
    case "archived":
      return <Badge>Archived</Badge>;
  }
}

function callBadge(c: "yes" | "no" | "maybe") {
  if (c === "yes") return <Badge variant="good">Call: yes</Badge>;
  if (c === "maybe") return <Badge variant="accent">Call: maybe</Badge>;
  return <Badge>Call: no</Badge>;
}

// ── main ─────────────────────────────────────────────────────────────────────

export default function AdminBetaInbox() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [verticalFilter, setVerticalFilter] = useState<string>("all");
  const [callFilter, setCallFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [demoPrepId, setDemoPrepId] = useState<string | null>(null);
  const [copyHint, setCopyHint] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setMeta({ title: "Admin · beta inbox", description: "Inbound beta feedback + conversion workflow." });
  }, []);

  useEffect(() => {
    if (!copyHint) return;
    const t = setTimeout(() => setCopyHint(null), 1800);
    return () => clearTimeout(t);
  }, [copyHint]);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["beta-feedback"],
    queryFn: async (): Promise<BetaFeedback[]> => {
      const { data, error } = await supabase
        .from("beta_feedback")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as BetaFeedback[];
    },
  });

  // Hydrate linked outreach leads in one shot (small set — admin view).
  const linkedLeadIds = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => { if (r.lead_id) s.add(r.lead_id); });
    return Array.from(s);
  }, [rows]);

  const { data: leads = [] } = useQuery({
    queryKey: ["beta-feedback-leads", linkedLeadIds.join(",")],
    enabled: linkedLeadIds.length > 0,
    queryFn: async (): Promise<OutreachLeadLite[]> => {
      const { data, error } = await supabase
        .from("outreach_leads")
        .select("id, company, contact_name, vertical, email, personalization_angle, pain_point, recommended_offer, priority")
        .in("id", linkedLeadIds);
      if (error) throw error;
      return (data ?? []) as OutreachLeadLite[];
    },
  });

  const leadById = useMemo(() => {
    const m = new Map<string, OutreachLeadLite>();
    leads.forEach((l) => m.set(l.id, l));
    return m;
  }, [leads]);

  const verticals = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => set.add(r.vertical));
    return ["all", ...Array.from(set).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (verticalFilter !== "all" && r.vertical !== verticalFilter) return false;
      if (callFilter !== "all" && r.feedback_call !== callFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const haystack = [
          r.name, r.email, r.company, r.role, r.vertical,
          r.utm_campaign, r.tested, r.useful, r.confusing,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [rows, statusFilter, verticalFilter, callFilter, search]);

  const stats = useMemo(() => {
    const total = rows.length;
    const unreviewed = rows.filter((r) => r.status === "new").length;
    const betaInterested = rows.filter(
      (r) => r.beta_partner === "yes" || r.status === "interested",
    ).length;
    const callRequested = rows.filter((r) => r.feedback_call === "yes").length;
    const linkedToOutreach = rows.filter((r) => !!r.lead_id).length;
    return { total, unreviewed, betaInterested, callRequested, linkedToOutreach };
  }, [rows]);

  async function updateStatus(id: string, status: BetaFeedbackStatus) {
    setActionError(null);
    const { error } = await supabase
      .from("beta_feedback")
      .update({ status })
      .eq("id", id);
    if (error) {
      setActionError(error.message);
      return;
    }
    void logAuditEvent({
      actorId: user?.id ?? null,
      action: "beta_feedback.status_updated",
      targetType: "beta_feedback",
      targetId: id,
      metadata: { status },
    });
    void qc.invalidateQueries({ queryKey: ["beta-feedback"] });
  }

  function copy(text: string, label = "Copied to clipboard") {
    void navigator.clipboard.writeText(text);
    setCopyHint(label);
  }

  function copyResponseEmail(row: BetaFeedback) {
    // Default to the "interested" template — it's the canonical first
    // response and what the operator wants 90% of the time.
    const t = REPLY_TEMPLATES.interested;
    const greeting = row.name ? `Hi ${row.name.split(" ")[0]},\n\n` : "";
    const text = `To: ${row.email}\nSubject: ${t.subject}\n\n${greeting}${t.body}`;
    copy(text, "Response email copied");
  }

  const openRow = rows.find((r) => r.id === openId) ?? null;
  const demoPrepRow = rows.find((r) => r.id === demoPrepId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow">Admin · inbound beta</div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="section-title">Beta inbox</h1>
          <Badge variant="accent" title="Submissions from /feedback. Triggered admin notifications also land here.">
            <Bell className="h-3 w-3 mr-1" /> Inbound
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Every /feedback submission lands here. Mark reviewed, flag the strong fits,
          copy the response email, and convert into a demo.
        </p>
      </div>

      {actionError && (
        <div role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <Kpi label="Total submissions" value={stats.total} />
        <Kpi label="Beta interested" value={stats.betaInterested} tone={stats.betaInterested > 0 ? "good" : undefined} />
        <Kpi label="Call requested" value={stats.callRequested} tone={stats.callRequested > 0 ? "good" : undefined} />
        <Kpi label="Linked to outreach" value={stats.linkedToOutreach} />
        <Kpi label="Unreviewed" value={stats.unreviewed} highlight={stats.unreviewed > 0} />
      </div>

      <Filters
        verticals={verticals}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        verticalFilter={verticalFilter} setVerticalFilter={setVerticalFilter}
        callFilter={callFilter} setCallFilter={setCallFilter}
        search={search} setSearch={setSearch}
        shown={filtered.length} total={rows.length}
      />

      {isLoading ? (
        <div className="rounded-lg border border-border overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 skeleton border-b border-border last:border-0" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No matching submissions"
          body={rows.length === 0
            ? "Submissions to /feedback will appear here. Nothing has come in yet."
            : "Adjust the filters above to see more."}
        />
      ) : (
        <FeedbackTable
          rows={filtered}
          leadById={leadById}
          onOpen={(id) => setOpenId(id)}
          onPrepareDemo={(id) => setDemoPrepId(id)}
          onMark={(id, s) => void updateStatus(id, s)}
          onCopyResponse={(row) => copyResponseEmail(row)}
        />
      )}

      <Dialog open={!!openRow} onOpenChange={(o) => { if (!o) setOpenId(null); }}>
        <DialogContent className="max-w-2xl">
          {openRow && (
            <FeedbackDetail
              row={openRow}
              lead={openRow.lead_id ? leadById.get(openRow.lead_id) ?? null : null}
              onMark={(s) => void updateStatus(openRow.id, s)}
              onCopy={copy}
              onCopyResponse={() => copyResponseEmail(openRow)}
              onPrepareDemo={() => { setOpenId(null); setDemoPrepId(openRow.id); }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!demoPrepRow} onOpenChange={(o) => { if (!o) setDemoPrepId(null); }}>
        <DialogContent className="max-w-2xl">
          {demoPrepRow && (
            <DemoPrepCard
              row={demoPrepRow}
              lead={demoPrepRow.lead_id ? leadById.get(demoPrepRow.lead_id) ?? null : null}
              onCopy={copy}
              onClose={() => setDemoPrepId(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {copyHint && (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-md border border-brass-500/30 bg-brass-500/10 text-brass-200 px-3 py-2 text-xs shadow-lg"
        >
          {copyHint}
        </div>
      )}
    </div>
  );
}

// ── filters ──────────────────────────────────────────────────────────────────

function Filters({
  verticals,
  statusFilter, setStatusFilter,
  verticalFilter, setVerticalFilter,
  callFilter, setCallFilter,
  search, setSearch,
  shown, total,
}: {
  verticals: string[];
  statusFilter: string; setStatusFilter: (s: string) => void;
  verticalFilter: string; setVerticalFilter: (s: string) => void;
  callFilter: string; setCallFilter: (s: string) => void;
  search: string; setSearch: (s: string) => void;
  shown: number; total: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <div>
        <Label htmlFor="bi-search" className="text-xs">Search</Label>
        <input
          id="bi-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name, email, company, campaign…"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>
      <div>
        <Label htmlFor="bi-status" className="text-xs">Status</Label>
        <select
          id="bi-status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="bi-vertical" className="text-xs">Vertical</Label>
        <select
          id="bi-vertical"
          value={verticalFilter}
          onChange={(e) => setVerticalFilter(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {verticals.map((v) => (
            <option key={v} value={v}>{v === "all" ? "Any vertical" : v.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="bi-call" className="text-xs">Call interest</Label>
        <select
          id="bi-call"
          value={callFilter}
          onChange={(e) => setCallFilter(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {CALL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="flex items-end">
        <p className="text-xs text-muted-foreground">
          <span className="text-foreground font-mono">{shown}</span> / {total}
        </p>
      </div>
    </div>
  );
}

// ── KPI ──────────────────────────────────────────────────────────────────────

function Kpi({
  label,
  value,
  highlight,
  tone,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  tone?: "good" | "warn" | "bad";
}) {
  const toneClasses =
    tone === "good"
      ? "border-emerald-500/40 bg-emerald-500/5"
      : tone === "warn"
        ? "border-brass-500/40 bg-brass-500/5"
        : tone === "bad"
          ? "border-red-500/40 bg-red-500/5"
          : highlight
            ? "border-brass-500/40 bg-brass-500/5"
            : "border-border";
  const valueColor =
    tone === "good"
      ? "text-emerald-300"
      : tone === "warn"
        ? "text-brass-400"
        : tone === "bad"
          ? "text-red-300"
          : "";
  return (
    <div className={`rounded-md border ${toneClasses} px-3 py-2`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-mono text-lg ${valueColor}`}>{value}</div>
    </div>
  );
}

// ── table ────────────────────────────────────────────────────────────────────

function FeedbackTable({
  rows, leadById, onOpen, onPrepareDemo, onMark, onCopyResponse,
}: {
  rows: BetaFeedback[];
  leadById: Map<string, OutreachLeadLite>;
  onOpen: (id: string) => void;
  onPrepareDemo: (id: string) => void;
  onMark: (id: string, s: BetaFeedbackStatus) => void;
  onCopyResponse: (row: BetaFeedback) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="text-left px-4 py-3">Submitter</th>
            <th className="text-left px-4 py-3">Vertical / role</th>
            <th className="text-left px-4 py-3">Interest</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-left px-4 py-3">Attribution</th>
            <th className="text-left px-4 py-3">When</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const lead = r.lead_id ? leadById.get(r.lead_id) : null;
            return (
              <tr key={r.id} className="border-t border-border hover:bg-secondary/40 align-top">
                <td className="px-4 py-3">
                  <div className="font-display">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.email}</div>
                  {r.company && (
                    <div className="text-xs text-muted-foreground mt-0.5">{r.company}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  <div>{r.vertical.replace(/_/g, " ")}</div>
                  {r.role && <div className="text-[11px] mt-0.5">{r.role}</div>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant={
                        r.beta_partner === "yes" ? "good" :
                        r.beta_partner === "maybe" ? "accent" : "default"
                      }
                    >
                      Beta: {r.beta_partner}
                    </Badge>
                    {callBadge(r.feedback_call)}
                  </div>
                </td>
                <td className="px-4 py-3">{statusBadge(r.status)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {r.utm_campaign ? (
                    <div className="font-mono text-[11px]">{r.utm_campaign}</div>
                  ) : (
                    <span>—</span>
                  )}
                  {lead && (
                    <div className="mt-1 text-[11px]">
                      <span className="text-brass-400">lead:</span> {lead.company}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono whitespace-nowrap">
                  {new Date(r.created_at).toLocaleString(undefined, {
                    month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex flex-wrap gap-1 justify-end">
                    <Button size="sm" variant="outline" onClick={() => onOpen(r.id)}>Open</Button>
                    <Button size="sm" variant="outline" onClick={() => onCopyResponse(r)} title="Copy response email">
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onPrepareDemo(r.id)} title="Prepare demo">
                      <Sparkles className="h-3 w-3" />
                    </Button>
                    {r.status === "new" && (
                      <Button size="sm" onClick={() => onMark(r.id, "reviewed")} title="Mark reviewed">
                        <CheckCircle2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── detail dialog ────────────────────────────────────────────────────────────

function FeedbackDetail({
  row, lead, onMark, onCopy, onCopyResponse, onPrepareDemo,
}: {
  row: BetaFeedback;
  lead: OutreachLeadLite | null;
  onMark: (s: BetaFeedbackStatus) => void;
  onCopy: (text: string, label?: string) => void;
  onCopyResponse: () => void;
  onPrepareDemo: () => void;
}) {
  const [templateKey, setTemplateKey] = useState<ReplyTemplateKey>("interested");
  const template = REPLY_TEMPLATES[templateKey];

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {row.name}
          {statusBadge(row.status)}
        </DialogTitle>
        <DialogDescription>
          {row.email}
          {row.company ? ` · ${row.company}` : ""}
          {row.role ? ` · ${row.role}` : ""}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Kv k="Vertical" v={row.vertical.replace(/_/g, " ")} />
          <Kv k="Beta interest" v={row.beta_partner} />
          <Kv k="10-min call" v={row.feedback_call} />
          <Kv k="UTM campaign" v={row.utm_campaign ?? "—"} />
          <Kv k="UTM source / medium" v={[row.utm_source, row.utm_medium].filter(Boolean).join(" / ") || "—"} />
          <Kv k="Submitted" v={new Date(row.created_at).toLocaleString()} />
        </div>

        {(row.tested || row.useful || row.confusing) && (
          <div className="grid gap-3 rounded-md border border-border bg-secondary/30 p-3">
            {row.tested && <Field k="What they tested" v={row.tested} />}
            {row.useful && <Field k="What felt useful" v={row.useful} />}
            {row.confusing && <Field k="What felt confusing / missing" v={row.confusing} />}
          </div>
        )}

        {lead && (
          <div className="rounded-md border border-brass-500/30 bg-brass-500/5 p-3 text-xs space-y-1">
            <div className="font-display text-foreground flex items-center gap-2">
              <ExternalLink className="h-3 w-3" /> Linked outreach lead
            </div>
            <div className="text-muted-foreground">
              {lead.company} · {lead.vertical} · P{lead.priority}
            </div>
            {lead.personalization_angle && (
              <div className="text-foreground/90 italic">"{lead.personalization_angle}"</div>
            )}
            <a
              href={`/admin/outreach?lead=${lead.id}`}
              className="text-brass-400 hover:text-brass-300 inline-flex items-center gap-1"
            >
              Open in outreach <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {(row.referrer || row.landing_page) && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer">Attribution details</summary>
            <div className="mt-2 grid gap-1">
              {row.landing_page && <Kv k="Landing page" v={row.landing_page} />}
              {row.referrer && <Kv k="Referrer" v={row.referrer} />}
              {row.utm_term && <Kv k="UTM term" v={row.utm_term} />}
              {row.utm_content && <Kv k="UTM content" v={row.utm_content} />}
            </div>
          </details>
        )}

        <div className="rounded-md border border-border p-3 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Label htmlFor="bi-template" className="text-xs">Reply template</Label>
            <select
              id="bi-template"
              value={templateKey}
              onChange={(e) => setTemplateKey(e.target.value as ReplyTemplateKey)}
              className="h-9 rounded-md border border-input bg-background px-2 text-xs"
            >
              {REPLY_TEMPLATE_ORDER.map((k) => (
                <option key={k} value={k}>{REPLY_TEMPLATES[k].label}</option>
              ))}
            </select>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Subject:</span> {template.subject}
          </div>
          <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed rounded bg-secondary/40 p-3 max-h-48 overflow-y-auto">
            {template.body}
          </pre>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopy(formatReplyForClipboard(templateKey), "Reply copied")}
            >
              <Copy className="h-3 w-3" /> Copy reply
            </Button>
            <Button size="sm" variant="outline" onClick={onCopyResponse}>
              <Mail className="h-3 w-3" /> Copy default response email
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" variant="outline" onClick={() => onMark("reviewed")}>
            <CheckCircle2 className="h-3 w-3" /> Mark reviewed
          </Button>
          <Button size="sm" variant="outline" onClick={() => onMark("interested")}>
            <UserCheck className="h-3 w-3" /> Mark interested
          </Button>
          <Button size="sm" variant="outline" onClick={() => onMark("demo_requested")}>
            <Calendar className="h-3 w-3" /> Mark demo requested
          </Button>
          <Button size="sm" onClick={() => onMark("beta_invited")}>
            <Sparkles className="h-3 w-3" /> Mark beta invited
          </Button>
          <Button size="sm" variant="outline" onClick={() => onMark("not_a_fit")}>
            <CircleSlash className="h-3 w-3" /> Mark not a fit
          </Button>
          <Button size="sm" variant="outline" className="ml-auto" onClick={onPrepareDemo}>
            <Sparkles className="h-3 w-3" /> Prepare demo
          </Button>
        </div>
      </div>
    </>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="text-xs">
      <span className="text-muted-foreground uppercase tracking-wider text-[10px]">{k}</span>
      <div className="font-mono break-all">{v}</div>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="text-sm whitespace-pre-wrap">{v}</div>
    </div>
  );
}

// ── demo prep card ───────────────────────────────────────────────────────────
//
// What to show in a 10-minute demo, tailored by vertical. The vertical
// keys come from FeedbackPage and from outreach_leads.vertical (which
// uses different strings, so we normalize). Falls back to a generic
// agenda when the vertical isn't recognized.

interface DemoPlan {
  pain: string;
  show: string[];
  questions: string[];
}

function demoPlanFor(verticalRaw: string, feedbackPain: string | null, leadPain: string | null): DemoPlan {
  const v = verticalRaw.toLowerCase();
  const explicitPain = (leadPain || feedbackPain || "").trim();

  if (v.includes("marine") || v.includes("boat") || v.includes("yacht")) {
    return {
      pain: explicitPain || "Listings drowning in low-intent leads, deals stuck in email + PDF.",
      show: [
        "Create a yacht listing (Beneteau / Sea Ray / similar) with the photo-fast flow",
        "Buyer-request match: a real buyer request that fits the listing",
        "Deal room: survey, sea trial, escrow, transport — all in one place",
        "Verified dealer profile + founding-partner badge",
      ],
      questions: [
        "Of the leads you get today, what fraction actually close?",
        "Where do deals stall — survey, sea trial, financing, transport?",
        "What's the one report or doc your buyers always ask for?",
      ],
    };
  }
  if (v.includes("aircraft") || v.includes("aviation")) {
    return {
      pain: explicitPain || "Compliance-heavy listings, every buyer asks for the same TT/SMOH proof.",
      show: [
        "Aircraft listing with N-number, TT, SMOH, avionics, last annual",
        "Asset Passport: damage history + maintenance attestation",
        "Buyer inquiry → deal room with pre-purchase inspection workflow",
        "Compliance-aware messaging and audit log",
      ],
      questions: [
        "How are you handling damage history disclosures today?",
        "Where do most aircraft deals fall apart — pre-buy, escrow, ferry?",
        "Do you co-broker? Where does that handoff break?",
      ],
    };
  }
  if (v.includes("auto") || v.includes("exotic") || v.includes("classic")) {
    return {
      pain: explicitPain || "Tire-kickers, lowball offers, and inventory lost in generic classifieds.",
      show: [
        "Specialty auto listing with build sheet / mods / provenance",
        "Filtered buyer audience — qualified, not just curious",
        "Deal room: PPI, transport, escrow, lender intro",
        "Founding-partner badge and dealer profile",
      ],
      questions: [
        "What % of inquiries are real buyers vs. tire-kickers?",
        "How do you handle transport on out-of-state sales today?",
        "What inventory line do you wish moved faster?",
      ],
    };
  }
  if (v.includes("service") || v.includes("surveyor") || v.includes("mechanic") || v.includes("transport") || v.includes("inspection")) {
    return {
      pain: explicitPain || "Service work is scattered across phone, email, PDFs; quoting is slow.",
      show: [
        "Service-provider profile in the directory (the buyer's view)",
        "How service leads route from listing + buyer requests",
        "Quoting + scheduling inside a deal room",
        "Reviews and verified-provider badge",
      ],
      questions: [
        "Where do most service leads come from today?",
        "Where does the quoting → scheduling handoff break?",
        "What would 5 extra qualified inspections per month be worth to you?",
      ],
    };
  }
  if (v.includes("lender") || v.includes("insurance") || v.includes("escrow")) {
    return {
      pain: explicitPain || "Pre-qualified intros are rare; most leads are unqualified noise.",
      show: [
        "How pre-qualified buyer requests carry budget + intent into the deal room",
        "Partner placement on relevant listings",
        "Compliance-aware data sharing + audit log",
      ],
      questions: [
        "What % of partner-routed leads close vs. open-market leads?",
        "Where in the funnel do you want TradeWind to send you the lead?",
        "Any regulatory constraints we need to design around?",
      ],
    };
  }
  if (v.includes("buyer")) {
    return {
      pain: explicitPain || "Finding a real listing, getting a real seller on the phone, closing without surprises.",
      show: [
        "Buyer request flow — describe what you want, get matched listings",
        "Comparison + saved searches",
        "Deal room: messages, inspection, transport, escrow",
        "Asset Passport: independent verification of what you're buying",
      ],
      questions: [
        "What's frustrated you most in your last search?",
        "What's your timeline and budget?",
        "Where do you want help — sourcing, inspection, transport, financing?",
      ],
    };
  }
  return {
    pain: explicitPain || "Marketplace fragmentation — too many tools, too many tabs, too much trust friction.",
    show: [
      "Listing creation flow",
      "Buyer-request matching",
      "Deal room",
      "Verified profile + trust tools",
    ],
    questions: [
      "What part of your current process do you want to fix first?",
      "Where do deals stall today?",
      "What would 10x your current pipeline look like for you?",
    ],
  };
}

function DemoPrepCard({
  row, lead, onCopy, onClose,
}: {
  row: BetaFeedback;
  lead: OutreachLeadLite | null;
  onCopy: (text: string, label?: string) => void;
  onClose: () => void;
}) {
  const plan = useMemo(
    () => demoPlanFor(row.vertical, row.confusing, lead?.pain_point ?? null),
    [row, lead],
  );
  const followUpTemplate = REPLY_TEMPLATES.wants_demo;
  const close = "What would make this actually useful for your side of the business?";
  const company = row.company ?? lead?.company ?? "—";
  const role = row.role ?? "—";

  function copyBrief() {
    const lines = [
      `Demo prep — ${row.name} (${row.email})`,
      `Company: ${company} · Role: ${role} · Vertical: ${row.vertical}`,
      "",
      `Likely pain point:`,
      `  ${plan.pain}`,
      "",
      `What to show (10 min):`,
      ...plan.show.map((s) => `  • ${s}`),
      "",
      `Discovery questions:`,
      ...plan.questions.map((q) => `  • ${q}`),
      "",
      `Close with:`,
      `  ${close}`,
      "",
      `Post-demo follow-up:`,
      `  Subject: ${followUpTemplate.subject}`,
      `  ${followUpTemplate.body.split("\n").join("\n  ")}`,
    ];
    onCopy(lines.join("\n"), "Demo brief copied");
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brass-400" /> Prepare demo — {row.name}
        </DialogTitle>
        <DialogDescription>
          10-minute walkthrough plan for {company}. Pulled from their feedback +
          linked outreach lead.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <Kv k="Company" v={company} />
          <Kv k="Vertical" v={row.vertical.replace(/_/g, " ")} />
          <Kv k="Role" v={role} />
        </div>

        <div className="rounded-md border border-brass-500/30 bg-brass-500/5 p-3">
          <div className="text-[10px] uppercase tracking-wider text-brass-400 mb-1">Likely pain point</div>
          <div className="text-sm leading-relaxed">{plan.pain}</div>
        </div>

        <div className="rounded-md border border-border p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">What to show (10 min)</div>
          <ul className="space-y-1.5">
            {plan.show.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brass-400 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md border border-border p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">3 discovery questions</div>
          <ol className="space-y-1.5 list-decimal list-inside">
            {plan.questions.map((q) => (
              <li key={q} className="text-sm">{q}</li>
            ))}
          </ol>
        </div>

        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
          <div className="text-[10px] uppercase tracking-wider text-emerald-400 mb-1">Recommended close</div>
          <div className="text-sm italic">"{close}"</div>
        </div>

        <div className="rounded-md border border-border p-3 space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Post-demo follow-up</div>
          <div className="text-xs">
            <span className="text-muted-foreground">Subject:</span> {followUpTemplate.subject}
          </div>
          <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed rounded bg-secondary/40 p-3 max-h-40 overflow-y-auto">
            {followUpTemplate.body}
          </pre>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCopy(formatReplyForClipboard("wants_demo"), "Follow-up copied")}
          >
            <Copy className="h-3 w-3" /> Copy follow-up
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" onClick={copyBrief}>
            <Copy className="h-3 w-3" /> Copy full brief
          </Button>
          <Button size="sm" variant="outline" onClick={onClose} className="ml-auto">
            Close
          </Button>
        </div>
      </div>
    </>
  );
}
