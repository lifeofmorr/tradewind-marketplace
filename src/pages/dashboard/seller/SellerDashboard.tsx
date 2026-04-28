import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useListings } from "@/hooks/useListings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { setMeta } from "@/lib/seo";
import { formatNumber } from "@/lib/utils";

export default function SellerDashboard() {
  const { user, profile } = useAuth();
  const { data: listings = [] } = useListings({ seller_id: user?.id, limit: 100 });
  useEffect(() => { setMeta({ title: "Seller dashboard", description: "Your listings, inquiries, and stats." }); }, []);
  const active = listings.filter((l) => l.status === "active").length;
  const draft = listings.filter((l) => l.status === "draft").length;
  const sold = listings.filter((l) => l.status === "sold").length;
  const totalViews = listings.reduce((sum, l) => sum + (l.view_count ?? 0), 0);
  const totalInquiries = listings.reduce((sum, l) => sum + (l.inquiry_count ?? 0), 0);
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">Seller</div>
          <h1 className="font-display text-3xl mt-1">Welcome, {profile?.full_name?.split(" ")[0] ?? "there"}</h1>
        </div>
        <Button asChild><Link to="/seller/listings/new"><Plus className="h-4 w-4" /> New listing</Link></Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Active" value={active} />
        <Stat label="Draft" value={draft} />
        <Stat label="Sold" value={sold} />
        <Stat label="Views (all-time)" value={formatNumber(totalViews)} />
        <Stat label="Inquiries (all-time)" value={formatNumber(totalInquiries)} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Quick links</CardTitle>
          <CardDescription>Most common things sellers do.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="outline"><Link to="/seller/listings">Manage listings</Link></Button>
          <Button asChild variant="outline"><Link to="/seller/inquiries">View inquiries</Link></Button>
          <Button asChild variant="outline"><Link to="/pricing">Featured upgrades</Link></Button>
        </CardContent>
      </Card>
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
