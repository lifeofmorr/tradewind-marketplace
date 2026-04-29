import { useQuery } from "@tanstack/react-query";
import { Plane, Gauge, Radio, Wrench, Compass, Wind, Box, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { AircraftSpecs } from "@/types/database";
import { formatNumber } from "@/lib/utils";

interface Props {
  listingId: string;
}

const STATUS_LABEL: Record<string, string> = {
  standard: "Standard",
  experimental: "Experimental",
  special: "Special",
  restricted: "Restricted",
  provisional: "Provisional",
  pending: "Pending",
};

export function AircraftSpecPanel({ listingId }: Props) {
  const { data: spec, isLoading } = useQuery({
    queryKey: ["aircraft-specs", listingId],
    enabled: !!listingId,
    queryFn: async (): Promise<AircraftSpecs | null> => {
      const { data, error } = await supabase
        .from("aircraft_specs")
        .select("*")
        .eq("listing_id", listingId)
        .maybeSingle();
      if (error) throw error;
      return (data as AircraftSpecs | null) ?? null;
    },
  });

  if (isLoading) {
    return (
      <section className="rounded-xl border border-border bg-card/40 p-5">
        <div className="h-5 w-40 skeleton" />
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 skeleton" />
          ))}
        </div>
      </section>
    );
  }

  if (!spec) return null;

  const tboPct = spec.tbo_hours && spec.engine_hours != null
    ? Math.max(0, Math.min(100, Math.round((1 - spec.engine_hours / spec.tbo_hours) * 100)))
    : null;

  return (
    <section className="rounded-xl border border-brass-500/25 bg-card p-5">
      <header className="flex items-center gap-3 pb-3 border-b border-brass-500/15">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-brass-500/15 text-brass-300 ring-1 ring-brass-500/30">
          <Plane className="h-4 w-4" />
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-brass-400">
            aviation specs
          </div>
          <h3 className="font-display text-lg leading-tight">Airframe & avionics</h3>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-sm">
        <Cell icon={Wind} label="N-number" value={spec.n_number ?? "—"} />
        <Cell icon={Gauge} label="Total time"
          value={spec.total_time_hours != null ? `${formatNumber(spec.total_time_hours)} hrs` : "—"} />
        <Cell icon={Gauge} label="Engine hours"
          value={spec.engine_hours != null ? `${formatNumber(spec.engine_hours)} hrs` : "—"} />
        <Cell icon={Wrench} label="TBO"
          value={spec.tbo_hours != null
            ? tboPct != null
              ? `${formatNumber(spec.tbo_hours)} hrs · ${tboPct}% remaining`
              : `${formatNumber(spec.tbo_hours)} hrs`
            : "—"} />
        <Cell icon={Radio} label="Avionics" value={spec.avionics_suite ?? "—"} />
        <Cell icon={Compass} label="Autopilot" value={spec.autopilot ?? "—"} />
        <Cell icon={Radio} label="ADS-B" value={spec.ads_b ? "Yes" : "No"} />
        <Cell icon={Calendar} label="Annual"
          value={spec.annual_inspection_date
            ? new Date(spec.annual_inspection_date).toLocaleDateString()
            : "—"} />
        <Cell icon={Box} label="Seats" value={spec.seats != null ? `${spec.seats}` : "—"} />
        <Cell icon={Wind} label="Range"
          value={spec.range_nm != null ? `${formatNumber(spec.range_nm)} nm` : "—"} />
        <Cell icon={Gauge} label="Cruise"
          value={spec.cruise_speed_ktas != null ? `${formatNumber(spec.cruise_speed_ktas)} ktas` : "—"} />
        <Cell icon={Box} label="Useful load"
          value={spec.useful_load_lbs != null ? `${formatNumber(spec.useful_load_lbs)} lbs` : "—"} />
      </div>

      <footer className="mt-4 pt-3 border-t border-brass-500/10 flex flex-wrap gap-2 text-[11px]">
        <Tag>{spec.airworthiness_status
          ? `Airworthiness: ${STATUS_LABEL[spec.airworthiness_status] ?? spec.airworthiness_status}`
          : "Airworthiness: pending"}</Tag>
        <Tag>{spec.logbooks_complete ? "Logbooks complete" : "Logbooks partial"}</Tag>
        <Tag>{spec.hangared ? "Hangared" : "Tied down"}</Tag>
        {spec.damage_history && <Tag>Damage on file</Tag>}
      </footer>
    </section>
  );
}

function Cell({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="font-display text-base mt-1 leading-tight">{value}</div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-brass-500/30 bg-brass-500/5 px-2 py-0.5 font-mono uppercase tracking-wider text-brass-200">
      {children}
    </span>
  );
}
