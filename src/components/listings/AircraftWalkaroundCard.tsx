import { useState } from "react";
import { Compass, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiAircraftWalkaround, type AircraftWalkaroundScript } from "@/lib/ai";
import type { Listing } from "@/types/database";

interface Props {
  listing: Listing;
}

/**
 * Aviation walkaround / inspection script generator. Calls the AI edge
 * function when available, falls back to a local template if not. We never
 * block on AI availability for aviation safety material.
 */
export function AircraftWalkaroundCard({ listing }: Props) {
  const [script, setScript] = useState<AircraftWalkaroundScript | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const out = await aiAircraftWalkaround({
        category: listing.category,
        make: listing.make,
        model: listing.model,
        year: listing.year,
      });
      setScript(out);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-brass-500/25 bg-card p-5 space-y-4">
      <header className="flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-brass-500/15 text-brass-300 ring-1 ring-brass-500/30">
          <Compass className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-brass-400">
            AI walkaround script
          </div>
          <h3 className="font-display text-lg leading-tight">Pre-buy walkaround script</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Use this script during your in-person inspection — it does not replace an A&amp;P/IA.
          </p>
        </div>
      </header>

      {!script ? (
        <Button onClick={generate} disabled={loading} size="sm">
          {loading ? (
            <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generating…</>
          ) : (
            "Generate walkaround script"
          )}
        </Button>
      ) : (
        <div className="space-y-3 text-sm">
          <Section title="Exterior" items={script.exterior} />
          <Section title="Cockpit" items={script.cockpit} />
          <Section title="Engine compartment" items={script.engine_compartment} />
          <Section title="Logbook review" items={script.logbook} />
          <Section title="Test flight" items={script.test_flight} />
          <Section title="Questions to ask the seller" items={script.questions_to_ask} />
          <Section title="Red flags" items={script.red_flags} tone="danger" />
          <p className="text-[11px] leading-relaxed text-amber-200/85 pt-2 border-t border-amber-500/15">
            <span className="font-display text-amber-100">Disclaimer.</span>{" "}
            {script._disclaimer}
          </p>
        </div>
      )}
    </section>
  );
}

function Section({
  title, items, tone,
}: {
  title: string;
  items: string[];
  tone?: "danger";
}) {
  return (
    <div>
      <div className={`font-mono text-[10px] uppercase tracking-[0.28em] ${tone === "danger" ? "text-rose-300" : "text-muted-foreground"}`}>
        {title}
      </div>
      <ul className="mt-1 space-y-1">
        {items.map((it, i) => (
          <li
            key={i}
            className={tone === "danger" ? "text-rose-200/90 text-xs" : "text-muted-foreground text-xs"}
          >
            • {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
