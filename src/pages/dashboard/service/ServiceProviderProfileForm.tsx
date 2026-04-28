import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { setMeta } from "@/lib/seo";
import type { ServiceProvider } from "@/types/database";

export default function ServiceProviderProfileForm() {
  const { profile } = useAuth();
  const spId = profile?.service_provider_id ?? undefined;
  const qc = useQueryClient();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => { setMeta({ title: "Service · profile", description: "Edit your service business profile." }); }, []);

  const { data: provider, isLoading } = useQuery({
    queryKey: ["service-provider", spId],
    enabled: !!spId,
    queryFn: async (): Promise<ServiceProvider | null> => {
      if (!spId) return null;
      const { data, error } = await supabase.from("service_providers").select("*").eq("id", spId).maybeSingle();
      if (error) throw error;
      return (data as ServiceProvider | null) ?? null;
    },
  });

  async function patch(p: Partial<ServiceProvider>) {
    if (!spId) return;
    const { error } = await supabase.from("service_providers").update(p).eq("id", spId);
    if (!error) {
      setSavedAt(Date.now());
      void qc.invalidateQueries({ queryKey: ["service-provider", spId] });
    }
  }

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!provider) return <div className="text-sm text-muted-foreground">No provider record.</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Profile</h1>
        {savedAt && Date.now() - savedAt < 2000 && <span className="text-xs text-emerald-400 font-mono">saved</span>}
      </div>
      <section className="rounded-lg border border-border bg-card p-6 space-y-3">
        <div><Label>Name</Label><Input defaultValue={provider.name} onBlur={(e) => { void patch({ name: e.target.value }); }} /></div>
        <div><Label>Description</Label><Textarea rows={4} defaultValue={provider.description ?? ""} onBlur={(e) => { void patch({ description: e.target.value || null }); }} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Website</Label><Input defaultValue={provider.website ?? ""} onBlur={(e) => { void patch({ website: e.target.value || null }); }} /></div>
          <div><Label>Phone</Label><Input defaultValue={provider.phone ?? ""} onBlur={(e) => { void patch({ phone: e.target.value || null }); }} /></div>
        </div>
        <div><Label>Email</Label><Input defaultValue={provider.email ?? ""} onBlur={(e) => { void patch({ email: e.target.value || null }); }} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>City</Label><Input defaultValue={provider.city ?? ""} onBlur={(e) => { void patch({ city: e.target.value || null }); }} /></div>
          <div><Label>State</Label><Input maxLength={2} defaultValue={provider.state ?? ""} onBlur={(e) => { void patch({ state: e.target.value ? e.target.value.toUpperCase() : null }); }} /></div>
        </div>
      </section>
    </div>
  );
}
