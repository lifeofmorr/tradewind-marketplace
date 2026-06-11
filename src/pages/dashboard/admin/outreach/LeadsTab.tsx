// Leads tab: filter bar + leads table — extracted verbatim from AdminOutreach.tsx.
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/EmptyState";
import { PRIORITIES, STATUSES, VERIFICATION_FILTERS, VERTICALS } from "./constants";
import {
  bouncedWarningBadge, priorityBadge, scoreBadge, statusBadge, todayIso,
  unverifiedWarningBadge, verificationBadge,
} from "./badges";
import type { OutreachLead } from "./types";

export function Filters(props: {
  search: string; setSearch: (s: string) => void;
  vertical: string; setVertical: (s: string) => void;
  status: string; setStatus: (s: string) => void;
  priorityFilter: string; setPriorityFilter: (s: string) => void;
  verificationFilter: string; setVerificationFilter: (s: string) => void;
  hideDnc: boolean; setHideDnc: (b: boolean) => void;
  shown: number; total: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <div>
        <Label htmlFor="search" className="text-xs">Search</Label>
        <Input id="search" value={props.search} onChange={(e) => props.setSearch(e.target.value)} placeholder="Company, contact, angle…" />
      </div>
      <div>
        <Label htmlFor="vertical" className="text-xs">Vertical</Label>
        <select id="vertical" value={props.vertical} onChange={(e) => props.setVertical(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
          {VERTICALS.map((v) => <option key={v} value={v}>{v === "all" ? "All verticals" : v}</option>)}
        </select>
      </div>
      <div>
        <Label htmlFor="status" className="text-xs">Status</Label>
        <select id="status" value={props.status} onChange={(e) => props.setStatus(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
          {STATUSES.map((s) => <option key={s} value={s}>{s === "all" ? "Any status" : s.replace(/_/g, " ")}</option>)}
        </select>
      </div>
      <div>
        <Label htmlFor="priority" className="text-xs">Priority</Label>
        <select id="priority" value={props.priorityFilter} onChange={(e) => props.setPriorityFilter(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
          {PRIORITIES.map((p) => <option key={p} value={p}>{p === "all" ? "Any priority" : `P=${p}`}</option>)}
        </select>
      </div>
      <div>
        <Label htmlFor="verification" className="text-xs">Verification</Label>
        <select id="verification" value={props.verificationFilter} onChange={(e) => props.setVerificationFilter(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
          {VERIFICATION_FILTERS.map((v) => (
            <option key={v} value={v}>{v === "all" ? "Any verification" : v.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>
      <div className="flex items-end gap-3">
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={props.hideDnc} onChange={(e) => props.setHideDnc(e.target.checked)} />
          Hide DNC
        </label>
        <p className="text-xs text-muted-foreground ml-auto">
          <span className="text-foreground font-mono">{props.shown}</span> / {props.total}
        </p>
      </div>
    </div>
  );
}

// ── leads table ──────────────────────────────────────────────────────────────

export function LeadsTable({ leads, loading, onOpen }: {
  leads: OutreachLead[];
  loading: boolean;
  onOpen: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 skeleton border-b border-border last:border-0" />
        ))}
      </div>
    );
  }
  if (leads.length === 0) {
    return (
      <EmptyState
        icon={Mail}
        title="No outreach leads"
        body="Add a lead manually, paste a CSV, or run today's queue once you have leads."
      />
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="text-left px-4 py-3">Company</th>
            <th className="text-left px-4 py-3">Vertical</th>
            <th className="text-left px-4 py-3">Priority</th>
            <th className="text-left px-4 py-3">Score</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-left px-4 py-3">Verification</th>
            <th className="text-left px-4 py-3">Next action</th>
            <th className="text-left px-4 py-3">Follow-up</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => {
            const followUpDue = l.follow_up_date &&
              l.follow_up_date <= todayIso() && !l.do_not_contact && l.status !== "replied";
            const v = l.email_verification_status ?? "unverified";
            const rowTone =
              v === "bounced" || v === "invalid" || v === "do_not_email"
                ? "bg-red-500/5"
                : v === "unverified"
                  ? "bg-secondary/30"
                  : "";
            return (
              <tr key={l.id} className={`border-t border-border hover:bg-secondary/40 ${rowTone}`}>
                <td className="px-4 py-3">
                  <div className="font-display">{l.company}</div>
                  <div className="text-xs text-muted-foreground">
                    {l.contact_name ?? "—"}{l.contact_role ? ` · ${l.contact_role}` : ""}
                  </div>
                  {(v === "bounced" || v === "unverified") && (
                    <div className="mt-1">
                      {v === "bounced" ? bouncedWarningBadge() : unverifiedWarningBadge()}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{l.vertical}</td>
                <td className="px-4 py-3">{priorityBadge(l.priority)}</td>
                <td className="px-4 py-3">{scoreBadge(l.lead_score)}</td>
                <td className="px-4 py-3">{statusBadge(l)}</td>
                <td className="px-4 py-3">{verificationBadge(l)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px] truncate">{l.next_action ?? "—"}</td>
                <td className="px-4 py-3 text-xs">
                  {l.follow_up_date ? (
                    <span className={followUpDue ? "text-brass-400 font-mono" : "text-muted-foreground font-mono"}>
                      {l.follow_up_date}
                    </span>
                  ) : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Button size="sm" variant="outline" onClick={() => onOpen(l.id)}>Open</Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
