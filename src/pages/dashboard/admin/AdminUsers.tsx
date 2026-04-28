import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { setMeta } from "@/lib/seo";
import { timeAgo } from "@/lib/utils";
import type { Profile } from "@/types/database";

export default function AdminUsers() {
  const qc = useQueryClient();
  useEffect(() => { setMeta({ title: "Admin · users", description: "Search and moderate users." }); }, []);
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });

  async function setBan(id: string, banned: boolean) {
    await supabase.from("profiles").update({ banned }).eq("id", id);
    void qc.invalidateQueries({ queryKey: ["admin-users"] });
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow">Admin · users</div>
        <h1 className="section-title">User management</h1>
      </div>
      {isLoading ? (
        <div className="rounded-lg border border-border overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 skeleton border-b border-border last:border-0" />
          ))}
        </div>
      ) : !users.length ? (
        <EmptyState
          icon={Users}
          title="No users yet"
          body="Users appear here as they sign up. Use this view to ban bad actors and monitor role distribution."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-4 py-3">{u.full_name ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-3"><Badge variant={u.role === "admin" ? "accent" : "default"}>{u.role}</Badge>{u.banned && <Badge variant="bad" className="ml-2">banned</Badge>}</td>
                  <td className="px-4 py-3 text-muted-foreground">{timeAgo(u.created_at)} ago</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant={u.banned ? "outline" : "destructive"} onClick={() => { void setBan(u.id, !u.banned); }}>
                      {u.banned ? "Unban" : "Ban"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
