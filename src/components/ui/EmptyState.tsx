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
        "rounded-lg border border-dashed border-border bg-card/40 text-center",
        compact ? "p-6" : "p-12",
        className,
      )}
    >
      {Icon && (
        <div className="mx-auto h-12 w-12 grid place-items-center rounded-full bg-secondary/60 ring-1 ring-border">
          <Icon className="h-5 w-5 text-brass-400" />
        </div>
      )}
      <h3 className="font-display text-lg mt-4">{title}</h3>
      {body && <div className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{body}</div>}
      {(cta || secondary) && (
        <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
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
