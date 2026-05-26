import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Copy,
  Mail,
  MessageSquareReply,
  Calendar,
  UserPlus,
  CircleSlash,
  Send,
  StickyNote,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { logAuditEvent } from "@/lib/audit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { setMeta } from "@/lib/seo";

interface OutreachLead {
  id: string;
  company: string;
  contact_name: string | null;
  contact_role: string | null;
  vertical: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  location: string | null;
  lead_source: string | null;
  lead_score: number;
  personalization_angle: string | null;
  pain_point: string | null;
  recommended_offer: string | null;
  status: string;
  date_contacted: string | null;
  follow_up_date: string | null;
  reply_text: string | null;
  demo_booked: boolean;
  beta_invited: boolean;
  real_listing_candidate: boolean;
  partner_candidate: boolean;
  interested_in_paying: string | null;
  do_not_contact: boolean;
  notes: string | null;
  next_action: string | null;
  created_at: string;
  updated_at: string;
}

interface OutreachMessage {
  id: string;
  lead_id: string;
  direction: "outbound" | "inbound";
  channel: "email" | "linkedin" | "instagram" | "phone" | "voicemail";
  subject: string | null;
  body: string;
  status: "drafted" | "approved" | "sent" | "bounced" | "replied" | "failed";
  approved: boolean;
  sent_at: string | null;
  received_at: string | null;
  created_at: string;
}

const VERTICALS = [
  "all",
  "Boat Dealer",
  "Yacht Broker",
  "Auto Dealer",
  "Exotic/Classic Auto",
  "Aircraft Broker",
  "Aviation Service",
  "Marine Surveyor",
  "Marine Mechanic",
  "Transport",
  "Marine Lender",
  "Aviation Lender",
  "Insurance",
  "Escrow/Title",
  "Buyer Advisor",
] as const;

const STATUSES = [
  "all",
  "new",
  "drafted",
  "approved",
  "sent",
  "replied",
  "demo_booked",
  "beta_invited",
  "do_not_contact",
] as const;

function scoreBadge(score: number) {
  if (score === 5) return <Badge variant="accent">Score 5</Badge>;
  if (score === 4) return <Badge variant="good">Score 4</Badge>;
  if (score === 3) return <Badge>Score 3</Badge>;
  return <Badge variant="bad">Score {score}</Badge>;
}

function statusBadge(lead: OutreachLead) {
  if (lead.do_not_contact) return <Badge variant="bad">DNC</Badge>;
  if (lead.beta_invited) return <Badge variant="accent">Beta invited</Badge>;
  if (lead.demo_booked) return <Badge variant="accent">Demo booked</Badge>;
  if (lead.status === "replied") return <Badge variant="good">Replied</Badge>;
  if (lead.status === "sent") return <Badge>Sent</Badge>;
  if (lead.status === "approved") return <Badge variant="accent">Approved</Badge>;
  if (lead.status === "drafted") return <Badge>Draft</Badge>;
  return <Badge>New</Badge>;
}

