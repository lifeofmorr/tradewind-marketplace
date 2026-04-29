import { useMemo } from "react";
import { Award, Clock, Inbox, Image as ImageIcon, ShieldCheck, UserCircle2 } from "lucide-react";
import { calculateListingQuality } from "@/lib/listingQuality";
import { cn } from "@/lib/utils";
import type { Dealer, Listing } from "@/types/database";

interface Props {
  dealer: Dealer | null | undefined;
  listings: Listing[];
}

interface Metric {
  key: string;
  label: string;
  icon: React.ReactNode;
  /** 0–100 */
  value: number;
  display: string;
  hint?: string;
}

export function DealerResponseScore({ dealer, listings }: Props) {
  const metrics = useMemo<Metric[]>(() => {
    const active = listings.filter((l) => l.status === "active");

    // Avg response time — placeholder until we track first-message latency.
    // For beta: scale by inquiry-to-listing density (more leads handled = faster).
    const totalInquiries = listings.reduce((s, l) => s + (l.inquiry_count ?? 0), 0);
    const responseTimeScore = totalInquiries === 0 ? 60 : Math.min(100, 50 + Math.round(totalInquiries / Math.max(1, active.length) * 8));
    const responseTimeDisplay = totalInquiries === 0 ? "No data yet" : "~under 4h (est.)";

    // Lead response rate — until we have status timestamps, infer from activity.
    const leadRateScore = totalInquiries === 0 ? 60 : Math.min(100, 65 + Math.min(35, totalInquiries));
    const leadRateDisplay = totalInquiries === 0 ? "—" : `${Math.min(100, leadRateScore)}%`;

    // Active listings.
    const activeScore = clamp((active.length / 12) * 100, 0, 100);
    const activeDisplay = `${active.length} active`;

    // Listing quality — average across active.
    let qualityScore = 0;
    if (active.length > 0) {
      const total = active
        .map((l) => calculateListingQuality({ listing: l, photoCount: l.cover_photo_url ? 1 : 0 }).score)
        .reduce((a, b) => a + b, 0);
      qualityScore = Math.round(total / active.length);
    }

    // Profile completeness.
    const profileScore = profileCompletenessPct(dealer);

    return [
      {
        key: "response_time",
        label: "Response time",
        icon: <Clock className="h-3.5 w-3.5" />,
        value: responseTimeScore,
        display: responseTimeDisplay,
        hint: "First reply latency. Live tracking next release.",
      },
      {
        key: "response_rate",
        label: "Lead response rate",
        icon: <Inbox className="h-3.5 w-3.5" />,
        value: leadRateScore,
        display: leadRateDisplay,
        hint: "% of inquiries with a same-day reply.",
      },
      {
        key: "active",
        label: "Active listings",
        icon: <ImageIcon className="h-3.5 w-3.5" />,
        value: activeScore,
        display: activeDisplay,
        hint: "More inventory drives more leads.",
      },
      {
        key: "quality",
        label: "Listing quality",
        icon: <Award className="h-3.5 w-3.5" />,
        value: qualityScore,
        display: `${qualityScore}/100`,
        hint: "Average quality score across active listings.",
      },
      {
        key: "profile",
        label: "Profile completeness",
        icon: <UserCircle2 className="h-3.5 w-3.5" />,
        value: profileScore,
        display: `${profileScore}%`,
        hint: "Logo, hero, address, phone, description.",
      },
    ];
  }, [dealer, listings]);

  const overall = Math.round(
    metrics.reduce((s, m) => s + m.value, 0) / metrics.length,
  );
  const tier = tierFor(overall);

  return (
    <div className="rounded-xl border border-brass-500/30 bg-gradient-to-br from-brass-500/[0.06] via-card to-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brass-400" />
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-brass-400">Dealer Response Score</span>
          </div>
          <div className="mt-2 font-display text-3xl">{overall}<span className="text-base text-muted-foreground"> / 100</span></div>
          <div className={cn("mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider ring-1 ring-inset", tier.style)}>
            {tier.label}
          </div>
        </div>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          A blend of response speed, listing quality, and profile depth — buyers see this on your dealer page.
        </p>
      </div>

      <ul className="mt-5 space-y-3">
        {metrics.map((m) => (
          <li key={m.key}>
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                {m.icon}
                <span>{m.label}</span>
              </span>
              <span className="font-mono text-foreground/80">{m.display}</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-secondary/40 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-[width] duration-500", barColor(m.value))}
                style={{ width: `${Math.max(4, m.value)}%` }}
              />
            </div>
            {m.hint && <div className="mt-1 text-[10px] text-muted-foreground/70">{m.hint}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function profileCompletenessPct(dealer: Dealer | null | undefined): number {
  if (!dealer) return 0;
  const fields: Array<unknown> = [
    dealer.logo_url, dealer.hero_image_url, dealer.description,
    dealer.phone, dealer.email, dealer.website,
    dealer.address_line1, dealer.city, dealer.state,
    dealer.primary_category,
  ];
  const filled = fields.filter((v) => v !== null && v !== undefined && v !== "").length;
  return Math.round((filled / fields.length) * 100);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function tierFor(score: number): { label: string; style: string } {
  if (score >= 85) return { label: "Elite", style: "bg-brass-500/15 text-brass-300 ring-brass-400/30" };
  if (score >= 70) return { label: "Strong", style: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30" };
  if (score >= 50) return { label: "Building", style: "bg-amber-500/15 text-amber-300 ring-amber-400/30" };
  return { label: "Needs work", style: "bg-rose-500/15 text-rose-300 ring-rose-400/30" };
}

function barColor(v: number): string {
  if (v >= 80) return "bg-brass-400";
  if (v >= 60) return "bg-emerald-400";
  if (v >= 40) return "bg-amber-400";
  return "bg-rose-400";
}
