import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, FileSearch, Copy, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/EmptyState";
import { setMeta } from "@/lib/seo";
import { formatCents, slugify, timeAgo } from "@/lib/utils";
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

type Filter = "all" | "real" | "demo";

export default function AdminListings() {
  const qc = useQueryClient();
  const [rejecting, setRejecting] = useState<{ id: string; title: string } | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [converting, setConverting] = useState<Listing | null>(null);
  const [duplicating, setDuplicating] = useState<Listing | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => { setMeta({ title: "Admin · listings", description: "Approve, reject, remove listings." }); }, []);
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["admin-listings"],
    queryFn: async (): Promise<Listing[]> => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .in("status", ["draft", "pending_review", "active", "rejected", "removed"])
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as Listing[];
    },
  });

  const filtered = useMemo(() => {
    if (filter === "real") return listings.filter((l) => !l.is_demo);
    if (filter === "demo") return listings.filter((l) => l.is_demo);
    return listings;
  }, [listings, filter]);

  const counts = useMemo(() => ({
    all: listings.length,
    real: listings.filter((l) => !l.is_demo).length,
    demo: listings.filter((l) => l.is_demo).length,
  }), [listings]);

  async function setStatus(id: string, status: ListingStatus, rejectionReason?: string) {
    await supabase.from("listings").update({
      status,
      rejection_reason: rejectionReason ?? null,
      reviewed_at: new Date().toISOString(),
      ...(status === "active" ? { published_at: new Date().toISOString() } : {}),
    }).eq("id", id);

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

  async function confirmConvert() {
    if (!converting) return;
    setActionBusy(true);
    setActionError(null);
    try {
      const { error } = await supabase
        .from("listings")
        .update({ is_demo: false, updated_at: new Date().toISOString() })
        .eq("id", converting.id);
      if (error) throw error;
      void qc.invalidateQueries({ queryKey: ["admin-listings"] });
      setConverting(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not convert listing");
    } finally {
      setActionBusy(false);
    }
  }

  async function confirmDuplicate() {
    if (!duplicating) return;
    setActionBusy(true);
    setActionError(null);
    try {
      const src = duplicating;
      const newSlug = `${slugify(src.title)}-${Math.random().toString(36).slice(2, 8)}`;
      const insertRow = {
        slug: newSlug,
        category: src.category,
        title: `${src.title} (template)`,
        description: src.description,
        ai_summary: src.ai_summary,
        make: src.make,
        model: src.model,
        trim_or_grade: src.trim_or_grade,
        year: src.year,
        price_cents: src.price_cents,
        currency: src.currency,
        condition: src.condition,
        mileage: src.mileage,
        fuel_type: src.fuel_type,
        transmission: src.transmission,
        drivetrain: src.drivetrain,
        body_style: src.body_style,
        exterior_color: src.exterior_color,
        interior_color: src.interior_color,
        hours: src.hours,
        length_ft: src.length_ft,
        beam_ft: src.beam_ft,
        hull_material: src.hull_material,
        hull_type: src.hull_type,
        engine_count: src.engine_count,
        engine_make: src.engine_make,
        engine_model: src.engine_model,
        engine_hp: src.engine_hp,
        fuel_capacity_gal: src.fuel_capacity_gal,
        city: src.city,
        state: src.state,
        zip: src.zip,
        seller_type: src.seller_type,
        seller_id: src.seller_id,
        dealer_id: src.dealer_id,
        cover_photo_url: src.cover_photo_url,
        is_demo: false,
        status: "draft" as ListingStatus,
      };
      const { error } = await supabase.from("listings").insert(insertRow);
      if (error) throw error;
      void qc.invalidateQueries({ queryKey: ["admin-listings"] });
      setDuplicating(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not duplicate listing");
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow">Admin · listings</div>
        <h1 className="section-title">Moderation queue</h1>
        <p className="text-sm text-muted-foreground mt-2">Approve, reject, remove. Convert demo seed listings to real once the seller is verified.</p>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="real">Real ({counts.real})</TabsTrigger>
          <TabsTrigger value="demo">Demo ({counts.demo})</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="rounded-lg border border-border overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 skeleton border-b border-border last:border-0" />
          ))}
        </div>
      ) : !filtered.length ? (
        <EmptyState
          icon={FileSearch}
          title="Nothing in this view"
          body="Try a different filter, or wait for new submissions to land in the queue."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Submitted</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-t border-border">
                  <td className="px-4 py-3">{l.title}</td>
                  <td className="px-4 py-3">
                    {l.is_demo ? <Badge variant="accent">Demo</Badge> : <Badge variant="good">Real</Badge>}
                  </td>
                  <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[l.status]}>{l.status}</Badge></td>
                  <td className="px-4 py-3 text-right font-mono">{formatCents(l.price_cents)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{timeAgo(l.created_at)} ago</td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    {l.status === "pending_review" && (
                      <>
                        <Button size="sm" onClick={() => { void setStatus(l.id, "active"); }}><Check className="h-3 w-3" /> Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => { setReason(""); setRejecting({ id: l.id, title: l.title }); }}><X className="h-3 w-3" /> Reject</Button>
                      </>
                    )}
                    {l.status === "active" && !l.is_demo && (
                      <Button size="sm" variant="outline" onClick={() => { void setStatus(l.id, "removed"); }}>Remove</Button>
                    )}
                    {l.is_demo && (
                      <Button size="sm" variant="outline" onClick={() => { setActionError(null); setConverting(l); }}>
                        <ShieldCheck className="h-3 w-3" /> Convert to Real
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => { setActionError(null); setDuplicating(l); }}>
                      <Copy className="h-3 w-3" /> Duplicate
                    </Button>
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

      <Dialog open={!!converting} onOpenChange={(o) => { if (!o) { setConverting(null); setActionError(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert demo to real?</DialogTitle>
            <DialogDescription>
              Converting removes the demo flag on <span className="text-foreground">{converting?.title}</span>. Verify
              the seller and dealer info first — once converted, the listing displays as live inventory.
            </DialogDescription>
          </DialogHeader>
          {actionError && <p className="text-xs text-red-400" role="alert">{actionError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConverting(null)} disabled={actionBusy}>Cancel</Button>
            <Button onClick={() => { void confirmConvert(); }} disabled={actionBusy}>
              {actionBusy ? "Converting…" : "Convert to Real"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!duplicating} onOpenChange={(o) => { if (!o) { setDuplicating(null); setActionError(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate as template?</DialogTitle>
            <DialogDescription>
              Creates a new draft from <span className="text-foreground">{duplicating?.title}</span>. The copy is not a
              demo — edit the seller, photos, and details before publishing.
            </DialogDescription>
          </DialogHeader>
          {actionError && <p className="text-xs text-red-400" role="alert">{actionError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicating(null)} disabled={actionBusy}>Cancel</Button>
            <Button onClick={() => { void confirmDuplicate(); }} disabled={actionBusy}>
              {actionBusy ? "Duplicating…" : "Create draft copy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
