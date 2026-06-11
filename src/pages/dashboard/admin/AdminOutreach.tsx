// Admin outreach dashboard — orchestrator. The tab panels, dialogs, badges,
// constants, types, and data queries live in ./outreach/* (mechanically
// decomposed from the original single-file implementation; behavior
// unchanged).
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Plus, Sparkles, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { logAuditEvent } from "@/lib/audit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { setMeta } from "@/lib/seo";
import { CAMPAIGN_DAILY_CAP, CAMPAIGN_NAME, CAMPAIGN_TARGET } from "./outreach/constants";
import { computeOutreachStats, useOutreachData } from "./outreach/useOutreachData";
import { ComplianceBanner, DailyCapIndicator, Kpi } from "./outreach/widgets";
import { Filters, LeadsTable } from "./outreach/LeadsTab";
import { PriorityQueueView } from "./outreach/PriorityQueueTab";
import { QueueView } from "./outreach/QueueTab";
import { FollowupsView } from "./outreach/FollowupsTab";
import { RepliesView } from "./outreach/RepliesTab";
import { BetaPipelineView } from "./outreach/BetaPipelineTab";
import { AddLeadForm } from "./outreach/AddLeadForm";
import { CsvImportPanel } from "./outreach/CsvImportPanel";
import { LeadDetail } from "./outreach/LeadDetail";
import type { OutreachLead } from "./outreach/types";

