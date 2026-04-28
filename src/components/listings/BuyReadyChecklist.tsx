import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { Listing } from "@/types/database";
import { cn } from "@/lib/utils";

const ITEMS: { key: string; label: string; hint?: string }[] = [
  { key: "contacted", label: "Seller contacted" },
  { key: "financing", label: "Financing pre-approval requested", hint: "Through TradeWind partners or your bank" },
  { key: "insurance", label: "Insurance quote requested" },
  { key: "inspection", label: "Inspection / survey scheduled", hint: "Pre-purchase inspection or marine survey" },
  { key: "title", label: "Title / HIN / VIN reviewed", hint: "Confirm clean title and matching numbers" },
  { key: "transport", label: "Transport quote requested" },
  { key: "offer", label: "Offer prepared / sent" },
  { key: "delivery", label: "Delivery scheduled" },
];

interface Props {
  listing: Listing;
}

export function BuyReadyChecklist({ listing }: Props) {
  const storageKey = `tw:buyready:${listing.id}`;
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setChecked(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  function toggle(key: string) {
    setChecked((c) => {
      const next = { ...c, [key]: !c[key] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const completed = ITEMS.filter((i) => checked[i.key]).length;
  const pct = Math.round((completed / ITEMS.length) * 100);

  return (
    <div className="glass-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="eyebrow">Buy-ready checklist</div>
          <div className="font-display text-2xl mt-1">Ready to close?</div>
        </div>
        <div className="text-xs font-mono text-muted-foreground">
          {completed}/{ITEMS.length}
        </div>
      </div>

      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-secondary/40">
        <div
          className="h-full bg-brass-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-4 space-y-1">
        {ITEMS.map((item) => {
          const isOn = !!checked[item.key];
          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => toggle(item.key)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors",
                  isOn ? "bg-brass-500/5" : "hover:bg-secondary/40",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors",
                    isOn
                      ? "bg-brass-500 border-brass-500 text-navy-950"
                      : "border-border bg-card",
                  )}
                  aria-hidden
                >
                  {isOn && <Check className="h-3 w-3" />}
                </span>
                <span className="flex-1">
                  <span className={cn("block", isOn && "line-through text-muted-foreground")}>
                    {item.label}
                  </span>
                  {item.hint && (
                    <span className="block text-[11px] text-muted-foreground/80 mt-0.5">
                      {item.hint}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-[11px] text-muted-foreground/80">
        Saved locally on this device. Use this as a guide — TradeWind concierge can handle each step
        end-to-end.
      </p>
    </div>
  );
}
