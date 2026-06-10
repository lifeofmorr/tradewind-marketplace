import { useEffect, useMemo, useRef, useState } from "react";
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
  Plus,
  Upload,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Linkedin,
  Instagram,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { logAuditEvent } from "@/lib/audit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { setMeta } from "@/lib/seo";
import { checkMessageQuality } from "@/lib/outreach/messageQuality";
import {
  previewOutreachCsv,
  formatLinkedInDM,
  formatInstagramDM,
  type ParsedLead,
  type ImportPreview,
} from "@/lib/outreach/csvImport";

// ── types ────────────────────────────────────────────────────────────────────

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
  priority: number;
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
  email_verification_status:
    | "verified"
    | "likely_valid"
    | "unverified"
    | "bounced"
    | "invalid"
    | "do_not_email"
    | null;
  email_verification_source: string | null;
  email_verified_at: string | null;
  bounce_reason: string | null;
  invalid_email_address: string | null;
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
  approved_at: string | null;
  personalization_note: string | null;
  cta: string | null;
  quality_score: number | null;
  ai_tone_risk_score: number | null;
  sent_at: string | null;
  received_at: string | null;
  created_at: string;
}

interface OutreachFollowup {
  id: string;
  lead_id: string;
  message_id: string | null;
  followup_number: number;
  due_date: string;
  body: string | null;
  status: "due" | "sent" | "skipped" | "cancelled";
  created_at: string;
}

interface OutreachReply {
  id: string;
  lead_id: string;
  channel: string;
  reply_text: string;
  reply_type: string | null;
  recommended_response: string | null;
  status: "new" | "reviewed" | "responded" | "archived";
  created_at: string;
}

interface BetaPipelineRow {
  id: string;
  lead_id: string;
  beta_type: string | null;
  stage:
    | "interested"
    | "wants_demo"
    | "demo_booked"
    | "demo_completed"
    | "beta_invited"
    | "beta_onboarded"
    | "real_listing_candidate"
    | "partner_candidate"
    | "paid_candidate"
    | "follow_up_later"
    | "not_interested"
    | "declined";
  demo_date: string | null;
  feedback_notes: string | null;
  real_listing_candidate: boolean;
  partner_candidate: boolean;
  interested_in_paying: boolean;
  next_step: string | null;
  created_at: string;
  updated_at: string;
}

// ── constants ────────────────────────────────────────────────────────────────

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
  "all", "new", "send_ready", "needs_review", "non_email_channel",
  "drafted", "approved", "sent", "replied", "interested", "wants_demo",
  "demo_booked", "beta_invited", "do_not_contact",
] as const;

// Status buckets introduced by supabase/outreach-lead-cleanup.sql (2026-05-27),
// referenced below as string literals:
// send_ready        — likely_valid email, safe to draft
// needs_review      — email pattern-inferred / post-audit downgrade
// non_email_channel — no public email; LinkedIn / form / phone only

const PRIORITIES = ["all", "1", "2", "3", "4", "5"] as const;

// Beta pipeline stages used by /admin/outreach. Must match the CHECK
// constraint in supabase/migrations/20260527_beta_pipeline_expanded_stages.sql.
// Ordered to reflect the typical reply → demo → onboarded → paid flow,
// with terminal stages (follow_up_later, not_interested, declined) last.
const BETA_STAGES = [
  "interested",
  "wants_demo",
  "demo_booked",
  "demo_completed",
  "beta_invited",
  "beta_onboarded",
  "real_listing_candidate",
  "partner_candidate",
  "paid_candidate",
  "follow_up_later",
  "not_interested",
  "declined",
] as const;

const BETA_OFFER = [
  "60-day free beta access",
  "Free public business profile",
  "First 10 listings free",
  "Founder support (text/email Don directly)",
  "Influence the roadmap",
  "Locked-in early-adopter rate after beta",
];

