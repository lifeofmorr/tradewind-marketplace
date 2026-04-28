import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Inbox, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LeadQualityBadge } from "@/components/listings/LeadQualityBadge";
import { DealerFollowUpAssistant } from "@/components/dealer/DealerFollowUpAssistant";
import { setMeta } from "@/lib/seo";
import { timeAgo } from "@/lib/utils";
import type { Inquiry, LeadStatus, Dealer } from "@/types/database";

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
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => { setMeta({ title: "Dealer · leads", description: "Inbound buyer leads with AI follow-up." }); }, []);

  const { data: dealer } = useQuery({
    queryKey: ["dealer-name", profile?.dealer_id],
    enabled: !!profile?.dealer_id,
    queryFn: async (): Promise<Dealer | null> => {
      const { data, error } = await supabase.from("dealers").select("*").eq("id", profile!.dealer_id!).maybeSingle();
      if (error) throw error;
      return (data as Dealer | null) ?? null;
    },
  });

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
      <div>
        <div className="eyebrow">Dealer · leads</div>
        <h1 className="section-title">Lead inbox</h1>
        <p className="text-sm text-muted-foreground mt-2">Inbound buyer leads on your dealership inventory. Tap "AI follow-up" to draft a reply in one click.</p>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 skeleton rounded-lg" />
          ))}
        </div>
      ) : !leads.length ? (
        <EmptyState
          icon={Inbox}
          title="No leads yet"
          body="Leads land here the moment a buyer messages one of your listings. Boost a top listing to drive impressions."
          cta={{ label: "View inventory", to: "/dealer/inventory" }}
          secondary={{ label: "Boost a listing", to: "/pricing", variant: "outline" }}
        />
      ) : (
        <div className="space-y-3">
          {leads.map((q) => {
            const isOpen = openId === q.id;
            return (
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
                <div className="mt-3">
                  <Button
                    type="button"
                    size="sm"
                    variant={isOpen ? "outline" : "default"}
                    onClick={() => setOpenId(isOpen ? null : q.id)}
                  >
                    {isOpen ? <><ChevronUp className="h-3 w-3 mr-1" /> Hide AI follow-up</> : <><Sparkles className="h-3 w-3 mr-1" /> AI follow-up <ChevronDown className="h-3 w-3 ml-1" /></>}
                  </Button>
                </div>
                {isOpen && (
                  <DealerFollowUpAssistant
                    inquiry={q}
                    listingTitle={q.listing?.title ?? null}
                    dealerName={dealer?.name ?? null}
                    agentName={profile?.full_name ?? null}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
