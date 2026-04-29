import type { ImportField, ParsedCsv } from "@/lib/csvImport";

interface Props {
  parsed: ParsedCsv;
  mapping: Partial<Record<ImportField, number>>;
}

const COLS: ImportField[] = ["title", "category", "price", "make", "model", "year"];

export function CsvImportPreview({ parsed, mapping }: Props) {
  const sample = parsed.rows.slice(0, 10);
  return (
    <div className="rounded-md border border-border overflow-x-auto text-xs">
      <table className="w-full">
        <thead className="bg-secondary/30">
          <tr>
            {COLS.map((c) => (
              <th key={c} className="text-left px-2 py-1.5 font-mono text-muted-foreground">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sample.map((row, i) => (
            <tr key={i} className="border-t border-border">
              {COLS.map((c) => {
                const idx = mapping[c];
                const val = idx !== undefined ? row[idx] : "";
                return <td key={c} className="px-2 py-1 truncate max-w-[160px]">{val ?? ""}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {parsed.rows.length > 10 && (
        <div className="px-2 py-1.5 text-[11px] text-muted-foreground border-t border-border">
          + {parsed.rows.length - 10} more rows
        </div>
      )}
    </div>
  );
}
