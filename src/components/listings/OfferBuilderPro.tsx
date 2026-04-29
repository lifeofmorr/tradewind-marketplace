import { useMemo, useState } from "react";
import { Copy, Check, FileText, Sparkles, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { generateOfferMessage, type OfferDraft } from "@/lib/offerBuilder";
import { NegotiationAssistant } from "@/components/listings/NegotiationAssistant";
import { calculateDealScore } from "@/lib/dealScore";
import { formatCents } from "@/lib/utils";
import type { Listing } from "@/types/database";

interface Props { listing: Listing }

interface FairBand { low: number; high: number; label: string }

function fairBandForListing(listing: Listing): FairBand | null {
  const ask = listing.price_cents ?? 0;
  if (ask <= 0) return null;
  const score = calculateDealScore(listing).score;
  let lowPct: number;
  let highPct: number;
  let label: string;
  if (score >= 78) {
    lowPct = 0.95; highPct = 0.99; label = "Already a great deal — open near asking";
  } else if (score >= 58) {
    lowPct = 0.90; highPct = 0.95; label = "Fair deal — modest room to negotiate";
  } else if (score >= 35) {
    lowPct = 0.80; highPct = 0.88; label = "High price for the segment — meaningful room";
  } else {
    lowPct = 0.75; highPct = 0.85; label = "Stale or overpriced — start lower";
  }
  return {
    low: Math.round((ask / 100) * lowPct),
    high: Math.round((ask / 100) * highPct),
    label,
  };
}

const TIMELINES = [
  "Close within 1 week",
  "Close within 2 weeks",
  "Close within 3–4 weeks",
  "Close within 60 days",
  "Flexible — work with seller",
];

export function OfferBuilderPro({ listing }: Props) {
  const { profile } = useAuth();
  const askingCents = listing.price_cents ?? 0;
  const fairBand = useMemo(() => fairBandForListing(listing), [listing]);
  const [offerPrice, setOfferPrice] = useState<string>(
    askingCents ? Math.round((askingCents / 100) * 0.95).toString() : "",
  );
  const [deposit, setDeposit] = useState<string>(
    askingCents ? Math.round((askingCents / 100) * 0.05).toString() : "1000",
  );
  const [financing, setFinancing] = useState<OfferDraft["financing_status"]>("preapproved");
  const [inspection, setInspection] = useState(true);
  const [financingContingency, setFinancingContingency] = useState(true);
  const [transport, setTransport] = useState(false);
  const [timeline, setTimeline] = useState(TIMELINES[2]);
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  const offerCents = Math.round((parseFloat(offerPrice) || 0) * 100);
  const depositCents = Math.round((parseFloat(deposit) || 0) * 100);

  const message = useMemo(() => {
    const base = generateOfferMessage({
      listing_title: listing.title,
      listing_price_cents: listing.price_cents,
      offer_price_cents: offerCents,
      financing_status: financing,
      inspection_contingency: inspection,
      transport_needed: transport,
      timeline,
      note,
      buyer_name: profile?.full_name ?? undefined,
    });
    const extras: string[] = [];
    if (depositCents > 0) extras.push(`• Deposit on acceptance: ${formatCents(depositCents)} via TradeWind escrow`);
    if (financingContingency && financing !== "cash") extras.push(`• Financing contingency: yes — final approval required`);
    if (extras.length === 0) return base;
    const lines = base.split("\n");
    const insertAt = lines.findIndex((l) => l.startsWith("• Transport"));
    const idx = insertAt >= 0 ? insertAt + 1 : lines.length;
    return [...lines.slice(0, idx), ...extras, ...lines.slice(idx)].join("\n");
  }, [
    listing.title, listing.price_cents, offerCents, financing,
    inspection, transport, timeline, note, profile?.full_name,
    depositCents, financingContingency,
  ]);

  const deltaPct = askingCents > 0 ? ((offerCents - askingCents) / askingCents) * 100 : 0;

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  return (
    <div className="rounded-xl border border-brass-500/30 bg-gradient-to-br from-brass-500/[0.06] via-card to-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-brass-400" />
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-brass-400">Offer Builder Pro</span>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="op-offer">Offer amount (USD)</Label>
            <Input
              id="op-offer"
              type="number"
              min={1}
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
            />
            {fairBand && (
              <div className="mt-1.5 inline-flex flex-wrap items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 text-brass-300">
                  <Lightbulb className="h-3 w-3" />
                  Suggested range: {formatCents(fairBand.low * 100)}–{formatCents(fairBand.high * 100)}
                </span>
                <button
                  type="button"
                  onClick={() => setOfferPrice(String(Math.round((fairBand.low + fairBand.high) / 2)))}
                  className="underline text-muted-foreground hover:text-foreground"
                >
                  use midpoint
                </button>
                <span className="text-muted-foreground">· {fairBand.label}</span>
              </div>
            )}
            {askingCents > 0 && offerCents > 0 && (
              <div className="mt-1 text-[11px] font-mono text-muted-foreground">
                {Math.abs(deltaPct).toFixed(1)}% {deltaPct < 0 ? "below" : deltaPct > 0 ? "above" : "at"} asking ({formatCents(askingCents)})
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="op-deposit">Deposit on acceptance (USD)</Label>
            <Input
              id="op-deposit"
              type="number"
              min={0}
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
            />
            <div className="mt-1 text-[11px] font-mono text-muted-foreground">
              Held in TradeWind escrow until inspection clears
            </div>
          </div>
        </div>

        <div>
          <Label>Financing</Label>
          <Select value={financing} onValueChange={(v) => setFinancing(v as OfferDraft["financing_status"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash — funds available now</SelectItem>
              <SelectItem value="preapproved">Pre-approved with my lender</SelectItem>
              <SelectItem value="needs_financing">Need financing</SelectItem>
              <SelectItem value="tbd">TBD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <fieldset className="rounded-lg border border-border bg-secondary/20 p-3">
          <legend className="px-1 text-xs font-mono uppercase tracking-wider text-muted-foreground">Contingencies</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            <ContingencyCheckbox label="Inspection / survey" checked={inspection} onChange={setInspection} />
            <ContingencyCheckbox
              label="Financing"
              checked={financingContingency}
              onChange={setFinancingContingency}
              disabled={financing === "cash"}
            />
            <ContingencyCheckbox label="Transport coordination" checked={transport} onChange={setTransport} />
          </div>
        </fieldset>

        <div>
          <Label>Closing timeline</Label>
          <Select value={timeline} onValueChange={setTimeline}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TIMELINES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="op-note">Personal message</Label>
          <Textarea
            id="op-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Why you're a strong buyer — trade-in, payment method, when you can travel to inspect, etc."
          />
        </div>

        <div className="rounded-lg border border-brass-500/20 bg-card/80 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-3.5 w-3.5 text-brass-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-brass-300">Generated offer</span>
          </div>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{message}</pre>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" size="sm" onClick={() => { void copy(); }}>
            {copied ? <><Check className="h-3 w-3 mr-1" /> Copied</> : <><Copy className="h-3 w-3 mr-1" /> Copy to clipboard</>}
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border pt-3">
          Non-binding offer draft — not a legal purchase agreement. A formal offer must be executed
          through a TradeWind concierge or your preferred F&amp;I office before it binds either party.
        </p>

        <NegotiationAssistant listing={listing} offerCents={offerCents} />
      </div>
    </div>
  );
}

interface ChkProps { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }
function ContingencyCheckbox({ label, checked, onChange, disabled }: ChkProps) {
  return (
    <label className={`flex items-center gap-2 text-sm ${disabled ? "opacity-50" : "cursor-pointer"}`}>
      <input
        type="checkbox"
        className="h-4 w-4 accent-[hsl(var(--ring))]"
        checked={checked && !disabled}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
