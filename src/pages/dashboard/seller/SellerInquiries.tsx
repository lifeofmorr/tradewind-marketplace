import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Inbox } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
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

export default function SellerInquiries() {
  const { user } = useAuth();
  useEffect(() => { setMeta({ title: "Seller · inquiries", description: "Inquiries from buyers." }); }, []);
  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ["seller-inquiries", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<InquiryWithListing[]> => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*, listing:listings(title, slug)")
        .eq("seller_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as InquiryWithListing[];
    },
  });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Inquiries</h1>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 skeleton rounded-lg" />
          ))}
        </div>
      ) : !inquiries.length ? (
        <EmptyState
          icon={Inbox}
          title="No inquiries yet"
          body="Buyer messages on your listings appear here. Featuring or boosting a listing typically lifts inquiries within 24 hours."
          cta={{ label: "View my listings", to: "/seller/listings" }}
          secondary={{ label: "Boost a listing", to: "/pricing", variant: "outline" }}
        />
      ) : (
        <div className="space-y-3">
          {inquiries.map((q) => (
            <div key={q.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-display text-lg">{q.buyer_name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{q.buyer_email}{q.buyer_phone ? ` · ${q.buyer_phone}` : ""}</div>
                  <div className="text-xs text-muted-foreground mt-1">on <span className="text-foreground">{q.listing?.title ?? "(removed listing)"}</span> · {timeAgo(q.created_at)} ago</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <LeadQualityBadge inquiry={q} />
                  <Badge variant={STATUS_VARIANT[q.status]}>{q.status}</Badge>
                </div>
              </div>
              <p className="mt-3 text-sm whitespace-pre-wrap text-muted-foreground">{q.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
