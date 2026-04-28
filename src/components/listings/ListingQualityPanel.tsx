import { Check, AlertCircle } from "lucide-react";
import type { Listing } from "@/types/database";
import { calculateListingQuality, type QualityLabel } from "@/lib/listingQuality";
import { cn } from "@/lib/utils";

const LABEL_TONE: Record<QualityLabel, { bar: string; text: string; ring: string }> = {
  Poor: { bar: "bg-rose-400", text: "text-rose-300", ring: "ring-rose-500/30" },
  Good: { bar: "bg-amber-400", text: "text-amber-300", ring: "ring-amber-500/30" },
  Strong: { bar: "bg-sky-400", text: "text-sky-300", ring: "ring-sky-500/30" },
  Premium: { bar: "bg-emerald-400", text: "text-emerald-300", ring: "ring-emerald-500/30" },
};

interface Props {
  listing: Listing;
  photoCount?: number;
  className?: string;
}

export function ListingQualityPanel({ listing, photoCount = 0, className }: Props) {
  const result = calculateListingQuality({ listing, photoCount });
  const tone = LABEL_TONE[result.label];

  return (
    <div className={cn("glass-card p-5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="eyebrow">Listing quality</div>
          <div className={cn("font-display text-2xl mt-1", tone.text)}>{result.label}</div>
        </div>
        <div className="font-mono text-2xl">{result.score}</div>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary/40">
        <div
          className={cn("h-full transition-all duration-500", tone.bar)}
          style={{ width: `${result.score}%` }}
        />
      </div>

      <ul className="mt-4 space-y-1.5 text-xs">
        {result.checks.map((c) => (
          <li
            key={c.key}
            className={cn(
              "flex items-start gap-2 rounded px-2 py-1",
              c.ok ? "text-muted-foreground" : "bg-rose-500/5 text-rose-200/80",
            )}
          >
            {c.ok ? (
              <Check className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 text-rose-300 mt-0.5 shrink-0" />
            )}
            <div className="flex-1">
              <div className={cn(c.ok ? "" : "text-rose-200")}>{c.label}</div>
              {!c.ok && c.hint && (
                <div className="text-[11px] text-muted-foreground/80 mt-0.5">{c.hint}</div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
