import { Link } from "react-router-dom";
import { BRAND } from "@/lib/brand";

interface FooterCol { title: string; links: { label: string; to: string }[] }

const COLS: FooterCol[] = [
  {
    title: "Marketplace",
    links: [
      { label: "Browse",     to: "/browse" },
      { label: "Categories", to: "/categories" },
      { label: "Featured",   to: "/browse?featured=1" },
      { label: "Auctions",   to: "/auctions" },
    ],
  },
  {
    title: "Sellers & Dealers",
    links: [
      { label: "Sell my boat", to: "/sell-my-boat" },
      { label: "Sell my car",  to: "/sell-my-car" },
      { label: "Dealers",      to: "/dealers" },
      { label: "Pricing",      to: "/pricing" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Financing",   to: "/financing" },
      { label: "Insurance",   to: "/insurance" },
      { label: "Inspections", to: "/inspections" },
      { label: "Transport",   to: "/transport" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About",          to: "/about" },
      { label: "Blog",           to: "/blog" },
      { label: "Market reports", to: "/market-reports" },
      { label: "Contact",        to: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms",         to: "/terms" },
      { label: "Privacy",       to: "/privacy" },
      { label: "Trust Center",  to: "/trust" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-navy-950/50 mt-24">
      <div className="container-pad py-16">
        <div className="grid gap-10 md:grid-cols-5">
          {COLS.map((col) => (
            <div key={col.title}>
              <div className="font-mono text-xs uppercase tracking-[0.24em] text-brass-400 mb-3">{col.title}</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="hover:text-foreground transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground">
          <div className="font-display text-base text-foreground">{BRAND.name}<span className="text-brass-400">.</span></div>
          <div>© {new Date().getFullYear()} {BRAND.name} — {BRAND.tagline}</div>
          <a href={`mailto:${BRAND.supportEmail}`} className="font-mono hover:text-foreground">{BRAND.supportEmail}</a>
        </div>
      </div>
    </footer>
  );
}
