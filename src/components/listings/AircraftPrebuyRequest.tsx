import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, ShieldAlert, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import type { AircraftPrebuyRequest } from "@/types/database";

interface Props {
  listingId: string;
}

type Scopes = {
  scope_logbook: boolean;
  scope_airframe: boolean;
  scope_engine: boolean;
  scope_avionics: boolean;
  scope_corrosion: boolean;
  scope_ad_sb: boolean;
};

const DEFAULT_SCOPES: Scopes = {
  scope_logbook: true,
  scope_airframe: true,
  scope_engine: true,
  scope_avionics: true,
  scope_corrosion: true,
  scope_ad_sb: true,
};

/**
 * Aircraft pre-buy inspection request flow.
 * Buyer selects scope (logbook / airframe / engine / avionics / corrosion / AD-SB),
 * adds notes, submits — TradeWind concierge / admin assigns an A&P/IA service provider.
 *
 * TradeWind itself does not perform inspections — assignment routes to a real
 * licensed A&P/IA partner.
 */
export function AircraftPrebuyRequestCard({ listingId }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [scopes, setScopes] = useState<Scopes>(DEFAULT_SCOPES);
  const [notes, setNotes] = useState("");
  const [reportUrl, setReportUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: existing = [] } = useQuery({
    queryKey: ["aircraft-prebuy", listingId, user?.id],
    enabled: !!listingId && !!user?.id,
    queryFn: async (): Promise<AircraftPrebuyRequest[]> => {
      const { data, error: e } = await supabase
        .from("aircraft_prebuy_requests")
        .select("*")
        .eq("listing_id", listingId)
        .order("created_at", { ascending: false });
      if (e) throw e;
      return (data ?? []) as AircraftPrebuyRequest[];
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to request a pre-buy inspection.");
      const { data, error: e } = await supabase
        .from("aircraft_prebuy_requests")
        .insert({
          listing_id: listingId,
          buyer_id: user.id,
          inspection_type: "pre_buy",
          notes: notes.trim() || null,
          status: "submitted",
          ...scopes,
        })
        .select()
        .single();
      if (e) throw e;
      return data;
    },
    onSuccess: () => {
      setNotes("");
      setScopes(DEFAULT_SCOPES);
      void qc.invalidateQueries({ queryKey: ["aircraft-prebuy", listingId, user?.id] });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Could not submit"),
  });

  const uploadReport = useMutation({
    mutationFn: async (req: AircraftPrebuyRequest) => {
      const { error: e } = await supabase
        .from("aircraft_prebuy_requests")
        .update({
          report_url: reportUrl.trim() || null,
          report_uploaded_at: reportUrl.trim() ? new Date().toISOString() : null,
          status: reportUrl.trim() ? "completed" : req.status,
        })
        .eq("id", req.id);
      if (e) throw e;
    },
    onSuccess: () => {
      setReportUrl("");
      void qc.invalidateQueries({ queryKey: ["aircraft-prebuy", listingId, user?.id] });
    },
  });

  return (
    <section className="rounded-xl border border-brass-500/25 bg-card p-5 space-y-4">
      <header className="flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-brass-500/15 text-brass-300 ring-1 ring-brass-500/30">
          <ClipboardCheck className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-brass-400">
            pre-buy inspection
          </div>
          <h3 className="font-display text-lg leading-tight">
            Request an A&amp;P / IA pre-buy
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            TradeWind routes pre-buy requests to a vetted A&amp;P or IA. TradeWind does
            not perform inspections.
          </p>
        </div>
      </header>

      {/* Scope checklist */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        {([
          ["scope_logbook", "Logbook review"],
          ["scope_airframe", "Airframe inspection"],
          ["scope_engine", "Engine inspection"],
          ["scope_avionics", "Avionics functional check"],
          ["scope_corrosion", "Corrosion / structural"],
          ["scope_ad_sb", "AD / SB compliance review"],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2">
            <input
              type="checkbox"
              checked={scopes[key]}
              onChange={(e) =>
                setScopes((s) => ({ ...s, [key]: e.target.checked }))
              }
              className="h-4 w-4 accent-brass-500"
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <div>
        <Label htmlFor="prebuy-notes" className="text-xs">Notes for the inspector</Label>
        <Textarea
          id="prebuy-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything specific you want examined — known issues, modifications, deal context."
        />
      </div>

      {error && <p className="text-xs text-red-400" role="alert">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">
          Once submitted, our admin team will assign an A&amp;P/IA service partner.
        </p>
        <Button
          type="button"
          onClick={() => submit.mutate()}
          disabled={submit.isPending || !user}
          size="sm"
        >
          {submit.isPending ? "Submitting…" : "Request inspection"}
        </Button>
      </div>

      {existing.length > 0 && (
        <div className="rounded-md border border-border bg-secondary/30 p-3 space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Your requests
          </div>
          <ul className="space-y-2 text-xs">
            {existing.map((r) => (
              <li key={r.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono uppercase tracking-wider">{r.status}</span>
                  <span className="text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                </div>
                {r.notes && <div className="text-muted-foreground">{r.notes}</div>}
                {r.report_url ? (
                  <a
                    href={r.report_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brass-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Upload className="h-3 w-3" /> View report
                  </a>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste signed report URL"
                      value={reportUrl}
                      onChange={(e) => setReportUrl(e.target.value)}
                      className="flex-1 rounded-md border border-border bg-secondary/40 px-2 py-1 text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => uploadReport.mutate(r)}
                      disabled={uploadReport.isPending || !reportUrl.trim()}
                    >
                      Save
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        role="note"
        className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] leading-relaxed text-amber-200/90"
      >
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
        <div>
          TradeWind does not perform inspections, verify airworthiness, or sign off
          on AD/SB compliance. Final airworthiness determination is the
          responsibility of an independent licensed A&amp;P/IA.
        </div>
      </div>
    </section>
  );
}
