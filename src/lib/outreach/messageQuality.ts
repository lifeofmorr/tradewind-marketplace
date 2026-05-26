// Outreach message quality filter.
//
// Catches buzzwords, AI-sounding phrases, excessive length, missing CTA, and
// missing personalization before a message ever lands in front of a real
// human. Used by the admin dashboard preview and the generate-outreach-message
// edge function (mirrored in the Deno-side prompt). Pure: no IO.

export const BANNED_PHRASES: readonly string[] = [
  "revolutionary",
  "game-changing",
  "game changing",
  "cutting-edge",
  "cutting edge",
  "synergy",
  "unlock",
  "seamless",
  "transform",
  "leverage ai",
  "next-generation",
  "next generation",
  "i hope this finds you well",
  "i hope this email finds you well",
  "just checking in",
  "circle back",
  "circling back",
  "touch base",
  "moving the needle",
  "low-hanging fruit",
  "best-in-class",
  "world-class",
  "paradigm",
  "disrupt",
  "supercharge",
  "10x",
];

const OVERPROMISE_PHRASES: readonly string[] = [
  "guaranteed",
  "we promise",
  "always works",
  "100% success",
  "no risk",
  "risk-free",
  "double your sales",
];

const CTA_PATTERNS: readonly RegExp[] = [
  /open to a quick/i,
  /quick (?:10|15)[- ]?(?:minute|min)/i,
  /would you (?:be open|like|want)/i,
  /worth a (?:quick )?(?:call|chat|look)/i,
  /happy to (?:send|share|walk|show)/i,
  /reply (?:back )?(?:if|when|with)/i,
  /interested in (?:a |the )?(?:demo|walkthrough|look)/i,
];

export interface QualityResult {
  passed: boolean;
  issues: string[];
  ai_tone_risk_score: number; // 0 = sounds human, 100 = sounds like ChatGPT
  word_count: number;
}

export function checkMessageQuality(message: string): QualityResult {
  const issues: string[] = [];
  const text = (message ?? "").trim();
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (wordCount === 0) {
    return {
      passed: false,
      issues: ["Message is empty"],
      ai_tone_risk_score: 100,
      word_count: 0,
    };
  }

  // 1. banned buzzwords / AI tells
  const hits: string[] = [];
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase)) hits.push(phrase);
  }
  if (hits.length > 0) {
    issues.push(`Buzzwords/AI phrases detected: ${hits.join(", ")}`);
  }

  // 2. overpromises / fake claims
  const overHits: string[] = [];
  for (const phrase of OVERPROMISE_PHRASES) {
    if (lower.includes(phrase)) overHits.push(phrase);
  }
  if (overHits.length > 0) {
    issues.push(`Overpromise/fake claim: ${overHits.join(", ")}`);
  }

  // 3. length — cold outreach should be tight
  if (wordCount > 200) {
    issues.push(`Too long (${wordCount} words; aim for <200)`);
  }
  if (wordCount < 25) {
    issues.push(`Too short (${wordCount} words; needs context + CTA)`);
  }

  // 4. CTA present?
  const hasCta = CTA_PATTERNS.some((re) => re.test(text));
  if (!hasCta) {
    issues.push("No clear CTA (ask for a reply, demo, or quick look)");
  }

  // 5. personalization — at least one proper noun or specific detail.
  // Heuristic: an internal capitalized word that isn't the very first word
  // and isn't "I". (A real personalized message mentions a company, place,
  // boat, person, or product by name.)
  const personalizedTokens = words.filter((w, i) => {
    if (i === 0) return false;
    if (w.length < 3) return false;
    if (!/^[A-Z][a-zA-Z'-]+/.test(w)) return false;
    if (w === "I") return false;
    return true;
  });
  if (personalizedTokens.length === 0) {
    issues.push("No personalization (mention the company, location, or a specific detail)");
  }

  // 6. exclamation overuse — sounds desperate/AI
  const exclamCount = (text.match(/!/g) ?? []).length;
  if (exclamCount > 1) {
    issues.push(`Too many exclamation marks (${exclamCount}; aim for 0)`);
  }

  // 7. em-dash + "—" overuse is a classic AI tell. Three or more is suspect.
  const emDashCount = (text.match(/—/g) ?? []).length;
  if (emDashCount >= 4) {
    issues.push(`Em-dash overuse (${emDashCount})`);
  }

  // ── ai_tone_risk_score ────────────────────────────────────────────────────
  // Weighted: each banned phrase ≈ 18 pts, overpromise ≈ 20 pts, length ≈ 10,
  // missing CTA ≈ 15, missing personalization ≈ 15, exclam overuse ≈ 8.
  let risk = 0;
  risk += hits.length * 18;
  risk += overHits.length * 20;
  if (wordCount > 200) risk += 10;
  if (wordCount < 25) risk += 5;
  if (!hasCta) risk += 15;
  if (personalizedTokens.length === 0) risk += 15;
  if (exclamCount > 1) risk += 8;
  if (emDashCount >= 4) risk += 6;
  if (risk > 100) risk = 100;

  return {
    passed: issues.length === 0,
    issues,
    ai_tone_risk_score: risk,
    word_count: wordCount,
  };
}
