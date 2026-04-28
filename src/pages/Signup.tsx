import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { BRAND } from "@/lib/brand";
import { setMeta } from "@/lib/seo";
import type { UserRole } from "@/types/database";

const SIGNUP_ROLES: { value: Exclude<UserRole, "admin" | "dealer_staff">; label: string }[] = [
  { value: "buyer", label: "Buyer (browse + save)" },
  { value: "seller", label: "Seller (private listings)" },
  { value: "dealer", label: "Dealer (multi-listing inventory)" },
  { value: "service_provider", label: "Service provider" },
];

const Schema = z.object({
  full_name: z.string().min(2, "Name required"),
  email: z.string().email(),
  password: z.string().min(8, "At least 8 characters"),
  role: z.enum(["buyer", "seller", "dealer", "service_provider"]),
});
type Values = z.infer<typeof Schema>;

export default function Signup() {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: { role: "buyer" },
  });
  const role = watch("role");

  useEffect(() => {
    setMeta({ title: "Sign up", description: `Create your ${BRAND.name} account.` });
  }, []);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  async function onSubmit(values: Values) {
    setError(null);
    try {
      await signUp(values.email, values.password, values.full_name, values.role);
      setSubmittedEmail(values.email);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Sign-up failed");
    }
  }

  if (submittedEmail) {
    return (
      <div className="min-h-screen grid place-items-center p-8">
        <div className="max-w-sm text-center space-y-3">
          <h1 className="font-display text-3xl">Check your email.</h1>
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link to <span className="font-mono text-foreground">{submittedEmail}</span>.
            Click it to activate your account, then sign in.
          </p>
          <Button asChild variant="outline"><Link to="/login">Back to log in</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-12 bg-navy-950 border-r border-border">
        <Link to="/" className="font-display text-2xl">{BRAND.name}<span className="text-brass-400">.</span></Link>
        <div>
          <h2 className="font-display text-4xl leading-tight">Join the marketplace.</h2>
          <p className="text-muted-foreground mt-3">{BRAND.tagline}</p>
        </div>
        <div className="text-xs font-mono text-muted-foreground">© {new Date().getFullYear()} {BRAND.name}</div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="font-display text-3xl">Create account</h1>
            <p className="text-sm text-muted-foreground mt-1">Already have one? <Link to="/login" className="text-brass-400">Log in</Link></p>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" autoComplete="name" {...register("full_name")} />
              {errors.full_name && <p className="text-xs text-red-400 mt-1">{errors.full_name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <Label>I am a…</Label>
              <Select value={role} onValueChange={(v) => setValue("role", v as Values["role"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SIGNUP_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create account"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            By continuing you agree to our <Link to="/terms" className="text-brass-400">terms</Link> and <Link to="/privacy" className="text-brass-400">privacy</Link>.
          </p>
        </form>
      </div>
    </div>
  );
}
