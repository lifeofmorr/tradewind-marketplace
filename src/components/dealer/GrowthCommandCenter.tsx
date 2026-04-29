import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, Flame, Snowflake, ImageOff, FileEdit, AlertCircle,
  Camera, MessageSquareReply, Sparkles, ArrowRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { calculateListingQuality } from "@/lib/listingQuality";
import { cn } from "@/lib/utils";
import type { Listing, Inquiry } from "@/types/database";

interface Props {
  dealerId: string | undefined;
  listings: Listing[];
}

const HOT_HRS = 24;
const WARM_HRS = 24 * 7;

export function GrowthCommandCenter({ dealerId, listings }: Props) {
  const { data: leads = [] } = useQuery({
    queryKey: ["dealer-leads-pipeline", dealerId],
    enabled: !!dealerId,
    queryFn: async (): Promise<Inquiry[]> => {
      if (!dealerId) return [];
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .eq("dealer_id", dealerId)
        .neq("status", "spam")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as Inquiry[];
    },
  });

  const pipeline = useMemo(() => {
    let hot = 0, warm = 0, cold = 0;
    const now = Date.now();
    for (const l of leads) {
      if (l.status === "closed_won" || l.status === "closed_lost") continue;
      const ageHrs = (now - new Date(l.created_at).getTime()) / 36e5;
      const quality = l.lead_quality_score ?? 50;
      if (ageHrs < HOT_HRS && quality >= 65) hot++;
      else if (ageHrs < WARM_HRS) warm++;
      else cold++;
    }
    return { hot, warm, cold, total: hot + warm + cold };
  }, [leads]);

  const inventory = useMemo(() => {
    const active = listings.filter((l) => l.status === "active");
    const draft = listings.filter((l) => l.status === "draft");
    const missingPhotos = listings.filter(
      (l) => (l.status === "active" || l.status === "draft") && !l.cover_photo_url,
    );
    return {
      active: active.length,
      draft: draft.length,
      missingPhotos: missingPhotos.length,
    };
  }, [listings]);

  const quality = useMemo(() => {
    const eligible = listings.filter((l) => l.status === "active" || l.status === "draft");
    if (eligible.length === 0) return { avg: 0, weak: 0 };
    const scores = eligible.map((l) => calculateListingQuality({ listing: l, photoCount: l.cover_photo_url ? 1 : 0 }).score);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const weak = scores.filter((s) => s < 60).length;
    return { avg, weak };
  }, [listings]);

  const suggestions = useMemo(() => buildSuggestions({ pipeline, inventory, quality }), [pipeline, inventory, quality]);

  return (
    <div className="rounded-xl border border-brass-500/30 bg-gradient-to-br from-brass-500/[0.06] via-card to-card p-5 space-y-5">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-brass-400" />
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-brass-400">Growth Command Center</span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Section title="Lead pipeline" total={pipeline.total} totalLabel="open leads">
          <PipelineRow icon={<Flame className="h-3.5 w-3.5 text-rose-400" />} label="Hot" value={pipeline.hot} accent="text-rose-300" />
          <PipelineRow icon={<TrendingUp className="h-3.5 w-3.5 text-amber-400" />} label="Warm" value={pipeline.warm} accent="text-amber-300" />
          <PipelineRow icon={<Snowflake className="h-3.5 w-3.5 text-sky-400" />} label="Cold" value={pipeline.cold} accent="text-sky-300" />
        </Section>

        <Section title="Inventory health" total={inventory.active} totalLabel="active">
          <PipelineRow icon={<FileEdit className="h-3.5 w-3.5 text-blue-400" />} label="Drafts" value={inventory.draft} />
          <PipelineRow icon={<ImageOff className="h-3.5 w-3.5 text-rose-400" />} label="Missing photos" value={inventory.missingPhotos} />
          <PipelineRow icon={<Sparkles className="h-3.5 w-3.5 text-brass-400" />} label="Total" value={inventory.active + inventory.draft} />
        </Section>

        <Section title="Listing quality" total={quality.avg} totalLabel="avg score">
          <div className="h-2 w-full rounded-full bg-secondary/40 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brass-600 to-brass-400"
              style={{ width: `${quality.avg}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {quality.weak} listing{quality.weak === 1 ? "" : "s"} below 60 — easy wins.
          </div>
        </Section>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-display text-base">Suggested actions</span>
          <span className="text-xs font-mono text-muted-foreground">{suggestions.length} this week</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {suggestions.map((s) => (
            <Link
              key={s.key}
              to={s.to}
              className="group rounded-lg border border-border bg-card/60 p-4 hover:border-brass-500/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-md border border-brass-500/20 bg-brass-500/10 text-brass-300">
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-sm">{s.title}</div>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">{s.body}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:text-brass-400 transition" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Section({ title, total, totalLabel, children }: {
  title: string; total: number; totalLabel: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-4 space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{title}</span>
        <span className="text-[10px] font-mono uppercase text-muted-foreground/70">{totalLabel}</span>
      </div>
      <div className="font-display text-3xl text-brass-400 leading-none">{total}</div>
      <div className="space-y-1 pt-1">{children}</div>
    </div>
  );
}

function PipelineRow({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: number; accent?: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="inline-flex items-center gap-2 text-muted-foreground">{icon}{label}</span>
      <span className={cn("font-mono", accent)}>{value}</span>
    </div>
  );
}

interface SuggestionInput {
  pipeline: { hot: number; warm: number; cold: number; total: number };
  inventory: { active: number; draft: number; missingPhotos: number };
  quality: { avg: number; weak: number };
}

interface Suggestion {
  key: string;
  title: string;
  body: string;
  icon: React.ReactNode;
  to: string;
}

function buildSuggestions({ pipeline, inventory, quality }: SuggestionInput): Suggestion[] {
  const out: Suggestion[] = [];

  if (pipeline.hot > 0) {
    out.push({
      key: "hot-leads",
      title: `Reply to ${pipeline.hot} hot lead${pipeline.hot === 1 ? "" : "s"}`,
      body: "Buyers are 5x more likely to convert when contacted within an hour. Open the inbox.",
      icon: <Flame className="h-4 w-4" />,
      to: "/dealer/leads",
    });
  }

  if (inventory.missingPhotos > 0) {
    out.push({
      key: "missing-photos",
      title: `Add cover photos to ${inventory.missingPhotos} listing${inventory.missingPhotos === 1 ? "" : "s"}`,
      body: "Listings with a cover photo see ~3x more inquiries. Upload one shot per listing.",
      icon: <Camera className="h-4 w-4" />,
      to: "/dealer/inventory",
    });
  }

  if (inventory.draft > 0) {
    out.push({
      key: "publish-drafts",
      title: `Publish ${inventory.draft} draft listing${inventory.draft === 1 ? "" : "s"}`,
      body: "Drafts don't generate leads. Finish them to start collecting inquiries.",
      icon: <FileEdit className="h-4 w-4" />,
      to: "/dealer/inventory",
    });
  }

  if (quality.weak > 0) {
    out.push({
      key: "quality-up",
      title: `Lift ${quality.weak} weak listing${quality.weak === 1 ? "" : "s"}`,
      body: "Listings under 60 quality miss filter cutoffs. Fill out specs, description, and photos.",
      icon: <AlertCircle className="h-4 w-4" />,
      to: "/dealer/inventory",
    });
  }

  if (pipeline.cold > pipeline.hot && pipeline.cold > 0) {
    out.push({
      key: "follow-up",
      title: `Re-engage ${pipeline.cold} cold lead${pipeline.cold === 1 ? "" : "s"}`,
      body: "Use the AI follow-up assistant to draft a 'still looking?' message in seconds.",
      icon: <MessageSquareReply className="h-4 w-4" />,
      to: "/dealer/leads",
    });
  }

  if (out.length === 0) {
    out.push({
      key: "all-good",
      title: "Inventory in great shape",
      body: "Add fresh listings to keep your traffic compounding.",
      icon: <Sparkles className="h-4 w-4" />,
      to: "/seller/listings/new",
    });
  }

  return out.slice(0, 5);
}
