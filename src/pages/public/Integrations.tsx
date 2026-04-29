import { useEffect, useMemo, useState } from "react";
import { Plug, Check, Sparkles } from "lucide-react";
import {
  INTEGRATIONS,
  INTEGRATION_CATEGORIES,
  type Integration,
  type IntegrationCategory,
  type IntegrationStatus,
} from "@/lib/connectedApps";
import { Button } from "@/components/ui/button";
import { setMeta } from "@/lib/seo";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<IntegrationStatus, string> = {
  connected: "Connected",
  available: "Available",
  coming_soon: "Coming soon",
};

const STATUS_STYLE: Record<IntegrationStatus, string> = {
  connected: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20",
  available: "bg-brass-500/15 text-brass-300 ring-brass-400/20",
  coming_soon: "bg-slate-500/15 text-slate-300 ring-slate-400/20",
};

function IntegrationCard({ integration }: { integration: Integration }) {
  const Icon = integration.icon;
  const disabled = integration.status === "coming_soon";
  return (
    <div className="glass-card lift-card brass-glow p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="h-10 w-10 rounded-md grid place-items-center bg-gradient-to-br from-brass-500/20 to-brass-700/5 border border-white/10">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        <span
          className={cn(
            "chip ring-1 ring-inset",
            STATUS_STYLE[integration.status],
          )}
        >
          {integration.status === "connected" && <Check className="h-3 w-3" />}
          {STATUS_LABEL[integration.status]}
        </span>
      </div>
      <div className="font-display text-lg mt-3">{integration.name}</div>
      <p className="text-sm text-muted-foreground mt-1 flex-1">{integration.description}</p>
      <div className="mt-4">
        <Button
          size="sm"
          variant={integration.status === "connected" ? "outline" : "default"}
          disabled={disabled}
        >
          {integration.status === "connected"
            ? "Manage"
            : integration.status === "available"
              ? "Connect"
              : "Notify me"}
        </Button>
      </div>
    </div>
  );
}

export default function Integrations() {
  useEffect(() => {
    setMeta({
      title: "Integrations",
      description: `Connect ${BRAND.name} to your CRM, finance, analytics, and automation stack.`,
    });
  }, []);

  const [active, setActive] = useState<IntegrationCategory | "All">("All");

  const filtered = useMemo(() => {
    if (active === "All") return INTEGRATIONS;
    return INTEGRATIONS.filter((i) => i.category === active);
  }, [active]);

  const counts = useMemo(() => {
    const total = INTEGRATIONS.length;
    const connected = INTEGRATIONS.filter((i) => i.status === "connected").length;
    return { total, connected };
  }, []);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border hero-glow">
        <div className="container-pad py-16 lg:py-20">
          <div className="inline-flex items-center gap-2 text-brass-400 mb-3">
            <Plug className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-[0.32em]">Connected Apps</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            One stack for the
            <br />
            <span className="text-brass-gradient">marketplace economy.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-muted-foreground">
            Plug {BRAND.name} into the tools dealers, lenders, and service pros already use.
            CRM, financial, analytics, automation — all from a single integrations hub.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <span className="chip bg-emerald-500/15 text-emerald-300 ring-emerald-400/20 ring-1 ring-inset">
              <Check className="h-3 w-3" /> {counts.connected} connected
            </span>
            <span className="chip bg-brass-500/15 text-brass-300 ring-brass-400/20 ring-1 ring-inset">
              <Sparkles className="h-3 w-3" /> {counts.total} total
            </span>
          </div>
        </div>
      </section>

      <section className="container-pad py-10">
        <div className="flex flex-wrap gap-2">
          {(["All", ...INTEGRATION_CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-[0.18em] border transition-colors",
                active === c
                  ? "border-brass-500/60 bg-brass-500/10 text-brass-300"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-brass-500/40",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>

        <div className="mt-10 glass-card p-6 max-w-3xl">
          <div className="font-display text-xl">Need a custom integration?</div>
          <p className="text-sm text-muted-foreground mt-2">
            Our partner team builds bespoke integrations for high-volume dealers and lenders.
            Reach out to <a className="text-brass-400" href="mailto:partners@gotradewind.com">partners@gotradewind.com</a>.
          </p>
        </div>
      </section>
    </>
  );
}
