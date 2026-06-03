/**
 * Centralized aviation safety / compliance copy.
 *
 * Used wherever aircraft-specific disclaimers are surfaced so we keep the
 * message consistent (and easy to update) across the UI:
 *  - listing detail
 *  - asset passport
 *  - aircraft specs panel + form
 *  - aircraft hub / services pages
 *  - pre-buy request flow
 *  - true-cost-to-own
 *  - transaction room
 */

export const AVIATION_SAFETY_HEADING = "Aviation safety notice";

export const AVIATION_DISCLAIMER_SHORT =
  "Tradewind does not verify FAA status, airworthiness, title, escrow, "
  + "logbooks, AD/SB compliance, insurance, or financing. Independent "
  + "verification by qualified aviation professionals is required.";

export const AVIATION_DISCLAIMER_LONG =
  "Aircraft details, registration, title, logbooks, maintenance status, "
  + "AD/SB compliance, and airworthiness must be independently verified "
  + "by qualified aviation professionals (A&P / IA / aircraft title "
  + "company) before purchase. Tradewind does not verify FAA status, "
  + "airworthiness, title chain, escrow, ferry, insurance, or financing.";

export const AVIATION_REPORT_REASONS: { value: string; label: string }[] = [
  { value: "aviation_suspicious_listing", label: "Suspicious aircraft listing" },
  { value: "aviation_fake_escrow", label: "Fake escrow request" },
  { value: "aviation_unverifiable_registration", label: "Unverifiable N-number / registration" },
  { value: "aviation_missing_logbooks", label: "Missing logbooks" },
  { value: "aviation_misleading_damage", label: "Misleading damage history" },
  { value: "aviation_suspicious_wire", label: "Suspicious wire / funds request" },
];
