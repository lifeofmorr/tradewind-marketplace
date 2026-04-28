/**
 * Hand-authored TS types mirroring supabase/schema.sql (Phase 1A).
 * Run `supabase gen types typescript` later to auto-generate.
 */

// ─── Enums (16) ───────────────────────────────────────────────────────────────

export type UserRole =
  | "buyer" | "seller" | "dealer" | "dealer_staff" | "service_provider" | "admin";

export type DealerStaffRole = "owner" | "manager" | "sales" | "finance" | "viewer";

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

export type FraudSeverity = "low" | "medium" | "high" | "critical";

export type AIWorkflow =
  | "listing_generator" | "buyer_assistant" | "fraud_check"
  | "pricing_estimate" | "concierge_intake";

export type NotificationKind =
  | "lead" | "listing_status" | "payment" | "subscription"
  | "concierge" | "service_request" | "system";

export type FeaturedPackage =
  | "featured_30d" | "featured_90d" | "boost_7d" | "boost_30d";

export type CreditBand = "excellent" | "good" | "fair" | "poor" | "thin_file";

export type AuctionStatus = "upcoming" | "live" | "ended" | "cancelled";

// ─── 1. profiles ─────────────────────────────────────────────────────────────

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

// ─── 2. dealers ──────────────────────────────────────────────────────────────

