// Outreach domain types — extracted verbatim from AdminOutreach.tsx.

export interface OutreachLead {
  id: string;
  company: string;
  contact_name: string | null;
  contact_role: string | null;
  vertical: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  location: string | null;
  lead_source: string | null;
  lead_score: number;
  priority: number;
  personalization_angle: string | null;
  pain_point: string | null;
  recommended_offer: string | null;
  status: string;
  date_contacted: string | null;
  follow_up_date: string | null;
  reply_text: string | null;
  demo_booked: boolean;
  beta_invited: boolean;
  real_listing_candidate: boolean;
  partner_candidate: boolean;
  interested_in_paying: string | null;
  do_not_contact: boolean;
  notes: string | null;
  next_action: string | null;
  email_verification_status:
    | "verified"
    | "likely_valid"
    | "unverified"
    | "bounced"
    | "invalid"
    | "do_not_email"
    | null;
  email_verification_source: string | null;
  email_verified_at: string | null;
  bounce_reason: string | null;
  invalid_email_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutreachMessage {
  id: string;
  lead_id: string;
  direction: "outbound" | "inbound";
  channel: "email" | "linkedin" | "instagram" | "phone" | "voicemail";
  subject: string | null;
  body: string;
  status: "drafted" | "approved" | "sent" | "bounced" | "replied" | "failed";
  approved: boolean;
  approved_at: string | null;
  personalization_note: string | null;
  cta: string | null;
  quality_score: number | null;
  ai_tone_risk_score: number | null;
  sent_at: string | null;
  received_at: string | null;
  created_at: string;
}

export interface OutreachFollowup {
  id: string;
  lead_id: string;
  message_id: string | null;
  followup_number: number;
  due_date: string;
  body: string | null;
  status: "due" | "sent" | "skipped" | "cancelled";
  created_at: string;
}

export interface OutreachReply {
  id: string;
  lead_id: string;
  channel: string;
  reply_text: string;
  reply_type: string | null;
  recommended_response: string | null;
  status: "new" | "reviewed" | "responded" | "archived";
  created_at: string;
}

export interface BetaPipelineRow {
  id: string;
  lead_id: string;
  beta_type: string | null;
  stage:
    | "interested"
    | "wants_demo"
    | "demo_booked"
    | "demo_completed"
    | "beta_invited"
    | "beta_onboarded"
    | "real_listing_candidate"
    | "partner_candidate"
    | "paid_candidate"
    | "follow_up_later"
    | "not_interested"
    | "declined";
  demo_date: string | null;
  feedback_notes: string | null;
  real_listing_candidate: boolean;
  partner_candidate: boolean;
  interested_in_paying: boolean;
  next_step: string | null;
  created_at: string;
  updated_at: string;
}
