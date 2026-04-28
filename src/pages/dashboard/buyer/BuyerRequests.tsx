import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { setMeta } from "@/lib/seo";
import { timeAgo } from "@/lib/utils";

interface AnyRequest {
  id: string;
  status: string;
  created_at: string;
  notes?: string | null;
}

function useUserRequests<T extends AnyRequest>(table: string, userId: string | undefined) {
  return useQuery({
    queryKey: [table, userId],
    enabled: !!userId,
    queryFn: async (): Promise<T[]> => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export default function BuyerRequests() {
  const { user } = useAuth();
  useEffect(() => { setMeta({ title: "My requests", description: "Concierge, financing, insurance, inspections, transport." }); }, []);

  const fin = useUserRequests<AnyRequest>("financing_requests", user?.id);
  const ins = useUserRequests<AnyRequest>("insurance_requests", user?.id);
  const insp = useUserRequests<AnyRequest>("inspection_requests", user?.id);
  const trn = useUserRequests<AnyRequest>("transport_requests", user?.id);
  const con = useUserRequests<AnyRequest>("concierge_requests", user?.id);
  const svc = useUserRequests<AnyRequest>("service_requests", user?.id);

  const groups: { title: string; rows: AnyRequest[]; eyebrow: string; ctaTo: string }[] = [
    { title: "Concierge",   eyebrow: "concierge",   rows: con.data ?? [],  ctaTo: "/concierge" },
    { title: "Financing",   eyebrow: "financing",   rows: fin.data ?? [],  ctaTo: "/financing" },
    { title: "Insurance",   eyebrow: "insurance",   rows: ins.data ?? [],  ctaTo: "/insurance" },
    { title: "Inspections", eyebrow: "inspection",  rows: insp.data ?? [], ctaTo: "/inspections" },
    { title: "Transport",   eyebrow: "transport",   rows: trn.data ?? [],  ctaTo: "/transport" },
    { title: "Service",     eyebrow: "service",     rows: svc.data ?? [],  ctaTo: "/services" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">My requests</h1>
      {groups.map((g) => (
        <section key={g.title}>
          <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400 mb-3">{g.eyebrow}</div>
          <h2 className="font-display text-xl mb-3">{g.title}</h2>
          {g.rows.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground flex items-center justify-between gap-3 flex-wrap">
              <span>No {g.title.toLowerCase()} requests yet.</span>
              <Link to={g.ctaTo} className="text-brass-400 text-xs font-mono uppercase tracking-wider">Start one →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {g.rows.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded border border-border bg-card px-4 py-3 text-sm">
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">#{r.id.slice(0, 8)}</div>
                    <div className="text-muted-foreground text-xs mt-0.5">{timeAgo(r.created_at)} ago</div>
                  </div>
                  <Badge>{r.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
