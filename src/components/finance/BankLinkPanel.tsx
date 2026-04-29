import { useEffect, useState } from "react";
import { Banknote, ShieldCheck, Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const BANK_LINK_KEY = "plaid_bank_link";

export function BankLinkPanel() {
  const { user } = useAuth();
  const [requested, setRequested] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setRequested(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("integration_requests")
        .select("id")
        .eq("user_id", user.id)
        .eq("integration_key", BANK_LINK_KEY)
        .limit(1);
      if (!cancelled && data && data.length > 0) setRequested(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  async function requestAccess() {
    if (!user) {
      setError("Sign in to request bank-link access.");
      return;
    }
    if (requested) return;
    setPending(true);
    setError(null);
    const { error: insertErr } = await supabase
      .from("integration_requests")
      .insert({
        user_id: user.id,
        integration_key: BANK_LINK_KEY,
        integration_name: "Plaid Bank Link",
        category: "Financial",
      });
    setPending(false);
    if (insertErr) {
      setError(`Couldn't submit request: ${insertErr.message}`);
      return;
    }
    setRequested(true);
    setMessage("Request submitted — we'll reach out when bank linking is available.");
  }

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-brass-500/10 blur-3xl pointer-events-none"
      />

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-md grid place-items-center bg-gradient-to-br from-brass-500/30 to-brass-700/10 border border-white/10">
          <Banknote className="h-5 w-5 text-brass-300" />
        </div>
        <div>
          <div className="eyebrow">Bank Link</div>
          <div className="font-display text-xl mt-0.5">Verify your buying power</div>
        </div>
        <span className="ml-auto chip bg-slate-500/15 text-slate-300 ring-slate-400/20 ring-1 ring-inset">
          Coming soon
        </span>
      </div>

      <p className="text-sm text-muted-foreground mt-3 max-w-lg">
        Securely link your bank in seconds via Plaid. Sellers see a verified-funds badge — never your
        balance — which moves your offer to the top of the queue on high-demand listings.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-2 text-sm">
          <ShieldCheck className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
          <span>Read-only verification — TradeWind never sees credentials.</span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <Lock className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
          <span>Bank-grade encryption with revocable access at any time.</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {requested ? (
          <span className="chip bg-emerald-500/15 text-emerald-300 ring-emerald-400/20 ring-1 ring-inset">
            <Check className="h-3 w-3" />
            Access requested
          </span>
        ) : (
          <Button onClick={requestAccess} disabled={pending} className="btn-glow">
            {pending ? "Sending…" : "Request bank-link access"}
          </Button>
        )}
        <span className="text-xs text-muted-foreground font-mono uppercase tracking-[0.18em]">
          Available in private beta — May 2026
        </span>
      </div>

      {message && (
        <div className="mt-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 p-2.5 text-xs">
          {message}
        </div>
      )}
      {error && (
        <div className="mt-3 rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-200 p-2.5 text-xs">
          {error}
        </div>
      )}
    </div>
  );
}
