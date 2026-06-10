import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShieldCheck,
  Wrench,
  Building2,
  Users,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { setMeta } from "@/lib/seo";
import { BRAND } from "@/lib/brand";

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="container-pad py-14 border-t border-border">
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="section-title">{title}</h2>
      <div className="section-title-underline" />
      <div className="mt-6">{children}</div>
    </section>
  );
}

function StepList({ items }: { items: { title: string; body: string }[] }) {
  return (
    <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-5xl">
      {items.map((it, i) => (
        <li key={it.title}>
          <Card className="bg-card/60 border-border/80 h-full">
            <CardContent className="p-6">
              <div className="font-mono text-xs uppercase tracking-[0.24em] text-brass-400">
                Step {i + 1}
              </div>
              <div className="font-display text-xl mt-2">{it.title}</div>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{it.body}</p>
            </CardContent>
          </Card>
        </li>
      ))}
    </ol>
  );
}

export default function HowItWorksPage() {
  useEffect(() => {
    setMeta({
      title: "How it works",
      description: `How ${BRAND.name} works for buyers, dealers, brokers, and service partners.`,
      ogType: "website",
    });
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border hero-glow">
        <div className="container-pad py-20 lg:py-28 text-center">
          <div className="inline-flex items-center gap-2 text-brass-400 mb-3">
            <ClipboardList className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-[0.32em]">How it works</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-tight max-w-4xl mx-auto">
            One platform for the people on{" "}
            <span className="text-brass-gradient">both sides of the deal.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg leading-relaxed">
            {BRAND.name} is a marketplace and a workflow. Buyers find serious inventory.
            Dealers and brokers manage listings and leads. Service partners take over
            once a deal is in motion. Everyone works from the same record.
          </p>
        </div>
      </section>

      {/* Buyers */}
      <Section eyebrow="For buyers" title="If you're shopping for a boat, auto, or aircraft">
        <StepList
          items={[
            {
              title: "Search with intent",
              body: "Browse premium listings, filter by use case, and save the ones worth a closer look. Compare side by side.",
            },
            {
              title: "Send buyer requests",
              body: "Describe what you actually want. Verified dealers and brokers receive your request and respond with matching inventory.",
            },
            {
              title: "Use the Deal Room to close",
              body: "Once you're talking to a seller, the Deal Room keeps the inspection, financing, escrow, and transport steps in one timeline.",
            },
          ]}
        />
        <div className="mt-6">
          <Button asChild variant="link" className="px-0">
            <Link to="/browse">
              Start browsing <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>

      {/* Dealers & brokers */}
      <Section eyebrow="For dealers & brokers" title="If you sell boats or autos for a living">
        <StepList
          items={[
            {
              title: "Import your inventory",
              body: "Bulk-import or sync from your DMS. We carry over photos, specs, and pricing. AI helps clean the descriptions.",
            },
            {
              title: "Receive matched buyer requests",
              body: "Active buyers describe what they want. The match engine surfaces requests that fit your inventory. You respond when relevant.",
            },
            {
              title: "Manage leads in one workspace",
              body: "Every inquiry, request, and Deal Room lives in your dashboard. Route to staff, track conversion, see what's stalling.",
            },
          ]}
        />
        <div className="mt-6">
          <Button asChild variant="link" className="px-0">
            <Link to="/dealers-info">
              Dealer overview <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>

      {/* Aircraft brokers */}
      <Section eyebrow="For aircraft brokers" title="If you broker piston, turboprop, helicopter, or jet">
        <StepList
          items={[
            {
              title: "List in a compliance-aware surface",
              body: "Aircraft listings carry the fields buyers actually ask for — total time, engine hours, last annual, equipment, logbooks.",
            },
            {
              title: "Engage qualified buyers, not tire-kickers",
              body: "Buyer requests are screened. Inquiries surface what the buyer can fund and how they'll close.",
            },
            {
              title: "Coordinate pre-buy and escrow",
              body: "Schedule pre-buy inspections, share logbook PDFs, and run escrow through the Deal Room — without leaving the listing.",
            },
          ]}
        />
        <div className="mt-6">
          <Button asChild variant="link" className="px-0">
            <Link to="/aircraft">
              Aircraft marketplace <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>

      {/* Service providers */}
      <Section eyebrow="For service providers" title="If you inspect, transport, repair, or detail">
        <StepList
          items={[
            {
              title: "Build a verified service profile",
              body: "Show coverage area, credentials, response time, and price ranges. Reviews come from real Deal Room participants.",
            },
            {
              title: "Receive booking requests",
              body: "Buyers and dealers request inspections, transport, surveys, or repairs in the workflow where they need you.",
            },
            {
              title: "Get paid through the platform",
              body: "Quote, accept, and invoice without chasing PDFs. Stripe Connect handles payouts on terms you set.",
            },
          ]}
        />
        <div className="mt-6">
          <Button asChild variant="link" className="px-0">
            <Link to="/services">
              Browse service providers <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>

      {/* Finance, insurance, escrow, transport */}
      <Section
        eyebrow="For lenders, insurance, escrow & transport"
        title="If you're the partner the deal runs on"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-5xl">
          {[
            {
              icon: Building2,
              title: "Lenders",
              body: "Marine and auto loan partners receive financing requests already attached to a specific asset and buyer.",
            },
            {
              icon: ShieldCheck,
              title: "Insurance",
              body: "Specialty insurers quote against the asset record, not against a re-typed form.",
            },
            {
              icon: ClipboardList,
              title: "Escrow",
              body: "Escrow providers plug into the Deal Room, so funds move only when the agreed steps are signed off.",
            },
            {
              icon: Wrench,
              title: "Transport",
              body: "Bonded transport partners receive routed jobs with asset specs, pickup, and drop-off pre-filled.",
            },
          ].map((it) => (
            <Card key={it.title} className="bg-card/60 border-border/80 h-full">
              <CardContent className="p-6">
                <it.icon className="h-5 w-5 text-brass-400" />
                <div className="font-display text-xl mt-3">{it.title}</div>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{it.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Trust & safety */}
      <Section eyebrow="Trust & safety" title="What we do so the marketplace stays serious">
        <ul className="grid gap-3 md:grid-cols-2 max-w-4xl">
          {[
            "Dealer identity, licensing, and bank verification through Stripe Connect.",
            "Buyer requests are screened for bad-faith signals before they hit a seller's inbox.",
            "Every listing has an audit trail of edits, photo changes, and price updates.",
            "Deal Rooms keep a chronological record of every approval and document.",
            "Demo listings are clearly labeled and cannot accept real inquiries the same way as live inventory.",
            "Reported listings and users are reviewed by a human, not just a model.",
          ].map((line) => (
            <li key={line} className="flex items-start gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Button asChild variant="link" className="px-0">
            <Link to="/trust">
              Read the Trust Center <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>

      {/* Final CTA */}
      <section className="container-pad py-20 border-t border-border text-center">
        <div className="eyebrow">Get started</div>
        <h2 className="font-display text-4xl md:text-5xl mt-2">Pick the way in that fits.</h2>
        <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
          Browse the marketplace, request beta access, or send us product feedback. We
          read every message.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="btn-glow">
            <Link to="/browse">
              <Search className="h-4 w-4" /> Browse listings
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/beta">
              <Users className="h-4 w-4" /> Request beta access
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
