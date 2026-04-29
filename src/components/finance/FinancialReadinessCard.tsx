import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReadinessItem {
  key: string;
  label: string;
  description: string;
  done: boolean;
}

interface Props {
  items: ReadinessItem[];
  onToggle?: (key: string, next: boolean) => void;
  disabled?: boolean;
}

export function FinancialReadinessCard({ items, onToggle, disabled = false }: Props) {
  const completed = items.filter((i) => i.done).length;
  const total = items.length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  let label = "Getting started";
  let labelColor = "text-slate-300";
  if (pct >= 100) { label = "Buy-ready"; labelColor = "text-emerald-300"; }
  else if (pct >= 60) { label = "Almost ready"; labelColor = "text-brass-300"; }
  else if (pct >= 25) { label = "Building readiness"; labelColor = "text-sky-300"; }

  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="eyebrow">Readiness Score</div>
          <div className={cn("font-display text-3xl mt-1", labelColor)}>{label}</div>
          <p className="text-sm text-muted-foreground mt-1">
            {completed} of {total} steps complete — sellers prioritize buyers with a high readiness score.
          </p>
        </div>
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            <circle
              cx="18" cy="18" r="15.9155"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="3"
              className="text-secondary/60"
            />
            <circle
              cx="18" cy="18" r="15.9155"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${pct} ${100 - pct}`}
              className="text-brass-500"
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center font-display text-lg">
            {pct}%
          </div>
        </div>
      </div>

      <ul className="mt-5 space-y-2.5">
        {items.map((item) => {
          const interactive = Boolean(onToggle) && !disabled;
          const Tag: "button" | "li" = interactive ? "button" : "li";
          const className = cn(
            "w-full text-left flex items-start gap-3 rounded-md p-3 border transition-colors",
            item.done
              ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-white/5 bg-background/40",
            interactive && "hover:border-brass-500/30 cursor-pointer",
            disabled && "opacity-60 cursor-not-allowed",
          );
          const inner = (
            <>
              <div
                className={cn(
                  "shrink-0 h-6 w-6 rounded-full grid place-items-center mt-0.5",
                  item.done ? "bg-emerald-500/20 text-emerald-300" : "bg-secondary text-muted-foreground",
                )}
              >
                {item.done ? <Check className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{item.label}</div>
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              </div>
            </>
          );
          if (Tag === "button") {
            return (
              <li key={item.key}>
                <button
                  type="button"
                  className={className}
                  onClick={() => onToggle!(item.key, !item.done)}
                  disabled={disabled}
                  aria-pressed={item.done}
                >
                  {inner}
                </button>
              </li>
            );
          }
          return (
            <li key={item.key} className={className}>
              {inner}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
