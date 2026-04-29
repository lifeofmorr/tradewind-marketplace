import { useEffect, useState } from "react";
import { Heart, MessageCircle, Share2, Anchor, TrendingUp, Lightbulb, Award, Sparkles, UserPlus, Check, Loader2 } from "lucide-react";
import { ReportButton } from "@/components/ui/ReportButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export type PostType =
  | "inventory_update"
  | "lifestyle"
  | "market_insight"
  | "dealer_spotlight"
  | "tip";

export type PostAuthorRole = "buyer" | "dealer" | "service_provider";

export interface CommunityPost {
  id: string;
  author: {
    id?: string;
    name: string;
    role: PostAuthorRole;
    avatarUrl?: string;
    handle: string;
  };
  postType: PostType;
  content: string;
  mediaUrl?: string;
  createdAtLabel: string;
  likes: number;
  comments: number;
  /** When true, the post is backed by a real database row and supports interaction. */
  isReal?: boolean;
  /** Whether the current viewer has liked this post. */
  likedByMe?: boolean;
}

interface CommentRow {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: { full_name: string | null } | null;
}

const POST_TYPE_META: Record<PostType, { label: string; icon: typeof Anchor; color: string }> = {
  inventory_update:  { label: "Inventory",      icon: Anchor,     color: "text-sky-300" },
  lifestyle:         { label: "Lifestyle",      icon: Sparkles,   color: "text-rose-300" },
  market_insight:    { label: "Market Insight", icon: TrendingUp, color: "text-cyan-300" },
  dealer_spotlight:  { label: "Spotlight",      icon: Award,      color: "text-brass-300" },
  tip:               { label: "Tip",            icon: Lightbulb,  color: "text-amber-300" },
};

const ROLE_LABEL: Record<PostAuthorRole, string> = {
  buyer: "Buyer",
  dealer: "Verified Dealer",
  service_provider: "Service Pro",
};

const ROLE_STYLE: Record<PostAuthorRole, string> = {
  buyer: "bg-slate-500/15 text-slate-200 ring-slate-400/20",
  dealer: "bg-brass-500/15 text-brass-300 ring-brass-400/20",
  service_provider: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20",
};

interface PostCardProps {
  post: CommunityPost;
  /** Toggle a like for a real post. Receives the next desired liked-state. Returns true on success. */
  onToggleLike?: (postId: string, nextLiked: boolean) => Promise<boolean>;
  /** Whether like interaction is allowed (e.g. user is authenticated and post is real). */
  canInteract?: boolean;
}

