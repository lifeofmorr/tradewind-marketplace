import { useMemo } from "react";
import { TrendingUp, MapPin, AlertTriangle } from "lucide-react";
import { useListings } from "@/hooks/useListings";
import { calculateMarketPulse } from "@/lib/marketPulse";
import { CATEGORIES } from "@/lib/categories";
import { formatCents, formatNumber } from "@/lib/utils";

interface Props {
  scope?: "all" | "dealer";
  dealerId?: string;
  className?: string;
}

export function MarketPulseCard({ scope = "all", dealerId, className }: Props) {
  const { data: listings = [], isLoading } = useListings({
    limit: 500,
    dealer_id: scope === "dealer" ? dealerId : undefined,
  });
  const pulse = useMemo(() => calculateMarketPulse(listings), [listings]);

  if (isLoading) {
    return <div className={`glass-card p-5 h-40 skeleton rounded-xl ${className ?? ""}`} />;
  }
  if (!listings.length) {
    return (
      <div className={`glass-card p-5 ${className ?? ""}`}>
        <div className="text-sm text-muted-foreground">Market pulse will appear once listings go live.</div>
      </div>
    );
  }

  const maxCatCount = Math.max(1, ...pulse.categories.map((c) => c.count));
  const catLabel = (key: string) => CATEGORIES.find((c) => c.key === key)?.label ?? key.replace("_", " ");

  return (
    <div className={`glass-card p-5 space-y-4 ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brass-400" />
          <span className="font-display text-lg">Market pulse</span>
        </div>
        {pulse.all_demo && (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-300">
            <AlertTriangle className="h-3 w-3" /> Demo data
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Active" value={formatNumber(pulse.active)} />
        <Stat label="Featured" value={formatNumber(pulse.featured)} />
        <Stat label="Median price" value={pulse.median_price_cents > 0 ? formatCents(pulse.median_price_cents) : "—"} />
        <Stat label="Avg price" value={pulse.avg_price_cents > 0 ? formatCents(pulse.avg_price_cents) : "—"} />
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-2">By category</div>
        <div className="space-y-1.5">
          {pulse.categories.slice(0, 6).map((c) => (
            <div key={c.category} className="flex items-center gap-2 text-xs">
              <div className="w-28 sm:w-32 truncate">{catLabel(c.category)}</div>
              <div className="flex-1 h-2 rounded-full bg-secondary/40 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brass-500 to-brass-400"
                  style={{ width: `${(c.count / maxCatCount) * 100}%` }}
                />
              </div>
              <div className="w-10 text-right tabular-nums text-muted-foreground">{c.count}</div>
            </div>
          ))}
        </div>
      </div>

      {pulse.states.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-2 flex items-center gap-1">
            <MapPin className="h-3 w-3" /> Top states
          </div>
          <div className="flex flex-wrap gap-1.5">
            {pulse.states.slice(0, 6).map((s) => (
              <span key={s.state} className="chip border-border text-muted-foreground">
                {s.state} <span className="text-foreground">{s.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {pulse.all_demo && (
        <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
          All current listings are demo seed data. Numbers reflect the marketplace shape, not live transactions.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{label}</div>
      <div className="font-display text-xl mt-0.5">{value}</div>
    </div>
  );
}
