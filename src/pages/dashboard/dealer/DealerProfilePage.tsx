import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { setMeta } from "@/lib/seo";
import type { Dealer } from "@/types/database";

export default function DealerProfilePage() {
  const { profile } = useAuth();
  const dealerId = profile?.dealer_id ?? undefined;
  const qc = useQueryClient();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => { setMeta({ title: "Dealer · profile", description: "Edit your dealership profile." }); }, []);

  const { data: dealer, isLoading } = useQuery({
    queryKey: ["dealer", dealerId],
    enabled: !!dealerId,
    queryFn: async (): Promise<Dealer | null> => {
      if (!dealerId) return null;
      const { data, error } = await supabase.from("dealers").select("*").eq("id", dealerId).maybeSingle();
      if (error) throw error;
      return (data as Dealer | null) ?? null;
    },
  });

  async function patch(p: Partial<Dealer>) {
    if (!dealerId) return;
    setSaveError(null);
    const { error } = await supabase.from("dealers").update(p).eq("id", dealerId);
    if (error) {
      setSaveError(error.message);
      return;
    }
    setSavedAt(Date.now());
    void qc.invalidateQueries({ queryKey: ["dealer", dealerId] });
  }

  if (isLoading) return <div className="space-y-3 max-w-2xl"><div className="h-8 w-40 skeleton" /><div className="h-64 skeleton rounded-lg" /></div>;
  if (!dealer) return <div className="text-sm text-muted-foreground">No dealer record.</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Profile</h1>
        {saveError ? (
          <span className="text-xs text-red-400 font-mono" role="alert">save failed</span>
        ) : savedAt && Date.now() - savedAt < 2000 ? (
          <span className="text-xs text-emerald-400 font-mono">saved</span>
        ) : (
          <span className="text-xs text-muted-foreground font-mono">auto-saves on blur</span>
        )}
      </div>
      {saveError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300" role="alert">
          {saveError}
        </div>
      )}
      <section className="rounded-lg border border-border bg-card p-6 space-y-3">
        <div><Label>Name</Label><Input defaultValue={dealer.name} onBlur={(e) => { void patch({ name: e.target.value }); }} /></div>
        <div><Label>Description</Label><Textarea rows={4} defaultValue={dealer.description ?? ""} onBlur={(e) => { void patch({ description: e.target.value || null }); }} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Website</Label><Input defaultValue={dealer.website ?? ""} onBlur={(e) => { void patch({ website: e.target.value || null }); }} /></div>
          <div><Label>Phone</Label><Input defaultValue={dealer.phone ?? ""} onBlur={(e) => { void patch({ phone: e.target.value || null }); }} /></div>
        </div>
        <div><Label>Email</Label><Input defaultValue={dealer.email ?? ""} onBlur={(e) => { void patch({ email: e.target.value || null }); }} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label>City</Label><Input defaultValue={dealer.city ?? ""} onBlur={(e) => { void patch({ city: e.target.value || null }); }} /></div>
          <div><Label>State</Label><Input maxLength={2} defaultValue={dealer.state ?? ""} onBlur={(e) => { void patch({ state: e.target.value ? e.target.value.toUpperCase() : null }); }} /></div>
          <div><Label>Zip</Label><Input defaultValue={dealer.zip ?? ""} onBlur={(e) => { void patch({ zip: e.target.value || null }); }} /></div>
        </div>
      </section>
    </div>
  );
}
