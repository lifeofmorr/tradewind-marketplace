import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Flame,
  ShieldAlert,
  Sparkles,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { setMeta } from "@/lib/seo";
import { formatNumber, formatCents, cn } from "@/lib/utils";

async function count(table: string, filter?: { col: string; eq: unknown }) {
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) q = q.eq(filter.col, filter.eq);
  const { count: c, error } = await q;
  if (error) throw error;
  return c ?? 0;
}

async function paymentTotalCents(): Promise<number> {
  const { data, error } = await supabase
    .from("payments")
    .select("amount_cents")
    .eq("status", "succeeded");
  if (error) return 0;
  return (data ?? []).reduce(
    (sum: number, row: { amount_cents: number | null }) => sum + (row.amount_cents ?? 0),
    0,
  );
}

interface Counts {
  users: number;
  listings: number;
  pending: number;
  demo: number;
  dealers: number;
  providers: number;
  openFraud: number;
  payments: number;
  paymentsCents: number;
  newInquiries: number;
  conciergeRequests: number;
}

export default function AdminDashboard() {
  useEffect(() => {
    setMeta({ title: "Admin · command center", description: "Marketplace state at a glance." });
  }, []);

  const { data: counts } = useQuery<Counts>({
    queryKey: ["admin-counts-v2"],
    queryFn: async () => {
      const [
        users,
        listings,
        pending,
        demo,
        dealers,
        providers,
        openFraud,
        payments,
        paymentsCents,
        newInquiries,
        conciergeRequests,
      ] = await Promise.all([
        count("profiles"),
        count("listings", { col: "status", eq: "active" }),
        count("listings", { col: "status", eq: "pending_review" }),
        count("listings", { col: "is_demo", eq: true }),
        count("dealers"),
        count("service_providers"),
        count("fraud_flags", { col: "resolved", eq: false }),
        count("payments", { col: "status", eq: "succeeded" }),
        paymentTotalCents(),
        count("inquiries", { col: "status", eq: "new" }),
        count("concierge_requests", { col: "status", eq: "submitted" }).catch(() => 0 as number),
      ]);
      return {
        users,
        listings,
        pending,
        demo,
        dealers,
        providers,
        openFraud,
        payments,
        paymentsCents,
        newInquiries,
        conciergeRequests,
      };
    },
  });

  // Marketplace health score: blend of active vs demo ratio + low fraud + payments flowing
  const health = useMemo(() => {
    if (!counts) return null;
    const realListings = Math.max(0, counts.listings - counts.demo);
    const ratio = counts.listings === 0 ? 0 : realListings / counts.listings;
    let score = 50;
    score += Math.round(ratio * 30); // 0–30 based on real-listing ratio
    score -= Math.min(30, counts.openFraud * 6);
    score += counts.payments > 0 ? 10 : 0;
    score += counts.dealers > 0 ? 5 : 0;
    score += counts.users > 5 ? 5 : 0;
    score = Math.max(0, Math.min(100, score));
    let label = "Building";
    if (score >= 80) label = "Strong";
    else if (score >= 60) label = "Healthy";
    else if (score >= 40) label = "Growing";
    return { score, label };
  }, [counts]);

  const realCount = (counts?.listings ?? 0) - (counts?.demo ?? 0);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="eyebrow">Admin · command center</div>
          <h1 className="section-title">Marketplace overview</h1>
        </div>
        {health && (
          <div className="glass-card px-4 py-3 flex items-center gap-3">
            <div
              className={cn(
                "h-9 w-9 grid place-items-center rounded-full font-mono text-sm ring-1",
                health.score >= 60
                  ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30"
                  : "bg-amber-500/10 text-amber-300 ring-amber-500/30",
              )}
            >
              {health.score}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">
                Health
              </div>
              <div className="font-display text-base">{health.label}</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Users" value={formatNumber(counts?.users ?? 0)} />
        <Stat
          label="Active listings"
          value={formatNumber(counts?.listings ?? 0)}
          sub={`${realCount} real · ${counts?.demo ?? 0} demo`}
        />
        <Stat
          label="Pending review"
          value={formatNumber(counts?.pending ?? 0)}
          tone={counts?.pending ? "amber" : "default"}
          icon={ClipboardList}
        />
        <Stat
          label="New inquiries"
          value={formatNumber(counts?.newInquiries ?? 0)}
          icon={Flame}
        />
        <Stat label="Dealers" value={formatNumber(counts?.dealers ?? 0)} />
        <Stat label="Service partners" value={formatNumber(counts?.providers ?? 0)} />
        <Stat
          label="Open fraud flags"
          value={formatNumber(counts?.openFraud ?? 0)}
          tone={counts?.openFraud ? "rose" : "default"}
          icon={ShieldAlert}
        />
        <Stat
          label="Concierge requests"
          value={formatNumber(counts?.conciergeRequests ?? 0)}
          icon={Sparkles}
        />
        <Stat
          label="Payments processed"
          value={formatCents(counts?.paymentsCents ?? 0)}
          sub={`${counts?.payments ?? 0} successful`}
          icon={Wallet}
          tone="brass"
        />
      </div>

      {/* Next best actions */}
      <section>
        <div className="eyebrow">Next best actions</div>
        <h2 className="section-title">Where to focus today</h2>
        <div className="section-title-underline mb-6" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(counts?.pending ?? 0) > 0 && (
            <ActionCard
              icon={ClipboardList}
              tone="amber"
              title={`${counts!.pending} listings need review`}
              body="Approve or reject pending submissions to keep the marketplace fresh."
              to="/admin/listings"
            />
          )}
          {(counts?.openFraud ?? 0) > 0 && (
            <ActionCard
              icon={ShieldAlert}
              tone="rose"
              title={`${counts!.openFraud} fraud flags open`}
              body="Triaging now keeps trust scores high and prevents bad-actor escalation."
              to="/admin/fraud"
            />
          )}
          {(counts?.conciergeRequests ?? 0) > 0 && (
            <ActionCard
              icon={Sparkles}
              tone="violet"
              title={`${counts!.conciergeRequests} concierge requests`}
              body="High-intent buyers waiting on white-glove follow-up."
              to="/admin/requests"
            />
          )}
          <ActionCard
            icon={TrendingUp}
            tone="brass"
            title="Promote a featured listing"
            body="Spotlight inventory on the homepage and drive impressions."
            to="/admin/listings"
          />
          <ActionCard
            icon={AlertTriangle}
            tone="default"
            title="Audit demo listings"
            body={`${counts?.demo ?? 0} demo listings live — phase out as real inventory comes online.`}
            to="/admin/listings"
          />
        </div>
      </section>
    </div>
  );
}

