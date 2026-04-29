import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Landmark,
  Anchor,
  Car,
  Umbrella,
  Truck,
  ArrowUpRight,
  FlaskConical,
  Info,
} from "lucide-react";
import { setMeta } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import {
  FinancialReadinessCard,
  type ReadinessItem,
} from "@/components/finance/FinancialReadinessCard";
import { BankLinkPanel } from "@/components/finance/BankLinkPanel";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

type ReadinessKey = "preapproved" | "insurance" | "bank" | "transport";

interface ReadinessRow {
  pre_approved: boolean | null;
  insurance_quoted: boolean | null;
  bank_verified: boolean | null;
  transport_arranged: boolean | null;
}

const COLUMN_BY_KEY: Record<ReadinessKey, keyof ReadinessRow> = {
  preapproved: "pre_approved",
  insurance: "insurance_quoted",
  bank: "bank_verified",
  transport: "transport_arranged",
};

const ITEM_META: Array<{ key: ReadinessKey; label: string; description: string }> = [
  {
    key: "preapproved",
    label: "Pre-approved for financing",
    description: "Soft-pull pre-qualification with marine and auto lenders.",
  },
  {
    key: "insurance",
    label: "Insurance quoted",
    description: "Indicative quote on file, ready to bind on closing day.",
  },
  {
    key: "bank",
    label: "Bank account verified",
    description: "Verified-funds badge — coming soon via Plaid.",
  },
  {
    key: "transport",
    label: "Transport arranged",
    description: "Bonded carrier estimate locked for your search radius.",
  },
];

const PARTNERS: Array<{
  name: string;
  type: "marine" | "auto" | "insurance" | "transport";
  rate: string;
  blurb: string;
  icon: typeof Anchor;
}> = [
  {
    name: "Trident Marine Capital",
    type: "marine",
    rate: "from 6.49% APR · 20 yr",
    blurb: "Specialized lender for boats over $100k. White-glove F&I.",
    icon: Anchor,
  },
  {
    name: "BlueWater Finance",
    type: "marine",
    rate: "from 6.99% APR · 15 yr",
    blurb: "Mid-market marine financing with fast pre-approval.",
    icon: Anchor,
  },
  {
    name: "Northpoint Auto Lending",
    type: "auto",
    rate: "from 5.39% APR · 7 yr",
    blurb: "Bank-direct rates on vehicles up to $250k.",
    icon: Car,
  },
  {
    name: "Harborline Insurance",
    type: "insurance",
    rate: "Quote in 5 min",
    blurb: "Marine and auto coverage with TradeWind-direct pricing.",
    icon: Umbrella,
  },
  {
    name: "BondedHaul Transport",
    type: "transport",
    rate: "Door-to-door",
    blurb: "Insured carriers for full-asset value on every shipment.",
    icon: Truck,
  },
];

export default function FinancialHub() {
  useEffect(() => {
    setMeta({
      title: "Financial hub",
      description:
        "Pre-qualification, financing partners, payment readiness, and bank linking.",
    });
  }, []);

  const { user } = useAuth();
  const [row, setRow] = useState<ReadinessRow | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setRow(null); setLoaded(true); return; }
    let cancelled = false;
    (async () => {
      const { data, error: loadErr } = await supabase
        .from("financial_readiness")
        .select("pre_approved, insurance_quoted, bank_verified, transport_arranged")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (loadErr) {
        console.warn("[finance] readiness load failed:", loadErr.message);
        setError(loadErr.message);
      }
      setRow((data as ReadinessRow | null) ?? {
        pre_approved: false,
        insurance_quoted: false,
        bank_verified: false,
        transport_arranged: false,
      });
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const items: ReadinessItem[] = useMemo(() => {
    return ITEM_META.map((m) => ({
      key: m.key,
      label: m.label,
      description: m.description,
      done: Boolean(row?.[COLUMN_BY_KEY[m.key]]),
    }));
  }, [row]);

  const toggleReadiness = useCallback(async (key: string, next: boolean) => {
    if (!user) return;
    const k = key as ReadinessKey;
    const column = COLUMN_BY_KEY[k];
    if (!column) return;
    const optimistic: ReadinessRow = {
      pre_approved: row?.pre_approved ?? false,
      insurance_quoted: row?.insurance_quoted ?? false,
      bank_verified: row?.bank_verified ?? false,
      transport_arranged: row?.transport_arranged ?? false,
      [column]: next,
    };
    setRow(optimistic);
    setSaving(true);
    setError(null);
    const { error: upsertErr } = await supabase
      .from("financial_readiness")
      .upsert(
        { user_id: user.id, ...optimistic, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
    setSaving(false);
    if (upsertErr) {
      setError(`Couldn't save: ${upsertErr.message}`);
      // Revert
      setRow((prev) => prev ? { ...prev, [column]: !next } : prev);
    }
  }, [user, row]);

  return (
    <div className="space-y-8">
      <header>
        <div className="eyebrow">Financial Hub</div>
        <h1 className="font-display text-3xl mt-1">Buy with confidence.</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Track your buying readiness, connect with vetted lenders and insurers, and unlock the
          verified-funds badge that gets your offer prioritized on every listing.
        </p>
      </header>

      <div className="glass-card p-3 flex items-start gap-3 max-w-2xl">
        <Info className="h-4 w-4 text-brass-400 mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          TradeWind does not make credit decisions. This is informational only — readiness tracking
          and partner introductions help you stay organized; lenders make their own determinations.
        </p>
      </div>

      {!user && (
        <div className="glass-card p-3 flex items-start gap-3 max-w-2xl">
          <FlaskConical className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            <Link to="/login?redirect=/buyer/finance" className="text-brass-400">Sign in</Link> to
            track your readiness checklist and request bank-link access.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-200 p-3 text-sm max-w-2xl">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <FinancialReadinessCard
          items={items}
          onToggle={user ? toggleReadiness : undefined}
          disabled={!loaded || saving}
        />
        <BankLinkPanel />
      </div>

      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="eyebrow">Partners</div>
            <div className="font-display text-2xl mt-1">Pre-vetted financing & coverage</div>
          </div>
          <Button asChild variant="link" className="px-0">
            <Link to="/financing">All financing options →</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PARTNERS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.name} className="glass-card lift-card brass-glow p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="h-10 w-10 rounded-md grid place-items-center bg-gradient-to-br from-brass-500/20 to-brass-700/5 border border-white/10">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="chip bg-brass-500/15 text-brass-300 ring-brass-400/20 ring-1 ring-inset">
                    {p.type}
                  </span>
                </div>
                <div className="font-display text-lg mt-3">{p.name}</div>
                <div className="text-xs font-mono uppercase tracking-[0.18em] text-brass-400 mt-1">
                  {p.rate}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{p.blurb}</p>
                <Button asChild size="sm" variant="outline" className="mt-4">
                  <Link to="/financing">
                    Get pre-qualified
                    <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="glass-card p-6 max-w-3xl">
        <Landmark className="h-5 w-5 text-brass-400" />
        <div className="font-display text-xl mt-3">Concierge-grade closings</div>
        <p className="text-sm text-muted-foreground mt-2">
          For deals over $250k, a TradeWind concierge coordinates lender, insurer, surveyor, and
          transport into a single closing timeline. No off-platform wires, no surprises.
        </p>
        <div className="mt-4">
          <Button asChild>
            <Link to="/concierge">Talk to concierge</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
