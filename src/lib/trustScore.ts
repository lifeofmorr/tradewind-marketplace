/**
 * Composite trust score (0–100) derived from existing per-axis fields on a
 * profile. No additional data fetched. Pure function — call from any surface.
 *
 * Note: verification_level and buyer_readiness_score live on the profiles
 * table (added in 20260430_security.sql) but aren't yet on the Profile TS
 * type — accept a loose record shape and read them defensively.
 */

interface TrustInputs {
  verification_level?: string | null;
  buyer_readiness_score?: number | null;
  banned?: boolean | null;
  /** Optional reputation signal — average rating on a 0–5 scale. */
  rating?: number | null;
  /** Optional volume signal — total reviews / completed deals. */
  reviewCount?: number | null;
  /** Optional dealer response score (0–100), if computed elsewhere. */
  responseScore?: number | null;
}

const VERIFICATION_WEIGHT: Record<string, number> = {
  unverified: 0,
  contact_verified: 10,
  business_verified: 22,
  document_verified: 30,
  tradewind_verified: 40,
};

export interface TrustScoreResult {
  score: number; // 0–100
  band: "elite" | "strong" | "fair" | "new";
  label: string;
}

export function computeTrustScore(inputs: TrustInputs): TrustScoreResult {
  if (inputs.banned) return { score: 0, band: "new", label: "Restricted" };

  let score = 0;

  const verification = (inputs.verification_level ?? "unverified") as string;
  score += VERIFICATION_WEIGHT[verification] ?? 0;

  const readiness = Math.min(100, Math.max(0, inputs.buyer_readiness_score ?? 0));
  score += Math.round(readiness * 0.20); // up to 20

  if (typeof inputs.rating === "number" && inputs.rating > 0) {
    score += Math.round((inputs.rating / 5) * 15); // up to 15
  }

  if (typeof inputs.reviewCount === "number" && inputs.reviewCount > 0) {
    score += Math.min(10, Math.round(Math.log10(inputs.reviewCount + 1) * 5)); // up to 10
  }

  if (typeof inputs.responseScore === "number") {
    score += Math.round(inputs.responseScore * 0.15); // up to 15
  }

  const clamped = Math.max(0, Math.min(100, score));
  if (clamped >= 80) return { score: clamped, band: "elite", label: "Elite Trust" };
  if (clamped >= 60) return { score: clamped, band: "strong", label: "Strong Trust" };
  if (clamped >= 35) return { score: clamped, band: "fair", label: "Fair Trust" };
  return { score: clamped, band: "new", label: "Building Trust" };
}

type ProfileLike = {
  verification_level?: string | null;
  buyer_readiness_score?: number | null;
  banned?: boolean | null;
};

export function profileTrustScore(profile: ProfileLike): TrustScoreResult {
  return computeTrustScore({
    verification_level: profile.verification_level,
    buyer_readiness_score: profile.buyer_readiness_score,
    banned: profile.banned ?? false,
  });
}