export interface Dealer {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  lat: number | null;
  lng: number | null;
  primary_category: ListingCategory | null;
  rating_avg: number;
  rating_count: number;
  is_verified: boolean;
  is_featured: boolean;
  subscription_tier: SubscriptionTier | null;
  subscription_status: SubscriptionStatus | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

// ─── 3. dealer_staff ─────────────────────────────────────────────────────────

export interface DealerStaff {
  id: string;
  dealer_id: string;
  user_id: string;
  role: DealerStaffRole;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
}

// ─── 4. service_providers ────────────────────────────────────────────────────

export interface ServiceProvider {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  description: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  lat: number | null;
  lng: number | null;
  service_radius_mi: number | null;
  rating_avg: number;
  rating_count: number;
  is_verified: boolean;
  is_featured: boolean;
  subscription_tier: SubscriptionTier | null;
  subscription_status: SubscriptionStatus | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

// ─── 5. listings ─────────────────────────────────────────────────────────────

export interface Listing {
  id: string;
  slug: string;
  category: ListingCategory;
  title: string;
  description: string | null;
  ai_summary: string | null;
  make: string | null;
  model: string | null;
  trim_or_grade: string | null;
  year: number | null;
  price_cents: number | null;
  currency: string;
  condition: string | null;
  vin_or_hin: string | null;
  // auto
  mileage: number | null;
  fuel_type: string | null;
  transmission: string | null;
  drivetrain: string | null;
  body_style: string | null;
  exterior_color: string | null;
  interior_color: string | null;
  // boat
  hours: number | null;
  length_ft: number | null;
  beam_ft: number | null;
  hull_material: string | null;
  hull_type: string | null;
  engine_count: number | null;
  engine_make: string | null;
  engine_model: string | null;
  engine_hp: number | null;
  fuel_capacity_gal: number | null;
  // location
  city: string | null;
  state: string | null;
  zip: string | null;
  lat: number | null;
  lng: number | null;
  // ownership
  seller_type: SellerType;
  seller_id: string;
  dealer_id: string | null;
  // status
  status: ListingStatus;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  // trust
  is_verified: boolean;
  verified_at: string | null;
  trust_score: number | null;
  vin_hin_decoded: boolean;
  title_status: string | null;
  // marketing flags
  is_featured: boolean;
  is_premium: boolean;
  is_demo: boolean;
  featured_until: string | null;
  boost_until: string | null;
  is_finance_partner: boolean;
  is_insurance_partner: boolean;
  is_transport_partner: boolean;
  // counters
  view_count: number;
  inquiry_count: number;
  save_count: number;
  cover_photo_url: string | null;
  // lifecycle
  published_at: string | null;
  expires_at: string | null;
  sold_at: string | null;
  removed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── 6. listing_photos ───────────────────────────────────────────────────────

export interface ListingPhoto {
  id: string;
  listing_id: string;
  storage_path: string;
  url: string | null;
  alt_text: string | null;
  position: number;
  is_cover: boolean;
  created_at: string;
}

// ─── 7. listing_videos ───────────────────────────────────────────────────────

export interface ListingVideo {
  id: string;
  listing_id: string;
  url: string | null;
  storage_path: string | null;
  thumbnail_url: string | null;
  duration_sec: number | null;
  position: number;
  created_at: string;
}

// ─── 8. saved_listings ───────────────────────────────────────────────────────

export interface SavedListing {
  user_id: string;
  listing_id: string;
  notes: string | null;
  created_at: string;
}

// ─── 9. inquiries ────────────────────────────────────────────────────────────

export interface Inquiry {
  id: string;
  listing_id: string;
  buyer_id: string | null;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  message: string;
  seller_id: string;
  dealer_id: string | null;
  lead_score: number | null;
  status: LeadStatus;
  is_spam: boolean;
  source: string;
  created_at: string;
  updated_at: string;
}

// ─── 10–13. partner request inboxes ──────────────────────────────────────────

export interface FinancingRequest {
  id: string;
  user_id: string | null;
  listing_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  amount_cents: number;
  term_months: number | null;
  credit_band: CreditBand | null;
  state: string | null;
  notes: string | null;
  partner_id: string | null;
  admin_notes: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

export interface InsuranceRequest {
  id: string;
  user_id: string | null;
  listing_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  asset_value_cents: number | null;
  asset_summary: string | null;
  state: string | null;
  notes: string | null;
  partner_id: string | null;
  admin_notes: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

export interface InspectionRequest {
  id: string;
  user_id: string | null;
  listing_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  preferred_date: string | null;
  notes: string | null;
  partner_id: string | null;
  admin_notes: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

export interface TransportRequest {
  id: string;
  user_id: string | null;
  listing_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  pickup_zip: string | null;
  dropoff_zip: string | null;
  asset_length_ft: number | null;
  asset_summary: string | null;
  preferred_date: string | null;
  notes: string | null;
  partner_id: string | null;
  admin_notes: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

// ─── 14. concierge_requests ──────────────────────────────────────────────────

export interface ConciergeRequest {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  budget_min_cents: number | null;
  budget_max_cents: number | null;
  category: ListingCategory | null;
  desired_summary: string | null;
  timeline: string | null;
  ai_intake_json: Record<string, unknown> | null;
  assigned_to: string | null;
  paid: boolean;
  paid_at: string | null;
  admin_notes: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

// ─── 15. service_requests ────────────────────────────────────────────────────

export interface ServiceRequest {
  id: string;
  user_id: string | null;
  service_provider_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  asset_summary: string | null;
  service_needed: string;
  location: string | null;
  preferred_date: string | null;
  notes: string | null;
  admin_notes: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

// ─── 16. subscriptions ───────────────────────────────────────────────────────

export interface Subscription {
  id: string;
  dealer_id: string | null;
  service_provider_id: string | null;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

// ─── 17. payments ────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  user_id: string | null;
  dealer_id: string | null;
  service_provider_id: string | null;
  listing_id: string | null;
  description: string | null;
  amount_cents: number;
  currency: string;
  status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ─── 18. featured_listings ───────────────────────────────────────────────────

export interface FeaturedListing {
  id: string;
  listing_id: string;
  payment_id: string | null;
  package: FeaturedPackage;
  starts_at: string;
  ends_at: string;
  created_at: string;
}

// ─── 19. fraud_flags ─────────────────────────────────────────────────────────

export interface FraudFlag {
  id: string;
  listing_id: string | null;
  user_id: string | null;
  inquiry_id: string | null;
  severity: FraudSeverity;
  reason: string;
  reporter_id: string | null;
  resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution: string | null;
  created_at: string;
}

// ─── 20. ai_logs ─────────────────────────────────────────────────────────────

export interface AILog {
  id: string;
  workflow: AIWorkflow;
  user_id: string | null;
  listing_id: string | null;
  prompt: Record<string, unknown>;
  response: Record<string, unknown> | null;
  tokens_in: number | null;
  tokens_out: number | null;
  cost_cents: number | null;
  model: string | null;
  created_at: string;
}

// ─── 21. notifications ───────────────────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  kind: NotificationKind;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

// ─── 22. blog_posts ──────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_md: string;
  cover_image_url: string | null;
  author_id: string | null;
  tags: string[];
  category: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── 23. market_reports ──────────────────────────────────────────────────────

// ─── Phase 3: auctions, bids, conversations, messages, reviews ───────────────

export interface Auction {
  id: string;
  listing_id: string;
  start_time: string;
  end_time: string;
  starting_price_cents: number;
  reserve_price_cents: number | null;
  current_bid_cents: number | null;
  bid_count: number;
  winner_id: string | null;
  status: AuctionStatus;
  created_at: string;
  updated_at: string;
}

export interface Bid {
  id: string;
  auction_id: string;
  bidder_id: string;
  amount_cents: number;
  is_winning: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string | null;
  participants: string[];
  last_message_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  dealer_id: string | null;
  service_provider_id: string | null;
  listing_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified_purchase: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketReport {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body_md: string;
  cover_image_url: string | null;
  category: ListingCategory | null;
  region: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
