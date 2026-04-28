import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, ImageIcon, Clock, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useListings } from "@/hooks/useListings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { calculateListingQuality } from "@/lib/listingQuality";
import { setMeta } from "@/lib/seo";
import { formatNumber } from "@/lib/utils";
import type { Listing } from "@/types/database";

interface NextAction {
  key: string;
  label: string;
  body: string;
  to: string;
  tone: "amber" | "rose" | "brass" | "default";
  icon: typeof ImageIcon;
}

export default function DealerAnalytics() {
  const { profile } = useAuth();
  useEffect(() => { setMeta({ title: "Dealer · analytics", description: "Performance and inventory health." }); }, []);
  const { data: listings = [] } = useListings({ dealer_id: profile?.dealer_id ?? undefined, limit: 500 });

  const stats = useMemo(() => {
    const active = listings.filter((l) => l.status === "active");
    const totalViews = listings.reduce((s, l) => s + (l.view_count ?? 0), 0);
    const totalInquiries = listings.reduce((s, l) => s + (l.inquiry_count ?? 0), 0);
    const conv = totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(2) + "%" : "—";

    const missingPhotos = active.filter((l) => !l.cover_photo_url);
    const now = Date.now();
    const stale = active.filter((l) => {
      if (!l.published_at) return false;
      const ageDays = (now - new Date(l.published_at).getTime()) / (1000 * 60 * 60 * 24);
      return ageDays > 30 && (l.inquiry_count ?? 0) === 0;
    });
    const weakQuality = active.filter((l) => {
      const q = calculateListingQuality({ listing: l }).score;
      return q < 50;
    });
    const featured = active.filter((l) => l.is_featured);

    // Featured candidates: top 3 by inquiries that aren't already featured
    const featuredCandidates = [...active]
      .filter((l) => !l.is_featured)
      .sort((a, b) => (b.inquiry_count ?? 0) - (a.inquiry_count ?? 0))
      .slice(0, 3);

    const top = [...listings]
      .sort((a, b) => (b.inquiry_count ?? 0) - (a.inquiry_count ?? 0))
      .slice(0, 10);

    return {
      active,
      totalViews,
      totalInquiries,
      conv,
      missingPhotos,
      stale,
      weakQuality,
      featured,
      featuredCandidates,
      top,
    };
  }, [listings]);

  const nextActions = useMemo<NextAction[]>(() => {
    const out: NextAction[] = [];
    if (stats.missingPhotos.length > 0) {
      out.push({
        key: "photos",
        label: `Add cover photos (${stats.missingPhotos.length})`,
        body: "Listings without a cover photo lose ~70% of clicks. Upload from the inventory editor.",
        to: "/dealer/inventory",
        tone: "rose",
        icon: ImageIcon,
      });
    }
    if (stats.stale.length > 0) {
      out.push({
        key: "stale",
        label: `Refresh stale listings (${stats.stale.length})`,
        body: "30+ days live with no inquiries — refresh photos, retitle, or boost to revive impressions.",
        to: "/dealer/inventory",
        tone: "amber",
        icon: Clock,
      });
    }
    if (stats.weakQuality.length > 0) {
      out.push({
        key: "quality",
        label: `Improve weak listings (${stats.weakQuality.length})`,
        body: "Quality score under 50. Add specs, better description, more photos.",
        to: "/dealer/inventory",
        tone: "amber",
        icon: AlertTriangle,
      });
    }
    if (stats.featuredCandidates.length > 0) {
      out.push({
        key: "boost",
        label: `Boost a top performer (${stats.featuredCandidates.length} candidate${stats.featuredCandidates.length > 1 ? "s" : ""})`,
        body: "These listings already pull leads — featuring multiplies impressions on the home and category pages.",
        to: "/pricing",
        tone: "brass",
        icon: Sparkles,
      });
    }
    if (out.length === 0) {
      out.push({
        key: "all_clear",
        label: "All clear",
        body: "Your inventory is healthy. Keep refreshing inventory weekly to stay top-of-feed.",
        to: "/dealer/inventory",
        tone: "default",
        icon: TrendingUp,
      });
    }
    return out;
  }, [stats]);

  if (!listings.length) {
    return (
      <div className="space-y-6">
        <div>
          <div className="eyebrow">Dealer · analytics</div>
          <h1 className="section-title">Performance</h1>
        </div>
        <EmptyState
          icon={TrendingUp}
          title="No analytics yet"
          body="Once your inventory is live, this dashboard tracks views, inquiries, and the listings driving the most engagement."
          cta={{ label: "Add inventory", to: "/seller/listings/new" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="eyebrow">Dealer · analytics</div>
          <h1 className="section-title">Performance</h1>
        </div>
        <Button asChild variant="outline" size="sm"><Link to="/dealer/inventory">Manage inventory</Link></Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Active" value={stats.active.length} />
        <Stat label="Views" value={formatNumber(stats.totalViews)} />
        <Stat label="Inquiries" value={formatNumber(stats.totalInquiries)} />
        <Stat label="View → inquiry" value={stats.conv} />
      </div>

      {/* Inventory Health */}
      <section>
        <div className="eyebrow">Inventory health</div>
        <h2 className="section-title">Where to focus</h2>
        <div className="section-title-underline mb-4" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HealthStat icon={ImageIcon} label="Missing cover photo" value={stats.missingPhotos.length} tone={stats.missingPhotos.length ? "rose" : "default"} />
          <HealthStat icon={Clock} label="Stale (30+ days)" value={stats.stale.length} tone={stats.stale.length ? "amber" : "default"} />
          <HealthStat icon={AlertTriangle} label="Weak quality (<50)" value={stats.weakQuality.length} tone={stats.weakQuality.length ? "amber" : "default"} />
          <HealthStat icon={Sparkles} label="Featured live" value={stats.featured.length} tone="brass" />
        </div>
      </section>

      {/* Next best actions */}
      <section>
        <div className="eyebrow">Next best actions</div>
        <h2 className="section-title">Move the needle</h2>
        <div className="section-title-underline mb-4" />
        <div className="space-y-2">
          {nextActions.map((a) => (
            <Link
              key={a.key}
              to={a.to}
              className="block glass-card lift-card p-4 border border-border hover:border-brass-500/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <a.icon className="h-4 w-4 text-brass-400 mt-0.5" />
                  <div>
                    <div className="font-display text-base">{a.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{a.body}</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured recommendations */}
      {stats.featuredCandidates.length > 0 && (
        <section>
          <h2 className="font-display text-xl mb-3">Top candidates to feature</h2>
          <div className="grid gap-2">
            {stats.featuredCandidates.map((l) => (
              <CandidateRow key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display text-xl mb-3">Top by inquiries</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-right px-4 py-3">Views</th>
                <th className="text-right px-4 py-3">Inquiries</th>
                <th className="text-right px-4 py-3">Saves</th>
              </tr>
            </thead>
            <tbody>
              {stats.top.map((l) => (
                <tr key={l.id} className="border-t border-border">
                  <td className="px-4 py-3">{l.title}</td>
                  <td className="px-4 py-3 text-right">{formatNumber(l.view_count)}</td>
                  <td className="px-4 py-3 text-right">{formatNumber(l.inquiry_count)}</td>
                  <td className="px-4 py-3 text-right">{formatNumber(l.save_count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-3xl mt-1">{value}</div>
    </div>
  );
}

const TONE: Record<string, string> = {
  default: "border-border",
  amber: "border-amber-500/30 bg-amber-500/5",
  rose: "border-rose-500/30 bg-rose-500/5",
  brass: "border-brass-500/30 bg-brass-500/5",
};

function HealthStat({
  icon: Icon, label, value, tone = "default",
}: { icon: typeof ImageIcon; label: string; value: number; tone?: keyof typeof TONE }) {
  return (
    <div className={`rounded-lg border bg-card p-4 ${TONE[tone]}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className="h-4 w-4 text-brass-400" />
      </div>
      <div className="font-display text-3xl mt-1">{value}</div>
    </div>
  );
}

function CandidateRow({ listing }: { listing: Listing }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-border bg-card px-4 py-3 text-sm">
      <div>
        <div className="font-display">{listing.title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {formatNumber(listing.inquiry_count ?? 0)} inquiries · {formatNumber(listing.view_count ?? 0)} views
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="accent">High-intent</Badge>
        <Button asChild size="sm" variant="outline"><Link to="/pricing">Boost</Link></Button>
      </div>
    </div>
  );
}
