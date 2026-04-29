import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, Search, ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TRADEWIND_APPS, type ConnectedApp } from "@/lib/connectedApps";
import { cn } from "@/lib/utils";

function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad/.test(navigator.platform);
}

export default function AppSwitcher() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const mac = isMac();

  // Cmd+K / Ctrl+K to toggle
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      // Focus once the dialog mounts
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filtered: ConnectedApp[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TRADEWIND_APPS;
    return TRADEWIND_APPS.filter(
      (a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q),
    );
  }, [query]);

  function go(app: ConnectedApp) {
    if (app.status === "coming_soon") return;
    setOpen(false);
    navigate(app.to);
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const app = filtered[activeIdx];
      if (app) {
        e.preventDefault();
        go(app);
      }
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative inline-flex items-center justify-center h-11 w-11 md:h-9 md:w-9 rounded-md hover:bg-secondary transition-colors"
        aria-label="Open app switcher"
        title={`App switcher (${mac ? "⌘" : "Ctrl"}+K)`}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-2xl p-0 overflow-hidden border-white/10 bg-card/80 backdrop-blur-2xl"
          onKeyDown={onListKeyDown}
        >
          <DialogTitle className="sr-only">App switcher</DialogTitle>

          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
              placeholder="Jump to an app, surface, or workflow…"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              aria-label="Search apps"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              {mac ? "⌘" : "Ctrl"}+K
            </kbd>
          </div>

          <div className="px-3 pt-3 pb-1 font-mono text-[10px] uppercase tracking-[0.32em] text-brass-400">
            TradeWind apps
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-3 grid gap-2 sm:grid-cols-2">
            {filtered.length === 0 && (
              <div className="col-span-full p-6 text-center text-sm text-muted-foreground">
                No apps match “{query}”.
              </div>
            )}
            {filtered.map((app, i) => {
              const Icon = app.icon;
              const disabled = app.status === "coming_soon";
              return (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => go(app)}
                  onMouseEnter={() => setActiveIdx(i)}
                  disabled={disabled}
                  className={cn(
                    "group relative flex items-start gap-3 rounded-lg border p-3 text-left transition-all",
                    i === activeIdx
                      ? "border-brass-500/50 bg-brass-500/5"
                      : "border-white/5 bg-background/40 hover:border-brass-500/30",
                    disabled && "opacity-60 cursor-not-allowed",
                  )}
                >
                  <div
                    className={cn(
                      "shrink-0 h-10 w-10 rounded-md grid place-items-center bg-gradient-to-br border border-white/10",
                      app.accent ?? "from-brass-500/20 to-brass-700/5",
                    )}
                  >
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-display text-sm truncate">{app.name}</div>
                      {disabled && (
                        <span className="chip bg-slate-500/15 text-slate-300 ring-slate-400/20 ring-1 ring-inset">
                          Soon
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {app.description}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              );
            })}
          </div>

          <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <span>↑ ↓ navigate · ↵ open</span>
            <span>esc to close</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
