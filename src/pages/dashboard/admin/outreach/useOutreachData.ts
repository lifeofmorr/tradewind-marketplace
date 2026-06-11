// Outreach data queries + KPI computation — extracted verbatim from
// AdminOutreach.tsx (queries unchanged, the stats memo became the pure
// computeOutreachStats so it stays unit-testable).
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { POSITIVE_REPLY_TYPES } from "./constants";
import { todayIso } from "./badges";
import type {
  BetaPipelineRow,
  OutreachFollowup,
  OutreachLead,
  OutreachMessage,
  OutreachReply,
} from "./types";

export interface DeliveryStats {
  delivered: number;
  bounced: number;
  sent: number;
  sentToday: number;
}

export function useOutreachData() {
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
    queryFn: async (): Promise<DeliveryStats> => {
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

  return { leads, isLoading, draftMessages, deliveryStats, followups, replies, betaRows };
}

export type OutreachStats = ReturnType<typeof computeOutreachStats>;

export function computeOutreachStats(
  leads: OutreachLead[],
  deliveryStats: DeliveryStats,
  followups: OutreachFollowup[],
  draftMessages: OutreachMessage[],
  replies: OutreachReply[],
) {
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
}
