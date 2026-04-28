import type { ServiceProvider, ServiceCategory } from "@/types/database";

export interface MatchRequest {
  category: ServiceCategory | "financing" | "insurance" | "inspection" | "transport" | "concierge" | "service" | string;
  state?: string | null;
  city?: string | null;
}

export interface MatchedProvider {
  provider: ServiceProvider;
  score: number;
  reasons: string[];
}

const REQUEST_CATEGORY_MAP: Record<string, ServiceCategory[]> = {
  financing: ["lender"],
  insurance: ["insurance_agent"],
  inspection: ["inspector_surveyor"],
  transport: ["transport"],
  service: [
    "marine_mechanic", "auto_mechanic", "detailer", "wrap_shop",
    "audio_shop", "performance_shop", "dock_service", "storage", "marina",
  ],
  concierge: [],
};

function categoriesFor(req: MatchRequest): Set<string> {
  const direct = REQUEST_CATEGORY_MAP[req.category as string];
  if (direct && direct.length) return new Set(direct);
  return new Set([req.category as string]);
}

export function matchPartners(
  request: MatchRequest,
  providers: ServiceProvider[],
  limit = 3,
): MatchedProvider[] {
  const wantedCats = categoriesFor(request);
  const reqState = request.state?.toUpperCase() ?? null;

  const scored: MatchedProvider[] = providers.map((p) => {
    let score = 0;
    const reasons: string[] = [];

    if (wantedCats.size === 0 || wantedCats.has(p.category)) {
      score += 50;
      if (wantedCats.size > 0) reasons.push(`Category match (${p.category})`);
    } else {
      score -= 30;
    }

    if (reqState && p.state && p.state.toUpperCase() === reqState) {
      score += 30;
      reasons.push(`Same state (${reqState})`);
    } else if (reqState && p.state) {
      score -= 5;
    }

    if (p.is_verified) {
      score += 15;
      reasons.push("Verified");
    }
    if (p.is_featured) {
      score += 10;
      reasons.push("Featured");
    }

    if (p.rating_count > 0) {
      score += Math.min(10, Math.round(p.rating_avg * 2));
      reasons.push(`${p.rating_avg.toFixed(1)}★ (${p.rating_count})`);
    }

    if (p.service_radius_mi && p.service_radius_mi > 0) {
      score += Math.min(5, Math.round(p.service_radius_mi / 100));
    }

    return { provider: p, score, reasons };
  });

  return scored
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
