import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { setMeta } from "@/lib/seo";
import { timeAgo } from "@/lib/utils";

interface AnyReq {
  id: string;
  full_name: string;
  email: string;
  status: string;
  created_at: string;
}

function useReqs(table: string) {
  return useQuery({
    queryKey: ["admin-req", table],
    queryFn: async (): Promise<AnyReq[]> => {
      const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return (data ?? []) as AnyReq[];
    },
  });
}

function ReqList({ rows }: { rows: AnyReq[] }) {
  if (!rows.length) return <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No requests.</div>;
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.id} className="flex items-center justify-between rounded border border-border bg-card px-4 py-3 text-sm">
          <div>
            <div>{r.full_name} · <span className="font-mono text-xs text-muted-foreground">{r.email}</span></div>
            <div className="text-xs text-muted-foreground mt-0.5">{timeAgo(r.created_at)} ago</div>
          </div>
          <Badge>{r.status}</Badge>
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
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Requests</h1>
      <Tabs defaultValue="con">
        <TabsList>
          <TabsTrigger value="con">Concierge</TabsTrigger>
          <TabsTrigger value="fin">Financing</TabsTrigger>
          <TabsTrigger value="ins">Insurance</TabsTrigger>
          <TabsTrigger value="insp">Inspections</TabsTrigger>
          <TabsTrigger value="trn">Transport</TabsTrigger>
          <TabsTrigger value="svc">Service</TabsTrigger>
        </TabsList>
        <TabsContent value="con"><ReqList rows={con.data ?? []} /></TabsContent>
        <TabsContent value="fin"><ReqList rows={fin.data ?? []} /></TabsContent>
        <TabsContent value="ins"><ReqList rows={ins.data ?? []} /></TabsContent>
        <TabsContent value="insp"><ReqList rows={insp.data ?? []} /></TabsContent>
        <TabsContent value="trn"><ReqList rows={trn.data ?? []} /></TabsContent>
        <TabsContent value="svc"><ReqList rows={svc.data ?? []} /></TabsContent>
      </Tabs>
    </div>
  );
}
