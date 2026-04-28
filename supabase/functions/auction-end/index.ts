// POST /functions/v1/auction-end   (or scheduled via cron)
//
// Finds all live auctions whose end_time <= now() and finalizes them:
//   - status → 'ended'
//   - winner_id → highest bidder (null if no bids)
//   - emails the winner + the seller
//   - inserts a notification row for both
//
// Trigger this hourly with Supabase scheduled jobs (pg_cron):
//   select cron.schedule('auction-end', '*/5 * * * *',
//     $$select net.http_post(url := 'https://YOUR-PROJECT.supabase.co/functions/v1/auction-end',
--       headers := json_build_object('Authorization','Bearer ' || current_setting('app.settings.service_role_key')))$$);
//
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, optional RESEND_API_KEY.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { handleOptions, jsonResponse, errorResponse } from "../_shared/cors.ts";

const SUPA_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPA_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const admin = createClient(SUPA_URL, SUPA_KEY, { auth: { persistSession: false } });

interface AuctionRow {
  id: string;
  listing_id: string;
  current_bid_cents: number | null;
}

interface BidRow { bidder_id: string; amount_cents: number }
interface ListingRow { title: string; slug: string; seller_id: string }
interface ProfileRow { email: string }

async function sendEmail(template: string, to: string | null | undefined, props: Record<string, unknown>) {
  if (!to) return;
  try {
    await fetch(`${SUPA_URL}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPA_KEY}`,
      },
      body: JSON.stringify({ template, to, props }),
    });
  } catch (e) {
    console.warn("[auction-end] send-email failed", (e as Error).message);
  }
}

async function notify(userId: string, kind: string, title: string, body: string, link: string) {
  await admin.from("notifications").insert({
    user_id: userId, kind, title, body, link,
  });
}

Deno.serve(async (req: Request) => {
  const pre = handleOptions(req); if (pre) return pre;
  if (req.method !== "POST" && req.method !== "GET") return errorResponse("POST or GET", 405);

  const { data: due } = await admin
    .from("auctions")
    .select("id, listing_id, current_bid_cents")
    .lte("end_time", new Date().toISOString())
    .in("status", ["upcoming", "live"]);

  const auctions = (due ?? []) as AuctionRow[];
  let processed = 0;

  for (const a of auctions) {
    const { data: bid } = await admin
      .from("bids")
      .select("bidder_id, amount_cents")
      .eq("auction_id", a.id)
      .eq("is_winning", true)
      .maybeSingle<BidRow>();

    await admin.from("auctions").update({
      status: "ended",
      winner_id: bid?.bidder_id ?? null,
    }).eq("id", a.id);

    if (bid?.bidder_id) {
      const { data: listing } = await admin
        .from("listings")
        .select("title, slug, seller_id")
        .eq("id", a.listing_id)
        .maybeSingle<ListingRow>();

      const { data: winner } = await admin
        .from("profiles")
        .select("email")
        .eq("id", bid.bidder_id)
        .maybeSingle<ProfileRow>();
      const { data: seller } = listing
        ? await admin.from("profiles").select("email").eq("id", listing.seller_id).maybeSingle<ProfileRow>()
        : { data: null };

      const slug = listing?.slug ?? "";
      const link = `/listings/${slug}`;
      await notify(bid.bidder_id, "system",
        "You won an auction.",
        `Congrats — you won ${listing?.title ?? "an auction"}.`, link);
      if (listing) await notify(listing.seller_id, "system",
        "Your auction ended.",
        `${listing.title} sold.`, link);

      await sendEmail("listing_approved",
        winner?.email,
        { listing_title: `You won: ${listing?.title ?? "auction"}`, listing_slug: slug });
      await sendEmail("listing_approved",
        seller?.email,
        { listing_title: `Auction ended: ${listing?.title ?? "your listing"}`, listing_slug: slug });
    }

    processed++;
  }

  return jsonResponse({ processed });
});
