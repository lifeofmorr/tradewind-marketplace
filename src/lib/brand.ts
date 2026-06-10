/**
 * Tradewind · brand single-source-of-truth.
 *
 * Name and support email may be overridden via public env vars
 * (VITE_BUSINESS_NAME, VITE_BUSINESS_SUPPORT_EMAIL) so they can be set per
 * environment without a code change. The literals below are the fallback —
 * keep them pointing at a real, monitored inbox.
 */
const env = import.meta.env as Record<string, string | undefined>;

export const BRAND = {
  name: env.VITE_BUSINESS_NAME?.trim() || "Tradewind",
  // Canonical/SEO domain. Override per environment (e.g. the vercel.app host
  // while the custom domain is unresolved) without a code change.
  domain: env.VITE_PUBLIC_DOMAIN?.trim() || "gotradewind.com",
  tagline: "The AI-powered marketplace for boats, autos, dealers, and serious buyers.",
  email: "hello@gotradewind.com",
  supportEmail: env.VITE_BUSINESS_SUPPORT_EMAIL?.trim() || "don@lifeofmorr.com",
  founded: 2026,
} as const;
