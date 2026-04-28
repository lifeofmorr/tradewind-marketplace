import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarPicker } from "./Stars";
import { createNotification } from "@/hooks/useNotifications";

const Schema = z.object({
  rating: z.number().int().min(1, "Pick a rating").max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(10, "Tell others a bit more").max(4000),
});
type Values = z.infer<typeof Schema>;

interface Props {
  dealerId?: string;
  serviceProviderId?: string;
}

export function ReviewForm({ dealerId, serviceProviderId }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: { rating: 0 },
  });
  const rating = watch("rating");

  async function onSubmit(values: Values) {
    if (!user) { navigate("/login"); return; }
    setError(null);
    const { error: e } = await supabase.from("reviews").insert({
      reviewer_id: user.id,
      dealer_id: dealerId ?? null,
      service_provider_id: serviceProviderId ?? null,
      rating: values.rating,
      title: values.title || null,
      body: values.body || null,
      is_published: true,
    });
    if (e) { setError(e.message); return; }
    setDone(true);
    if (dealerId) void qc.invalidateQueries({ queryKey: ["reviews", "dealer", dealerId] });
    if (serviceProviderId) void qc.invalidateQueries({ queryKey: ["reviews", "sp", serviceProviderId] });

    // Notify the org owner. We look up the owner_id with a single query.
    void (async () => {
      const target = dealerId
        ? await supabase.from("dealers").select("owner_id, name").eq("id", dealerId).maybeSingle()
        : await supabase.from("service_providers").select("owner_id, name").eq("id", serviceProviderId!).maybeSingle();
      const row = target.data as { owner_id: string; name: string } | null;
      if (row?.owner_id) {
        await createNotification({
          user_id: row.owner_id,
          kind: "system",
          title: `New ${values.rating}-star review`,
          body: `${row.name} received a new review.`,
          link: dealerId ? `/dealers` : `/services`,
        });
      }
    })();
    setValue("rating", 0);
    setValue("title", "");
    setValue("body", "");
  }

  if (done) {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
        Thanks — your review is live.
        <button type="button" className="ml-3 underline" onClick={() => setDone(false)}>Write another</button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        <button type="button" className="text-brass-400" onClick={() => navigate("/login")}>Log in</button> to leave a review.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-border bg-card p-5 space-y-4">
      <div className="font-display text-lg">Write a review</div>
      <div>
        <Label className="block mb-2">Your rating</Label>
        <StarPicker value={rating} onChange={(n) => setValue("rating", n)} />
        {errors.rating && <p className="text-xs text-red-400 mt-1">{errors.rating.message}</p>}
      </div>
      <div>
        <Label htmlFor="title">Title (optional)</Label>
        <Input id="title" {...register("title")} />
      </div>
      <div>
        <Label htmlFor="body">Your review</Label>
        <Textarea id="body" rows={5} {...register("body")} />
        {errors.body && <p className="text-xs text-red-400 mt-1">{errors.body.message}</p>}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Posting…" : "Post review"}</Button>
    </form>
  );
}
