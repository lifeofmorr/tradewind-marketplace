import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, FlaskConical } from "lucide-react";
import { clientStripeReadiness } from "@/lib/stripeMode";

// Compact banner shown on admin payment surfaces so it's always obvious which
// Stripe mode the live site is running in. Uses only PUBLIC client config
// (publishable key + price IDs); the authoritative server gate lives in the
// stripe-readiness edge function and is surfaced on /admin/payments/live-readiness.
export default function StripeModeBanner() {
  const r = clientStripeReadiness();

  const live = r.mode === "live";
  const broken = !r.ok;

  // Color: red when broken (any mode), amber for healthy live, slate for test.
  const tone = broken
    ? "border-red-500/30 bg-red-500/10 text-red-200"
    : live
      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
      : "border-border bg-secondary text-muted-foreground";

  const Icon = broken ? AlertTriangle : live ? CheckCircle2 : FlaskConical;

  return (
    <div className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm ${tone}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <div className="flex-1">
        <span className="font-medium">
          Stripe mode: {r.mode.toUpperCase()}
          {live ? " — real charges" : " — test charges only"}
        </span>
        {broken && (
          <span className="block text-xs opacity-90">
            {r.errors[0] ?? "Stripe client config is incomplete."}
          </span>
        )}
      </div>
      <Link
        to="/admin/payments/live-readiness"
        className="shrink-0 text-xs underline underline-offset-2 hover:opacity-80"
      >
        Live readiness
      </Link>
    </div>
  );
}
