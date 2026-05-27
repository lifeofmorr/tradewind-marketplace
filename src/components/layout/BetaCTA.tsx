import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/trackEvent";

interface Props {
  variant?: "banner" | "section";
  source: string;
  title?: string;
  body?: string;
}

const DEFAULT_TITLE = "TradeWind is in private beta.";
const DEFAULT_BODY =
  "We're inviting dealers, brokers, service partners, and serious buyers to use the platform early — and shape what comes next.";

/**
 * Subtle, premium beta/feedback callout. Drop into a page to invite the
 * visitor to request beta access or send feedback. Never popup-aggressive.
 */
export function BetaCTA({ variant = "section", source, title, body }: Props) {
  const heading = title ?? DEFAULT_TITLE;
  const subcopy = body ?? DEFAULT_BODY;

  if (variant === "banner") {
    return (
      <section className="container-pad py-6">
        <div className="glass-card rounded-xl px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-brass-500/10 ring-1 ring-brass-500/30 shrink-0">
              <Sparkles className="h-4 w-4 text-brass-400" />
            </div>
            <div>
              <div className="font-display text-base">{heading}</div>
              <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{subcopy}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <Button asChild size="sm">
              <Link
                to="/beta"
                onClick={() => trackEvent("request_beta_click", { source })}
              >
                Request beta access
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/feedback">Give feedback</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-pad py-16 border-t border-border">
      <div className="relative overflow-hidden rounded-2xl border border-brass-500/30 p-10 grid md:grid-cols-[1.4fr_1fr] items-center gap-8 hero-glow">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brass-500/10 blur-3xl"
        />
        <div>
          <div className="flex items-center gap-2 text-brass-400">
            <Sparkles className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-[0.32em]">Private beta</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl mt-2">{heading}</h2>
          <p className="text-muted-foreground mt-3 max-w-lg">{subcopy}</p>
        </div>
        <div className="flex flex-wrap md:justify-end gap-3 relative">
          <Button asChild size="lg" className="btn-glow">
            <Link
              to="/beta"
              onClick={() => trackEvent("request_beta_click", { source })}
            >
              Request beta access <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/feedback">Give feedback</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
