import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Upload, FileSpreadsheet, Mail, Check, Loader2, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { setMeta } from "@/lib/seo";

const TEMPLATE_HEADERS = [
  "category", "title", "make", "model", "year", "price",
  "city", "state", "vin_or_hin", "mileage_or_hours", "description",
];

const TEMPLATE_CSV =
  TEMPLATE_HEADERS.join(",") + "\n" +
  `boat,2022 Boston Whaler 320 Outrage,Boston Whaler,320 Outrage,2022,389000,Naples,FL,BWXX1234X122,180,"Twin Mercury 300s, low hours, garage-kept"\n` +
  `car,2021 Audi RS6 Avant,Audi,RS6 Avant,2021,129500,Miami,FL,WUAR4BF24MN901234,18500,"Nardo Grey, ceramic brakes, full service history"\n`;

export default function DealerImport() {
  const { user, profile } = useAuth();
  const [fileName, setFileName] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setMeta({
      title: "Dealer · inventory import",
      description: "Upload your inventory as a CSV — we handle the migration.",
    });
  }, []);

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tradewind-inventory-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setParseError("File looks empty — needs at least a header row + one data row.");
        setRowCount(0);
        return;
      }
      const header = lines[0].toLowerCase();
      const missing = TEMPLATE_HEADERS.filter((h) => !header.includes(h));
      if (missing.length > 0) {
        setParseError(`Missing required columns: ${missing.join(", ")}.`);
        setRowCount(0);
        return;
      }
      setRowCount(lines.length - 1);
    };
    reader.onerror = () => setParseError("Could not read that file.");
    reader.readAsText(file);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!rowCount || rowCount === 0) {
      setSubmitError("Upload a valid CSV first.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const noteBody = [
      `CSV: ${fileName ?? "(unnamed)"} — ${rowCount} row${rowCount === 1 ? "" : "s"}`,
      profile?.dealer_id ? `Dealer ID: ${profile.dealer_id}` : "Dealer ID: (none on profile)",
      notes.trim() ? `Notes: ${notes.trim()}` : null,
    ].filter(Boolean).join("\n");

    const { error } = await supabase.from("integration_requests").insert({
      user_id: user.id,
      integration_key: "inventory_csv_import",
      integration_name: "Dealer Inventory CSV Import",
      category: "Dealer Tools",
      notes: noteBody,
    });
    setSubmitting(false);
    if (error) {
      setSubmitError(error.message);
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <div className="eyebrow">Dealer · import</div>
        <h1 className="section-title">Inventory import</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Drop in your DMS export and our concierge team migrates the listings, photos,
          and pricing into your TradeWind dealership. Most dealers are live within 48 hours.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Step n={1} title="Download template" body="Grab the CSV format we accept — same columns as most DMS exports." />
        <Step n={2} title="Map your inventory" body="Open in Excel or Sheets, fill in your active inventory, save as .csv." />
        <Step n={3} title="Submit" body="Upload + a quick note. We'll reply within one business day." />
      </div>

      <div className="rounded-lg border border-border bg-card p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-5 w-5 text-brass-400" />
          <div>
            <div className="font-display">tradewind-inventory-template.csv</div>
            <p className="text-xs text-muted-foreground">{TEMPLATE_HEADERS.length} columns · sample rows included</p>
          </div>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <FileDown className="h-3 w-3 mr-1" /> Download template
        </Button>
      </div>

      {submitted ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-6">
          <div className="flex items-center gap-2 text-emerald-300 font-display">
            <Check className="h-5 w-5" /> Import request submitted
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Thanks — our concierge team has been notified. Expect a reply at{" "}
            <span className="font-mono text-foreground">{profile?.email}</span> within one business day.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div>
            <Label htmlFor="csv-file">CSV file</Label>
            <Input id="csv-file" type="file" accept=".csv,text/csv" onChange={onFileChange} />
            {fileName && rowCount !== null && !parseError && (
              <p className="text-xs text-emerald-400 mt-1">
                {fileName} — {rowCount} row{rowCount === 1 ? "" : "s"} ready to import.
              </p>
            )}
            {parseError && <p className="text-xs text-red-400 mt-1">{parseError}</p>}
          </div>
          <div>
            <Label htmlFor="csv-notes">Anything we should know? (optional)</Label>
            <Textarea
              id="csv-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              placeholder="e.g. brand split across two CSVs, photo links in column N, etc."
            />
          </div>
          {submitError && <p className="text-xs text-red-400" role="alert">{submitError}</p>}
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={submitting || !rowCount || rowCount === 0}>
              {submitting ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Submitting…</> : <><Upload className="h-3 w-3 mr-1" /> Submit for migration</>}
            </Button>
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
              <Mail className="h-3 w-3" /> or email <a className="underline" href="mailto:dealers@gotradewind.com">dealers@gotradewind.com</a>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="h-6 w-6 rounded-full grid place-items-center bg-brass-500/15 text-brass-300 text-xs font-display">{n}</span>
        <span className="font-display text-sm">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{body}</p>
    </div>
  );
}
