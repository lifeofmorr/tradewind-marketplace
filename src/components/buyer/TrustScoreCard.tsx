import { ShieldCheck } from "lucide-react";
import { profileTrustScore } from "@/lib/trustScore";
import { cn } from "@/lib/utils";

interface Props {
  profile: {
    verification_level?: string | null;
    buyer_readiness_score?: number | null;
    banned?: boolean | null;
  };
  className?: string;
}

const BAND_TONE: Record<string, string> = {
  elite: "text-emerald-300 border-emerald-500/40 bg-emerald-500/[0.06]",
  strong: "text-sky-300 border-sky-500/40 bg-sky-500/[0.06]",
  fair: "text-amber-300 border-amber-500/40 bg-amber-500/[0.06]",
  new: "text-slate-300 border-slate-500/40 bg-slate-500/[0.04]",
};

export function TrustScoreCard({ profile, className }: Props) {
  const result = profileTrustScore(profile);
  return (
    <div className={cn("rounded-xl border p-5", BAND_TONE[result.band], className)}>
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4" />
        <span className="font-mono text-[10px] uppercase tracking-[0.32em]">Trust score</span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-4xl">{result.score}</span>
        <span className="text-sm opacity-80">/ 100</span>
      </div>
      <div className="mt-1 text-sm opacity-90">{result.label}</div>
      <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full bg-current opacity-70"
          style={{ width: `${result.score}%` }}
        />
      </div>
      <p className="mt-3 text-xs opacity-70 leading-relaxed">
        Composite of your verification level, buyer readiness, and reputation.
        Sellers see this badge — higher scores rank your offers above unknown buyers.
      </p>
    </div>
  );
}