// ── Tradewind 100 campaign ───────────────────────────────────────────────────
//
// The Tradewind 100 campaign — 100 verified leads across 9 verticals, sent
// over ~30 days. Daily caps are enforced in the UI so we never overshoot the
// schedule documented in go-to-market/outreach-autopilot/30_DAY_SEND_SCHEDULE.md.
//
// Week ramps: Wk1=7/day, Wk2=8/day, Wk3=13/day, Wk4=15/day. The cap below is
// the current "today" cap that the dashboard enforces — bump it as the weeks
// progress (or wire to date math later).

const CAMPAIGN_NAME = "Tradewind 100";
const CAMPAIGN_TARGET = 100;
const CAMPAIGN_DAILY_CAP = 7; // Week 1 cap; bump as the schedule progresses.

const POSITIVE_REPLY_TYPES = new Set([
  "interested",
  "demo_request",
  "positive",
  "ready_to_buy",
]);

const VERIFICATION_FILTERS = [
  "all",
  "verified",
  "likely_valid",
  "unverified",
  "bounced",
  "invalid",
  "do_not_email",
] as const;

// ── helpers ──────────────────────────────────────────────────────────────────

function scoreBadge(score: number) {
  if (score === 5) return <Badge variant="accent">Score 5</Badge>;
  if (score === 4) return <Badge variant="good">Score 4</Badge>;
  if (score === 3) return <Badge>Score 3</Badge>;
  return <Badge variant="bad">Score {score}</Badge>;
}

function priorityBadge(p: number) {
  if (p >= 5) return <Badge variant="accent">P1</Badge>;
  if (p === 4) return <Badge variant="good">P2</Badge>;
  if (p === 3) return <Badge>P3</Badge>;
  return <Badge variant="bad">P{6 - p}</Badge>;
}

function statusBadge(lead: OutreachLead) {
  if (lead.do_not_contact) return <Badge variant="bad">DNC</Badge>;
  if (lead.status === "bounced") return <Badge variant="bad">Bounced</Badge>;
  if (lead.beta_invited) return <Badge variant="accent">Beta invited</Badge>;
  if (lead.demo_booked) return <Badge variant="accent">Demo booked</Badge>;
  if (lead.status === "replied") return <Badge variant="good">Replied</Badge>;
  if (lead.status === "contacted") return <Badge variant="good">Contacted</Badge>;
  if (lead.status === "sent") return <Badge>Sent</Badge>;
  if (lead.status === "approved") return <Badge variant="accent">Approved</Badge>;
  if (lead.status === "drafted") return <Badge>Draft</Badge>;
  if (lead.status === "send_ready")
    return <Badge variant="good" title="Verified email — safe to draft and queue">Send ready</Badge>;
  if (lead.status === "needs_review")
    return <Badge variant="accent" title="Email pattern-inferred — confirm before send">Needs review</Badge>;
  if (lead.status === "non_email_channel")
    return <Badge title="No public email — use LinkedIn / contact form / phone">Non-email</Badge>;
  return <Badge>New</Badge>;
}

function verificationBadge(lead: OutreachLead) {
  const v = lead.email_verification_status ?? "unverified";
  switch (v) {
    case "verified":
      return <Badge variant="good" title="Address replied or paid-verified">Verified</Badge>;
    case "likely_valid":
      return <Badge variant="good" title="Published on the company's own website">Likely valid</Badge>;
    case "bounced":
      return <Badge variant="bad" title="Previously bounced — do not resend">Bounced</Badge>;
    case "invalid":
      return <Badge variant="bad" title="Known-invalid address">Invalid</Badge>;
    case "do_not_email":
      return <Badge variant="bad" title="Opted out or compliance hold">Do not email</Badge>;
    default:
      return <Badge variant="accent" title="Unverified — manual approval required before send">Unverified</Badge>;
  }
}

function bouncedWarningBadge() {
  return (
    <Badge variant="bad" className="gap-1" title="This address bounced previously. Do not resend.">
      <AlertTriangle className="h-3 w-3" /> Previously bounced — do not resend
    </Badge>
  );
}

