import type { Listing } from "@/types/database";

export type QualityLabel = "Poor" | "Good" | "Strong" | "Premium";

export interface QualityCheck {
  key: string;
  label: string;
  weight: number;
  ok: boolean;
  hint?: string;
}

export interface QualityResult {
  score: number; // 0–100
  label: QualityLabel;
  checks: QualityCheck[];
}

interface QualityInput {
  listing: Listing;
  photoCount?: number;
}

export function calculateListingQuality({ listing, photoCount = 0 }: QualityInput): QualityResult {
  const isBoat = ["boat", "performance_boat", "yacht", "center_console"].includes(
    listing.category,
  );
  const checks: QualityCheck[] = [
    {
      key: "title",
      label: "Strong title",
      weight: 8,
      ok: !!listing.title && listing.title.length >= 12,
      hint: "Aim for ≥ 12 chars including make + model.",
    },
    {
      key: "description",
      label: "Detailed description",
      weight: 14,
      ok: !!listing.description && listing.description.length >= 150,
      hint: "150+ characters tells buyers the story.",
    },
    {
      key: "price",
      label: "Price set",
      weight: 12,
      ok: !!listing.price_cents,
      hint: "Listings without a price get fewer leads.",
    },
    {
      key: "year",
      label: "Year",
      weight: 6,
      ok: !!listing.year,
    },
    {
      key: "make_model",
      label: "Make + model",
      weight: 8,
      ok: !!listing.make && !!listing.model,
    },
    {
      key: "photos",
      label: "Photos (≥ 6)",
      weight: 18,
      ok: photoCount >= 6,
      hint: "Six photos minimum — exterior, interior, helm/dash, engine.",
    },
    {
      key: "cover",
      label: "Cover photo",
      weight: 6,
      ok: !!listing.cover_photo_url,
    },
    {
      key: "location",
      label: "Location (city + state)",
      weight: 8,
      ok: !!listing.city && !!listing.state,
      hint: "Buyers filter heavily by region.",
    },
    {
      key: "specs",
      label: isBoat ? "Hours + length" : "Mileage",
      weight: 8,
      ok: isBoat ? listing.hours != null && listing.length_ft != null : listing.mileage != null,
    },
    {
      key: "condition",
      label: "Condition",
      weight: 6,
      ok: !!listing.condition,
    },
    {
      key: "vin_hin",
      label: isBoat ? "HIN" : "VIN",
      weight: 6,
      ok: !!listing.vin_or_hin,
    },
  ];

  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.filter((c) => c.ok).reduce((s, c) => s + c.weight, 0);
  const score = Math.round((earned / totalWeight) * 100);

  let label: QualityLabel = "Poor";
  if (score >= 90) label = "Premium";
  else if (score >= 70) label = "Strong";
  else if (score >= 50) label = "Good";

  return { score, label, checks };
}
