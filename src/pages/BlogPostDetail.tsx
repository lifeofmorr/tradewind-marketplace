import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { setMeta } from "@/lib/seo";
import { mdToHtml } from "@/lib/markdown";
import type { BlogPost, Profile } from "@/types/database";

interface PostWithAuthor extends BlogPost {
  author: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
}

export default function BlogPostDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    enabled: !!slug,
    queryFn: async (): Promise<PostWithAuthor | null> => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*, author:profiles!blog_posts_author_id_fkey(id, full_name, avatar_url)")
        .eq("slug", slug ?? "")
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return (data as PostWithAuthor | null) ?? null;
    },
  });

  const { data: related = [] } = useQuery({
    queryKey: ["blog-related", post?.id],
    enabled: !!post,
    queryFn: async (): Promise<BlogPost[]> => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .neq("id", post!.id)
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return (data ?? []) as BlogPost[];
    },
  });

  useEffect(() => {
    if (!post) return;
    setMeta({
      title: post.title,
      description: post.excerpt ?? post.title,
      ogImage: post.cover_image_url ?? undefined,
      ogType: "article",
    });
  }, [post]);

  if (isLoading) return <div className="container-pad py-16 text-sm text-muted-foreground">Loading…</div>;
  if (!post) return <div className="container-pad py-16"><h1 className="font-display text-3xl">Post not found</h1></div>;

  return (
    <article className="container-pad py-12 max-w-3xl space-y-6">
      <Link to="/blog" className="text-xs text-muted-foreground hover:text-foreground">← All posts</Link>
      {post.cover_image_url && (
        <div className="aspect-[16/8] rounded-lg overflow-hidden bg-secondary">
          <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" />
        </div>
      )}
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="accent">Blog</Badge>
          {post.category && <span className="text-xs font-mono uppercase tracking-wider text-brass-400">{post.category}</span>}
        </div>
        <h1 className="font-display text-4xl leading-tight">{post.title}</h1>
        {post.excerpt && <p className="text-muted-foreground">{post.excerpt}</p>}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {post.author && <span>by {post.author.full_name ?? "TradeWind"}</span>}
          {post.published_at && <span>· {new Date(post.published_at).toLocaleDateString()}</span>}
        </div>
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {post.tags.map((t) => <Badge key={t}>{t}</Badge>)}
          </div>
        )}
      </header>
      <div
        className="text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: mdToHtml(post.body_md) }}
      />
      {related.length > 0 && (
        <section className="border-t border-border pt-8">
          <h2 className="font-display text-2xl mb-4">More from the blog</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} to={`/blog/${r.slug}`} className="block rounded-lg border border-border bg-card p-4 hover:border-brass-500/50">
                <div className="font-display text-base">{r.title}</div>
                {r.excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.excerpt}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
