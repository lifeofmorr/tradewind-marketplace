import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, ExternalLink, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useListings } from "@/hooks/useListings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { setMeta } from "@/lib/seo";
import { formatCents, formatNumber } from "@/lib/utils";
import type { ListingStatus } from "@/types/database";

const STATUS_VARIANT: Record<ListingStatus, "default" | "accent" | "good" | "bad"> = {
  draft: "default",
  pending_review: "accent",
  active: "good",
  sold: "default",
  expired: "default",
  rejected: "bad",
  removed: "bad",
};

export default function SellerListings() {
  const { user } = useAuth();
  const { data: listings = [], isLoading } = useListings({ seller_id: user?.id, limit: 200 });
  useEffect(() => { setMeta({ title: "Seller · listings", description: "Manage your listings." }); }, []);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Listings</h1>
        <Button asChild><Link to="/seller/listings/new"><Plus className="h-4 w-4" /> New listing</Link></Button>
      </div>
      {isLoading ? (
        <div className="rounded-lg border border-border overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 skeleton border-b border-border last:border-0" />
          ))}
        </div>
      ) : !listings.length ? (
        <EmptyState
          icon={FileText}
          title="No listings yet"
          body="Drop in a few details and our AI will draft a polished listing for you in under a minute."
          cta={{ label: "Create your first listing", to: "/seller/listings/new" }}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Price</th>
                <th className="text-right px-4 py-3">Views</th>
                <th className="text-right px-4 py-3">Inquiries</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <Link to={`/seller/listings/${l.id}`} className="hover:text-brass-400">{l.title}</Link>
                  </td>
                  <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[l.status]}>{l.status}</Badge></td>
                  <td className="px-4 py-3 text-right font-mono">{formatCents(l.price_cents)}</td>
                  <td className="px-4 py-3 text-right">{formatNumber(l.view_count)}</td>
                  <td className="px-4 py-3 text-right">{formatNumber(l.inquiry_count)}</td>
                  <td className="px-4 py-3 text-right">
                    {l.status === "active" && (
                      <Link to={`/listings/${l.slug}`} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs">
                        View <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
