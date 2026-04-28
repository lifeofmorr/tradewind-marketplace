import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { aiListingGenerator } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/categories";
import { setMeta } from "@/lib/seo";
import { slugify } from "@/lib/utils";
import type { ListingCategory } from "@/types/database";

const Schema = z.object({
  category: z.enum([
    "boat", "performance_boat", "yacht", "center_console",
    "car", "truck", "exotic", "classic", "powersports", "rv",
  ]),
  title: z.string().min(4, "Give it a real title"),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  price: z.coerce.number().positive("Set a price"),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  description: z.string().optional(),
  ai_summary: z.string().optional(),
});
type Values = z.infer<typeof Schema>;

export default function CreateListing() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiOk, setAiOk] = useState(false);
  const initialCategory = (params.get("category") as ListingCategory | null) ?? "boat";

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: { category: initialCategory },
  });
  const category = watch("category");
  useEffect(() => { setMeta({ title: "Create listing", description: "Add a new listing to TradeWind." }); }, []);

  async function generateWithAI() {
    if (!aiPrompt.trim()) {
      setAiError("Describe your vehicle in a sentence or two first.");
      return;
    }
    setAiLoading(true);
    setAiError(null);
    setAiOk(false);
    try {
      const res = await aiListingGenerator(aiPrompt.trim(), category);
      const d = res.draft;
      if (d.title) setValue("title", d.title, { shouldDirty: true, shouldValidate: true });
      if (d.description) setValue("description", d.description, { shouldDirty: true });
      if (d.ai_summary) setValue("ai_summary", d.ai_summary, { shouldDirty: true });
      if (d.make) setValue("make", d.make, { shouldDirty: true });
      if (d.model) setValue("model", d.model, { shouldDirty: true });
      if (d.year) setValue("year", d.year, { shouldDirty: true });
      if (d.city) setValue("city", d.city, { shouldDirty: true });
      if (d.state) setValue("state", d.state, { shouldDirty: true });
      if (d.suggested_price_cents) {
        setValue("price", Math.round(d.suggested_price_cents / 100), { shouldDirty: true });
      }
      setAiOk(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not generate. Try again.";
      setAiError(msg);
    } finally {
      setAiLoading(false);
    }
  }

  async function onSubmit(v: Values) {
    if (!user) return;
    setError(null);
    const slug = `${slugify(v.title)}-${Math.random().toString(36).slice(2, 8)}`;
    const sellerType = profile?.dealer_id ? "dealer" : "private";
    const { data, error: e } = await supabase
      .from("listings")
      .insert({
        slug,
        category: v.category,
        title: v.title,
        description: v.description || null,
        ai_summary: v.ai_summary || null,
        make: v.make || null,
        model: v.model || null,
        year: v.year ?? null,
        price_cents: Math.round(v.price * 100),
        currency: "USD",
        city: v.city || null,
        state: v.state ? v.state.toUpperCase() : null,
        seller_id: user.id,
        seller_type: sellerType,
        dealer_id: profile?.dealer_id ?? null,
        status: "draft",
      })
      .select("id")
      .maybeSingle();
    if (e || !data) { setError(e?.message ?? "Could not create listing"); return; }
    navigate(`/seller/listings/${(data as { id: string }).id}`, { replace: true });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">New listing</div>
        <h1 className="font-display text-3xl mt-1">Create a listing</h1>
        <p className="text-muted-foreground text-sm mt-1">You can add photos and polish details after.</p>
      </div>

      {/* AI Listing Assistant */}
      <div className="glass-card-elevated p-5 border-brass-500/30">
        <div className="flex items-center gap-2 text-brass-400">
          <Sparkles className="h-4 w-4" />
          <span className="font-mono text-xs uppercase tracking-[0.32em]">AI Listing Assistant</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Describe your vehicle in a few sentences and let AI write the listing — title, description, and key specs.
        </p>
        <div className="mt-3 grid gap-2">
          <Label htmlFor="ai-prompt" className="sr-only">AI prompt</Label>
          <Textarea
            id="ai-prompt"
            rows={3}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. 2022 Boston Whaler 320 Outrage with twin Mercury 300s, low hours, garage-kept in Naples FL. Recent service and electronics."
            disabled={aiLoading}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="btn-glow"
              onClick={() => { void generateWithAI(); }}
              disabled={aiLoading}
            >
              {aiLoading ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generating…</> : <><Sparkles className="h-3 w-3 mr-1" /> Generate with AI</>}
            </Button>
            {aiOk && !aiError && (
              <span className="text-xs text-emerald-400">Draft populated. Edit anything below before saving.</span>
            )}
            {aiError && (
              <span className="text-xs text-red-400 inline-flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> {aiError}
                <button type="button" className="underline ml-1" onClick={() => { void generateWithAI(); }}>Retry</button>
              </span>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-border bg-card p-6 grid gap-3" noValidate>
        <div>
          <Label>Category <span className="text-brass-400">*</span></Label>
          <Select value={category} onValueChange={(v) => setValue("category", v as ListingCategory)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="title">Title <span className="text-brass-400">*</span></Label>
          <Input id="title" placeholder="2022 Boston Whaler 320 Outrage" aria-invalid={!!errors.title} {...register("title")} />
          {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label htmlFor="make">Make</Label><Input id="make" {...register("make")} /></div>
          <div><Label htmlFor="model">Model</Label><Input id="model" {...register("model")} /></div>
          <div>
            <Label htmlFor="year">Year</Label>
            <Input id="year" type="number" min={1900} max={new Date().getFullYear() + 1} {...register("year")} />
            {errors.year && <p className="text-xs text-red-400 mt-1">{errors.year.message}</p>}
          </div>
        </div>
        <div>
          <Label htmlFor="price">Asking price (USD) <span className="text-brass-400">*</span></Label>
          <Input id="price" type="number" inputMode="numeric" min={1} step="any" aria-invalid={!!errors.price} {...register("price")} />
          {errors.price && <p className="text-xs text-red-400 mt-1">{errors.price.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label htmlFor="city">City</Label><Input id="city" autoComplete="address-level2" {...register("city")} /></div>
          <div><Label htmlFor="state">State</Label><Input id="state" maxLength={2} autoComplete="address-level1" placeholder="FL" {...register("state")} /></div>
        </div>
        <div><Label htmlFor="description">Description</Label><Textarea id="description" rows={6} placeholder="Trim, options, condition, recent service. Our AI will polish this into a listing." {...register("description")} /></div>
        <div><Label htmlFor="ai_summary">AI summary</Label><Textarea id="ai_summary" rows={3} placeholder="Short auto-generated highlight reel. Editable." {...register("ai_summary")} /></div>
        {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating…" : "Save as draft"}</Button>
      </form>
    </div>
  );
}
