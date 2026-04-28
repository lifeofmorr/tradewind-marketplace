import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Listing } from "@/types/database";

const Schema = z.object({
  buyer_name: z.string().min(2, "Name required"),
  buyer_email: z.string().email("Valid email required"),
  buyer_phone: z.string().optional(),
  message: z.string().min(10, "Tell the seller what you're after"),
});
type FormValues = z.infer<typeof Schema>;

interface Props { listing: Listing }

export function InquiryForm({ listing }: Props) {
  const { user, profile } = useAuth();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      buyer_name: profile?.full_name ?? "",
      buyer_email: profile?.email ?? "",
      buyer_phone: profile?.phone ?? "",
      message: `Hi — I'm interested in your ${listing.year ?? ""} ${listing.title}. Is it still available?`.trim(),
    },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    const { error: insertError } = await supabase.from("inquiries").insert({
      listing_id: listing.id,
      seller_id: listing.seller_id,
      dealer_id: listing.dealer_id,
      buyer_id: user?.id ?? null,
      buyer_name: values.buyer_name,
      buyer_email: values.buyer_email,
      buyer_phone: values.buyer_phone || null,
      message: values.message,
      source: "listing_form",
    });
    if (insertError) {
      setError(insertError.message);
      return;
    }
    // Seller notification is sent server-side by the inquiry-fraud-check
    // edge function (Phase 2A) after AI screening, so we don't double-email
    // on spam.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm">
        <div className="font-display text-lg text-emerald-400">Message sent.</div>
        <p className="text-muted-foreground mt-1">The seller will be in touch via email.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 glass-card p-6">
      <div className="font-display text-lg">Contact seller</div>
      <p className="text-[11px] text-muted-foreground/80 -mt-2">
        Never send payment outside the platform. Verify title and HIN/VIN before any deposit.
      </p>
      <div className="grid gap-3">
        <div>
          <Label htmlFor="buyer_name">Name</Label>
          <Input id="buyer_name" {...register("buyer_name")} />
          {errors.buyer_name && <p className="text-xs text-red-400 mt-1">{errors.buyer_name.message}</p>}
        </div>
        <div>
          <Label htmlFor="buyer_email">Email</Label>
          <Input id="buyer_email" type="email" {...register("buyer_email")} />
          {errors.buyer_email && <p className="text-xs text-red-400 mt-1">{errors.buyer_email.message}</p>}
        </div>
        <div>
          <Label htmlFor="buyer_phone">Phone (optional)</Label>
          <Input id="buyer_phone" type="tel" {...register("buyer_phone")} />
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" rows={5} {...register("message")} />
          {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message.message}</p>}
        </div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Sending…" : "Send inquiry"}
      </Button>
    </form>
  );
}
