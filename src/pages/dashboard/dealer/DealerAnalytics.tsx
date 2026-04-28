import { useEffect } from "react";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useListings } from "@/hooks/useListings";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { setMeta } from "@/lib/seo";
import { formatNumber } from "@/lib/utils";

export default function DealerAnalytics() {
  const { profile } = useAuth();
  useEffect(() => { setMeta({ title: "Dealer · analytics", description: "Performance and conversion." }); }, []);
  const { data: listings = [] } = useListings({ dealer_id: profile?.dealer_id ?? undefined, limit: 500 });
  const active = listings.filter((l) => l.status === "active");
  const totalViews = listings.reduce((s, l) => s + (l.view_count ?? 0), 0);
  const totalInquiries = listings.reduce((s, l) => s + (l.inquiry_count ?? 0), 0);
  const conv = totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(2) + "%" : "—";
  const top = [...listings].sort((a, b) => (b.inquiry_count ?? 0) - (a.inquiry_count ?? 0)).slice(0, 10);
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
        <Stat label="Active" value={active.length} />
        <Stat label="Views" value={formatNumber(totalViews)} />
        <Stat label="Inquiries" value={formatNumber(totalInquiries)} />
        <Stat label="View → inquiry" value={conv} />
      </div>
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
              {top.map((l) => (
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
