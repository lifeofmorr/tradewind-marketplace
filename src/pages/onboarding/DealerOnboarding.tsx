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
import { setMeta } from "@/lib/seo";
import { slugify } from "@/lib/utils";

const Schema = z.object({
  name: z.string().min(2, "Dealer name required"),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  zip: z.string().optional(),
});
type Values = z.infer<typeof Schema>;

export default function DealerOnboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(Schema),
  });
  useEffect(() => { setMeta({ title: "Dealer onboarding", description: "Set up your dealership on TradeWind." }); }, []);

  async function onSubmit(v: Values) {
    if (!user) return;
    setError(null);
    const slug = `${slugify(v.name)}-${user.id.slice(0, 6)}`;
    const { data: dealer, error: e } = await supabase
      .from("dealers")
      .insert({
        owner_id: user.id,
        slug,
        name: v.name,
        description: v.description || null,
        website: v.website || null,
        phone: v.phone || null,
        email: v.email || null,
        city: v.city || null,
        state: v.state ? v.state.toUpperCase() : null,
        zip: v.zip || null,
      })
      .select("id")
      .maybeSingle();
    if (e || !dealer) { setError(e?.message ?? "Could not create dealer"); return; }
    const dealerId = (dealer as { id: string }).id;
    const { error: pErr } = await supabase.from("profiles").update({ dealer_id: dealerId }).eq("id", user.id);
    if (pErr) { setError(pErr.message); return; }
    const { error: sErr } = await supabase.from("dealer_staff").insert({
      dealer_id: dealerId, user_id: user.id, role: "owner",
    });
    if (sErr) { setError(sErr.message); return; }
    await refreshProfile();
    navigate("/dealer", { replace: true });
  }

  return (
    <div className="min-h-screen container-pad py-16 max-w-xl space-y-6">
      <div>
        <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">Dealer onboarding</div>
        <h1 className="font-display text-4xl mt-1">Set up your dealership</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          A complete profile attracts higher-intent buyers. Only the dealership name is required to continue —
          you can polish photos, hours, and bio from your dashboard later.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-border bg-card p-6 grid gap-3">
        <div>
          <Label htmlFor="name">Dealership name <span className="text-brass-400">*</span></Label>
          <Input id="name" autoComplete="organization" {...register("name")} />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="description">Description <span className="text-muted-foreground">(optional)</span></Label>
          <Textarea id="description" rows={3} placeholder="What you specialize in, your inventory focus, what makes you different." {...register("description")} />
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
            <Label htmlFor="email">Sales email <span className="text-muted-foreground">(optional)</span></Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label htmlFor="city">City</Label><Input id="city" autoComplete="address-level2" {...register("city")} /></div>
          <div><Label htmlFor="state">State</Label><Input id="state" maxLength={2} autoComplete="address-level1" placeholder="FL" {...register("state")} /></div>
          <div><Label htmlFor="zip">Zip</Label><Input id="zip" autoComplete="postal-code" {...register("zip")} /></div>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating…" : "Continue to dashboard"}</Button>
      </form>
    </div>
  );
}
