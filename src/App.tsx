import { Routes, Route } from "react-router-dom";
import { BRAND } from "@/lib/brand";

/**
 * Phase 0 placeholder route. Phase 1J replaces this with the full route tree.
 */
function PlaceholderHome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <div className="text-xs font-mono uppercase tracking-[0.32em] text-brass-400">Phase 0 · scaffold</div>
      <h1 className="font-display text-5xl mt-3">{BRAND.name}<span className="text-brass-400">.</span></h1>
      <p className="mt-4 max-w-md text-muted-foreground">{BRAND.tagline}</p>
      <code className="mt-8 text-xs font-mono text-muted-foreground">npm run dev · ready · waiting for Phase 1</code>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PlaceholderHome />} />
    </Routes>
  );
}
