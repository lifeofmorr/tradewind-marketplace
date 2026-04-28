import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { setMeta } from "@/lib/seo";
import { formatCents, timeAgo } from "@/lib/utils";
import type { Payment, PaymentStatus, Profile, Dealer } from "@/types/database";

const VARIANT: Record<PaymentStatus, "default" | "accent" | "good" | "bad"> = {
  pending: "accent",
  succeeded: "good",
  failed: "bad",
  refunded: "default",
};

const STATUSES: PaymentStatus[] = ["pending", "succeeded", "failed", "refunded"];
const ANY = "_any";

interface EnrichedPayment extends Payment {
  user: Pick<Profile, "id" | "email" | "full_name"> | null;
  dealer: Pick<Dealer, "id" | "name" | "slug"> | null;
}

export default function AdminPayments() {
  const [status, setStatus] = useState<PaymentStatus | undefined>();
  const [q, setQ] = useState("");

  useEffect(() => { setMeta({ title: "Admin · payments", description: "All Stripe payments." }); }, []);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["admin-payments", status],
    queryFn: async (): Promise<EnrichedPayment[]> => {
      let query = supabase
        .from("payments")
        .select("*, user:profiles(id, email, full_name), dealer:dealers(id, name, slug)")
        .order("created_at", { ascending: false })
        .limit(500);
      if (status) query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as EnrichedPayment[];
    },
  });

  const filtered = useMemo(() => {
    if (!q.trim()) return payments;
    const needle = q.trim().toLowerCase();
    return payments.filter((p) => {
      return (
        p.description?.toLowerCase().includes(needle) ||
        p.stripe_payment_intent_id?.toLowerCase().includes(needle) ||
        p.stripe_session_id?.toLowerCase().includes(needle) ||
        p.user?.email?.toLowerCase().includes(needle) ||
        p.user?.full_name?.toLowerCase().includes(needle) ||
        p.dealer?.name?.toLowerCase().includes(needle)
      );
    });
  }, [payments, q]);

  const totals = useMemo(() => {
    const succeeded = filtered.filter((p) => p.status === "succeeded");
    const refunded = filtered.filter((p) => p.status === "refunded");
    const gross = succeeded.reduce((s, p) => s + p.amount_cents, 0);
    const refundedCents = refunded.reduce((s, p) => s + p.amount_cents, 0);
    return {
      count: filtered.length,
      gross,
      net: gross - refundedCents,
      refunded: refundedCents,
    };
  }, [filtered]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Payments</h1>

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Count" value={totals.count} />
        <Stat label="Gross" value={formatCents(totals.gross)} />
        <Stat label="Refunded" value={formatCents(totals.refunded)} />
        <Stat label="Net" value={formatCents(totals.net)} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by description, email, dealer, or Stripe ID"
            className="pl-9"
          />
        </div>
        <div className="w-48">
          <Select value={status ?? ANY} onValueChange={(v) => setStatus(v === ANY ? undefined : (v as PaymentStatus))}>
            <SelectTrigger><SelectValue placeholder="Any status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any status</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">When</th>
                <th className="px-4 py-3 text-right">Stripe</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border align-top">
                  <td className="px-4 py-3">
                    <div>{p.description ?? "—"}</div>
                    {p.dealer?.name && (
                      <div className="text-xs text-muted-foreground mt-0.5">dealer · {p.dealer.name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.user ? (
                      <>
                        <div>{p.user.full_name ?? "—"}</div>
                        <div className="text-xs font-mono text-muted-foreground">{p.user.email}</div>
                      </>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3"><Badge variant={VARIANT[p.status]}>{p.status}</Badge></td>
                  <td className="px-4 py-3 text-right font-mono">{formatCents(p.amount_cents)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{timeAgo(p.created_at)} ago</td>
                  <td className="px-4 py-3 text-right">
                    {p.stripe_payment_intent_id && (
                      <a
                        href={`https://dashboard.stripe.com/payments/${p.stripe_payment_intent_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No payments match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-2xl mt-1">{value}</div>
    </div>
  );
}
