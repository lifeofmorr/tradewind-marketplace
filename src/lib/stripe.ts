import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { supabase } from "./supabase";

const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
let stripePromise: Promise<Stripe | null> | null = null;
export const getStripe = () => {
  if (!stripePromise) stripePromise = loadStripe(pk ?? "");
  return stripePromise;
};

export async function startCheckout(args: {
  kind:
    | "featured_listing"
    | "boost_listing"
    | "dealer_starter"
    | "dealer_pro"
    | "dealer_premier"
    | "service_pro"
    | "concierge";
  listingId?: string;
  dealerId?: string;
  serviceProviderId?: string;
  conciergeRequestId?: string;
  successUrl?: string;
  cancelUrl?: string;
}) {
  const successUrl = args.successUrl ?? `${window.location.origin}/checkout/success`;
  const cancelUrl = args.cancelUrl ?? `${window.location.origin}/checkout/cancel`;
  const { data, error } = await supabase.functions.invoke("stripe-checkout", {
    body: { ...args, successUrl, cancelUrl },
  });
  if (error) throw error;
  if (!data?.url) throw new Error("No checkout URL returned");
  window.location.href = data.url as string;
}
