import { useEffect, useMemo, useState } from "react";
import { Users2, FlaskConical } from "lucide-react";
import { setMeta } from "@/lib/seo";
import { BRAND } from "@/lib/brand";
import { PostCard, type CommunityPost, type PostType } from "@/components/social/PostCard";
import { PostComposer } from "@/components/social/PostComposer";
import { cn } from "@/lib/utils";

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
    id: "p1",
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
    id: "p2",
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
    id: "p3",
    author: { name: "Northstar Surveyors", role: "service_provider", handle: "northstar_marine" },
    postType: "tip",
    content:
      "PSA for buyers: always check the engine hour-meter against fuel-burn records. We caught a discrepancy this week that knocked $40k off a deal. Independent inspection pays for itself, every time.",
    createdAtLabel: "8h ago",
    likes: 76,
    comments: 9,
  },
  {
    id: "p4",
    author: { name: "TradeWind Market Desk", role: "service_provider", handle: "market_pulse" },
    postType: "market_insight",
    content:
      "Center-console pricing flattened in March after 14 months of compression. Sub-30ft inventory turning in 38 days median; 30-40ft holding at 64. Full report drops Monday.",
    createdAtLabel: "1d ago",
    likes: 91,
    comments: 11,
  },
  {
    id: "p5",
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
    id: "p6",
    author: { name: "Jordan Vasquez", role: "buyer", handle: "jvasquez" },
    postType: "tip",
    content:
      "Three cars in, my unsolicited advice: use the Compare tool. Side-by-side cost-to-own numbers killed two listings I would've otherwise paid too much for.",
    createdAtLabel: "3d ago",
    likes: 54,
    comments: 5,
  },
];

export default function Community() {
  useEffect(() => {
    setMeta({
      title: "Community",
      description: `${BRAND.name} community — buyer, dealer, and service-pro insights.`,
    });
  }, []);

  const [filter, setFilter] = useState<"all" | PostType>("all");
  const [extraPosts, setExtraPosts] = useState<CommunityPost[]>([]);

  const visible = useMemo(() => {
    const all = [...extraPosts, ...DEMO_POSTS];
    if (filter === "all") return all;
    return all.filter((p) => p.postType === filter);
  }, [filter, extraPosts]);

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
            <PostComposer
              onPost={({ content, postType }) =>
                setExtraPosts((prev) => [
                  {
                    id: `local-${Date.now()}`,
                    author: { name: "You", role: "buyer", handle: "you" },
                    postType,
                    content,
                    createdAtLabel: "just now",
                    likes: 0,
                    comments: 0,
                  },
                  ...prev,
                ])
              }
            />

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
                <PostCard key={post.id} post={post} />
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
                    Posts shown here are sample content during the private beta.
                    The community feed switches to real activity once writes open up.
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
