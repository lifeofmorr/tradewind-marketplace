import type { Inquiry } from "@/types/database";

export type LeadLabel = "Hot" | "Warm" | "Cold" | "Spam Risk";

export interface LeadScoreResult {
  score: number; // 0–100
  label: LeadLabel;
  color: "rose" | "amber" | "sky" | "slate";
  reasons: string[];
}

const SPAM_RX =
  /(http[s]?:\/\/|crypto|loan offer|seo services|click here|free money|btc|usdt|telegram|whatsapp\s+\+?\d|bit\.ly|tinyurl)/i;
const INTENT_RX =
  /(financing|inspect|trade|cash|delivery|transport|when can|pickup|in person|test drive|sea trial|available|interested|appointment|tomorrow|this week|this weekend)/i;

export function calculateLeadScore(inquiry: Inquiry): LeadScoreResult {
  const reasons: string[] = [];
  const message = (inquiry.message ?? "").trim();
  let score = 50;

  // Length signals
  if (message.length < 25) {
    score -= 15;
    reasons.push("Very short message");
  } else if (message.length > 80) {
    score += 8;
    reasons.push("Detailed message");
  }
  if (message.length > 240) score += 4;

  // Contact completeness
  if (inquiry.buyer_phone) {
    score += 14;
    reasons.push("Phone provided");
  }
  if (inquiry.buyer_name && inquiry.buyer_name.trim().split(/\s+/).length >= 2) {
    score += 6;
    reasons.push("Full name provided");
  }
  const emailHasName =
    !!inquiry.buyer_email &&
    !/^[a-z0-9]{8,}@/i.test(inquiry.buyer_email) && // not random alphanum
    !/no\.?reply|test|fake|spam/i.test(inquiry.buyer_email);
  if (emailHasName) score += 4;

  // Intent
  if (INTENT_RX.test(message)) {
    score += 18;
    reasons.push("Active intent signals");
  }

  // Spam markers
  if (SPAM_RX.test(message)) {
    score -= 50;
    reasons.push("Suspicious link/keyword");
  }
  if (inquiry.is_spam) {
    score -= 60;
    reasons.push("Flagged as spam");
  }

  // Buyer is a known account (not anonymous)
  if (inquiry.buyer_id) {
    score += 6;
    reasons.push("Authenticated buyer account");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let label: LeadLabel = "Cold";
  let color: LeadScoreResult["color"] = "sky";

  if (score < 20) {
    label = "Spam Risk";
    color = "slate";
  } else if (score >= 75) {
    label = "Hot";
    color = "rose";
  } else if (score >= 55) {
    label = "Warm";
    color = "amber";
  } else {
    label = "Cold";
    color = "sky";
  }

  return { score, label, color, reasons };
}
