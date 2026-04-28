import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, BarChart3 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { setMeta } from "@/lib/seo";
import { timeAgo } from "@/lib/utils";
import type { BlogPost, MarketReport } from "@/types/database";

export default function AdminContent() {
  useEffect(() => { setMeta({ title: "Admin · content", description: "Blog posts and market reports." }); }, []);
  const posts = useQuery({
    queryKey: ["admin-blog"],
    queryFn: async (): Promise<BlogPost[]> => {
      const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return (data ?? []) as BlogPost[];
    },
  });
  const reports = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async (): Promise<MarketReport[]> => {
      const { data, error } = await supabase.from("market_reports").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return (data ?? []) as MarketReport[];
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Content</h1>
      <Tabs defaultValue="blog">
        <TabsList>
          <TabsTrigger value="blog">Blog posts</TabsTrigger>
          <TabsTrigger value="reports">Market reports</TabsTrigger>
        </TabsList>
        <TabsContent value="blog">
          <div className="space-y-2">
            {(posts.data ?? []).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded border border-border bg-card px-4 py-3 text-sm">
                <div>
                  <div className="font-display">{p.title}</div>
                  <div className="text-xs text-muted-foreground">/blog/{p.slug} · {timeAgo(p.created_at)} ago</div>
                </div>
                <Badge variant={p.is_published ? "good" : "default"}>{p.is_published ? "published" : "draft"}</Badge>
              </div>
            ))}
            {!posts.data?.length && (
              <EmptyState
                icon={FileText}
                title="No blog posts yet"
                body="Publish guides, model spotlights, and SEO-friendly category essays to drive organic traffic."
                cta={{ label: "Open blog editor", to: "/admin/blog" }}
              />
            )}
          </div>
        </TabsContent>
        <TabsContent value="reports">
          <div className="space-y-2">
            {(reports.data ?? []).map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded border border-border bg-card px-4 py-3 text-sm">
                <div>
                  <div className="font-display">{r.title}</div>
                  <div className="text-xs text-muted-foreground">/market-reports/{r.slug} · {timeAgo(r.created_at)} ago</div>
                </div>
                <Badge variant={r.is_published ? "good" : "default"}>{r.is_published ? "published" : "draft"}</Badge>
              </div>
            ))}
            {!reports.data?.length && (
              <EmptyState
                icon={BarChart3}
                title="No market reports yet"
                body="Quarterly pricing reports build buyer trust and earn high-intent backlinks."
                cta={{ label: "Open report editor", to: "/admin/market-reports" }}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
