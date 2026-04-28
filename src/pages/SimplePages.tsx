import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { setMeta } from "@/lib/seo";
import { BRAND } from "@/lib/brand";

interface ShellProps {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

function PageShell({ eyebrow, title, description, children }: ShellProps) {
  return (
    <div className="container-pad py-16 max-w-3xl space-y-6">
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
    <PageShell eyebrow="Auctions" title="Auctions are coming." description="Time-bound sales for performance boats and exotics.">
      <p>Auctions launch in Phase 3. Want early access? <Link className="text-brass-400" to="/contact">Tell us</Link>.</p>
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

export function Pricing() {
  useTitle("Pricing", "Simple pricing for sellers, dealers, and service partners.");
  return (
    <PageShell eyebrow="Pricing" title="Simple pricing." description="Free private listings. Boost or feature for visibility. Dealers and service partners pay a monthly subscription.">
      <ul className="list-disc pl-6 mt-4 space-y-1">
        <li>Private seller — list for free; optional Featured/Boost upgrades.</li>
        <li>Dealer Starter / Pro / Premier — listing quotas + lead routing + analytics.</li>
        <li>Service Provider — directory listing + lead inbox.</li>
        <li>Concierge — flat fee per matched buy.</li>
      </ul>
    </PageShell>
  );
}

export function Dealers() {
  useTitle("For dealers", "Run your dealership on TradeWind.");
  return (
    <PageShell eyebrow="For dealers" title="Run your dealership on TradeWind." description="Inventory tools, AI listing copy, leads and analytics in one place.">
      <p>Ready to apply? <Link className="text-brass-400" to="/signup">Create an account</Link> as a dealer to start onboarding.</p>
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
  useTitle("Terms", `Terms of service for ${BRAND.name}.`);
  return <PageShell eyebrow="Legal" title="Terms of service."><p>Full terms ship with launch. Reach out at <a className="text-brass-400" href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>.</p></PageShell>;
}

export function Privacy() {
  useTitle("Privacy", `Privacy policy for ${BRAND.name}.`);
  return <PageShell eyebrow="Legal" title="Privacy policy."><p>Full policy ships with launch. Reach out at <a className="text-brass-400" href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>.</p></PageShell>;
}

export function NotFound() {
  useTitle("Not found", "That page doesn't exist on TradeWind.");
  return (
    <PageShell eyebrow="404" title="Page not found.">
      <p><Link className="text-brass-400" to="/">Take me home →</Link></p>
    </PageShell>
  );
}
