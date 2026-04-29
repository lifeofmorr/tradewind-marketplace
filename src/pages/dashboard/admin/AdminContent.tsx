import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, BarChart3, Users2, EyeOff, Eye, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { logAuditEvent } from "@/lib/audit";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { setMeta } from "@/lib/seo";
import { timeAgo } from "@/lib/utils";
import type { BlogPost, MarketReport } from "@/types/database";

interface CommunityPostRow {
  id: string;
  user_id: string;
  content: string;
  post_type: string;
  hidden: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profile?: { full_name: string | null; email: string | null } | null;
}

export default function AdminContent() {
  const qc = useQueryClient();
  const { user } = useAuth();
  useEffect(() => { setMeta({ title: "Admin · content", description: "Blog posts, market reports, and community moderation." }); }, []);
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

  const communityPosts = useQuery({
    queryKey: ["admin-community-posts"],
    queryFn: async (): Promise<CommunityPostRow[]> => {
      const { data, error } = await supabase
        .from("community_posts")
        .select("id, user_id, content, post_type, hidden, likes_count, comments_count, created_at, profile:profiles!community_posts_user_id_fkey(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as unknown as CommunityPostRow[];
    },
  });

  async function toggleHide(post: CommunityPostRow) {
    const next = !post.hidden;
    await supabase.from("community_posts").update({ hidden: next }).eq("id", post.id);
    await logAuditEvent({
      actorId: user?.id ?? null,
      action: next ? "community_post.hide" : "community_post.unhide",
      targetType: "community_post",
      targetId: post.id,
    });
    void qc.invalidateQueries({ queryKey: ["admin-community-posts"] });
  }

  async function deletePost(post: CommunityPostRow) {
    if (!confirm("Delete this post permanently? Comments and likes are removed too.")) return;
    await supabase.from("community_posts").delete().eq("id", post.id);
    await logAuditEvent({
      actorId: user?.id ?? null,
      action: "community_post.delete",
      targetType: "community_post",
      targetId: post.id,
      metadata: { content: post.content.slice(0, 200) },
    });
    void qc.invalidateQueries({ queryKey: ["admin-community-posts"] });
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow">Admin · content</div>
        <h1 className="section-title">Content management</h1>
        <p className="text-sm text-muted-foreground mt-2">Blog posts and market reports drive organic traffic — keep them fresh.</p>
      </div>
      <Tabs defaultValue="blog">
        <TabsList>
          <TabsTrigger value="blog">Blog posts</TabsTrigger>
          <TabsTrigger value="reports">Market reports</TabsTrigger>
          <TabsTrigger value="community">Community feed</TabsTrigger>
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
        <TabsContent value="community">
          <div className="space-y-2">
            {(communityPosts.data ?? []).map((p) => (
              <div
                key={p.id}
                className={`rounded border ${p.hidden ? "border-rose-500/40 bg-rose-500/5" : "border-border bg-card"} p-4 text-sm`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display">{p.profile?.full_name ?? "Member"}</span>
                      <span className="text-xs font-mono text-muted-foreground">{p.profile?.email ?? ""}</span>
                      <Badge>{p.post_type}</Badge>
                      {p.hidden && <Badge variant="bad">hidden</Badge>}
                      <span className="text-xs text-muted-foreground ml-auto">{timeAgo(p.created_at)} ago</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{p.content}</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      ♥ {p.likes_count} · 💬 {p.comments_count}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => { void toggleHide(p); }}>
                      {p.hidden ? <><Eye className="h-3 w-3 mr-1" /> Unhide</> : <><EyeOff className="h-3 w-3 mr-1" /> Hide</>}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => { void deletePost(p); }}>
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {!communityPosts.data?.length && (
              <EmptyState
                icon={Users2}
                title="No community posts yet"
                body="Posts from /community land here. Use Hide to soft-remove a post; Delete is permanent."
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
