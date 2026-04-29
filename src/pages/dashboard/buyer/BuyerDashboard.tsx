import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedListings } from "@/hooks/useSavedListings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BuyerReadinessCard } from "@/components/buyer/BuyerReadinessCard";
import { TrustScoreCard } from "@/components/buyer/TrustScoreCard";
import { WatchlistCard } from "@/components/buyer/WatchlistCard";
import { setMeta } from "@/lib/seo";

export default function BuyerDashboard() {
  const { profile } = useAuth();
  const { data: saved = [] } = useSavedListings();
  useEffect(() => { setMeta({ title: "Buyer dashboard", description: "Saved listings and requests." }); }, []);
  return (
    <div className="space-y-8">
      <div>
        <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">Buyer</div>
        <h1 className="font-display text-3xl mt-1">Welcome, {profile?.full_name?.split(" ")[0] ?? "there"}</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <TrustScoreCard
          profile={(profile ?? {}) as {
            verification_level?: string | null;
            buyer_readiness_score?: number | null;
            banned?: boolean | null;
          }}
        />
        <BuyerReadinessCard />
        <WatchlistCard />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="lift-card brass-glow">
          <CardHeader><CardTitle>Saved listings</CardTitle></CardHeader>
          <CardContent>
            <div className="font-display text-3xl">{saved.length}</div>
            <Button asChild variant="outline" size="sm" className="mt-3"><Link to="/buyer/saved">View saved</Link></Button>
          </CardContent>
        </Card>
        <Card className="lift-card brass-glow">
          <CardHeader><CardTitle>Requests</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Concierge, financing, insurance, inspections, transport.</p>
            <Button asChild variant="outline" size="sm" className="mt-3"><Link to="/buyer/requests">My requests</Link></Button>
          </CardContent>
        </Card>
        <Card className="lift-card brass-glow">
          <CardHeader><CardTitle>Financial hub</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Pre-qualification, partners, and bank verification.</p>
            <Button asChild variant="outline" size="sm" className="mt-3"><Link to="/buyer/finance">Open hub</Link></Button>
          </CardContent>
        </Card>
        <Card className="lift-card brass-glow">
          <CardHeader><CardTitle>Concierge</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Tell us what you want and we source it.</p>
            <Button asChild size="sm" className="mt-3"><Link to="/concierge">Start</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