function unverifiedWarningBadge() {
  return (
    <Badge variant="accent" className="gap-1" title="Unverified address — manual approval required before send.">
      <AlertTriangle className="h-3 w-3" /> Unverified — manual approval required
    </Badge>
  );
}

function todayIso() { return new Date().toISOString().slice(0, 10); }
function daysFromNow(n: number) { return new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10); }

// ── main component ───────────────────────────────────────────────────────────

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

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["outreach-leads"],
    queryFn: async (): Promise<OutreachLead[]> => {
      const { data, error } = await supabase
        .from("outreach_leads")
        .select("*")
        .order("priority", { ascending: false })
        .order("lead_score", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return (data ?? []) as OutreachLead[];
    },
  });

  const { data: draftMessages = [] } = useQuery({
    queryKey: ["outreach-drafts"],
    queryFn: async (): Promise<OutreachMessage[]> => {
      const { data, error } = await supabase
        .from("outreach_messages")
        .select("*")
        .in("status", ["drafted", "approved"])
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as OutreachMessage[];
    },
  });

  // Delivery / bounce metrics — separate query because draftMessages only
  // pulls drafted+approved. Bounce rate needs sent/bounced/replied counts.
  // Also tracks today's sent count for the daily cap indicator.
  const { data: deliveryStats = { delivered: 0, bounced: 0, sent: 0, sentToday: 0 } } = useQuery({
    queryKey: ["outreach-delivery-stats"],
    queryFn: async (): Promise<{ delivered: number; bounced: number; sent: number; sentToday: number }> => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const [deliveredRes, bouncedRes, sentRes, sentTodayRes] = await Promise.all([
        supabase
          .from("outreach_messages")
          .select("id", { count: "exact", head: true })
          .eq("direction", "outbound")
          .in("status", ["sent", "replied"]),
        supabase
          .from("outreach_messages")
          .select("id", { count: "exact", head: true })
          .eq("direction", "outbound")
          .eq("status", "bounced"),
        supabase
          .from("outreach_messages")
          .select("id", { count: "exact", head: true })
          .eq("direction", "outbound")
          .eq("status", "sent"),
        supabase
          .from("outreach_messages")
          .select("id", { count: "exact", head: true })
          .eq("direction", "outbound")
          .in("status", ["sent", "replied"])
          .gte("sent_at", todayStart.toISOString()),
      ]);
      if (deliveredRes.error) throw deliveredRes.error;
      if (bouncedRes.error) throw bouncedRes.error;
      if (sentRes.error) throw sentRes.error;
      if (sentTodayRes.error) throw sentTodayRes.error;
      return {
        delivered: deliveredRes.count ?? 0,
        bounced: bouncedRes.count ?? 0,
        sent: sentRes.count ?? 0,
        sentToday: sentTodayRes.count ?? 0,
      };
    },
  });

  const { data: followups = [] } = useQuery({
    queryKey: ["outreach-followups"],
    queryFn: async (): Promise<OutreachFollowup[]> => {
      const { data, error } = await supabase
        .from("outreach_followups")
        .select("*")
        .eq("status", "due")
        .order("due_date", { ascending: true })
        .limit(200);
      if (error) {
        // table may not exist yet on the running env — return empty
        console.warn("[outreach] followups query failed:", error.message);
        return [];
      }
      return (data ?? []) as OutreachFollowup[];
    },
  });

  const { data: replies = [] } = useQuery({
    queryKey: ["outreach-replies"],
    queryFn: async (): Promise<OutreachReply[]> => {
      const { data, error } = await supabase
        .from("outreach_replies")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) {
        console.warn("[outreach] replies query failed:", error.message);
        return [];
      }
      return (data ?? []) as OutreachReply[];
    },
  });

  const { data: betaRows = [] } = useQuery({
    queryKey: ["outreach-beta"],
    queryFn: async (): Promise<BetaPipelineRow[]> => {
      const { data, error } = await supabase
        .from("beta_pipeline")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(200);
      if (error) {
        console.warn("[outreach] beta_pipeline query failed:", error.message);
        return [];
      }
      return (data ?? []) as BetaPipelineRow[];
    },
  });

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

  const stats = useMemo(() => {
    const total = leads.length;
    const highPriority = leads.filter((l) => l.priority >= 4 && !l.do_not_contact).length;
    const draftsPending = draftMessages.filter((m) => m.status === "drafted").length;
    const queued = draftMessages.filter((m) => m.status === "approved").length;
    const followUpsDue = followups.filter((f) => f.due_date <= todayIso()).length;
    const demos = leads.filter((l) => l.demo_booked).length;
    const beta = leads.filter((l) => l.beta_invited).length;
    const replied = leads.filter((l) => l.status === "replied").length;
    const positiveReplies = replies.filter(
      (r) => r.reply_type && POSITIVE_REPLY_TYPES.has(r.reply_type.toLowerCase()),
    ).length;
    const dnc = leads.filter((l) => l.do_not_contact).length;

    // ── Deliverability + verification KPIs ───────────────────────────────────
    // Sent = outbound w/ status sent (raw count, not yet replied).
    // Delivered = sent OR replied (the message landed). Bounced is bounced.
    // Bounce rate is bounced / (delivered + bounced).
    const sent = deliveryStats.sent;
    const sentToday = deliveryStats.sentToday;
    const delivered = deliveryStats.delivered;
    const bounced = deliveryStats.bounced;
    const denom = delivered + bounced;
    const bounceRatePct = denom > 0 ? Math.round((bounced / denom) * 1000) / 10 : 0;

    const verifiedLeads = leads.filter(
      (l) => l.email_verification_status === "verified" || l.email_verification_status === "likely_valid",
    ).length;
    const unverifiedLeads = leads.filter(
      (l) => !l.email_verification_status || l.email_verification_status === "unverified",
    ).length;
    const bouncedLeads = leads.filter((l) => l.email_verification_status === "bounced").length;

    // Workflow-status buckets from supabase/outreach-lead-cleanup.sql
    const sendReady = leads.filter(
      (l) => l.status === "send_ready" && !l.do_not_contact,
    ).length;
    const needsReview = leads.filter(
      (l) => l.status === "needs_review" && !l.do_not_contact,
    ).length;
    const nonEmailOnly = leads.filter(
      (l) => l.status === "non_email_channel" && !l.do_not_contact,
    ).length;
    // Removed = bounced rows OR DNC at the row level
    const removed = leads.filter(
      (l) => l.do_not_contact || l.email_verification_status === "bounced",
    ).length;

    return {
      total, highPriority, draftsPending, queued, followUpsDue, demos, beta, replied, positiveReplies, dnc,
      sent, sentToday, delivered, bounced, bounceRatePct,
      verified: verifiedLeads, unverified: unverifiedLeads, bouncedLeads,
      sendReady, needsReview, nonEmailOnly, removed,
    };
  }, [leads, deliveryStats, followups, draftMessages, replies]);

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

