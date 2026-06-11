// Page-chrome widgets (KPI tile, daily-cap indicator, compliance banner) —
// extracted verbatim from AdminOutreach.tsx.
import { AlertTriangle, ShieldCheck } from "lucide-react";

export function DailyCapIndicator({ sentToday, cap, hit }: { sentToday: number; cap: number; hit: boolean }) {
  const tone = hit ? "border-red-500/40 bg-red-500/10 text-red-200" : "border-brass-500/30 bg-brass-500/5 text-brass-200";
  return (
    <div className={`rounded-md border ${tone} px-4 py-2 text-xs flex items-center gap-3`}>
      <span className="uppercase tracking-wider text-[10px] text-muted-foreground">Daily limit</span>
      <span className="font-mono text-sm">
        {sentToday} / {cap}
      </span>
      <span className="text-muted-foreground">sent today</span>
      {hit && (
        <span className="ml-auto flex items-center gap-1 text-red-300">
          <AlertTriangle className="h-3 w-3" /> Cap reached — approvals disabled until midnight
        </span>
      )}
    </div>
  );
}

export function ComplianceBanner() {
  // CAN-SPAM requires a physical postal address on commercial email. The server
  // (build-daily-queue) hard-blocks email scaling until BUSINESS_MAILING_ADDRESS
  // is set; this mirrors that state for the operator using the public client var.
  const mailingAddress = (import.meta.env.VITE_BUSINESS_MAILING_ADDRESS ?? "").trim();
  const canSpamReady = mailingAddress.length > 0;

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 text-brass-400 mt-0.5 shrink-0" />
        <div>
          <div className="font-medium text-foreground">Outreach compliance</div>
          Outreach uses public business contacts only. No auto-sending. All messages require approval.
          Opt-out is respected immediately, follow-ups stop on negative replies, and DNC leads are excluded from queues.
        </div>
      </div>

      {canSpamReady ? (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <span className="font-medium">CAN-SPAM ready.</span> Email footers carry a physical
            postal address and an opt-out line. Address: <span className="font-mono">{mailingAddress}</span>
          </div>
        </div>
      ) : (
        <div role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-300 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <span className="font-medium">CAN-SPAM: mailing address not set.</span> Email outreach
            scaling is blocked until <span className="font-mono">BUSINESS_MAILING_ADDRESS</span> (server)
            and <span className="font-mono">VITE_BUSINESS_MAILING_ADDRESS</span> (client) are configured.
            See OUTREACH_CAN_SPAM_READINESS.md.
          </div>
        </div>
      )}
    </div>
  );
}

export function Kpi({
  label,
  value,
  highlight,
  tone,
  suffix,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  tone?: "good" | "warn" | "bad";
  suffix?: string;
}) {
  const toneClasses =
    tone === "good"
      ? "border-emerald-500/40 bg-emerald-500/5"
      : tone === "warn"
        ? "border-brass-500/40 bg-brass-500/5"
        : tone === "bad"
          ? "border-red-500/40 bg-red-500/5"
          : highlight
            ? "border-brass-500/40 bg-brass-500/5"
            : "border-border";
  const valueColor =
    tone === "good"
      ? "text-emerald-300"
      : tone === "warn"
        ? "text-brass-400"
        : tone === "bad"
          ? "text-red-300"
          : "";
  return (
    <div className={`rounded-md border ${toneClasses} px-3 py-2`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-mono text-lg ${valueColor}`}>
        {value}
        {suffix ?? ""}
      </div>
    </div>
  );
}
