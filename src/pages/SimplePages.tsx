import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, Anchor, Car, ShieldCheck } from "lucide-react";
import { setMeta } from "@/lib/seo";
import { BRAND } from "@/lib/brand";
import { Button } from "@/components/ui/button";

interface ShellProps {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
  wide?: boolean;
}

function PageShell({ eyebrow, title, description, children, wide }: ShellProps) {
  return (
    <div className={`container-pad py-16 ${wide ? "max-w-6xl" : "max-w-3xl"} space-y-6`}>
      <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">{eyebrow}</div>
      <h1 className="font-display text-4xl">{title}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
      <div className="prose prose-invert max-w-none text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function useTitle(title: string, description: string) {
  useEffect(() => {
    setMeta({ title, description });
  }, [title, description]);
}

export function About() {
  useTitle("About", `Why ${BRAND.name} exists.`);
  return (
    <PageShell eyebrow="About" title={`We built ${BRAND.name} for serious buyers.`} description={BRAND.tagline}>
      <p>
        TradeWind is a focused marketplace for the boats, cars, and powersports machines people actually
        spend years dreaming about. We pair AI-written listings, transparent pricing comps, and a vetted
        network of service partners — so closing the deal is as serious as the equipment.
      </p>
    </PageShell>
  );
}

export function Contact() {
  useTitle("Contact", `Get in touch with ${BRAND.name}.`);
  return (
    <PageShell eyebrow="Contact" title="Get in touch.">
      <p>For sales, support, or partnerships, email <a className="text-brass-400" href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>.</p>
    </PageShell>
  );
}

export function Auctions() {
  useTitle("Auctions", "Auctions are coming to TradeWind.");
  return (
    <PageShell eyebrow="Auctions" title="Time-bound sales." description="Performance boats, exotics, and collectibles on a clock.">
      <p>
        Browse open auctions on the <Link className="text-brass-400" to="/auctions">auctions hub</Link>, or
        contact <a className="text-brass-400" href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>{" "}
        about consigning a vehicle.
      </p>
    </PageShell>
  );
}

export function Services() {
  useTitle("Services", "Done-for-you services on TradeWind.");
  return (
    <PageShell eyebrow="Services" title="Closing the deal, end-to-end." description="Financing, insurance, inspections, transport, and concierge — vetted.">
      <ul className="list-disc pl-6 mt-4 space-y-1">
        <li><Link className="text-brass-400" to="/financing">Financing</Link> — marine and auto loans through licensed partners.</li>
        <li><Link className="text-brass-400" to="/insurance">Insurance</Link> — coverage quotes for boats, cars, exotics, RVs.</li>
        <li><Link className="text-brass-400" to="/inspections">Inspections</Link> — surveyors and PPI in your area.</li>
        <li><Link className="text-brass-400" to="/transport">Transport</Link> — coast-to-coast haulers and yacht delivery.</li>
        <li><Link className="text-brass-400" to="/concierge">Concierge</Link> — let an expert source it for you.</li>
      </ul>
    </PageShell>
  );
}

interface Tier {
  name: string;
  price: string;
  cadence?: string;
  blurb: string;
  bullets: string[];
  cta: { label: string; to: string };
  highlight?: boolean;
}

const SELLER_TIERS: Tier[] = [
  {
    name: "Private listing",
    price: "Free",
    blurb: "List a single boat or car. Pay nothing until you sell.",
    bullets: [
      "Unlimited photos + AI-written copy",
      "Buyer messaging + saved-listing alerts",
      "Optional Featured ($49 / 30d) or Boost ($19 / 7d)",
    ],
    cta: { label: "Start a listing", to: "/sell" },
  },
];

const DEALER_TIERS: Tier[] = [
  {
    name: "Starter",
    price: "$99",
    cadence: "/month",
    blurb: "Solo dealers and brokers getting their first inventory online.",
    bullets: [
      "Up to 25 active listings",
      "Lead routing + basic analytics",
      "Verified-dealer badge after KYC",
    ],
    cta: { label: "Start as Starter", to: "/signup?role=dealer" },
  },
  {
    name: "Pro",
    price: "$249",
    cadence: "/month",
    blurb: "Growing dealerships with multiple sales staff.",
    bullets: [
      "Up to 100 active listings",
      "Team seats + lead assignment",
      "Bulk listing import + AI rewrites",
      "Featured discount: $29/listing",
    ],
    cta: { label: "Start as Pro", to: "/signup?role=dealer" },
    highlight: true,
  },
  {
    name: "Premier",
    price: "$599",
    cadence: "/month",
    blurb: "High-volume dealers and brokerages with national reach.",
    bullets: [
      "Unlimited listings",
      "Priority placement + featured credits",
      "Advanced analytics + market reports",
      "Dedicated account manager",
    ],
    cta: { label: "Talk to us", to: "/contact" },
  },
];

const SERVICE_TIERS: Tier[] = [
  {
    name: "Service Partner",
    price: "$79",
    cadence: "/month",
    blurb: "Lenders, surveyors, transport, insurance — anyone closing high-value deals.",
    bullets: [
      "Directory profile + verified badge",
      "Lead inbox + buyer requests routed by category and region",
      "Reviews and trust score",
    ],
    cta: { label: "Apply to join", to: "/signup?role=service_provider" },
  },
];

export function Pricing() {
  useTitle("Pricing", "Simple pricing for sellers, dealers, and service partners.");
  return (
    <PageShell
      eyebrow="Pricing"
      title="Pay once you're getting value."
      description="Free private listings. Subscriptions for dealers and service partners. No hidden cuts on closed deals."
      wide
    >
      <PriceColumn label="Private sellers" tiers={SELLER_TIERS} icon={Anchor} />
      <PriceColumn label="Dealers" tiers={DEALER_TIERS} icon={Car} />
      <PriceColumn label="Service partners" tiers={SERVICE_TIERS} icon={ShieldCheck} />
      <div className="mt-8 rounded-lg border border-border bg-card/40 p-6 text-sm">
        <div className="font-display text-base">Concierge</div>
        <p className="text-muted-foreground mt-1">
          Tell us exactly what you want and a TradeWind concierge sources it. Flat <span className="text-brass-400">$499</span> engagement,
          fully refundable if we can't find your match. <Link className="text-brass-400" to="/concierge">Start a brief →</Link>
        </p>
      </div>
      <p className="text-xs text-muted-foreground mt-6">
        Prices listed in USD. Subscriptions billed monthly with a 14-day free trial. Cancel any time.
      </p>
    </PageShell>
  );
}

function PriceColumn({ label, tiers, icon: Icon }: { label: string; tiers: Tier[]; icon: typeof Anchor }) {
  return (
    <section className="not-prose mt-10">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-brass-400" />
        <div className="eyebrow">{label}</div>
      </div>
      <div className={`grid gap-4 ${tiers.length === 1 ? "" : "md:grid-cols-3"}`}>
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`rounded-lg border p-6 flex flex-col ${
              t.highlight
                ? "border-brass-500/50 bg-brass-500/5 ring-1 ring-brass-500/30"
                : "border-border bg-card/60"
            }`}
          >
            <div className="font-display text-xl">{t.name}</div>
            <div className="mt-3">
              <span className="font-display text-3xl">{t.price}</span>
              {t.cadence && <span className="text-sm text-muted-foreground ml-1">{t.cadence}</span>}
            </div>
            <p className="text-sm text-muted-foreground mt-2">{t.blurb}</p>
            <ul className="mt-4 space-y-2 text-sm flex-1">
              {t.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-brass-400 mt-1 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant={t.highlight ? "default" : "outline"} className="mt-5">
              <Link to={t.cta.to}>{t.cta.label}</Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Dealers() {
  useTitle("For dealers", "Run your dealership on TradeWind.");
  return (
    <PageShell eyebrow="For dealers" title="Run your dealership on TradeWind." description="Inventory tools, AI listing copy, leads and analytics in one place.">
      <p>Ready to apply? <Link className="text-brass-400" to="/signup?role=dealer">Create an account</Link> as a dealer to start onboarding. See <Link className="text-brass-400" to="/pricing">pricing</Link> for plan details.</p>
    </PageShell>
  );
}

export function SellMyBoat() {
  useTitle("Sell my boat", "List your boat in minutes on TradeWind.");
  return (
    <PageShell eyebrow="Sell" title="Sell my boat." description="Drop in a few details and let our AI write the listing for you.">
      <p><Link className="text-brass-400" to="/seller/listings/new?category=boat">Start your listing →</Link></p>
    </PageShell>
  );
}

export function SellMyCar() {
  useTitle("Sell my car", "List your car in minutes on TradeWind.");
  return (
    <PageShell eyebrow="Sell" title="Sell my car." description="Drop in a few details and let our AI write the listing for you.">
      <p><Link className="text-brass-400" to="/seller/listings/new?category=car">Start your listing →</Link></p>
    </PageShell>
  );
}

export function SellHub() {
  useTitle("Sell on TradeWind", "List boats, cars, RVs, and more.");
  return (
    <PageShell eyebrow="Sell" title="What are you selling?">
      <ul className="list-disc pl-6 space-y-1">
        <li><Link className="text-brass-400" to="/sell-my-boat">Boat</Link></li>
        <li><Link className="text-brass-400" to="/sell-my-car">Car or truck</Link></li>
        <li>RV / powersports / exotic — start a listing from your dashboard.</li>
      </ul>
    </PageShell>
  );
}

export function Terms() {
  useTitle("Terms of Service", `Terms of service for ${BRAND.name}.`);
  return (
    <PageShell eyebrow="Legal" title="Terms of Service" description={`Last updated April 2026. By using ${BRAND.name}, you agree to these terms.`}>
      <h2>1. Marketplace role</h2>
      <p>
        TradeWind is a marketplace that connects buyers, sellers, dealers, and service providers. We do not
        take title to vehicles or vessels listed on the platform, do not act as broker of record, and do
        not guarantee the accuracy of any listing. Buyers and sellers transact directly.
      </p>
      <h2>2. Account responsibilities</h2>
      <p>
        You are responsible for maintaining the confidentiality of your credentials and for all activity
        under your account. You agree to provide accurate information during signup and to keep it current.
      </p>
      <h2>3. Listing standards</h2>
      <p>
        Sellers must own (or be authorized to sell) any vehicle they list. Photos must depict the actual
        unit. Misrepresentation, stolen-title sales, and fraud will result in removal and a permanent ban.
      </p>
      <h2>4. Payments</h2>
      <p>
        Subscriptions and one-off payments are processed by Stripe. Subscriptions auto-renew until canceled.
        Concierge engagements are refundable if no qualifying match is sourced within the agreed window.
      </p>
      <h2>5. Disclaimers</h2>
      <p>
        TradeWind provides AI-assisted pricing, valuation, and copy as informational tools. They are not a
        substitute for inspection, professional appraisal, or licensed advice. Always verify HIN/VIN and
        title before any deposit.
      </p>
      <h2>6. Contact</h2>
      <p>
        Questions about these terms? Email <a className="text-brass-400" href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>.
      </p>
    </PageShell>
  );
}

export function Privacy() {
  useTitle("Privacy Policy", `Privacy policy for ${BRAND.name}.`);
  return (
    <PageShell eyebrow="Legal" title="Privacy Policy" description="Last updated April 2026.">
      <h2>What we collect</h2>
      <ul>
        <li>Account info (name, email, phone) you provide at signup or in your profile.</li>
        <li>Listing content you publish, including photos and descriptions.</li>
        <li>Inquiry messages, saved listings, and request submissions.</li>
        <li>Standard server logs (IP, user agent, request paths) for security and debugging.</li>
        <li>Payment metadata from Stripe — TradeWind never sees raw card numbers.</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To run the marketplace (route inquiries, deliver notifications, generate AI summaries).</li>
        <li>To detect fraud and enforce our Terms.</li>
        <li>To send transactional emails. We do not sell your data to third parties.</li>
      </ul>
      <h2>Your choices</h2>
      <p>
        You can delete your account from your dashboard at any time. To request a data export or hard delete,
        email <a className="text-brass-400" href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>.
      </p>
      <h2>Cookies</h2>
      <p>
        We use only essential cookies for authentication. We do not run third-party advertising trackers.
      </p>
    </PageShell>
  );
}

export function NotFound() {
  useTitle("Not found", "That page doesn't exist on TradeWind.");
  return (
    <PageShell eyebrow="404" title="Page not found.">
      <p><Link className="text-brass-400" to="/">Take me home →</Link></p>
    </PageShell>
  );
}
