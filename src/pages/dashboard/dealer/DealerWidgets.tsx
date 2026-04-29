import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Code2, Copy, Check, Loader2, Inbox, ListChecks, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { setMeta } from "@/lib/seo";

type WidgetType = "inventory" | "lead_capture" | "finance_request";

interface WidgetRow {
  id: string;
  dealer_id: string;
  widget_type: WidgetType;
  config: Record<string, unknown>;
  active: boolean;
  created_at: string;
}

const TYPES: { type: WidgetType; label: string; description: string; icon: typeof ListChecks }[] = [
  { type: "inventory", label: "Inventory grid", description: "Embed your live TradeWind inventory on your own site.", icon: ListChecks },
  { type: "lead_capture", label: "Lead capture", description: "A drop-in form that lands directly in your TradeWind inbox.", icon: Inbox },
  { type: "finance_request", label: "Finance request", description: "Pre-qual form routed to your finance partner.", icon: CreditCard },
];

const SITE = typeof window !== "undefined" ? window.location.origin : "https://gotradewind.com";

function widgetSnippet(dealerId: string, type: WidgetType): string {
  return `<!-- TradeWind ${type} widget -->\n<div data-tradewind-widget="${type}" data-dealer-id="${dealerId}"></div>\n<script async src="${SITE}/embed/widget.js"></script>`;
}

export default function DealerWidgets() {
  const { profile } = useAuth();
  const dealerId = profile?.dealer_id ?? null;
  const qc = useQueryClient();

  useEffect(() => {
    setMeta({ title: "Dealer · widgets", description: "Embed TradeWind inventory and lead-capture on your own site." });
  }, []);

  const { data: widgets = [], isLoading } = useQuery({
    queryKey: ["dealer-widgets", dealerId],
    enabled: !!dealerId,
    queryFn: async (): Promise<WidgetRow[]> => {
      const { data, error } = await supabase
        .from("dealer_widgets")
        .select("*")
        .eq("dealer_id", dealerId);
      if (error) throw error;
      return (data ?? []) as WidgetRow[];
    },
  });

  async function ensureWidget(type: WidgetType): Promise<WidgetRow | null> {
    if (!dealerId) return null;
    const existing = widgets.find((w) => w.widget_type === type);
    if (existing) return existing;
    const { data, error } = await supabase
      .from("dealer_widgets")
      .insert({ dealer_id: dealerId, widget_type: type, active: true })
      .select()
      .single();
    if (error) {
      console.warn("[widgets] insert failed:", error.message);
      return null;
    }
    void qc.invalidateQueries({ queryKey: ["dealer-widgets", dealerId] });
    return data as WidgetRow;
  }

  async function toggle(row: WidgetRow) {
    const { error } = await supabase
      .from("dealer_widgets")
      .update({ active: !row.active })
      .eq("id", row.id);
    if (!error) void qc.invalidateQueries({ queryKey: ["dealer-widgets", dealerId] });
  }

  if (!dealerId) {
    return (
      <div className="max-w-2xl">
        <div className="eyebrow">Dealer · widgets</div>
        <h1 className="section-title">Embeddable widgets</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Finish dealer onboarding to generate your widget embeds.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <div className="eyebrow">Dealer · widgets</div>
        <h1 className="section-title">Embeddable widgets</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Drop these onto your own dealer site. Inventory stays in sync with TradeWind, leads land
          in your TradeWind inbox, and finance requests route to your partner.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {TYPES.map((meta) => {
            const row = widgets.find((w) => w.widget_type === meta.type) ?? null;
            return (
              <WidgetCard
                key={meta.type}
                meta={meta}
                row={row}
                snippet={widgetSnippet(dealerId, meta.type)}
                onEnable={() => { void ensureWidget(meta.type); }}
                onToggle={() => { if (row) void toggle(row); }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

interface CardProps {
  meta: { type: WidgetType; label: string; description: string; icon: typeof ListChecks };
  row: WidgetRow | null;
  snippet: string;
  onEnable: () => void;
  onToggle: () => void;
}

function WidgetCard({ meta, row, snippet, onEnable, onToggle }: CardProps) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(snippet); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* ignore */ }
  }
  const Icon = meta.icon;
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-3 flex flex-col">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-brass-400" />
        <span className="font-display">{meta.label}</span>
      </div>
      <p className="text-xs text-muted-foreground">{meta.description}</p>

      {!row ? (
        <Button size="sm" onClick={onEnable}>Generate snippet</Button>
      ) : (
        <>
          <div className="rounded-md border border-border bg-secondary/30 p-3 text-[11px] font-mono text-muted-foreground overflow-x-auto whitespace-pre">
            <Code2 className="inline h-3 w-3 mr-1 text-brass-400" />
            {snippet}
          </div>
          <div className="flex items-center gap-2 mt-auto">
            <Button size="sm" variant="outline" onClick={() => { void copy(); }}>
              {copied ? <><Check className="h-3 w-3 mr-1" /> Copied</> : <><Copy className="h-3 w-3 mr-1" /> Copy</>}
            </Button>
            <Button size="sm" variant="ghost" onClick={onToggle}>
              {row.active ? "Disable" : "Enable"}
            </Button>
            <span className={`text-[10px] font-mono uppercase tracking-wider ${row.active ? "text-emerald-400" : "text-muted-foreground"}`}>
              {row.active ? "active" : "paused"}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
