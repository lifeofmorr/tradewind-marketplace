import { useEffect, useState, type ReactNode } from "react";
import { useForm, type UseFormRegister, type FieldErrors, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, type ZodType } from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { setMeta } from "@/lib/seo";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Fire-and-forget request_received email. Phase 2D.
 * Failures don't bubble up — the UI already showed success.
 */
function notify(kind: string, email: string): void {
  void supabase.functions.invoke("send-email", {
    body: { template: "request_received", to: email, props: { kind } },
  });
}

interface RequestShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

function RequestShell({ eyebrow, title, description, children }: RequestShellProps) {
  const isConcierge = eyebrow.toLowerCase() === "concierge";
  return (
    <div className={isConcierge ? "relative overflow-hidden" : ""}>
      {isConcierge && (
        <>
          <div aria-hidden className="pointer-events-none absolute inset-0 hero-glow" />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 right-1/4 h-72 w-72 rounded-full bg-brass-500/10 blur-3xl"
          />
        </>
      )}
      <div className="container-pad py-16 max-w-2xl space-y-6 relative">
        <header className="space-y-2">
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="font-display text-4xl">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
          <p className="text-[11px] text-muted-foreground/80 pt-2">
            Never send payment outside the platform. We screen every request before passing it on.
          </p>
        </header>
        <div className={isConcierge ? "glass-card-elevated p-6" : "glass-card p-6"}>{children}</div>
      </div>
    </div>
  );
}

interface FieldProps<T extends Record<string, unknown>> {
  id: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  type?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

function Field<T extends Record<string, unknown>>({ id, label, register, errors, type = "text", placeholder, rows }: FieldProps<T>) {
  const err = errors[id];
  return (
    <div>
      <Label htmlFor={String(id)}>{label}</Label>
      {rows
        ? <Textarea id={String(id)} rows={rows} placeholder={placeholder} {...register(id)} />
        : <Input id={String(id)} type={type} placeholder={placeholder} {...register(id)} />
      }
      {err && <p className="text-xs text-red-400 mt-1">{String(err.message)}</p>}
    </div>
  );
}

function Submitted({ kind }: { kind: string }) {
  return (
    <div className="text-center py-6">
      <div className="font-display text-2xl text-emerald-400">Submitted.</div>
      <p className="text-muted-foreground mt-2 text-sm">
        We routed your {kind} request to the right partner. You'll hear back via email shortly.
      </p>
    </div>
  );
}

// ─── Financing ───────────────────────────────────────────────────────────────

const FinancingSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  amount: z.coerce.number().positive("Loan amount required"),
  term_months: z.coerce.number().int().positive().optional(),
  state: z.string().max(2).optional(),
  notes: z.string().optional(),
});
type FinancingValues = z.infer<typeof FinancingSchema>;

export function Financing() {
  const { user } = useAuth();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FinancingValues>({
    resolver: zodResolver(FinancingSchema as ZodType<FinancingValues>),
  });
  useEffect(() => { setMeta({ title: "Financing", description: "Marine and auto financing through TradeWind partners." }); }, []);
  async function onSubmit(v: FinancingValues) {
    setError(null);
    const { error: e } = await supabase.from("financing_requests").insert({
      user_id: user?.id ?? null,
      full_name: v.full_name,
      email: v.email,
      phone: v.phone || null,
      amount_cents: Math.round(v.amount * 100),
      term_months: v.term_months ?? null,
      state: v.state || null,
      notes: v.notes || null,
    });
    if (e) setError(e.message);
    else { void notify("financing", v.email); setDone(true); }
  }
  return (
    <RequestShell eyebrow="Financing" title="Get pre-qualified." description="Marine and auto loans through licensed partners. Soft credit pull.">
      {done ? <Submitted kind="financing" /> : (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
          <Field<FinancingValues> id="full_name" label="Full name" register={register} errors={errors} />
          <Field<FinancingValues> id="email" label="Email" type="email" register={register} errors={errors} />
          <Field<FinancingValues> id="phone" label="Phone (optional)" type="tel" register={register} errors={errors} />
          <Field<FinancingValues> id="amount" label="Loan amount (USD)" type="number" register={register} errors={errors} />
          <Field<FinancingValues> id="term_months" label="Term (months)" type="number" register={register} errors={errors} />
          <Field<FinancingValues> id="state" label="State" placeholder="FL" register={register} errors={errors} />
          <Field<FinancingValues> id="notes" label="Anything else?" rows={3} register={register} errors={errors} />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting…" : "Get matched"}</Button>
        </form>
      )}
    </RequestShell>
  );
}

// ─── Insurance ───────────────────────────────────────────────────────────────

const InsuranceSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  asset_value: z.coerce.number().positive().optional(),
  asset_summary: z.string().optional(),
  state: z.string().max(2).optional(),
  notes: z.string().optional(),
});
type InsuranceValues = z.infer<typeof InsuranceSchema>;

export function Insurance() {
  const { user } = useAuth();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<InsuranceValues>({
    resolver: zodResolver(InsuranceSchema as ZodType<InsuranceValues>),
  });
  useEffect(() => { setMeta({ title: "Insurance", description: "Insurance quotes for boats, cars, exotics, and RVs." }); }, []);
  async function onSubmit(v: InsuranceValues) {
    setError(null);
    const { error: e } = await supabase.from("insurance_requests").insert({
      user_id: user?.id ?? null,
      full_name: v.full_name,
      email: v.email,
      phone: v.phone || null,
      asset_value_cents: v.asset_value != null ? Math.round(v.asset_value * 100) : null,
      asset_summary: v.asset_summary || null,
      state: v.state || null,
      notes: v.notes || null,
    });
    if (e) setError(e.message);
    else { void notify("insurance", v.email); setDone(true); }
  }
  return (
    <RequestShell eyebrow="Insurance" title="Get a quote." description="Coverage for boats, cars, exotics, and RVs from vetted carriers.">
      {done ? <Submitted kind="insurance" /> : (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
          <Field<InsuranceValues> id="full_name" label="Full name" register={register} errors={errors} />
          <Field<InsuranceValues> id="email" label="Email" type="email" register={register} errors={errors} />
          <Field<InsuranceValues> id="phone" label="Phone (optional)" type="tel" register={register} errors={errors} />
          <Field<InsuranceValues> id="asset_value" label="Asset value (USD)" type="number" register={register} errors={errors} />
          <Field<InsuranceValues> id="asset_summary" label="What are we insuring?" rows={3} register={register} errors={errors} />
          <Field<InsuranceValues> id="state" label="State" placeholder="FL" register={register} errors={errors} />
          <Field<InsuranceValues> id="notes" label="Notes" rows={3} register={register} errors={errors} />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting…" : "Get a quote"}</Button>
        </form>
      )}
    </RequestShell>
  );
}

// ─── Inspections ─────────────────────────────────────────────────────────────

const InspectionSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  zip: z.string().optional(),
  preferred_date: z.string().optional(),
  notes: z.string().optional(),
});
type InspectionValues = z.infer<typeof InspectionSchema>;

export function Inspections() {
  const { user } = useAuth();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<InspectionValues>({
    resolver: zodResolver(InspectionSchema as ZodType<InspectionValues>),
  });
  useEffect(() => { setMeta({ title: "Inspections", description: "Surveyors and PPI for boats and autos." }); }, []);
  async function onSubmit(v: InspectionValues) {
    setError(null);
    const { error: e } = await supabase.from("inspection_requests").insert({
      user_id: user?.id ?? null,
      full_name: v.full_name,
      email: v.email,
      phone: v.phone || null,
      location: v.location || null,
      city: v.city || null,
      state: v.state || null,
      zip: v.zip || null,
      preferred_date: v.preferred_date || null,
      notes: v.notes || null,
    });
    if (e) setError(e.message);
    else { void notify("inspection", v.email); setDone(true); }
  }
  return (
    <RequestShell eyebrow="Inspections" title="Book an inspection." description="Independent surveyors and pre-purchase inspectors near the boat or car.">
      {done ? <Submitted kind="inspection" /> : (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
          <Field<InspectionValues> id="full_name" label="Full name" register={register} errors={errors} />
          <Field<InspectionValues> id="email" label="Email" type="email" register={register} errors={errors} />
          <Field<InspectionValues> id="phone" label="Phone (optional)" type="tel" register={register} errors={errors} />
          <Field<InspectionValues> id="location" label="Where is it located?" register={register} errors={errors} />
          <div className="grid grid-cols-3 gap-3">
            <Field<InspectionValues> id="city" label="City" register={register} errors={errors} />
            <Field<InspectionValues> id="state" label="State" register={register} errors={errors} />
            <Field<InspectionValues> id="zip" label="Zip" register={register} errors={errors} />
          </div>
          <Field<InspectionValues> id="preferred_date" label="Preferred date" type="date" register={register} errors={errors} />
          <Field<InspectionValues> id="notes" label="Notes" rows={3} register={register} errors={errors} />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting…" : "Request inspection"}</Button>
        </form>
      )}
    </RequestShell>
  );
}

// ─── Transport ───────────────────────────────────────────────────────────────

const TransportSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  pickup_zip: z.string().optional(),
  dropoff_zip: z.string().optional(),
  asset_length_ft: z.coerce.number().optional(),
  asset_summary: z.string().optional(),
  preferred_date: z.string().optional(),
  notes: z.string().optional(),
});
type TransportValues = z.infer<typeof TransportSchema>;

