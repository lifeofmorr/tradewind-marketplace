import { useEffect, useState } from "react";
import { Bell, BellRing, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/categories";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { ListingCategory } from "@/types/database";

interface WatchPrefs {
  category: ListingCategory | "any";
  state: string;
  priceMax: string;
  priceDropAlerts: boolean;
  newListingAlerts: boolean;
  locationAlerts: boolean;
  emailAlerts: boolean; // coming soon — locked off
  updatedAt: string | null;
}

const DEFAULTS: WatchPrefs = {
  category: "any",
  state: "",
  priceMax: "",
  priceDropAlerts: true,
  newListingAlerts: true,
  locationAlerts: false,
  emailAlerts: false,
  updatedAt: null,
};

const STORAGE_PREFIX = "tw:watchlist:";

export function WatchlistCard() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<WatchPrefs>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + user.id);
      if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, [user]);

  function update<K extends keyof WatchPrefs>(key: K, value: WatchPrefs[K]) {
    setPrefs((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  function save() {
    if (!user) return;
    const next = { ...prefs, updatedAt: new Date().toISOString() };
    try {
      localStorage.setItem(STORAGE_PREFIX + user.id, JSON.stringify(next));
      setPrefs(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
  }

  return (
    <div className="rounded-xl border border-brass-500/30 bg-gradient-to-br from-brass-500/[0.06] via-card to-card p-5">
      <div className="flex items-center gap-2">
        <BellRing className="h-4 w-4 text-brass-400" />
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-brass-400">Watchlist</span>
      </div>
      <h3 className="mt-2 font-display text-xl">Set up alerts</h3>
      <p className="text-xs text-muted-foreground mt-1">
        Tell us what you're hunting and we'll surface matches in your dashboard.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="watch-category">Category</Label>
          <Select value={prefs.category} onValueChange={(v) => update("category", v as WatchPrefs["category"])}>
            <SelectTrigger id="watch-category"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any category</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="watch-state">State (optional)</Label>
          <Input
            id="watch-state"
            placeholder="e.g. FL"
            maxLength={2}
            value={prefs.state}
            onChange={(e) => update("state", e.target.value.toUpperCase())}
          />
        </div>
      </div>

      <div className="mt-3">
        <Label htmlFor="watch-price">Max price (USD, optional)</Label>
        <Input
          id="watch-price"
          type="number"
          min={0}
          placeholder="e.g. 250000"
          value={prefs.priceMax}
          onChange={(e) => update("priceMax", e.target.value)}
        />
      </div>

      <fieldset className="mt-4 rounded-lg border border-border bg-secondary/20 p-3">
        <legend className="px-1 text-xs font-mono uppercase tracking-wider text-muted-foreground">Alert me about</legend>
        <div className="space-y-2">
          <Toggle
            label="Price drops on saved listings"
            checked={prefs.priceDropAlerts}
            onChange={(v) => update("priceDropAlerts", v)}
          />
          <Toggle
            label="New listings in this category"
            checked={prefs.newListingAlerts}
            onChange={(v) => update("newListingAlerts", v)}
          />
          <Toggle
            label="Listings near my location"
            checked={prefs.locationAlerts}
            onChange={(v) => update("locationAlerts", v)}
          />
          <Toggle
            label="Email me when alerts fire"
            checked={prefs.emailAlerts}
            onChange={(v) => update("emailAlerts", v)}
            disabled
            badge="Coming soon"
            icon={<Mail className="h-3.5 w-3.5" />}
          />
        </div>
      </fieldset>

      <div className="mt-4 flex items-center gap-2">
        <Button size="sm" onClick={save} disabled={!user}>
          {saved ? <><Check className="h-3 w-3 mr-1" /> Saved</> : <><Bell className="h-3 w-3 mr-1" /> Save alerts</>}
        </Button>
        {prefs.updatedAt && (
          <span className="text-[11px] font-mono text-muted-foreground">
            Last saved {new Date(prefs.updatedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground/80">
        Beta: preferences save locally in this browser. Cross-device sync ships with email alerts.
      </p>
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  badge?: string;
  icon?: React.ReactNode;
}

function Toggle({ label, checked, onChange, disabled, badge, icon }: ToggleProps) {
  return (
    <label className={cn(
      "flex items-center justify-between gap-3 text-sm rounded-md px-2 py-1.5",
      disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-secondary/40",
    )}>
      <span className="inline-flex items-center gap-2">
        {icon}
        {label}
        {badge && (
          <span className="chip ring-1 ring-inset bg-slate-500/15 text-slate-300 ring-slate-400/20 text-[9px]">
            {badge}
          </span>
        )}
      </span>
      <input
        type="checkbox"
        className="h-4 w-4 accent-[hsl(var(--ring))]"
        checked={checked && !disabled}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