// ── daily cap indicator ──────────────────────────────────────────────────────

function DailyCapIndicator({ sentToday, cap, hit }: { sentToday: number; cap: number; hit: boolean }) {
  const tone = hit ? "border-red-500/40 bg-red-500/10 text-red-200" : "border-brass-500/30 bg-brass-500/5 text-brass-200";
  return (
    <div className={`rounded-md border ${tone} px-4 py-2 text-xs flex items-center gap-3`}>
      <span className="uppercase tracking-wider text-[10px] text-muted-foreground">Daily limit</span>
      <span className="font-mono text-sm">
        {sentToday} / {cap}
      </span>
      <span className="text-muted-foreground">sent today</span>
      {hit && (
        <span className="ml-auto flex items-center gap-1 text-red-300">
          <AlertTriangle className="h-3 w-3" /> Cap reached — approvals disabled until midnight
        </span>
      )}
    </div>
  );
}

// ── compliance banner ─────────────────────────────────────────────────────────

function ComplianceBanner() {
  // CAN-SPAM requires a physical postal address on commercial email. The server
  // (build-daily-queue) hard-blocks email scaling until BUSINESS_MAILING_ADDRESS
  // is set; this mirrors that state for the operator using the public client var.
  const mailingAddress = (import.meta.env.VITE_BUSINESS_MAILING_ADDRESS ?? "").trim();
  const canSpamReady = mailingAddress.length > 0;

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 text-brass-400 mt-0.5 shrink-0" />
        <div>
          <div className="font-medium text-foreground">Outreach compliance</div>
          Outreach uses public business contacts only. No auto-sending. All messages require approval.
          Opt-out is respected immediately, follow-ups stop on negative replies, and DNC leads are excluded from queues.
        </div>
      </div>

      {canSpamReady ? (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <span className="font-medium">CAN-SPAM ready.</span> Email footers carry a physical
            postal address and an opt-out line. Address: <span className="font-mono">{mailingAddress}</span>
          </div>
        </div>
      ) : (
        <div role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-300 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <span className="font-medium">CAN-SPAM: mailing address not set.</span> Email outreach
            scaling is blocked until <span className="font-mono">BUSINESS_MAILING_ADDRESS</span> (server)
            and <span className="font-mono">VITE_BUSINESS_MAILING_ADDRESS</span> (client) are configured.
            See OUTREACH_CAN_SPAM_READINESS.md.
          </div>
        </div>
      )}
    </div>
  );
}

