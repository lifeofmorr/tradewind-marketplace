/**
 * Hand-authored TS types mirroring supabase/schema.sql.
 * Run `supabase gen types typescript` later to auto-generate.
 */

export type UserRole =
  | "buyer" | "seller" | "dealer" | "dealer_staff" | "service_provider" | "admin";

export type ListingCategory =
  | "boat" | "performance_boat" | "yacht" | "center_console"
  | "car" | "truck" | "exotic" | "classic" | "powersports" | "rv";

export type ListingStatus =
  | "draft" | "pending_review" | "active" | "sold" | "expired" | "rejected" | "removed";

export type SellerType = "private" | "dealer" | "broker";

export type LeadStatus =
  | "new" | "contacted" | "qualified" | "offer" | "closed_won" | "closed_lost" | "spam";

export type SubscriptionTier = "starter" | "pro" | "premier" | "service_pro";
export type SubscriptionStatus =
  | "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "incomplete";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export type ServiceCategory =
  | "marine_mechanic" | "auto_mechanic" | "detailer" | "transport"
  | "inspector_surveyor" | "insurance_agent" | "lender" | "storage"
  | "marina" | "wrap_shop" | "audio_shop" | "performance_shop" | "dock_service";

export type RequestStatus =
  | "submitted" | "assigned" | "in_progress" | "quoted" | "completed" | "canceled";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  city: string | null;
  state: string | null;
  zip: string | null;
  dealer_id: string | null;
  service_provider_id: string | null;
  marketing_opt_in: boolean;
  banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  slug: string;
  category: ListingCategory;
  title: string;
  description: string | null;
  ai_summary?: string | null;
  make: string | null;
  model: string | null;
  trim_or_grade?: string | null;
  year: number | null;
  price_cents: number | null;
  currency?: string;
  condition: string | null;
  vin_or_hin?: string | null;
  mileage?: number | null;
  fuel_type?: string | null;
  transmission?: string | null;
  drivetrain?: string | null;
  body_style?: string | null;
  exterior_color?: string | null;
  interior_color?: string | null;
  hours?: number | null;
  length_ft?: number | null;
  beam_ft?: number | null;
  hull_material?: string | null;
  hull_type?: string | null;
  engine_count?: number | null;
  engine_make?: string | null;
  engine_model?: string | null;
  engine_hp?: number | null;
  fuel_capacity_gal?: number | null;
  city: string | null;
  state: string | null;
  zip?: string | null;
  lat?: number | null;
  lng?: number | null;
  seller_type: SellerType;
  seller_id: string;
  dealer_id: string | null;
  status: ListingStatus;
  is_verified?: boolean;
  is_featured?: boolean;
  is_premium?: boolean;
  is_demo?: boolean;
  view_count?: number;
  inquiry_count?: number;
  save_count?: number;
  cover_photo_url?: string | null;
  published_at: string | null;
  expires_at?: string | null;
  sold_at?: string | null;
  created_at: string;
  updated_at: string;
}
