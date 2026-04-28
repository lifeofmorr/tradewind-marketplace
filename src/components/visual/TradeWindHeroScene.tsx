import { useEffect, useState, useRef, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import {
  Search, Sparkles, ShieldCheck, Anchor, Car as CarIcon, Wrench,
  Zap, Star, Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRAND } from "@/lib/brand";

const FLOATERS = [
  { icon: Anchor, label: "Boats", color: "text-brass-400", x: "-22%", y: "-18%", depth: 60, delay: 0 },
  { icon: CarIcon, label: "Autos", color: "text-brass-400", x: "26%", y: "-10%", depth: 90, delay: 0.4 },
  { icon: ShieldCheck, label: "Verified dealers", color: "text-emerald-400", x: "-30%", y: "20%", depth: 30, delay: 0.8 },
  { icon: Sparkles, label: "AI concierge", color: "text-brass-400", x: "30%", y: "22%", depth: 70, delay: 1.2 },
  { icon: Wrench, label: "Financing", color: "text-brass-400", x: "0%", y: "30%", depth: 50, delay: 1.6 },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return isMobile;
}

export default function TradeWindHeroScene() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const enable3D = !reduced && !isMobile;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, enable3D ? 80 : 0]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, enable3D ? 0.4 : 1]);
  const compassRotate = useTransform(scrollYProgress, [0, 1], [0, enable3D ? 90 : 0]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    navigate(`/browse${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <motion.section
      ref={ref}
      style={{ opacity: heroOpacity }}
      className="relative overflow-hidden border-b border-border hero-glow"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-brass-500/10 blur-3xl animate-float" />
        <div className="absolute top-40 right-1/4 h-96 w-96 rounded-full bg-navy-700/30 blur-3xl animate-float [animation-delay:1.5s]" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/0 via-navy-900/0 to-navy-950/30" />
      </div>

      {/* 3D scene layer (desktop, motion-allowed only) */}
      {enable3D && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden md:block"
          style={{ perspective: "1400px", perspectiveOrigin: "50% 40%" }}
        >
          {/* Compass / brass ring */}
          <motion.div
            style={{ rotate: compassRotate }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative h-[420px] w-[420px] rounded-full border border-brass-500/20 animate-pulse-glow">
              <div className="absolute inset-6 rounded-full border border-brass-500/15" />
              <div className="absolute inset-14 rounded-full border border-brass-500/10" />
              <Compass
                aria-hidden
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-brass-400/40"
              />
              {/* tick marks */}
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 origin-bottom h-2 w-px bg-brass-500/30"
                  style={{
                    transform: `translate(-50%, -210px) rotate(${(360 / 16) * i}deg)`,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Floating cards */}
          {FLOATERS.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, rotateX: -10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: f.delay, duration: 0.9, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  left: `calc(50% + ${f.x})`,
                  top: `calc(50% + ${f.y})`,
                  transform: `translate(-50%, -50%) translateZ(${f.depth}px)`,
                  transformStyle: "preserve-3d",
                }}
                className="depth-3d"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: f.delay }}
                  className="depth-3d-inner glass-card-elevated px-4 py-3 flex items-center gap-2"
                >
                  <Icon className={`h-4 w-4 ${f.color}`} />
                  <span className="font-mono text-[11px] uppercase tracking-[0.24em]">{f.label}</span>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      )}

      <motion.div
        style={{ y: heroY }}
        className="container-pad py-24 lg:py-36 text-center relative"
      >
        <div className="inline-flex items-center gap-2 text-brass-400 mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="font-mono text-xs uppercase tracking-[0.32em]">{BRAND.name} marketplace</span>
        </div>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl md:text-7xl leading-[1.05]">
          Boats. Autos.
          <br />
          <span className="text-brass-gradient">Serious buyers.</span>
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-muted-foreground px-2">
          {BRAND.tagline}
        </p>
        <form onSubmit={onSubmit} className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 relative z-10">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <label htmlFor="hero-search" className="sr-only">Search listings</label>
            <Input
              id="hero-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try 'Boston Whaler 320' or 'Porsche 911 GT3'"
              className="pl-9 h-12 text-base bg-card/60 backdrop-blur"
              autoComplete="off"
            />
          </div>
          <Button size="lg" type="submit" className="btn-glow">Search</Button>
        </form>

        {/* Mobile fallback chips (no 3D, simpler) */}
        {!enable3D && (
          <div className="md:hidden mt-8 flex flex-wrap justify-center gap-2">
            {FLOATERS.map((f, i) => {
              const Icon = f.icon;
              return (
                <Link
                  key={i}
                  to="/browse"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs"
                >
                  <Icon className={`h-3.5 w-3.5 ${f.color}`} />
                  <span className="font-mono uppercase tracking-[0.2em]">{f.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground relative z-10">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Verified dealers</span>
          <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-brass-400" /> AI fraud screening</span>
          <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-brass-400" /> Concierge for every deal</span>
        </div>
      </motion.div>
    </motion.section>
  );
}
