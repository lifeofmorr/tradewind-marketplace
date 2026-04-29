import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Users2, FlaskConical, LogIn } from "lucide-react";
import { setMeta } from "@/lib/seo";
import { BRAND } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { PostCard, type CommunityPost, type PostAuthorRole, type PostType } from "@/components/social/PostCard";
import { PostComposer } from "@/components/social/PostComposer";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/types/database";

const FILTERS: Array<{ value: "all" | PostType; label: string }> = [
  { value: "all",               label: "Everything" },
  { value: "inventory_update",  label: "Inventory" },
  { value: "lifestyle",         label: "Lifestyle" },
  { value: "market_insight",    label: "Market Insights" },
  { value: "dealer_spotlight",  label: "Dealer Spotlights" },
  { value: "tip",               label: "Tips" },
];

const DEMO_POSTS: CommunityPost[] = [
  {
    id: "demo-p1",
    author: { name: "Atlantic Marine Group", role: "dealer", handle: "atlantic_marine", avatarUrl: undefined },
    postType: "inventory_update",
    content:
      "Just took in a 2022 Boston Whaler 380 Outrage — twin Mercury 400s, full Garmin electronics, immaculate. DM for a private walkthrough this weekend in Newport.",
    mediaUrl: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=70",
    createdAtLabel: "2h ago",
    likes: 42,
    comments: 6,
  },
  {
    id: "demo-p2",
    author: { name: "Mara Chen", role: "buyer", handle: "mara_at_sea" },
    postType: "lifestyle",
    content:
      "First overnight on the new sailboat. Anchored in Cuttyhunk, sundowners on the bow. The TradeWind concierge made this whole purchase a non-event — strongest endorsement I can give.",
    mediaUrl: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=70",
    createdAtLabel: "5h ago",
    likes: 128,
    comments: 14,
  },
  {
    id: "demo-p3",
    author: { name: "Northstar Surveyors", role: "service_provider", handle: "northstar_marine" },
    postType: "tip",
    content:
      "PSA for buyers: always check the engine hour-meter against fuel-burn records. We caught a discrepancy this week that knocked $40k off a deal. Independent inspection pays for itself, every time.",
    createdAtLabel: "8h ago",
    likes: 76,
    comments: 9,
  },
  {
    id: "demo-p4",
    author: { name: "TradeWind Market Desk", role: "service_provider", handle: "market_pulse" },
    postType: "market_insight",
    content:
      "Center-console pricing flattened in March after 14 months of compression. Sub-30ft inventory turning in 38 days median; 30-40ft holding at 64. Full report drops Monday.",
    createdAtLabel: "1d ago",
    likes: 91,
    comments: 11,
  },
  {
    id: "demo-p5",
    author: { name: "Coastal Auto Imports", role: "dealer", handle: "coastal_auto" },
    postType: "dealer_spotlight",
    content:
      "Crossed our 200th TradeWind delivery this week. Shoutout to the buyer team — every deal closed with zero off-platform funny business. This is how marketplaces should work.",
    mediaUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=70",
    createdAtLabel: "2d ago",
    likes: 203,
    comments: 28,
  },
  {
    id: "demo-p6",
    author: { name: "Jordan Vasquez", role: "buyer", handle: "jvasquez" },
    postType: "tip",
    content:
      "Three cars in, my unsolicited advice: use the Compare tool. Side-by-side cost-to-own numbers killed two listings I would've otherwise paid too much for.",
    createdAtLabel: "3d ago",
    likes: 54,
    comments: 5,
  },
];

const DAY = 24 * 60 * 60 * 1000;

function relativeLabel(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0 || ms < 60_000) return "just now";
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(ms / (60 * 60_000));
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(ms / DAY);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function mapProfileRole(role: UserRole | null | undefined): PostAuthorRole {
  if (role === "dealer" || role === "dealer_staff") return "dealer";
  if (role === "service_provider") return "service_provider";
  return "buyer";
}

interface RealPostRow {
  id: string;
  user_id: string;
  content: string;
  post_type: PostType;
  media_urls: string[] | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    role: UserRole;
  } | null;
}

function rowToPost(row: RealPostRow, likedIds: Set<string>): CommunityPost {
  const fullName = row.profile?.full_name ?? "TradeWind member";
  const handle = (fullName || "member").toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 20) || "member";
  return {
    id: row.id,
    author: {
      id: row.user_id,
      name: fullName,
      role: mapProfileRole(row.profile?.role),
      handle,
      avatarUrl: row.profile?.avatar_url ?? undefined,
    },
    postType: row.post_type,
    content: row.content,
    mediaUrl: row.media_urls?.[0],
    createdAtLabel: relativeLabel(row.created_at),
    likes: row.likes_count,
    comments: row.comments_count,
    isReal: true,
    likedByMe: likedIds.has(row.id),
  };
}

