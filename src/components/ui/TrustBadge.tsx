import {
  ShieldCheck,
  Star,
  FlaskConical,
  DollarSign,
  Umbrella,
  Search,
  Truck,
  Sparkles,
} from "lucide-react";
import type { BadgeType } from "@/lib/badges";
import { BADGE_META } from "@/lib/badges";
import { cn } from "@/lib/utils";

const ICONS = {
  shield: ShieldCheck,
  star: Star,
  flask: FlaskConical,
  dollar: DollarSign,
  umbrella: Umbrella,
  search: Search,
  truck: Truck,
  sparkles: Sparkles,
} as const;

const TONE_CLASSES: Record<string, string> = {
  brass:
    "bg-brass-500/10 text-brass-400 ring-brass-500/30",
  emerald:
    "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
  blue:
    "bg-sky-500/10 text-sky-300 ring-sky-500/30",
  violet:
    "bg-violet-500/10 text-violet-300 ring-violet-500/30",
  slate:
    "bg-slate-500/15 text-slate-200 ring-slate-400/20",
  amber:
    "bg-amber-500/10 text-amber-300 ring-amber-500/30",
};

interface Props {
  type: BadgeType;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export function TrustBadge({ type, size = "sm", showLabel = true, className }: Props) {
  const meta = BADGE_META[type];
  if (!meta) return null;
  const Icon = ICONS[meta.icon];
  const sizeClasses =
    size === "md"
      ? "px-2.5 py-1 text-xs"
      : "px-2 py-0.5 text-[10px]";
  return (
    <span
      title={meta.tooltip}
      className={cn(
        "inline-flex items-center gap-1 rounded-full ring-1 ring-inset font-mono uppercase tracking-[0.18em]",
        TONE_CLASSES[meta.tone],
        sizeClasses,
        className,
      )}
    >
      <Icon className={size === "md" ? "h-3.5 w-3.5" : "h-3 w-3"} aria-hidden />
      {showLabel ? meta.label : null}
    </span>
  );
}

interface BadgeListProps {
  types: BadgeType[];
  size?: "sm" | "md";
  max?: number;
  className?: string;
}

export function TrustBadgeList({ types, size = "sm", max, className }: BadgeListProps) {
  const list = max ? types.slice(0, max) : types;
  if (!list.length) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {list.map((t) => (
        <TrustBadge key={t} type={t} size={size} />
      ))}
    </div>
  );
}