export function Transport() {
  const { user } = useAuth();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TransportValues>({
    resolver: zodResolver(TransportSchema as ZodType<TransportValues>),
  });
  useEffect(() => { setMeta({ title: "Transport", description: "Door-to-door boat and auto transport." }); }, []);
  async function onSubmit(v: TransportValues) {
    setError(null);
    const { error: e } = await supabase.from("transport_requests").insert({
      user_id: user?.id ?? null,
      full_name: v.full_name,
      email: v.email,
      phone: v.phone || null,
      pickup_zip: v.pickup_zip || null,
      dropoff_zip: v.dropoff_zip || null,
      asset_length_ft: v.asset_length_ft ?? null,
      asset_summary: v.asset_summary || null,
      preferred_date: v.preferred_date || null,
      notes: v.notes || null,
    });
    if (e) setError(e.message);
    else { void notify("transport", v.email); setDone(true); }
  }
  return (
    <RequestShell eyebrow="Transport" title="Get it shipped." description="Coast-to-coast haulers and yacht delivery captains, vetted.">
      {done ? <Submitted kind="transport" /> : (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
          <Field<TransportValues> id="full_name" label="Full name" register={register} errors={errors} />
          <Field<TransportValues> id="email" label="Email" type="email" register={register} errors={errors} />
          <Field<TransportValues> id="phone" label="Phone (optional)" type="tel" register={register} errors={errors} />
          <div className="grid grid-cols-2 gap-3">
            <Field<TransportValues> id="pickup_zip" label="Pickup zip" register={register} errors={errors} />
            <Field<TransportValues> id="dropoff_zip" label="Drop-off zip" register={register} errors={errors} />
          </div>
          <Field<TransportValues> id="asset_length_ft" label="Length (ft)" type="number" register={register} errors={errors} />
          <Field<TransportValues> id="asset_summary" label="What are we moving?" rows={3} register={register} errors={errors} />
          <Field<TransportValues> id="preferred_date" label="Preferred date" type="date" register={register} errors={errors} />
          <Field<TransportValues> id="notes" label="Notes" rows={3} register={register} errors={errors} />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting…" : "Request transport"}</Button>
        </form>
      )}
    </RequestShell>
  );
}

// ─── Concierge ───────────────────────────────────────────────────────────────

const ConciergeSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  budget_min: z.coerce.number().nonnegative().optional(),
  budget_max: z.coerce.number().nonnegative().optional(),
  desired_summary: z.string().min(10, "Tell us what you're after"),
  timeline: z.string().optional(),
});
type ConciergeValues = z.infer<typeof ConciergeSchema>;

export function Concierge() {
  const { user } = useAuth();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ConciergeValues>({
    resolver: zodResolver(ConciergeSchema as ZodType<ConciergeValues>),
  });
  useEffect(() => { setMeta({ title: "Concierge", description: "Tell us what you want — we source it." }); }, []);
  async function onSubmit(v: ConciergeValues) {
    setError(null);
    const { error: e } = await supabase.from("concierge_requests").insert({
      user_id: user?.id ?? null,
      full_name: v.full_name,
      email: v.email,
      phone: v.phone || null,
      budget_min_cents: v.budget_min != null ? Math.round(v.budget_min * 100) : null,
      budget_max_cents: v.budget_max != null ? Math.round(v.budget_max * 100) : null,
      desired_summary: v.desired_summary,
      timeline: v.timeline || null,
    });
    if (e) setError(e.message);
    else { void notify("concierge", v.email); setDone(true); }
  }
  return (
    <RequestShell
      eyebrow="Concierge"
      title="Tell us what you want."
      description="An expert sources, vets, and lines up logistics — end-to-end. Flat $499 engagement, fully refundable if we can't find your match."
    >
      {done ? <Submitted kind="concierge" /> : (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
          <Field<ConciergeValues> id="full_name" label="Full name" register={register} errors={errors} />
          <Field<ConciergeValues> id="email" label="Email" type="email" register={register} errors={errors} />
          <Field<ConciergeValues> id="phone" label="Phone (optional)" type="tel" register={register} errors={errors} />
          <div className="grid grid-cols-2 gap-3">
            <Field<ConciergeValues> id="budget_min" label="Budget min (USD)" type="number" register={register} errors={errors} />
            <Field<ConciergeValues> id="budget_max" label="Budget max (USD)" type="number" register={register} errors={errors} />
          </div>
          <Field<ConciergeValues> id="desired_summary" label="What are you after?" rows={4} register={register} errors={errors} />
          <Field<ConciergeValues> id="timeline" label="Timeline" placeholder="ASAP / 30 days / spring 2026" register={register} errors={errors} />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting…" : "Submit to concierge"}</Button>
        </form>
      )}
    </RequestShell>
  );
}