export default function AdminOutreach() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [tab, setTab] = useState<"leads" | "priority" | "queue" | "followups" | "replies" | "beta">("leads");
  const [vertical, setVertical] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [hideDnc, setHideDnc] = useState(true);
  const [search, setSearch] = useState("");
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [copyHint, setCopyHint] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [buildingQueue, setBuildingQueue] = useState(false);
  const [buildSummary, setBuildSummary] = useState<string | null>(null);

  useEffect(() => {
    setMeta({ title: "Admin · outreach", description: "Tradewind outreach autopilot." });
  }, []);

  useEffect(() => {
    if (!copyHint) return;
    const t = setTimeout(() => setCopyHint(null), 1800);
    return () => clearTimeout(t);
  }, [copyHint]);

  const { leads, isLoading, draftMessages, deliveryStats, followups, replies, betaRows } = useOutreachData();

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (hideDnc && l.do_not_contact) return false;
      if (vertical !== "all" && l.vertical !== vertical) return false;
      if (priorityFilter !== "all" && l.priority !== Number(priorityFilter)) return false;
      if (verificationFilter !== "all") {
        const v = l.email_verification_status ?? "unverified";
        if (v !== verificationFilter) return false;
      }
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
          l.company, l.contact_name, l.email, l.vertical, l.personalization_angle, l.notes, l.location,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [leads, vertical, status, priorityFilter, verificationFilter, hideDnc, search]);

  const stats = useMemo(
    () => computeOutreachStats(leads, deliveryStats, followups, draftMessages, replies),
    [leads, deliveryStats, followups, draftMessages, replies],
  );

  const dailyCapHit = stats.sentToday >= CAMPAIGN_DAILY_CAP;

  const bounceRateHigh = stats.bounceRatePct > 15;

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
      // also log to outreach_activity_log (best-effort)
      void supabase.from("outreach_activity_log").insert({
        lead_id: id,
        action: "lead_updated",
        metadata: { fields: Object.keys(patch) },
      }).then(({ error: logErr }) => {
        if (logErr) console.warn("[outreach] activity log insert failed", logErr);
      });
      void qc.invalidateQueries({ queryKey: ["outreach-leads"] });
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not update lead");
    } finally {
      setActionBusy(false);
    }
  }

  async function buildTodaysQueue() {
    setBuildingQueue(true);
    setBuildSummary(null);
    setActionError(null);
    try {
      const { data, error } = await supabase.functions.invoke("build-daily-queue", {
        body: { limit: 10, channel: "email" },
      });
      if (error) throw error;
      const r = data as { drafted: number; follow_ups_created: number; skipped: number; errors: string[] };
      setBuildSummary(
        `Drafted ${r.drafted} · Skipped ${r.skipped} · Follow-ups ${r.follow_ups_created}` +
        (r.errors?.length ? ` · Errors ${r.errors.length}` : ""),
      );
      void qc.invalidateQueries({ queryKey: ["outreach-drafts"] });
      void qc.invalidateQueries({ queryKey: ["outreach-leads"] });
      void qc.invalidateQueries({ queryKey: ["outreach-followups"] });
      void qc.invalidateQueries({ queryKey: ["outreach-delivery-stats"] });
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Build queue failed");
    } finally {
      setBuildingQueue(false);
    }
  }

  function copy(text: string, label = "Copied to clipboard") {
    void navigator.clipboard.writeText(text);
    setCopyHint(label);
  }

  const openLead = leads.find((l) => l.id === openLeadId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow">Admin · outreach autopilot</div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="section-title">Outreach</h1>
          <Badge variant="accent" title="The current named campaign — see go-to-market/outreach-autopilot/100_LEAD_CAMPAIGN_STATUS.md">
            Campaign: {CAMPAIGN_NAME}
          </Badge>
          <Badge variant={stats.total >= CAMPAIGN_TARGET ? "good" : undefined} title="Total leads loaded vs the 100-lead campaign target">
            {stats.total} / {CAMPAIGN_TARGET} leads
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Founder-led outreach: find leads, draft personalized messages, approve, send, track replies, convert to beta.
        </p>
      </div>

      <ComplianceBanner />

      <DailyCapIndicator sentToday={stats.sentToday} cap={CAMPAIGN_DAILY_CAP} hit={dailyCapHit} />

      {bounceRateHigh && (
        <div
          role="alert"
          className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-start gap-2"
        >
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <div className="font-display">Bounce rate is high ({stats.bounceRatePct}%).</div>
            <div className="text-xs opacity-90 mt-0.5">
              Verify contacts before sending. The daily queue is filtered to verified / likely-valid
              leads only — see OUTREACH_DELIVERABILITY_RULES.md §0.
            </div>
          </div>
        </div>
      )}

      {actionError && (
        <div role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {actionError}
        </div>
      )}
      {buildSummary && (
        <div role="status" className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Queue built · {buildSummary}
        </div>
      )}

      {/* Campaign-level KPI strip — pipeline + funnel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <Kpi label="Total leads" value={stats.total} />
        <Kpi label="Verified" value={stats.verified} tone={stats.verified > 0 ? "good" : undefined} />
        <Kpi label="Queued" value={stats.queued + stats.draftsPending} highlight={stats.draftsPending > 0} />
        <Kpi label="Sent" value={stats.sent} />
        <Kpi label="Replies" value={stats.replied} />
        <Kpi label="Positive" value={stats.positiveReplies} tone={stats.positiveReplies > 0 ? "good" : undefined} />
        <Kpi label="Demos" value={stats.demos} />
        <Kpi label="Beta invited" value={stats.beta} />
      </div>

      {/* Deliverability + verification KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <Kpi label="Delivered" value={stats.delivered} />
        <Kpi label="Bounced" value={stats.bounced} tone={stats.bounced > 0 ? "bad" : undefined} />
        <Kpi
          label="Bounce rate"
          value={stats.bounceRatePct}
          suffix="%"
          tone={bounceRateHigh ? "bad" : stats.bounceRatePct > 5 ? "warn" : undefined}
        />
        <Kpi
          label="Unverified"
          value={stats.unverified}
          tone={stats.unverified > 0 ? "warn" : undefined}
        />
        <Kpi label="Follow-ups due" value={stats.followUpsDue} highlight={stats.followUpsDue > 0} />
        <Kpi label="DNC" value={stats.dnc} />
      </div>

      {/* Send-ready workflow KPIs — added by outreach-lead-cleanup.sql.
          send_ready / needs_review / non_email_channel split the verified
          lead pool into action buckets the priority queue uses. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Kpi
          label="Send ready"
          value={stats.sendReady}
          tone={stats.sendReady > 0 ? "good" : undefined}
        />
        <Kpi
          label="Needs review"
          value={stats.needsReview}
          tone={stats.needsReview > 0 ? "warn" : undefined}
        />
        <Kpi label="Non-email only" value={stats.nonEmailOnly} />
        <Kpi label="Removed" value={stats.removed} tone={stats.removed > 0 ? "bad" : undefined} />
      </div>

      {/* Top-level actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-3 w-3" /> Add lead
        </Button>
        <Button variant="outline" onClick={() => setShowImport(true)}>
          <Upload className="h-3 w-3" /> CSV import
        </Button>
        <Button variant="outline" disabled={buildingQueue} onClick={() => void buildTodaysQueue()}>
          <Sparkles className="h-3 w-3" /> {buildingQueue ? "Building…" : "Build today's queue"}
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
          <TabsTrigger value="priority">Priority queue ({stats.sendReady})</TabsTrigger>
          <TabsTrigger value="queue">Daily queue ({stats.draftsPending})</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups ({stats.followUpsDue})</TabsTrigger>
          <TabsTrigger value="replies">Replies ({replies.length})</TabsTrigger>
          <TabsTrigger value="beta">Beta pipeline ({betaRows.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          <Filters
            search={search} setSearch={setSearch}
            vertical={vertical} setVertical={setVertical}
            status={status} setStatus={setStatus}
            priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
            verificationFilter={verificationFilter} setVerificationFilter={setVerificationFilter}
            hideDnc={hideDnc} setHideDnc={setHideDnc}
            shown={filtered.length} total={leads.length}
          />
          <LeadsTable
            leads={filtered}
            loading={isLoading}
            onOpen={(id) => setOpenLeadId(id)}
          />
        </TabsContent>

        <TabsContent value="priority" className="space-y-3">
          <PriorityQueueView
            leads={leads}
            drafts={draftMessages}
            onOpen={(id) => setOpenLeadId(id)}
            onCopy={copy}
          />
        </TabsContent>

        <TabsContent value="queue" className="space-y-3">
          <QueueView
            drafts={draftMessages}
            leads={leads}
            onOpen={(id) => setOpenLeadId(id)}
            onCopy={copy}
          />
        </TabsContent>

        <TabsContent value="followups" className="space-y-3">
          <FollowupsView
            followups={followups}
            leads={leads}
            onOpen={(id) => setOpenLeadId(id)}
          />
        </TabsContent>

        <TabsContent value="replies" className="space-y-3">
          <RepliesView
            replies={replies}
            leads={leads}
            onOpen={(id) => setOpenLeadId(id)}
            onCopy={copy}
          />
        </TabsContent>

        <TabsContent value="beta" className="space-y-3">
          <BetaPipelineView
            betaRows={betaRows}
            leads={leads}
            onOpen={(id) => setOpenLeadId(id)}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={!!openLead} onOpenChange={(o) => { if (!o) setOpenLeadId(null); }}>
        <DialogContent className="max-w-3xl">
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

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-xl">
          <AddLeadForm onClose={() => setShowAdd(false)} onSaved={() => qc.invalidateQueries({ queryKey: ["outreach-leads"] })} />
        </DialogContent>
      </Dialog>

      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-3xl">
          <CsvImportPanel
            existingEmails={new Set(leads.map((l) => (l.email ?? "").toLowerCase()).filter(Boolean))}
            onClose={() => setShowImport(false)}
            onImported={() => qc.invalidateQueries({ queryKey: ["outreach-leads"] })}
          />
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
