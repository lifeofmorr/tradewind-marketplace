// Add-lead dialog form — extracted verbatim from AdminOutreach.tsx.
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VERTICALS } from "./constants";

export function AddLeadForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    company: "", contact_name: "", contact_role: "", vertical: "Boat Dealer",
    email: "", phone: "", website: "", linkedin_url: "", instagram_url: "",
    location: "", lead_source: "", personalization_angle: "",
    pain_point: "", recommended_offer: "", notes: "",
    priority: 3, lead_score: 3,
  });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setErr(null);
    if (!form.company.trim()) { setErr("Company is required"); return; }
    if (!form.vertical) { setErr("Vertical is required"); return; }
    setBusy(true);
    const payload = {
      company: form.company.trim(),
      contact_name: form.contact_name.trim() || null,
      contact_role: form.contact_role.trim() || null,
      vertical: form.vertical,
      email: form.email.trim().toLowerCase() || null,
      phone: form.phone.trim() || null,
      website: form.website.trim() || null,
      linkedin_url: form.linkedin_url.trim() || null,
      instagram_url: form.instagram_url.trim() || null,
      location: form.location.trim() || null,
      lead_source: form.lead_source.trim() || null,
      personalization_angle: form.personalization_angle.trim() || null,
      pain_point: form.pain_point.trim() || null,
      recommended_offer: form.recommended_offer.trim() || null,
      notes: form.notes.trim() || null,
      priority: form.priority,
      lead_score: form.lead_score,
      status: "new",
    };
    const { error } = await supabase.from("outreach_leads").insert(payload);
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    onSaved();
    onClose();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add lead</DialogTitle>
        <DialogDescription>One row in outreach_leads. Required: Company + Vertical.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-1">
        {err && <div role="alert" className="text-xs text-red-400">{err}</div>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Company *" value={form.company} onChange={(v) => update("company", v)} />
          <div>
            <Label className="text-xs">Vertical *</Label>
            <select value={form.vertical} onChange={(e) => update("vertical", e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {VERTICALS.filter((v) => v !== "all").map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <Field label="Contact name" value={form.contact_name} onChange={(v) => update("contact_name", v)} />
          <Field label="Role" value={form.contact_role} onChange={(v) => update("contact_role", v)} />
          <Field label="Email" value={form.email} onChange={(v) => update("email", v)} />
          <Field label="Phone" value={form.phone} onChange={(v) => update("phone", v)} />
          <Field label="Website" value={form.website} onChange={(v) => update("website", v)} />
          <Field label="LinkedIn URL" value={form.linkedin_url} onChange={(v) => update("linkedin_url", v)} />
          <Field label="Instagram URL" value={form.instagram_url} onChange={(v) => update("instagram_url", v)} />
          <Field label="Location" value={form.location} onChange={(v) => update("location", v)} />
          <Field label="Lead source" value={form.lead_source} onChange={(v) => update("lead_source", v)} />
          <div>
            <Label className="text-xs">Priority (1–5)</Label>
            <Input type="number" min={1} max={5} value={form.priority}
              onChange={(e) => update("priority", Math.max(1, Math.min(5, Number(e.target.value) || 3)))} />
          </div>
          <div>
            <Label className="text-xs">Lead score (1–5)</Label>
            <Input type="number" min={1} max={5} value={form.lead_score}
              onChange={(e) => update("lead_score", Math.max(1, Math.min(5, Number(e.target.value) || 3)))} />
          </div>
        </div>
        <div>
          <Label className="text-xs">Personalization angle</Label>
          <Textarea rows={2} value={form.personalization_angle}
            onChange={(e) => update("personalization_angle", e.target.value)}
            placeholder="One specific thing about this business worth mentioning." />
        </div>
        <div>
          <Label className="text-xs">Pain point</Label>
          <Textarea rows={2} value={form.pain_point} onChange={(e) => update("pain_point", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Recommended offer</Label>
          <Textarea rows={2} value={form.recommended_offer} onChange={(e) => update("recommended_offer", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Notes</Label>
          <Textarea rows={2} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button onClick={() => void save()} disabled={busy}>{busy ? "Saving…" : "Save lead"}</Button>
      </DialogFooter>
    </>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
