import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plane, ShieldAlert, Wrench } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { setMeta } from "@/lib/seo";
import { AVIATION_SERVICE_CATEGORIES } from "@/lib/categories";
import type { ServiceProvider } from "@/types/database";

const CATEGORY_LABELS: Record<string, string> = {
  ap_mechanic: "A&P mechanic",
  ia_inspector: "IA inspector",
  aviation_maintenance_shop: "Maintenance shop",
  aircraft_broker: "Aircraft broker",
  aircraft_lender: "Aircraft lender",
  aviation_insurance: "Aviation insurance",
  aircraft_title_company: "Title company",
  aircraft_escrow: "Escrow partner",
  ferry_pilot: "Ferry pilot",
  avionics_shop: "Avionics shop",
  hangar_storage: "Hangar / storage",
};

const CATEGORY_BLURBS: Record<string, string> = {
  ap_mechanic: "Licensed A&P mechanics for pre-buy inspections and routine maintenance.",
  ia_inspector: "FAA Inspection Authorization holders for annual sign-off and major-repair approval.",
  aviation_maintenance_shop: "Full-service maintenance facilities — engine, airframe, avionics.",
  aircraft_broker: "Vetted aircraft brokers handling buy- and sell-side representation.",
  aircraft_lender: "Aviation-specific lenders offering aircraft financing and refinancing.",
  aviation_insurance: "Aviation insurance brokers — hull, liability, and CFI/instruction policies.",
  aircraft_title_company: "Aircraft title companies — FAA registry search, title transfer, AC Form 8050-2.",
  aircraft_escrow: "Aircraft escrow partners — funds custody and closing through Oklahoma City.",
  ferry_pilot: "Insured ferry pilots qualified to deliver your aircraft anywhere.",
  avionics_shop: "FAA-certified avionics shops — Garmin, Avidyne, Aspen, ADS-B installs.",
  hangar_storage: "Hangar and tie-down providers — airport-by-airport availability.",
};

export default function AviationServicesPage() {
  const [active, setActive] = useState<string | "all">("all");

  useEffect(() => {
    setMeta({
      title: "Aviation services — A&P/IA, brokers, escrow, ferry, avionics",
      description:
        "Vetted aviation service partners — A&P mechanics, IA inspectors, brokers, aviation lenders, "
        + "insurance brokers, title companies, escrow partners, ferry pilots, avionics shops, hangar providers.",
    });
  }, []);

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["aviation-service-providers"],
    queryFn: async (): Promise<ServiceProvider[]> => {
      const { data, error } = await supabase
        .from("service_providers")
        .select("*")
        .in("category", AVIATION_SERVICE_CATEGORIES as unknown as string[])
        .order("is_featured", { ascending: false })
        .order("name");
      if (error) throw error;
      return (data ?? []) as ServiceProvider[];
    },
  });

  const filtered = useMemo(() => {
    if (active === "all") return providers;
    return providers.filter((p) => p.category === active);
  }, [providers, active]);

  // Group fallback (when no providers exist yet)
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of providers) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return counts;
  }, [providers]);

  return (
    <div className="container-pad py-12 space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.32em] text-brass-400">
          <Plane className="h-3.5 w-3.5" /> aviation
        </div>
        <h1 className="font-display text-4xl mt-1">Aviation services</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Vetted aviation partners — A&amp;P/IA inspections, escrow, title, ferry, avionics,
          hangar, financing and insurance. Match by airport / state. Tradewind does not perform
          inspections, escrow, title, financing or insurance itself.
        </p>
      </header>

      <div
        role="note"
        className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm"
      >
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <div className="leading-relaxed text-amber-100/90">
          <span className="font-display text-base text-amber-100">Aviation safety notice.</span>{" "}
          Service providers listed are independent — Tradewind does not perform inspections,
          verify airworthiness, perform title searches, hold escrow funds, or underwrite
          insurance. Buyers must independently verify each partner's credentials with the FAA,
          state regulators, and references before engaging.
        </div>
      </div>

      <nav aria-label="Aviation service categories" className="flex flex-wrap gap-2">
        <Chip active={active === "all"} onClick={() => setActive("all")}>
          All partners
        </Chip>
        {AVIATION_SERVICE_CATEGORIES.map((c) => (
          <Chip
            key={c}
            active={active === c}
            onClick={() => setActive(c)}
          >
            {CATEGORY_LABELS[c] ?? c} {categoryCounts.get(c) ? `· ${categoryCounts.get(c)}` : ""}
          </Chip>
        ))}
      </nav>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[5/3] skeleton rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState active={active} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/services/${p.slug}`}
              className="rounded-lg border border-border bg-card p-6 hover:border-brass-500/50 transition-colors"
            >
              <div className="font-mono text-xs uppercase tracking-wider text-brass-400">
                {CATEGORY_LABELS[p.category] ?? p.category.replace(/_/g, " ")}
              </div>
              <div className="font-display text-lg mt-1">{p.name}</div>
              <div className="text-xs text-muted-foreground">
                {[p.city, p.state].filter(Boolean).join(", ") || "—"}
              </div>
              {p.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{p.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors",
        active
          ? "border-brass-400/60 bg-brass-500/10 text-brass-200"
          : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-brass-500/30",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function EmptyState({ active }: { active: string }) {
  const label = active === "all"
    ? "aviation service partners"
    : (CATEGORY_LABELS[active] ?? active.replace(/_/g, " "));
  const blurb = active === "all"
    ? "We're onboarding aviation partners now — check back soon."
    : (CATEGORY_BLURBS[active] ?? "Onboarding in progress.");
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center space-y-3">
      <Wrench className="h-8 w-8 text-brass-400 mx-auto" />
      <div className="font-display text-2xl">No {label} listed yet</div>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        {blurb}
      </p>
      <Link
        to="/onboarding/service-provider"
        className="inline-block mt-2 text-xs font-mono uppercase tracking-[0.32em] text-brass-400 hover:underline"
      >
        Become an aviation partner →
      </Link>
    </div>
  );
}
