import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export type ReportTargetType = "listing" | "message" | "post" | "user" | "review" | "inquiry";

const REASONS: { value: string; label: string }[] = [
  { value: "suspicious", label: "Suspicious listing" },
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "scam", label: "Scam / fraud" },
  { value: "other", label: "Other" },
];

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
  className?: string;
  variant?: "icon" | "inline";
}

export function ReportButton({
  targetType,
  targetId,
  className,
  variant = "inline",
}: ReportButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("suspicious");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function reset() {
    setReason("suspicious");
    setDetails("");
    setError(null);
    setSubmitting(false);
    setSubmitted(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || submitting) return;
    setError(null);
    setSubmitting(true);
    const { error: insertError } = await supabase.from("reports").insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason,
      details: details.trim() || null,
    });
    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setSubmitted(true);
  }

  const trigger =
    variant === "icon" ? (
      <button
        type="button"
        title="Report"
        aria-label="Report"
        className={cn(
          "inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
          className,
        )}
      >
        <Flag className="h-4 w-4" />
      </button>
    ) : (
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors",
          className,
        )}
      >
        <Flag className="h-3.5 w-3.5" />
        Report
      </button>
    );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this {targetType}</DialogTitle>
          <DialogDescription>
            Reports go to our moderation team. We review every submission and
            take action on policy violations.
          </DialogDescription>
        </DialogHeader>
        {!user ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You need to be signed in to report content.
            </p>
            <DialogFooter>
              <Button asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            </DialogFooter>
          </div>
        ) : submitted ? (
          <div className="space-y-4">
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
              <div className="font-display text-emerald-300">Report submitted.</div>
              <p className="text-emerald-200/80 mt-1">
                Thanks — a moderator will review this within 24 hours.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Close</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="report-reason">Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="report-reason">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-details">
                Details <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="report-details"
                rows={4}
                maxLength={1000}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Anything else our moderators should know?"
              />
            </div>
            {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                  </>
                ) : (
                  "Submit report"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
