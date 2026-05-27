import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  Users,
  Wrench,
  ClipboardList,
  Plane,
  Anchor,
  Car as CarIcon,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { setMeta } from "@/lib/seo";
import { BRAND } from "@/lib/brand";
import { trackEvent } from "@/lib/trackEvent";

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="container-pad py-14 border-t border-border">
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      {title && (
        <>
          <h2 className="section-title">{title}</h2>
          <div className="section-title-underline" />
        </>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof ShieldCheck;
  title: string;
  body: string;
}) {
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/80 h-full">
      <CardContent className="p-6">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-brass-500/10 ring-1 ring-brass-500/30">
          <Icon className="h-5 w-5 text-brass-400" />
        </div>
        <div className="font-display text-xl mt-4">{title}</div>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{body}</p>
      </CardContent>
    </Card>
  );
}

export default function BetaPage() {
  useEffect(() => {
    setMeta({
      title: "Beta access",
      description: `Help shape ${BRAND.name} — the marketplace for high-value boats, autos, aircraft, and the services around them.`,
      ogType: "website",
    });
    trackEvent("beta_page_view");
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border hero-glow">
        <div className="container-pad py-20 lg:py-28 text-center">
          <div className="inline-flex items-center gap-2 text-brass-400 mb-3">
            <Sparkles className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-[0.32em]">Private beta</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-tight max-w-4xl mx-auto">
            Help shape the marketplace for{" "}
            <span className="text-brass-gradient">high-value boats, autos, aircraft</span>
            {" "}— and the services around them.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg leading-relaxed">
            {BRAND.name} brings premium listings, buyer requests, deal rooms, service
            workflows, and trust tools into one platform. We're inviting a small group of
            dealers, brokers, service providers, and serious buyers to use it early and
            shape what comes next.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="btn-glow">
              <Link to="/feedback" onClick={() => trackEvent("request_beta_click", { source: "beta_hero" })}>
                Request beta access
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/feedback" onClick={() => trackEvent("book_call_click", { source: "beta_hero" })}>
                Book a 10-minute feedback call
              </Link>
            </Button>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
            <Badge variant="accent">Boats</Badge>
            <Badge variant="accent">Autos</Badge>
            <Badge variant="accent">Aircraft</Badge>
            <Badge variant="default">Dealers</Badge>
            <Badge variant="default">Brokers</Badge>
            <Badge variant="default">Service partners</Badge>
          </div>
        </div>
      </section>

      {/* Founder note */}
      <Section eyebrow="Founder note">
        <div className="glass-card p-8 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-brass-500/15 grid place-items-center font-display text-brass-400">
              DM
            </div>
            <div>
              <div className="font-display text-lg">Don Morrison</div>
              <div className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Founder, {BRAND.name}
              </div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            I started {BRAND.name} because the marketplaces for boats, planes, and
            high-value autos still feel like the early 2000s. Listings are thin, trust
            is murky, and the work after the listing — inspection, transport, escrow,
            financing — is scattered across phone calls and PDFs.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground mt-3">
            We're building the platform with a handful of dealers, brokers, and buyers
            who care about the details. If you're one of them, I'd like to hear what
            we should fix first. Every beta partner gets direct access to me and to
            the product team — no support queue, no ticket form.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/feedback" onClick={() => trackEvent("request_beta_click", { source: "founder_note" })}>
                Talk to Don <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* Who beta is for */}
      <Section eyebrow="Who it's for" title="Who the beta is open to right now">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={Anchor}
            title="Marine dealers & yacht brokers"
            body="Single-rooftop dealers, brokerage houses, and yacht sales offices listing $50k–$5M+ vessels."
          />
          <FeatureCard
            icon={CarIcon}
            title="Specialty auto dealers"
            body="Exotic, classic, lifted truck, and powersports dealers who want a buyer audience that takes the asset seriously."
          />
          <FeatureCard
            icon={Plane}
            title="Aircraft brokers"
            body="Light piston, turboprop, helicopter, and jet brokers who need compliance-aware listing and inquiry tools."
          />
          <FeatureCard
            icon={Wrench}
            title="Service providers"
            body="Surveyors, mechanics, detailers, transport, inspection — anyone who shows up after the buyer says yes."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Lenders, insurance, escrow"
            body="Marine and auto lenders, specialty insurers, and escrow providers who want pre-qualified introductions."
          />
          <FeatureCard
            icon={Users}
            title="Serious buyers"
            body="Buyers actively shopping a real budget who want to test the buyer request, comparison, and deal room flows."
          />
        </div>
      </Section>

      {/* What beta partners get */}
      <Section eyebrow="What you get" title="What beta partners get">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={Sparkles}
            title="Direct access to the founder"
            body="Don answers your messages personally. No ticket queue, no support pyramid."
          />
          <FeatureCard
            icon={ClipboardList}
            title="Free use through public launch"
            body="Listings, requests, deal rooms, and service tools — all included while you're in the beta cohort."
          />
          <FeatureCard
            icon={MessageSquare}
            title="A real say in the roadmap"
            body="Tell us what's missing, what's clunky, and what would close more deals. We ship weekly."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Trust tools out of the box"
            body="Asset Passport, Transaction Room, Deal Score, report system, and admin review — already wired in."
          />
          <FeatureCard
            icon={Users}
            title="A founding-partner badge"
            body="Verified beta partners are surfaced first to buyers and carry a founding-partner badge on the public profile."
          />
          <FeatureCard
            icon={ArrowRight}
            title="Priority for what's next"
            body="Mobile apps, API access, white-label widgets — beta partners get first access as each ships."
          />
        </div>
      </Section>

      {/* What we want feedback on */}
      <Section eyebrow="Feedback" title="What we want feedback on">
        <ul className="grid gap-3 md:grid-cols-2 max-w-4xl">
          {[
            "Does the listing creation flow actually save you time?",
            "Is buyer-request matching surfacing real opportunities, or noise?",
            "Does the deal room cover the steps your buyers expect?",
            "Are the trust signals (Verified, Asset Passport) believable to your buyers?",
            "What service workflow (inspection, transport, escrow) is still painful?",
            "What would make you move a portion of your inventory here permanently?",
          ].map((line) => (
            <li key={line} className="flex items-start gap-2 text-sm">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brass-400 shrink-0" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Why TradeWind is different */}
      <Section eyebrow="Positioning" title={`Why ${BRAND.name} is different`}>
        <div className="grid gap-4 md:grid-cols-2 max-w-4xl">
          {[
            {
              title: "Built for high-value assets",
              body: "Boats, aircraft, and specialty autos have specific buyer behavior, financing patterns, and trust requirements. We design around that — not around generic classifieds.",
            },
            {
              title: "The work after the listing matters",
              body: "Inspection, transport, escrow, financing — handled inside the platform, not scattered across emails and PDFs.",
            },
            {
              title: "Trust is structural, not a badge",
              body: "Verified dealer status, Asset Passport, deal rooms with audit logs, and an admin review path are core to the product, not add-ons.",
            },
            {
              title: "Premium first, never sleazy",
              body: "No fake urgency, no inflated counts, no dark patterns. Demo listings are clearly labeled. We say what we are.",
            },
          ].map((it) => (
            <Card key={it.title} className="bg-card/60 border-border/80">
              <CardContent className="p-6">
                <div className="font-display text-xl">{it.title}</div>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{it.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <section className="container-pad py-20 border-t border-border text-center">
        <div className="eyebrow">Get involved</div>
        <h2 className="font-display text-4xl md:text-5xl mt-2">Two minutes is enough to start.</h2>
        <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
          Tell us who you are and what you'd like to test. We'll get back to every
          submission personally.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="btn-glow">
            <Link to="/feedback" onClick={() => trackEvent("request_beta_click", { source: "beta_footer" })}>
              Request beta access
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/feedback" onClick={() => trackEvent("book_call_click", { source: "beta_footer" })}>
              Book a 10-minute feedback call
            </Link>
          </Button>
          <Button asChild variant="link" size="lg">
            <Link to="/feedback">Give product feedback</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
