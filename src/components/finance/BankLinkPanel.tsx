import { Banknote, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BankLinkPanel() {
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
        <Button disabled className="btn-glow">
          Connect bank
        </Button>
        <span className="text-xs text-muted-foreground font-mono uppercase tracking-[0.18em]">
          Available in private beta — May 2026
        </span>
      </div>
    </div>
  );
}
