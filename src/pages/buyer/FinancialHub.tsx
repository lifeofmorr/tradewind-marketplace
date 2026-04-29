import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Landmark,
  Anchor,
  Car,
  Umbrella,
  Truck,
  ArrowUpRight,
  FlaskConical,
} from "lucide-react";
import { setMeta } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import {
  FinancialReadinessCard,
  type ReadinessItem,
} from "@/components/finance/FinancialReadinessCard";
import { BankLinkPanel } from "@/components/finance/BankLinkPanel";

const READINESS: ReadinessItem[] = [
  {
    key: "preapproved",
    label: "Pre-approved for financing",
    description: "Soft-pull pre-qualification with marine and auto lenders.",
    done: true,
  },
  {
    key: "insurance",
    label: "Insurance quoted",
    description: "Indicative quote on file, ready to bind on closing day.",
    done: true,
  },
  {
    key: "bank",
    label: "Bank account verified",
    description: "Verified-funds badge — coming soon via Plaid.",
    done: false,
  },
  {
    key: "transport",
    label: "Transport arranged",
    description: "Bonded carrier estimate locked for your search radius.",
    done: false,
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
        <FlaskConical className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Demo readiness data shown during the private beta. Real lender connections activate once
          your account is fully onboarded.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <FinancialReadinessCard items={READINESS} />
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
                <Button size="sm" variant="outline" className="mt-4">
                  Get pre-qualified
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
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
