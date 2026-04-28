import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  FlaskConical,
  Search,
  Truck,
  DollarSign,
  Umbrella,
  AlertTriangle,
  Flag,
  Lock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <section className="container-pad py-12 border-t border-border">
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="section-title">{title}</h2>
      <div className="section-title-underline" />
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Card({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof ShieldCheck;
  title: string;
  body: string;
}) {
  return (
    <div className="glass-card p-5 lift-card brass-glow">
      <Icon className="h-5 w-5 text-brass-400" />
      <div className="font-display text-xl mt-3">{title}</div>
      <p className="text-sm text-muted-foreground mt-2">{body}</p>
    </div>
  );
}

export default function TrustCenter() {
  useEffect(() => {
    setMeta({
      title: "Trust Center",
      description:
        `How ${BRAND.name} protects buyers, dealers, and service providers in the boat & auto marketplace.`,
      ogType: "website",
    });
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border hero-glow">
        <div className="container-pad py-20 lg:py-28 text-center">
          <div className="inline-flex items-center gap-2 text-brass-400 mb-3">
            <Lock className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-[0.32em]">Trust Center</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-tight">
            How we keep the marketplace
            <br />
            <span className="text-brass-gradient">safe and serious.</span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-muted-foreground">
            {BRAND.name} combines verified dealers, AI fraud screening, and concierge-grade
            services to protect every transaction — boat or auto, $5k or $5M.
          </p>
        </div>
      </section>

      <Section eyebrow="Buyer protection" title="What we do for buyers">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card
            icon={ShieldCheck}
            title="Verified sellers"
            body="Dealers go through identity, license, and inventory verification. Private sellers are flagged and screened before listings go live."
          />
          <Card
            icon={Search}
            title="Independent inspections"
            body="We connect you with independent surveyors and pre-purchase inspectors — never the seller's choice."
          />
          <Card
            icon={DollarSign}
            title="Pre-vetted financing"
            body="Marine and auto lenders are pre-vetted. You'll never see a hidden referral or kickback."
          />
          <Card
            icon={Umbrella}
            title="Insurance partners"
            body="Quote with our insurance partners in minutes — no commitment to bind a policy."
          />
          <Card
            icon={Truck}
            title="Bonded transport"
            body="All transport partners are bonded and insured. Track your delivery end-to-end."
          />
          <Card
            icon={Sparkles}
            title="Concierge support"
            body="High-value purchases come with a TradeWind concierge who shepherds the entire deal."
          />
        </div>
      </Section>

      <Section eyebrow="Demo listings" title="Why you'll see 'Demo' badges">
        <div className="glass-card p-6 max-w-3xl">
          <div className="flex items-start gap-3">
            <FlaskConical className="h-5 w-5 text-violet-400 mt-1 shrink-0" />
            <div>
              <p className="text-sm">
                Listings tagged <span className="chip bg-slate-500/15 text-slate-200 ring-slate-400/20 ring-1 ring-inset">Demo</span> are sample inventory used to demonstrate
                features and search. They are <strong>not for sale</strong>. We make these visually
                obvious so no buyer ever submits an inquiry under a wrong impression.
              </p>
              <p className="text-sm text-muted-foreground mt-3">
                As real dealer inventory comes online, demo listings phase out automatically.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section eyebrow="Verification" title="What 'Verified Dealer' actually means">
        <ul className="grid gap-3 md:grid-cols-2 max-w-3xl">
          {[
            "Business license + dealer registration on file",
            "Bank account confirmed via Stripe Connect",
            "Identity check on the listed owner / principal",
            "At least one piece of physical inventory verified",
            "Reviewed by TradeWind staff before badge is granted",
            "Re-checked annually or after compliance flags",
          ].map((line) => (
            <li key={line} className="flex items-start gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Pre-purchase services" title="How to safely close a deal">
        <div className="grid gap-4 md:grid-cols-2 max-w-4xl">
          {[
            {
              title: "Inspect before you wire",
              body:
                "Always commission an independent inspection or marine survey before sending any deposit. We'll connect you with one in your region.",
              link: { to: "/inspections", label: "Request inspection" },
            },
            {
              title: "Use escrow for deposits",
              body:
                "Never send funds directly via wire, Zelle, or crypto. Use the platform's escrow flow or a dealer's bonded F&I office.",
              link: { to: "/financing", label: "Talk to financing" },
            },
            {
              title: "Verify title + HIN/VIN",
              body:
                "Run the title and HIN/VIN before closing. We help confirm matching numbers and any branded-title history.",
              link: { to: "/concierge", label: "Concierge review" },
            },
            {
              title: "Bonded transport only",
              body:
                "Use a bonded transport provider — never a stranger off marketplace forums. Our partners are insured for full asset value.",
              link: { to: "/transport", label: "Transport quote" },
            },
          ].map((it) => (
            <div key={it.title} className="glass-card p-5">
              <div className="font-display text-xl">{it.title}</div>
              <p className="text-sm text-muted-foreground mt-2">{it.body}</p>
              <Button asChild variant="link" className="mt-2 px-0">
                <Link to={it.link.to}>{it.link.label} →</Link>
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Scam awareness" title="Red flags to watch for">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "Seller insists on wire / crypto / gift cards",
            "Asset is listed far below market with urgency to close",
            "Seller refuses inspection or in-person viewing",
            "Title or HIN/VIN doesn't match registration",
            "Communication moves off-platform too quickly",
            "Photos appear lifted from other listings",
          ].map((line) => (
            <div key={line} className="glass-card p-4 flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <span className="text-sm">{line}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Reporting" title="See something off? Tell us.">
        <div className="glass-card p-6 max-w-2xl">
          <Flag className="h-5 w-5 text-rose-400" />
          <div className="font-display text-2xl mt-3">Report a listing or user</div>
          <p className="text-sm text-muted-foreground mt-2">
            Email{" "}
            <a className="text-brass-400" href="mailto:trust@tradewind.market">
              trust@tradewind.market
            </a>{" "}
            with the listing URL and a short description. Our trust team reviews every report
            within one business day, and acts on credible threats immediately.
          </p>
          <div className="mt-4">
            <Button asChild>
              <a href="mailto:trust@tradewind.market">Email trust team</a>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
