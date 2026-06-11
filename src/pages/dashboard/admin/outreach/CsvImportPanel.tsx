// CSV import dialog — extracted verbatim from AdminOutreach.tsx.
import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  previewOutreachCsv,
  type ImportPreview,
  type ParsedLead,
} from "@/lib/outreach/csvImport";

export function CsvImportPanel({ existingEmails, onClose, onImported }: {
  existingEmails: Set<string>;
  onClose: () => void;
  onImported: () => void;
}) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const t = (reader.result as string) || "";
      setText(t);
      setPreview(previewOutreachCsv(t, existingEmails));
    };
    reader.readAsText(file);
  }

  function parseFromText() {
    setPreview(previewOutreachCsv(text, existingEmails));
  }

  async function doImport(rows: ParsedLead[]) {
    if (rows.length === 0) return;
    setBusy(true);
    setResult(null);
    const chunks: ParsedLead[][] = [];
    for (let i = 0; i < rows.length; i += 100) chunks.push(rows.slice(i, i + 100));
    let inserted = 0;
    let failed = 0;
    for (const chunk of chunks) {
      const { error } = await supabase.from("outreach_leads").insert(
        chunk.map((r) => ({ ...r, status: "new", priority: 3, lead_score: 3 })),
      );
      if (error) failed += chunk.length;
      else inserted += chunk.length;
    }
    setBusy(false);
    setResult(`Imported ${inserted}, failed ${failed}.`);
    if (inserted > 0) onImported();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>CSV import</DialogTitle>
        <DialogDescription>
          Columns: Company, Contact, Role, Vertical, Email, Phone, Website, LinkedIn, Instagram, Location, Lead Source, Notes.
          Required: Company + Vertical.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-1">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-3 w-3" /> Choose CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <Button size="sm" variant="outline" onClick={parseFromText} disabled={!text.trim()}>Parse pasted CSV</Button>
        </div>
        <Textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder="Or paste CSV here…" />

        {preview && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              <span className="text-emerald-400">{preview.ok.length}</span> ok ·{" "}
              <span className="text-amber-400">{preview.duplicates.length}</span> duplicates ·{" "}
              <span className="text-red-400">{preview.errors.length}</span> errors
            </div>
            {preview.errors.length > 0 && (
              <details className="text-xs text-red-300">
                <summary className="cursor-pointer">Errors ({preview.errors.length})</summary>
                <ul className="ml-4 list-disc">
                  {preview.errors.slice(0, 30).map((e) => <li key={e.row}>row {e.row}: {e.reason}</li>)}
                </ul>
              </details>
            )}
            {preview.duplicates.length > 0 && (
              <details className="text-xs text-amber-300">
                <summary className="cursor-pointer">Duplicates ({preview.duplicates.length})</summary>
                <ul className="ml-4 list-disc">
                  {preview.duplicates.slice(0, 30).map((d) => <li key={d.row}>row {d.row}: {d.reason}</li>)}
                </ul>
              </details>
            )}
            {preview.ok.length > 0 && (
              <div className="overflow-x-auto rounded border border-border max-h-64">
                <table className="w-full text-xs">
                  <thead className="bg-secondary text-muted-foreground">
                    <tr>
                      <th className="text-left px-2 py-1">Company</th>
                      <th className="text-left px-2 py-1">Contact</th>
                      <th className="text-left px-2 py-1">Vertical</th>
                      <th className="text-left px-2 py-1">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.ok.slice(0, 20).map((r, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-2 py-1">{r.company}</td>
                        <td className="px-2 py-1">{r.contact_name ?? "—"}</td>
                        <td className="px-2 py-1">{r.vertical}</td>
                        <td className="px-2 py-1">{r.email ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.ok.length > 20 && <div className="px-2 py-1 text-muted-foreground">… and {preview.ok.length - 20} more</div>}
              </div>
            )}
          </div>
        )}

        {result && <div className="text-xs text-emerald-400">{result}</div>}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={busy}>Close</Button>
        <Button onClick={() => void doImport(preview?.ok ?? [])} disabled={busy || !preview?.ok.length}>
          {busy ? "Importing…" : `Import ${preview?.ok.length ?? 0}`}
        </Button>
      </DialogFooter>
    </>
  );
}
