import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PartnerMatchPanel } from "@/components/admin/PartnerMatchPanel";
import { setMeta } from "@/lib/seo";
import { timeAgo } from "@/lib/utils";
import type { MatchRequest } from "@/lib/partnerMatch";

interface AnyReq {
  id: string;
  full_name: string;
  email: string;
  status: string;
  state?: string | null;
  partner_id?: string | null;
  created_at: string;
}

interface IntegrationReq {
  id: string;
  user_id: string;
  integration_key: string;
  integration_name: string;
  category: string;
  status: string;
  notes: string | null;
  created_at: string;
  profile?: { email: string | null; full_name: string | null } | null;
}

type ReqTable =
  | "financing_requests" | "insurance_requests" | "inspection_requests"
  | "transport_requests" | "concierge_requests" | "service_requests";

type MatchableTable = Exclude<ReqTable, "concierge_requests">;

function useReqs(table: ReqTable) {
  return useQuery({
    queryKey: ["admin-req", table],
    queryFn: async (): Promise<AnyReq[]> => {
      const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return (data ?? []) as AnyReq[];
    },
  });
}

interface ReqListProps {
  rows: AnyReq[];
  table: MatchableTable;
  category: MatchRequest["category"];
}

function ReqList({ rows, table, category }: ReqListProps) {
  if (!rows.length) return <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No requests.</div>;
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="rounded border border-border bg-card px-4 py-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div>{r.full_name} · <span className="font-mono text-xs text-muted-foreground">{r.email}</span></div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {timeAgo(r.created_at)} ago{r.state ? ` · ${r.state}` : ""}
              </div>
            </div>
            <Badge>{r.status}</Badge>
          </div>
          <PartnerMatchPanel request={r} table={table} category={category} />
        </div>
      ))}
    </div>
  );
}

function ConciergeList({ rows }: { rows: AnyReq[] }) {
  if (!rows.length) return <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No requests.</div>;
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="rounded border border-border bg-card px-4 py-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div>{r.full_name} · <span className="font-mono text-xs text-muted-foreground">{r.email}</span></div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {timeAgo(r.created_at)} ago{r.state ? ` · ${r.state}` : ""}
              </div>
            </div>
            <Badge>{r.status}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function useIntegrationReqs() {
  return useQuery({
    queryKey: ["admin-req", "integration_requests"],
    queryFn: async (): Promise<IntegrationReq[]> => {
      const { data, error } = await supabase
        .from("integration_requests")
        .select("*, profile:profiles!integration_requests_user_id_fkey(email, full_name)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as unknown as IntegrationReq[];
    },
  });
}

function IntegrationList({ rows }: { rows: IntegrationReq[] }) {
  if (!rows.length) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No integration requests yet. Connect / Notify clicks on /integrations land here.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="rounded border border-border bg-card px-4 py-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div>{r.integration_name} <span className="text-xs text-muted-foreground">· {r.category}</span></div>
              <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                {r.profile?.full_name ?? "—"} · {r.profile?.email ?? "(no email)"} · {timeAgo(r.created_at)} ago
              </div>
              {r.notes && <div className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">{r.notes}</div>}
            </div>
            <Badge>{r.status}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminRequests() {
  useEffect(() => { setMeta({ title: "Admin · requests", description: "Partner request inboxes." }); }, []);
  const fin = useReqs("financing_requests");
  const ins = useReqs("insurance_requests");
  const insp = useReqs("inspection_requests");
  const trn = useReqs("transport_requests");
  const con = useReqs("concierge_requests");
  const svc = useReqs("service_requests");
  const integ = useIntegrationReqs();
  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow">Admin · requests</div>
        <h1 className="section-title">Partner request inboxes</h1>
        <p className="text-sm text-muted-foreground mt-2">Triage every concierge, financing, insurance, inspection, transport, and service request. Top partner matches are surfaced inline.</p>
      </div>
      <Tabs defaultValue="con">
        <TabsList>
          <TabsTrigger value="con">Concierge</TabsTrigger>
          <TabsTrigger value="fin">Financing</TabsTrigger>
          <TabsTrigger value="ins">Insurance</TabsTrigger>
          <TabsTrigger value="insp">Inspections</TabsTrigger>
          <TabsTrigger value="trn">Transport</TabsTrigger>
          <TabsTrigger value="svc">Service</TabsTrigger>
          <TabsTrigger value="integ">Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="con">
          <ConciergeList rows={con.data ?? []} />
        </TabsContent>
        <TabsContent value="integ">
          <IntegrationList rows={integ.data ?? []} />
        </TabsContent>
        <TabsContent value="fin">
          <ReqList rows={fin.data ?? []} table="financing_requests" category="financing" />
        </TabsContent>
        <TabsContent value="ins">
          <ReqList rows={ins.data ?? []} table="insurance_requests" category="insurance" />
        </TabsContent>
        <TabsContent value="insp">
          <ReqList rows={insp.data ?? []} table="inspection_requests" category="inspection" />
        </TabsContent>
        <TabsContent value="trn">
          <ReqList rows={trn.data ?? []} table="transport_requests" category="transport" />
        </TabsContent>
        <TabsContent value="svc">
          <ReqList rows={svc.data ?? []} table="service_requests" category="service" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