const STAT_TONE = {
  default: "",
  amber: "ring-amber-500/30 bg-amber-500/5",
  rose: "ring-rose-500/30 bg-rose-500/5",
  brass: "ring-brass-500/30 bg-brass-500/5",
};

function Stat({
  label,
  value,
  sub,
  tone = "default",
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  tone?: keyof typeof STAT_TONE;
  icon?: typeof Flame;
}) {
  return (
    <div className={cn("glass-card p-4 lift-card ring-1", STAT_TONE[tone])}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        {Icon && <Icon className="h-4 w-4 text-brass-400" />}
      </div>
      <div className="font-display text-3xl mt-1">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

const ACTION_TONE: Record<string, string> = {
  default: "border-border",
  amber: "border-amber-500/30",
  rose: "border-rose-500/30",
  violet: "border-violet-500/30",
  brass: "border-brass-500/30",
};

function ActionCard({
  icon: Icon,
  tone = "default",
  title,
  body,
  to,
}: {
  icon: typeof ClipboardList;
  tone?: keyof typeof ACTION_TONE;
  title: string;
  body: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "glass-card lift-card p-5 block border",
        ACTION_TONE[tone],
      )}
    >
      <Icon className="h-5 w-5 text-brass-400" />
      <div className="font-display text-lg mt-3">{title}</div>
      <p className="text-xs text-muted-foreground mt-1">{body}</p>
      <div className="mt-3 inline-flex items-center gap-1 text-xs text-brass-400">
        Take action <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}
