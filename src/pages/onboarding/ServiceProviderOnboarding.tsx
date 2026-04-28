import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { setMeta } from "@/lib/seo";
import { slugify } from "@/lib/utils";
import type { ServiceCategory } from "@/types/database";

const CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: "marine_mechanic", label: "Marine mechanic" },
  { value: "auto_mechanic", label: "Auto mechanic" },
  { value: "detailer", label: "Detailer" },
  { value: "transport", label: "Transport" },
  { value: "inspector_surveyor", label: "Inspector / Surveyor" },
  { value: "insurance_agent", label: "Insurance agent" },
  { value: "lender", label: "Lender" },
  { value: "storage", label: "Storage" },
  { value: "marina", label: "Marina" },
  { value: "wrap_shop", label: "Wrap shop" },
  { value: "audio_shop", label: "Audio shop" },
  { value: "performance_shop", label: "Performance shop" },
  { value: "dock_service", label: "Dock service" },
];

const Schema = z.object({
  name: z.string().min(2, "Business name required"),
  category: z.enum([
    "marine_mechanic", "auto_mechanic", "detailer", "transport",
    "inspector_surveyor", "insurance_agent", "lender", "storage",
    "marina", "wrap_shop", "audio_shop", "performance_shop", "dock_service",
  ]),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
});
type Values = z.infer<typeof Schema>;

export default function ServiceProviderOnboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: { category: "marine_mechanic" },
  });
  const category = watch("category");
  useEffect(() => { setMeta({ title: "Service provider onboarding", description: "Set up your service business on TradeWind." }); }, []);

  async function onSubmit(v: Values) {
    if (!user) return;
    setError(null);
    const slug = `${slugify(v.name)}-${user.id.slice(0, 6)}`;
    const { data: provider, error: e } = await supabase
      .from("service_providers")
      .insert({
        owner_id: user.id,
        slug,
        name: v.name,
        category: v.category,
        description: v.description || null,
        website: v.website || null,
        phone: v.phone || null,
        email: v.email || null,
        city: v.city || null,
        state: v.state ? v.state.toUpperCase() : null,
      })
      .select("id")
      .maybeSingle();
    if (e || !provider) { setError(e?.message ?? "Could not create provider"); return; }
    const providerId = (provider as { id: string }).id;
    const { error: pErr } = await supabase.from("profiles").update({ service_provider_id: providerId }).eq("id", user.id);
    if (pErr) { setError(pErr.message); return; }
    await refreshProfile();
    navigate("/service", { replace: true });
  }

  return (
    <div className="min-h-screen container-pad py-16 max-w-xl space-y-6">
      <div>
        <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">Service partner onboarding</div>
        <h1 className="font-display text-4xl mt-1">Set up your service business</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Buyers find you through your category and region. Get your profile up to start receiving routed
          requests — only the business name and category are required.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-border bg-card p-6 grid gap-3">
        <div>
          <Label htmlFor="name">Business name <span className="text-brass-400">*</span></Label>
          <Input id="name" autoComplete="organization" {...register("name")} />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label>Primary category <span className="text-brass-400">*</span></Label>
          <Select value={category} onValueChange={(v) => setValue("category", v as ServiceCategory)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="description">Description <span className="text-muted-foreground">(optional)</span></Label>
          <Textarea id="description" rows={3} placeholder="What you do, areas served, certifications, response time." {...register("description")} />
        </div>
        <div>
          <Label htmlFor="website">Website <span className="text-muted-foreground">(optional)</span></Label>
          <Input id="website" type="url" placeholder="https://" autoComplete="url" {...register("website")} />
          {errors.website && <p className="text-xs text-red-400 mt-1">{errors.website.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="phone">Phone <span className="text-muted-foreground">(optional)</span></Label>
            <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
          </div>
          <div>
            <Label htmlFor="email">Email <span className="text-muted-foreground">(optional)</span></Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label htmlFor="city">City</Label><Input id="city" autoComplete="address-level2" {...register("city")} /></div>
          <div><Label htmlFor="state">State</Label><Input id="state" maxLength={2} placeholder="FL" autoComplete="address-level1" {...register("state")} /></div>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating…" : "Continue to dashboard"}</Button>
      </form>
    </div>
  );
}
