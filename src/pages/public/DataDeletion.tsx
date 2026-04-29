import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Mail, Loader2, Check } from "lucide-react";
import { setMeta } from "@/lib/seo";
import { BRAND } from "@/lib/brand";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function DataDeletion() {
  const { user, profile } = useAuth();
  const [email, setEmail] = useState(profile?.email ?? "");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMeta({
      title: "Delete my data",
      description: `Request deletion of your ${BRAND.name} account and personal data.`,
    });
  }, []);

  useEffect(() => {
    if (profile?.email && !email) setEmail(profile.email);
  }, [profile, email]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required so we can verify the request.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: insertError } = await supabase
      .from("data_deletion_requests")
      .insert({
        user_id: user?.id ?? null,
        email: email.trim().toLowerCase(),
        reason: reason.trim() || null,
      });
    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setSubmitted(true);
  }

  return (
    <section className="container-pad py-16 max-w-2xl">
      <div className="inline-flex items-center gap-2 text-brass-400 mb-3">
        <ShieldCheck className="h-4 w-4" />
        <span className="font-mono text-xs uppercase tracking-[0.32em]">Privacy</span>
      </div>
      <h1 className="font-display text-4xl">Delete my data</h1>
      <p className="mt-3 text-muted-foreground">
        Submit this form to permanently delete your {BRAND.name} account and the personal
        data we hold about you. We acknowledge requests within 5 business days and complete
        them within 30 days. Listings you've sold and aggregated marketplace analytics are
        retained per our <Link to="/privacy" className="underline">Privacy Policy</Link>.
      </p>

      {submitted ? (
        <div className="mt-8 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-6">
          <div className="flex items-center gap-2 text-emerald-300 font-display">
            <Check className="h-5 w-5" /> Request received
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            We've logged your request. Our privacy team will email{" "}
            <span className="font-mono text-foreground">{email}</span> with a confirmation
            and any verification steps required.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 rounded-lg border border-border bg-card p-6 space-y-4">
          <div>
            <Label htmlFor="dd-email">Email on the account <span className="text-brass-400">*</span></Label>
            <Input
              id="dd-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="dd-reason">Reason (optional)</Label>
            <Textarea
              id="dd-reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Helps us improve. Skip if you'd rather not."
              maxLength={1000}
            />
          </div>
          {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
          <Button type="submit" disabled={submitting}>
            {submitting ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Sending…</> : "Submit deletion request"}
          </Button>
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5 pt-2 border-t border-border">
            <Mail className="h-3 w-3" />
            Prefer to email? Send your request to <a className="underline ml-1" href="mailto:privacy@gotradewind.com">privacy@gotradewind.com</a>.
          </p>
        </form>
      )}
    </section>
  );
}
