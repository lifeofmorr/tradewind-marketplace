import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setMeta } from "@/lib/seo";

function TestModeBanner() {
  const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "";
  const isTest = pk.startsWith("pk_test_") || !pk;
  if (!isTest) return null;
  return (
    <div className="mx-auto max-w-xl mt-4 flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-left text-amber-200">
      <FlaskConical className="h-4 w-4 mt-0.5 shrink-0 text-amber-300" />
      <div className="text-xs">
        <div className="font-display text-sm text-amber-100">Test mode</div>
        <div className="text-amber-200/90 mt-1">
          This is a test payment. No real charge was made and no funds were transferred.
        </div>
      </div>
    </div>
  );
}

export function CheckoutSuccess() {
  const [params] = useSearchParams();
  const session = params.get("session_id");
  useEffect(() => { setMeta({ title: "Payment received", description: "Your payment was received." }); }, []);
  return (
    <div className="container-pad py-24 max-w-xl text-center space-y-4">
      <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-400" />
      <h1 className="font-display text-4xl">Payment received.</h1>
      <p className="text-muted-foreground">
        Your order is processing. You'll get a receipt by email shortly.
      </p>
      <TestModeBanner />
      {session && <div className="text-xs font-mono text-muted-foreground">session: {session}</div>}
      <div className="flex justify-center gap-3 pt-2">
        <Button asChild><Link to="/">Back to home</Link></Button>
        <Button asChild variant="outline"><Link to="/buyer">Go to dashboard</Link></Button>
      </div>
    </div>
  );
}

export function CheckoutCancel() {
  useEffect(() => { setMeta({ title: "Checkout canceled", description: "Your checkout was canceled." }); }, []);
  return (
    <div className="container-pad py-24 max-w-xl text-center space-y-4">
      <XCircle className="h-12 w-12 mx-auto text-muted-foreground" />
      <h1 className="font-display text-4xl">Checkout canceled.</h1>
      <p className="text-muted-foreground">No charge was made. You can try again any time.</p>
      <TestModeBanner />
      <Button asChild variant="outline"><Link to="/">Back to home</Link></Button>
    </div>
  );
}
