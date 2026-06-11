// Lead detail dialog panel — extracted verbatim from AdminOutreach.tsx.
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  CircleSlash,
  Copy,
  Instagram,
  Linkedin,
  Mail,
  MessageSquareReply,
  Send,
  Sparkles,
  StickyNote,
  UserPlus,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { checkMessageQuality } from "@/lib/outreach/messageQuality";
import { formatInstagramDM, formatLinkedInDM } from "@/lib/outreach/csvImport";
import { daysFromNow, todayIso } from "./badges";
import type { OutreachLead, OutreachMessage } from "./types";

interface LeadDetailProps {
  lead: OutreachLead;
  onUpdate: (patch: Partial<OutreachLead>) => void;
  onCopy: (text: string, label?: string) => void;
  actionBusy: boolean;
}

export function LeadDetail({ lead, onUpdate, onCopy, actionBusy }: LeadDetailProps) {
  const qc = useQueryClient();
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [nextAction, setNextAction] = useState(lead.next_action ?? "");
  const [draftMsg, setDraftMsg] = useState<OutreachMessage | null>(null);
  const [messageBody, setMessageBody] = useState("");
  const [replyText, setReplyText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [showDemoFlow, setShowDemoFlow] = useState(false);
  const [genChannel, setGenChannel] = useState<"email" | "linkedin" | "instagram">("email");

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
    ?? "(No draft yet. Generate one or paste below.)";
  const previewSubject = draftMsg?.subject ?? latestOutbound?.subject ?? "";

  const quality = useMemo(() => checkMessageQuality(previewMessage), [previewMessage]);

  async function saveNewMessage(body: string) {
    if (!body.trim()) return;
    const q = checkMessageQuality(body);
    const { error } = await supabase.from("outreach_messages").insert({
      lead_id: lead.id,
      direction: "outbound",
      channel: "email",
      subject: null,
      body,
      status: "drafted",
      approved: false,
      ai_tone_risk_score: q.ai_tone_risk_score,
      quality_score: Math.max(0, 100 - q.ai_tone_risk_score - q.issues.length * 3),
    });
    if (!error) {
      setMessageBody("");
      void refetchMessages();
      void qc.invalidateQueries({ queryKey: ["outreach-drafts"] });
    }
  }

  async function generateMessage() {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-outreach-message", {
        body: {
          lead,
          channel: genChannel,
          vertical: lead.vertical,
          previous_messages: messages.slice(0, 3).map((m) => ({
            direction: m.direction, channel: m.channel, body: m.body,
          })),
        },
      });
      if (error) throw error;
      const out = data as {
        subject?: string; body: string; personalization_note?: string;
        cta?: string; quality_score?: number; ai_tone_risk_score?: number;
      };
      const { error: insErr, data: ins } = await supabase.from("outreach_messages").insert({
        lead_id: lead.id,
        direction: "outbound",
        channel: genChannel,
        subject: out.subject || null,
        body: out.body,
        status: "drafted",
        approved: false,
        personalization_note: out.personalization_note ?? null,
        cta: out.cta ?? null,
        quality_score: out.quality_score ?? null,
        ai_tone_risk_score: out.ai_tone_risk_score ?? null,
      }).select().single();
      if (insErr) throw insErr;
      setDraftMsg(ins as OutreachMessage);
      void refetchMessages();
      void qc.invalidateQueries({ queryKey: ["outreach-drafts"] });
    } catch (e) {
      // surface in console — the parent handles broader errors
      console.error("[outreach] generate failed:", e);
    } finally {
      setGenerating(false);
    }
  }

  async function classifyReply() {
    if (!replyText.trim()) return;
    setClassifying(true);
    try {
      const { error } = await supabase.functions.invoke("classify-outreach-reply", {
        body: { lead_id: lead.id, reply_text: replyText, channel: "email" },
      });
      if (error) throw error;
      setReplyText("");
      void qc.invalidateQueries({ queryKey: ["outreach-leads"] });
      void qc.invalidateQueries({ queryKey: ["outreach-replies"] });
    } catch (e) {
      console.error("[outreach] classify failed:", e);
    } finally {
      setClassifying(false);
    }
  }

  async function approveMessage(m: OutreachMessage) {
    const { error } = await supabase.from("outreach_messages")
      .update({ status: "approved", approved: true, approved_at: new Date().toISOString() })
      .eq("id", m.id);
    if (!error) {
      void refetchMessages();
      void qc.invalidateQueries({ queryKey: ["outreach-drafts"] });
    }
  }

  async function markSent(m: OutreachMessage) {
    await supabase.from("outreach_messages")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", m.id);
    onUpdate({
      status: "sent",
      date_contacted: todayIso(),
      follow_up_date: daysFromNow(3),
    });
    void refetchMessages();
    void qc.invalidateQueries({ queryKey: ["outreach-drafts"] });
  }

  async function skipMessage(m: OutreachMessage) {
    await supabase.from("outreach_messages").update({ status: "failed" }).eq("id", m.id);
    void refetchMessages();
    void qc.invalidateQueries({ queryKey: ["outreach-drafts"] });
  }

  async function bookDemo(when: string) {
    onUpdate({ demo_booked: true, status: "replied", next_action: `Demo booked: ${when}` });
    // upsert beta_pipeline
    await supabase.from("beta_pipeline").upsert(
      {
        lead_id: lead.id,
        stage: "demo_booked",
        demo_date: when ? new Date(when).toISOString() : null,
        beta_type: lead.real_listing_candidate ? "seller_beta" : "partner_beta",
      },
      { onConflict: "lead_id" },
    );
    setShowDemoFlow(false);
  }

  async function inviteToBeta() {
    onUpdate({ beta_invited: true, status: "replied", next_action: "Beta invite sent" });
    await supabase.from("beta_pipeline").upsert(
      {
        lead_id: lead.id,
        stage: "beta_invited",
        beta_type: lead.real_listing_candidate ? "seller_beta" : "partner_beta",
      },
      { onConflict: "lead_id" },
    );
  }

  const QUALIFYING_QUESTIONS = [
    "What does your typical buyer/seller flow look like today?",
    "Where do most of your listings come from now?",
    "What's the most painful part of selling/servicing a customer right now?",
    "If Tradewind reduced one of those, which would matter most?",
    "Would you be open to a 10-minute walkthrough? [CALENDAR_LINK]",
  ];

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

      <div className="grid gap-4 max-h-[65vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <Info label="Vertical" value={lead.vertical} />
          <Info label="Priority / Score" value={`P${lead.priority} · S${lead.lead_score}`} />
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
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Pain / offer</Label>
          <p className="text-sm"><span className="text-muted-foreground">Pain: </span>{lead.pain_point ?? "—"}</p>
          <p className="text-sm"><span className="text-muted-foreground">Offer: </span>{lead.recommended_offer ?? "—"}</p>
        </div>

        {/* Generate message */}
        <div className="rounded-md border border-border p-3 space-y-2 bg-secondary/30">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Generate message</Label>
            <div className="flex gap-2 items-center">
              <select value={genChannel} onChange={(e) => setGenChannel(e.target.value as typeof genChannel)}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                <option value="email">Email</option>
                <option value="linkedin">LinkedIn</option>
                <option value="instagram">Instagram</option>
              </select>
              <Button size="sm" onClick={() => void generateMessage()} disabled={generating}>
                <Sparkles className="h-3 w-3" /> {generating ? "Generating…" : "Generate"}
              </Button>
            </div>
          </div>
        </div>

        {/* Message preview + copy/approve */}
        <div className="rounded-md border border-border p-3 space-y-2 bg-secondary/30">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Message preview</Label>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => onCopy(
                previewSubject ? `Subject: ${previewSubject}\n\n${previewMessage}` : previewMessage,
                "Email copied",
              )}><Mail className="h-3 w-3" /> Copy email</Button>
              <Button size="sm" variant="outline" onClick={() => onCopy(formatLinkedInDM(previewMessage), "LinkedIn DM copied")}>
                <Linkedin className="h-3 w-3" /> LinkedIn DM
              </Button>
              <Button size="sm" variant="outline" onClick={() => onCopy(formatInstagramDM(previewMessage), "Instagram DM copied")}>
                <Instagram className="h-3 w-3" /> Instagram DM
              </Button>
              <Button size="sm" variant="outline" disabled title="Connect Gmail API to enable">Gmail draft</Button>
            </div>
          </div>
          {previewSubject && <div className="text-xs"><span className="text-muted-foreground">Subject:</span> {previewSubject}</div>}
          <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed">{previewMessage}</pre>
          {quality.issues.length > 0 && (
            <div className="text-[11px] text-amber-400 flex items-start gap-1">
              <AlertTriangle className="h-3 w-3 mt-0.5" />
              <span>Quality flags: {quality.issues.join(" · ")}</span>
            </div>
          )}
          {(draftMsg ?? latestOutbound) && (draftMsg ?? latestOutbound)!.status === "drafted" && (
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={() => void approveMessage((draftMsg ?? latestOutbound)!)}>
                <CheckCircle2 className="h-3 w-3" /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => void markSent((draftMsg ?? latestOutbound)!)}>
                <Send className="h-3 w-3" /> Mark sent
              </Button>
              <Button size="sm" variant="outline" onClick={() => void skipMessage((draftMsg ?? latestOutbound)!)}>
                <X className="h-3 w-3" /> Skip
              </Button>
            </div>
          )}
        </div>

        {/* Paste a draft */}
        <div className="space-y-2">
          <Label htmlFor="new-msg" className="text-xs uppercase tracking-wider text-muted-foreground">Paste a draft</Label>
          <Textarea id="new-msg" rows={6} value={messageBody} onChange={(e) => setMessageBody(e.target.value)}
            placeholder="Or paste a Claude-drafted message here…" />
          <Button size="sm" onClick={() => void saveNewMessage(messageBody)} disabled={!messageBody.trim()}>
            <StickyNote className="h-3 w-3" /> Save draft
          </Button>
        </div>

        {/* Classify a reply */}
        <div className="space-y-2 rounded-md border border-border p-3">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Got a reply? Paste + classify</Label>
          <Textarea rows={4} value={replyText} onChange={(e) => setReplyText(e.target.value)}
            placeholder="Paste the recipient's reply text…" />
          <Button size="sm" onClick={() => void classifyReply()} disabled={!replyText.trim() || classifying}>
            <MessageSquareReply className="h-3 w-3" /> {classifying ? "Classifying…" : "Classify reply"}
          </Button>
        </div>

        {/* Notes + next action */}
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1">
            <Label htmlFor="next-action" className="text-xs uppercase tracking-wider text-muted-foreground">Next action</Label>
            <Input id="next-action" value={nextAction} onChange={(e) => setNextAction(e.target.value)} placeholder="e.g. Send LinkedIn DM Tuesday" />
            <Button size="sm" variant="outline" onClick={() => onUpdate({ next_action: nextAction })}>Save</Button>
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes" className="text-xs uppercase tracking-wider text-muted-foreground">Notes</Label>
            <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button size="sm" variant="outline" onClick={() => onUpdate({ notes })}>Save notes</Button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Quick actions</Label>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => onUpdate({
              status: "sent", date_contacted: todayIso(), follow_up_date: daysFromNow(3),
            })} disabled={actionBusy}>
              <Send className="h-3 w-3" /> Mark sent
            </Button>
            <Button size="sm" variant="outline" onClick={() => onUpdate({ status: "replied" })} disabled={actionBusy}>
              <MessageSquareReply className="h-3 w-3" /> Mark replied
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowDemoFlow(true)} disabled={actionBusy}>
              <Calendar className="h-3 w-3" /> Book demo
            </Button>
            <Button size="sm" variant="outline" onClick={() => void inviteToBeta()} disabled={actionBusy}>
              <UserPlus className="h-3 w-3" /> Invite to beta
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onUpdate({ do_not_contact: true })} disabled={actionBusy}>
              <CircleSlash className="h-3 w-3" /> Do not contact
            </Button>
          </div>
        </div>

        {/* Demo flow */}
        {showDemoFlow && (
          <div className="rounded-md border border-brass-500/30 bg-brass-500/5 p-3 space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Demo booking</div>
            <p className="text-xs">Ask these qualifying questions, then offer the calendar link [CALENDAR_LINK]:</p>
            <ul className="text-xs list-disc ml-4 space-y-1 text-muted-foreground">
              {QUALIFYING_QUESTIONS.map((q) => <li key={q}>{q}</li>)}
            </ul>
            <div className="flex gap-2 items-center">
              <Input
                type="datetime-local"
                onChange={(e) => void bookDemo(e.target.value)}
                className="max-w-xs"
              />
              <Button size="sm" variant="outline" onClick={() => onCopy(QUALIFYING_QUESTIONS.join("\n"), "Qualifying questions copied")}>
                <Copy className="h-3 w-3" /> Copy questions
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowDemoFlow(false)}>Close</Button>
            </div>
          </div>
        )}

        {/* History */}
        {messages.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Message history ({messages.length})</Label>
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
                  <pre className="whitespace-pre-wrap font-sans line-clamp-3 text-muted-foreground">{m.body}</pre>
                  <button type="button" className="text-[10px] underline text-muted-foreground mt-1"
                    onClick={() => setDraftMsg(m)}>Show in preview</button>
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
