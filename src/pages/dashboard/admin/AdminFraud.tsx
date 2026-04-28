import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, MessageSquare, ShieldAlert, ListChecks, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { setMeta } from "@/lib/seo";
import { timeAgo } from "@/lib/utils";
import type { FraudFlag, FraudSeverity, Inquiry } from "@/types/database";

const VARIANT: Record<FraudSeverity, "default" | "accent" | "good" | "bad"> = {
  low: "default",
  medium: "accent",
  high: "bad",
  critical: "bad",
};

interface FlagWithContext extends FraudFlag {
  inquiry: (Inquiry & { listing: { title: string; slug: string } | null }) | null;
}

export default function AdminFraud() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [resolving, setResolving] = useState<FlagWithContext | null>(null);
  const [notes, setNotes] = useState("");
  const [tab, setTab] = useState<"open" | "resolved">("open");

  useEffect(() => { setMeta({ title: "Admin · fraud", description: "Open fraud flags." }); }, []);

  const { data: flags = [], isLoading } = useQuery({
    queryKey: ["admin-fraud", tab],
    queryFn: async (): Promise<FlagWithContext[]> => {
      const { data, error } = await supabase
        .from("fraud_flags")
        .select("*, inquiry:inquiries(*, listing:listings(title, slug))")
        .eq("resolved", tab === "resolved")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as FlagWithContext[];
    },
  });

  async function resolve() {
    if (!resolving) return;
    await supabase.from("fraud_flags").update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: user?.id ?? null,
      resolution: notes || "resolved",
    }).eq("id", resolving.id);
    setResolving(null);
    setNotes("");
    void qc.invalidateQueries({ queryKey: ["admin-fraud"] });
  }

  async function markInquirySpam(inquiryId: string) {
    await supabase.from("inquiries")
      .update({ is_spam: true, status: "spam" })
      .eq("id", inquiryId);
    void qc.invalidateQueries({ queryKey: ["admin-fraud"] });
  }

  const counts = { open: tab === "open" ? flags.length : "—", resolved: tab === "resolved" ? flags.length : "—" };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldAlert className="h-6 w-6 text-brass-400" />
        <h1 className="font-display text-3xl">Fraud flags</h1>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "open" | "resolved")}>
        <TabsList>
          <TabsTrigger value="open">Open · {counts.open}</TabsTrigger>
          <TabsTrigger value="resolved">Resolved · {counts.resolved}</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 skeleton rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              {flags.map((f) => (
                <div key={f.id} className="rounded-lg border border-border bg-card p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={VARIANT[f.severity]}>{f.severity}</Badge>
                        {f.resolved && <Badge variant="good">resolved</Badge>}
                        <span className="text-xs font-mono text-muted-foreground">{timeAgo(f.created_at)} ago</span>
                      </div>
                      <div className="mt-2 text-sm whitespace-pre-wrap">{f.reason}</div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {!f.resolved && f.inquiry && (
                        <Button size="sm" variant="outline" onClick={() => { void markInquirySpam(f.inquiry!.id); }}>
                          Mark spam
                        </Button>
                      )}
                      {!f.resolved && (
                        <Button size="sm" onClick={() => { setResolving(f); setNotes(""); }}>
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>

                  {f.inquiry && (
                    <div className="rounded-md border border-border bg-secondary/40 p-3 text-sm space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                        <ListChecks className="h-3 w-3" />
                        on listing
                        <span className="text-foreground">{f.inquiry.listing?.title ?? "(removed)"}</span>
                        {typeof f.inquiry.lead_score === "number" && (
                          <span className="ml-auto text-brass-400">buyer score · {f.inquiry.lead_score}</span>
                        )}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 text-xs"><Mail className="h-3 w-3 text-muted-foreground" /> <span className="font-mono">{f.inquiry.buyer_email}</span></div>
                        {f.inquiry.buyer_phone && <div className="flex items-center gap-2 text-xs"><span className="font-mono">{f.inquiry.buyer_phone}</span></div>}
                      </div>
                      <div className="flex gap-2 text-sm">
                        <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <p className="whitespace-pre-wrap text-muted-foreground">{f.inquiry.message}</p>
                      </div>
                    </div>
                  )}

                  {f.resolved && f.resolution && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-mono uppercase tracking-wider">Resolution:</span> {f.resolution}
                    </div>
                  )}
                </div>
              ))}
              {!flags.length && (
                <div className="rounded-lg border border-dashed border-border p-12 text-center">
                  <ShieldCheck className="h-8 w-8 mx-auto text-emerald-400 mb-3" />
                  <div className="font-display text-base">{tab === "open" ? "All clear" : "No history"}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tab === "open"
                      ? "AI fraud screening flags suspicious inquiries automatically. Nothing needs your attention right now."
                      : "Resolved flags will appear here for audit history."}
                  </p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!resolving} onOpenChange={(o) => !o && setResolving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve fraud flag</DialogTitle>
            <DialogDescription>Add a short note describing the action you took.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="notes">Resolution notes</Label>
            <Textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="banned user · contacted seller · false positive · …"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolving(null)}>Cancel</Button>
            <Button onClick={() => { void resolve(); }}>Mark resolved</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
