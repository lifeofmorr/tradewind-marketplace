import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check, FileText } from "lucide-react";
import { generateOfferMessage, type OfferDraft } from "@/lib/offerBuilder";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import type { Listing } from "@/types/database";

interface Props { listing: Listing }

export function OfferBuilder({ listing }: Props) {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState<string>(
    listing.price_cents ? Math.round((listing.price_cents / 100) * 0.95).toString() : ""
  );
  const [financing, setFinancing] = useState<OfferDraft["financing_status"]>("preapproved");
  const [inspection, setInspection] = useState(true);
  const [transport, setTransport] = useState(false);
  const [timeline, setTimeline] = useState("Close within 3–4 weeks");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const message = useMemo(() => {
    const cents = Math.round((parseFloat(offerPrice) || 0) * 100);
    return generateOfferMessage({
      listing_title: listing.title,
      listing_price_cents: listing.price_cents,
      offer_price_cents: cents,
      financing_status: financing,
      inspection_contingency: inspection,
      transport_needed: transport,
      timeline,
      note,
      buyer_name: profile?.full_name ?? undefined,
    });
  }, [offerPrice, financing, inspection, transport, timeline, note, listing.title, listing.price_cents, profile?.full_name]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  async function save() {
    if (!user) return;
    const cents = Math.round((parseFloat(offerPrice) || 0) * 100);
    if (cents <= 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { data, error } = await supabase
        .from("offer_drafts")
        .insert({
          user_id: user.id,
          listing_id: listing.id,
          offer_price_cents: cents,
          financing_status: financing,
          inspection_contingency: inspection,
          transport_needed: transport,
          timeline: timeline || null,
          note: note || null,
          generated_message: message,
        })
        .select("id")
        .maybeSingle();
      if (error) throw error;
      setSavedId((data as { id: string } | null)?.id ?? null);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Could not save draft");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="glass-card overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-brass-400" />
          <span className="font-display text-lg">Build a non-binding offer</span>
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="border-t border-border p-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="offer-price">Offer price (USD)</Label>
              <Input
                id="offer-price"
                type="number"
                inputMode="numeric"
                min={1}
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
              />
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
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[hsl(var(--ring))]"
                checked={inspection}
                onChange={(e) => setInspection(e.target.checked)}
              />
              Inspection contingency
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[hsl(var(--ring))]"
                checked={transport}
                onChange={(e) => setTransport(e.target.checked)}
              />
              Need transport coordination
            </label>
          </div>
          <div>
            <Label htmlFor="offer-timeline">Timeline</Label>
            <Input
              id="offer-timeline"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              placeholder="Close within 3–4 weeks"
            />
          </div>
          <div>
            <Label htmlFor="offer-note">Optional note</Label>
            <Textarea
              id="offer-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything else the seller should know — payment method, trade-in, etc."
            />
          </div>

          <div className="rounded-lg border border-border bg-secondary/30 p-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-1">Generated draft</div>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{message}</pre>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" onClick={() => { void copy(); }}>
              {copied ? <><Check className="h-3 w-3 mr-1" /> Copied</> : <><Copy className="h-3 w-3 mr-1" /> Copy to clipboard</>}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => { void save(); }} disabled={saving || !!savedId}>
              {saving ? "Saving…" : savedId ? "Saved" : "Save draft"}
            </Button>
            {saveError && <span className="text-xs text-red-400">{saveError}</span>}
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Non-binding offer draft. Not a legal purchase agreement. Use a TradeWind concierge or a bonded F&I office to formalize the deal.
          </p>
        </div>
      )}
    </div>
  );
}
