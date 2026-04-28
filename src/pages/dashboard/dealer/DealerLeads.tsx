import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { LeadQualityBadge } from "@/components/listings/LeadQualityBadge";
import { setMeta } from "@/lib/seo";
import { timeAgo } from "@/lib/utils";
import type { Inquiry, LeadStatus } from "@/types/database";

const STATUS_VARIANT: Record<LeadStatus, "default" | "accent" | "good" | "bad"> = {
  new: "accent",
  contacted: "default",
  qualified: "good",
  offer: "good",
  closed_won: "good",
  closed_lost: "default",
  spam: "bad",
};

interface InquiryWithListing extends Inquiry {
  listing: { title: string; slug: string } | null;
}

export default function DealerLeads() {
  const { profile } = useAuth();
  useEffect(() => { setMeta({ title: "Dealer · leads", description: "Inbound buyer leads." }); }, []);
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["dealer-leads", profile?.dealer_id],
    enabled: !!profile?.dealer_id,
    queryFn: async (): Promise<InquiryWithListing[]> => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*, listing:listings(title, slug)")
        .eq("dealer_id", profile!.dealer_id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as InquiryWithListing[];
    },
  });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Leads</h1>
      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <div className="space-y-3">
          {leads.map((q) => (
            <div key={q.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-display text-lg">{q.buyer_name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{q.buyer_email}{q.buyer_phone ? ` · ${q.buyer_phone}` : ""}</div>
                  <div className="text-xs text-muted-foreground mt-1">on {q.listing?.title ?? "(removed listing)"} · {timeAgo(q.created_at)} ago</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <LeadQualityBadge inquiry={q} />
                  <Badge variant={STATUS_VARIANT[q.status]}>{q.status}</Badge>
                </div>
              </div>
              <p className="mt-3 text-sm whitespace-pre-wrap text-muted-foreground">{q.message}</p>
            </div>
          ))}
          {!leads.length && (
            <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">No leads yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
