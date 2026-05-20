import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plane, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import type { AircraftSpecs } from "@/types/database";

interface Props {
  listingId: string;
  /** disable editing (admin viewing another user's listing) */
  readOnly?: boolean;
}

type Patch = Partial<Omit<AircraftSpecs, "id" | "listing_id" | "created_at" | "updated_at">>;

const AIRWORTH_OPTIONS = [
  "standard", "experimental", "special",
  "restricted", "provisional", "pending",
];

const PREBUY_OPTIONS = [
  "not_started", "scheduled", "in_progress", "passed", "issues_found", "completed",
];

const HANGAR_OPTIONS = [
  "hangared", "tied_down", "covered", "outside",
];

/**
 * Reusable form for aviation-specific specs on a listing. Persists directly
 * to the aircraft_specs table — upserts by listing_id.
 *
 * Save behavior: each input commits onBlur via the `save()` patcher to keep
 * UX consistent with the rest of EditListing.
 */
export function AircraftSpecsForm({ listingId, readOnly = false }: Props) {
  const qc = useQueryClient();
  const [savedTick, setSavedTick] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: spec } = useQuery({
    queryKey: ["aircraft-specs", listingId],
    enabled: !!listingId,
    queryFn: async (): Promise<AircraftSpecs | null> => {
      const { data, error: e } = await supabase
        .from("aircraft_specs")
        .select("*")
        .eq("listing_id", listingId)
        .maybeSingle();
      if (e) throw e;
      return (data as AircraftSpecs | null) ?? null;
    },
  });

  // Local mirror for controlled inputs; updates merge with server snapshot
  const [draft, setDraft] = useState<Patch>({});
  useEffect(() => {
    setDraft({});
  }, [listingId]);

  const val = <K extends keyof AircraftSpecs>(k: K): AircraftSpecs[K] | undefined => {
    const local = (draft as Record<string, unknown>)[k as string];
    if (local !== undefined) return local as AircraftSpecs[K];
    return spec ? (spec[k] as AircraftSpecs[K]) : undefined;
  };

  async function save(patch: Patch) {
    if (readOnly) return;
    setError(null);
    setDraft((prev) => ({ ...prev, ...patch }));
    const payload = { ...patch, listing_id: listingId };
    const { error: e } = await supabase
      .from("aircraft_specs")
      .upsert(payload, { onConflict: "listing_id" });
    if (e) {
      setError(e.message);
      return;
    }
    setSavedTick(true);
    setTimeout(() => setSavedTick(false), 1400);
    void qc.invalidateQueries({ queryKey: ["aircraft-specs", listingId] });
  }

  function num(value: string): number | null {
    if (!value.trim()) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  return (
    <section className="rounded-lg border border-brass-500/30 bg-card p-6 space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-brass-500/15 text-brass-300 ring-1 ring-brass-500/30">
            <Plane className="h-4 w-4" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-brass-400">
              Aviation specs
            </div>
            <h3 className="font-display text-lg leading-tight">Airframe, engine & avionics</h3>
          </div>
        </div>
        <div className="text-xs font-mono">
          {savedTick && <span className="text-emerald-400">saved</span>}
          {error && <span className="text-red-400">{error}</span>}
        </div>
      </header>

      {/* Identification */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Registration / N-number">
          <Input
            disabled={readOnly}
            defaultValue={val("registration_number") ?? val("n_number") ?? ""}
            placeholder="e.g. N123AB"
            onBlur={(e) => void save({
              registration_number: e.target.value || null,
              n_number: e.target.value || null,
            })}
          />
        </Field>
        <Field label="Serial number">
          <Input
            disabled={readOnly}
            defaultValue={val("serial_number") ?? ""}
            onBlur={(e) => void save({ serial_number: e.target.value || null })}
          />
        </Field>
      </div>

      {/* Times */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Total time (hrs)">
          <Input
            type="number" step="any" disabled={readOnly}
            defaultValue={(val("total_time") ?? val("total_time_hours")) ?? ""}
            onBlur={(e) => void save({
              total_time: num(e.target.value),
              total_time_hours: num(e.target.value),
            })}
          />
        </Field>
        <Field label="Airframe hours">
          <Input
            type="number" step="any" disabled={readOnly}
            defaultValue={val("airframe_hours") ?? ""}
            onBlur={(e) => void save({ airframe_hours: num(e.target.value) })}
          />
        </Field>
        <Field label="Landings">
          <Input
            type="number" step="1" disabled={readOnly}
            defaultValue={val("landings") ?? ""}
            onBlur={(e) => void save({ landings: num(e.target.value) })}
          />
        </Field>
        <Field label="Propeller hours">
          <Input
            type="number" step="any" disabled={readOnly}
            defaultValue={val("propeller_hours") ?? ""}
            onBlur={(e) => void save({ propeller_hours: num(e.target.value) })}
          />
        </Field>
      </div>

      {/* Engine */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Engine make">
          <Input
            disabled={readOnly}
            defaultValue={val("engine_make") ?? ""}
            placeholder="Continental, Lycoming, PT6A"
            onBlur={(e) => void save({ engine_make: e.target.value || null })}
          />
        </Field>
        <Field label="Engine model">
          <Input
            disabled={readOnly}
            defaultValue={val("engine_model") ?? ""}
            onBlur={(e) => void save({ engine_model: e.target.value || null })}
          />
        </Field>
        <Field label="Engine count">
          <Input
            type="number" step="1" min={1} disabled={readOnly}
            defaultValue={val("engine_count") ?? ""}
            onBlur={(e) => void save({ engine_count: num(e.target.value) })}
          />
        </Field>
        <Field label="Engine hours">
          <Input
            type="number" step="any" disabled={readOnly}
            defaultValue={val("engine_hours") ?? ""}
            onBlur={(e) => void save({ engine_hours: num(e.target.value) })}
          />
        </Field>
        <Field label="SMOH (hrs since overhaul)">
          <Input
            type="number" step="any" disabled={readOnly}
            defaultValue={(val("smoh") ?? val("smoh_hours")) ?? ""}
            onBlur={(e) => void save({
              smoh: num(e.target.value),
              smoh_hours: num(e.target.value),
            })}
          />
        </Field>
        <Field label="SNEW (hrs since new)">
          <Input
            type="number" step="any" disabled={readOnly}
            defaultValue={typeof val("snew") === "number" ? (val("snew") as number) : ""}
            onBlur={(e) => void save({ snew: num(e.target.value) })}
          />
        </Field>
        <Field label="TBO (hrs)">
          <Input
            type="number" step="any" disabled={readOnly}
            defaultValue={(val("tbo") ?? val("tbo_hours")) ?? ""}
            onBlur={(e) => void save({
              tbo: num(e.target.value),
              tbo_hours: num(e.target.value),
            })}
          />
        </Field>
      </div>

      {/* Inspection / cert */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Annual inspection date">
          <Input
            type="date" disabled={readOnly}
            defaultValue={val("annual_inspection_date") ?? ""}
            onBlur={(e) => void save({ annual_inspection_date: e.target.value || null })}
          />
        </Field>
        <Field label="Airworthiness certificate">
          <Select
            disabled={readOnly}
            value={(val("airworthiness_certificate_status") ?? val("airworthiness_status") ?? "") as string}
            onValueChange={(v) => void save({
              airworthiness_certificate_status: v || null,
              airworthiness_status: (v || null) as AircraftSpecs["airworthiness_status"],
            })}
          >
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              {AIRWORTH_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Logbooks complete">
          <Select
            disabled={readOnly}
            value={String(val("logbooks_complete") ?? false)}
            onValueChange={(v) => void save({ logbooks_complete: v === "true" })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes — complete</SelectItem>
              <SelectItem value="false">No — partial</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      {/* Avionics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Avionics suite">
          <Input
            disabled={readOnly}
            defaultValue={val("avionics_suite") ?? ""}
            placeholder="Garmin G1000 NXi, GTN 750, GFC700"
            onBlur={(e) => void save({ avionics_suite: e.target.value || null })}
          />
        </Field>
        <Field label="Autopilot">
          <Input
            disabled={readOnly}
            defaultValue={val("autopilot") ?? ""}
            placeholder="GFC700, S-TEC 55X…"
            onBlur={(e) => void save({ autopilot: e.target.value || null })}
          />
        </Field>
        <Field label="ADS-B in/out">
          <Select
            disabled={readOnly}
            value={String((val("adsb") ?? val("ads_b")) ?? false)}
            onValueChange={(v) => void save({
              adsb: v === "true",
              ads_b: v === "true",
            })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      {/* Performance / payload */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Seats">
          <Input
            type="number" step="1" disabled={readOnly}
            defaultValue={val("seats") ?? ""}
            onBlur={(e) => void save({ seats: num(e.target.value) })}
          />
        </Field>
        <Field label="Range (nm)">
          <Input
            type="number" step="any" disabled={readOnly}
            defaultValue={val("range_nm") ?? ""}
            onBlur={(e) => void save({ range_nm: num(e.target.value) })}
          />
        </Field>
        <Field label="Cruise speed (ktas)">
          <Input
            type="number" step="any" disabled={readOnly}
            defaultValue={val("cruise_speed_ktas") ?? ""}
            onBlur={(e) => void save({ cruise_speed_ktas: num(e.target.value) })}
          />
        </Field>
        <Field label="Useful load (lbs)">
          <Input
            type="number" step="any" disabled={readOnly}
            defaultValue={val("useful_load_lbs") ?? ""}
            onBlur={(e) => void save({ useful_load_lbs: num(e.target.value) })}
          />
        </Field>
      </div>

      {/* Condition / Readiness */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Hangar status">
          <Select
            disabled={readOnly}
            value={val("hangar_status") ?? (val("hangared") ? "hangared" : "tied_down")}
            onValueChange={(v) => void save({
              hangar_status: v,
              hangared: v === "hangared" || v === "covered",
            })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {HANGAR_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>{o.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Pre-buy inspection">
          <Select
            disabled={readOnly}
            value={val("pre_buy_inspection_status") ?? ""}
            onValueChange={(v) => void save({ pre_buy_inspection_status: v || null })}
          >
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              {PREBUY_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>{o.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Ferry-ready">
          <Select
            disabled={readOnly}
            value={String(val("ferry_ready") ?? false)}
            onValueChange={(v) => void save({ ferry_ready: v === "true" })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="AD/SB compliance notes">
        <Textarea
          rows={2} disabled={readOnly}
          defaultValue={val("ad_sb_compliance") ?? ""}
          placeholder="Notes on Airworthiness Directives / Service Bulletins (independent A&P/IA verification required)"
          onBlur={(e) => void save({ ad_sb_compliance: e.target.value || null })}
        />
      </Field>

      <Field label="Damage history">
        <Textarea
          rows={2} disabled={readOnly}
          defaultValue={val("damage_history") ?? ""}
          placeholder="Disclose any known damage. Required for honest sale."
          onBlur={(e) => void save({ damage_history: e.target.value || null })}
        />
      </Field>

      <div
        role="note"
        className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs"
      >
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <div className="leading-relaxed text-amber-200/90">
          Specs you enter are <strong>seller-supplied</strong>. TradeWind does not
          verify FAA status, airworthiness, AD/SB compliance, or maintenance
          history. Buyers are expected to independently verify via an A&amp;P/IA.
        </div>
      </div>

      {!readOnly && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void qc.invalidateQueries({ queryKey: ["aircraft-specs", listingId] })}
          >
            Reload
          </Button>
        </div>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
