import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { setMeta } from "@/lib/seo";
import { slugify, timeAgo } from "@/lib/utils";
import type { BlogPost } from "@/types/database";

export default function AdminBlog() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => { setMeta({ title: "Admin · blog", description: "CRUD for blog posts." }); }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async (): Promise<BlogPost[]> => {
      const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return (data ?? []) as BlogPost[];
    },
  });

  async function togglePublish(p: BlogPost) {
    const next = !p.is_published;
    await supabase.from("blog_posts").update({
      is_published: next,
      published_at: next && !p.published_at ? new Date().toISOString() : p.published_at,
    }).eq("id", p.id);
    void qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    void qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Blog</h1>
        <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New post</Button>
      </div>
      {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <div className="space-y-2">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded border border-border bg-card px-4 py-3 text-sm">
              <div className="min-w-0">
                <div className="font-display truncate">{p.title}</div>
                <div className="text-xs text-muted-foreground">/blog/{p.slug} · {timeAgo(p.created_at)} ago</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={p.is_published ? "good" : "default"}>{p.is_published ? "published" : "draft"}</Badge>
                <Button size="sm" variant="ghost" onClick={() => setEditing(p)}>Edit</Button>
                <Button size="sm" variant="outline" onClick={() => { void togglePublish(p); }}>
                  {p.is_published ? "Unpublish" : "Publish"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { void remove(p.id); }}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}
          {!posts.length && <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">No posts yet.</div>}
        </div>
      )}
      <PostDialog
        open={creating || !!editing}
        post={editing}
        onClose={() => { setCreating(false); setEditing(null); }}
        onSaved={() => void qc.invalidateQueries({ queryKey: ["admin-blog-posts"] })}
        authorId={user?.id}
      />
    </div>
  );
}

interface DialogProps {
  open: boolean;
  post: BlogPost | null;
  onClose: () => void;
  onSaved: () => void;
  authorId?: string;
}

function PostDialog({ open, post, onClose, onSaved, authorId }: DialogProps) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body_md ?? "");
  const [tags, setTags] = useState((post?.tags ?? []).join(", "));
  const [coverUrl, setCoverUrl] = useState(post?.cover_image_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Reset on open
  useEffect(() => {
    if (!open) return;
    setTitle(post?.title ?? "");
    setExcerpt(post?.excerpt ?? "");
    setBody(post?.body_md ?? "");
    setTags((post?.tags ?? []).join(", "));
    setCoverUrl(post?.cover_image_url ?? "");
    setError(null);
  }, [open, post]);

  async function save() {
    if (!title.trim() || !body.trim()) {
      setError("Title and body are required.");
      return;
    }
    setBusy(true);
    const tagArr = tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (post) {
      await supabase.from("blog_posts").update({
        title, excerpt: excerpt || null, body_md: body,
        cover_image_url: coverUrl || null, tags: tagArr,
      }).eq("id", post.id);
    } else {
      const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`;
      await supabase.from("blog_posts").insert({
        slug, title, excerpt: excerpt || null, body_md: body,
        cover_image_url: coverUrl || null, tags: tagArr, author_id: authorId ?? null,
      });
    }
    setBusy(false);
    onSaved();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>{post ? "Edit post" : "New post"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label>Excerpt</Label><Textarea rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} /></div>
          <div><Label>Cover image URL</Label><Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://" /></div>
          <div><Label>Tags (comma-separated)</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} /></div>
          <div><Label>Body (Markdown)</Label><Textarea rows={14} value={body} onChange={(e) => setBody(e.target.value)} className="font-mono text-xs" /></div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { void save(); }} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
