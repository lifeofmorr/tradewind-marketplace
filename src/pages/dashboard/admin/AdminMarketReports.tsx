import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { CATEGORIES } from "@/lib/categories";
import { setMeta } from "@/lib/seo";
import { slugify, timeAgo } from "@/lib/utils";
import type { MarketReport, ListingCategory } from "@/types/database";

const NONE = "_none";

export default function AdminMarketReports() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<MarketReport | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => { setMeta({ title: "Admin · market reports", description: "CRUD for market reports." }); }, []);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["admin-market-reports"],
    queryFn: async (): Promise<MarketReport[]> => {
      const { data, error } = await supabase.from("market_reports").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return (data ?? []) as MarketReport[];
    },
  });

  async function togglePublish(r: MarketReport) {
    const next = !r.is_published;
    await supabase.from("market_reports").update({
      is_published: next,
      published_at: next && !r.published_at ? new Date().toISOString() : r.published_at,
    }).eq("id", r.id);
    void qc.invalidateQueries({ queryKey: ["admin-market-reports"] });
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this report?")) return;
    await supabase.from("market_reports").delete().eq("id", id);
    void qc.invalidateQueries({ queryKey: ["admin-market-reports"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Market reports</h1>
        <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New report</Button>
      </div>
      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded border border-border bg-card px-4 py-3 text-sm">
              <div className="min-w-0">
                <div className="font-display truncate">{r.title}</div>
                <div className="text-xs text-muted-foreground">/market-reports/{r.slug} · {timeAgo(r.created_at)} ago</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={r.is_published ? "good" : "default"}>{r.is_published ? "published" : "draft"}</Badge>
                <Button size="sm" variant="ghost" onClick={() => setEditing(r)}>Edit</Button>
                <Button size="sm" variant="outline" onClick={() => { void togglePublish(r); }}>
                  {r.is_published ? "Unpublish" : "Publish"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { void remove(r.id); }}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}
          {!reports.length && <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">No reports yet.</div>}
        </div>
      )}
      <ReportDialog
        open={creating || !!editing}
        report={editing}
        onClose={() => { setCreating(false); setEditing(null); }}
        onSaved={() => void qc.invalidateQueries({ queryKey: ["admin-market-reports"] })}
      />
    </div>
  );
}

interface DialogProps {
  open: boolean;
  report: MarketReport | null;
  onClose: () => void;
  onSaved: () => void;
}

function ReportDialog({ open, report, onClose, onSaved }: DialogProps) {
  const [title, setTitle] = useState(report?.title ?? "");
  const [summary, setSummary] = useState(report?.summary ?? "");
  const [body, setBody] = useState(report?.body_md ?? "");
  const [category, setCategory] = useState<ListingCategory | null>(report?.category ?? null);
  const [region, setRegion] = useState(report?.region ?? "");
  const [coverUrl, setCoverUrl] = useState(report?.cover_image_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(report?.title ?? "");
    setSummary(report?.summary ?? "");
    setBody(report?.body_md ?? "");
    setCategory(report?.category ?? null);
    setRegion(report?.region ?? "");
    setCoverUrl(report?.cover_image_url ?? "");
    setError(null);
  }, [open, report]);

  async function save() {
    if (!title.trim() || !body.trim()) {
      setError("Title and body are required.");
      return;
    }
    setBusy(true);
    if (report) {
      await supabase.from("market_reports").update({
        title, summary: summary || null, body_md: body, category,
        region: region || null, cover_image_url: coverUrl || null,
      }).eq("id", report.id);
    } else {
      const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`;
      await supabase.from("market_reports").insert({
        slug, title, summary: summary || null, body_md: body, category,
        region: region || null, cover_image_url: coverUrl || null,
      });
    }
    setBusy(false);
    onSaved();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>{report ? "Edit report" : "New report"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label>Summary</Label><Textarea rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={category ?? NONE} onValueChange={(v) => setCategory(v === NONE ? null : (v as ListingCategory))}>
                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {CATEGORIES.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Region</Label><Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Southeast US" /></div>
          </div>
          <div><Label>Cover image URL</Label><Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://" /></div>
          <div><Label>Body (Markdown)</Label><Textarea rows={14} value={body} onChange={(e) => setBody(e.target.value)} className="font-mono text-xs" /></div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { void save(); }} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
