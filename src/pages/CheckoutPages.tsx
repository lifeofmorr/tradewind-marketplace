import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setMeta } from "@/lib/seo";

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
      <Button asChild variant="outline"><Link to="/">Back to home</Link></Button>
    </div>
  );
}
