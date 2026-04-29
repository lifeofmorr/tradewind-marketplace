import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Level = {
  key: "browsing" | "interested" | "serious" | "buy_ready";
  label: string;
  copy: string;
  /** Inclusive lower bound. */
  min: number;
};

const LEVELS: Level[] = [
  {
    key: "browsing",
    label: "Browsing",
    copy: "Save listings you like to start building your shortlist.",
    min: 0,
  },
  {
    key: "interested",
    label: "Interested",
    copy: "Request financing or insurance to firm up your budget.",
    min: 3,
  },
  {
    key: "serious",
    label: "Serious",
    copy: "Schedule an inspection and request transport on your top picks.",
    min: 5,
  },
  {
    key: "buy_ready",
    label: "Buy Ready",
    copy: "You're ready to make an offer. TradeWind concierge can close it.",
    min: 7,
  },
];

const MAX_SCORE = 7;

interface Components {
  saved: boolean;
  financing: boolean;
  insurance: boolean;
  inspection: boolean;
  transport: boolean;
  concierge: boolean;
  offer: boolean;
}

interface ReadinessRow {
  pre_approved: boolean | null;
  insurance_quoted: boolean | null;
  transport_arranged: boolean | null;
}

function levelFor(score: number): Level {
  let chosen = LEVELS[0];
  for (const level of LEVELS) {
    if (score >= level.min) chosen = level;
  }
  return chosen;
}

interface ChecklistItem {
  key: keyof Components;
  label: string;
  to: string;
}

const CHECKLIST: ChecklistItem[] = [
  { key: "saved", label: "Save a listing", to: "/browse" },
  { key: "financing", label: "Request financing", to: "/financing" },
  { key: "insurance", label: "Request insurance quote", to: "/insurance" },
  { key: "inspection", label: "Schedule an inspection", to: "/inspections" },
  { key: "transport", label: "Get a transport quote", to: "/transport" },
  { key: "concierge", label: "Submit a concierge brief", to: "/concierge" },
  { key: "offer", label: "Draft an offer on a listing", to: "/browse" },
];

export function BuyerReadinessCard() {
  const { user } = useAuth();

  const { data: components } = useQuery({
    queryKey: ["buyer-readiness", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Components> => {
      if (!user) {
        return {
          saved: false,
          financing: false,
          insurance: false,
          inspection: false,
          transport: false,
          concierge: false,
          offer: false,
        };
      }
      const [
        savedRes,
        financeRes,
        insuranceRes,
        inspectionRes,
        transportRes,
        conciergeRes,
        readinessRes,
      ] = await Promise.all([
        supabase
          .from("saved_listings")
          .select("listing_id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("financing_requests")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("insurance_requests")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("inspection_requests")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("transport_requests")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("concierge_requests")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("financial_readiness")
          .select("pre_approved,insurance_quoted,transport_arranged")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      const readiness = (readinessRes.data ?? null) as ReadinessRow | null;
      const offerKey = `tw:offer-drafted:${user.id}`;
      let offerDrafted = false;
      try {
        offerDrafted = localStorage.getItem(offerKey) === "1";
      } catch {
        /* ignore storage errors */
      }

      return {
        saved: (savedRes.count ?? 0) > 0,
        financing:
          (financeRes.count ?? 0) > 0 || Boolean(readiness?.pre_approved),
        insurance:
          (insuranceRes.count ?? 0) > 0 || Boolean(readiness?.insurance_quoted),
        inspection: (inspectionRes.count ?? 0) > 0,
        transport:
          (transportRes.count ?? 0) > 0 ||
          Boolean(readiness?.transport_arranged),
        concierge: (conciergeRes.count ?? 0) > 0,
        offer: offerDrafted,
      };
    },
  });

  // Subtle reveal of the progress ring when score changes.
  const [animateKey, setAnimateKey] = useState(0);

  const score = components
    ? Math.min(
        MAX_SCORE,
        (components.saved ? 1 : 0) +
          (components.financing ? 1 : 0) +
          (components.insurance ? 1 : 0) +
          (components.inspection ? 1 : 0) +
          (components.transport ? 1 : 0) +
          (components.concierge ? 1 : 0) +
          (components.offer ? 1 : 0),
      )
    : 0;

  useEffect(() => {
    setAnimateKey((k) => k + 1);
  }, [score]);

  const level = levelFor(score);
  const pct = (score / MAX_SCORE) * 100;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="rounded-xl border border-brass-500/30 bg-gradient-to-br from-brass-500/[0.06] via-card to-card p-5 shadow-[0_0_0_1px_rgba(214,160,87,0.05)]">
      <header className="flex items-start gap-4">
        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-secondary/40"
            />
            <circle
              key={animateKey}
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="text-brass-500 transition-[stroke-dashoffset] duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="font-display text-2xl leading-none">{score}</div>
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mt-1">
                of {MAX_SCORE}
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-brass-400">
            Buyer readiness
          </div>
          <div className="font-display text-xl mt-1">{level.label}</div>
          <p className="mt-1 text-xs text-muted-foreground/90 leading-relaxed">
            {level.copy}
          </p>
        </div>
      </header>

      <ul className="mt-4 space-y-1 border-t border-brass-500/10 pt-3">
        {CHECKLIST.map((item) => {
          const done = components ? components[item.key] : false;
          return (
            <li key={item.key}>
              <Link
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-secondary/50",
                  done && "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid h-4 w-4 shrink-0 place-items-center rounded-full ring-1 ring-inset",
                    done
                      ? "bg-brass-500 text-navy-950 ring-brass-500"
                      : "bg-card text-transparent ring-border",
                  )}
                  aria-hidden
                >
                  <Sparkles className="h-2.5 w-2.5" />
                </span>
                <span className={cn("flex-1", done && "line-through")}>
                  {item.label}
                </span>
                {!done && (
                  <ArrowRight className="h-3.5 w-3.5 text-brass-400 opacity-70" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