export function PostCard({ post, onToggleLike, canInteract = false }: PostCardProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(Boolean(post.likedByMe));
  const [delta, setDelta] = useState(0);
  const [pending, setPending] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentRow[] | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentDelta, setCommentDelta] = useState(0);
  const [following, setFollowing] = useState<boolean | null>(null);
  const [followBusy, setFollowBusy] = useState(false);

  const meta = POST_TYPE_META[post.postType];
  const Icon = meta.icon;
  const interactive = canInteract && Boolean(post.isReal) && Boolean(onToggleLike);
  const likes = Math.max(0, post.likes + delta);
  const commentCount = Math.max(0, post.comments + commentDelta);
  const canFollow = Boolean(user) && Boolean(post.isReal) && Boolean(post.author.id) && post.author.id !== user?.id;

  useEffect(() => {
    if (!canFollow || !user || !post.author.id) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("community_follows")
        .select("follower_id")
        .eq("follower_id", user.id)
        .eq("following_id", post.author.id!)
        .maybeSingle();
      if (!cancelled) setFollowing(Boolean(data));
    })();
    return () => { cancelled = true; };
  }, [canFollow, user, post.author.id]);

  async function loadComments() {
    if (!post.isReal) return;
    setCommentsLoading(true);
    const { data } = await supabase
      .from("community_comments")
      .select("id, user_id, content, created_at, profile:profiles!community_comments_user_id_fkey(full_name)")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    setComments((data ?? []) as unknown as CommentRow[]);
    setCommentsLoading(false);
  }

  async function toggleComments() {
    const next = !commentsOpen;
    setCommentsOpen(next);
    if (next && comments === null) await loadComments();
  }

  async function submitComment() {
    if (!user || !post.isReal) return;
    const body = commentDraft.trim();
    if (!body) return;
    setCommentBusy(true);
    const { data, error } = await supabase
      .from("community_comments")
      .insert({ post_id: post.id, user_id: user.id, content: body })
      .select("id, user_id, content, created_at, profile:profiles!community_comments_user_id_fkey(full_name)")
      .single();
    setCommentBusy(false);
    if (error || !data) return;
    setComments((prev) => [...(prev ?? []), data as unknown as CommentRow]);
    setCommentDelta((d) => d + 1);
    setCommentDraft("");
  }

  async function toggleFollow() {
    if (!canFollow || !user || !post.author.id || followBusy) return;
    setFollowBusy(true);
    if (following) {
      const { error } = await supabase
        .from("community_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", post.author.id);
      if (!error) setFollowing(false);
    } else {
      const { error } = await supabase
        .from("community_follows")
        .insert({ follower_id: user.id, following_id: post.author.id });
      if (!error || error.code === "23505") setFollowing(true);
    }
    setFollowBusy(false);
  }

  const initials = post.author.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleLike() {
    if (!interactive || pending) return;
    const next = !liked;
    setPending(true);
    setLiked(next);
    setDelta((d) => d + (next ? 1 : -1));
    const ok = await onToggleLike!(post.id, next);
    if (!ok) {
      setLiked(!next);
      setDelta((d) => d + (next ? -1 : 1));
    }
    setPending(false);
  }

  return (
    <article className="glass-card lift-card overflow-hidden">
      <header className="flex items-center gap-3 p-4">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brass-500/30 to-brass-700/10 border border-white/10 grid place-items-center font-display text-sm">
          {post.author.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt={post.author.name}
              className="h-full w-full rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-sm">{post.author.name}</span>
            <span
              className={cn("chip ring-1 ring-inset", ROLE_STYLE[post.author.role])}
            >
              {ROLE_LABEL[post.author.role]}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            @{post.author.handle} · {post.createdAtLabel}
          </div>
        </div>
        {canFollow && (
          <button
            type="button"
            onClick={() => { void toggleFollow(); }}
            disabled={followBusy || following === null}
            className={cn(
              "chip ring-1 ring-inset transition-colors",
              following
                ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20"
                : "bg-secondary text-muted-foreground ring-border hover:text-foreground",
            )}
            title={following ? "Unfollow" : "Follow"}
          >
            {following ? <><Check className="h-3 w-3" /> Following</> : <><UserPlus className="h-3 w-3" /> Follow</>}
          </button>
        )}
        <div className={cn("inline-flex items-center gap-1 text-xs font-mono uppercase tracking-[0.18em]", meta.color)}>
          <Icon className="h-3.5 w-3.5" />
          {meta.label}
        </div>
      </header>

      <div className="px-4 pb-3">
        <p className="text-sm whitespace-pre-line">{post.content}</p>
      </div>

      {post.mediaUrl && (
        <div className="aspect-[16/9] bg-secondary overflow-hidden">
          <img
            src={post.mediaUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <footer className="flex items-center gap-1 px-2 py-2 border-t border-white/5">
        <button
          type="button"
          onClick={handleLike}
          disabled={!interactive || pending}
          aria-pressed={liked}
          title={interactive ? undefined : post.isReal ? "Sign in to like posts" : "Sample content"}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-mono uppercase tracking-[0.18em] transition-colors",
            liked ? "text-brass-300" : "text-muted-foreground",
            interactive && "hover:text-foreground",
            !interactive && "cursor-default",
          )}
        >
          <Heart className={cn("h-4 w-4", liked && "fill-brass-500 text-brass-500")} />
          {likes}
        </button>
        <button
          type="button"
          onClick={() => { void toggleComments(); }}
          disabled={!post.isReal}
          title={post.isReal ? undefined : "Sample content"}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-mono uppercase tracking-[0.18em] transition-colors",
            commentsOpen ? "text-foreground" : "text-muted-foreground",
            post.isReal && "hover:text-foreground",
            !post.isReal && "cursor-default",
          )}
        >
          <MessageCircle className="h-4 w-4" />
          {commentCount}
        </button>
        <button
          type="button"
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
        {post.isReal && (
          <ReportButton
            targetType="post"
            targetId={post.id}
            variant="icon"
            className="ml-1"
          />
        )}
      </footer>

      {commentsOpen && post.isReal && (
        <div className="border-t border-white/5 px-4 py-3 space-y-3">
          {commentsLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading…
            </div>
          ) : (
            (comments ?? []).map((c) => (
              <div key={c.id} className="text-sm">
                <span className="font-display text-xs">{c.profile?.full_name ?? "Member"}</span>
                <span className="ml-2 text-muted-foreground">{c.content}</span>
              </div>
            ))
          )}
          {!commentsLoading && (comments ?? []).length === 0 && (
            <p className="text-xs text-muted-foreground">No comments yet — be first.</p>
          )}
          {user ? (
            <form
              onSubmit={(e) => { e.preventDefault(); void submitComment(); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                placeholder="Add a comment…"
                maxLength={500}
                className="flex-1 h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brass-400/50"
                disabled={commentBusy}
              />
              <button
                type="submit"
                disabled={commentBusy || !commentDraft.trim()}
                className="h-9 px-3 rounded-md bg-brass-500 text-navy-950 text-xs font-display disabled:opacity-50"
              >
                {commentBusy ? "…" : "Post"}
              </button>
            </form>
          ) : (
            <p className="text-xs text-muted-foreground">Sign in to comment.</p>
          )}
        </div>
      )}
    </article>
  );
}
