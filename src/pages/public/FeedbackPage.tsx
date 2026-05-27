import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, type ZodType } from "zod";
import { MessageSquare, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { setMeta } from "@/lib/seo";
import { BRAND } from "@/lib/brand";
import {
  trackEvent,
  captureAttribution,
  readAttribution,
} from "@/lib/trackEvent";

const FeedbackSchema = z.object({
  name: z.string().min(2, "Tell us your name"),
  email: z.string().email("A valid email helps us reply"),
  company: z.string().optional(),
  role: z.string().optional(),
  vertical: z.enum([
    "marine_dealer",
    "yacht_broker",
    "auto_dealer",
    "aircraft_broker",
    "service_provider",
    "lender",
    "insurance",
    "escrow",
    "transport",
    "buyer",
    "other",
  ]),
  tested: z.string().optional(),
  useful: z.string().optional(),
  confusing: z.string().optional(),
  beta_partner: z.enum(["yes", "no", "maybe"]),
  feedback_call: z.enum(["yes", "no", "maybe"]),
});
type FeedbackValues = z.infer<typeof FeedbackSchema>;

const VERTICAL_OPTIONS: { value: FeedbackValues["vertical"]; label: string }[] = [
  { value: "marine_dealer", label: "Marine dealer" },
  { value: "yacht_broker", label: "Yacht broker" },
  { value: "auto_dealer", label: "Auto / specialty dealer" },
  { value: "aircraft_broker", label: "Aircraft broker" },
  { value: "service_provider", label: "Service provider (survey / inspection / repair / detail)" },
  { value: "lender", label: "Lender" },
  { value: "insurance", label: "Insurance" },
  { value: "escrow", label: "Escrow" },
  { value: "transport", label: "Transport" },
  { value: "buyer", label: "Buyer" },
  { value: "other", label: "Other" },
];

function Submitted() {
  return (
    <div className="text-center py-10">
      <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
      <div className="font-display text-2xl mt-4">Appreciate it — got it.</div>
      <p className="text-muted-foreground mt-3 text-sm max-w-lg mx-auto leading-relaxed">
        I'll review this personally. If it looks like a strong beta fit, I'll
        follow up with a few times for a quick 10-minute walkthrough.
      </p>
      <p className="text-xs text-muted-foreground/70 mt-4 max-w-md mx-auto">
        — Don Morrison, founder
      </p>
    </div>
  );
}

export default function FeedbackPage() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackValues>({
    resolver: zodResolver(FeedbackSchema as ZodType<FeedbackValues>),
    defaultValues: { beta_partner: "maybe", feedback_call: "maybe", vertical: "buyer" },
  });

  useEffect(() => {
    setMeta({
      title: "Feedback & beta access",
      description: `Send ${BRAND.name} product feedback or request beta access.`,
      ogType: "website",
    });
    // Capture attribution if the visitor landed directly on /feedback
    // from an outreach link (otherwise sessionStorage already has it
    // from BetaPage). Merge — never overwrite.
    captureAttribution();
  }, []);

  async function onSubmit(v: FeedbackValues) {
    setError(null);
    const attr = readAttribution();
    const payload = {
      name: v.name,
      email: v.email,
      company: v.company || null,
      role: v.role || null,
      vertical: v.vertical,
      tested: v.tested || null,
      useful: v.useful || null,
      confusing: v.confusing || null,
      beta_partner: v.beta_partner,
      feedback_call: v.feedback_call,
      // Hidden attribution fields — populated from sessionStorage /
      // URL params (set by BetaPage or by direct outreach links).
      lead_id: attr.lead_id ?? null,
      utm_source: attr.utm_source ?? null,
      utm_medium: attr.utm_medium ?? null,
      utm_campaign: attr.utm_campaign ?? null,
      utm_term: attr.utm_term ?? null,
      utm_content: attr.utm_content ?? null,
      referrer: attr.referrer ?? (typeof document !== "undefined" ? document.referrer || null : null),
      landing_page:
        attr.landing_page ??
        (typeof window !== "undefined" ? window.location.href : null),
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    };
    const { error: e } = await supabase.from("beta_feedback").insert(payload);
    if (e) {
      setError(e.message);
      return;
    }
    // Legacy event name preserved for any existing dashboards; new
    // canonical event name is `feedback_submitted`.
    trackEvent("feedback_submit", {
      vertical: v.vertical,
      beta_partner: v.beta_partner,
      feedback_call: v.feedback_call,
    });
    trackEvent("feedback_submitted", {
      vertical: v.vertical,
      beta_partner: v.beta_partner,
      feedback_call: v.feedback_call,
      has_lead_id: !!attr.lead_id,
    });
    setDone(true);
  }

  return (
    <div className="container-pad py-16 max-w-2xl space-y-6">
      <header className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 text-brass-400">
          <MessageSquare className="h-4 w-4" />
          <span className="font-mono text-xs uppercase tracking-[0.32em]">Feedback</span>
        </div>
        <h1 className="font-display text-4xl">Tell us what you think.</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Beta access requests, product feedback, and 10-minute call requests all come
          through this form. Two minutes is enough.
        </p>
      </header>

      <div className="glass-card p-6">
        {done ? (
          <Submitted />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Your name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="company">Company (optional)</Label>
                <Input id="company" {...register("company")} />
              </div>
              <div>
                <Label htmlFor="role">Role (optional)</Label>
                <Input id="role" placeholder="Owner, broker, buyer, …" {...register("role")} />
              </div>
            </div>

            <div>
              <Label htmlFor="vertical">What best describes you?</Label>
              <select
                id="vertical"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...register("vertical")}
              >
                {VERTICAL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="tested">What did you test or look at?</Label>
              <Textarea
                id="tested"
                rows={3}
                placeholder="Browsing listings, creating a listing, sending a buyer request, the deal room, …"
                {...register("tested")}
              />
            </div>

            <div>
              <Label htmlFor="useful">What felt useful?</Label>
              <Textarea id="useful" rows={3} {...register("useful")} />
            </div>

            <div>
              <Label htmlFor="confusing">What felt confusing or missing?</Label>
              <Textarea id="confusing" rows={3} {...register("confusing")} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="beta_partner">Would you test as a beta partner?</Label>
                <select
                  id="beta_partner"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...register("beta_partner")}
                >
                  <option value="yes">Yes</option>
                  <option value="maybe">Maybe — tell me more</option>
                  <option value="no">Not right now</option>
                </select>
              </div>
              <div>
                <Label htmlFor="feedback_call">Open to a 10-minute call?</Label>
                <select
                  id="feedback_call"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...register("feedback_call")}
                >
                  <option value="yes">Yes</option>
                  <option value="maybe">Maybe</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <Button type="submit" disabled={isSubmitting} size="lg" className="btn-glow">
              {isSubmitting ? "Sending…" : "Send to TradeWind"}
            </Button>
            <p className="text-[11px] text-muted-foreground/80">
              We use this only to follow up on your feedback. No marketing list.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
