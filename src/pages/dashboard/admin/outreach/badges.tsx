// Lead badge helpers + date utilities — extracted verbatim from AdminOutreach.tsx.
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { OutreachLead } from "./types";

export function scoreBadge(score: number) {
  if (score === 5) return <Badge variant="accent">Score 5</Badge>;
  if (score === 4) return <Badge variant="good">Score 4</Badge>;
  if (score === 3) return <Badge>Score 3</Badge>;
  return <Badge variant="bad">Score {score}</Badge>;
}

export function priorityBadge(p: number) {
  if (p >= 5) return <Badge variant="accent">P1</Badge>;
  if (p === 4) return <Badge variant="good">P2</Badge>;
  if (p === 3) return <Badge>P3</Badge>;
  return <Badge variant="bad">P{6 - p}</Badge>;
}

export function statusBadge(lead: OutreachLead) {
  if (lead.do_not_contact) return <Badge variant="bad">DNC</Badge>;
  if (lead.status === "bounced") return <Badge variant="bad">Bounced</Badge>;
  if (lead.beta_invited) return <Badge variant="accent">Beta invited</Badge>;
  if (lead.demo_booked) return <Badge variant="accent">Demo booked</Badge>;
  if (lead.status === "replied") return <Badge variant="good">Replied</Badge>;
  if (lead.status === "contacted") return <Badge variant="good">Contacted</Badge>;
  if (lead.status === "sent") return <Badge>Sent</Badge>;
  if (lead.status === "approved") return <Badge variant="accent">Approved</Badge>;
  if (lead.status === "drafted") return <Badge>Draft</Badge>;
  if (lead.status === "send_ready")
    return <Badge variant="good" title="Verified email — safe to draft and queue">Send ready</Badge>;
  if (lead.status === "needs_review")
    return <Badge variant="accent" title="Email pattern-inferred — confirm before send">Needs review</Badge>;
  if (lead.status === "non_email_channel")
    return <Badge title="No public email — use LinkedIn / contact form / phone">Non-email</Badge>;
  return <Badge>New</Badge>;
}

export function verificationBadge(lead: OutreachLead) {
  const v = lead.email_verification_status ?? "unverified";
  switch (v) {
    case "verified":
      return <Badge variant="good" title="Address replied or paid-verified">Verified</Badge>;
    case "likely_valid":
      return <Badge variant="good" title="Published on the company's own website">Likely valid</Badge>;
    case "bounced":
      return <Badge variant="bad" title="Previously bounced — do not resend">Bounced</Badge>;
    case "invalid":
      return <Badge variant="bad" title="Known-invalid address">Invalid</Badge>;
    case "do_not_email":
      return <Badge variant="bad" title="Opted out or compliance hold">Do not email</Badge>;
    default:
      return <Badge variant="accent" title="Unverified — manual approval required before send">Unverified</Badge>;
  }
}

export function bouncedWarningBadge() {
  return (
    <Badge variant="bad" className="gap-1" title="This address bounced previously. Do not resend.">
      <AlertTriangle className="h-3 w-3" /> Previously bounced — do not resend
    </Badge>
  );
}

export function unverifiedWarningBadge() {
  return (
    <Badge variant="accent" className="gap-1" title="Unverified address — manual approval required before send.">
      <AlertTriangle className="h-3 w-3" /> Unverified — manual approval required
    </Badge>
  );
}

export function todayIso() { return new Date().toISOString().slice(0, 10); }
export function daysFromNow(n: number) { return new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10); }
