import { supabase } from "@/lib/supabase";

export type VerificationType =
  | "vin"
  | "hin"
  | "title"
  | "registration"
  | "lien"
  | "inspection";

export type VerificationStatus =
  | "pending"
  | "in_progress"
  | "verified"
  | "failed"
  | "expired";

export interface VerificationRequest {
  id: string;
  listing_id: string;
  verification_type: VerificationType;
  status: VerificationStatus;
  provider: string | null;
  result: Record<string, unknown>;
  requested_by: string | null;
  created_at: string;
}

const SANDBOX = (import.meta.env.VITE_PARTNER_API_SANDBOX ?? "true") === "true";

export async function requestVerification(
  listingId: string,
  type: VerificationType,
): Promise<VerificationRequest> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error("Sign in to request asset verification.");

  const { data, error } = await supabase
    .from("asset_verifications")
    .insert({
      listing_id: listingId,
      verification_type: type,
      provider: SANDBOX ? "sandbox" : null,
      requested_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  const row = data as VerificationRequest;

  if (SANDBOX) {
    setTimeout(() => {
      void supabase
        .from("asset_verifications")
        .update({
          status: "verified",
          result: { sandbox: true, checked_at: new Date().toISOString() },
        })
        .eq("id", row.id);
    }, 2000);
  }

  return row;
}

export async function getVerificationStatus(
  listingId: string,
): Promise<VerificationRequest[]> {
  const { data, error } = await supabase
    .from("asset_verifications")
    .select("*")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as VerificationRequest[];
}
