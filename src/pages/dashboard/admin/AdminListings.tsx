import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, FileSearch } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/EmptyState";
import { setMeta } from "@/lib/seo";
import { formatCents, timeAgo } from "@/lib/utils";
import type { Listing, ListingStatus } from "@/types/database";

const STATUS_VARIANT: Record<ListingStatus, "default" | "accent" | "good" | "bad"> = {
  draft: "default",
  pending_review: "accent",
  active: "good",
  sold: "default",
  expired: "default",
  rejected: "bad",
  removed: "bad",
};

export default function AdminListings() {
  const qc = useQueryClient();
  const [rejecting, setRejecting] = useState<{ id: string; title: string } | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { setMeta({ title: "Admin · listings", description: "Approve, reject, remove listings." }); }, []);
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["admin-listings"],
    queryFn: async (): Promise<Listing[]> => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .in("status", ["pending_review", "active", "rejected", "removed"])
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as Listing[];
    },
  });

  async function setStatus(id: string, status: ListingStatus, rejectionReason?: string) {
    await supabase.from("listings").update({
      status,
      rejection_reason: rejectionReason ?? null,
      reviewed_at: new Date().toISOString(),
      ...(status === "active" ? { published_at: new Date().toISOString() } : {}),
    }).eq("id", id);

    // Email the seller on approval (Phase 2D). Fire-and-forget; failures
    // shouldn't block the moderation action.
    if (status === "active") {
      const { data: row } = await supabase
        .from("listings")
        .select("title, slug, seller_id, profiles:seller_id(email)")
        .eq("id", id)
        .maybeSingle();
      const cast = row as { title: string; slug: string; profiles: { email: string } | null } | null;
      if (cast?.profiles?.email) {
        void supabase.functions.invoke("send-email", {
          body: {
            template: "listing_approved",
            to: cast.profiles.email,
            props: { listing_title: cast.title, listing_slug: cast.slug },
          },
        });
      }
    }

    void qc.invalidateQueries({ queryKey: ["admin-listings"] });
  }

  async function confirmReject() {
    if (!rejecting) return;
    setSubmitting(true);
    try {
      await setStatus(rejecting.id, "rejected", reason.trim() || "Did not meet listing standards");
    } finally {
      setSubmitting(false);
      setRejecting(null);
      setReason("");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Listings moderation</h1>
      {isLoading ? (
        <div className="rounded-lg border border-border overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 skeleton border-b border-border last:border-0" />
          ))}
        </div>
      ) : !listings.length ? (
        <EmptyState
          icon={FileSearch}
          title="Inbox empty"
          body="Pending submissions appear here for approve/reject. Use this view to keep the marketplace fresh."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Submitted</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className="border-t border-border">
                  <td className="px-4 py-3">{l.title}</td>
                  <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[l.status]}>{l.status}</Badge></td>
                  <td className="px-4 py-3 text-right font-mono">{formatCents(l.price_cents)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{timeAgo(l.created_at)} ago</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {l.status === "pending_review" && (
                      <>
                        <Button size="sm" onClick={() => { void setStatus(l.id, "active"); }}><Check className="h-3 w-3" /> Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => { setReason(""); setRejecting({ id: l.id, title: l.title }); }}><X className="h-3 w-3" /> Reject</Button>
                      </>
                    )}
                    {l.status === "active" && (
                      <Button size="sm" variant="outline" onClick={() => { void setStatus(l.id, "removed"); }}>Remove</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!rejecting} onOpenChange={(o) => { if (!o) { setRejecting(null); setReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject listing</DialogTitle>
            <DialogDescription>
              {rejecting ? <>Reason will be visible to the seller for <span className="text-foreground">{rejecting.title}</span>.</> : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Rejection reason</Label>
            <Textarea
              id="reject-reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Misleading photos · price doesn't match condition · spam · …"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejecting(null); setReason(""); }} disabled={submitting}>Cancel</Button>
            <Button variant="destructive" onClick={() => { void confirmReject(); }} disabled={submitting}>
              {submitting ? "Rejecting…" : "Reject listing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
