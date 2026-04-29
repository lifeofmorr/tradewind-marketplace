import type { ListingCategory } from "@/types/database";

export const IMPORT_FIELDS = [
  "title", "price", "make", "model", "year", "category", "city", "state",
  "vin_or_hin", "mileage", "hours", "length_ft", "description",
] as const;
export type ImportField = (typeof IMPORT_FIELDS)[number];

const REQUIRED: ImportField[] = ["title", "price", "category"];

const VALID_CATEGORIES: ListingCategory[] = [
  "boat", "performance_boat", "yacht", "center_console",
  "car", "truck", "exotic", "classic", "powersports", "rv",
];

export interface ParsedCsv {
  headers: string[];
  rows: string[][];
}

/**
 * Minimal RFC-4180-ish parser. Handles quoted fields with embedded commas,
 * escaped double quotes, and CRLF line endings. Good enough for hand-edited
 * dealer exports — not a full CSV library.
 */
export function parseCsv(text: string): ParsedCsv {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else { inQuotes = false; }
      } else {
        cell += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(cell); cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((v) => v.length > 0)) rows.push(row);
      row = [];
    } else {
      cell += c;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((v) => v.length > 0)) rows.push(row);
  }
  if (rows.length === 0) return { headers: [], rows: [] };
  const [headers, ...data] = rows;
  return { headers, rows: data };
}

export interface MappedListing {
  title: string;
  price_cents: number | null;
  make: string | null;
  model: string | null;
  year: number | null;
  category: ListingCategory;
  city: string | null;
  state: string | null;
  vin_or_hin: string | null;
  mileage: number | null;
  hours: number | null;
  length_ft: number | null;
  description: string | null;
}

export interface MapResult {
  ok: MappedListing[];
  errors: { row: number; reason: string }[];
}

export function mapRows(
  parsed: ParsedCsv,
  mapping: Partial<Record<ImportField, number>>,
): MapResult {
  const ok: MappedListing[] = [];
  const errors: MapResult["errors"] = [];
  const get = (row: string[], field: ImportField): string => {
    const idx = mapping[field];
    if (idx === undefined || idx < 0) return "";
    return (row[idx] ?? "").trim();
  };
  parsed.rows.forEach((row, i) => {
    const missing = REQUIRED.filter((f) => !get(row, f));
    if (missing.length) {
      errors.push({ row: i + 2, reason: `missing ${missing.join(", ")}` });
      return;
    }
    const cat = get(row, "category").toLowerCase() as ListingCategory;
    if (!VALID_CATEGORIES.includes(cat)) {
      errors.push({ row: i + 2, reason: `invalid category "${get(row, "category")}"` });
      return;
    }
    const priceNum = Number(get(row, "price").replace(/[$,]/g, ""));
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      errors.push({ row: i + 2, reason: "invalid price" });
      return;
    }
    ok.push({
      title: get(row, "title"),
      price_cents: Math.round(priceNum * 100),
      make: get(row, "make") || null,
      model: get(row, "model") || null,
      year: numOrNull(get(row, "year")),
      category: cat,
      city: get(row, "city") || null,
      state: (get(row, "state") || "").toUpperCase().slice(0, 2) || null,
      vin_or_hin: get(row, "vin_or_hin") || null,
      mileage: numOrNull(get(row, "mileage")),
      hours: numOrNull(get(row, "hours")),
      length_ft: numOrNull(get(row, "length_ft")),
      description: get(row, "description") || null,
    });
  });
  return { ok, errors };
}

function numOrNull(s: string): number | null {
  if (!s) return null;
  const n = Number(s.replace(/[,]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function autoMap(headers: string[]): Partial<Record<ImportField, number>> {
  const out: Partial<Record<ImportField, number>> = {};
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  headers.forEach((h, i) => {
    const n = norm(h);
    if (n === "title" || n === "name") out.title ??= i;
    else if (n === "price" || n === "asking_price" || n === "ask") out.price ??= i;
    else if (n === "make" || n === "manufacturer") out.make ??= i;
    else if (n === "model") out.model ??= i;
    else if (n === "year" || n === "model_year") out.year ??= i;
    else if (n === "category" || n === "type") out.category ??= i;
    else if (n === "city") out.city ??= i;
    else if (n === "state" || n === "region") out.state ??= i;
    else if (n === "vin" || n === "hin" || n === "vin_or_hin") out.vin_or_hin ??= i;
    else if (n === "mileage" || n === "miles" || n === "odometer") out.mileage ??= i;
    else if (n === "hours" || n === "engine_hours") out.hours ??= i;
    else if (n === "length" || n === "length_ft" || n === "loa") out.length_ft ??= i;
    else if (n === "description" || n === "details" || n === "notes") out.description ??= i;
  });
  return out;
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
