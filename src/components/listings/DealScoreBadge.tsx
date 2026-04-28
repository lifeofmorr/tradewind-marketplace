import type { Listing } from "@/types/database";
import { calculateDealScore } from "@/lib/dealScore";
import { cn } from "@/lib/utils";

const TONE: Record<string, { ring: string; bg: string; text: string; track: string }> = {
  emerald: {
    ring: "ring-emerald-500/40",
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    track: "stroke-emerald-400",
  },
  sky: {
    ring: "ring-sky-500/40",
    bg: "bg-sky-500/10",
    text: "text-sky-300",
    track: "stroke-sky-400",
  },
  amber: {
    ring: "ring-amber-500/40",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    track: "stroke-amber-400",
  },
  slate: {
    ring: "ring-slate-400/30",
    bg: "bg-slate-500/15",
    text: "text-slate-200",
    track: "stroke-slate-400",
  },
  violet: {
    ring: "ring-violet-500/40",
    bg: "bg-violet-500/10",
    text: "text-violet-300",
    track: "stroke-violet-400",
  },
};

interface Props {
  listing: Listing;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function DealScoreBadge({ listing, size = "sm", showLabel = false, className }: Props) {
  const result = calculateDealScore(listing);
  const tone = TONE[result.color];
  const dim = size === "lg" ? 56 : size === "md" ? 40 : 32;
  const stroke = size === "lg" ? 4 : size === "md" ? 3 : 2.5;
  const r = (dim - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  const isDemo = result.label === "Demo";
  const dash = isDemo ? c : c * (result.score / 100);
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div
        className={cn(
          "relative grid place-items-center rounded-full ring-1",
          tone.bg,
          tone.ring,
        )}
        style={{ width: dim, height: dim }}
        title={result.reasons.join(" · ")}
      >
        <svg width={dim} height={dim} className="absolute inset-0 -rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            className="stroke-white/10"
          />
          {!isDemo && (
            <circle
              cx={dim / 2}
              cy={dim / 2}
              r={r}
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${c}`}
              className={tone.track}
            />
          )}
        </svg>
        <span className={cn("relative font-mono text-[10px]", tone.text)}>
          {isDemo ? "—" : result.score}
        </span>
      </div>
      {showLabel && (
        <span className={cn("font-mono text-[10px] uppercase tracking-[0.18em]", tone.text)}>
          {result.label}
        </span>
      )}
    </div>
  );
}

export function DealScoreCard({ listing }: { listing: Listing }) {
  const result = calculateDealScore(listing);
  const tone = TONE[result.color];
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-4">
        <DealScoreBadge listing={listing} size="lg" />
        <div>
          <div className="eyebrow">AI Deal Score</div>
          <div className={cn("font-display text-2xl mt-1", tone.text)}>{result.label}</div>
        </div>
      </div>
      {result.reasons.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
          {result.reasons.slice(0, 4).map((r) => (
            <li key={r} className="flex items-start gap-2">
              <span className="mt-1 h-1 w-1 rounded-full bg-brass-400 shrink-0" /> {r}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-[11px] text-muted-foreground/80">
        Heuristic estimate based on year, price, mileage/hours, and condition. Not financial advice.
      </p>
    </div>
  );
}
