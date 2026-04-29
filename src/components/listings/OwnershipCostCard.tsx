import { useMemo, useState } from "react";
import type { Listing } from "@/types/database";
import {
  calculateOwnershipCost,
  DEFAULT_FINANCING,
  type FinancingInputs,
} from "@/lib/ownershipCost";
import { formatCents } from "@/lib/utils";

function fmt(usd: number) {
  return formatCents(Math.round(usd * 100));
}

interface Props {
  listing: Listing;
}

export function OwnershipCostCard({ listing }: Props) {
  const [inputs, setInputs] = useState<FinancingInputs>(DEFAULT_FINANCING);
  const result = useMemo(() => calculateOwnershipCost(listing, inputs), [listing, inputs]);

  if (!listing.price_cents) {
    return (
      <div className="glass-card p-5 space-y-3">
        <div>
          <div className="eyebrow">Ownership cost</div>
          <div className="font-display text-2xl mt-1 text-muted-foreground">
            Estimate unavailable
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          We need a list price to estimate monthly cost-to-own. Typical full-cost ranges for this
          category include loan payment, insurance, storage or dock fees, maintenance, and fuel —
          ask the seller for a price and we'll plug in the numbers.
        </p>
        <p className="text-[11px] text-muted-foreground/80">
          Estimates are for planning only. Actual costs vary by lender, region, usage, and condition.
        </p>
      </div>
    );
  }

  const rows: { label: string; value: number; muted?: boolean }[] = [
    { label: "Loan payment", value: result.monthlyPayment },
    { label: "Insurance", value: result.insuranceMonthly },
    { label: "Storage / dock", value: result.storageMonthly, muted: result.storageMonthly === 0 },
    { label: "Maintenance", value: result.maintenanceMonthly },
    { label: "Fuel", value: result.fuelMonthly, muted: result.fuelMonthly === 0 },
  ].filter((r) => r.value > 0 || !r.muted);

  return (
    <div className="glass-card p-5 space-y-4">
      <div>
        <div className="eyebrow">Ownership cost</div>
        <div className="font-display text-2xl mt-1">~{fmt(result.totalMonthly)}/mo</div>
        <div className="text-xs text-muted-foreground mt-1">
          {fmt(result.annualTotal)}/yr · {fmt(result.fiveYearTotal)} over 5 yrs
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs">
        <label className="space-y-1">
          <span className="text-muted-foreground">Down %</span>
          <input
            type="number"
            min={0}
            max={100}
            value={Math.round(inputs.downPaymentPct * 100)}
            onChange={(e) =>
              setInputs((s) => ({
                ...s,
                downPaymentPct: Math.max(0, Math.min(1, Number(e.target.value) / 100)),
              }))
            }
            className="w-full rounded-md bg-secondary/50 border border-border px-2 py-1 font-mono"
          />
        </label>
        <label className="space-y-1">
          <span className="text-muted-foreground">Term (mo)</span>
          <input
            type="number"
            min={12}
            max={240}
            step={12}
            value={inputs.termMonths}
            onChange={(e) =>
              setInputs((s) => ({
                ...s,
                termMonths: Math.max(12, Math.min(240, Number(e.target.value) || 60)),
              }))
            }
            className="w-full rounded-md bg-secondary/50 border border-border px-2 py-1 font-mono"
          />
        </label>
        <label className="space-y-1">
          <span className="text-muted-foreground">APR %</span>
          <input
            type="number"
            min={0}
            max={30}
            step={0.25}
            value={inputs.aprPct}
            onChange={(e) =>
              setInputs((s) => ({
                ...s,
                aprPct: Math.max(0, Math.min(30, Number(e.target.value) || 0)),
              }))
            }
            className="w-full rounded-md bg-secondary/50 border border-border px-2 py-1 font-mono"
          />
        </label>
      </div>

      <ul className="divide-y divide-border/40 text-sm">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-mono">{fmt(row.value)}</span>
          </li>
        ))}
      </ul>

      <p className="text-[11px] text-muted-foreground/80">
        Estimates are for planning only. Actual costs vary by lender, region, usage, and condition.
        Get a real quote via <span className="text-brass-400">Financing</span>,{" "}
        <span className="text-brass-400">Insurance</span>, and{" "}
        <span className="text-brass-400">Inspection</span> partners.
      </p>
    </div>
  );
}
