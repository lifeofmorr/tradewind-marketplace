import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Auction, AuctionStatus, Bid, Listing } from "@/types/database";

export interface AuctionWithListing extends Auction {
  listing: Listing | null;
}

export function useAuctions(status?: AuctionStatus | AuctionStatus[]) {
  const statuses = Array.isArray(status) ? status : status ? [status] : ["upcoming", "live"];
  return useQuery({
    queryKey: ["auctions", statuses],
    queryFn: async (): Promise<AuctionWithListing[]> => {
      const { data, error } = await supabase
        .from("auctions")
        .select("*, listing:listings(*)")
        .in("status", statuses)
        .order("end_time", { ascending: true })
        .limit(60);
      if (error) throw error;
      return (data ?? []) as AuctionWithListing[];
    },
  });
}

export function useAuction(id: string | undefined) {
  return useQuery({
    queryKey: ["auction", id],
    enabled: !!id,
    queryFn: async (): Promise<AuctionWithListing | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("auctions")
        .select("*, listing:listings(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as AuctionWithListing | null) ?? null;
    },
  });
}

export function useBids(auctionId: string | undefined) {
  return useQuery({
    queryKey: ["bids", auctionId],
    enabled: !!auctionId,
    queryFn: async (): Promise<Bid[]> => {
      if (!auctionId) return [];
      const { data, error } = await supabase
        .from("bids")
        .select("*")
        .eq("auction_id", auctionId)
        .order("amount_cents", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as Bid[];
    },
  });
}
