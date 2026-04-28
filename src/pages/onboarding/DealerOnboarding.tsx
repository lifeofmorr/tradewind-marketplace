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
        <div className="font-mono text-xs uppercase tracking-[0.32em] text-brass-400">Step 1 of 1</div>
        <h1 className="font-display text-4xl mt-1">Set up your dealership</h1>
        <p className="text-muted-foreground mt-2 text-sm">You can edit any of this later.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-border bg-card p-6 grid gap-3">
        <div><Label htmlFor="name">Dealership name</Label><Input id="name" {...register("name")} />{errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}</div>
        <div><Label htmlFor="description">Description</Label><Textarea id="description" rows={3} {...register("description")} /></div>
        <div><Label htmlFor="website">Website</Label><Input id="website" type="url" placeholder="https://" {...register("website")} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label htmlFor="phone">Phone</Label><Input id="phone" {...register("phone")} /></div>
          <div><Label htmlFor="email">Email</Label><Input id="email" type="email" {...register("email")} /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label htmlFor="city">City</Label><Input id="city" {...register("city")} /></div>
          <div><Label htmlFor="state">State</Label><Input id="state" maxLength={2} {...register("state")} /></div>
          <div><Label htmlFor="zip">Zip</Label><Input id="zip" {...register("zip")} /></div>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating…" : "Continue"}</Button>
      </form>
    </div>
  );
}
