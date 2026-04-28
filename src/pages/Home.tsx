import { lazy, Suspense, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, Wrench, Anchor, Car as CarIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/Reveal";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { MarketPulseCard } from "@/components/market/MarketPulseCard";
import { useListings } from "@/hooks/useListings";
import { CATEGORIES } from "@/lib/categories";
import { BRAND } from "@/lib/brand";
import { setMeta } from "@/lib/seo";

const TradeWindHeroScene = lazy(() => import("@/components/visual/TradeWindHeroScene"));

function HeroFallback() {
  return (
    <section className="relative overflow-hidden border-b border-border hero-glow">
      <div className="container-pad py-24 lg:py-36 text-center">
        <div className="inline-flex items-center gap-2 text-brass-400 mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="font-mono text-xs uppercase tracking-[0.32em]">{BRAND.name} marketplace</span>
        </div>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl md:text-7xl leading-[1.05]">
          Boats. Autos.
          <br />
          <span className="text-brass-gradient">Serious buyers.</span>
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-muted-foreground px-2">{BRAND.tagline}</p>
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
    <Reveal as="section" className="container-pad py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="eyebrow">Featured</div>
          <h2 className="section-title">Hand-picked listings</h2>
          <div className="section-title-underline" />
        </div>
        <Button asChild variant="link"><Link to="/browse">Browse all <ArrowRight className="h-4 w-4" /></Link></Button>
      </div>
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] skeleton rounded-xl" />
          ))}
        </div>
      ) : (
        <ListingGrid listings={listings} emptyText="No featured listings yet — check back soon." />
      )}
    </Reveal>
  );
}

function CategoryGrid() {
  return (
    <Reveal as="section" className="container-pad py-16 border-t border-border">
      <div className="eyebrow">Categories</div>
      <h2 className="section-title">Find your next one</h2>
      <div className="section-title-underline mb-8" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {CATEGORIES.map((c, i) => (
          <Reveal key={c.key} delay={i * 0.04}>
            <Link
              to={`/categories/${c.key}`}
              className="group glass-card p-5 lift-card brass-glow block h-full"
            >
              <div className="flex items-center gap-2 text-brass-400">
                {c.group === "boat" ? <Anchor className="h-4 w-4" /> : <CarIcon className="h-4 w-4" />}
                <span className="font-mono text-xs uppercase tracking-wider">{c.group}</span>
              </div>
              <div className="font-display text-xl mt-2">{c.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.blurb}</div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Reveal>
  );
}

function AIAssistantBanner() {
  return (
    <Reveal as="section" className="container-pad py-16">
      <div className="relative overflow-hidden rounded-2xl border border-brass-500/30 p-10 grid md:grid-cols-[1.4fr_1fr] items-center gap-8 hero-glow">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brass-500/10 blur-3xl"
        />
        <div>
          <div className="flex items-center gap-2 text-brass-400">
            <Sparkles className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-[0.32em]">AI Concierge</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl mt-2">Tell us what you're after.</h2>
          <p className="text-muted-foreground mt-3 max-w-lg">
            Describe your dream boat or car. Our AI concierge narrows your search, surfaces comps,
            and lines up inspections, financing, and transport — end-to-end.
          </p>
        </div>
        <div className="flex md:justify-end relative">
          <Button asChild size="lg" className="btn-glow">
            <Link to="/concierge">Start with concierge</Link>
          </Button>
        </div>
      </div>
    </Reveal>
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
    <Reveal as="section" className="container-pad py-16 border-t border-border">
      <div className="eyebrow">Done-for-you</div>
      <h2 className="section-title">Services that close the deal</h2>
      <div className="section-title-underline mb-8" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s, i) => (
          <Reveal key={s.to} delay={i * 0.05}>
            <Link
              to={s.to}
              className="block glass-card lift-card brass-glow p-5 h-full"
            >
              <Wrench className="h-4 w-4 text-brass-400" />
              <div className="font-display text-xl mt-2">{s.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.blurb}</div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Reveal>
  );
}

function TrustSection() {
  const items = [
    { title: "Verified sellers", body: "Background-checked private sellers, vetted dealers, and licensed service partners." },
    { title: "Fraud guard AI",   body: "Every inquiry is screened for bad-faith signals before it hits a seller's inbox." },
    { title: "Transparent comps", body: "AI-powered pricing context so you see what fair looks like — boat or car." },
  ];
  return (
    <Reveal as="section" className="container-pad py-16 border-t border-border">
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 0.06}>
            <div className="glass-card p-6 lift-card h-full">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-brass-500/10 ring-1 ring-brass-500/30">
                <ShieldCheck className="h-5 w-5 text-brass-400" />
              </div>
              <div className="font-display text-2xl mt-4">{it.title}</div>
              <p className="text-muted-foreground text-sm mt-2">{it.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Button asChild variant="link"><Link to="/trust">Read the Trust Center <ArrowRight className="h-4 w-4" /></Link></Button>
      </div>
    </Reveal>
  );
}

function DealerCTA() {
  return (
    <Reveal as="section" className="container-pad py-20 border-t border-border text-center">
      <div className="eyebrow">For dealers & service pros</div>
      <h2 className="font-display text-4xl md:text-5xl mt-2">Run your inventory like it's 2026.</h2>
      <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
        Bulk-import inventory, AI-write listings in seconds, route leads to your team, track conversion — all in one workspace.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" className="btn-glow"><Link to="/dealers">Become a dealer</Link></Button>
        <Button asChild variant="outline" size="lg"><Link to="/services">Join as a service partner</Link></Button>
      </div>
    </Reveal>
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
      <Suspense fallback={<HeroFallback />}>
        <TradeWindHeroScene />
      </Suspense>
      <FeaturedListings />
      <Reveal as="section" className="container-pad py-12 border-t border-border">
        <div className="eyebrow">Live signal</div>
        <h2 className="section-title">Marketplace pulse</h2>
        <div className="section-title-underline mb-6" />
        <MarketPulseCard />
      </Reveal>
      <CategoryGrid />
      <AIAssistantBanner />
      <ServicesGrid />
      <TrustSection />
      <DealerCTA />
    </>
  );
}
