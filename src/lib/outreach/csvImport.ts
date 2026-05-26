// Outreach CSV import — parse a hand-edited CSV of outreach leads, validate,
// surface duplicates, and return rows ready for Supabase insert.
//
// Expected columns (case-insensitive, fuzzy matched):
//   Company, Contact, Role, Vertical, Email, Phone, Website,
//   LinkedIn, Instagram, Location, Lead Source, Notes
//
// Required: Company, Vertical.

import { parseCsv } from "@/lib/csvImport";

export type OutreachImportField =
  | "company" | "contact_name" | "contact_role" | "vertical"
  | "email" | "phone" | "website" | "linkedin_url" | "instagram_url"
  | "location" | "lead_source" | "notes";

export interface ParsedLead {
  company: string;
  contact_name: string | null;
  contact_role: string | null;
  vertical: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  location: string | null;
  lead_source: string | null;
  notes: string | null;
}

export interface ImportPreview {
  ok: ParsedLead[];
  errors: { row: number; reason: string }[];
  duplicates: { row: number; reason: string }[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

export function autoMapOutreach(
  headers: string[],
): Partial<Record<OutreachImportField, number>> {
  const out: Partial<Record<OutreachImportField, number>> = {};
  headers.forEach((h, i) => {
    const n = norm(h);
    if (n === "company" || n === "business" || n === "dealership") out.company ??= i;
    else if (n === "contact" || n === "contact_name" || n === "name") out.contact_name ??= i;
    else if (n === "role" || n === "title" || n === "position" || n === "contact_role") out.contact_role ??= i;
    else if (n === "vertical" || n === "category" || n === "segment") out.vertical ??= i;
    else if (n === "email" || n === "email_address") out.email ??= i;
    else if (n === "phone" || n === "phone_number" || n === "tel") out.phone ??= i;
    else if (n === "website" || n === "url" || n === "site") out.website ??= i;
    else if (n === "linkedin" || n === "linkedin_url") out.linkedin_url ??= i;
    else if (n === "instagram" || n === "instagram_url" || n === "ig") out.instagram_url ??= i;
    else if (n === "location" || n === "city_state" || n === "city" || n === "address") out.location ??= i;
    else if (n === "lead_source" || n === "source") out.lead_source ??= i;
    else if (n === "notes" || n === "comments" || n === "note") out.notes ??= i;
  });
  return out;
}

export function previewOutreachCsv(
  text: string,
  existingEmails: ReadonlySet<string>,
): ImportPreview {
  const parsed = parseCsv(text);
  if (parsed.rows.length === 0) {
    return { ok: [], errors: [], duplicates: [] };
  }
  const map = autoMapOutreach(parsed.headers);
  const get = (row: string[], field: OutreachImportField): string => {
    const idx = map[field];
    if (idx === undefined || idx < 0) return "";
    return (row[idx] ?? "").trim();
  };

  const ok: ParsedLead[] = [];
  const errors: ImportPreview["errors"] = [];
  const duplicates: ImportPreview["duplicates"] = [];
  const seenInBatch = new Set<string>();

  parsed.rows.forEach((row, i) => {
    const rowNum = i + 2; // header + 1-indexed
    const company = get(row, "company");
    const vertical = get(row, "vertical");
    if (!company) {
      errors.push({ row: rowNum, reason: "missing Company" });
      return;
    }
    if (!vertical) {
      errors.push({ row: rowNum, reason: "missing Vertical" });
      return;
    }
    const email = get(row, "email").toLowerCase() || null;
    if (email && !EMAIL_RE.test(email)) {
      errors.push({ row: rowNum, reason: `invalid email "${email}"` });
      return;
    }
    if (email && existingEmails.has(email)) {
      duplicates.push({ row: rowNum, reason: `duplicate (exists): ${email}` });
      return;
    }
    if (email && seenInBatch.has(email)) {
      duplicates.push({ row: rowNum, reason: `duplicate in CSV: ${email}` });
      return;
    }
    if (email) seenInBatch.add(email);

    ok.push({
      company,
      contact_name: get(row, "contact_name") || null,
      contact_role: get(row, "contact_role") || null,
      vertical,
      email,
      phone: get(row, "phone") || null,
      website: get(row, "website") || null,
      linkedin_url: get(row, "linkedin_url") || null,
      instagram_url: get(row, "instagram_url") || null,
      location: get(row, "location") || null,
      lead_source: get(row, "lead_source") || null,
      notes: get(row, "notes") || null,
    });
  });

  return { ok, errors, duplicates };
}

export function formatLinkedInDM(text: string): string {
  // strip subject if present (LinkedIn DMs don't have subjects)
  return text.replace(/^Subject:.*\n+/i, "").trim();
}

export function formatInstagramDM(text: string, max = 500): string {
  // Instagram DMs are even tighter. Truncate at a sentence boundary if needed.
  const stripped = text.replace(/^Subject:.*\n+/i, "").trim();
  if (stripped.length <= max) return stripped;
  const truncated = stripped.slice(0, max);
  const lastDot = truncated.lastIndexOf(". ");
  return lastDot > max * 0.5 ? truncated.slice(0, lastDot + 1) : truncated + "…";
}
