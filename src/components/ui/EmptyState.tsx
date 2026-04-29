import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CTA {
  label: string;
  to?: string;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

interface Props {
  icon?: LucideIcon;
  title: string;
  body?: ReactNode;
  cta?: CTA;
  secondary?: CTA;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, body, cta, secondary, className, compact }: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-dashed border-border bg-card/40 text-center",
        compact ? "p-6" : "p-12",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 -top-16 h-32 bg-gradient-to-b from-brass-500/10 to-transparent pointer-events-none"
      />
      {Icon && (
        <div className="relative mx-auto h-14 w-14 grid place-items-center rounded-full bg-gradient-to-br from-brass-500/20 to-brass-700/5 ring-1 ring-brass-500/20">
          <Icon className="h-5 w-5 text-brass-300" />
        </div>
      )}
      <h3 className="relative font-display text-lg mt-4">{title}</h3>
      {body && <div className="relative text-sm text-muted-foreground mt-2 max-w-md mx-auto">{body}</div>}
      {(cta || secondary) && (
        <div className="relative mt-5 flex items-center justify-center gap-2 flex-wrap">
          {cta && <ActionButton cta={cta} />}
          {secondary && <ActionButton cta={{ ...secondary, variant: secondary.variant ?? "outline" }} />}
        </div>
      )}
    </div>
  );
}

function ActionButton({ cta }: { cta: CTA }) {
  const variant = cta.variant ?? "default";
  if (cta.to) {
    return <Button asChild variant={variant} size="sm"><Link to={cta.to}>{cta.label}</Link></Button>;
  }
  if (cta.href) {
    return <Button asChild variant={variant} size="sm"><a href={cta.href}>{cta.label}</a></Button>;
  }
  return (
    <Button type="button" variant={variant} size="sm" onClick={cta.onClick}>
      {cta.label}
    </Button>
  );
}
