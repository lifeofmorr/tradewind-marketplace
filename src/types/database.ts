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
