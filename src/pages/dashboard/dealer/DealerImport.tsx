import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Upload, FileSpreadsheet, Check, Loader2, FileDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { setMeta } from "@/lib/seo";
import {
  IMPORT_FIELDS, autoMap, mapRows, parseCsv, slugify,
  type ImportField, type ParsedCsv,
} from "@/lib/csvImport";
import { CsvImportPreview } from "@/components/dealer/CsvImportPreview";

const TEMPLATE_HEADERS = [
  "category", "title", "make", "model", "year", "price",
  "city", "state", "vin_or_hin", "mileage", "hours", "length_ft", "description",
];
const TEMPLATE_CSV =
  TEMPLATE_HEADERS.join(",") + "\n" +
  `boat,2022 Boston Whaler 320 Outrage,Boston Whaler,320 Outrage,2022,389000,Naples,FL,BWXX1234X122,,180,32,"Twin Mercury 300s, low hours"\n` +
  `car,2021 Audi RS6 Avant,Audi,RS6 Avant,2021,129500,Miami,FL,WUAR4BF24MN901234,18500,,,"Nardo Grey, ceramic brakes"\n`;

interface Result { imported: number; skipped: number; errors: number; logId?: string }

export default function DealerImport() {
  const { user, profile } = useAuth();
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [mapping, setMapping] = useState<Partial<Record<ImportField, number>>>({});
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    setMeta({ title: "Dealer · inventory import", description: "Upload your inventory as a CSV." });
  }, []);

  const mapResult = useMemo(() => {
    if (!parsed) return null;
    return mapRows(parsed, mapping);
  }, [parsed, mapping]);

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "tradewind-inventory-template.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name); setParseError(null); setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const p = parseCsv(text);
      if (p.headers.length === 0) {
        setParseError("File looks empty or unreadable.");
        setParsed(null); return;
      }
      setParsed(p);
      setMapping(autoMap(p.headers));
    };
    reader.onerror = () => setParseError("Could not read that file.");
    reader.readAsText(file);
  }

  async function runImport() {
    if (!user || !profile?.dealer_id || !mapResult || !fileName) return;
    setImporting(true);
    const { data: log } = await supabase.from("import_logs").insert({
      dealer_id: profile.dealer_id,
      filename: fileName,
      total_rows: parsed?.rows.length ?? 0,
      status: "processing",
    }).select().single();
    const dealerId = profile.dealer_id;
    const inserts = mapResult.ok.map((row) => ({
      slug: `${slugify(row.title)}-${Math.random().toString(36).slice(2, 8)}`,
      category: row.category,
      title: row.title,
      description: row.description,
      make: row.make, model: row.model, year: row.year,
      price_cents: row.price_cents, currency: "USD",
      vin_or_hin: row.vin_or_hin,
      mileage: row.mileage, hours: row.hours, length_ft: row.length_ft,
      city: row.city, state: row.state,
      seller_type: "dealer" as const,
      seller_id: user.id,
      dealer_id: dealerId,
      status: "draft" as const,
    }));
    const { error: insErr, count } = await supabase
      .from("listings").insert(inserts, { count: "exact" });
    const imported = insErr ? 0 : count ?? inserts.length;
    const skipped = mapResult.errors.length;
    const errors = insErr ? inserts.length : 0;
    if (log) {
      await supabase.from("import_logs").update({
        imported, skipped, errors,
        status: insErr ? "failed" : "completed",
      }).eq("id", log.id);
    }
    setResult({ imported, skipped, errors, logId: log?.id });
    setImporting(false);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <div className="eyebrow">Dealer · import</div>
        <h1 className="section-title">Inventory import</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Upload your DMS CSV. We auto-detect columns; review the mapping, then import as drafts.
          Or <a className="underline" href="mailto:dealers@gotradewind.com">email us</a> for a hands-on concierge migration.
        </p>
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

      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div>
          <Label htmlFor="csv-file">CSV file</Label>
          <Input id="csv-file" type="file" accept=".csv,text/csv" onChange={onFileChange} />
          {parseError && <p className="text-xs text-red-400 mt-1">{parseError}</p>}
        </div>

        {parsed && (
          <>
            <div>
              <div className="font-display text-sm mb-2">Field mapping</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {IMPORT_FIELDS.map((field) => (
                  <label key={field} className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-muted-foreground w-24 shrink-0">{field}</span>
                    <select
                      className="flex-1 rounded border border-border bg-secondary/30 px-2 py-1"
                      value={mapping[field] ?? ""}
                      onChange={(e) => setMapping((m) => ({ ...m, [field]: e.target.value === "" ? undefined : Number(e.target.value) }))}
                    >
                      <option value="">— none —</option>
                      {parsed.headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                    </select>
                  </label>
                ))}
              </div>
            </div>

            <CsvImportPreview parsed={parsed} mapping={mapping} />

            {mapResult && mapResult.errors.length > 0 && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200">
                <div className="flex items-center gap-1.5 font-mono mb-1"><AlertTriangle className="h-3 w-3" /> {mapResult.errors.length} row{mapResult.errors.length === 1 ? "" : "s"} will be skipped</div>
                <ul className="space-y-0.5 max-h-24 overflow-y-auto">
                  {mapResult.errors.slice(0, 6).map((e, i) => <li key={i}>row {e.row}: {e.reason}</li>)}
                  {mapResult.errors.length > 6 && <li>…and {mapResult.errors.length - 6} more</li>}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button disabled={importing || !mapResult || mapResult.ok.length === 0 || !profile?.dealer_id} onClick={() => { void runImport(); }}>
                {importing ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Importing…</> : <><Upload className="h-3 w-3 mr-1" /> Import {mapResult?.ok.length ?? 0} listings as drafts</>}
              </Button>
              {!profile?.dealer_id && <span className="text-xs text-muted-foreground">Complete dealer onboarding to import.</span>}
            </div>
          </>
        )}

        {result && (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
            <div className="flex items-center gap-2 text-emerald-300 font-display"><Check className="h-4 w-4" /> Import complete</div>
            <ul className="mt-2 text-xs text-muted-foreground space-y-0.5">
              <li>Imported: <span className="font-mono text-emerald-300">{result.imported}</span></li>
              <li>Skipped: <span className="font-mono">{result.skipped}</span></li>
              {result.errors > 0 && <li>Errors: <span className="font-mono text-red-300">{result.errors}</span></li>}
            </ul>
            <p className="text-xs text-muted-foreground mt-2">New listings landed as drafts in your inventory — review and publish from there.</p>
          </div>
        )}
      </div>
    </div>
  );
}

