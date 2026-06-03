import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { setMeta } from "@/lib/seo";
import {
  clientStripeReadiness,
  STRIPE_PRICE_VITE_VARS,
} from "@/lib/stripeMode";
import StripeModeBanner from "@/components/admin/StripeModeBanner";

// Server-side readiness shape returned by the stripe-readiness edge function.
// Mirrors supabase/functions/_shared/stripe-mode.ts — only env-var NAMES are
// returned, never secret values.
interface ServerReadiness {
  mode: "test" | "live";
  keyPrefix: "sk_test" | "sk_live" | "unknown" | "missing";
  ok: boolean;
  errors: string[];
  missing: string[];
}

function Row({ ok, label, detail }: { ok: boolean; label: string; detail?: string }) {
  return (
    <li className="flex items-start gap-3 py-2">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-400 shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 mt-0.5 text-red-400 shrink-0" />
      )}
      <div>
        <div className="text-sm">{label}</div>
        {detail && <div className="text-xs text-muted-foreground font-mono mt-0.5">{detail}</div>}
      </div>
    </li>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="font-display text-lg mb-3">{title}</h2>
      {children}
    </div>
  );
}

export default function AdminPaymentsLiveReadiness() {
  useEffect(() => {
    setMeta({ title: "Admin · Stripe live readiness", description: "Live-mode go/no-go for payments." });
  }, []);

  const client = clientStripeReadiness();

  const { data: server, isLoading, error } = useQuery({
    queryKey: ["stripe-readiness"],
    queryFn: async (): Promise<ServerReadiness> => {
      const { data, error } = await supabase.functions.invoke("stripe-readiness", { body: {} });
      if (error) throw error;
      return data as ServerReadiness;
    },
    retry: false,
  });

  const serverOk = server?.ok ?? false;
  const goLive = client.ok && serverOk && client.mode === "live" && server?.mode === "live";

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin/payments" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Back to payments
        </Link>
        <div className="eyebrow mt-2">Admin · payments</div>
        <h1 className="section-title">Stripe live-mode readiness</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Go/no-go for taking real charges. Checkout fails closed unless both the browser
          config and the server secrets are coherent for the selected mode.
        </p>
      </div>

      <StripeModeBanner />

      {/* Overall verdict */}
      <div
        className={`rounded-lg border p-4 flex items-center gap-3 ${
          goLive
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
            : "border-amber-500/30 bg-amber-500/10 text-amber-200"
        }`}
      >
        {goLive ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
        <div className="text-sm">
          {goLive ? (
            <strong>Ready for live charges.</strong>
          ) : client.mode === "test" && server?.mode === "test" ? (
            <span><strong>Test mode.</strong> Configure live keys + set STRIPE_MODE/VITE_STRIPE_MODE to <code>live</code> when ready to go live.</span>
          ) : (
            <span><strong>Not ready for live charges.</strong> Resolve the failing checks below before enabling live mode.</span>
          )}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Browser / client config */}
        <Panel title="Browser config (public)">
          <ul className="divide-y divide-border">
            <Row ok={client.mode === "live"} label="VITE_STRIPE_MODE" detail={`mode = ${client.mode}`} />
            <Row
              ok={client.keyPrefix === "pk_live"}
              label="Publishable key"
              detail={`prefix = ${client.keyPrefix}`}
            />
            {STRIPE_PRICE_VITE_VARS.map((name) => (
              <Row key={name} ok={!client.missing.includes(name)} label={name} />
            ))}
          </ul>
          {client.errors.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-red-300">
              {client.errors.map((e) => <li key={e}>• {e}</li>)}
            </ul>
          )}
        </Panel>

        {/* Server / secret config */}
        <Panel title="Server secrets (Supabase)">
          {isLoading && <div className="text-sm text-muted-foreground">Checking server secrets…</div>}
          {error && (
            <div className="text-sm text-red-300">
              Could not reach the stripe-readiness function. Confirm it's deployed and you're an admin.
            </div>
          )}
          {server && (
            <>
              <ul className="divide-y divide-border">
                <Row ok={server.mode === "live"} label="STRIPE_MODE" detail={`mode = ${server.mode}`} />
                <Row
                  ok={server.keyPrefix === "sk_live"}
                  label="Secret key"
                  detail={`prefix = ${server.keyPrefix}`}
                />
                {server.missing
                  .filter((m) => m.startsWith("STRIPE_PRICE_"))
                  .map((m) => <Row key={m} ok={false} label={m} detail="missing" />)}
                {server.missing.filter((m) => m.startsWith("STRIPE_PRICE_")).length === 0 && (
                  <Row ok={server.ok || server.mode === "test"} label="Live price IDs" detail={server.mode === "live" ? "all present" : "n/a in test mode"} />
                )}
              </ul>
              {server.errors.length > 0 && (
                <ul className="mt-3 space-y-1 text-xs text-red-300">
                  {server.errors.map((e) => <li key={e}>• {e}</li>)}
                </ul>
              )}
            </>
          )}
        </Panel>
      </div>

      <div className="rounded-lg border border-border bg-secondary/40 p-4 text-xs text-muted-foreground leading-relaxed">
        <p className="font-medium text-foreground mb-1">How to go live</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Recreate the 7 price SKUs in Stripe <strong>Live</strong> mode; copy the <code>price_…</code> IDs.</li>
          <li>Set the live <code>VITE_STRIPE_*</code> values in Vercel (Production) and the matching <code>STRIPE_*</code> Function Secrets in Supabase.</li>
          <li>Set <code>VITE_STRIPE_MODE=live</code> (Vercel) and <code>STRIPE_MODE=live</code> (Supabase secret).</li>
          <li>Re-deploy and confirm every check on this page is green before announcing.</li>
        </ol>
        <p className="mt-2">See <code>STRIPE_LIVE_MODE_READINESS.md</code> for the full runbook.</p>
      </div>
    </div>
  );
}
