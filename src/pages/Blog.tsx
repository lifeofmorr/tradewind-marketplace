import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { setMeta } from "@/lib/seo";
import { BRAND } from "@/lib/brand";
import type { BlogPost } from "@/types/database";

export default function Blog() {
  useEffect(() => { setMeta({ title: "Blog", description: `Stories and how-tos from ${BRAND.name}.` }); }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async (): Promise<BlogPost[]> => {
      const { data, error } = await supabase
        .from("blog_posts").select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return (data ?? []) as BlogPost[];
    },
  });

  return (
    <div className="container-pad py-16 space-y-8">
      <header>
        <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">Blog</div>
        <h1 className="font-display text-4xl mt-1">Stories from the dock and the garage.</h1>
      </header>
      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.id}
              to={`/blog/${p.slug}`}
              className="group block rounded-lg border border-border bg-card overflow-hidden hover:border-brass-500/50"
            >
              <div className="aspect-[16/9] bg-secondary">
                {p.cover_image_url
                  ? <img src={p.cover_image_url} alt={p.title} className="h-full w-full object-cover" loading="lazy" />
                  : <div className="h-full w-full grid place-items-center text-xs font-mono text-muted-foreground">no cover</div>}
              </div>
              <div className="p-5 space-y-2">
                <div className="flex flex-wrap gap-1">
                  {p.tags?.slice(0, 3).map((t) => <Badge key={t}>{t}</Badge>)}
                </div>
                <h2 className="font-display text-xl leading-tight">{p.title}</h2>
                {p.excerpt && <p className="text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>}
                {p.published_at && (
                  <div className="text-xs font-mono text-muted-foreground">{new Date(p.published_at).toLocaleDateString()}</div>
                )}
              </div>
            </Link>
          ))}
          {!posts.length && (
            <div className="col-span-full rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              No posts yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
