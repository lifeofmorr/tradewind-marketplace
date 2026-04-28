import type { Inquiry } from "@/types/database";
import { calculateLeadScore } from "@/lib/leadScore";
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  rose: "bg-rose-500/10 text-rose-300 ring-rose-500/30",
  amber: "bg-amber-500/10 text-amber-300 ring-amber-500/30",
  sky: "bg-sky-500/10 text-sky-300 ring-sky-500/30",
  slate: "bg-slate-500/15 text-slate-200 ring-slate-400/20",
};

interface Props {
  inquiry: Inquiry;
  className?: string;
}

export function LeadQualityBadge({ inquiry, className }: Props) {
  const result = calculateLeadScore(inquiry);
  return (
    <span
      title={result.reasons.join(" · ")}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] ring-1 ring-inset",
        TONE[result.color],
        className,
      )}
    >
      <span className="font-bold">{result.score}</span>
      {result.label}
    </span>
  );
}