export default function AdminOutreach() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [vertical, setVertical] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [copyHint, setCopyHint] = useState<string | null>(null);

  useEffect(() => {
    setMeta({ title: "Admin · outreach", description: "TradeWind outreach autopilot." });
  }, []);

  useEffect(() => {
    if (!copyHint) return;
    const t = setTimeout(() => setCopyHint(null), 1800);
    return () => clearTimeout(t);
  }, [copyHint]);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["outreach-leads"],
    queryFn: async (): Promise<OutreachLead[]> => {
      const { data, error } = await supabase
        .from("outreach_leads")
        .select("*")
        .order("lead_score", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as OutreachLead[];
    },
  });

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (vertical !== "all" && l.vertical !== vertical) return false;
      if (status !== "all") {
        if (status === "do_not_contact" && !l.do_not_contact) return false;
        if (status === "demo_booked" && !l.demo_booked) return false;
        if (status === "beta_invited" && !l.beta_invited) return false;
        if (
          status !== "do_not_contact" &&
          status !== "demo_booked" &&
          status !== "beta_invited" &&
          l.status !== status
        ) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const haystack = [
          l.company, l.contact_name, l.email, l.vertical, l.personalization_angle, l.notes,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [leads, vertical, status, search]);

  const stats = useMemo(() => {
    const all = leads.length;
    const sent = leads.filter((l) => l.status === "sent" || l.status === "replied").length;
    const replied = leads.filter((l) => l.status === "replied").length;
    const demos = leads.filter((l) => l.demo_booked).length;
    const beta = leads.filter((l) => l.beta_invited).length;
    const dnc = leads.filter((l) => l.do_not_contact).length;
    const followUpDue = leads.filter((l) => {
      if (l.do_not_contact || l.status === "replied") return false;
      if (!l.follow_up_date) return false;
      return l.follow_up_date <= new Date().toISOString().slice(0, 10);
    }).length;
    return { all, sent, replied, demos, beta, dnc, followUpDue };
  }, [leads]);

  async function updateLead(id: string, patch: Partial<OutreachLead>) {
    setActionBusy(true);
    setActionError(null);
    try {
      const { error } = await supabase.from("outreach_leads").update(patch).eq("id", id);
      if (error) throw error;
      void logAuditEvent({
        actorId: user?.id ?? null,
        action: "outreach.lead_updated",
        targetType: "outreach_lead",
        targetId: id,
        metadata: { fields: Object.keys(patch) },
      });
      void qc.invalidateQueries({ queryKey: ["outreach-leads"] });
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not update lead");
    } finally {
      setActionBusy(false);
    }
  }

  function copy(text: string) {
    void navigator.clipboard.writeText(text);
    setCopyHint("Copied to clipboard");
  }

  const openLead = leads.find((l) => l.id === openLeadId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow">Admin · outreach autopilot</div>
        <h1 className="section-title">Outreach</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Founder-led outreach: find leads, score them, write personalized messages, approve, track, convert to beta.
          Voice rules and sequences live in <span className="font-mono">go-to-market/outreach-autopilot/</span>.
        </p>
      </div>

      {actionError && (
        <div role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {actionError}
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        <Stat label="Leads" value={stats.all} />
        <Stat label="Sent" value={stats.sent} />
        <Stat label="Replied" value={stats.replied} />
        <Stat label="Demos" value={stats.demos} />
        <Stat label="Beta" value={stats.beta} />
        <Stat label="Follow-up due" value={stats.followUpDue} highlight={stats.followUpDue > 0} />
        <Stat label="DNC" value={stats.dnc} />
      </div>

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="search" className="text-xs">Search</Label>
          <Input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Company, contact, angle…"
          />
        </div>
        <div>
          <Label htmlFor="vertical" className="text-xs">Vertical</Label>
          <select
            id="vertical"
            value={vertical}
            onChange={(e) => setVertical(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {VERTICALS.map((v) => (
              <option key={v} value={v}>{v === "all" ? "All verticals" : v}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="status" className="text-xs">Status</Label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s === "all" ? "Any status" : s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <p className="text-xs text-muted-foreground">
            Showing <span className="text-foreground font-mono">{filtered.length}</span> of {leads.length}
          </p>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="rounded-lg border border-border overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 skeleton border-b border-border last:border-0" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No outreach leads yet"
          body="Add leads via Supabase (outreach_leads table) or run the daily Claude prompt to populate the CRM."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Vertical</th>
                <th className="text-left px-4 py-3">Score</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Follow-up</th>
                <th className="text-left px-4 py-3">Angle</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const followUpDue =
                  l.follow_up_date && l.follow_up_date <= new Date().toISOString().slice(0, 10) &&
                  !l.do_not_contact && l.status !== "replied";
                return (
                  <tr key={l.id} className="border-t border-border hover:bg-secondary/40">
                    <td className="px-4 py-3">
                      <div className="font-display">{l.company}</div>
                      <div className="text-xs text-muted-foreground">
                        {l.contact_name ?? "—"}
                        {l.contact_role ? ` · ${l.contact_role}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{l.vertical}</td>
                    <td className="px-4 py-3">{scoreBadge(l.lead_score)}</td>
                    <td className="px-4 py-3">{statusBadge(l)}</td>
                    <td className="px-4 py-3 text-xs">
                      {l.follow_up_date ? (
                        <span className={followUpDue ? "text-brass-400 font-mono" : "text-muted-foreground font-mono"}>
                          {l.follow_up_date}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {l.personalization_angle ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button size="sm" variant="outline" onClick={() => setOpenLeadId(l.id)}>
                        Open
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!openLead} onOpenChange={(o) => { if (!o) setOpenLeadId(null); }}>
        <DialogContent className="max-w-2xl">
          {openLead && (
            <LeadDetail
              lead={openLead}
              onUpdate={(patch) => void updateLead(openLead.id, patch)}
              onCopy={copy}
              actionBusy={actionBusy}
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

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-md border ${highlight ? "border-brass-500/40 bg-brass-500/5" : "border-border"} px-3 py-2`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-lg">{value}</div>
    </div>
  );
}

interface LeadDetailProps {
  lead: OutreachLead;
  onUpdate: (patch: Partial<OutreachLead>) => void;
  onCopy: (text: string) => void;
  actionBusy: boolean;
}

function LeadDetail({ lead, onUpdate, onCopy, actionBusy }: LeadDetailProps) {
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [draftMsg, setDraftMsg] = useState<OutreachMessage | null>(null);
  const [messageBody, setMessageBody] = useState("");

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["outreach-messages", lead.id],
    queryFn: async (): Promise<OutreachMessage[]> => {
      const { data, error } = await supabase
        .from("outreach_messages")
        .select("*")
        .eq("lead_id", lead.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as OutreachMessage[];
    },
  });

  const latestOutbound = useMemo(
    () => messages.find((m) => m.direction === "outbound"),
    [messages],
  );

  const previewMessage = draftMsg?.body
    ?? latestOutbound?.body
    ?? "(No draft yet. Use the daily Claude command to draft a message, or paste one below.)";

  async function saveNewMessage(body: string) {
    if (!body.trim()) return;
    const { error } = await supabase.from("outreach_messages").insert({
      lead_id: lead.id,
      direction: "outbound",
      channel: "email",
      subject: null,
      body,
      status: "drafted",
      approved: false,
    });
    if (!error) {
      setMessageBody("");
      void refetchMessages();
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{lead.company}</DialogTitle>
        <DialogDescription>
          {lead.contact_name ?? "—"}
          {lead.contact_role ? ` · ${lead.contact_role}` : ""}
          {lead.location ? ` · ${lead.location}` : ""}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <Info label="Vertical" value={lead.vertical} />
          <Info label="Score" value={String(lead.lead_score)} />
          <Info label="Email" value={lead.email ?? "—"} />
          <Info label="Phone" value={lead.phone ?? "—"} />
          <Info label="Website" value={lead.website ?? "—"} />
          <Info label="LinkedIn" value={lead.linkedin_url ?? "—"} />
          <Info label="Source" value={lead.lead_source ?? "—"} />
          <Info label="Follow-up" value={lead.follow_up_date ?? "—"} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Personalization angle</Label>
          <p className="text-sm">{lead.personalization_angle ?? "—"}</p>
        </div>

        <div className="space-y-1">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Pain point / offer</Label>
          <p className="text-sm">
            <span className="text-muted-foreground">Pain: </span>{lead.pain_point ?? "—"}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Offer: </span>{lead.recommended_offer ?? "—"}
          </p>
        </div>

        <div className="rounded-md border border-border p-3 space-y-2 bg-secondary/30">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Message preview</Label>
            <Button size="sm" variant="outline" onClick={() => onCopy(previewMessage)}>
              <Copy className="h-3 w-3" /> Copy message
            </Button>
          </div>
          <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed">{previewMessage}</pre>
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-msg" className="text-xs uppercase tracking-wider text-muted-foreground">
            Paste a new draft
          </Label>
          <Textarea
            id="new-msg"
            rows={6}
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder="Paste a Claude-drafted message or write one here…"
          />
          <Button size="sm" onClick={() => void saveNewMessage(messageBody)} disabled={!messageBody.trim()}>
            <StickyNote className="h-3 w-3" /> Save draft
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-xs uppercase tracking-wider text-muted-foreground">
            Notes
          </Label>
          <Textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Pre-demo notes, objections, anything worth keeping…"
          />
          <Button size="sm" variant="outline" onClick={() => onUpdate({ notes })}>
            Save notes
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Quick actions</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => onUpdate({
                status: "sent",
                date_contacted: new Date().toISOString().slice(0, 10),
                follow_up_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
              })}
              disabled={actionBusy}
            >
              <Send className="h-3 w-3" /> Mark sent
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdate({ status: "replied" })}
              disabled={actionBusy}
            >
              <MessageSquareReply className="h-3 w-3" /> Mark replied
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdate({ demo_booked: true, status: "replied" })}
              disabled={actionBusy}
            >
              <Calendar className="h-3 w-3" /> Mark demo booked
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdate({ beta_invited: true, status: "replied" })}
              disabled={actionBusy}
            >
              <UserPlus className="h-3 w-3" /> Mark beta invited
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onUpdate({ do_not_contact: true })}
              disabled={actionBusy}
            >
              <CircleSlash className="h-3 w-3" /> Do not contact
            </Button>
          </div>
        </div>

        {messages.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Message history ({messages.length})
            </Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {messages.map((m) => (
                <div key={m.id} className="rounded-md border border-border p-2 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-muted-foreground">
                      {m.direction === "outbound" ? "→" : "←"} {m.channel} · {m.status}
                    </span>
                    <span className="text-muted-foreground">
                      {(m.sent_at ?? m.received_at ?? m.created_at).slice(0, 10)}
                    </span>
                  </div>
                  {m.subject && <div className="font-display text-xs mb-1">{m.subject}</div>}
                  <pre className="whitespace-pre-wrap font-sans line-clamp-3 text-muted-foreground">
                    {m.body}
                  </pre>
                  <div className="mt-1">
                    <button
                      type="button"
                      className="text-[10px] underline text-muted-foreground"
                      onClick={() => setDraftMsg(m)}
                    >
                      Show in preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onUpdate({ next_action: "Reviewed" })} disabled={actionBusy}>
          <CheckCircle2 className="h-3 w-3" /> Done for now
        </Button>
      </DialogFooter>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono break-all">{value}</div>
    </div>
  );
}
