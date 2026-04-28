import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { setMeta } from "@/lib/seo";
import { formatNumber } from "@/lib/utils";

async function count(table: string, filter?: { col: string; eq: unknown }) {
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) q = q.eq(filter.col, filter.eq);
  const { count: c, error } = await q;
  if (error) throw error;
  return c ?? 0;
}

export default function AdminDashboard() {
  useEffect(() => { setMeta({ title: "Admin · overview", description: "Marketplace state at a glance." }); }, []);

  const { data: counts } = useQuery({
    queryKey: ["admin-counts"],
    queryFn: async () => {
      const [users, listings, pending, dealers, providers, openFraud, payments] = await Promise.all([
        count("profiles"),
        count("listings", { col: "status", eq: "active" }),
        count("listings", { col: "status", eq: "pending_review" }),
        count("dealers"),
        count("service_providers"),
        count("fraud_flags", { col: "resolved", eq: false }),
        count("payments", { col: "status", eq: "succeeded" }),
      ]);
      return { users, listings, pending, dealers, providers, openFraud, payments };
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">Admin</div>
        <h1 className="font-display text-3xl mt-1">Marketplace overview</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Users" value={formatNumber(counts?.users ?? 0)} />
        <Stat label="Active listings" value={formatNumber(counts?.listings ?? 0)} />
        <Stat label="Pending review" value={formatNumber(counts?.pending ?? 0)} />
        <Stat label="Dealers" value={formatNumber(counts?.dealers ?? 0)} />
        <Stat label="Service partners" value={formatNumber(counts?.providers ?? 0)} />
        <Stat label="Open fraud flags" value={formatNumber(counts?.openFraud ?? 0)} />
        <Stat label="Successful payments" value={formatNumber(counts?.payments ?? 0)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-3xl mt-1">{value}</div>
    </div>
  );
}