export default function Community() {
  useEffect(() => {
    setMeta({
      title: "Community",
      description: `${BRAND.name} community — buyer, dealer, and service-pro insights.`,
    });
  }, []);

  const { user, profile } = useAuth();
  const [filter, setFilter] = useState<"all" | PostType>("all");
  const [realPosts, setRealPosts] = useState<CommunityPost[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    const { data, error: postsErr } = await supabase
      .from("community_posts")
      .select("id, user_id, content, post_type, media_urls, likes_count, comments_count, created_at, profile:profiles!community_posts_user_id_fkey(full_name, avatar_url, role)")
      .eq("hidden", false)
      .order("created_at", { ascending: false })
      .limit(50);
    if (postsErr) {
      console.warn("[community] posts load failed:", postsErr.message);
      return;
    }
    const rows = (data ?? []) as unknown as RealPostRow[];

    let likedIds = new Set<string>();
    if (user && rows.length > 0) {
      const { data: likeRows } = await supabase
        .from("community_likes")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", rows.map((r) => r.id));
      likedIds = new Set((likeRows ?? []).map((r) => r.post_id as string));
    }

    setRealPosts(rows.map((r) => rowToPost(r, likedIds)));
  }, [user]);

  useEffect(() => { void loadPosts(); }, [loadPosts]);

  const submitPost = useCallback(async ({ content, postType }: { content: string; postType: PostType }) => {
    if (!user) return;
    setBusy(true);
    setError(null);
    const { data, error: insertErr } = await supabase
      .from("community_posts")
      .insert({ user_id: user.id, content, post_type: postType })
      .select("id, user_id, content, post_type, media_urls, likes_count, comments_count, created_at")
      .single();
    setBusy(false);
    if (insertErr || !data) {
      setError(insertErr?.message ?? "Could not post");
      return;
    }
    const optimistic: CommunityPost = {
      id: data.id as string,
      author: {
        id: user.id,
        name: profile?.full_name ?? "You",
        role: mapProfileRole(profile?.role),
        handle: (profile?.full_name ?? "you").toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 20) || "you",
        avatarUrl: profile?.avatar_url ?? undefined,
      },
      postType: data.post_type as PostType,
      content: data.content as string,
      mediaUrl: (data.media_urls as string[] | null)?.[0],
      createdAtLabel: relativeLabel(data.created_at as string),
      likes: 0,
      comments: 0,
      isReal: true,
      likedByMe: false,
    };
    setRealPosts((prev) => [optimistic, ...prev]);
  }, [user, profile]);

  const toggleLike = useCallback(async (postId: string, nextLiked: boolean): Promise<boolean> => {
    if (!user) return false;
    if (nextLiked) {
      const { error: e } = await supabase
        .from("community_likes")
        .insert({ post_id: postId, user_id: user.id });
      // Unique-violation = already liked, treat as success.
      if (e && e.code !== "23505") {
        console.warn("[community] like failed:", e.message);
        return false;
      }
      setRealPosts((prev) => prev.map((p) =>
        p.id === postId ? { ...p, likes: p.likes + 1, likedByMe: true } : p,
      ));
      return true;
    } else {
      const { error: e } = await supabase
        .from("community_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
      if (e) {
        console.warn("[community] unlike failed:", e.message);
        return false;
      }
      setRealPosts((prev) => prev.map((p) =>
        p.id === postId ? { ...p, likes: Math.max(0, p.likes - 1), likedByMe: false } : p,
      ));
      return true;
    }
  }, [user]);

  const visible = useMemo(() => {
    const all = [...realPosts, ...DEMO_POSTS];
    if (filter === "all") return all;
    return all.filter((p) => p.postType === filter);
  }, [filter, realPosts]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border hero-glow">
        <div className="container-pad py-14">
          <div className="inline-flex items-center gap-2 text-brass-400 mb-3">
            <Users2 className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-[0.32em]">Community</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            Where the marketplace
            <br />
            <span className="text-brass-gradient">talks shop.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Inventory drops, sea-trial stories, market reads, and the occasional cautionary tale —
            from the buyers, dealers, and service pros on {BRAND.name}.
          </p>
        </div>
      </section>

      <section className="container-pad py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            {user ? (
              <>
                <PostComposer onPost={submitPost} busy={busy} />
                {error && (
                  <div className="rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-200 p-3 text-sm">
                    {error}
                  </div>
                )}
              </>
            ) : (
              <div className="glass-card p-5 flex items-start gap-3">
                <LogIn className="h-5 w-5 text-brass-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-display text-base">Sign in to post</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Join the conversation — share inventory drops, market takes, and lessons learned.
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link to={`/login?redirect=${encodeURIComponent("/community")}`}>Sign in</Link>
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-[0.18em] border transition-colors",
                    filter === f.value
                      ? "border-brass-500/60 bg-brass-500/10 text-brass-300"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-brass-500/40",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {visible.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onToggleLike={toggleLike}
                  canInteract={Boolean(user)}
                />
              ))}
              {visible.length === 0 && (
                <div className="glass-card p-8 text-center text-sm text-muted-foreground">
                  No posts in this category yet.
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="glass-card p-4">
              <div className="flex items-start gap-2">
                <FlaskConical className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-display text-sm">Demo activity</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sample posts are mixed into the feed during the private beta. Real posts from
                    signed-in members appear at the top and support likes.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="font-display text-sm">Trending categories</div>
              <ul className="mt-2 text-xs text-muted-foreground space-y-1.5">
                <li>· Center consoles, 30-40ft</li>
                <li>· Pre-owned EV pickups</li>
                <li>· Sea-trial checklists</li>
                <li>· F&I refinance tactics</li>
              </ul>
            </div>

            <div className="glass-card p-4">
              <div className="font-display text-sm">Community guidelines</div>
              <p className="text-xs text-muted-foreground mt-2">
                Be useful, be honest, no off-platform funny business. Selling something?
                Use a real listing — we keep the feed promo-light on purpose.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