// ── small UI primitives ──────────────────────────────────────────────────────

function Kpi({
  label,
  value,
  highlight,
  tone,
  suffix,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  tone?: "good" | "warn" | "bad";
  suffix?: string;
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
      <div className={`font-mono text-lg ${valueColor}`}>
        {value}
        {suffix ?? ""}
      </div>
    </div>
  );
}

function Filters(props: {
  search: string; setSearch: (s: string) => void;
  vertical: string; setVertical: (s: string) => void;
  status: string; setStatus: (s: string) => void;
  priorityFilter: string; setPriorityFilter: (s: string) => void;
  verificationFilter: string; setVerificationFilter: (s: string) => void;
  hideDnc: boolean; setHideDnc: (b: boolean) => void;
  shown: number; total: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <div>
        <Label htmlFor="search" className="text-xs">Search</Label>
        <Input id="search" value={props.search} onChange={(e) => props.setSearch(e.target.value)} placeholder="Company, contact, angle…" />
      </div>
      <div>
        <Label htmlFor="vertical" className="text-xs">Vertical</Label>
        <select id="vertical" value={props.vertical} onChange={(e) => props.setVertical(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
          {VERTICALS.map((v) => <option key={v} value={v}>{v === "all" ? "All verticals" : v}</option>)}
        </select>
      </div>
      <div>
        <Label htmlFor="status" className="text-xs">Status</Label>
        <select id="status" value={props.status} onChange={(e) => props.setStatus(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
          {STATUSES.map((s) => <option key={s} value={s}>{s === "all" ? "Any status" : s.replace(/_/g, " ")}</option>)}
        </select>
      </div>
      <div>
        <Label htmlFor="priority" className="text-xs">Priority</Label>
        <select id="priority" value={props.priorityFilter} onChange={(e) => props.setPriorityFilter(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
          {PRIORITIES.map((p) => <option key={p} value={p}>{p === "all" ? "Any priority" : `P=${p}`}</option>)}
        </select>
      </div>
      <div>
        <Label htmlFor="verification" className="text-xs">Verification</Label>
        <select id="verification" value={props.verificationFilter} onChange={(e) => props.setVerificationFilter(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
          {VERIFICATION_FILTERS.map((v) => (
            <option key={v} value={v}>{v === "all" ? "Any verification" : v.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>
      <div className="flex items-end gap-3">
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={props.hideDnc} onChange={(e) => props.setHideDnc(e.target.checked)} />
          Hide DNC
        </label>
        <p className="text-xs text-muted-foreground ml-auto">
          <span className="text-foreground font-mono">{props.shown}</span> / {props.total}
        </p>
      </div>
    </div>
  );
}

// ── leads table ──────────────────────────────────────────────────────────────

function LeadsTable({ leads, loading, onOpen }: {
  leads: OutreachLead[];
  loading: boolean;
  onOpen: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 skeleton border-b border-border last:border-0" />
        ))}
      </div>
    );
  }
  if (leads.length === 0) {
    return (
      <EmptyState
        icon={Mail}
        title="No outreach leads"
        body="Add a lead manually, paste a CSV, or run today's queue once you have leads."
      />
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="text-left px-4 py-3">Company</th>
            <th className="text-left px-4 py-3">Vertical</th>
            <th className="text-left px-4 py-3">Priority</th>
            <th className="text-left px-4 py-3">Score</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-left px-4 py-3">Verification</th>
            <th className="text-left px-4 py-3">Next action</th>
            <th className="text-left px-4 py-3">Follow-up</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => {
            const followUpDue = l.follow_up_date &&
              l.follow_up_date <= todayIso() && !l.do_not_contact && l.status !== "replied";
            const v = l.email_verification_status ?? "unverified";
            const rowTone =
              v === "bounced" || v === "invalid" || v === "do_not_email"
                ? "bg-red-500/5"
                : v === "unverified"
                  ? "bg-secondary/30"
                  : "";
            return (
              <tr key={l.id} className={`border-t border-border hover:bg-secondary/40 ${rowTone}`}>
                <td className="px-4 py-3">
                  <div className="font-display">{l.company}</div>
                  <div className="text-xs text-muted-foreground">
                    {l.contact_name ?? "—"}{l.contact_role ? ` · ${l.contact_role}` : ""}
                  </div>
                  {(v === "bounced" || v === "unverified") && (
                    <div className="mt-1">
                      {v === "bounced" ? bouncedWarningBadge() : unverifiedWarningBadge()}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{l.vertical}</td>
                <td className="px-4 py-3">{priorityBadge(l.priority)}</td>
                <td className="px-4 py-3">{scoreBadge(l.lead_score)}</td>
                <td className="px-4 py-3">{statusBadge(l)}</td>
                <td className="px-4 py-3">{verificationBadge(l)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px] truncate">{l.next_action ?? "—"}</td>
                <td className="px-4 py-3 text-xs">
                  {l.follow_up_date ? (
                    <span className={followUpDue ? "text-brass-400 font-mono" : "text-muted-foreground font-mono"}>
                      {l.follow_up_date}
                    </span>
                  ) : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Button size="sm" variant="outline" onClick={() => onOpen(l.id)}>Open</Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

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

function PriorityQueueView({ leads, drafts, onOpen, onCopy }: {
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

// ── queue view ───────────────────────────────────────────────────────────────

function QueueView({ drafts, leads, onOpen, onCopy }: {
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

// ── follow-ups view ──────────────────────────────────────────────────────────

function FollowupsView({ followups, leads, onOpen }: {
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

// ── replies view ─────────────────────────────────────────────────────────────

function RepliesView({ replies, leads, onOpen, onCopy }: {
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

// ── beta pipeline view ───────────────────────────────────────────────────────

function BetaPipelineView({ betaRows, leads, onOpen }: {
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

// ── add lead form ────────────────────────────────────────────────────────────

function AddLeadForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    company: "", contact_name: "", contact_role: "", vertical: "Boat Dealer",
    email: "", phone: "", website: "", linkedin_url: "", instagram_url: "",
    location: "", lead_source: "", personalization_angle: "",
    pain_point: "", recommended_offer: "", notes: "",
    priority: 3, lead_score: 3,
  });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setErr(null);
    if (!form.company.trim()) { setErr("Company is required"); return; }
    if (!form.vertical) { setErr("Vertical is required"); return; }
    setBusy(true);
    const payload = {
      company: form.company.trim(),
      contact_name: form.contact_name.trim() || null,
      contact_role: form.contact_role.trim() || null,
      vertical: form.vertical,
      email: form.email.trim().toLowerCase() || null,
      phone: form.phone.trim() || null,
      website: form.website.trim() || null,
      linkedin_url: form.linkedin_url.trim() || null,
      instagram_url: form.instagram_url.trim() || null,
      location: form.location.trim() || null,
      lead_source: form.lead_source.trim() || null,
      personalization_angle: form.personalization_angle.trim() || null,
      pain_point: form.pain_point.trim() || null,
      recommended_offer: form.recommended_offer.trim() || null,
      notes: form.notes.trim() || null,
      priority: form.priority,
      lead_score: form.lead_score,
      status: "new",
    };
    const { error } = await supabase.from("outreach_leads").insert(payload);
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    onSaved();
    onClose();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add lead</DialogTitle>
        <DialogDescription>One row in outreach_leads. Required: Company + Vertical.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-1">
        {err && <div role="alert" className="text-xs text-red-400">{err}</div>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Company *" value={form.company} onChange={(v) => update("company", v)} />
          <div>
            <Label className="text-xs">Vertical *</Label>
            <select value={form.vertical} onChange={(e) => update("vertical", e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {VERTICALS.filter((v) => v !== "all").map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <Field label="Contact name" value={form.contact_name} onChange={(v) => update("contact_name", v)} />
          <Field label="Role" value={form.contact_role} onChange={(v) => update("contact_role", v)} />
          <Field label="Email" value={form.email} onChange={(v) => update("email", v)} />
          <Field label="Phone" value={form.phone} onChange={(v) => update("phone", v)} />
          <Field label="Website" value={form.website} onChange={(v) => update("website", v)} />
          <Field label="LinkedIn URL" value={form.linkedin_url} onChange={(v) => update("linkedin_url", v)} />
          <Field label="Instagram URL" value={form.instagram_url} onChange={(v) => update("instagram_url", v)} />
          <Field label="Location" value={form.location} onChange={(v) => update("location", v)} />
          <Field label="Lead source" value={form.lead_source} onChange={(v) => update("lead_source", v)} />
          <div>
            <Label className="text-xs">Priority (1–5)</Label>
            <Input type="number" min={1} max={5} value={form.priority}
              onChange={(e) => update("priority", Math.max(1, Math.min(5, Number(e.target.value) || 3)))} />
          </div>
          <div>
            <Label className="text-xs">Lead score (1–5)</Label>
            <Input type="number" min={1} max={5} value={form.lead_score}
              onChange={(e) => update("lead_score", Math.max(1, Math.min(5, Number(e.target.value) || 3)))} />
          </div>
        </div>
        <div>
          <Label className="text-xs">Personalization angle</Label>
          <Textarea rows={2} value={form.personalization_angle}
            onChange={(e) => update("personalization_angle", e.target.value)}
            placeholder="One specific thing about this business worth mentioning." />
        </div>
        <div>
          <Label className="text-xs">Pain point</Label>
          <Textarea rows={2} value={form.pain_point} onChange={(e) => update("pain_point", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Recommended offer</Label>
          <Textarea rows={2} value={form.recommended_offer} onChange={(e) => update("recommended_offer", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Notes</Label>
          <Textarea rows={2} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button onClick={() => void save()} disabled={busy}>{busy ? "Saving…" : "Save lead"}</Button>
      </DialogFooter>
    </>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

// ── csv import panel ─────────────────────────────────────────────────────────

function CsvImportPanel({ existingEmails, onClose, onImported }: {
  existingEmails: Set<string>;
  onClose: () => void;
  onImported: () => void;
}) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const t = (reader.result as string) || "";
      setText(t);
      setPreview(previewOutreachCsv(t, existingEmails));
    };
    reader.readAsText(file);
  }

  function parseFromText() {
    setPreview(previewOutreachCsv(text, existingEmails));
  }

  async function doImport(rows: ParsedLead[]) {
    if (rows.length === 0) return;
    setBusy(true);
    setResult(null);
    const chunks: ParsedLead[][] = [];
    for (let i = 0; i < rows.length; i += 100) chunks.push(rows.slice(i, i + 100));
    let inserted = 0;
    let failed = 0;
    for (const chunk of chunks) {
      const { error } = await supabase.from("outreach_leads").insert(
        chunk.map((r) => ({ ...r, status: "new", priority: 3, lead_score: 3 })),
      );
      if (error) failed += chunk.length;
      else inserted += chunk.length;
    }
    setBusy(false);
    setResult(`Imported ${inserted}, failed ${failed}.`);
    if (inserted > 0) onImported();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>CSV import</DialogTitle>
        <DialogDescription>
          Columns: Company, Contact, Role, Vertical, Email, Phone, Website, LinkedIn, Instagram, Location, Lead Source, Notes.
          Required: Company + Vertical.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-1">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-3 w-3" /> Choose CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <Button size="sm" variant="outline" onClick={parseFromText} disabled={!text.trim()}>Parse pasted CSV</Button>
        </div>
        <Textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder="Or paste CSV here…" />

        {preview && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              <span className="text-emerald-400">{preview.ok.length}</span> ok ·{" "}
              <span className="text-amber-400">{preview.duplicates.length}</span> duplicates ·{" "}
              <span className="text-red-400">{preview.errors.length}</span> errors
            </div>
            {preview.errors.length > 0 && (
              <details className="text-xs text-red-300">
                <summary className="cursor-pointer">Errors ({preview.errors.length})</summary>
                <ul className="ml-4 list-disc">
                  {preview.errors.slice(0, 30).map((e) => <li key={e.row}>row {e.row}: {e.reason}</li>)}
                </ul>
              </details>
            )}
            {preview.duplicates.length > 0 && (
              <details className="text-xs text-amber-300">
                <summary className="cursor-pointer">Duplicates ({preview.duplicates.length})</summary>
                <ul className="ml-4 list-disc">
                  {preview.duplicates.slice(0, 30).map((d) => <li key={d.row}>row {d.row}: {d.reason}</li>)}
                </ul>
              </details>
            )}
            {preview.ok.length > 0 && (
              <div className="overflow-x-auto rounded border border-border max-h-64">
                <table className="w-full text-xs">
                  <thead className="bg-secondary text-muted-foreground">
                    <tr>
                      <th className="text-left px-2 py-1">Company</th>
                      <th className="text-left px-2 py-1">Contact</th>
                      <th className="text-left px-2 py-1">Vertical</th>
                      <th className="text-left px-2 py-1">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.ok.slice(0, 20).map((r, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-2 py-1">{r.company}</td>
                        <td className="px-2 py-1">{r.contact_name ?? "—"}</td>
                        <td className="px-2 py-1">{r.vertical}</td>
                        <td className="px-2 py-1">{r.email ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.ok.length > 20 && <div className="px-2 py-1 text-muted-foreground">… and {preview.ok.length - 20} more</div>}
              </div>
            )}
          </div>
        )}

        {result && <div className="text-xs text-emerald-400">{result}</div>}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={busy}>Close</Button>
        <Button onClick={() => void doImport(preview?.ok ?? [])} disabled={busy || !preview?.ok.length}>
          {busy ? "Importing…" : `Import ${preview?.ok.length ?? 0}`}
        </Button>
      </DialogFooter>
    </>
  );
}

// ── lead detail panel ────────────────────────────────────────────────────────

interface LeadDetailProps {
  lead: OutreachLead;
  onUpdate: (patch: Partial<OutreachLead>) => void;
  onCopy: (text: string, label?: string) => void;
  actionBusy: boolean;
}

function LeadDetail({ lead, onUpdate, onCopy, actionBusy }: LeadDetailProps) {
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
