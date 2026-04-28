import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Sparkles, ShieldCheck, Wrench, Anchor, Car as CarIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { useListings } from "@/hooks/useListings";
import { CATEGORIES } from "@/lib/categories";
import { BRAND } from "@/lib/brand";
import { setMeta } from "@/lib/seo";

function HeroSearch() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    navigate(`/browse${params.toString() ? `?${params}` : ""}`);
  }
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-navy-950 to-background">
      <div className="container-pad py-24 lg:py-32 text-center">
        <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">{BRAND.name} marketplace</div>
        <h1 className="mt-4 font-display text-5xl md:text-7xl leading-[1.05]">
          Boats. Autos. <span className="text-brass-400">Serious buyers.</span>
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-muted-foreground">
          {BRAND.tagline}
        </p>
        <form onSubmit={onSubmit} className="mt-8 max-w-2xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try 'Boston Whaler 320' or 'Porsche 911 GT3'"
              className="pl-9 h-12 text-base"
            />
          </div>
          <Button size="lg" type="submit">Search</Button>
        </form>
      </div>
    </section>
  );
}

function FeaturedListings() {
  const { data: listings = [], isLoading } = useListings({
    is_featured: true,
    status: "active",
    limit: 8,
    order: "newest",
  });
  return (
    <section className="container-pad py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">Featured</div>
          <h2 className="font-display text-3xl mt-1">Hand-picked listings</h2>
        </div>
        <Button asChild variant="link"><Link to="/browse">Browse all <ArrowRight className="h-4 w-4" /></Link></Button>
      </div>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <ListingGrid listings={listings} emptyText="No featured listings yet — check back soon." />
      )}
    </section>
  );
}

function CategoryGrid() {
  return (
    <section className="container-pad py-16 border-t border-border">
      <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">Categories</div>
      <h2 className="font-display text-3xl mt-1 mb-8">Find your next one</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {CATEGORIES.map((c) => (
          <Link
            key={c.key}
            to={`/categories/${c.key}`}
            className="group rounded-lg border border-border bg-card p-5 hover:border-brass-500/50 transition-colors"
          >
            <div className="flex items-center gap-2 text-brass-400">
              {c.group === "boat" ? <Anchor className="h-4 w-4" /> : <CarIcon className="h-4 w-4" />}
              <span className="font-mono text-xs uppercase tracking-wider">{c.group}</span>
            </div>
            <div className="font-display text-xl mt-2">{c.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.blurb}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function AIAssistantBanner() {
  return (
    <section className="container-pad py-16">
      <div className="rounded-2xl border border-brass-500/30 bg-gradient-to-r from-navy-950 to-navy-800 p-10 grid md:grid-cols-[1.4fr_1fr] items-center gap-8">
        <div>
          <div className="flex items-center gap-2 text-brass-400">
            <Sparkles className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-[0.32em]">AI Concierge</span>
          </div>
          <h2 className="font-display text-3xl mt-2">Tell us what you're after.</h2>
          <p className="text-muted-foreground mt-3 max-w-lg">
            Describe your dream boat or car. Our AI concierge narrows your search, surfaces comps,
            and lines up inspections, financing, and transport — end-to-end.
          </p>
        </div>
        <div className="flex md:justify-end">
          <Button asChild size="lg"><Link to="/concierge">Start with concierge</Link></Button>
        </div>
      </div>
    </section>
  );
}

function ServicesGrid() {
  const services = [
    { to: "/financing",   label: "Financing",   blurb: "Marine + auto loans" },
    { to: "/insurance",   label: "Insurance",   blurb: "Quote in minutes" },
    { to: "/inspections", label: "Inspections", blurb: "Surveyors & PPI" },
    { to: "/transport",   label: "Transport",   blurb: "Door-to-door, coast-to-coast" },
  ];
  return (
    <section className="container-pad py-16 border-t border-border">
      <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">Done-for-you</div>
      <h2 className="font-display text-3xl mt-1 mb-8">Services that close the deal</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="rounded-lg border border-border bg-card p-5 hover:border-brass-500/50 transition-colors"
          >
            <Wrench className="h-4 w-4 text-brass-400" />
            <div className="font-display text-xl mt-2">{s.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.blurb}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TrustSection() {
  const items = [
    { title: "Verified sellers", body: "Background-checked private sellers, vetted dealers, and licensed service partners." },
    { title: "Fraud guard AI",   body: "Every inquiry is screened for bad-faith signals before it hits a seller's inbox." },
    { title: "Transparent comps", body: "AI-powered pricing context so you see what fair looks like — boat or car." },
  ];
  return (
    <section className="container-pad py-16 border-t border-border">
      <div className="grid gap-8 md:grid-cols-3">
        {items.map((it) => (
          <div key={it.title}>
            <div className="flex items-center gap-2 text-brass-400">
              <ShieldCheck className="h-4 w-4" />
              <span className="font-mono text-xs uppercase tracking-wider">Trust</span>
            </div>
            <div className="font-display text-2xl mt-2">{it.title}</div>
            <p className="text-muted-foreground text-sm mt-2">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DealerCTA() {
  return (
    <section className="container-pad py-20 border-t border-border text-center">
      <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">For dealers & service pros</div>
      <h2 className="font-display text-4xl mt-2">Run your inventory like it's 2026.</h2>
      <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
        Bulk-import inventory, AI-write listings in seconds, route leads to your team, track conversion — all in one workspace.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg"><Link to="/dealers">Become a dealer</Link></Button>
        <Button asChild variant="outline" size="lg"><Link to="/services">Join as a service partner</Link></Button>
      </div>
    </section>
  );
}

export default function Home() {
  useEffect(() => {
    setMeta({
      title: BRAND.name,
      description: BRAND.tagline,
      ogType: "website",
    });
  }, []);
  return (
    <>
      <HeroSearch />
      <FeaturedListings />
      <CategoryGrid />
      <AIAssistantBanner />
      <ServicesGrid />
      <TrustSection />
      <DealerCTA />
    </>
  );
}
