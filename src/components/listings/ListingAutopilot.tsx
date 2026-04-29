import { useState } from "react";
import { Sparkles, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiListingAutopilot, type ListingAutopilotResult } from "@/lib/ai";
import { formatCents } from "@/lib/utils";
import type { Listing } from "@/types/database";

interface Props {
  listing: Listing;
  onApply?: (patch: { title?: string; description?: string }) => void | Promise<void>;
}

function specsFor(listing: Listing): Record<string, unknown> {
  const s: Record<string, unknown> = {};
  if (listing.year) s.year = listing.year;
  if (listing.make) s.make = listing.make;
  if (listing.model) s.model = listing.model;
  if (listing.length_ft) s.length_ft = listing.length_ft;
  if (listing.hours != null) s.hours = listing.hours;
  if (listing.engine_count) s.engine_count = listing.engine_count;
  if (listing.engine_hp) s.engine_hp = listing.engine_hp;
  if (listing.mileage != null) s.mileage = listing.mileage;
  if (listing.drivetrain) s.drivetrain = listing.drivetrain;
  if (listing.fuel_type) s.fuel_type = listing.fuel_type;
  return s;
}

export function ListingAutopilot({ listing, onApply }: Props) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ListingAutopilotResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedTitle, setAppliedTitle] = useState(false);
  const [appliedDescription, setAppliedDescription] = useState(false);

  async function run() {
    setRunning(true); setError(null);
    try {
      const r = await aiListingAutopilot({
        title: listing.title,
        description: listing.description ?? undefined,
        category: listing.category,
        price_cents: listing.price_cents ?? undefined,
        specs: specsFor(listing),
      });
      setResult(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
  }

  async function applyTitle() {
    if (!result || !onApply) return;
    await onApply({ title: result.suggested_title });
    setAppliedTitle(true);
  }
  async function applyDescription() {
    if (!result || !onApply) return;
    await onApply({ description: result.suggested_description });
    setAppliedDescription(true);
  }

  return (
    <div className="rounded-xl border border-brass-500/30 bg-gradient-to-br from-brass-500/[0.06] via-card to-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-brass-400" />
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-brass-400">AI Quality Advisor</span>
      </div>
      <div className="p-5 space-y-4">
        {!result && (
          <>
            <p className="text-xs text-muted-foreground">
              Run a quality pass on this listing — we'll suggest a sharper title, a fuller description,
              missing specs, and a price read.
            </p>
            <Button size="sm" onClick={() => { void run(); }} disabled={running}>
              {running ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Analyzing…</> : <><Sparkles className="h-3 w-3 mr-1" /> Run autopilot</>}
            </Button>
            {error && <p className="text-xs text-red-400 inline-flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {error}</p>}
          </>
        )}

        {result && (
          <>
            {result.suggested_title && result.suggested_title !== listing.title && (
              <Block label="Suggested title">
                <p className="text-sm">{result.suggested_title}</p>
                {onApply && (
                  <Button size="sm" variant="outline" disabled={appliedTitle} onClick={() => { void applyTitle(); }}>
                    {appliedTitle ? <><Check className="h-3 w-3 mr-1" /> Applied</> : "Apply title"}
                  </Button>
                )}
              </Block>
            )}

            {result.suggested_description && result.suggested_description !== listing.description && (
              <Block label="Suggested description">
                <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground line-clamp-6">{result.suggested_description}</p>
                {onApply && (
                  <Button size="sm" variant="outline" disabled={appliedDescription} onClick={() => { void applyDescription(); }}>
                    {appliedDescription ? <><Check className="h-3 w-3 mr-1" /> Applied</> : "Apply description"}
                  </Button>
                )}
              </Block>
            )}

            {result.missing_specs.length > 0 && (
              <Block label="Missing specs">
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  {result.missing_specs.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </Block>
            )}

            {result.price_assessment && (
              <Block label={`Price read · ${formatCents(listing.price_cents)}`}>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.price_assessment}</p>
              </Block>
            )}

            {result.quality_tips.length > 0 && (
              <Block label="Tips">
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  {result.quality_tips.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </Block>
            )}

            <p className="text-[11px] text-muted-foreground border-t border-border pt-3">{result._disclaimer}</p>
          </>
        )}
      </div>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="font-mono text-[10px] uppercase tracking-wider text-brass-300">{label}</div>
      {children}
    </div>
  );
}
