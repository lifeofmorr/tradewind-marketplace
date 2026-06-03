import { useQuery } from "@tanstack/react-query";
import {
  Plane, Gauge, Radio, Wrench, Compass, Wind, Box, Calendar,
  FileText, Layers,
} from "lucide-react";
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
  current: "Current",
  expired: "Expired",
};

/** Read N-number using the new canonical field, falling back to legacy n_number. */
function reg(s: AircraftSpecs): string | null {
  return s.registration_number ?? s.n_number ?? null;
}

/** Total time prefers the new column. */
function tt(s: AircraftSpecs): number | null {
  return s.total_time ?? s.total_time_hours;
}

/** SMOH prefers new column. */
function smoh(s: AircraftSpecs): number | null {
  return s.smoh ?? s.smoh_hours;
}

/** TBO prefers new column. */
function tbo(s: AircraftSpecs): number | null {
  return s.tbo ?? s.tbo_hours;
}

/** ADS-B equipped — supports both column variants. */
function adsbEquipped(s: AircraftSpecs): boolean {
  return s.adsb === true || s.ads_b === true;
}

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

  const ttv = tt(spec);
  const smohv = smoh(spec);
  const tbov = tbo(spec);

  const tboPct = tbov != null && spec.engine_hours != null
    ? Math.max(0, Math.min(100, Math.round((1 - spec.engine_hours / tbov) * 100)))
    : null;

  const airworthCert =
    spec.airworthiness_certificate_status ?? spec.airworthiness_status ?? null;

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
          <h3 className="font-display text-lg leading-tight">Airframe, engine & avionics</h3>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-sm">
        <Cell icon={Wind} label="N-number" value={reg(spec) ?? "—"} />
        <Cell icon={FileText} label="Serial #" value={spec.serial_number ?? "—"} />
        <Cell icon={Gauge} label="Total time"
          value={ttv != null ? `${formatNumber(ttv)} hrs` : "—"} />
        <Cell icon={Gauge} label="Airframe"
          value={spec.airframe_hours != null ? `${formatNumber(spec.airframe_hours)} hrs` : "—"} />
        <Cell icon={Layers} label="Landings"
          value={spec.landings != null ? formatNumber(spec.landings) : "—"} />
        <Cell icon={Wrench} label="Engines"
          value={spec.engine_count != null
            ? `${spec.engine_count}× ${spec.engine_make ?? ""} ${spec.engine_model ?? ""}`.trim()
            : (spec.engine_make ?? "—")} />
        <Cell icon={Gauge} label="Engine hrs"
          value={spec.engine_hours != null ? `${formatNumber(spec.engine_hours)} hrs` : "—"} />
        <Cell icon={Wrench} label="SMOH / TBO"
          value={smohv != null || tbov != null
            ? `${smohv != null ? `${formatNumber(smohv)}` : "—"} / ${tbov != null ? `${formatNumber(tbov)}` : "—"}${tboPct != null ? ` · ${tboPct}% rem` : ""}`
            : "—"} />
        <Cell icon={Radio} label="Avionics" value={spec.avionics_suite ?? "—"} />
        <Cell icon={Compass} label="Autopilot" value={spec.autopilot ?? "—"} />
        <Cell icon={Radio} label="ADS-B" value={adsbEquipped(spec) ? "Yes" : "No"} />
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
        <Tag>{airworthCert
          ? `Airworthiness: ${STATUS_LABEL[airworthCert] ?? airworthCert}`
          : "Airworthiness: pending"}</Tag>
        <Tag>{spec.logbooks_complete ? "Logbooks complete" : "Logbooks partial"}</Tag>
        <Tag>{spec.hangared ? "Hangared" : (spec.hangar_status ?? "Tied down")}</Tag>
        {spec.ad_sb_compliance && <Tag>AD/SB: {spec.ad_sb_compliance}</Tag>}
        {spec.pre_buy_inspection_status && (
          <Tag>Pre-buy: {spec.pre_buy_inspection_status}</Tag>
        )}
        {spec.damage_history && <Tag>Damage on file</Tag>}
        {spec.ferry_ready && <Tag>Ferry-ready</Tag>}
      </footer>

      <p className="mt-4 pt-3 border-t border-amber-500/15 text-[11px] leading-relaxed text-amber-200/85">
        <span className="font-display text-amber-100">Aviation notice.</span>{" "}
        Specs shown are seller-supplied. Tradewind does not verify FAA status,
        airworthiness, AD/SB compliance, logbook completeness, or maintenance
        history. Independent verification by an A&amp;P/IA and a qualified
        broker is required before purchase.
      </p>
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
