import { useState } from "react";
import { Sparkles, Loader2, Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiNegotiationAssistant, type NegotiationResult } from "@/lib/ai";
import { calculateDealScore } from "@/lib/dealScore";
import { formatCents } from "@/lib/utils";
import type { Listing } from "@/types/database";

interface Props {
  listing: Listing;
  offerCents: number;
}

export function NegotiationAssistant({ listing, offerCents }: Props) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<NegotiationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"buyer" | "seller" | null>(null);

  async function run() {
    if (!listing.price_cents || !offerCents) return;
    setRunning(true); setError(null);
    try {
      const r = await aiNegotiationAssistant({
        listing_price_cents: listing.price_cents,
        offer_amount_cents: offerCents,
        category: listing.category,
        deal_score: calculateDealScore(listing).score,
        listing_title: listing.title,
      });
      setResult(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
  }

  async function copy(text: string, which: "buyer" | "seller") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1600);
    } catch { /* ignore */ }
  }

  const ready = !!listing.price_cents && offerCents > 0;

  return (
    <div className="rounded-xl border border-brass-500/30 bg-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-brass-400" />
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-brass-400">Smart negotiation</span>
      </div>
      <div className="p-5 space-y-4">
        {!result && (
          <>
            <p className="text-xs text-muted-foreground">
              Generate AI-coached negotiation language for your current offer of {formatCents(offerCents)} on a {formatCents(listing.price_cents)} ask.
            </p>
            <Button size="sm" onClick={() => { void run(); }} disabled={running || !ready}>
              {running ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Drafting…</> : <><Sparkles className="h-3 w-3 mr-1" /> Coach my offer</>}
            </Button>
            {!ready && <p className="text-[11px] text-muted-foreground">Set an offer amount above to enable.</p>}
            {error && <p className="text-xs text-red-400 inline-flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {error}</p>}
          </>
        )}

        {result && (
          <>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-brass-300">Fair range</div>
              <p className="text-sm mt-1">
                <span className="font-mono text-foreground">{formatCents(result.fair_range.low_cents)} – {formatCents(result.fair_range.high_cents)}</span>
                <span className="block text-xs text-muted-foreground mt-0.5">{result.fair_range.label}</span>
              </p>
            </div>

            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-brass-300">Deal analysis</div>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{result.deal_analysis}</p>
            </div>

            <div className="rounded-md border border-border bg-secondary/20 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-brass-300">Buyer message</span>
                <Button size="sm" variant="outline" onClick={() => { void copy(result.negotiation_message, "buyer"); }}>
                  {copied === "buyer" ? <><Check className="h-3 w-3 mr-1" /> Copied</> : <><Copy className="h-3 w-3 mr-1" /> Copy</>}
                </Button>
              </div>
              <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{result.negotiation_message}</pre>
            </div>

            <div className="rounded-md border border-border bg-secondary/20 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-brass-300">Likely counter</span>
                <Button size="sm" variant="outline" onClick={() => { void copy(result.counteroffer_message, "seller"); }}>
                  {copied === "seller" ? <><Check className="h-3 w-3 mr-1" /> Copied</> : <><Copy className="h-3 w-3 mr-1" /> Copy</>}
                </Button>
              </div>
              <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{result.counteroffer_message}</pre>
            </div>

            <p className="text-[11px] text-muted-foreground border-t border-border pt-3">{result._disclaimer}</p>
          </>
        )}
      </div>
    </div>
  );
}
