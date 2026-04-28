import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BRAND } from "@/lib/brand";
import { setMeta } from "@/lib/seo";

const Schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password too short"),
});
type Values = z.infer<typeof Schema>;

interface LocationState { from?: string }

export default function Login() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(Schema),
  });

  useEffect(() => {
    setMeta({ title: "Log in", description: `Sign in to your ${BRAND.name} account.` });
  }, []);

  useEffect(() => {
    if (user) {
      const state = location.state as LocationState | null;
      navigate(state?.from ?? "/", { replace: true });
    }
  }, [user, navigate, location.state]);

  async function onSubmit(values: Values) {
    setError(null);
    try {
      await signIn(values.email, values.password);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-12 bg-navy-950 border-r border-border">
        <Link to="/" className="font-display text-2xl">{BRAND.name}<span className="text-brass-400">.</span></Link>
        <div>
          <h2 className="font-display text-4xl leading-tight">Welcome back.</h2>
          <p className="text-muted-foreground mt-3">{BRAND.tagline}</p>
        </div>
        <div className="text-xs font-mono text-muted-foreground">© {new Date().getFullYear()} {BRAND.name}</div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="font-display text-3xl">Log in</h1>
            <p className="text-sm text-muted-foreground mt-1">No account? <Link to="/signup" className="text-brass-400">Sign up</Link></p>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
            </div>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
